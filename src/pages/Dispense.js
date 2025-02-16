import React, { useState, useEffect } from "react";
import { db, collection, getDocs, doc, updateDoc, addDoc } from "../firebase/firebaseConfig.js";
import "../assets/styles.css";

const Dispense = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [customerName, setCustomerName] = useState("");

  // Fetch all medicines from inventory
  useEffect(() => {
    const fetchMedicines = async () => {
      const querySnapshot = await getDocs(collection(db, "medicines"));
      const meds = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMedicines(meds);
    };
    fetchMedicines();
  }, []);

  // Search for medicine in the inventory
  const handleSearch = () => {
    const foundMedicine = medicines.find((med) => med.name.toLowerCase() === searchQuery.toLowerCase());
    if (foundMedicine) {
      setSelectedMedicine(foundMedicine);
    } else {
      alert("Medicine not found!");
      setSelectedMedicine(null);
    }
  };

  // Dispense medicine
  const handleDispense = async () => {
    if (!selectedMedicine) {
      alert("No medicine selected!");
      return;
    }
    if (quantity <= 0 || quantity > selectedMedicine.quantity) {
      alert("Invalid quantity!");
      return;
    }

    // Get the price from inventory and calculate total price
    const unitPrice = selectedMedicine.price || 0;
    const totalAmount = unitPrice * quantity;

    // Reduce stock count in inventory
    const medicineRef = doc(db, "medicines", selectedMedicine.id);
    await updateDoc(medicineRef, { quantity: selectedMedicine.quantity - quantity });

    // Save transaction in sales collection
    const saleData = {
      customer: customerName || "Walk-in",
      saleDate: new Date().toISOString().split("T")[0],
      items: [
        {
          name: selectedMedicine.name,
          quantity: Number(quantity),
          price: unitPrice, // Ensure price is stored
        }
      ],
      totalAmount: totalAmount, // Store total amount
    };

    await addDoc(collection(db, "sales"), saleData);

    alert(`Medicine dispensed! Total: ₹${totalAmount}`);
    setSelectedMedicine(null);
    setSearchQuery("");
    setQuantity("");
    setCustomerName("");
  };

  return (
    <div className="dispense-container">
      <h1>Dispense Medicine</h1>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search Medicine"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {selectedMedicine && (
        <div className="medicine-details">
          <h2>{selectedMedicine.name}</h2>
          <p>Available Quantity: {selectedMedicine.quantity}</p>
          <p>Price per unit: ₹{selectedMedicine.price || "Not set"}</p>

          <input
            type="number"
            placeholder="Enter Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <input
            type="text"
            placeholder="Customer Name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <p><strong>Total Price: ₹{(selectedMedicine.price || 0) * (quantity || 0)}</strong></p>

          <button onClick={handleDispense}>Dispense</button>
        </div>
      )}
    </div>
  );
};

export default Dispense;
