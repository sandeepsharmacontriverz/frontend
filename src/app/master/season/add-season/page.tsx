"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from "@hooks/useTranslation"
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";

export default function Page() {
  const router = useRouter();
  useTitle("Add Season");
  const [roleLoading] = useRole();
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [errorCode, setErrorCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    from: null,
    to: null,
  });
  const [error, setError] = useState<any>({
    name: "",
    from: "",
    to: "",
  });

  const addData = async () => {
    if (formData.name && formData.from && formData.to) {
      const url = "season";
      try {
        const response = await API.post(url, formData);
        if (response.success) {
          toasterSuccess(
            `Following season(s) have been added successfully: ${response.data.name} `
          );
          router.back();
        } else {
          toasterError(response.error.code);
          setErrorCode(response.error.code);
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    let isError = false;
    const regex: any = /^[0-9\-]+$/;
    const valid = regex.test(formData.name);
    if (!formData.name || !valid) {
      setError((prevError: any) => ({
        ...prevError,
        name: !formData.name ? "Season Name is required" : "Enter Only Digits and hyphen(-)",
      }));
      isError = true;
    }
    if (formData.from === null) {
      setError((prevError: any) => ({
        ...prevError,
        from: "From date is required",
      }));
      isError = true;
    } else {
      setError((prevError: any) => ({
        ...prevError,
        from: "",
      }));
    }
    if (formData.to === null) {
      setError((prevError: any) => ({
        ...prevError,
        to: "To date is required",
      }));
      isError = true;
    } else {
      setError((prevError: any) => ({
        ...prevError,
        to: "",
      }));
    }
    if (from && to && from > to) {
      alert("From year cannot be greater than To year.");
      isError = true;
    }

    if (!isError) {
      const hasMergeErrors = Object.values(error).some((error: any) => error !== '');
      if (!hasMergeErrors) {
        setIsSubmitting(true);
        addData();
      }
    }
  };
  const handleCancel = () => {
    window.history.back();
  };
  const handleFrom = (date: Date | null) => {
    if (date) {
      let d = new Date(date);
      d.setHours(d.getHours() + 5);
      d.setMinutes(d.getMinutes() + 30);
      const newDate: any = d.toISOString();
      setFrom(date);
      setFormData((prevFormData) => ({
        ...prevFormData,
        from: newDate,
      }));
    } else {
      setFrom(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        from: null,
      }));
    }
  };

  const handleEndDate = (date: Date | null) => {
    if (date) {
      let d = new Date(date);
      d.setHours(d.getHours() + 5);
      d.setMinutes(d.getMinutes() + 30);
      const newDate: any = d.toISOString();
      setTo(date);
      setFormData((prevFormData) => ({
        ...prevFormData,
        to: newDate,
      }));
    } else {
      setTo(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        to: null,
      }));
    }
  };

  const alreadyExistName = async (value: string) => {
    const res = await API.post("season/check-seasons", {
      name: value
    });
    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
  }

  const onBlurCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value !== "") { // Only make the API call if the value is non-empty
      alreadyExistName(value).then((error) => {
        setError((prevError: any) => ({
          ...prevError,
          name: error
        }));
      });
    } else {
      setError((prevError: any) => ({
        ...prevError,
        name: "",
      }));
    }
  }

  const handleSeasonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      name: value,
    }));
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }

  if (!roleLoading) {
    return (
      <>
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
                    <Link href="/master/season">
                      Season
                    </Link>
                  </li>
                  <li>Add Season</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4">
            <div className="flex">
              <div>
                <input
                  type="text"
                  className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error !== "" ? 'border-red-500' : 'border'}`}
                  placeholder={translations.seasonName + "*"}
                  value={formData.name}
                  onChange={handleSeasonNameChange}
                  onBlur={onBlurCheck}
                />

                {error.name ? (
                  <p className="text-red-500 text-sm mt-1">{error.name}</p>
                ) : (
                  errorCode && (
                    <p className="text-red-500 text-sm mt-1">{errorCode}</p>
                  )
                )}
              </div>
              <div>
                <DatePicker
                  selected={from}
                  selectsStart
                  startDate={from}
                  endDate={to}
                  onChange={handleFrom}
                  showYearDropdown
                  placeholderText={translations.common.from + "*"}
                  className={`w-100 shadow-none h-11  ml-8 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error!== "" ? 'border-red-500' : 'border'}`}
                  />
                {error.from && (
                  <p className="text-red-500 ml-5 text-sm mt-1">{error.from}</p>
                )}
              </div>
              <div>
                <DatePicker
                  selected={to}
                  selectsEnd
                  startDate={from}
                  endDate={to}
                  minDate={from}
                  onChange={handleEndDate}
                  showYearDropdown
                  placeholderText={translations.common.to + "*"}
                  className={`w-100 shadow-none h-11 ml-16 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error !== "" ? 'border-red-500' : 'border'}`}
                  />
                {error.to && (
                  <p className="text-red-500 ml-5 text-sm mt-1">{error.to}</p>
                )}
              </div>
            </div>

            <div className=" justify-between mt-4 mx-4 space-x-3 border-t border-b py-2 px-2">
            <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                            <button
                                className="btn-purple mr-2"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={
                                    isSubmitting
                                        ? { cursor: "not-allowed" }
                                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                                }
                            >
                                {translations.common.submit}
                            </button>
                            <button
                                type="button"
                                className="btn-outline-purple"
                                onClick={handleCancel}

                            >
                                {translations.common.cancel}
                            </button>
                        </div>
          </div>
          </div>
        </div>
      </>
    );
  }
}
