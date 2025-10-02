"use client";
import React, { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
} from "../../services/notifications_api";
import { Card, CardHeader, CardContent } from "./ui/card";

interface Notification {
  notification_id: number;
  employee_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const loadData = async () => {
    if (!token) return;
    try {
      const data = await fetchNotifications(token);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRead = async (id: number) => {
    if (!token) return;
    await markNotificationRead(id, token);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    await deleteNotification(id, token);
    loadData();
  };

  return (
    <Card className="bg-black text-yellow-400 border border-yellow-500">
      <CardHeader>📢 نوتیفیکشن‌ها</CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p>هیچ نوتیفیکشنی وجود ندارد.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li
                key={n.notification_id}
                className={`p-3 rounded-lg flex justify-between items-center ${
                  n.is_read ? "bg-gray-800" : "bg-gray-700 font-bold"
                }`}
              >
                <div>
                  <p>📌 {n.title}</p>
                  <p className="text-sm text-gray-400">{n.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!n.is_read && (
                    <button
                      onClick={() => handleRead(n.notification_id)}
                      className="bg-green-500 text-black px-2 py-1 rounded"
                    >
                      خواندن
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.notification_id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
