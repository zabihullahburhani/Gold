import Modal from "../../components/shared/Modal";
import { useState } from "react";

const sampleCustomers = [
  { id: 1, fullName: "احمد احمدی", phone: "0700000000", address: "کابل" },
];

export default function Customers() {
  const [customers, setCustomers] = useState(sampleCustomers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", phone: "", address: "" });

  const handleAdd = () => {
    const newCustomer = { id: Date.now(), ...formData };
    setCustomers([...customers, newCustomer]);
    setFormData({ fullName: "", phone: "", address: "" });
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">👥 مدیریت مشتریان</h1>
      <button onClick={() => setIsModalOpen(true)} className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        ➕ افزودن مشتری
      </button>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">نام کامل</th>
              <th className="p-2">شماره تماس</th>
              <th className="p-2">آدرس</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.fullName}</td>
                <td className="p-2">{c.phone}</td>
                <td className="p-2">{c.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* مودال افزودن */}
      <Modal
        isOpen={isModalOpen}
        title="افزودن مشتری جدید"
        onClose={() => setIsModalOpen(false)}
        onSave={handleAdd}
      >
        <input
          type="text"
          placeholder="نام کامل"
          value={formData.fullName}
          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="شماره تماس"
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="آدرس"
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
      </Modal>
    </div>
  );
}
