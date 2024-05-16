"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "@lib/router-events";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import User from "@lib/User";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import Link from "@components/core/nav-link";

interface cooperative {
  name: string;
  address: string;
  country: string;
  contact_person: string | null;
  mobile: string | null;
  emailId: string | null;
}

export default function addCountry() {
  useTitle("Add Co-operative");

  const router = useRouter();

  const [inputValues, setInputValues] = useState({
    name: "",
    address: "",
    country: "",
    contact_person: "",
    mobile: "",
    emailId: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    address: "",
    country: "",
    contact_person: "",
    mobile: "",
    emailId: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleCancel = () => {
    router.back();
  };

  const isInputEmpty = (inputValue: any) => {
    return inputValue.trim() === "";
  };

  const addData = async () => {
    const url = "cooperative";
    const inputData = Object.values(inputValues).filter(
      (value) => value !== "" && value !== null
    ); // Use Object.values
    try {
      const response = await API.post(url, {
        name: inputValues.name,
        address: inputValues.address,
        country: inputValues.country,
        contactPerson: inputValues.contact_person,
        mobile: inputValues.mobile,
        email: inputValues.emailId,
      });
      if (response.success) {
        toasterSuccess(
          `Following cooperative list name have been added successfully: ${response.data.name} `
        );
        router.push("/master/cooperative-list");
      } else {
        toasterError(
          response.error.code === "ALREADY_EXITS"
            ? "cooperative list name already exist"
            : response.error.code
        );
        router.push("/master/cooperative-list");
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    let isError = false;
    const newErrors = {
      name: "",
      address: "",
      country: "",
      contact_person: "",
      mobile: "",
      emailId: "",
    };
    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;

    if (isInputEmpty(inputValues.name.trim())) {
      newErrors.name = "Name is required";
      isError = true;
    } else if (!regex.test(inputValues.name.trim())) {
      newErrors.name = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (isInputEmpty(inputValues.address.trim())) {
      newErrors.address = "Address is required";
      isError = true;
    } else if (!regex.test(inputValues.address.trim())) {
      newErrors.address = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (isInputEmpty(inputValues.country.trim())) {
      newErrors.country = "Country is required";
      isError = true;
    } else if (!regex.test(inputValues.country.trim())) {
      newErrors.country = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (
      !isInputEmpty(inputValues.contact_person.trim()) &&
      !regex.test(inputValues.contact_person.trim())
    ) {
      newErrors.contact_person =
        "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (
      !isInputEmpty(inputValues.mobile.trim()) &&
      !regex.test(inputValues.mobile.trim())
    ) {
      newErrors.mobile = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    if (
      !isInputEmpty(inputValues.emailId.trim()) &&
      !regex.test(inputValues.emailId.trim())
    ) {
      newErrors.emailId = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    setErrors(newErrors);

    if (!isError) {
      addData();
    }
  };

  useEffect(() => {
    User.role();
  }, []);

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading...</div>;
  }

  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <Link href="/dashboard" className="active">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Master</li>
              <li>
                <Link href="/master/cooperative-list">Cooperative List</Link>
              </li>
              <li>Add Cooperative List</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4 flex flex-wrap gap-4 mt-5">
        <div>
          <input
            type="text"
            name="name"
            placeholder={translations.cooperativeName + "*"}
            value={inputValues.name}
            className={`text-center text-sm w-60 border rounded px-2 py-1 ${errors.name ? "border-red-500" : "border"
              }`}
            onChange={handleInputChange}
          />
          {errors.name && (
            <p className="text-red-500 w-60 text-sm">{errors.name}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="address"
            placeholder={translations.common.address + "*"}
            value={inputValues.address}
            className={`text-center text-sm border w-60 rounded px-2 py-1 ${errors.address ? "border-red-500" : "border"
              }`}
            onChange={handleInputChange}
          />
          {errors.address && (
            <p className="text-red-500 w-60 text-sm">{errors.address}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="country"
            placeholder={translations.common.country + "*"}
            value={inputValues.country}
            className={`text-center text-sm w-60 border rounded px-2 py-1 ${errors.country ? "border-red-500" : "border"
              }`}
            onChange={handleInputChange}
          />
          {errors.country && (
            <p className="text-red-500 w-60 text-sm">{errors.country}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="contact_person"
            placeholder={translations.common.contactPerson}
            value={inputValues.contact_person}
            className={`text-center text-sm border w-60 rounded px-2 py-1 ${errors.contact_person ? "border-red-500" : "border"
              }`}
            onChange={handleInputChange}
          />
          {errors.contact_person && (
            <p className="text-red-500 w-60 text-sm">{errors.contact_person}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            name="mobile"
            placeholder={translations.common.mobile}
            value={inputValues.mobile}
            className={`text-center text-sm border w-60 rounded px-2 py-1 ${errors.mobile ? "border-red-500" : "border"
              }`}
            onChange={handleInputChange}
          />
          {errors.mobile && (
            <p className="text-red-500 w-60 text-sm">{errors.mobile}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="emailId"
            placeholder={translations.common.emailId}
            value={inputValues.emailId}
            className={`text-center text-sm border w-60 rounded px-2 py-1 ${errors.emailId ? "border-red-500" : "border"
              }`}
            onChange={handleInputChange}
          />
          {errors.emailId && (
            <p className="text-red-500 w-60 text-sm">{errors.emailId}</p>
          )}
        </div>
      </div>

      <div className=" justify-between mt-4 mx-4 space-x-3 border-t border-b py-2 px-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-600 text-sm rounded text-white px-2 py-1.5 "
        >
          {translations.common.submit}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-300 text-sm rounded text-black px-2 py-1.5"
        >
          {translations.common.cancel}
        </button>
      </div>
    </div>
  );
}
