import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  options: Option[];
  value: string;
  onChange: (id: string, selectedValue: string) => void;
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder,
  isRequired = false,
  error,
}) => {
  return (
    <>
      <select
        value={value}
        onChange={(e) => {
          let val: string = e.target.value;
          onChange(id, val);
        }}
        className="border mb-5 p-1 text-sm w-full"
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
        {error && <span className="text-red-500 text-sm">{error}</span>}
    </>
  );
};

export default Select;
