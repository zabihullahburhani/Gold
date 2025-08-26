"use client";
import React, { useState } from "react";
import Image from "next/image";

interface UserProfileProps {
  user: {
    name: string;
    avatar: string;
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(""); // می‌توانید مقدار واقعی ایمیل را از props بدهید
  const [avatar, setAvatar] = useState(user.avatar);
  const [preview, setPreview] = useState(user.avatar);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      setAvatar(file.name); // برای ذخیره واقعی استفاده می‌شود
    }
  };

  const handleSave = () => {
    // اینجا می‌توانید ذخیره به دیتابیس یا سرور را انجام دهید
    console.log("نام:", name);
    console.log("ایمیل:", email);
    console.log("تصویر:", avatar);
    alert("مشخصات با موفقیت ذخیره شد!");
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded shadow-lg flex flex-col gap-3">
      
      {/* تصویر پروفایل */}
      <div className="flex flex-col items-center gap-2">
        <Image
          src={preview}
          alt="تصویر پروفایل"
          width={80}
          height={80}
          className="rounded-full mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-sm text-gray-200 w-full"
        />
      </div>

      {/* فرم ویرایش مشخصات */}
      <div className="flex flex-col gap-2">
        <label className="text-sm">نام کاربر:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gold-400 w-full"
        />

        <label className="text-sm">ایمیل:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          className="px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gold-400 w-full"
        />

        {/* دکمه ذخیره */}
        <button
          onClick={handleSave}
          className="mt-3 px-4 py-2 bg-gold-400 text-darkbg rounded hover:bg-yellow-500 transition-colors w-full"
        >
          ذخیره
        </button>
      </div>
    </div>
  );
}
