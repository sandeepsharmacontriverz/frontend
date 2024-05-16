"use client"

import { useEffect, useRef, useState } from "react";
import useTranslations from "@hooks/useTranslation";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";

export default function Page() {
  useTitle("Add Farm Product");
  const [roleLoading] = useRole();

  const router = useRouter();
  const [initializeInputFields] = useState(Array(16).fill(""));
  const [farmItems, setFarmItems] = useState([]);
  const [selectedFarmItemId, setSelectedFarmItemId] = useState(null);
  const [formData, setFormData] = useState({
    farmItem: "",
    farmItemId: null,
    farmProduct: initializeInputFields,
  });
  const [onBlurErrors, setOnBlurErrors] = useState(new Array(10).fill(""));
  const [error, setError] = useState<any>({
    farmItem: "",
    farmProduct: new Array(10).fill(""),
  });

  const getFarmItems = async () => {
    const url = "farm/farm-item?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const farmItem = response.data;
        setFarmItems(farmItem);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const { name, value } = event.target;

    if (name === "farmItem") {
      const selectedUnitType: any = farmItems.find((farmItem: any) => farmItem.farmItem === value);
      setSelectedFarmItemId(selectedUnitType ? selectedUnitType.id : null);
      setFormData((prevData) => ({
        ...prevData,
        farmItem: value,
        farmItemId: selectedUnitType ? selectedUnitType.id : null,
      }));
      setError((prevData: any) => ({
        ...prevData,
        [name]: ""
      }));
    } else {
      const newInputValues = [...formData?.farmProduct];
      newInputValues[index] = value;
      setFormData((prev: any) => ({
        ...prev,
        farmProduct: newInputValues
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

      const newError = { ...error };

      if (isBackspaceAndEmpty || !isValueAlreadyEntered) {
        newError.farmProduct[index] = "";
      } else {
        newError.farmProduct[index] = "Value already entered in another field.";
      }

      setError(newError);
    }
  };

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("farm/check-farm-products", {
      farmItemId: Number(selectedFarmItemId),
      farmProduct: value
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
    if (selectedFarmItemId && value !== "") {
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

    if (!formData.farmItem) {
      newError["farmItem"] = "Farm Item is required"
      isError = false;
    }

    newError.farmProduct = [];

    formData.farmProduct.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.farmProduct[index] = 'Farm Product Name is required';
        isError = false;
      } else if (!valid) {
        if (inputValue != '') {
          newError.farmProduct[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = false;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = formData.farmProduct.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
        );
        if (isValueAlreadyEntered) {
          newError.farmProduct[index] = "Value already entered in another field.";
          isError = false;
        }
      }
    });
    // setError((prevError: any) => ({
    //   ...prevError,
    //   farmProduct: newError.farmProduct,
    // }));
    const mergedErrors = newError?.farmProduct?.map((error: any, index: any) => onBlurErrors[index] || error);
    setError({ ...newError, farmProduct: mergedErrors });
    const hasMergeErrors = onBlurErrors.some(error => error !== '');
    if (!hasMergeErrors) {
      return isError
    }
  }


  const handleSubmit = async (e: any) => {
    if (handleErrors() !== true) {
      return
    }

    if (formData.farmItem && formData.farmProduct[0] !== "") {
      const requestBody = {
        farmItemId: selectedFarmItemId,
        farmProduct: formData.farmProduct.filter((subType: any) => subType !== ""),
      };

      const url = "farm/farm-product-multiple";
      try {
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.farmProduct).join(', ')
          toasterSuccess(`Following farm Product(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.farmProduct).join(', ')
          toasterError(`Following farm Product(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/farm/farm-product')
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const handleCancel = () => {
    setError((prevData: any) => ({
      farmItem: "",
      farmProduct: "",
    }));
    router.back();
  };

  useEffect(() => {
    getFarmItems();
  }, []);

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }

  if (!roleLoading) {
    return (
      <>
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
                  <li>Farm</li>
                  <li>
                    <Link href="/master/farm/farm-product">
                      Farm Product
                    </Link>
                  </li>
                  <li>Add Farm Product</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4">
            <div>
              <select
                className="w-60 border rounded px-2 py-1 mt-3 text-sm"
                value={formData.farmItem}
                onChange={(event) => handleChange(event)}
                name="farmItem"
              >
                <option value="" className="text-sm">
                  Select Farm Item*
                </option>
                {farmItems.map((farmItem: any) => (
                  <option key={farmItem.id} value={farmItem.farmItem}>
                    {farmItem.farmItem}
                  </option>
                ))}
              </select>
              {error.farmItem && <div className="text-red-500 text-sm  mt-1">{error.farmItem}</div>}
            </div>
            <div className="input-container mt-4">
              <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
                {initializeInputFields.map((_, index) => (
                  <div className="mb-2" key={index}>
                    <input
                      id={`farmProduct-${index}`}
                      type="text"
                      name="farmProduct"
                      placeholder={index === 0 ? translations.farm.farmProductName + "*" : translations.farm.farmProductName}
                      className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                      value={formData.farmProduct[index]}
                      onChange={(event) => handleChange(event, index)}
                      onBlur={(event) => onBlurCheck(event, index)}
                    />
                    {/* {error.farmProduct[index] !== "" &&  */}
                    <p className="text-red-500 text-sm mt-1">{onBlurErrors[index] ? onBlurErrors[index] : error.farmProduct[index]}</p>
                    {/* } */}
                  </div>
                ))}
              </div>
            </div>
            <div className=" justify-between mt-4 mx-4 space-x-3 border-t border-b py-2 px-2">
            <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                            <button
                                className="btn-purple mr-2"
                                onClick={handleSubmit}
                                // disabled={isSubmitting}
                                style={
                                    // isSubmitting
                                    //     ? { cursor: "not-allowed" }
                                         { cursor: "pointer", backgroundColor: "#D15E9C" }
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
          </div>
        </div>
      </>
    )
  }
}
