import React, { useState, useEffect } from "react";
import { db, collection, addDoc, onSnapshot, doc, updateDoc, getDocs, query, where } from "../firebase/firebaseConfig.js";
import "../assets/styles.css";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [grossTotal, setGrossTotal] = useState(0);
  const [newSale, setNewSale] = useState({
    customer: "",
    saleDate: "",
    items: [{ name: "", quantity: "", price: "" }],
    totalAmount: 0,
  });

  // Fetch sales data from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sales"), (snapshot) => {
      const salesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSales(salesData);
      calculateGrossTotal(salesData);
    });

    return () => unsubscribe();
  }, []);

  // Fetch medicines from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "medicines"), (snapshot) => {
      const meds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMedicines(meds);
    });

    return () => unsubscribe();
  }, []);

  // Calculate Gross Total Amount
  const calculateGrossTotal = (salesData) => {
    const total = salesData.reduce((acc, sale) => acc + sale.totalAmount, 0);
    setGrossTotal(total);
  };

  // Fetch medicine details by name from Firestore
  const getMedicineDetails = async (medicineName) => {
    const q = query(collection(db, "medicines"), where("name", "==", medicineName));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    } else {
      return null; // Medicine not found
    }
  };

  // Add a new sale
  const addSale = async () => {
    if (!newSale.saleDate || newSale.items.length === 0) {
      alert("Please enter a sale date and at least one item.");
      return;
    }

    let updatedItems = [];

    for (let item of newSale.items) {
      const medicine = await getMedicineDetails(item.name);

      if (!medicine) {
        alert(`Medicine "${item.name}" does not exist in inventory!`);
        return;
      }

      if (medicine.quantity < item.quantity) {
        alert(`Not enough stock for "${item.name}". Available: ${medicine.quantity}`);
        return;
      }

      updatedItems.push({ ...item, price: medicine.price });
    }

    // Calculate total price
    const total = updatedItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const saleData = { ...newSale, items: updatedItems, totalAmount: total };

    // Save the sale in Firestore
    await addDoc(collection(db, "sales"), saleData);

    // Update stock in inventory
    for (let item of updatedItems) {
      const medicine = await getMedicineDetails(item.name);
      if (medicine) {
        const medicineRef = doc(db, "medicines", medicine.id);
        await updateDoc(medicineRef, { quantity: medicine.quantity - item.quantity });
      }
    }

    // Reset form
    setNewSale({ customer: "", saleDate: "", items: [{ name: "", quantity: "", price: "" }], totalAmount: 0 });
  };

  // Handle input changes for sale items
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newSale.items];
    updatedItems[index][field] = value;
    setNewSale({ ...newSale, items: updatedItems });
  };

  // Add a new item row
  const addItemRow = () => {
    setNewSale({ ...newSale, items: [...newSale.items, { name: "", quantity: "", price: "" }] });
  };

  return (
    <div className="sales-container">
      <h1>Sales Management</h1>

      {/* Sale Input Form */}
      <div className="form">
        <input
          type="text"
          placeholder="Customer Name"
          value={newSale.customer}
          onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })}
        />
        <input
          type="date"
          value={newSale.saleDate}
          onChange={(e) => setNewSale({ ...newSale, saleDate: e.target.value })}
        />

        {/* Sale Items */}
        {newSale.items.map((item, index) => (
          <div key={index} className="sale-item">
            <input
              type="text"
              placeholder="Medicine Name"
              value={item.name}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
            />
          </div>
        ))}
        <button onClick={addItemRow}>Add Another Item</button>
        <button onClick={addSale}>Submit Sale</button>
      </div>

      {/* Sales Records Table */}
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.customer}</td>
              <td>{sale.saleDate}</td>
              <td>
                {sale.items.map((item, i) => (
                  <div key={i}>
                    {item.name} - {item.quantity} x ₹{item.price}
                  </div>
                ))}
              </td>
              <td>₹{sale.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Display Gross Total Amount */}
      <h2>Gross Total: ₹{grossTotal}</h2>
    </div>
  );
};

export default Sales;
