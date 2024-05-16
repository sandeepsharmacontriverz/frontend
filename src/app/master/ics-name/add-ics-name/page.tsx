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
  useTitle("Add ICS Name");
  const [roleLoading] = useRole();

  const router = useRouter();
  const [initializeInputFields] = useState(Array(16).fill(""));
  const [farmGroups, setFarmGroups] = useState([]);
  const [onBlurErrors, setOnBlurErrors] = useState(new Array(16).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    farmGroupId: "",
    icsName: initializeInputFields,
    longitude: initializeInputFields,
    latitude: initializeInputFields
  });

  const [error, setError] = useState<any>({
    farmGroup: "",
    icsName: [],
  });

  const getFarmGroups = async () => {
    const url = "farm-group?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const farmGroup = response.data;
        setFarmGroups(farmGroup);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("ics/check-ics-names", {
      formGroupId: Number(formData?.farmGroupId),
      icsName: value
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
    if (formData?.farmGroupId && value !== "") {
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

    if (name === "farmGroup") {
      setFormData((prevData) => ({
        ...prevData,
        farmGroupId: value
      }));
    } else if (name === "latitude") {
      setFormData((prevData: any) => {
        const updatedValues = [...prevData.latitude];
        updatedValues[index] = value;
        return {
          ...prevData,
          latitude: updatedValues,
        };
      });
    }
    else if (name === "longitude") {
      setFormData((prevData: any) => {
        const updatedValues = [...prevData.longitude];
        updatedValues[index] = value;
        return {
          ...prevData,
          longitude: updatedValues,
        };
      });
    }
    else {
      setFormData((prevData: any) => {
        const updatedValues = [...prevData.icsName];
        updatedValues[index] = value;
        return {
          ...prevData,
          icsName: updatedValues,
        };
      });

      const newInputValues = [...formData?.icsName];
      newInputValues[index] = value;
      setFormData((prev: any) => ({
        ...prev,
        icsName: newInputValues
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

      const newError: any = { ...error };

      if (isBackspaceAndEmpty || !isValueAlreadyEntered) {
        newError.icsName[index] = "";
      } else {
        newError.icsName[index] = "Value already entered in another field.";
      }

      setError(newError);

    }
    // setError((prevData) => ({
    //   ...prevData,
    //   [name]: "",
    //   farmGroup: "",
    // }));
  };

  const handleErrors = () => {
    let isError = true;
    const newError: any = { ...error };

    if (!formData.farmGroupId) {
      newError["farmGroup"] = "Farm Group is required",
        isError = false;
    }

    formData.icsName.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.icsName[index] = 'Ics Name is required';
        isError = false;
      } else if (!valid) {
        if (inputValue != '') {
          newError.icsName[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = false;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = formData.icsName.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
        );
        if (isValueAlreadyEntered) {
          newError.icsName[index] = "Value already entered in another field.";
          isError = false;
        }
      }
    });
    const mergedErrors = newError?.icsName?.map((error: any, index: any) => onBlurErrors[index] || error);
    setError({ ...error, ...newError, icsName: mergedErrors });

    const hasMergeErrors = onBlurErrors.some(error => error !== '');
    if (!hasMergeErrors) {
      return isError;
    }
  }

  const handleSubmit = async (e: any) => {
    if (handleErrors() !== true) {
      return
    }

    if (formData.farmGroupId && formData.icsName[0] !== "") {
      const icsArray = formData.icsName
        .map((icsName, index) => {
          if (icsName.trim() !== "") {
            return {
              icsName,
              icsLatitude: formData.latitude[index] || "",
              icsLongitude: formData.longitude[index] || "",
            };
          }
          return null;
        })
        .filter((ics) => ics !== null);

      const requestBody = {
        farmGroupId: Number(formData.farmGroupId),
        ics: icsArray
      };

      const url = "ics/multiple";
      try {
        setIsSubmitting(true);
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.ics_name).join(', ')
          toasterSuccess(`Following Ics name(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          setIsSubmitting(false);
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.ics_name).join(', ')
          toasterError(`Following Ics name(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/ics-name')
      } catch (error) {
        setIsSubmitting(false);
        console.log(error, "error");
      }
    }
  };

  const handleCancel = () => {
    setError((prevData: any) => ({
      farmGroup: "",
      icsName: [],
    }));
    router.back();
  };

  useEffect(() => {
    getFarmGroups();
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
                  <li>
                    <Link href="/dashboard" className="active">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li>Master</li>
                  <li>
                    <Link href="/master/ics-name">
                      ICS Name
                    </Link>
                  </li>
                  <li>Add ICS Name</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-md p-4">
            <div>
              <select
                className="w-60 border rounded px-2 py-1 mt-3 text-sm"
                value={formData.farmGroupId}
                onChange={(event) => handleChange(event)}
                name="farmGroup"
              >
                <option value="" className="text-sm">
                  Select Farm Group*
                </option>
                {farmGroups.map((farmGroup: any) => (
                  <option key={farmGroup.id} value={farmGroup.id}>
                    {farmGroup.name}
                  </option>
                ))}
              </select>

              {error.farmGroup && <div className="text-red-500 text-sm  mt-1">{error.farmGroup}</div>}
            </div>

            <div className="text-sm mt-4">
              {initializeInputFields.map((_, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 ">
                  <div >

                    <input
                      id={`icsName-${index}`}
                      type="text"
                      name="icsName"
                      placeholder={index === 0 ? translations.icsName + "*" : translations.icsName}
                      className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}

                      value={formData.icsName[index]}
                      onChange={(event) => handleChange(event, index)}
                      onBlur={(e) => onBlurCheck(e, index)}
                    />
                    <div className="text-red-500 text-sm">{onBlurErrors[index] ? onBlurErrors[index] : error.icsName[index]}</div>

                  </div>
                  <div className="column">
                  <input
                    id={`latitude-${index}`}
                    name="latitude"
                    type="number"
                    className={`flex-1 ml-2 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                    placeholder="Latitude"
                    value={formData.latitude[index] || ""}
                    onChange={(event) => handleChange(event, index)}
                  />
                  </div>
                  <div className="column">
                  <input
                    id={`longitude-${index}`}
                    name="longitude"
                    type="number"
                    className={`flex-1 ml-2 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                    placeholder="Longitude"
                    value={formData.longitude[index] || ""}
                    onChange={(event) => handleChange(event, index)}
                  />
                  {onBlurErrors[index] && <div className="text-red-500 text-sm ml-2">{onBlurErrors[index]}</div>}
                </div>
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
            <hr className="mt-2 mb-4" />
          </div>
        </div>
      </>
    )
  }
}
