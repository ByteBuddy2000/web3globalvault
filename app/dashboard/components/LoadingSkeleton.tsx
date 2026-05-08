import React from "react";

export default function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded ${className}`}>
      <div className="opacity-0">&nbsp;</div>
    </div>
  );
}
