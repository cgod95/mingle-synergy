import React from "react";

export default function Avatar({
  name,
  img,
  size = 48,
  className = "",
}: {
  name: string;
  img?: string;
  size?: number;
  className?: string;
}) {
  const initials = name.split(" ").map(p => p[0]).join("").slice(0,2).toUpperCase();
  return img ? (
    <img
      src={img}
      alt={name}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className={`grid place-items-center rounded-full bg-indigo-100 text-indigo-700 font-semibold ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
