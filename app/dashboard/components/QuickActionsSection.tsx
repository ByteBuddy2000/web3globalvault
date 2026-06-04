import React from "react";

type QuickActionProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

export default function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center card hover:shadow-lg text-white p-3 rounded-xl min-w-[72px] sm:w-24 sm:h-24 transition"
    >
      {icon}
      <span className="font-medium text-sm mt-2 text-muted">{label}</span>
    </button>
  );
}