import React from "react";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  // Hide Navbar on the Login page
  if (location.pathname === "/") return null;

  return (
    
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/inventory">Inventory</a></li>
        <li><a href="/orders">Orders</a></li>
        <li><a href="/sales">Sales</a></li>
        <li><a href="/reports">Reports</a></li>
        <li><a href="/dispense">Dispense</a></li>
      </ul>
    
  );
};

export default Navbar;
