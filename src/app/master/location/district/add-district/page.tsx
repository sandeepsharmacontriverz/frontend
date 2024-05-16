"use client";
import React, { useEffect, useState } from 'react';
import useTranslations from '@hooks/useTranslation';
import User from '@lib/User';
import useTitle from "@hooks/useTitle";
import API from '@lib/Api';
import { useRouter } from '@lib/router-events';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import Link from '@components/core/nav-link';
import Select from "react-select";
interface Country {
  id: number;
  county_name: string;
}

interface State {
  id: number;
  state_name: string;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Add District")
  const router = useRouter()
  const [initializeInputFields] = useState(Array(16).fill(""))
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [formData, setFormData] = useState({
    countryId: "",
    stateId: "",
    districts: initializeInputFields,
  });
  const [error, setError] = useState<any>({
    countryId: "",
    stateId: "",
    districts: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [onBlurErrors, setOnBlurErrors] = useState(new Array(16).fill(""));

  useEffect(() => {
    User.role()
  }, [])
  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (formData.countryId) {
      getStates();
    }
  }, [formData.countryId]);

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

  const getStates = async () => {
    try {
      const res = await API.get(`location/get-states?status=true&countryId=${formData.countryId}&status=true`)
      if (res.success) {
        setStates(res.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSelectChange = (name?: any, value?: any, event?: any) => {
    setFormData((prevData:any) => ({
      ...prevData,
      [name]: value,
    }));

    setError((prevError:any) => ({
      ...prevError,
      [name]: "",
    }));
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>,
    index: number = 0
  ) => {
    const { name, value } = event.target;

      // setFormData((prevData) => {
      //   const updateDistrictName = [...prevData.districts];
      //   updateDistrictName[index] = value;
      //   return {
      //     ...prevData,
      //     districts: updateDistrictName,
      //   };
      // });
      const newInputValues = [...formData?.districts];
      newInputValues[index] = value;
      setFormData((prev: any) => ({
        ...prev,
        districts: newInputValues
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
        districts: [
          ...prevError.districts.slice(0, index),
          isBackspaceAndEmpty || !isValueAlreadyEntered ? "" : "Value already entered in another field.",
          ...prevError.districts.slice(index + 1)
        ]
      }));

  };

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("location/check-districts", {
      stateId: Number(formData?.stateId),
      districtName: value
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
    if (formData?.stateId && value !== "") {
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
    setFormData({
      countryId: "",
      stateId: "",
      districts: initializeInputFields,
    });
    setError({
      countryId: "",
      stateId: "",
      districts: [],
    });
    window.history.back();
  };


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let isError = false;
    const newError: any = { ...error };

    if (!formData.countryId) {
      newError["countryId"] = "Please select a country";
      isError = true
    }

    if (!formData.stateId) {
      newError["stateId"] = "Please select a state";
      isError = true
    }

    formData.districts.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.districts[index] = 'District Name is required.';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError.districts[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = formData.districts.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
        );
        if (isValueAlreadyEntered) {
          newError.districts[index] = "Value already entered in another field.";
          isError = true;
        }
      }
    });

    const mergedErrors = newError?.districts?.map((error: any, index: any) => onBlurErrors[index] || error);
    setError({ ...error, ...newError, districts: mergedErrors });

    const hasMergeErrors = onBlurErrors.some(error => error !== '');
    if (!hasMergeErrors) {
      if (formData.countryId && formData.stateId && !isError) {
        const stateData = {
          stateId: Number(formData.stateId),
          districtName: formData.districts.filter((district) => district !== "")
        };
        const url = "location/set-district";
        try {
          setIsSubmitting(true);
          const response = await API.post(url, stateData);
          if (response.success) {
            if (response.data.pass.length > 0) {
              const dataPassed = response.data.pass;
              const passedName = dataPassed.map((name: any) => name.data.district_name).join(', ')
              toasterSuccess(`Following district/districts have been added successfully: ${passedName}`, response.data.id, 3000)
            }
            if (response.data.fail.length > 0) {
              const dataFailed = response.data.fail;
              const failedName = dataFailed.map((name: any) => name.data.district_name).join(', ')
              toasterError(`Following district/districts have been skipped as they already exist: ${failedName}`, response.data.id, 3000)
            }
            router.push('/master/location/district')
          }
        } catch (error) {
          setIsSubmitting(false);
          console.log(error, "error");
        }
      }
    }
  };

  const { translations, loading } = useTranslations();

  if (loading) { return <div> Loading...</div> }



  return (
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
              <li>Location</li>
              <li>
                <Link href="/master/location/district">
                  District
                </Link>
              </li>
              <li>Add District</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-4">
        <div className=" ml-4 mt-3">
          <div className="flex gap-4">
            <div>
              {/* <select className="w-60 border rounded px-2 py-1 text-sm"
                value={formData.countryId}
                onChange={(event) => handleChange(event)}
                name="county_name" >
                <option value="" className="text-sm">
                  Select Countries
                </option>
                {countries.map((country: any) => (
                  <option key={country.id} value={country.id}>
                    {country.county_name}
                  </option>
                ))}
              </select> */}
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
                          handleSelectChange("countryId", item?.value);
                        }}
                      />
              {error.countryId && <p className="text-red-500 text-sm mt-1">{error.countryId}</p>}
            </div>
            <div>
              {/* <select
                value={formData.stateId}
                onChange={(event) => handleChange(event)}
                name="state_name"
                placeholder="Select Country"
                className="w-60 border rounded px-2 py-1 text-sm"
              >
                <option value="">Select a State</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.state_name}
                  </option>
                ))}

              </select> */}
               <Select
                        name="stateId"
                        value={formData.stateId ? { label: states?.find((states: any) => states.id == formData.stateId)?.state_name, value: formData.stateId } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select a State"
                        className="dropDownFixes rounded-md w-96 formDropDown mt-1 text-sm borderBottom"
                        options={(states || []).map(({ id, state_name }: any) => ({
                          label: state_name,
                          value: id,
                          key: id
                        }))}
                        onChange={(item: any) => {
                          handleSelectChange("stateId", item?.value);
                        }}
                      />
              {error.stateId && <p className="text-red-500 text-sm mt-1">{error.stateId}</p>}
            </div>
          </div>

          <div className='input-container mt-4'>
            <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
              {initializeInputFields.map((district, index) => (
                <div className="mb-2" key={index}>
                  <input
                    id={`districts-${index}`}
                    type="text"
                    name="district_name"
                    placeholder={index === 0 ? translations.location.districtName + "*" : translations.location.districtName}
                    className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[index] !== "" ? 'border-red-500' : 'border'}`}
                    defaultValue={district}
                    onChange={(event) => handleChange(event, index)}
                    onBlur={(e) => onBlurCheck(e, index)}
                  />
                  {/* {error.districts[index] !== "" && ( */}
                  <div className="text-red-500 text-sm">{onBlurErrors[index] ? onBlurErrors[index] : error.districts[index]}</div>
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
        </div>
      </div>
    </div>
  );
}
