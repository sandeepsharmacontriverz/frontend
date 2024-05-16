"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@lib/router-events";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from '@hooks/useTranslation'
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";


export default function addUnitType() {
  useTitle("Add Unit Type");
  const [roleLoading] = useRole();
  const numInputs = 16;

  const [inputValues, setInputValues] = useState(new Array(numInputs).fill(""));
  const [error, setError] = useState(new Array(numInputs).fill(""))
  const [onBlurErrors, setOnBlurErrors] = useState(new Array(numInputs).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const handleInputChange = (index: any, value: any) => {
  //   const newInputValues = [...inputValues];
  //   newInputValues[index] = value;
  //   setInputValues(newInputValues);
  // };

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("unit/check-unit-type", {
      unitType: value
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
    if (value !== "") {
      alreadyExistName(name, value, index).then((error) => {
        newOnBlurErrors[index] = error;
        setOnBlurErrors(newOnBlurErrors);
      });
    } else {
      newOnBlurErrors[index] = "";
      setOnBlurErrors(newOnBlurErrors);
    }
  }

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

  const router = useRouter();
  const handleCancel = () => {
    setError(new Array(numInputs).fill(""));
    router.back();
  };

  const addData = async () => {
    setIsSubmitting(true);
    const url = "unit/unit-type-multiple"
    const inputData = inputValues.filter((inputValue) => {
      return inputValue != '' || null;
    });
    try {
      const response = await API.post(url, {
        "unitType": inputData
      })
      if (response.data.pass.length > 0) {
        const dataPassed = response.data.pass;
        const passedName = dataPassed.map((name: any) => name.data.unitType).join(', ')
        toasterSuccess(`Following unit type(s) have been added successfully: ${passedName} `)
      }
      if (response.data.fail.length > 0) {
        setIsSubmitting(false);
        const dataFailed = response.data.fail;
        const failedName = dataFailed.map((name: any) => name.data.unitType).join(', ')
        toasterError(`Following farm type(s) are skipped as they are already exist: ${failedName} `)
      }
      router.push('/master/unit/unit-type')
    }
    catch (error) {
      setIsSubmitting(false);
      console.log(error, "error")
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    let isError = false;
    const newError = new Array(numInputs).fill("");
    inputValues.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue);

      if (index === 0 && inputValue === '') {
        newError[index] = 'Unit type Name is required';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = inputValues.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() &&
            i !== index
        );
        if (isValueAlreadyEntered) {
          newError[index] = "Value already entered in another field.";
          isError = true;
        }
      }
    });
    // setError(newError);
    const mergedErrors = newError.map((error, index) => onBlurErrors[index] || error);
    setError(mergedErrors);

    if (isError) {
      return
    }
    const hasMergeErrors = onBlurErrors.some(error => error !== '');
    if (!hasMergeErrors) {
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
                <li className="active">
                  <Link href="/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Master</li>
                <li>Unit</li>
                <li>
                  <Link href="/master/unit/unit-type">
                    Unit Type
                  </Link>
                </li>
                <li>Add Unit Type</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <form onSubmit={handleSubmit}>
            <div className=" columns-4 mt-3 lg:columns-4 sm:columns-2" >
              {inputValues.map((value, index) => (
                <div key={index} className="mb-3 mx-3">
                  <input
                    key={index}
                    type="text"
                    placeholder={
                      index === 0 ? translations.unit.unitTypeName + "*" : translations.unit.unitTypeName
                    }
                    value={value}
                    className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                    onBlur={(e) => onBlurCheck(e, index)}
                    onChange={(e) => handleInputChange(index, e.target.value, e)}
                  />
                  {/* {error[index] !== "" && ( */}
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
    )
  }
}
