import React, { useState, useEffect, useContext } from 'react';
import './PetProducts.css';
import { FaWallet, FaMoneyBillAlt } from 'react-icons/fa';
import axios from 'axios';
import { UserContext } from '../../hook/authContext'
import { useLocation } from 'react-router-dom';

const UserInventory = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    houseStreet: '',
    barangay: '',
    municipality: '',
    province: '',
    landmark: '',
  });
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      alert('🛍️ Your order is empty. Please add at least one item before confirming.');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    const fullAddress = `${deliveryInfo.houseStreet}, ${deliveryInfo.barangay}, ${deliveryInfo.municipality}, ${deliveryInfo.province}${deliveryInfo.landmark ? ` (${deliveryInfo.landmark})` : ''}`;

    const fullName = `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}${user.suffix ? ', ' + user.suffix : ''}`;

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const payload = {
      amount: totalAmount,
      methods: paymentMethod.toLowerCase() === 'maya' ? 'paymaya' :
        paymentMethod.toLowerCase() === 'gcash' ? 'gcash' : 'cod',
      name: fullName,
      address: fullAddress,
      date: formattedDate,
      items: cart.map(item => ({
        name: item.name,
        qty: item.qty
      })),
      uid: user.id,
      email: user.email,
      phone: user.phone
    };

    try {
      const res = await axios.post('/server-api/payment_setorder', payload);

      if (res.data.success) {
        if (paymentMethod.toLowerCase() === 'cod') {
          alert('✅ Order placed successfully with Cash on Delivery!');
          setCart([]);         // 🧹 clear cart
          setShowModal(false); // close modal
          setPaymentMethod('');
        } else {
          // Redirect to PayMongo payment page
          setCart([]);         // 🧹 clear cart before redirect
          setShowModal(false);
          setPaymentMethod('');
          window.location.href = res.data.redirectUrl;
        }
      } else {
        alert(res.data.message || 'Failed to place order');
      }

    } catch (err) {
      console.error('Order error:', err);
      alert('Something went wrong while placing your order.');
    }
  };

  const mapRowToUIItem = (row) => ({
    id: row.product_ID,
    name: row.name,
    type: row.item_group,
    quantity: row.stock,
    unit: row.unit,
    price: parseFloat(row.price),
    image: row.photo ? `/server-api/uploads/${row.photo}` : '/images/default-product.png',
  });

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/server-api/fetch_inventory');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map(mapRowToUIItem);
        setItems(mapped);
        console.table(mapped);
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 🛒 Cart functions
  const addToCart = (item) => {
    const exists = cart.find(cartItem => cartItem.id === item.id);
    if (exists) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
      ));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  useEffect(() => {
    if (user) {
      setDeliveryInfo({
        houseStreet: user.houseNum || '',
        barangay: user.barangay || '',
        municipality: user.municipality || '',
        province: user.province || '',
        landmark: user.landmark || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      setPaymentSuccess(true);
      alert('✅ Payment successful! Your order has been confirmed.');

      // Optionally: clear the cart and remove query params
      setCart([]);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  const increaseQty = (id) => setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
  const decreaseQty = (id) => setCart(cart.map(item => item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item));
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2);

  // 🔍 Filter by search and type
  const filteredInventory = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || item.type === filterType;
    return matchSearch && matchType;
  });

  const itemTypes = [...new Set(items.map(item => item.type))];

  return (
    <div className="inventory-wrapper">
      {/* Left: Inventory */}
      <div className="inventory-left">
        <div className="inventory-filters">
          <input
            type="text"
            placeholder="Search Products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="inventory-search"
          />
          <div className="inventory-types">
            <button
              className={filterType === 'All' ? 'active' : ''}
              onClick={() => setFilterType('All')}
            >
              All
            </button>
            {itemTypes.map((type, i) => (
              <button
                key={i}
                className={filterType === type ? 'active' : ''}
                onClick={() => setFilterType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="inventory-grid scrollable-area">
          {filteredInventory.map(item => (
            <div key={item.id} className="inventory-card">
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>₱{item.price.toFixed(2)}</p>
              <button onClick={() => addToCart(item)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="inventory-cart scrollable-area">
        <h2>My Order</h2>
        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty.</p>
        ) : (
          <ul>
            {cart.map(item => (
              <li key={item.id}>
                <div className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>₱{(item.qty * item.price).toFixed(2)}</p>
                  </div>
                  <div className="cart-actions">
                    <div className="qty-control">
                      <button onClick={() => decreaseQty(item.id)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => increaseQty(item.id)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="cart-summary">
          <p>Total: <strong>₱{totalAmount}</strong></p>
          <button
            className="checkout-btn"
            onClick={() => {
              if (cart.length === 0) {
                alert('🛒 Your cart is empty. Please add items before checking out.');
                return;
              }
              setShowModal(true);
            }}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Checkout</h2>
            <div className="modal-content">

              {/* Left: Cart Summary */}
              <div className="modal-left">
                <table className="modal-cart-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.id}>
                        <td className="product-info">
                          <img src={item.image} alt={item.name} />
                          <div>
                            <p><strong>{item.name}</strong></p>
                            <p className="product-type">Type: {item.type}</p>
                          </div>
                        </td>
                        <td>
                          <div className="qty-control">
                            <button onClick={() => decreaseQty(item.id)}>-</button>
                            <span>{item.qty}</span>
                            <button onClick={() => increaseQty(item.id)}>+</button>
                          </div>
                        </td>
                        <td>₱{(item.qty * item.price).toFixed(2)}</td>
                        <td>
                          <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="modal-total">Total: ₱{totalAmount}</div>
              </div>

              {/* Right: Delivery + Payment */}
              <div className="modal-right">
                <div className="modal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>House No. / Street</label>
                      <input
                        type="text"
                        value={deliveryInfo.houseStreet}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, houseStreet: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Barangay</label>
                      <input
                        type="text"
                        value={deliveryInfo.barangay}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, barangay: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Municipality</label>
                      <input
                        type="text"
                        value={deliveryInfo.municipality}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, municipality: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Province</label>
                      <input
                        type="text"
                        value={deliveryInfo.province}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, province: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ width: '100%' }}>
                      <label>Landmark</label>
                      <input
                        type="text"
                        value={deliveryInfo.landmark}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, landmark: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-payment">
                  <h4>Payment Method</h4>
                  <div className="payment-options">
                    <label>
                      <input type="radio" name="payment" value="GCash" onChange={(e) => setPaymentMethod(e.target.value)} />
                      <FaWallet /> GCash
                    </label>
                    <label>
                      <input type="radio" name="payment" value="Maya" onChange={(e) => setPaymentMethod(e.target.value)} />
                      <FaWallet /> Maya
                    </label>
                    <label>
                      <input type="radio" name="payment" value="COD" onChange={(e) => setPaymentMethod(e.target.value)} />
                      <FaMoneyBillAlt /> Cash on Delivery
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button onClick={() => setShowModal(false)}>Back</button>
                  <button className="checkout-confirm" onClick={handleConfirmOrder} disabled={!paymentMethod}>
                    Confirm Order
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInventory;
