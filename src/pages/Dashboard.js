import React, { useState, useEffect } from "react";
import { db, collection, getDocs, query, where } from "../firebase/firebaseConfig.js";
import "../assets/styles.css";

const Dashboard = () => {
  const [totalStock, setTotalStock] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [expiringMedicines, setExpiringMedicines] = useState(0);

  useEffect(() => {
    fetchStock();
    fetchSales();
    fetchOrders();
    fetchExpiringMedicines();
  }, []);

  // Fetch total stock from medicines collection
  const fetchStock = async () => {
    const querySnapshot = await getDocs(collection(db, "medicines"));
    let stockCount = 0;
    querySnapshot.forEach((doc) => {
      stockCount += Number(doc.data().quantity);
    });
    setTotalStock(stockCount);
  };

  // Fetch total sales for today (Gross Amount)
  const fetchSales = async () => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const q = query(collection(db, "sales"), where("saleDate", "==", today));
    const querySnapshot = await getDocs(q);
    let total = 0;
    querySnapshot.forEach((doc) => {
      total += Number(doc.data().totalAmount); // Sum up totalAmount field
    });
    setTotalSales(total);
  };

  // Fetch pending & completed orders
  const fetchOrders = async () => {
    const querySnapshot = await getDocs(collection(db, "orders"));
    let pending = 0,
      completed = 0;
    querySnapshot.forEach((doc) => {
      if (doc.data().status.toLowerCase() === "pending") pending++;
      if (doc.data().status.toLowerCase() === "completed") completed++;
    });
    setPendingOrders(pending);
    setCompletedOrders(completed);
  };

  // Fetch expiring medicines
  const fetchExpiringMedicines = async () => {
    const today = new Date().toISOString().split("T")[0];
    const q = query(collection(db, "medicines"), where("expiryDate", "<=", today));
    const querySnapshot = await getDocs(q);
    setExpiringMedicines(querySnapshot.size);
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard Overview</h1>
      <div className="stats-grid">
        <div className="card">
          <h2>📦 Total Stock</h2>
          <p>{totalStock} items</p>
        </div>
        <div className="card">
          <h2>💰 Sales Today (Gross)</h2>
          <p>₹{totalSales}</p>
        </div>
        <div className="card">
          <h2>📋 Pending Orders</h2>
          <p>{pendingOrders}</p>
        </div>
        <div className="card">
          <h2>✅ Completed Orders</h2>
          <p>{completedOrders}</p>
        </div>
        <div className="card">
          <h2>⚠️ Expiring Medicines</h2>
          <p>{expiringMedicines}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
