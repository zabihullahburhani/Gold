// src/components/admin/Customers.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/services/api";

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  // دریافت لیست مشتریان
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers/");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // اضافه یا ویرایش مشتری
  const handleSave = async () => {
    try {
      if (formData.id) {
        // ویرایش
        await api.put(`/customers/${formData.id}`, formData);
      } else {
        // اضافه کردن
        await api.post("/customers/", formData);
      }
      setOpen(false);
      setFormData({});
      fetchCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
    }
  };

  // حذف مشتری
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  return (
    <Card className="p-4">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>مدیریت مشتریان</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({})}>➕ مشتری جدید</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formData.id ? "ویرایش مشتری" : "اضافه کردن مشتری"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="نام مشتری"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="شماره تماس"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                placeholder="آدرس"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Button onClick={handleSave}>💾 ذخیره</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>آی‌دی</TableHead>
                <TableHead>نام</TableHead>
                <TableHead>شماره تماس</TableHead>
                <TableHead>آدرس</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormData(customer);
                        setOpen(true);
                      }}
                    >
                      ✏️ ویرایش
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(customer.id)}
                    >
                      🗑 حذف
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
