"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import API from '@lib/Api';
import User from '@lib/User';

const AddLabMaster = () => {
    useTitle("Add Lab Master");

    const [roleLoading] = useRole();
    const router = useRouter();

    const numInputs = 16;
    const [inputValues, setInputValues] = useState<Array<string>>(new Array(numInputs).fill(""));
    const [error, setError] = useState<Array<string>>(new Array(numInputs).fill(""));
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleCancel = () => {
        setError(new Array(numInputs).fill(""));
        router.back();
    };

    const handleInputChange = (index: any, value: any) => {
        const newInputValues = [...inputValues];
        newInputValues[index] = value;
        setInputValues(newInputValues);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();

        let isError = false;
        const newError = new Array(numInputs).fill("");
        inputValues.map((inputValue, index) => {
            const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
            const valid = regex.test(inputValue);

            if (index === 0 && inputValue === '') {
                newError[index] = 'Lab name is required';
                isError = true;
            } else if (inputValue && !valid) {
                newError[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
                isError = true;
            }
        });
        setError(newError);

        if (!isError) {
            addData();
        }
    };

    const addData = async () => {
        const inputData = inputValues.filter(Boolean);

        setIsSubmitting(true);
        const url = "lab-master/multiple";
        try {
            const response = await API.post(url, {
                labNames: inputData
            })
            if (response.data.pass.length > 0) {
                const dataPassed = response.data.pass;
                const passedName = dataPassed.map((name: any) => name.data.name).join(', ');
                toasterSuccess(`Following lab master(s) have been added successfully: ${passedName} `);
            }
            if (response.data.fail.length > 0) {
                const dataFailed = response.data.fail;
                const failedName = dataFailed.map((name: any) => name.data.name).join(', ');
                toasterError(`Following lab master(s) are skipped as they are already exist: ${failedName} `);
            }
            setIsSubmitting(false);
            router.push('/master/lab-master');
        }
        catch (error) {
            console.log(error, "error");
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        User.role();
    }, []);

    const { translations, loading } = useTranslations();
    if (loading) {
        return <div>Loading...</div>;
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
                                    <Link href="/master/lab-master">
                                        Lab Master
                                    </Link>
                                </li>
                                <li>Add Lab Master</li>
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
                                            index === 0 ? translations.labMaster.labname + "*" : translations.labMaster.labname
                                        }
                                        value={value}
                                        className={`text-center text-sm border rounded px-2 py-1 ${error[index] !== "" ? 'border-red-500' : 'border'}`}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                    />
                                    {error[index] !== "" && (
                                        <p className="text-red-500 text-sm">{error[index]}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className=" justify-between mt-4 mx-4 space-x-3 border-t border-b py-2 px-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-green-600 text-sm rounded text-white px-2 py-1.5"
                                style={
                                    isSubmitting
                                        ? { cursor: "not-allowed", opacity: 0.8 }
                                        : { cursor: "pointer" }
                                }
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
                    </form>
                </div>
            </div>
        );
    }
}

export default AddLabMaster;