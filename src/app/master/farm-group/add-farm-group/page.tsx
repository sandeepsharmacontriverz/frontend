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
  useTitle("Add Farm Group")

  const router = useRouter()
  const [initializeInputFields] = useState(Array(16).fill(""))
  const [brandItems, setBrandItems] = useState([]);
  const [onBlurErrors, setOnBlurErrors] = useState(new Array(16).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    brandId: "",
    farmgroup: initializeInputFields,
  });

  const [error, setError] = useState<any>({
    brand_name: "",
    farmGroup: [],
  });

  const getCropName = async () => {
    const url = "brand";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const brand_name = response.data;
        setBrandItems(brand_name);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  useEffect(() => {
    getCropName();
  }, []);


  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>,
    index: number = 0
  ) => {
    const { name, value } = event.target;

    if (name === "brand_name") {
      setFormData((prevData) => ({
        ...prevData,
        brandId: value,
      }));
      setError((pre: any) => ({
        ...pre,
        brand_name: "",
      }));
    }
    else {
      setFormData((prevData) => {
        const updatedCropTypes = [...prevData.farmgroup];
        updatedCropTypes[index] = value;
        return {
          ...prevData,
          farmgroup: updatedCropTypes,
        };
      });

      const newInputValues = [...formData?.farmgroup];
      newInputValues[index] = value;
      setFormData((pre) => ({
        ...pre,
        farmgroup: newInputValues,
      }));
      // Check if the backspace key is pressed and the input value is empty
      const isBackspaceAndEmpty =
        (event.nativeEvent as InputEvent).inputType === "deleteContentBackward" &&
        value === "";

      // Check if the value is already entered in another field
      const isValueAlreadyEntered = newInputValues.some(
        (input: any, i: any) =>
          input.trim().toLowerCase() === value.trim().toLowerCase() && i !== index
      );

      setError((prevError: any) => ({
        ...prevError,
        farmGroup: [
          ...prevError.farmGroup.slice(0, index),
          isBackspaceAndEmpty || !isValueAlreadyEntered ? "" : "Value already entered in another field.",
          ...prevError.farmGroup.slice(index + 1)
        ]
      }));

    }
  };

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("farm-group/check-farm-groups", {
      brandId: formData.brandId,
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
    if (value !== "" && formData.brandId) { // Only make the API call if the value is non-empty
      alreadyExistName(name, value, index).then((error) => {
        newOnBlurErrors[index] = error;
        setOnBlurErrors(newOnBlurErrors);
      });
    } else {
      newOnBlurErrors[index] = "";
      setOnBlurErrors(newOnBlurErrors);
    }
  }

  const handleErrors = () => {
    let isError = true;
    const newError: any = { ...error };

    if (!formData.brandId) {
      newError["brand_name"] = "Brand Name is required",
        isError = false;
    }

    formData.farmgroup.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.farmGroup[index] = 'Farm Group is required';
        isError = false;
      } else if (!valid) {
        if (inputValue != '') {
          newError.farmGroup[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = false;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = formData.farmgroup.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
        );
        if (isValueAlreadyEntered) {
          newError.farmGroup[index] = "Value already entered in another field.";
          isError = false;
        }
      }
    });
    // setError((prevError: any) => ({
    //   ...prevError,
    //   farmGroup: newError.farmGroup,
    // }));

    const mergedErrors = newError.farmGroup?.map((error: any, index: any) => onBlurErrors[index] || error);
    setError({ ...error, ...newError, farmGroup: mergedErrors });

    const hasMergeErrors = onBlurErrors.some(error => error !== '');
    if (!hasMergeErrors) {
      return isError;
    }
  }

  const handleSubmit = async (e: any) => {
    if (handleErrors() !== true) {
      return
    }

    if (formData.brandId && formData.farmgroup[0] !== "") {
      const requestBody = {
        brandId: Number(formData.brandId),
        name: formData.farmgroup.filter((subType: any) => subType !== ""),
      };

      const url = "farm-group/multiple";
      try {
        setIsSubmitting(true);
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.name).join(', ')
          toasterSuccess(`Following farm group(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          setIsSubmitting(false);
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.name).join(', ')
          toasterError(`Following farm group(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/farm-group')
      } catch (error) {
        setIsSubmitting(false);
        console.log(error, "error");
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };


  useEffect(() => {
    User.role()
  }, [])
  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading...</div>;
  }
  return (
    <>
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
                  <Link href="/master/farm-group">
                    Farm Group
                  </Link>
                </li>
                <li>Add Farm Group</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div>
            <select
              className="w-60 border rounded px-2 py-1 mt-3  text-sm"
              value={formData.brandId}
              onChange={(event) => handleChange(event)}
              name="brand_name"
            >
              <option value="" className="text-sm">
                Select Brand
              </option>
              {brandItems.length > 0 &&
                brandItems.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.brand_name}
                  </option>
                ))}
            </select>
            {error.brand_name && (
              <div className="text-red-500 text-sm  mt-1">{error.brand_name}</div>
            )}
          </div>
          <div className='input-container mt-4'>
            <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
              {initializeInputFields.map((farmgroup, index) => (
                <div className="mb-2" key={index}>
                  <input
                    id={`farmgroup-${index}`}
                    type="text"
                    name="name"
                    placeholder={index === 0 ? translations.farmGroup + "*" : translations.farmGroup}
                    className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                    value={formData.farmgroup[index]}
                    onChange={(event) => handleChange(event, index)}
                    onBlur={(e) => onBlurCheck(e, index)}
                  />
                  {/* {error.farmGroup[index] !== "" && ( */}
                  <div className="text-red-500 text-sm mt-1">{onBlurErrors[index] !== "" ? onBlurErrors[index] : error.farmGroup[index]}</div>
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
