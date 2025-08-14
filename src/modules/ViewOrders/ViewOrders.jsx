import React, { useState } from 'react';
import './ViewOrders.css'; // Uses existing admin styles

const initialOrders = [
  {
    id: 1,
    customer: 'John Doe',
    items: [
      { name: 'Dog Food - Premium', quantity: 2 },
      { name: 'Chew Toy', quantity: 1 },
    ],
    date: '2024-05-01',
    total: 74.98,
    status: 'Pending',
    address: '123 Main St, Springfield',
  },
  {
    id: 2,
    customer: 'Jane Smith',
    items: [
      { name: 'Cat Toy - Feather Wand', quantity: 1 },
      { name: 'Catnip Pack', quantity: 3 },
    ],
    date: '2024-05-03',
    total: 89.99,
    status: 'Shipped',
    address: '456 Oak Ave, Metropolis',
  },
  {
    id: 3,
    customer: 'Alice Green',
    items: [
      { name: 'Bird Cage Large', quantity: 1 },
    ],
    date: '2024-05-05',
    total: 22.49,
    status: 'Cancelled',
    address: '789 Pine Rd, Gotham',
  },
  {
    id: 4,
    customer: 'Michael Tan',
    items: [
      { name: 'Fish Tank Filter', quantity: 1 },
      { name: 'Aquarium Decor - Plants', quantity: 2 },
    ],
    date: '2024-05-06',
    total: 65.75,
    status: 'Delivery',
    address: '321 Coral Blvd, Oceanview',
  },
];



const ViewOrders = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState(initialOrders);
  const [dateFilter, setDateFilter] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);



  const filteredOrders = orders.filter(order => {
  const matchesCustomer = order.customer.toLowerCase().includes(search.toLowerCase());

  const matchesItems = order.items.some(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const matchesSearch = matchesCustomer || matchesItems;

  const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

  const matchesDate = !dateFilter || order.date === dateFilter;

  return matchesSearch && matchesStatus && matchesDate;
});



  const handleExport = format => {
    console.log(`Exporting as ${format}`);
    // Add export logic here
  };

  return (
    <div className="vieworders-container">
    <div className="vieworders-header-row">
      <h2 className="vieworders-title">Manage Orders</h2>
      <div className="filters">
      <div className="vieworders-status-buttons">
        {['All', 'Pending', 'Out For Delivery', 'Shipped', 'Cancelled'].map(status => (
          <button
            key={status}
            className={`vieworders-status-button ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>


      <div className="vieworders-export-dropdown">
        <button
          className="vieworders-btn vieworders-export-btn vieworders-dropdown-toggle"
          onClick={() => setShowDropdown(prev => !prev)}
        >
          Export ▼
        </button>

        {showDropdown && (
          <div className="vieworders-dropdown-menu">
            <div className="vieworders-dropdown-item" onClick={() => { handleExport('pdf'); setShowDropdown(false); }}>Export PDF</div>
            <div className="vieworders-dropdown-item" onClick={() => { handleExport('csv'); setShowDropdown(false); }}>Export CSV</div>
          </div>
        )}
      </div>

      </div>
  

     </div>


    <div className="search-date-row">
      <input
        type="text"
        placeholder="Search..."
        className="vieworders-search-input"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <input
        type="date"
        className="vieworders-date-input"
        value={dateFilter}
        onChange={e => setDateFilter(e.target.value)}
      />
    </div>

    


   

      <div className="vieworders-table-container">
  <table className="vieworders-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Customer</th>
        <th>Pet Product</th>
        <th>Address</th>
        <th>Date</th>
        <th>Total</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
  {filteredOrders.length > 0 ? (
    filteredOrders.map(order => (
      <tr key={order.id}>
        <td>{order.id}</td>
        <td>{order.customer}</td>
        <td>
        {order.items.map((item, idx) => (
            <div key={idx}>{item.name} × {item.quantity}</div>
        ))}
        </td>
        <td>{order.address}</td>
        <td>{order.date}</td>
        <td>${order.total.toFixed(2)}</td>
        <td>
          <span className={`badge ${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </td>
        <td>
          <select
            value={order.status}
            onChange={e => {
              const newStatus = e.target.value;
              setOrders(prevOrders =>
                prevOrders.map(o =>
                  o.id === order.id ? { ...o, status: newStatus } : o
                )
              );
            }}
            className="status-select"
          >
            <option value="Pending">Pending</option>
            <option value="Delivery">Out for Delivery</option>
            <option value="Shipped">Shipped</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="empty-message">No orders found.</td>
    </tr>
  )}
</tbody>

  </table>
</div>

    </div>
  );
};

export default ViewOrders;