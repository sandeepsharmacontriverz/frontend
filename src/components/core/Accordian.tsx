import React, { useState } from "react";
import { PiPlusBold } from "react-icons/pi";
import { PiMinusBold } from "react-icons/pi";

const Accordion = ({ title, content, firstSign, secondSign }: any) => {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="w-full rounded mt-8">
      <div
        className={`flex justify-between items-center py-2 px-3 bg-blue-950 ${isActive
            ? "transition-all duration-1000 ease-in"
            : "transition-all duration-1000 ease-out"
          } cursor-pointer`}
        onClick={() => setIsActive(!isActive)}
      >
        <div className="text-white">{title}</div>
        <div className="text-white text-xl">
          {isActive
            ? firstSign || <PiMinusBold color="white" />
            : secondSign || <PiPlusBold color="white" />}
        </div>
      </div>
      <div
        className={`p-3 ${isActive
            ? "transition-all duration-1000 ease-in opacity-100 max-h-screen"
            : "transition-all duration-1000 ease-out opacity-0 max-h-0"
          } overflow-auto`}
      >
        {content}
      </div>
    </div>
  );
};

export default Accordion;
