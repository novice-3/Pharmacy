import React, { useEffect, useState } from "react";
import { db, collection, getDocs } from "../firebase/firebaseConfig";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Reports = () => {
  const [stockData, setStockData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);

  useEffect(() => {
    fetchStockData();
    fetchSalesData();
    fetchOrdersData();
  }, []);

  // Fetch Stock Data
  const fetchStockData = async () => {
    const querySnapshot = await getDocs(collection(db, "medicines"));
    const data = querySnapshot.docs.map((doc) => doc.data());
    setStockData(data);
  };

  // Fetch Sales Data
  const fetchSalesData = async () => {
    const querySnapshot = await getDocs(collection(db, "sales"));
    const data = querySnapshot.docs.map((doc) => doc.data());
    setSalesData(data);
  };

  // Fetch Orders Data
  const fetchOrdersData = async () => {
    const querySnapshot = await getDocs(collection(db, "orders"));
    const data = querySnapshot.docs.map((doc) => doc.data());
    setOrdersData(data);
  };

  // Function to generate and download the PDF
  const generatePDF = (title, data, headers) => {
    const doc = new jsPDF();
    doc.text(title, 14, 10);

    // Convert data into table format
    const rows = data.map((row) => headers.map((header) => row[header] || ""));

    doc.autoTable({
      startY: 20,
      head: [headers],
      body: rows,
    });

    // Auto-download
    doc.save(`${title}.pdf`);
  };

  return (
    <div className="reports-container">
      <h1>📊 Reports</h1>

      <button onClick={() => generatePDF("Stock Report", stockData, ["name", "quantity", "expiryDate"])}>📦 Download Stock Report</button>
      <button onClick={() => generatePDF("Sales Report", salesData, ["saleDate", "totalAmount"])}>💰 Download Sales Report</button>
      <button onClick={() => generatePDF("Orders Report", ordersData, ["customerName", "status"])}>📋 Download Orders Report</button>
    </div>
  );
};

export default Reports;
