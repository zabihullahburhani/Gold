"use client";
interface SidebarProps {
  active: string;
  setActive: (comp: string) => void;
}

export default function Sidebar({ active, setActive }: SidebarProps) {
  const items = ["Customers","Employees","GoldPrices","Transactions","GoldRateDifferences","ShopExpenses","UserProfile","Logout"];
  
  return (
    <aside className="w-52 bg-gray-800 p-4 flex flex-col gap-2">
      {items.map(item => (
        <button
          key={item}
          onClick={() => setActive(item)}
          className={`text-left p-2 rounded ${active === item ? "bg-gold-400 text-gray-900" : "text-gold-400 hover:bg-gray-700"}`}
        >
          {item}
        </button>
      ))}
    </aside>
  );
}
