import React, { useState, useContext } from "react";
import "./Profile.css";
import { UserContext } from "../../hook/authContext";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    middleName: user.middleName || "",
    lastName: user.lastName || "",
    suffix: user.suffix || "",
    email: user.email || "",
    phone: user.phone || "",
    bio: user.bio || "",
    houseNumber: user.houseNum || "",
    province: user.province || "",
    municipality: user.municipality || "",
    barangay: user.barangay || "",
    zipCode: user.zipCode || "",
    currentPassword: "" || "",
    newPassword: "",
    confirmPassword: "",
    profileImage: user.pic ? `data:image/jpeg;base64,${user.pic}` : null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profileImage" && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: reader.result,
          imageFile: file, 
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdateSumbit = async (e) => {
    e.preventDefault();

    try {
      if (!window.confirm("You want to update your personal details?")) return;

      const response = await fetch("server-api/update_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          suffix: formData.suffix,
          phone: formData.phone,
          bio: formData.bio,
          houseNumber: formData.houseNumber,
          province: formData.province,
          municipality: formData.municipality,
          barangay: formData.barangay,
          zipCode: formData.zipCode,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          password: formData.confirmPassword,
          image: formData.profileImage
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setIsEditing(false);
        setTimeout(() => {
          setIsEditing(true);
        }, 5000);
        setUser(data.user);
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Server error.");
    }
  };

  const toggleImageModal = () => setShowImageModal((prev) => !prev);

  return (
    <div className="pf-profile">
      <h2 className="pf-profile__title">My Profile</h2>

      <form onSubmit={handleUpdateSumbit} className="pf-profile__form">
        <div className="pf-profile__card pf-profile__card--header">
          <div className="pf-profile__avatar-section">
            <div className="pf-profile__avatar-wrapper">
              <img
                src={
                  formData.profileImage
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
              <label className="pf-profile__label">Middle Name</label>
              <input
                className="pf-profile__input"
                name="middleName"
                value={formData.middleName}
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
              <label className="pf-profile__label">Suffix</label>
              <input
                className="pf-profile__input"
                name="suffix"
                value={formData.suffix}
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
                disabled
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
              <label className="pf-profile__label">House Number</label>
              <input
                className="pf-profile__input"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Province</label>
              <input
                className="pf-profile__input"
                name="province"
                value={formData.province}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Municipality</label>
              <input
                className="pf-profile__input"
                name="municipality"
                value={formData.municipality}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Barangay</label>
              <input
                className="pf-profile__input"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="pf-profile__input-group">
              <label className="pf-profile__label">Zip Code</label>
              <input
                className="pf-profile__input"
                name="zipCode"
                value={formData.zipCode}
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
