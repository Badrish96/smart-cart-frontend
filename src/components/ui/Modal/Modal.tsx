"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        className={[
          "relative w-full card-glass rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] custom-form-scroll",
          sizeClasses[size],
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-primary transition-colors text-xl leading-none cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        )}

        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-primary transition-colors text-xl"
            aria-label="Close modal"
          >
            ✕
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
