"use client";
import PageHeader from "@components/core/PageHeader";
import React, { useEffect, useState } from "react";
import { useRouter } from "@lib/router-events";
import useTranslations from "@hooks/useTranslation";
import { toasterSuccess, toasterError } from "@components/core/Toaster";

import User from "@lib/User";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
export default function Page() {
  const router = useRouter();
  useTitle("Add Country");

  const numInputs = 16;

  const [inputValues, setInputValues] = useState(new Array(numInputs).fill(""));
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(new Array(numInputs).fill(""));
  const [onBlurErrors, setOnBlurErrors] = useState(new Array(numInputs).fill(""));
  // const [alreadyExist, setAlreadyExist] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(true);

  // const handleInputChange = (index: any, value: any) => {
  //   const newInputValues = [...inputValues];
  //   newInputValues[index] = value;
  //   setInputValues(newInputValues);
  // };

  const handleInputChange = (
    index: number,
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    value = value.trim();
    const newInputValues = [...inputValues];
    newInputValues[index] = value
    setInputValues(newInputValues);
    // Check if the backspace key is pressed and the input value is empty
    const isBackspaceAndEmpty =
      (event.nativeEvent as InputEvent).inputType === "deleteContentBackward" &&
      value === "";

    // Check if the value is already entered in another field
    const isValueAlreadyEntered = newInputValues.some(
      (input, i) =>
        input.trim().toLowerCase() === value.trim().toLowerCase() && i !== index
    );

    if (isBackspaceAndEmpty || !isValueAlreadyEntered) {
      setError((prevError) => {
        const newError = [...prevError];
        newError[index] = "";
        return newError;
      });
    } else {
      setError((prevError) => {
        const newError = [...prevError];
        newError[index] = "Value already entered in another field.";
        return newError;
      });
    }
  };

  useEffect(() => {
    User.role();
  }, []);

  const handleCancel = () => {
    setIsError(false);
    router.back();
  };

  const alreadyExistName = async (name: string, value: string, index: number) => {
    setIsSubmitting(true);
    const res = await API.post("location/check-countries", {
      countryName: value
    });
    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      setIsSubmitting(false);
      return '';
    };
  }

  const onBlurCheck = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    const newOnBlurErrors: any = [...onBlurErrors];
    if (value !== "") { // Only make the API call if the value is non-empty
      alreadyExistName(name, value, index).then((error) => {
        newOnBlurErrors[index] = error;
        setOnBlurErrors(newOnBlurErrors);
      });
    } else {
      newOnBlurErrors[index] = "";
      setOnBlurErrors(newOnBlurErrors);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = "location/set-country";

    let hasError = false;
    const newError = new Array(numInputs).fill("");

    inputValues.forEach((inputValue, index) => {
      const regexAlphabets = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regexAlphabets.test(inputValue.trim());

      if (index === 0 && inputValue.trim() === "") {
        newError[index] = "Country Name is required.";
        hasError = true;
      } else if (!valid) {
        if (inputValue.trim() !== "") {
          newError[index] = "Accepts only Alphabets";
          hasError = true;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = inputValues.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() &&
            i !== index
        );
        if (isValueAlreadyEntered) {
          newError[index] = "Value already entered in another field.";
          hasError = true;
        }
      }
    });
    setError(newError);

    if (!hasError) {
      const inputData = inputValues.filter(
        (inputValue, index) => inputValue.trim() !== ""
      );

      const mergedErrors = newError.map((error, index) => onBlurErrors[index] || error);
      setError(mergedErrors);

      const hasMergeErrors = onBlurErrors.some(error => error !== '');
      if (!hasMergeErrors) {
        setIsSubmitting(true);
        try {
          const response = await API.post(url, {
            countryName: inputData,
          });

          if (response.success) {
            if (response.data.pass.length > 0) {
              const dataPassed = response.data.pass;
              const passedName = dataPassed
                .map((name: any) => name.data.county_name)
                .join(", ");
              toasterSuccess(
                `Following country/countries have been added successfully: ${passedName} `,
                response.data.id, 3000);
            }

            if (response.data.fail.length > 0) {
              // Handle failed data
              const dataFailed: any = response.data.fail;
              const failedName = dataFailed
                .map((name: any) => name.data.county_name)
                .join(", ");
              toasterError(
                `Following country/countries have been skipped as they already exist: ${failedName} `,
                response.data.id, 3000
              );
            } else {
              router.push("/master/location/country");
              setError(new Array(numInputs).fill(""));
            }
          }
        } catch (error) {
          setIsSubmitting(false);
          console.log(error, "error");
          setError(new Array(numInputs).fill("API request error"));
        }
      }
    }
  };

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
              <li>Location</li>
              <li>
                <Link href="/master/location/country">Country</Link>
              </li>
              <li>Add Country</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4">
        <form onSubmit={handleSubmit}>
          <div className=" columns-4 mt-3 lg:columns-4 sm:columns-2">
            {inputValues.map((value, index) => (
              <div key={index} className="mb-3 mx-3">
                <div>
                  <input
                    key={index}
                    type="text"
                    placeholder={
                      index === 0
                        ? translations.location.countryName + "*"
                        : translations.location.countryName
                    }
                    value={value}
                      className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}

                    onChange={(e) =>
                      handleInputChange(index, e.target.value, e)
                    }
                    onBlur={(e) => onBlurCheck(e, index)}
                  />
                </div>
                {/* {onBlurErrors[index] !== "" && ( */}
                <p className="text-red-500 text-sm">{onBlurErrors[index] !== "" ? onBlurErrors[index] : error[index]}</p>
                {/* )} */}
              </div>
            ))}
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
        </form>
      </div>
    </div>
  );
}
