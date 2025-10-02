// frontend/src/components/admin/Invoices.tsx
import React, { useEffect, useState } from "react";

const Invoices = () => {
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [loading, setLoading] = useState(false); // 🎯 حالت بارگذاری

  useEffect(() => {
    // فرض می‌کنیم API_BASE در اینجا http://localhost:8000 است
    const API_BASE = "http://localhost:8000"; 
    fetch(`${API_BASE}/api/v1/invoices/customers`)
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت مشتری‌ها");
        return res.json();
      })
      .then((data) => setCustomers(data))
      .catch((err) => console.error(err.message));
  }, []);

  // 🎯 تابع دانلود برای فرمت CSV/Excel
  const handleDownloadInvoice = async () => {
    if (!selectedCustomerId) return;
    setLoading(true);

    try {
        // 🎯 URL جدید برای درخواست CSV/Excel
        const API_BASE = "http://localhost:8000"; 
        const url = `${API_BASE}/api/v1/invoices/customer/${selectedCustomerId}/excel`;

        const res = await fetch(url);

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Server error: ${res.status} ${txt}`);
        }

        const blob = await res.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;

        // 🎯 دریافت نام فایل از هدر Content-Disposition
        const headerFilename = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g,"");
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const defaultFilename = `invoice_customer_${selectedCustomerId}_${today}.csv`;
        
        a.download = headerFilename || defaultFilename; 

        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(objectUrl);

    } catch (err: any) {
        console.error("Download failed:", err);
        alert("دانلود بل با خطا مواجه شد: " + (err.message || err));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "1rem", maxWidth: "500px", margin: "auto", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>📄 چاپ بل مشتری (Excel)</h2>

      <label htmlFor="customerSelect">انتخاب مشتری:</label>
      <select
        id="customerSelect"
        value={selectedCustomerId}
        onChange={(e) => setSelectedCustomerId(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem", color: "#000" }}
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
        disabled={!selectedCustomerId || loading} // 🎯 غیرفعال شدن در زمان بارگذاری
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          // 🎯 تغییر رنگ به سبز برای نشان دادن خروجی Excel/CSV
          backgroundColor: loading ? "#cccccc" : "#28a745", 
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "در حال آماده‌سازی..." : "📥 دانلود بل (CSV)"}
      </button>
    </div>
  );
};

export default Invoices;