"use client";

import { FC } from "react";

interface AdminCardProps {
  title: string;
  onClick: () => void;
}

const AdminCard: FC<AdminCardProps> = ({ title, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer 
        bg-white text-black
        rounded-xl shadow-lg 
        p-6 flex flex-col items-center justify-center text-center
        w-full h-44
        transform hover:-translate-y-2 hover:scale-105 
        hover:shadow-2xl 
        transition-all duration-300 ease-out
      "
    >
      {/* می‌توان آیکون و متن جدا کرد */}
      <span className="text-3xl mb-2">{title.split(" ")[0]}</span>
      <span className="font-bold text-lg">{title.replace(/^(\S+)\s/, "")}</span>
    </div>
  );
};

export default AdminCard;
