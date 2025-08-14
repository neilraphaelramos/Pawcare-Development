import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import './Accounts.css';

const initialUsers = [
  {
    id: 1,
    fullName: 'Adira Cruz',
    username: 'adiracruz',
    email: 'adira@example.com',
    phone: '09171234567',
    password: 'encryptedpassword',
    role: 'Veterinarian/Staff',
    image: '',
  },
  {
    id: 2,
    fullName: 'Juan Dela Cruz',
    username: 'juandelacruz',
    email: 'juan@example.com',
    phone: '09179876543',
    password: 'encryptedpassword',
    role: 'User',
    image: '',
  },
];

const Accounts = () => {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    image: '',
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setUsers(initialUsers);
  }, []);

  const openModal = (index = null) => {
    if (index !== null) {
      setNewUser(users[index]);
      setEditingIndex(index);
    } else {
      setNewUser({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: '',
        image: '',
      });
      setEditingIndex(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIndex(null);
    setNewUser({
      fullName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      image: '',
    });
  };

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUser((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!newUser.fullName || !newUser.username || !newUser.email || !newUser.role) return;

    const updatedUsers = [...users];
    if (editingIndex !== null) {
      updatedUsers[editingIndex] = newUser;
    } else {
      updatedUsers.push({ ...newUser, id: users.length + 1 });
    }

    setUsers(updatedUsers);
    closeModal();
  };

  const handleDelete = (index) => {
    const updated = [...users];
    updated.splice(index, 1);
    setUsers(updated);
  };

  return (
    <div className="account-container">
      <div className="account-header">
        <h2>Manage Accounts</h2>
        <div className="services-actions">
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="services-search-input"
          />
          <button className="services-primary-btn" onClick={() => openModal()}>
            Add Account
          </button>
        </div>
      </div>

      <div className="services-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Avatar</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(
                (user) =>
                  user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>
                    {user.image ? (
                      <img src={user.image} alt={user.fullName} className="inventory-img-thumb" />
                    ) : (
                      <div className="inventory-img-thumb empty-avatar" />
                    )}
                  </td>
                  <td>{user.fullName}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.role}</td>
                  <td>
                    <button className="services-edit-icon-btn" onClick={() => openModal(index)}>
                      <Edit size={16} />
                    </button>
                    <button className="services-delete-icon-btn" onClick={() => handleDelete(index)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="accounts-modal-overlay">
          <div className="accounts-modal-content">
            <h3>{editingIndex !== null ? 'Edit Account' : 'Add Account'}</h3>

            <div className="accounts-image-upload-wrapper">
              <div
                className="accounts-image-upload"
                onClick={() => document.getElementById('avatar-upload').click()}
              >
                {newUser.image ? (
                  <img src={newUser.image} alt="Avatar" className="uploaded-image" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="upload-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zM3 15l4-5 3 4 4-6 5 7H3z" />
                  </svg>
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden-input"
                />
              </div>
            </div>

            <div className="accounts-form-grid">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={newUser.fullName}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={newUser.username}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newUser.email}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={newUser.phone}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={newUser.password}
                onChange={handleInputChange}
                disabled={editingIndex !== null}
              />
              <select name="role" value={newUser.role} onChange={handleInputChange}>
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Veterinarian/Staff">Veterinarian/Staff</option>
                <option value="User">User</option>
              </select>
            </div>

            <div className="accounts-modal-buttons">
              <button className="accounts-primary-btn" onClick={handleSave}>
                {editingIndex !== null ? 'Update' : 'Add'}
              </button>
              <button className="accounts-cancel-btn" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
