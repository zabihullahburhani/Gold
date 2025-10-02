// path: frontend/src/components/widgets/GoldPriceWidget.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function GoldPriceWidget() {
  const router = useRouter();

  const handleClick = () => {
    // هنگام کلیک روی هر ویجت، کاربر به صفحه دلخواه هدایت می‌شود
    router.push("/"); // می‌توانید مسیر دلخواه را قرار دهید
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-4 space-y-6">
      {/* ویجت قیمت لحظه‌ای */}
      <div
        className="cursor-pointer"
        onClick={handleClick}
      >
        <iframe
          src="https://goldbroker.com/widget/live/XAU?currency=USD&height=320"
          scrolling="no"
          frameBorder="0"
          width="100%"
          height="320"
          style={{ border: 0, overflow: "hidden" }}
          title="Live Gold Price"
        ></iframe>
        <p className="text-sm mt-2 text-gray-400">
          Gold price by{" "}
          <a
            href="https://goldbroker.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            GoldBroker.com
          </a>
        </p>
      </div>

      {/* ویجت قیمت تاریخی */}
      <div
        className="cursor-pointer"
        onClick={handleClick}
      >
        <iframe
          src="https://goldbroker.com/widget/historical/XAU?height=500&currency=USD"
          scrolling="no"
          frameBorder="0"
          width="100%"
          height="500"
          style={{ border: 0, overflow: "hidden" }}
          title="Historical Gold Price"
        ></iframe>
        <p className="text-sm mt-2 text-gray-400">
          Historical gold price by{" "}
          <a
            href="https://goldbroker.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            GoldBroker.com
          </a>
        </p>
      </div>
    </div>
  );
}

