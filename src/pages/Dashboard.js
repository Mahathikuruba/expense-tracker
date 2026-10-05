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

function Dashboard() {
  const [user, setUser] = useState(null);
  const [budget, setBudget] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const categories = ["Food", "Rent", "Travel", "Shopping"];

  // -----------------------------
  // AUTHENTICATION
  // -----------------------------
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
  }, [navigate]);

  // -----------------------------
  // FETCH EXPENSES
  // -----------------------------
  const fetchExpenses = (uid) => {
    const q = query(collection(db, "expenses"), where("userId", "==", uid));

    onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setExpenses(data);
      },
      (error) => {
        console.error("Error fetching expenses:", error);
        setError("Unable to load expenses. Please try again.");
      },
    );
  };

  // -----------------------------
  // BUDGET VALIDATION
  // -----------------------------
  const handleBudgetChange = (e) => {
    const value = e.target.value;

    setError("");

    if (value === "") {
      setBudget("");
      return;
    }

    const budgetValue = Number(value);

    if (isNaN(budgetValue)) {
      setError("Please enter a valid budget amount.");
      return;
    }

    if (budgetValue < 0) {
      setError("Budget cannot be negative.");
      return;
    }

    setBudget(value);
  };

  // -----------------------------
  // ADD / UPDATE EXPENSE
  // -----------------------------
  const addExpense = async () => {
    setError("");

    const expenseAmount = Number(amount);

    if (!amount || isNaN(expenseAmount)) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (expenseAmount < 0) {
      setError("Expense amount cannot be negative.");
      return;
    }

    if (!user) {
      setError("You must be logged in to add an expense.");
      return;
    }

    try {
      if (editId) {
        await updateDoc(doc(db, "expenses", editId), {
          amount: expenseAmount,
          category,
        });

        setEditId(null);
      } else {
        await addDoc(collection(db, "expenses"), {
          userId: user.uid,
          amount: expenseAmount,
          category,
          date: new Date().toISOString(),
        });
      }

      setAmount("");
      setCategory("Food");
    } catch (error) {
      console.error("Error saving expense:", error);
      setError("Unable to save the expense. Please try again.");
    }
  };

  // -----------------------------
  // DELETE EXPENSE
  // -----------------------------
  const deleteExpense = async (id) => {
    setError("");

    try {
      await deleteDoc(doc(db, "expenses", id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      setError("Unable to delete the expense. Please try again.");
    }
  };

  // -----------------------------
  // EDIT EXPENSE
  // -----------------------------
  const editExpense = (e) => {
    setError("");

    setEditId(e.id);
    setAmount(String(e.amount));
    setCategory(e.category);
  };

  // -----------------------------
  // TOTALS
  // -----------------------------
  const totalSpent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );

  const remaining = budget ? Number(budget) - totalSpent : 0;

  // -----------------------------
  // FILTER EXPENSES
  // -----------------------------
  const filtered =
    selectedCategory === "All"
      ? expenses
      : expenses.filter(
          (e) =>
            e.category?.toLowerCase().trim() ===
            selectedCategory.toLowerCase().trim(),
        );

  // -----------------------------
  // CHART DATA
  // -----------------------------
  const chartData = categories.map((cat) => ({
    name: cat,
    value: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + Number(e.amount), 0),
  }));

  const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  // -----------------------------
  // DOWNLOAD PDF
  // -----------------------------
  const downloadPDF = () => {
    try {
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        setError("Please allow pop-ups to download the expense report.");
        return;
      }

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

              th,
              td {
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
              Total Spent: ₹${totalSpent}
              <br />
              Remaining: ₹${remaining}
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.print();
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Unable to generate the expense report.");
    }
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const handleLogout = async () => {
    setError("");

    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Unable to logout. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2>💰 Expense Tracker</h2>

      <p className="welcome">Welcome 👋 {user?.email}</p>

      {error && <p className="error">{error}</p>}

      {/* Budget */}
      <input
        placeholder="Set Budget"
        type="number"
        min="0"
        step="0.01"
        value={budget}
        onChange={handleBudgetChange}
      />

      {/* Category */}
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Expense Amount */}
      <input
        placeholder="Expense Amount"
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          setError("");
        }}
      />

      <button onClick={addExpense}>
        {editId ? "Update Expense" : "Add Expense"}
      </button>

      {/* Filter */}
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

      {/* Summary */}
      <div className="card">Total Spent: ₹{totalSpent}</div>

      <div className="card">Remaining: ₹{remaining}</div>

      {/* Chart */}
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

      {/* Expenses */}
      <h3>Expenses</h3>

      {filtered.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        filtered.map((e) => (
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
        ))
      )}

      <button className="pdf-btn" onClick={downloadPDF}>
        Download PDF
      </button>

      <button className="logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
