import React, { useEffect, useState } from "react";

const Invoices = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/invoices/customers")
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت مشتری‌ها");
        return res.json();
      })
      .then((data) => setCustomers(data))
      .catch((err) => console.error(err.message));
  }, []);

  const handleDownloadInvoice = () => {
    if (!selectedCustomerId) return;
    window.open(`http://localhost:8000/api/v1/invoices/customer/${selectedCustomerId}`, "_blank");
  };

  return (
    <div className="card" style={{ padding: "1rem", maxWidth: "500px", margin: "auto" }}>
      <h2>📄 چاپ بل مشتری</h2>

      <label htmlFor="customerSelect">انتخاب مشتری:</label>
      <select
        id="customerSelect"
        value={selectedCustomerId}
        onChange={(e) => setSelectedCustomerId(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
      >
        <option value="">-- انتخاب کنید --</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleDownloadInvoice}
        disabled={!selectedCustomerId}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        📥 دانلود بل
      </button>
    </div>
  );
};

export default Invoices;
