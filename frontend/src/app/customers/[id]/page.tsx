"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCustomer } from "@/services/customers_api";

export default function CustomerProfile() {
  const params = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!params?.id || !token) return;
    getCustomer(Number(params.id), token).then(setCustomer);
  }, [params, token]);

  if (!customer) return <p>در حال بارگیری...</p>;

  return (
    <div className="p-4 text-white">
      <h1 className="text-xl font-bold">پروفایل مشتری</h1>
      <p>نام: {customer.full_name}</p>
      <p>شماره تماس: {customer.phone}</p>
      <p>آدرس: {customer.address}</p>
    </div>
  );
}
