// frontend/src/components/admin/Employees.tsx

// Component for listing, editing, and deleting employees.

// Integrated with updated API paths and added loading state.

// Created by: Professor Zabihullah Burhani

// ICT and AI and Robotics Specialist

// Phone: 0705002913, Email: zabihullahburhani@gmail.com

// Address: Takhar University, Computer Science Faculty.



"use client";



import { useState, useEffect } from "react";

import CreateUser from "./CreateUser";

import { Card, CardHeader, CardContent } from "./ui/card";

import { fetchEmployees as apiFetchEmployees, deleteEmployee as apiDeleteEmployee } from "../../services/api";



interface Employee {

  employee_id: number;

  full_name: string;

  role: string;

  phone?: string;

  username: string;

  profile_pic?: string;

}



export default function Employees() {

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [showCreate, setShowCreate] = useState(false);

  const [loading, setLoading] = useState(true); // Added loading state



  const fetchEmployeesList = async () => {

    setLoading(true);

    try {

      const { ok, data } = await apiFetchEmployees();

      if (ok) setEmployees(data);

    } catch (error) {

      alert("❌ خطا در بارگیری کارمندان");

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchEmployeesList();

  }, []);



  const handleDelete = async (id: number) => {

    if (!confirm("آیا مطمئن هستید می‌خواهید حذف کنید؟")) return;

    try {

      const { ok } = await apiDeleteEmployee(id);

      if (ok) {

        setEmployees(employees.filter((e) => e.employee_id !== id));

      } else {

        alert("❌ خطا در حذف کارمند");

      }

    } catch (error) {

      alert("❌ خطا در حذف کارمند");

    }

  };



  const handleEdit = (employee: Employee) => {

    setEditingEmployee(employee);

  setShowCreate(true);

  };



  const handleCancelEdit = () => {

    setEditingEmployee(null);

  setShowCreate(false);

  };



  return (

    <div className="p-6 space-y-4">

      <h1 className="text-2xl font-bold">👨‍💼 مدیریت کارمندان</h1>



      <button

        onClick={() => {

          setShowCreate(!showCreate);

          setEditingEmployee(null);

        }}

        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"

      >

        {showCreate ? "❌ بستن فرم" : "➕ افزودن کارمند"}

      </button>



      {showCreate && (

        <CreateUser

          employee={editingEmployee || undefined}

          onSuccess={() => {

            setShowCreate(false);

            fetchEmployeesList();

          }}

          onCancel={editingEmployee ? handleCancelEdit : undefined}

        />

      )}



      {loading ? (

        <p>در حال بارگیری...</p>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {employees.map((emp) => (

            <Card key={emp.employee_id}>

              <CardHeader>{emp.full_name}</CardHeader>

              <CardContent>

                {emp.profile_pic && (

                  <img src={emp.profile_pic} alt="Profile" className="w-16 h-16 rounded-full mb-2" />

                )}

                <p>نام کاربری: {emp.username}</p>

                <p>سمت: {emp.role}</p>

                <p>تلفن: {emp.phone || "نامشخص"}</p>

                <div className="flex gap-2 mt-3">

                  <button

                    onClick={() => handleEdit(emp)}

                    className="px-3 py-1 rounded-lg bg-blue-500 text-white"

                  >

                    ویرایش

                  </button>

                  <button

                    onClick={() => handleDelete(emp.employee_id)}

                    className="px-3 py-1 rounded-lg bg-red-500 text-white"

                  >

                    حذف

                  </button>

                </div>

              </CardContent>

            </Card>

          ))}

        </div>

      )}

   </div>

 );

}