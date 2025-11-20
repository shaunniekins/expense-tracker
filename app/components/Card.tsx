import React from "react";

export const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-xl border bg-card text-card-foreground shadow-sm bg-white ${className}`}
  >
    {children}
  </div>
);
