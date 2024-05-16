"use client";
import React, { useState, useEffect } from "react";

interface MultiSelectDropdownProps {
  options: string[];
  name: string;
  initiallySelected?: any;
  onChange: (selectedItems: string[], name: string) => void;
  disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  onChange,
  name,
  initiallySelected,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: string) => {
    const updatedItems = selectedItems.includes(item)
      ? selectedItems.filter((i) => i !== item)
      : [...selectedItems, item];

    setSelectedItems(updatedItems);
    onChange(updatedItems, name);
  };

  useEffect(() => {
    if (initiallySelected) {
      setSelectedItems(initiallySelected);
    }
  }, [initiallySelected]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdownElement = document.getElementById("multi-select-dropdown");

      if (!dropdownElement?.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    // <div className="relative inline-block w-full" id="multi-select-dropdown">
    <div
      className={`relative inline-block w-full ${disabled ? "pointer-events-none opacity-50" : ""
        }`}
      id="multi-select-dropdown"
    >
      <div
        className={`w-100 shadow-none h-auto rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom gap-2 flex flex-wrap ${disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        // className="w-100 shadow-none h-auto rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom gap-2 flex flex-wrap"
        onClick={!disabled ? toggleDropdown : undefined}
      >
        {selectedItems.length > 0 ? (
          selectedItems.map((item: any, index) => (
            <div
              key={item + "-" + index}
              className="bg-blue-800 z-1 text-sm text-white px-2 py-1 rounded-md flex items-center"
            >
              {item}
              <button
                className="ml-2 font-bold focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(item);
                }}
              >
                x
              </button>
            </div>
          ))
        ) : (
          <span className="text-gray-500 flex items-center z-0 text-sm py-1">
            Select
          </span>
        )}
      </div>
      {isOpen && (
        // <div className="absolute z-20 text-sm w-full overflow-y-auto max-h-36 border rounded-md bg-white mt-1">
        <div
          className={`absolute z-20 text-sm w-full overflow-y-auto max-h-36 border rounded-md bg-white mt-1 ${disabled ? "pointer-events-none" : ""
            }`}
        >
          {options?.map((item: any, index) => (
            <div
              key={item + "-" + index}
              onClick={() => {
                handleItemClick(item);
                toggleDropdown();
              }}
              className={`cursor-pointer p-1.5 hover:bg-blue-800 hover:text-white ${selectedItems.includes(item)
                ? "bg-gray-400 text-sm text-white hover:bg-gray-400"
                : initiallySelected?.length > 0 &&
                  initiallySelected.includes("All")
                  ? "bg-gray-400 text-sm text-white hover:bg-gray-400"
                  : ""
                }`}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
