import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import "./Inventory.css";

// Utility: Generate item code based on group prefix
const generateItemCode = (group = 'X') => {
  const prefix = group.charAt(0).toUpperCase();
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${randomDigits}`;

};


const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewItem((prevItem) => ({ ...prevItem, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  }
};


const initialInventoryData = [
  {
    code: 'M01456',
    photo: '/images/UserInventory/antibiotic-syrup.png',
    name: 'Antibiotic Syrup',
    group: 'Medicine',
    date: '03/05/2025',
    stock: '10 bottles',
    price: '₱ 12.99',
    expiration: '03/05/2028',
  },
  {
    code: 'F05736',
    photo: '/images/UserInventory/cat-food-wet.png',
    name: 'Wet Cat Food',
    group: 'Food',
    date: '04/07/2025',
    stock: '8 packs',
    price: '₱ 3.49',
    expiration: '04/07/2028',
  },
  {
    code: 'S01457',
    photo: '/images/UserInventory/deworming-tablets.png',
    name: 'Deworming Tablets',
    group: 'Medicine',
    date: '12/11/2025',
    stock: '8 packs',
    price: '₱ 3.49',
    expiration: '12/11/2026',
  },
  {
    code: 'G03452',
    photo: '/images/UserInventory/dry-dog-food.png',
    name: 'Dry Dog Food',
    group: 'Food',
    date: '08/17/2025',
    stock: '12 packs',
    price: '₱ 200.00',
    expiration: '08/17/2027',
  },
  // Add expiration dates to other entries similarly
];


function exportToCSV(data) {
  const headers = ['Item Code', 'Item Name', 'Item Group', 'Last Purchase', 'Expiration','Price', 'Stocks'];
  const rows = data.map(item => [
    item.code,
    item.name,
    item.group,
    item.date,
    item.expiration,
    item.price,
    item.stock,
  ]);
  
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += headers.join(',') + '\r\n';
  rows.forEach(row => {
    csvContent += row.join(',') + '\r\n';
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'inventory_export.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function InventoryTable() {
  const [inventoryData, setInventoryData] = useState(initialInventoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const handleEdit = (index) => {
  setNewItem(inventoryData[index]); // Load item into modal
  setEditingIndex(index);           // Mark as editing
  setShowAddModal(true);            // Open modal
};
  const handleDelete = (index) => {
  const confirmed = window.confirm("Are you sure you want to delete this item?");
  if (confirmed) {
    const updatedData = [...inventoryData];
    updatedData.splice(index, 1);
    setInventoryData(updatedData);
  }
};


  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    code: '',
    photo: '',
    name: '',
    group: '',
    date: '',
    expiration: '',
    stock: '',
    price: '',
    unit: '',
  });
  const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewItem((prevItem) => ({ ...prevItem, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  }
};

  useEffect(() => {
    if (showAddModal && newItem.group) {
      // Only generate if group is selected
      setNewItem((prev) => ({
        ...prev,
        code: generateItemCode(prev.group),
      }));
    }
  }, [showAddModal]);

  

  // Filter inventory by search term (code, name, or group)
  const filteredData = inventoryData.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term) ||
      item.group.toLowerCase().includes(term)
    );
  });

  // Handle form input change for Add Item modal
  const handleInputChange = (e) => {
  const { name, value } = e.target;

  setNewItem((prev) => {
    const updated = { ...prev, [name]: value };

    // When group is changed, regenerate the item code
    if (name === 'group' && value) {
      updated.code = generateItemCode(value);
    }

    return updated;
  });
};


  // Add new item to inventory
  const handleAddItem = () => {
  if (
    newItem.code && newItem.photo && newItem.name &&
    newItem.group && newItem.date && newItem.stock && newItem.price
  ) {
    if (editingIndex !== null) {
      // Update existing item
      const updated = [...inventoryData];
      updated[editingIndex] = newItem;
      setInventoryData(updated);
    } else {
      // Add new item
      setInventoryData(prev => [...prev, newItem]);
    }

    // Reset state
    setNewItem({
      code: '',
      photo: '',
      name: '',
      group: '',
      date: '',
      expiration: '',
      stock: '',
      price: '',
      unit: '',
    });
    setEditingIndex(null);
    setShowAddModal(false);
  } else {
    alert('Please fill all fields');
  }
};


  return (
    <div className="admin-inventory-container">
      <div className="admin-inventory-header">
        <h2>Inventory Management</h2>
        <div className="inventory-controls">
          <input
            type="text"
            placeholder="Search by code, name or group..."
            className="inventory-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />


          <div className="admin-inventory-export-dropdown">
          <button
            className="admin-inventory-btn admin-inventory-export-btn admin-inventory-dropdown-toggle"
            onClick={() => setShowDropdown(prev => !prev)}
          >
            Export ▼
          </button>

          {showDropdown && (
            <div className="admin-inventory-dropdown-menu">
              <div
                className="admin-inventory-dropdown-item"
                onClick={() => {
                  handleExport('pdf');
                  setShowDropdown(false);
                }}
              >
                Export PDF
              </div>
              <div
                className="admin-inventory-dropdown-item"
                onClick={() => {
                  handleExport('csv');
                  setShowDropdown(false);
                }}
              >
                Export CSV
              </div>
            </div>
          )}
        </div>


          <button
            className="admin-inventory-add-item-btn"
            onClick={() => setShowAddModal(true)}
          >
            + Add Item
          </button>
        </div>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Item Code</th>
            <th>Photo</th>
            <th>Item Name</th>
            <th>Item Group</th>
            <th>Last Purchase</th>
            <th>Expiration</th>
            <th>Price</th>
            <th>Stocks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.code}</td>
              <td>
                <img
                  src={item.photo}
                  alt={item.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '0',
                  }}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.group}</td>
              <td>{item.date}</td>
              <td>{item.expiration}</td>
              <td>{item.price}</td>
              <td>
                {item.stock}
                {item.low && <span className="status-down"> ↓</span>}
              </td>
              <td>
                <button className="admin-inventory-edit-icon-btn" onClick={() => handleEdit(index)}>
              <Edit size={16} />
            </button>

                <button className="admin-inventory-delete-icon-btn" onClick={() => handleDelete(index)}>
          <Trash2 size={16} />
        </button>

              </td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                No items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showAddModal && (
  <div className="admin-inventory-modal-overlay">
    <div className="admin-inventory-modal-content">
      <h3 className="admin-inventory-modal-title">Add New Product</h3>

      <div className="admin-inventory-modal-grid">
        {/* Image Upload */}
        <div className="admin-inventory-image-upload-wrapper">
          <div
            className="admin-inventory-image-upload"
            onClick={() => document.getElementById('image-upload').click()}
          >
            {newItem.photo ? (
              <img src={newItem.photo} alt="Uploaded" className="admin-inventory-uploaded-image" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="admin-inventory-upload-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm1 3a1 1 0 112 0 1 1 0 01-2 0zM3 15l4-5 3 4 4-6 5 7H3z" />
              </svg>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="admin-inventory-hidden-input"
            />
          </div>
        </div>

        <div className="admin-inventory-form-grid">
          <div className="admin-inventory-form-group">
            <label htmlFor="code">Item Code</label>
            <input type="text" id="code" name="code" value={newItem.code} className="admin-inventory-input-field" readOnly />
          </div>

          <div className="admin-inventory-form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" value={newItem.name} onChange={handleInputChange} className="admin-inventory-input-field" />
          </div>

          <div className="admin-inventory-form-group">
            <label htmlFor="group">Category</label>
            <select id="group" name="group" value={newItem.group} onChange={handleInputChange} className="admin-inventory-select-field">
              <option value="">Select Category</option>
              <option value="Medicine">Medicine</option>
              <option value="Food">Food</option>
              <option value="Supplement">Supplement</option>
              <option value="Vaccine">Vaccine</option>
              <option value="Grooming">Grooming</option>
              <option value="Toy">Toy</option>
              <option value="Supplies">Supplies</option>
            </select>
          </div>

          <div className="admin-inventory-form-group">
            <label htmlFor="price">Price</label>
            <input type="text" id="price" name="price" value={newItem.price} onChange={handleInputChange} className="admin-inventory-input-field" />
          </div>
        </div>

        <div className="admin-inventory-date-qty-grid">
          <div className="admin-inventory-form-group">
            <label htmlFor="date">Date Purchase</label>
            <input type="date" id="date" name="date" value={newItem.date} onChange={handleInputChange} className="admin-inventory-input-field" />
          </div>

          <div className="admin-inventory-form-group">
            <label htmlFor="expiration">Expiration Date</label>
            <input type="date" id="expiration" name="expiration" value={newItem.expiration} onChange={handleInputChange} className="admin-inventory-input-field" />
          </div>

          <div className="admin-inventory-form-group">
            <label htmlFor="stock">Quantity</label>
            <input type="number" id="stock" name="stock" value={newItem.stock} onChange={handleInputChange} className="admin-inventory-input-field" />
          </div>

          <div className="admin-inventory-form-group">
            <label htmlFor="unit">Unit</label>
            <select id="unit" name="unit" value={newItem.unit} onChange={handleInputChange} className="admin-inventory-select-field">
              <option value="">Select Unit</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="mg">mg</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="tablet">tablet</option>
              <option value="capsule">capsule</option>
              <option value="bottle">bottle</option>
              <option value="pack">pack</option>
              <option value="box">box</option>
              <option value="can">can</option>
              <option value="pouch">pouch</option>
            </select>
          </div>
        </div>

        <div className="admin-inventory-modal-actions">
          <button onClick={handleAddItem} className="admin-inventory-btn primary">Add Item</button>
          <button onClick={() => setShowAddModal(false)} className="admin-inventory-btn secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}


      <div className="pagination">
        <span>Showing 1 - 10 of 148 entries</span>
        <div className="page-controls">
          <button>&lt;</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <button>5</button>
          <button>&gt;</button>
        </div>
        <div className="show-entries">
          <span>Show</span>
          <select>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span>entries</span>
        </div>
      </div>
    </div>
  );
  
}