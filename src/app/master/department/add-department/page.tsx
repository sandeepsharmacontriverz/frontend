"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "@lib/router-events";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from '@hooks/useTranslation'
import User from "@lib/User";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";

export default function addFarmItem() {
  const numInputs = 16;
  useTitle("Add Department");
  const [roleLoading] = useRole();
  const [inputValues, setInputValues] = useState(new Array(numInputs).fill(""));
  const [error, setError] = useState(new Array(numInputs).fill(""));
  const [onBlurErrors, setOnBlurErrors] = useState(new Array(numInputs).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);


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

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("department/check-departments", {
      deptName: value
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

  const router = useRouter();
  const handleCancel = () => {
    setError(new Array(numInputs).fill(""));
    router.back();
  };

  const addData = async () => {
    const inputData = inputValues.filter((inputValue) => {
      return inputValue != '' || null;
    });

    const url = "department/multiple"
    try {
      const response = await API.post(url, {
        "deptName": inputData
      })
      if (response.data.pass.length > 0) {
        const dataPassed = response.data.pass;
        const passedName = dataPassed.map((name: any) => name.data.dept_name).join(', ')
        toasterSuccess(`Following department(s) have been added successfully: ${passedName} `)
      }
      if (response.data.fail.length > 0) {
        setIsSubmitting(false);
        const dataFailed = response.data.fail;
        const failedName = dataFailed.map((name: any) => name.data.dept_name).join(', ')
        toasterError(`Following department(s) are skipped as they are already exist: ${failedName} `)
      }
      router.push('/master/department')
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
        newError[index] = 'Department Name is required';
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
    setError(newError);

    if (!isError) {
      const inputData = inputValues.filter(
        (inputValue) => inputValue.trim() !== ""
      );

      const mergedErrors = newError.map((error, index) => onBlurErrors[index] || error);
      setError(mergedErrors);

      const hasMergeErrors = onBlurErrors.some(error => error !== '');
      if (!hasMergeErrors) {
        setIsSubmitting(true);
        addData();
      }
    };
  }
  useEffect(() => {
    User.role()
  }, [])

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading...</div>;
  }

  if (!roleLoading) {
    return (
      <div >
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
                  <Link href="/master/department">
                    Department
                  </Link>
                </li>
                <li>Add Department</li>
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
                      index === 0 ? translations.department + "*" : translations.department
                    }
                    value={value}
                    className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                    onChange={(e) => handleInputChange(index, e.target.value, e)}
                    onBlur={(e) => onBlurCheck(e, index)}
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
