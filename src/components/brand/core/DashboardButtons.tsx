"use client";
import React, { useState } from "react";
import Link from "@components/core/nav-link";

export default function DashboardButtons() {
  const [selectedButton, setSelectedButton] = useState(null);

  const buttons = ["Organic Cotton Overview", "Traceability by Product"];

  const handleClick = (index: any) => {
    setSelectedButton(index);
  };

  return (
    <div className="flex flex-wrap border-y-2 py-3 gap-2">
      {buttons.map((buttonText, index) => (
        <Link
          key={index}
          href={`/brand/${encodeURIComponent(
            buttonText.toLowerCase().replace(/\s/g, "-")
          )}`}
        // legacyBehavior
        >
          <a
            className={`text-md rounded-md py-2 px-4 ${selectedButton === index
              ? "bg-white text-black border-4 border-[#146ca7]"
              : "bg-[#146ca7] text-white"
              } hover:text-black`}
            onClick={() => handleClick(index)}
          >
            {buttonText}
          </a>
        </Link>
      ))}
    </div>
  );
}
