"use client"
import { useEffect, useRef, useState } from "react";
import useTranslations from '@hooks/useTranslation'
import User from "@lib/User";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";

export default function Page() {
  useTitle("Add Crop Type")

  const router = useRouter()
  const [initializeInputFields] = useState(Array(16).fill(""))
  const [cropItems, setCropItems] = useState([]);

  const [formData, setFormData] = useState({
    cropId: "",
    cropType: initializeInputFields,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [onBlurErrors, setOnBlurErrors] = useState(new Array(10).fill(""));

  const [error, setError] = useState<any>({
    cropname: "",
    cropType: new Array(16).fill(""),
    cropTypeIndex: -1
  });

  const getCropName = async () => {
    const url = "crop/crop-name?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const crop_name = response.data.crops;
        setCropItems(crop_name);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  useEffect(() => {
    getCropName();
  }, []);

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("crop/check-crop-types", {
      cropId: Number(formData?.cropId),
      cropTypeName: value
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
    if (formData?.cropId && value !== "") {
      alreadyExistName(name, value, index).then((error) => {
        newOnBlurErrors[index] = error;
        setOnBlurErrors(newOnBlurErrors);
      });
    } else {
      newOnBlurErrors[index] = "";
      setOnBlurErrors(newOnBlurErrors);
    }
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>,
    index: number = 0
  ) => {
    const { name, value } = event.target;

    if (name === "crop_name") {
      setFormData((prevData) => ({
        ...prevData,
        cropId: value,
      }));
    } else {
      const newInputValues = [...formData?.cropType];
      setFormData((prevData) => {
        const updatedCropTypes = [...prevData.cropType];
        updatedCropTypes[index] = value;
        return {
          ...prevData,
          cropType: updatedCropTypes,
        };
      });

      // Check if the backspace key is pressed and the input value is empty
      const isBackspaceAndEmpty =
        (event.nativeEvent as InputEvent).inputType === "deleteContentBackward" &&
        value === "";

      // Check if the value is already entered in another field
      const isValueAlreadyEntered = newInputValues.some(
        (input, i) =>
          input.trim().toLowerCase() === value.trim().toLowerCase() && i !== index
      );

      const newError: any = { ...error };

      if (isBackspaceAndEmpty || !isValueAlreadyEntered) {
        newError.cropType[index] = "";
      } else {
        newError.cropType[index] = "Value already entered in another field.";
      }
      setError(newError);
    }
    if (name === "crop_name") {
      setError((prevError:any) => ({
        ...prevError,
        cropname: "",
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    // if (!formData.cropId) {
    //   setError((prevError: any) => ({
    //     ...prevError,
    //     cropname: "Crop Name is required",
    //   }));
    // }

    // if (formData.cropType[0] === "") {
    //   setError((prevError: any) => ({
    //     ...prevError,
    //     cropType: "Crop Type is required",
    //   }));
    // } else {
    //   const notValidIndex = isCropTypeValid(formData.cropType);
    //   if (notValidIndex > -1) {
    //     setError((prevError: any) => ({
    //       ...prevError,
    //       cropType: "Only letters, digits, white space, (, ), _ and - allowed.",
    //       cropTypeIndex: notValidIndex
    //     }));
    //   } else if (inputValue.trim() !== "" && valid) {
    //     const isValueAlreadyEntered = formData.StateName.some(
    //       (input, i) =>
    //         input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
    //     );
    //     if (isValueAlreadyEntered) {
    //       newError.stateName[index] = "Value already entered in another field.";
    //       isError = true;
    //     }
    //   } else {
    //     if (formData.cropId && formData.cropType[0] !== "") {
    let isError = false;
    const newError: any = { ...error };

    if (!formData.cropId) {
      newError["cropname"] = "Crop Name is required.";
      isError = true;
    }

    newError.cropType = [];
    formData.cropType.forEach((inputValue, index) => {
      const regex = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue.trim());

      if (index === 0 && inputValue.trim() === '') {
        newError.cropType[index] = 'Crop Type is required.';
        isError = true;
      } else if (!valid) {
        if (inputValue.trim() !== '') {
          newError.cropType[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = formData.cropType.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
        );
        if (isValueAlreadyEntered) {
          newError.cropType[index] = "Value already entered in another field.";
          isError = true;
        }
      }
    });

    setError(newError);

    if (isError) {
      return;
    }

    const mergedErrors = newError?.cropType?.map((error: any, index: any) => onBlurErrors[index] || error);
    setError({ ...error, cropType: mergedErrors });

    const hasMergeErrors = onBlurErrors.some(error => error !== '');

    if (formData.cropId && formData.cropType[0] !== "" && !hasMergeErrors) {
      const requestBody = {
        cropId: Number(formData.cropId),
        cropTypeName: formData.cropType.filter((subType: any) => subType !== ""),
      };
      const url = "crop/crop-type-multiple";
      try {
        setIsSubmitting(true);
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.cropType_name).join(', ')
          toasterSuccess(`Following crop type(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.cropType_name).join(', ')
          toasterError(`Following crop type(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/crop/crop-type')
      } catch (error) {
        setIsSubmitting(false);
        console.log(error, "error");
      }
    }
  };

  const handleCancel = (event: any) => {
    const { name, value } = event.target;
    setError((prevError:any) => ({
      ...prevError,
      [name]: "",
      cropTypeIndex: -1
    }));
    router.back();
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
                  <Link href="/master/crop/crop-type">
                    Crop Type
                  </Link>
                </li>
                <li>Add Crop Type</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div>
            <select
              className="w-60 border rounded px-2 py-1  text-sm"
              value={formData.cropId}
              onChange={(event) => handleChange(event)}
              name="crop_name"
            >
              <option value="" className="text-sm">
                Select Crop Name
              </option>
              {cropItems.length > 0 &&
                cropItems.map((crop: any) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.crop_name}
                  </option>
                ))}
            </select>
            {error.cropname && (
              <div className="text-red-500 text-sm  mt-1">{error.cropname}</div>
            )}
          </div>
          <div className='input-container mt-4'>
            <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
              {initializeInputFields.map((croptype, index) => (
                <div className="mb-2" key={index}>
                  <input
                    id={`croptype-${index}`}
                    type="text"
                    name="croptypes"
                    placeholder={index === 0 ? translations.crop.cropType + "*" : translations.crop.cropType}
                    className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                    value={formData.cropType[index]}
                    onChange={(event) => handleChange(event, index)}
                    onBlur={(event) => onBlurCheck(event, index)}
                  />
                  {/* {index === error.cropTypeIndex && error.cropType && ( */}
                  <div className="text-red-500 text-sm mt-1">{onBlurErrors[index] ? onBlurErrors[index] : error?.cropType[index]}</div>
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