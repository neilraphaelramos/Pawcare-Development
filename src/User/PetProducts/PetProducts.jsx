import React, { useState } from 'react';
import './PetProducts.css';
import { FaWallet } from 'react-icons/fa';
import { FaMoneyBillAlt } from 'react-icons/fa';


const initialInventory = [
  { id: 1, name: 'Rabies Vaccine', type: 'Vaccine', quantity: 15, unit: 'vial', price: 250.00, image: '/images/UserInventory/rabies-vaccine.png' },
  { id: 2, name: 'Antibiotic Syrup', type: 'Medication', quantity: 8, unit: 'bottle', price: 180.50, image: '/images/UserInventory/antibiotic-syrup.png' },
  { id: 3, name: 'Dog Shampoo', type: 'Hygiene', quantity: 25, unit: 'bottle', price: 120.00, image: '/images/UserInventory/dog-shampoo.png' },
  { id: 4, name: 'Dry Dog Food', type: 'Food', quantity: 40, unit: 'kg', price: 160.00, image: '/images/UserInventory/dry-dog-food.png' },
  { id: 5, name: 'Flea Powder', type: 'Hygiene', quantity: 12, unit: 'pack', price: 140.00, image: '/images/UserInventory/flea-powder.png' },
  { id: 6, name: 'Deworming Tablets', type: 'Medication', quantity: 30, unit: 'tablet', price: 8.00, image: '/images/UserInventory/deworming-tablets.png' },
  { id: 7, name: 'Cat Food (Wet)', type: 'Food', quantity: 18, unit: 'can', price: 120.00, image: '/images/UserInventory/cat-food-wet.png' },
  { id: 8, name: 'Vitamins', type: 'Supplement', quantity: 20, unit: 'bottle', price: 200.00, image: '/images/UserInventory/vitamins.png' },
  { id: 9, name: 'Tick Collar', type: 'Accessory', quantity: 10, unit: 'piece', price: 100.00, image: '/images/UserInventory/tick-collar.png' },
  { id: 10, name: 'Pet Gloves', type: 'Accessory', quantity: 16, unit: 'pair', price: 80.00, image: '/images/UserInventory/pet-gloves.png' },
  { id: 11, name: 'First Aid Kit', type: 'Emergency', quantity: 5, unit: 'kit', price: 90.00, image: '/images/UserInventory/first-aid-kit.png' },
  { id: 12, name: 'Pet Carrier', type: 'Equipment', quantity: 7, unit: 'unit', price: 150.00, image: '/images/UserInventory/pet-carrier.png' },
];

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
  const [paymentMethod, setPaymentMethod] = useState('');

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

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  const increaseQty = (id) => setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
  const decreaseQty = (id) => setCart(cart.map(item => item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item));
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2);

  const filteredInventory = initialInventory.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || item.type === filterType;
    return matchSearch && matchType;
  });

  const itemTypes = [...new Set(initialInventory.map(item => item.type))];

  return (
    <div className="inventory-wrapper">
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
            <button className={filterType === 'All' ? 'active' : ''} onClick={() => setFilterType('All')}>All</button>
            {itemTypes.map((type, i) => (
              <button key={i} className={filterType === type ? 'active' : ''} onClick={() => setFilterType(type)}>{type}</button>
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
          <button className="checkout-btn" onClick={() => setShowModal(true)}>Checkout</button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Checkout</h2>
            <div className="modal-content">
              {/* Left: Cart summary */}
            <div className="modal-left">
  <table className="modal-cart-table">
    <thead>
      <tr>
        <th>Product</th>
        <th>Quantity</th>
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
  <div className="modal-total">
    Total: ₱{totalAmount}
  </div>
</div>


              {/* Right: Delivery and payment */}
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
                  <button className="checkout-confirm">Confirm Order</button>
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
