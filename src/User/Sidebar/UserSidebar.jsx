// src/components/UserSidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./UserSidebar.css"; 

const UserSidebar = () => {
  return (
    <aside className="user-dashboard-sidebar">
      <div className="user-dashboard-logo">Pawcare</div>
      <nav className="user-dashboard-nav">
        <Link to="">Dashboard</Link>
        <Link to="appointments">Appointment</Link>
        <Link to="pet-records">Pet Records</Link>
        <Link to="pet-products">Pet Products</Link>
        <Link to="online-consultation">Online Consultation</Link>
        <Link to="profile">Profile</Link>
      </nav>
      <button className="user-dashboard-sign-out">Sign Out</button>
    </aside>
  );
};

export default UserSidebar;
