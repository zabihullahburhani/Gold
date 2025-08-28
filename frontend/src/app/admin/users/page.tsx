// frontend/src/app/admin/users/page.tsx

"use client";

import { Card, CardHeader, CardContent } from "../../../components/admin/ui/card";
import { useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([
    { id: 1, name: "Ahmad", email: "ahmad@example.com", role: "user" },
    { id: 2, name: "Sara", email: "sara@example.com", role: "admin" },
  ]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">مدیریت یوزرها</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>{user.name}</CardHeader>
            <CardContent>
              <p>ایمیل: {user.email}</p>
              <p>نقش: {user.role}</p>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 rounded-lg bg-blue-500 text-white">
                  ویرایش
                </button>
                <button className="px-3 py-1 rounded-lg bg-red-500 text-white">
                  حذف
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
