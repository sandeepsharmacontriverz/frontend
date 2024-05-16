"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "@lib/router-events";
import useTranslations from '@hooks/useTranslation'
import { toasterSuccess, toasterError } from '@components/core/Toaster'

import User from "@lib/User";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
export default function Page() {
  const router = useRouter();
  useTitle("Add Crop Name")
  const numInputs = 16;

  const [inputValues, setInputValues] = useState(new Array(numInputs).fill(""));
  // const [inputError, setInputError] = useState({ isError: false, message: "", inputIndex: -1 });
  const [error, setError] = useState(new Array(numInputs).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onBlurErrors, setOnBlurErrors] = useState(new Array(16).fill(""));

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
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
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
      setError((prevError: any) => {
        const newError = [...prevError];
        newError[index] = "";
        return newError;
      });
    } else {
      setError((prevError: any) => {
        const newError = [...prevError];
        newError[index] = "Value already entered in another field.";
        return newError;
      });
    }
  };

  const handleCancel = () => {
    router.back();
  };
  // const isInputEmpty = (inputValue: any) => {
  //   return inputValue.trim() === "";
  // };
  // const isCropNamesValid = (inputValues: string[]): number => {
  //   const regex = /^[\(\)_\-a-zA-Z0-9\s]+$/;
  //   for (const [i, value] of Object.entries(inputValues)) {
  //     if (value && !regex.test(value)) {
  //       return Number(i);
  //       // } else if (value.trim() !== "" && regex.test(value)) {
  //       //   const isValueAlreadyEntered = inputValues.some(
  //       //     (input, index) =>
  //       //       input.trim().toLowerCase() === value.trim().toLowerCase() &&
  //       //       index !== i
  //       //   );
  //       //   if (isValueAlreadyEntered) {
  //       //     newError[i] = "Value already entered in another field.";
  //       //   }
  //     }
  //   }
  //   return -1;
  // }

  const addData = async () => {
    const url = "crop/crop-name-multiple"
    const inputData = inputValues.filter((inputValue) => {
      return inputValue != '' || null;
    });
    try {
      setIsSubmitting(true);
      const response = await API.post(url, {
        "cropsName": inputData
      })
      if (response.data.pass.length > 0) {
        const dataPassed = response.data.pass;
        const passedName = dataPassed.map((name: any) => name.data.crop_name).join(', ')
        toasterSuccess(`Following crop(s) have been added successfully: ${passedName}`, response.data.id, 3000)
      }
      if (response.data.fail.length > 0) {
        const dataFailed = response.data.fail;
        const failedName = dataFailed.map((name: any) => name.data.crop_name).join(', ')
        toasterError(`Following crop(s) are skipped as they are already exist: ${failedName}`, response.data.id, 3000)
      }
      router.push('/master/crop/crop-name')
    }
    catch (error) {
      setIsSubmitting(false);
      console.log(error, "error")
    }
  }

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("crop/check-crops", {
      cropName: value
    });
    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
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

  const handleSubmit = (e: any) => {
    e.preventDefault();
    let hasError = false;
    const newError = new Array(numInputs).fill("");

    inputValues.forEach((inputValue, index) => {
      const regexAlphabets = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regexAlphabets.test(inputValue.trim());

      if (index === 0 && inputValue.trim() === "") {
        newError[index] = "Crop Name is required.";
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
        (inputValue) => inputValue.trim() !== ""
      );

      const mergedErrors = newError.map((error, index) => onBlurErrors[index] || error);
      setError(mergedErrors);

      const hasMergeErrors = onBlurErrors.some(error => error !== '');
      if (!hasMergeErrors) {
        addData();
      }
    }
  };

  useEffect(() => {
    User.role()
  }, [])

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }

  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li className="active">
                <Link href="/dashboard">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Master</li>
              <li>Crop</li>
              <li>
                <Link href="/master/crop/crop-name">
                  Crop Name
                </Link>
              </li>
              <li>Add Crop Name</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4">
        <form onSubmit={handleSubmit}>
          <div className="columns lg:columns-4 md:columns-2 sm:columns-1 mt-3 ">
            {inputValues.map((value, index) => (
              <div key={index} className="mb-3">

                <input
                  type="text"
                  placeholder={index === 0 ? translations.crop.cropName + "*" : translations.crop.cropName}
                  value={value}
                  className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                  onChange={(e) => handleInputChange(index, e.target.value, e)}
                  onBlur={(e) => onBlurCheck(e, index)}
                />

                {/* {inputError.isError && index === inputError.inputIndex && ( */}
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