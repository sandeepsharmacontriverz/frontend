"use client"

import { useEffect, useRef, useState } from "react";
import Link from "@components/core/nav-link";
import useTranslations from "@hooks/useTranslation";
import { useRouter } from "@lib/router-events";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";

export default function Page() {
  const router = useRouter();
  const [roleLoading] = useRole();
  useTitle('Add Unit Sub Type')
  const [initializeInputFields] = useState(Array(16).fill(""));
  const [unitTypes, setUnitTypes] = useState([]);
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState(null);
  const [formData, setFormData] = useState({
    unitTypeName: "",
    unitTypeId: null,
    unitSubType: initializeInputFields,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [onBlurErrors, setOnBlurErrors] = useState(new Array(10).fill(""));
  const [error, setError] = useState<any>({
    unitTypeName: "",
    unitSubType: new Array(10).fill(""),
  });

  const getUnitTypes = async () => {
    const url = "unit/unit-type?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const unitTypeData = response.data;
        setUnitTypes(unitTypeData);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const { name, value } = event.target;

    if (name === "unitTypeName") {
      const selectedUnitType: any = unitTypes.find((unitType: any) => unitType.unitType === value);
      setSelectedUnitTypeId(selectedUnitType ? selectedUnitType.id : null);
      setFormData((prevData) => ({
        ...prevData,
        unitTypeName: value,
        unitTypeId: selectedUnitType ? selectedUnitType.id : null,
      }));
      setError((prevData: any) => ({
        ...prevData,
        [name]: "",
      }));
    } else {
      const newInputValues = [...formData?.unitSubType];
      newInputValues[index] = value;
      setFormData((prev: any) => ({
        ...prev,
        unitSubType: newInputValues
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
        newError.unitSubType[index] = "";
      } else {
        newError.unitSubType[index] = "Value already entered in another field.";
      }

      setError(newError);
    };
  }

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("unit/check-sub-type", {
      unitTypeId: Number(formData?.unitTypeId),
      unitSubType: value
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
    if (formData?.unitTypeId && value !== "") {
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

    if (!formData.unitTypeName) {
      newError["unitTypeName"] = 'Unit Type Name is required';
      isError = false;
    }

    // newError.unitSubType = [];

    formData.unitSubType.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.unitSubType[index] = 'Unit Sub Type Name is required';
        isError = false;
      } else if (!valid) {
        if (inputValue != '') {
          newError.unitSubType[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = false;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = formData.unitSubType.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
        );
        if (isValueAlreadyEntered) {
          newError.unitSubType[index] = "Value already entered in another field.";
          isError = false;
        }
      }
    });

    // setError((prevError: any) => ({
    //   ...prevError,
    //   unitSubType: newError.unitSubType,
    // }));

    const mergedErrors = newError?.unitSubType?.map((error: any, index: any) => onBlurErrors[index] || error);
    setError({ ...error, ...newError, unitSubType: mergedErrors });

    const hasMergeErrors = error.unitSubType.some((error: any) => error !== '');
    if (!hasMergeErrors) {
      return isError;
    }
  }

  const handleSubmit = async (e: any) => {
    if (handleErrors() !== true) {
      return
    }

    if (formData.unitTypeName && formData.unitSubType[0] !== "") {
      const requestBody = {
        unitTypeId: selectedUnitTypeId,
        unitSubType: formData.unitSubType.filter((subType: any) => subType !== ""),
      };

      const url = "unit/unit-sub-type-multiple";
      try {
        setIsSubmitting(true);
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.unitSubType).join(', ')
          toasterSuccess(`Following unit sub type(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          setIsSubmitting(false);
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.unitSubType).join(', ')
          toasterError(`Following unit sub type(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/unit/unit-sub-type')
      } catch (error) {
        setIsSubmitting(false);
        console.log(error, "error");
      }
    }
  };

  const handleCancel = () => {
    setError({
      unitTypeName: "",
      unitSubType: "",
    });
    router.back();
  };



  useEffect(() => {
    getUnitTypes();
  }, []);

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
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
                  <li>Unit</li>
                  <li>
                    <Link href="/master/unit/unit-sub-type">
                      Unit Sub Type
                    </Link>
                  </li>
                  <li>Add Unit Sub Type</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4">
            <div>
              <select
                className="w-60 border rounded px-2 py-1 mt-3 text-sm"
                value={formData.unitTypeName}
                onChange={(event) => handleChange(event)}
                name="unitTypeName"
              >
                <option value="" className="text-sm">
                  Select Unit Type*
                </option>
                {unitTypes.map((unitType: any) => (
                  <option key={unitType.id} value={unitType.unitType}>
                    {unitType.unitType}
                  </option>
                ))}
              </select>
              {error.unitTypeName && <div className="text-red-500 text-sm mt-1">{error.unitTypeName}</div>}
            </div>
            <div className="input-container mt-4">
              <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
                {initializeInputFields.map((_, index) => (
                  <div className="mb-2" key={index}>
                    <input
                      id={`unitSubType-${index}`}
                      type="text"
                      name="unitSubType"
                      placeholder={index === 0 ? translations.unit.unitSubTypeName + "*" : translations.unit.unitSubTypeName}
                      className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                      value={formData.unitSubType[index]}
                      onChange={(event) => handleChange(event, index)}
                      onBlur={(event) => onBlurCheck(event, index)}
                    />
                    {/* {error.unitSubType[index] !== "" &&  */}
                    <p className="text-red-500 text-sm mt-1">{onBlurErrors[index] ? onBlurErrors[index] : error.unitSubType[index]}</p>
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
            {/* <hr className="mt-2 mb-4" /> */}
          </div>
        </div>
      </>
    );
  }
}
