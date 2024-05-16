"use client"
import React, { useState } from 'react';
import Link from '@components/core/nav-link';

export default function DashboardButtons() {
  const [selectedButton, setSelectedButton] = useState(null);

  const buttons = [
    'Organic Cotton Overview',
    'Traceability by Product',
    'Production Update',
    'Transaction List',
    'PSCP Procurement and Sell Live Tracker',
  ];

  const handleClick = (index: any) => {
    setSelectedButton(index);
  };

  return (
    <>
      <div>
        {buttons.map((buttonText, index) => (
          <Link
            key={index}
            href={`/brand/${encodeURIComponent(buttonText.toLowerCase().replace(/\s/g, '-'))}`}
          // legacyBehavior
          >
            <a
              className={`text-lg rounded-md p-4 ml-10 ${selectedButton === index
                ? 'bg-white text-black border-4 border-[#146ca7]'
                : 'bg-[#146ca7] text-white'
                } hover:text-black`}
              onClick={() => handleClick(index)}

            >
              {buttonText}
            </a>
          </Link>
        ))}
      </div>

      <div className="mt-5">
        <Link href="/brand/cotton-quality-parameter"
        // legacyBehavior
        >
          <a>
            <button
              className={`w-full text-lg rounded-md p-3 hover:text-black ${selectedButton === buttons.length ? 'bg-white border-4 border-[#146ca7]' : 'bg-[#146ca7] text-white '
                }`}
              onClick={() => handleClick(buttons.length)}
            >
              Cotton Quality Parameter
            </button>
          </a>
        </Link>
      </div>

    </>
  );
}

