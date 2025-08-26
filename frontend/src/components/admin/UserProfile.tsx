"use client";
import { useState } from "react";

export default function UserProfile() {
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-bold">🙍‍♂️ پروفایل کاربر</h2>
      {profilePic ? (
        <img
          src={profilePic}
          alt="User Profile"
          className="w-24 h-24 rounded-full border-2 border-yellow-500"
        />
      ) : (
        <div className="w-24 h-24 rounded-full border-2 border-gray-400 flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleUpload} />
    </div>
  );
}