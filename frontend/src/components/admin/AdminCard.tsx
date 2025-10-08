"use client";

import { FC } from "react";

interface AdminCardProps {
  title: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

const AdminCard: FC<AdminCardProps> = ({ title, onClick, icon }) => {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer 
        bg-yellow-400 text-black
        rounded-2xl border border-yellow-500/50
        p-6 flex flex-col items-center justify-center text-center
        w-full h-44
        shadow-md
        transform hover:-translate-y-2 hover:scale-105 
        hover:shadow-xl hover:shadow-yellow-500/50
        transition-all duration-300 ease-out
      "
    >
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <span className="font-extrabold text-lg">{title}</span>
    </div>
  );
};

export default AdminCard;
