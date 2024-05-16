"use client"
import React, { useEffect, useState } from 'react';
import useTranslations from '@hooks/useTranslation'
import User from '@lib/User';
import useTitle from '@hooks/useTitle';
import API from '@lib/Api';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import { useRouter } from "@lib/router-events";
import Link from '@components/core/nav-link';

export default function Page() {
  useTitle("Add Crop Grade")
  const router = useRouter()
  const [initializeInputFields] = useState(Array(16).fill(""))
  const [cropName, setCropName] = useState([]);
  const [cropType, setCropType] = useState([]);
  const [cropVariety, setCropVariety] = useState([])
  const [formData, setFormData] = useState({
    cropNameId: "",
    cropTypeId: "",
    cropVarietyId: "",
    cropGrade: initializeInputFields
  })
  const [onBlurErrors, setOnBlurErrors] = useState(new Array(16).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCropName();
  }, []);

  useEffect(() => {
    if (formData.cropNameId) {
      getCropType()
    }
  }, [formData.cropNameId])

  useEffect(() => {
    if (formData.cropTypeId) {
      getCropVariety()
    }
  }, [formData.cropTypeId])

  useEffect(() => {
    User.role()
  }, [])

  const getCropName = async () => {
    const url = "crop/crop-name?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        setCropName(response.data.crops);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getCropType = async () => {
    const url = `crop/crop-type?pagination=false&cropId=${formData.cropNameId}&status=true`;
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const cropType_name = response.data;
        setCropType(cropType_name);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getCropVariety = async () => {
    const url = `crop/crop-variety?pagination=false&cropTypeId=${formData.cropTypeId}&status=true`;
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const cropvariety = response.data;
        setCropVariety(cropvariety);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };


  const [error, setError] = useState<any>({
    cropname: "",
    croptype: "",
    cropvariety: "",
    cropgrade: [],
    cropgradeIndex: -1
  })

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("crop/check-crop-grades", {
      cropVarietyId: Number(formData?.cropVarietyId),
      cropGrade: value
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
    if (formData?.cropVarietyId && value !== "") {
      alreadyExistName(name, value, index).then((error) => {
        newOnBlurErrors[index] = error;
        setOnBlurErrors(newOnBlurErrors);
      });
    } else {
      newOnBlurErrors[index] = "";
      setOnBlurErrors(newOnBlurErrors);
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const { name, value } = event.target;

    if (name === "crop_name") {
      setFormData((prevData) => ({
        ...prevData,
        cropNameId: value,
      }));
      setError((prevError: any) => ({
        ...prevError,
        cropname: "", // Clear the error message
      }));
    } else if (name === "croptype") {
      setFormData((prevData) => ({
        ...prevData,
        cropTypeId: value,
      }));
      setError((prevError: any) => ({
        ...prevError,
        croptype: "", // Clear the error message
      }));
    } else if (name === "cropVariety") {
      setFormData((prevData) => ({
        ...prevData,
        cropVarietyId: value,
      }));
      setError((prevError: any) => ({
        ...prevError,
        cropvariety: "", // Clear the error message
      }));
    } else if (name === "cropGrade") {
      const updatedVarieties = [...formData.cropGrade];
      updatedVarieties[index] = value;

      setFormData((prevData) => ({
        ...prevData,
        cropGrade: updatedVarieties,
      }));
      const isBackspaceAndEmpty =
        (event.nativeEvent as InputEvent).inputType === "deleteContentBackward" &&
        value === "";

      // Check if the value is already entered in another field
      const isValueAlreadyEntered = updatedVarieties.some(
        (input: any, i: any) =>
          input.trim().toLowerCase() === value.trim().toLowerCase() && i !== index
      );

      setError((prevError: any) => ({
        ...prevError,
        cropgrade: [
          ...prevError.cropgrade.slice(0, index),
          isBackspaceAndEmpty || !isValueAlreadyEntered ? "" : "Value already entered in another field.",
          ...prevError.cropgrade.slice(index + 1)
        ]
      }));
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newError: any = { ...error };
    let hasError = false;
    if (!formData.cropNameId) {
      newError["cropname"] = "Crop Name is Required"
      hasError = true
    }

    if (!formData.cropTypeId) {
      newError["croptype"] = "Crop Type is Required"
      hasError = true
    }

    if (!formData.cropVarietyId) {
      newError["cropvariety"] = "Crop Variety is Required"
      hasError = true
    }

    newError.cropgrade = [];
    formData.cropGrade.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.cropgrade[index] = 'Crop Grade is required.';
        hasError = true
      } else if (!valid) {
        if (inputValue != '') {
          newError.cropgrade[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          hasError = true
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = formData.cropGrade.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
        );
        if (isValueAlreadyEntered) {
          newError.cropgrade[index] = "Value already entered in another field.";
          hasError = true
        }
      }
    });
    const mergedErrors = newError?.cropgrade?.map((error: any, index: any) => onBlurErrors[index] || error);
    setError({ ...error, ...newError, cropgrade: mergedErrors });

    if (hasError) {
      return
    }
    const hasMergeErrors = onBlurErrors.some(error => error !== '');

    if (!hasMergeErrors) {
      setIsSubmitting(true);
      const requestBody = {
        cropVarietyId: formData.cropVarietyId,
        cropGrade: formData.cropGrade.filter((subVariety: any) => subVariety !== ""),
      };

      const url = "crop/crop-grade-multiple";
      try {
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.cropGrade).join(', ')
          toasterSuccess(`Following crop grade(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.cropGrade).join(', ')
          toasterError(`Following crop grade(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/crop/crop-grade')
      } catch (error) {
        console.log(error, "error");
      }
    }
  }

  const handleCancel = () => {
    setFormData({
      cropNameId: "",
      cropTypeId: "",
      cropVarietyId: "",
      cropGrade: initializeInputFields,
    });
    setError({
      cropname: "",
      croptype: "",
      cropvariety: "",
      cropgrade: "",
      cropgradeIndex: -1
    });
    window.history.back();
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }

  return (
    <>
      <div >
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
                  <Link href="/master/crop/crop-grade">
                    Crop Grade
                  </Link>
                </li>
                <li>Add Crop Grade</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
      <div className="bg-white rounded-md p-4">
        <div className="flex" >
          <div >
            <select className="w-60 border rounded px-2 py-1 mt-3  text-sm"
              value={formData.cropNameId}
              onChange={(event) => handleChange(event)}
              name="crop_name"
            >

              <option value="">Select Crop Name</option>
              {cropName.map((crop: any) => (
                <option key={crop.id} value={crop.id}>
                  {crop.crop_name}
                </option>
              ))}
            </select>
            {error.cropname && (
              <div className="text-red-500 text-sm ml-5 mt-1">
                {error.cropname}
              </div>
            )}
          </div>
          <div >
            <select
              className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm flex"
              value={formData.cropTypeId}
              onChange={(event) => handleChange(event)}
              name="croptype"
            >
              <option value="">Select Crop Type</option>
              {cropType.map((crop: any) => (
                <option key={crop.id} value={crop.id}>
                  {crop.cropType_name}
                </option>
              ))}
            </select>
            {error.croptype && (
              <div className="text-red-500 text-sm ml-5 mt-1">
                {error.croptype}
              </div>
            )}
          </div>
          <div>
            <select
              className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm"
              onChange={(event) => handleChange(event)} name="cropVariety"

            >
              <option value="">Select Crop Variety</option>
              {cropVariety.map((name: any, index) => (
                <option key={index} value={name.id}>
                  {name.cropVariety}
                </option>
              ))}
            </select>
            {error.cropvariety && (
              <div className="text-red-500 text-sm ml-5 mt-1">
                {error.cropvariety}
              </div>
            )}
          </div>
        </div>
        <div className='input-container mt-4'>
          <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
            {initializeInputFields.map((cropgrade, index) => (
              <div className="mb-2" key={index}>
                <input
                  id={`cropGrade-${index}`}
                  type="text"
                  name="cropGrade"
                  placeholder={index === 0 ? translations.crop.cropGrade + "*" : translations.crop.cropGrade}
                  className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                  value={formData.cropGrade[index]}
                  onChange={(event) => handleChange(event, index)}
                  onBlur={(event) => onBlurCheck(event, index)}
                />
                {/* {index === error.cropgradeIndex && error.cropgrade && ( */}
                <div className="text-red-500 text-sm mt-1">{onBlurErrors[index] ? onBlurErrors[index] : error.cropgrade[index]}</div>
                {/* )} */}
              </div>
            ))}

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
        <hr className="mt-2 mb-4" />
      </div>
    </>
  );
}