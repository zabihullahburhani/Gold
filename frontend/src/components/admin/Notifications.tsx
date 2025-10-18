"use client";
import React, { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
} from "../../services/notifications_api";
import { Card, CardHeader, CardContent } from "./ui/card";
import moment from "moment-jalaali"; // برای تبدیل به تاریخ جلالی

moment.loadPersian(); // بارگذاری پشتیبانی از تاریخ جلالی

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10; // تعداد نوتیفیکیشن‌ها در هر صفحه
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const loadData = async () => {
    if (!token) return;
    try {
      const data = await fetchNotifications(token);
      setNotifications(Array.isArray(data) ? data : []);
      setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / ITEMS_PER_PAGE));
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

  // محاسبه نوتیفیکیشن‌های صفحه فعلی
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <Card className="bg-black text-yellow-400 border border-yellow-500">
      <CardHeader>📢 نوتیفیکشن‌ها</CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p>هیچ نوتیفیکشنی وجود ندارد.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {paginatedNotifications.map((n) => (
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
                      {moment(n.created_at, "YYYY-MM-DDTHH:mm:ss")
                        .locale("fa")
                        .format("jYYYY/jMM/jDD - HH:mm")}
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
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    currentPage === 1
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  ◀️ قبلی
                </button>
                <span className="text-gray-300 text-sm">
                  صفحه {currentPage} از {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    currentPage === totalPages
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  بعدی ▶️
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}