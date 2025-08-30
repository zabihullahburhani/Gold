"use client";
import React, { useEffect, useState } from "react";
import { fetchNotifications } from "../../services/notifications_api";
import { Card, CardHeader, CardContent } from "./ui/card";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications().then((d) => setNotifications(Array.isArray(d) ? d : []));
  }, []);

  return (
    <Card>
      <CardHeader>اعلان‌ها</CardHeader>
      <CardContent>
        {notifications.map((n, idx) => (
          <div key={idx} className="border-b py-1">{n.message}</div>
        ))}
      </CardContent>
    </Card>
  );
}
