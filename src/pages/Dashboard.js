import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// ✅ SAFE PDF (NO IMPORT ISSUES)
import jsPDF from "jspdf";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [budget, setBudget] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const navigate = useNavigate();

  const categories = ["Food", "Rent", "Travel", "Shopping"];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        fetchExpenses(u.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsub();
  }, []);

  const fetchExpenses = (uid) => {
    const q = query(collection(db, "expenses"), where("userId", "==", uid));

    onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setExpenses(data);
    });
  };

  // ✅ ADD / UPDATE FIXED
  const addExpense = async () => {
    if (!amount) return;

    if (editId) {
      await updateDoc(doc(db, "expenses", editId), {
        amount: Number(amount),
        category,
      });
      setEditId(null);
    } else {
      await addDoc(collection(db, "expenses"), {
        userId: user.uid,
        amount: Number(amount),
        category,
        date: new Date().toISOString(),
      });
    }

    setAmount("");
    setCategory("Food");
  };

  const deleteExpense = async (id) => {
    await deleteDoc(doc(db, "expenses", id));
  };

  const editExpense = (e) => {
    setEditId(e.id);
    setAmount(String(e.amount));
    setCategory(e.category);
  };

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = budget ? budget - totalSpent : 0;

  // ✅ FILTER FIXED
  const filtered =
    selectedCategory === "All"
      ? expenses
      : expenses.filter(
          (e) =>
            e.category?.toLowerCase().trim() ===
            selectedCategory.toLowerCase().trim(),
        );

  const chartData = categories.map((cat) => ({
    name: cat,
    value: expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + Number(e.amount), 0),
  }));

  const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  // ✅ CLEAN PDF (NO ERRORS EVER)
  const downloadPDF = () => {
    const printWindow = window.open("", "_blank");

    const html = `
    <html>
      <head>
        <title>Expense Report</title>
        <style>
          body {
            font-family: Arial;
            padding: 20px;
          }
          h2 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #4f46e5;
            color: white;
          }
          .summary {
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        <h2>Expense Report</h2>

        <table>
          <tr>
            <th>No</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>

          ${expenses
            .map(
              (e, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${e.category}</td>
              <td>₹${e.amount}</td>
            </tr>
          `,
            )
            .join("")}
        </table>

        <div class="summary">
          Total Spent: ₹${totalSpent} <br/>
          Remaining: ₹${remaining}
        </div>
      </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="container">
      <h2>💰 Expense Tracker</h2>

      <p className="welcome">Welcome 👋 {user?.email}</p>

      <input
        placeholder="Set Budget"
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <input
        placeholder="Expense Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={addExpense}>
        {editId ? "Update Expense" : "Add Expense"}
      </button>

      <h4>Filter</h4>

      <div className="nav">
        {["All", ...categories].map((item) => (
          <button
            key={item}
            className={selectedCategory === item ? "active" : ""}
            onClick={() => setSelectedCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="card">Total Spent: ₹{totalSpent}</div>
      <div className="card">Remaining: ₹{remaining}</div>

      <div className="chart">
        <PieChart width={260} height={260}>
          <Pie data={chartData} dataKey="value" outerRadius={90} label>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      <h3>Expenses</h3>

      {filtered.map((e) => (
        <div key={e.id} className="expense-card">
          <div>
            <h4>{e.category}</h4>
            <p>₹{e.amount}</p>
          </div>

          <div>
            <button onClick={() => editExpense(e)}>Edit</button>
            <button onClick={() => deleteExpense(e.id)}>Delete</button>
          </div>
        </div>
      ))}

      <button className="pdf-btn" onClick={downloadPDF}>
        Download PDF
      </button>

      <button className="logout" onClick={() => signOut(auth)}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
