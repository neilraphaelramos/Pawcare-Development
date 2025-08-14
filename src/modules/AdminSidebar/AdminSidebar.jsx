import React from "react";
import { Link } from "react-router-dom";
import "./AdminSidebar.css"; 

const AdminSidebar = () => {
  return (
    <aside className="admin-dashboard-sidebar">
      <div className="admin-dashboard-logo">Pawcare</div>
      <nav className="admin-dashboard-nav">
        <Link to="">Dashboard</Link>       
        <Link to="medical-records">Pet Medical Records</Link>
        <Link to="appointments">Appointment</Link>
        <Link to="online-consultation">Online Consultation</Link>
        <Link to="notifications">Notifications</Link>
        <Link to="view-orders">Manage Orders</Link>   
        <Link to="inventory">Manage Inventory</Link>
        <Link to="services">Manage Services</Link>
        <Link to="features">Manage Features</Link> 
        <Link to="accounts">Manage Accounts</Link>
      </nav>
      <button className="admin-dashboard-sign-out">Sign Out</button>
    </aside>
  );
};

export default AdminSidebar;