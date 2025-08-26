"use client";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave?: () => void;
}

export default function Modal({ isOpen, title, children, onClose, onSave }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-6 shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
            لغو
          </button>
          {onSave && (
            <button onClick={onSave} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              ذخیره
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
