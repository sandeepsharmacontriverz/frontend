
"use client"
import React, { useEffect, useState } from "react";
import useTranslations from '@hooks/useTranslation'
import User from "@lib/User";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useRouter } from "@lib/router-events";
import Link from "@components/core/nav-link";
export default function Page() {
  useTitle("Add Crop Variety")
  const router = useRouter()

  const [initializeInputFields] = useState(Array(16).fill(""))
  const [cropName, setCropName] = useState([]);
  const [cropType, setCropType] = useState([]);
  const [formData, setFormData] = useState({
    cropNameId: "",
    cropTypeId: "",
    cropVariety: initializeInputFields,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [onBlurErrors, setOnBlurErrors] = useState(new Array(16).fill(""));
  const [error, setError] = useState<any>({
    cropname: "",
    croptype: "",
    cropVariety: [],
  })

  useEffect(() => {
    getCropName();
  }, []);

  useEffect(() => {
    if (formData.cropNameId) {
      getCropType()
    }
  }, [formData.cropNameId])

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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>,
    index: number = 0) => {
    const { name, value } = event.target;

    if (name === "crop_name") {
      setFormData((prevData) => ({
        ...prevData,
        cropNameId: value,
      }));
    } else if (name === "croptype") {
      setFormData((prevData) => ({
        ...prevData,
        cropTypeId: value,
      }));
    } else if (name === "cropVariety") {
      // const updatedVarieties = [...formData.cropVariety];
      // updatedVarieties[index] = value;

      // setFormData((prevData) => ({
      //   ...prevData,
      //   cropVariety: updatedVarieties,
      // }));
      const newInputValues = [...formData?.cropVariety];
      newInputValues[index] = value;
      setFormData((prev: any) => ({
        ...prev,
        cropVariety: newInputValues
      }));

      // Check if the backspace key is pressed and the input value is empty
      const isBackspaceAndEmpty =
        (event.nativeEvent as InputEvent).inputType === "deleteContentBackward" &&
        value === "";

      // Check if the value is already entered in another field
      const isValueAlreadyEntered = newInputValues.some(
        (input, i) =>
          input.trim().toLowerCase() === value.trim().toLowerCase() && i !== index
      );

      setError((prevError: any) => ({
        ...prevError,
        cropVariety: [
          ...prevError.cropVariety.slice(0, index),
          isBackspaceAndEmpty || !isValueAlreadyEntered ? "" : "Value already entered in another field.",
          ...prevError.cropVariety.slice(index + 1)
        ]
      }));
    }

    if (name === "crop_name") {
      setError((prevError: any) => ({
        ...prevError,
        cropname: "",
      }));
    } else if (name === "croptype") {
      setError((prevError: any) => ({
        ...prevError,
        croptype: "",
      }));
    }
  };

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("crop/check-crop-variety", {
      cropTypeId: Number(formData?.cropTypeId),
      cropVariety: value
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
    if (formData?.cropTypeId && value !== "") {
      alreadyExistName(name, value, index).then((error) => {
        newOnBlurErrors[index] = error;
        setOnBlurErrors(newOnBlurErrors);
      });
    } else {
      newOnBlurErrors[index] = "";
      setOnBlurErrors(newOnBlurErrors);
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newError: any = { ...error };
    let isError = false;

    if (!formData.cropNameId || formData.cropNameId === "") {
      newError["cropname"] = "Crop Name is required"
      isError = true;
    }

    if (!formData.cropTypeId || formData.cropTypeId === "") {
      newError["croptype"] = "Crop Type is required"
      isError = true;
    }

    formData.cropVariety.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.cropVariety[index] = 'Crop variety is required.';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError.cropVariety[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';

        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = formData.cropVariety.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
        );
        if (isValueAlreadyEntered) {
          newError.cropVariety[index] = "Value already entered in another field.";
          isError = true;
        }
      }
    });

    const mergedErrors = newError?.cropVariety?.map((error: any, index: any) => onBlurErrors[index] || error);
    setError({ ...error, ...newError, cropVariety: mergedErrors });

    const hasMergeErrors = onBlurErrors.some(error => error !== '');
    if (!hasMergeErrors && !isError) {
      if (formData.cropNameId && formData.cropTypeId && formData.cropVariety[0] !== "") {
        const requestBody = {
          cropTypeId: Number(formData.cropTypeId),
          cropVariety: (formData.cropVariety.filter((subVariety: any) => subVariety !== "")),
        };

        const url = "crop/crop-variety-multiple";
        try {
          setIsSubmitting(true);
          const response = await API.post(url, requestBody);
          if (response.data.pass.length > 0) {
            const dataPassed = response.data.pass;
            const passedName = dataPassed.map((name: any) => name.data.cropVariety).join(', ')
            toasterSuccess(`Following crop variety(s) have been added successfully: ${passedName} `)
          }
          if (response.data.fail.length > 0) {
            const dataFailed = response.data.fail;
            const failedName = dataFailed.map((name: any) => name.data.cropVariety).join(', ')
            toasterError(`Following crop variety(s) are skipped as they are already exist: ${failedName} `)
          }
          router.push('/master/crop/crop-variety')
        } catch (error) {
          console.log(error, "error");
        }
      }
    }
  }
  const handleCancel = () => {
    window.history.back();
  };

  useEffect(() => {
    User.role()
  }, [])

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }
  return (
    <>
      <div>
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
                    <Link href="/master/crop/crop-variety">
                      Crop Variety
                    </Link>
                  </li>
                  <li>Add Crop Variety</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div className="flex">
            <div >
              <select className="w-60 border rounded px-2 py-1 mt-3  text-sm"
                value={formData.cropNameId}
                onChange={(event) => handleChange(event)} name="crop_name"
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

            {/* Crop Type Select */}
            <div >
              <select
                className="w-60 border rounded px-2 py-1 mt-3 ml-36 text-sm flex"
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
                <div className="text-red-500 ml-36 text-sm mt-1">
                  {error.croptype}
                </div>
              )}
            </div>
          </div>

          <div className='input-container mt-4'>
            <div className="columns mt-3 lg:columns-4 sm:columns-1 md:columns-2 text-sm">
              {initializeInputFields.map((croptype, index) => (
                <div key={index}>
                  <input
                    type="text"
                    id={`cropVariety-${index}`}
                    name="cropVariety"
                    className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}

                    placeholder={index === 0 ? translations.crop.cropVariety + "*" : translations.crop.cropVariety}
                    value={formData.cropVariety[index] || ""}
                    onChange={(event) => handleChange(event, index)}
                    onBlur={(e) => onBlurCheck(e, index)}
                  />
                  {/* {index === error.cropvarietyIndex && error.cropvariety && ( */}
                  <div className="text-red-500 text-sm ml-5 mt-1">
                    {onBlurErrors[index] ? onBlurErrors[index] : error.cropVariety[index]}
                  </div>
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
      </div>
    </>
  );
}
