"use client";

import React, { useState } from "react";
import { useRouter } from "@lib/router-events";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from "@hooks/useTranslation"
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";

export default function addLinenVariety() {
  useTitle("Add Linen variety");

  const [roleLoading] = useRole();

  const [inputValues, setInputValues] = useState({
    linenVariety: '',
    variety: ''
  });

  const [errors, setErrors] = useState({
    linenVariety: "",
    variety: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const router = useRouter();
  const handleCancel = () => {
    setErrors({
      linenVariety: "",
      variety: ""
    });
    router.back();
  };

  const addData = async () => {
    const url = "linen-variety"
    try {
      const response = await API.post(url, {
        "name": inputValues.linenVariety,
        "variety": inputValues.variety
      })
      if (response.success) {
        toasterSuccess(`Following linen variety list name have been added successfully: ${response.data.name} `)
        router.push('/master/linen-variety-list')
      }
      else {
        toasterError(response.error.code === 'ALREADY_EXITS' ? 'linen variety list name already exist' : response.error.code);
        router.push('/master/linen-variety-list')
      }

    }
    catch (error) {
      console.log(error, "error")
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();

    let isError = false;
    const newErrors = {
      linenVariety: "",
      variety: ""
    };
    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;

    if (inputValues.linenVariety.trim() === "") {
      newErrors.linenVariety = "Variety name is required";
      isError = true;
    } else if (!regex.test(inputValues.linenVariety.trim())) {
      newErrors.linenVariety = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }
    if (inputValues.variety.trim() === "") {
      newErrors.variety = "Variety is required";
      isError = true;
    } else if (!regex.test(inputValues.variety.trim())) {
      newErrors.variety = "Enter Only Alphabets, Digits, Space, (, ), - and _";
      isError = true;
    }

    setErrors(newErrors);

    if (!isError) {
      addData();
    }
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading...</div>;
  }

  if (!roleLoading) {
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
                  <Link href="/master/linen-variety-list">
                    Linen Variety
                  </Link>
                </li>
                <li>Add Linen Variety</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div className="flex flex-wrap gap-4 mt-5">
            <div>
              <input
                type="text"
                name="linenVariety"
                placeholder={translations.linenVarietyName + "*"}
                value={inputValues.linenVariety}
                className={`text-sm border rounded px-2 py-1 ${errors.linenVariety ? 'border-red-500' : 'border'}`}
                onChange={handleInputChange}
              />
              {errors.linenVariety && (
                <p className="text-red-500 text-sm">{errors.linenVariety}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="variety"
                placeholder={translations.variety + "*"}
                value={inputValues.variety}
                className={`text-sm border rounded px-2 py-1 ${errors.variety ? 'border-red-500' : 'border'}`}
                onChange={handleInputChange}
              />
              {errors.variety && (
                <p className="text-red-500 text-sm">{errors.variety}</p>
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
      </div>
    );
  }
}
