// frontend/src/components/admin/ui/card.tsx
// Reusable Card components for UI consistency.
// No changes needed.
// Created by: Professor Zabihullah Burhani
// ICT and AI and Robotics Specialist
// Phone: 0705002913, Email: zabihullahburhani@gmail.com
// Address: Takhar University, Computer Science Faculty.

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={`rounded-2xl shadow-md border p-4 bg-white ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 font-bold text-lg">{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}