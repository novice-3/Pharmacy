import React, { useState, useEffect } from "react";
import { db, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "../firebase/firebaseConfig.js";
import "../assets/styles.css";

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: "", quantity: "", expiryDate: "", price: "" });
  const [editingMedicine, setEditingMedicine] = useState(null);

  // Fetch medicines from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "medicines"), (snapshot) => {
      const meds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMedicines(meds);
    });
    return () => unsubscribe();
  }, []);

  // Add new medicine
  const addMedicine = async () => {
    if (!newMedicine.name || !newMedicine.quantity || !newMedicine.expiryDate || !newMedicine.price) {
      alert("All fields are required!");
      return;
    }
    await addDoc(collection(db, "medicines"), {
      ...newMedicine,
      quantity: Number(newMedicine.quantity),
      price: Number(newMedicine.price)
    });
    setNewMedicine({ name: "", quantity: "", expiryDate: "", price: "" });
  };

  // Update existing medicine
  const updateMedicine = async () => {
    if (!editingMedicine) return;
    const medicineRef = doc(db, "medicines", editingMedicine.id);
    await updateDoc(medicineRef, {
      name: editingMedicine.name,
      quantity: Number(editingMedicine.quantity),
      expiryDate: editingMedicine.expiryDate,
      price: Number(editingMedicine.price)
    });
    setEditingMedicine(null);
  };

  // Delete medicine
  const deleteMedicine = async (id) => {
    await deleteDoc(doc(db, "medicines", id));
  };

  // Check if medicine is expired
  const isExpired = (date) => {
    const today = new Date().toISOString().split("T")[0];
    return date <= today;
  };

  return (
    <div className="inventory-container">
      <h1>Manage Medicines</h1>

      {/* Medicine Input Form */}
      <div className="form">
        <input
          type="text"
          placeholder="Name"
          value={newMedicine.name}
          onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newMedicine.quantity}
          onChange={(e) => setNewMedicine({ ...newMedicine, quantity: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newMedicine.price}
          onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
        />
        <input
          type="date"
          value={newMedicine.expiryDate}
          onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
        />
        <button onClick={addMedicine}>Add Medicine</button>
      </div>

      {/* Medicine List Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Price (₹)</th>
            <th>Expiry Date</th>
            <th>Expired</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((medicine) => (
            <tr key={medicine.id} className={isExpired(medicine.expiryDate) ? "expired" : ""}>
              <td>{medicine.name}</td>
              <td>{medicine.quantity}</td>
              <td>₹{medicine.price}</td>
              <td>{medicine.expiryDate}</td>
              <td>{isExpired(medicine.expiryDate) ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => setEditingMedicine(medicine)}>Edit</button>
                <button onClick={() => deleteMedicine(medicine.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Form */}
      {editingMedicine && (
        <div className="edit-form">
          <h2>Edit Medicine</h2>
          <input
            type="text"
            value={editingMedicine.name}
            onChange={(e) => setEditingMedicine({ ...editingMedicine, name: e.target.value })}
          />
          <input
            type="number"
            value={editingMedicine.quantity}
            onChange={(e) => setEditingMedicine({ ...editingMedicine, quantity: e.target.value })}
          />
          <input
            type="number"
            value={editingMedicine.price}
            onChange={(e) => setEditingMedicine({ ...editingMedicine, price: e.target.value })}
          />
          <input
            type="date"
            value={editingMedicine.expiryDate}
            onChange={(e) => setEditingMedicine({ ...editingMedicine, expiryDate: e.target.value })}
          />
          <button onClick={updateMedicine}>Update</button>
          <button onClick={() => setEditingMedicine(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Inventory;
