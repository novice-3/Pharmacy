import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./pages/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Dispense from "./pages/Dispense";

function App() {
  return (
    <Router>
      <Navbar /> {/* Navbar added here */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/dispense" element={<Dispense />} />
      </Routes>
    </Router>
  );
}

export default App;
