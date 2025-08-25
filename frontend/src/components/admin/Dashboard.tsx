import Customers from "./Customers";
import Employees from "./Employees";
import GoldPrices from "./GoldPrices";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>داشبورد مدیر</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <Customers />
        </div>

        <div className="card">
          <Employees />
        </div>
      </div>

      <div className="card">
        <GoldPrices />
      </div>
    </div>
  );
}
