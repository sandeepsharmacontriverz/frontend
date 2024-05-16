"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "@lib/router-events";

interface InputFieldsProps {
  onSubmit: (formData: { [key: string]: string }) => void;
  placeholder: string;
  requiredFieldIndex: number;
  fieldName: string;
}

const InputFields: React.FC<InputFieldsProps> = ({
  onSubmit,
  placeholder,
  requiredFieldIndex,
  fieldName,
}) => {
  const fieldNames = Array.from(
    { length: 16 },
    (_, index) => `${fieldName}${index + 1}`
  );

  const initialFormData: { [key: string]: string } = {};
  fieldNames.forEach((fieldName) => {
    initialFormData[fieldName] = "";
  });

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(validationErrors);
    }
  };

  const router = useRouter();

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    router.back();
    // onCancel();
  };
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Required validation for the specified field index
    if (requiredFieldIndex >= 0 && requiredFieldIndex < fieldNames.length) {
      const requiredFieldName = fieldNames[requiredFieldIndex];
      if (!formData[requiredFieldName]) {
        errors[requiredFieldName] = `${placeholder} is required`;
      }
    }

    return errors;
  };


  return (
    <form onSubmit={handleSubmit}>
      <div className="columns-4 m-5">
        {fieldNames.map((fieldName, index) => (
          <div key={index} className="mb-5">
            <input
              type="text"
              id={fieldName}
              name={fieldName}
              value={formData[fieldName]}
              onChange={handleChange}
              placeholder={index === 0 ? placeholder + "*" : placeholder}
              className="border text-sm p-1 w-full"
            />
            {errors[fieldName] && (
              <span className="text-red-500 text-sm">{errors[fieldName]}</span>
            )}
          </div>
        ))}
      </div>

      <div className=" justify-between mt-4 mx-4 space-x-3 border-t border-b py-2 px-2">
        <button
          type="submit"
          className="bg-green-600 text-sm rounded text-white px-2 py-1.5 "
        >
          Submit
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-300 text-sm rounded text-black px-2 py-1.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default InputFields;
