// UserProfile.tsx

"use client";
import React, { useEffect, useState } from "react";
import {
  fetchUsers,
  createUser,
  deleteUser
} from "../../services/user_profiles_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface User {
  user_id: number;
  name: string;
  email: string;
}

export default function UserProfiles() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchUsers().then((d) => setUsers(Array.isArray(d) ? d : []));
  }, []);

  const handleAdd = async () => {
    await createUser(newUser);
    setNewUser({ name: "", email: "" });
    fetchUsers().then((d) => setUsers(d));
  };

  return (
    <Card>
      <CardHeader>پروفایل کاربران</CardHeader>
      <CardContent>
        <input
          type="text"
          placeholder="نام"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="border p-1 text-black"
        />
        <input
          type="email"
          placeholder="ایمیل"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="border p-1 text-black"
        />
        <button onClick={handleAdd} className="bg-yellow-500 px-2 rounded">افزودن</button>

        <ul className="mt-4">
          {users.map((u) => (
            <li key={u.user_id}>
              {u.name} - {u.email}{" "}
              <button onClick={() => deleteUser(u.user_id)} className="text-red-500">حذف</button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
