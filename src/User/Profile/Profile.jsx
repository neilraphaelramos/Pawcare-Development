import React, { useState } from "react";
import "./Profile.css";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    phone: "+63 912 345 6789",
    bio: "Pet Owner",
    country: "Philippines",
    state: "Cebu",
    postalCode: "6000",
    taxId: "TX123456789",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profileImage: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile updated successfully!");
    setIsEditing(false);
  };

  const toggleImageModal = () => setShowImageModal((prev) => !prev);

  return (
    <div className="pf-profile">
      <h2 className="pf-profile__title">My Profile</h2>

      <form onSubmit={handleSubmit} className="pf-profile__form">
        <div className="pf-profile__card pf-profile__card--header">
          <div className="pf-profile__avatar-section">
            <div className="pf-profile__avatar-wrapper">
              <img
                src={
                  formData.profileImage
                    ? URL.createObjectURL(formData.profileImage)
                    : "https://via.placeholder.com/100"
                }
                alt="avatar"
                className="pf-profile__avatar-image"
              />
              <button
                type="button"
                className="pf-profile__edit-icon"
                onClick={toggleImageModal}
              >
                ✎
              </button>
            </div>
            <div className="pf-profile__user-info">
              <h3 className="pf-profile__user-name">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="pf-profile__user-bio">{formData.bio}</p>
              <span className="pf-profile__user-location">
                {formData.state}, {formData.country}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="pf-profile__card">
          <div className="pf-profile__card-header">
            <h4>Personal Information</h4>
          </div>
          <div className="pf-profile__card-body pf-profile__card-body--two-columns">
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">First Name</label>
              <input
                className="pf-profile__input"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Last Name</label>
              <input
                className="pf-profile__input"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Email Address</label>
              <input
                className="pf-profile__input"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Phone</label>
              <input
                className="pf-profile__input"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group pf-profile__input-group--full-width">
              <label className="pf-profile__label">Bio</label>
              <input
                className="pf-profile__input"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="pf-profile__card">
          <div className="pf-profile__card-header">
            <h4>Address</h4>
          </div>
          <div className="pf-profile__card-body pf-profile__card-body--two-columns">
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Country</label>
              <input
                className="pf-profile__input"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">City / State</label>
              <input
                className="pf-profile__input"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Postal Code</label>
              <input
                className="pf-profile__input"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Tax ID</label>
              <input
                className="pf-profile__input"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="pf-profile__card">
          <div className="pf-profile__card-header">
            <h4>Change Password</h4>
          </div>
          <div className="pf-profile__card-body pf-profile__card-body--two-columns">
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Current Password</label>
              <input
                className="pf-profile__input"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">New Password</label>
              <input
                className="pf-profile__input"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>
            <div className="pf-profile__input-group pf-profile__input-group--full-width">
              <label className="pf-profile__label">Confirm New Password</label>
              <input
                className="pf-profile__input"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="pf-profile__save-btn">
          Save Changes
        </button>
      </form>

      {/* Modal */}
      {showImageModal && (
        <div className="pf-profile__modal-overlay" onClick={toggleImageModal}>
          <div
            className="pf-profile__modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="pf-profile__modal-title">Change Profile Picture</h3>
            <img
              className="pf-profile__modal-avatar"
              src={
                formData.profileImage
                  ? URL.createObjectURL(formData.profileImage)
                  : "https://via.placeholder.com/100"
              }
              alt="Current"
            />
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className="pf-profile__modal-file-input"
            />
            <button
              onClick={toggleImageModal}
              className="pf-profile__close-modal-btn"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
