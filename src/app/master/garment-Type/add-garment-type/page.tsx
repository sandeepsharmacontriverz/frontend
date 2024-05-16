"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "@lib/router-events";
import useTranslations from '@hooks/useTranslation'
import { toasterSuccess, toasterError } from '@components/core/Toaster'

import User from "@lib/User";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import NavLink from "@components/core/nav-link";
export default function Page() {
    const router = useRouter();
    useTitle("Add Garment Type")
    const numInputs = 16;

    const [inputValues, setInputValues] = useState(new Array(numInputs).fill(""));
    // const [inputError, setInputError] = useState({ isError: false, message: "", inputIndex: -1 });
    const [error, setError] = useState(new Array(numInputs).fill(""));
    const [onBlurErrors, setOnBlurErrors] = useState(new Array(numInputs).fill(""));
    const [isSubmitting, setIsSubmitting] = useState(false);

    // const handleInputChange = (index: any, value: any) => {
    //     const newInputValues = [...inputValues];
    //     newInputValues[index] = value;
    //     setInputValues(newInputValues);
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
        const res = await API.post("garment-type/check-garment-types", {
            name: value
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

    const handleCancel = () => {
        setError(new Array(numInputs).fill(""));
        router.back();
    };

    const addData = async () => {
        const url = "garment-type/multiple";
        const inputData = inputValues.filter(inputValue => inputValue !== '' && inputValue !== null);

        const formattedData = inputData

        try {
            setIsSubmitting(true);
            const response = await API.post(url, {
                "garmentTypes": formattedData
            });

            if (response.data.pass.length > 0) {
                const dataPassed = response.data.pass;
                const passedName = dataPassed.map((name: any) => name.data.name).join(', ');
                toasterSuccess(`Following Garment Type(s) have been added successfully: ${passedName}`);
            }

            if (response.data.fail.length > 0) {
                setIsSubmitting(true);
                const dataFailed = response.data.fail;
                const failedName = dataFailed.map((name: any) => name.data.name).join(', ');
                toasterError(`Following Garment Type(s) are skipped as they already exist: ${failedName}`);
            }

            router.push('/master/garment-Type');
        } catch (error) {
            setIsSubmitting(true);
            console.log(error, "error");
        }
    };


    const handleSubmit = (e: any) => {
        e.preventDefault();
        // if (isInputEmpty(inputValues[0])) {
        //     setInputError({ isError: true, message: "Garment Type is Required.", inputIndex: 0 });
        // } else {
        //     const notValidIndex = isCropNamesValid(inputValues);
        //     if (notValidIndex > -1) {
        //         setInputError({ isError: true, message: "Only letters, digits, white space, (, ), _ and - allowed.", inputIndex: notValidIndex });
        //     } else {
        //         setInputError({ isError: false, message: "", inputIndex: -1 });
        //         addData();
        //     }
        // }
        let hasError = false;
        const newError = new Array(numInputs).fill("");
        inputValues.forEach((inputValue, index) => {
            const regexAlphabets = /^[\(\)_\-a-zA-Z0-9\s]+$/;
            const valid = regexAlphabets.test(inputValue.trim());

            if (index === 0 && inputValue.trim() === "") {
                newError[index] = "Garment Type is Required.";
                hasError = true;
            } else if (!valid) {
                if (inputValue.trim() !== "") {
                    newError[index] = "Only letters, digits, white space, (, ), _ and - allowed.";
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
                                <NavLink href="/dashboard">
                                    <span className="icon-home"></span>
                                </NavLink>
                            </li>
                            <li>Master</li>
                            <li>
                                <NavLink href="/master/garment-Type">
                                    Garment Type
                                </NavLink>
                            </li>
                            <li>Add Garment Type</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div >
                <form onSubmit={handleSubmit}>
                    <div className="columns lg:columns-4 md:columns-2 sm:columns-1 mt-3 ">
                        {inputValues.map((value, index) => (
                            <div key={index} className="mb-3">

                                <input
                                    type="text"
                                    placeholder={index === 0 ? "Garment Type" + "*" : "Garment Type"}
                                    value={value}
                                    className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                                    onChange={(e) =>
                                        handleInputChange(index, e.target.value, e)
                                    }
                                    onBlur={(e) => onBlurCheck(e, index)}
                                />
                                {/* {onBlurErrors[index] !== "" && ( */}
                                <p className="text-red-500 text-sm">{onBlurErrors[index] !== "" ? onBlurErrors[index] : error[index]}</p>
                                {/* )} */}
                            </div>
                        ))}
                    </div>


                    <div>
                        <hr className="mt-5 mb-5" />
                        <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                            <button
                                className="btn-purple mr-2"
                                disabled={isSubmitting}
                                style={
                                    isSubmitting
                                        ? { cursor: "not-allowed", opacity: 0.8 }
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