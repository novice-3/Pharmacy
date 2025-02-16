import React, { useState, useEffect } from "react";
import { db, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, getDocs, query, where } from "../firebase/firebaseConfig.js";
import "../assets/styles.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [newOrder, setNewOrder] = useState({
    supplier: "",
    orderDate: "",
    items: [{ name: "", quantity: "" }],
    status: "Pending",
  });

  // Fetch orders from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orderList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(orderList);
    });

    return () => unsubscribe();
  }, []);

  // Fetch medicine details by name
  const getMedicineDetails = async (medicineName) => {
    const q = query(collection(db, "medicines"), where("name", "==", medicineName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    } else {
      return null; // Medicine not found
    }
  };

  // Update medicine stock when an order is completed
  const updateOrderStatus = async (id, newStatus) => {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, { status: newStatus });

    if (newStatus === "Completed") {
      const order = orders.find((order) => order.id === id);
      if (order) {
        for (let item of order.items) {
          const medicine = await getMedicineDetails(item.name);
          if (medicine) {
            // If medicine exists, update the stock
            const medicineRef = doc(db, "medicines", medicine.id);
            await updateDoc(medicineRef, { quantity: medicine.quantity + Number(item.quantity) });
          } else {
            // If medicine does not exist, create a new entry
            await addDoc(collection(db, "medicines"), { name: item.name, quantity: Number(item.quantity) });
          }
        }
      }
    }
  };

  // Add a new order
  const addOrder = async () => {
    if (!newOrder.supplier || !newOrder.orderDate || newOrder.items.length === 0) return;

    await addDoc(collection(db, "orders"), newOrder);
    setNewOrder({ supplier: "", orderDate: "", items: [{ name: "", quantity: "" }], status: "Pending" });
  };

  // Delete an order
  const deleteOrder = async (id) => {
    await deleteDoc(doc(db, "orders", id));
  };

  // Handle item input changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index][field] = value;
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  return (
    <div className="orders-container">
      <h1>Manage Orders</h1>
      <div className="form">
        <input type="text" placeholder="Supplier Name" value={newOrder.supplier} onChange={(e) => setNewOrder({ ...newOrder, supplier: e.target.value })} />
        <input type="date" value={newOrder.orderDate} onChange={(e) => setNewOrder({ ...newOrder, orderDate: e.target.value })} />

        {newOrder.items.map((item, index) => (
          <div key={index} className="item-row">
            <input type="text" placeholder="Item Name" value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} />
            <input type="number" placeholder="Quantity" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} />
          </div>
        ))}

        <button onClick={() => setNewOrder({ ...newOrder, items: [...newOrder.items, { name: "", quantity: "" }] })}>+ Add Item</button>
        <button onClick={addOrder}>Add Order</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Order Date</th>
            <th>Items</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className={order.status === "Pending" ? "pending" : "completed"}>
              <td>{order.supplier}</td>
              <td>{order.orderDate}</td>
              <td>
                {order.items.map((item, i) => (
                  <div key={i}>{item.name} (x{item.quantity})</div>
                ))}
              </td>
              <td>
                <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td>
                <button onClick={() => deleteOrder(order.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
