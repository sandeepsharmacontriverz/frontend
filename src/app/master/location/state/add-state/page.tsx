"use client"
import { useEffect, useRef, useState } from "react";
import useTranslations from '@hooks/useTranslation'
import User from "@lib/User";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import Select from "react-select";

export default function Page() {
  useTitle("Add State")
  const router = useRouter()
  const [countries, setCountries] = useState<any>([]);

  const [formData, setFormData] = useState<any>({
    countryId: "",
    latitude: Array(16).fill(""),
    longitude: Array(16).fill(""),
    StateName: Array(16).fill(""),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [onBlurErrors, setOnBlurErrors] = useState(new Array(10).fill(""));
  const [error, setError] = useState<any>({
    countries: "",
    stateName: new Array(10).fill(""),
    latitude: "",
    longitude: "",
  });

  const getCountries = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const county_name = response.data;
        setCountries(county_name);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  useEffect(() => {
    getCountries();
  }, []);

  const handleCountryChange = (name?: any, value?: any, event?: any) => {
    setFormData((prevData:any) => ({
      ...prevData,
      countryId: value,
    }));

    setError((prevError:any) => ({
      ...prevError,
      countries: "",
    }));
  };


  // const handleStateNameChange = (event: any, index: any) => {
  //   const { value } = event.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     StateName: prevData.StateName.map((name, i) => (i === index ? value : name)),
  //   }));
  // };

  // const handleStateNameChange = (
  //   index: number,
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const { value } = event.target;
  //   const newInputValues = [...formData?.StateName];
  //   newInputValues[index] = value;
  //   setFormData((prev: any) => ({
  //     ...prev,
  //     StateName: newInputValues
  //   }));
  //   // Check if the backspace key is pressed and the input value is empty
  //   const isBackspaceAndEmpty =
  //     (event.nativeEvent as InputEvent).inputType === "deleteContentBackward" &&
  //     value === "";

  //   // Check if the value is already entered in another field
  //   const isValueAlreadyEntered = newInputValues.some(
  //     (input, i) =>
  //       input.trim().toLowerCase() === value.trim().toLowerCase() && i !== index
  //   );

  //   if (isBackspaceAndEmpty || !isValueAlreadyEntered) {
  //     setError((prevError) => {
  //       const newError = { ...prevError };
  //       newError.stateName[index] = "";
  //       return newError;
  //     });
  //   } else {
  //     setError((prevError) => {
  //       const newError = { ...prevError };
  //       newError.stateName[index] = "Value already entered in another field.";
  //       return newError;
  //     });
  //   }

  //   // handleErrors();
  // };

  const handleLatitudeChange = (event: any, index: any) => {
    const { value } = event.target;
    setFormData((prevData:any) => ({
      ...prevData,
      latitude: prevData.latitude.map((lat:any, i:any) => (i === index ? value : lat)),
    }));
  };

  const handleLongitudeChange = (event: any, index: any) => {
    const { value } = event.target;
    setFormData((prevData:any) => ({
      ...prevData,
      longitude: prevData.longitude.map((lon:any, i:any) => (i === index ? value : lon)),
    }));
  };

  const handleStateNameChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    const newInputValues = [...formData?.StateName];
    newInputValues[index] = value;
    setFormData((prev: any) => ({
      ...prev,
      StateName: newInputValues
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
      newError.stateName[index] = "";
    } else {
      newError.stateName[index] = "Value already entered in another field.";
    }

    setError(newError);
  };

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("location/check-states", {
      countryId: Number(formData?.countryId),
      stateName: value
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
    if (formData?.countryId && value !== "") {
      alreadyExistName(name, value, index).then((error) => {
        newOnBlurErrors[index] = error;
        setOnBlurErrors(newOnBlurErrors);
      });
    } else {
      newOnBlurErrors[index] = "";
      setOnBlurErrors(newOnBlurErrors);
    }
  }

  const handleSubmit = async () => {
    let isError = false;
    const newError: any = { ...error };

    if (!formData.countryId) {
      newError["countries"] = "Country is required";
      isError = true;
    }

    newError.stateName = [];
    formData.StateName.forEach((inputValue:any, index:any) => {
      const regex = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue.trim());

      if (index === 0 && inputValue.trim() === '') {
        newError.stateName[index] = 'State Name is required.';
        isError = true;
      } else if (!valid) {
        if (inputValue.trim() !== '') {
          newError.stateName[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = formData.StateName.some(
          (input:any, i:any) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
        );
        if (isValueAlreadyEntered) {
          newError.stateName[index] = "Value already entered in another field.";
          isError = true;
        }
      }
    });

    setError(newError);

    if (isError) {
      return;
    }

    const mergedErrors = newError?.stateName?.map((error: any, index: any) => onBlurErrors[index] || error);
    setError({ ...error, stateName: mergedErrors });

    const hasMergeErrors = onBlurErrors.some(error => error !== '');
    if (!hasMergeErrors) {
      setIsSubmitting(true);
      if (formData.countryId && formData.StateName[0] !== "") {
        const stateData = {
          countryId: Number(formData.countryId),
          stateName: formData.StateName
            .map((stateName:any, index:any) => ({
              stateName: stateName,
              latitude: formData.latitude[index],
              longitude: formData.longitude[index],
            }))
            .filter((state:any) => state.stateName !== ""),
        };

        const url = "location/set-state";
        try {
          const response = await API.post(url, stateData);
          if (response.success) {
            // Handle success response
            if (response.data.pass.length > 0) {
              const dataPassed = response.data.pass;
              const passedName = dataPassed.map((name: any) => name.data.state_name).join(', ')
              toasterSuccess(`Following state/states have been added successfully: ${passedName} `, response.data.id, 3000)
            }

            // Handle failed response
            if (response.data.fail.length > 0) {
              const dataFailed = response.data.fail;
              const failedName = dataFailed.map((name: any) => name.data.state_name).join(', ')
              toasterError(`Following state/states have been skipped as they already exist: ${failedName} `, response.data.id, 3000)
            }

            router.push('/master/location/state')
          }
        } catch (error) {
          setIsSubmitting(false);
          console.log(error, "error");
        }
      }
    }
  };


  // const handleErrors = () => {
  //   let isError = false;

  //   if (!formData.countryId) {
  //     setError((prevError: any) => ({
  //       ...prevError,
  //       countries: "Country is required",
  //     }));
  //     isError = true;
  //   }

  //   const newError: any = { ...error };
  //   newError.stateName = [];

  //   formData.StateName.map((inputValue, index) => {
  //     const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
  //     const valid = regex.test(inputValue)
  //     if (index === 0 && inputValue === '') {
  //       newError.stateName[index] = 'State Name is required.';
  //       isError = true;
  //     } else if (!valid) {
  //       if (inputValue != '') {
  //         newError.stateName[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
  //         isError = true;
  //       }
  //     }
  //   });
  //   setError((prevError: any) => ({
  //     ...prevError,
  //     stateName: newError.stateName,
  //   }));

  //   const hasMergeErrors = Object.values(error).some((error: any) => error !== '');
  //   if (hasMergeErrors) {
  //     return isError
  //   }
  // }

  // const handleSubmit = async () => {

  //   if (handleErrors()) {
  //     return
  //   }

  //   if (formData.countryId && formData.StateName[0] !== "") {
  //     const stateData = {
  //       countryId: Number(formData.countryId),
  //       stateName: formData.StateName
  //         .map((stateName, index) => ({
  //           stateName: stateName,
  //           latitude: formData.latitude[index],
  //           longitude: formData.longitude[index],
  //         }))
  //         .filter((state) => state.stateName !== ""),
  //     };

  //     const url = "location/set-state";
  //     try {
  //       const response = await API.post(url, stateData);
  //       if (response.success) {
  //         if (response.data.pass.length > 0) {
  //           const dataPassed = response.data.pass;
  //           const passedName = dataPassed.map((name: any) => name.data.state_name).join(', ')
  //           toasterSuccess(`Following state/states have been added successfully: ${passedName} `)
  //         }
  //         if (response.data.fail.length > 0) {
  //           const dataFailed = response.data.fail;
  //           const failedName = dataFailed.map((name: any) => name.data.state_name).join(', ')
  //           toasterError(`Following state/states have been skipped as they already exist: ${failedName} `)
  //         }
  //         router.push('/master/location/state')
  //       }
  //     } catch (error) {
  //       console.log(error, "error");
  //     }
  //   }
  // };
  const handleCancel = () => {
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
                <li>Location</li>
                <li>
                  <Link href="/master/location/state">
                    State
                  </Link>
                </li>
                <li>Add State</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div>
   
             <Select
                        name="countryId"
                        value={formData.countryId ? { label: countries?.find((program: any) => program.id == formData.countryId)?.county_name, value: formData.countryId } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select a Country"
                        className="dropDownFixes rounded-md w-96 formDropDown mt-1 text-sm borderBottom"
                        options={(countries || []).map(({ id, county_name }: any) => ({
                          label: county_name,
                          value: id,
                          key: id
                        }))}
                        onChange={(item: any) => {
                          handleCountryChange("countryId", item?.value);
                        }}
                      />
            {error.countries && (
              <div className="text-red-500 text-sm mt-1">{error.countries}</div>
            )}
          </div>
          <div className='input-container mt-4'>
            <div className="input-container mt-4">
              {[...Array(10)].map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-3 gap-4 ">
                <div >
                    <input
                      type="text"
                      name={`StateName[${rowIndex}]`}
                      placeholder={translations.location.stateName}
                      className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[rowIndex] !== "" ? 'border-red-500' : 'border'}`}

                      value={formData.StateName[rowIndex]}
                      onChange={(event) => handleStateNameChange(rowIndex, event)}
                      onBlur={(e) => onBlurCheck(e, rowIndex)}
                    />

                    {/* {error.stateName[rowIndex] !== "" && ( */}
                    <div className="text-red-500 text-sm">{onBlurErrors[rowIndex] ? onBlurErrors[rowIndex] : error.stateName[rowIndex]}</div>
                    {/* )} */}
                  </div>

                  <div className="column">
                    <input
                      type="number"
                      name={`latitude[${rowIndex}]`}
                      placeholder={translations.location.latitude}
                      className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[rowIndex] !== "" ? 'border-red-500' : 'border'}`}
                      value={formData.latitude[rowIndex]}
                      onChange={(event) => handleLatitudeChange(event, rowIndex)}
                    />
                  </div>

                  <div className="column mr-3">
                    <input
                      type="number"
                      name={`longitude[${rowIndex}]`}
                      placeholder={translations.location.longitude}
                      className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[rowIndex] !== "" ? 'border-red-500' : 'border'}`}
                      value={formData.longitude[rowIndex]}
                      onChange={(event) => handleLongitudeChange(event, rowIndex)}
                    />
                  </div>

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
        </div>
        {/* <hr className="mt-2 mb-4" /> */}
      </div>
    </>
  );

}