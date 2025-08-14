// src/components/VetSidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./VetSidebar.css";

const VetSidebar = () => {
  return (
    <aside className="vet-dashboard-sidebar">
      <div className="vet-dashboard-logo">        
        Pawcare
      </div>
      <nav className="vet-dashboard-nav">
        <Link to="">Dashboard</Link>
        <Link to="appointments">Appointments</Link>
        <Link to="medical-records">Medical Records</Link>
        <Link to="inventory">Inventory</Link>
        <Link to="notifications">Notifications</Link>
        <Link to="profile">Profile</Link>
        <Link to="online-consultation">Online Consultations</Link>
      </nav>
      <button className="vet-dashboard-sign-out">Sign Out</button>
    </aside>
  );
};

export default VetSidebar;
