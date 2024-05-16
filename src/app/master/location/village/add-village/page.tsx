"use client";
import { useEffect, useRef, useState } from "react";
import useTranslations from "@hooks/useTranslation";
import User from "@lib/User";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
interface Country {
  id: number;
  county_name: string;
}
interface State {
  id: number;
  state_name: string;
}
export default function Page() {
  useTitle("Add Village");
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [formData, setFormData] = useState({
    countryId: "",
    stateId: "",
    districtId: "",
    blockId: "",
    latitude: Array(16).fill(""),
    longitude: Array(16).fill(""),
    villageName: Array(16).fill(""),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [onBlurErrors, setOnBlurErrors] = useState(new Array(16).fill(""));

  const [error, setError] = useState<any>({
    countries: '',
    state: '',
    district: '',
    block: '',
    village: [],
  });

  useEffect(() => {
    User.role();
    getCountries();
  }, []);

  useEffect(() => {
    if (formData.countryId) {
      getStates();
    }
  }, [formData.countryId]);

  useEffect(() => {
    if (formData.stateId) {
      getDistricts();
    }
  }, [formData.stateId]);

  useEffect(() => {
    if (formData.districtId) {
      getBlocks();
    }
  }, [formData.districtId]);

  const getCountries = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        setCountries(response.data);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getStates = async () => {
    try {
      const res = await API.get(
        `location/get-states?status=true&countryId=${formData.countryId}&status=true`
      );
      if (res.success) {
        setStates(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      const res = await API.get(
        `location/get-districts?stateId=${formData.stateId}&status=true`
      );
      if (res.success) {
        setDistricts(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBlocks = async () => {
    try {
      const res = await API.get(
        `location/get-blocks?districtId=${formData.districtId}&status=true`
      );
      if (res.success) {
        setBlocks(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "countryId") {
      setFormData((prevData: any) => ({
        ...prevData,
        districtId: "",
        blockId: "",
        stateId: "",
      }));
      setError((prevError: any) => ({
        ...prevError,
        countries: "",
      }));
    } else if (name === "stateId") {
      setFormData((prevData: any) => ({
        ...prevData,
        districtId: "",
        blockId: "",
      }));
      setError((prevError: any) => ({
        ...prevError,
        state: "",
      }));
    } else if (name === "districtId") {
      setFormData((prevData: any) => ({
        ...prevData,
        blockId: "",
      }));
      setError((prevError: any) => ({
        ...prevError,
        district: "",
      }));
    } else if (name === "blockId") {
      setError((prevError: any) => ({
        ...prevError,
        block: "",
      }));
    }

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("location/check-villages", {
      blockId: Number(formData?.blockId),
      villageName: value
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
    if (formData?.blockId && value !== "") {
      alreadyExistName(name, value, index).then((error) => {
        newOnBlurErrors[index] = error;
        setOnBlurErrors(newOnBlurErrors);
      });
    } else {
      newOnBlurErrors[index] = "";
      setOnBlurErrors(newOnBlurErrors);
    }
  }

  const handleVillageChange = (event: any, index: any) => {
    const { value } = event.target;
    const villageName: any = [...formData?.villageName];

    setFormData((prevData) => ({
      ...prevData,
      villageName: prevData.villageName.map((name, i) =>
        i === index ? value : name
      ),
    }));

    const isBackspaceAndEmpty =
      (event.nativeEvent as InputEvent).inputType === "deleteContentBackward" &&
      value === "";

    // Check if the value is already entered in another field
    const isValueAlreadyEntered = villageName.some(
      (input: any, i: any) =>
        input.trim().toLowerCase() === value.trim().toLowerCase() && i !== index
    );

    setError((prevError: any) => ({
      ...prevError,
      village: [
        ...prevError.village.slice(0, index),
        isBackspaceAndEmpty || !isValueAlreadyEntered ? "" : "Value already entered in another field.",
        ...prevError.village.slice(index + 1)
      ]
    }));
  };

  const handleLatitudeChange = (event: any, index: any) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      latitude: prevData.latitude.map((lat, i) => (i === index ? value : lat)),
    }));
  };

  const handleLongitudeChange = (event: any, index: any) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      longitude: prevData.longitude.map((lon, i) =>
        i === index ? value : lon
      ),
    }));
  };

  const handleErrors = () => {
    let isError = true;
    const newError: any = { ...error };

    if (!formData.countryId || formData.countryId === "") {
      newError["countries"] = "Country Name is required";
      isError = false;
    }

    if (!formData.stateId) {
      newError["state"] = "State Name is required";
      isError = false;
    }

    if (!formData.districtId) {
      newError["district"] = "District Name is required";
      isError = false;
    }

    if (!formData.blockId) {
      newError["block"] = "Block Name is required";
      isError = false;
    }

    formData.villageName.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue);

      if (index === 0 && inputValue === '') {
        newError.village[index] = 'Village Name is required.';
        isError = false;

      } else if (!valid) {
        if (inputValue != '') {
          newError.village[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = false;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = formData.villageName.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() && i !== index
        );
        if (isValueAlreadyEntered) {
          newError.village[index] = "Value already entered in another field.";
          isError = false;
        }
      }
    });

    const mergedErrors = newError?.village?.map((error: any, index: any) => onBlurErrors[index] || error);
    setError({ ...error, ...newError, village: mergedErrors });

    const hasMergeErrors = onBlurErrors.some(error => error !== '');
    if (!hasMergeErrors) {
      return isError;
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (handleErrors() !== true) {
      return;
    }
    else {
      setIsSubmitting(true);
      const villageData = {
        blockId: Number(formData.blockId),
        village: formData.villageName
          .map((villageName: any, index: any) => ({
            villageName: villageName,
            latitude: formData.latitude[index],
            longitude: formData.longitude[index],
          }))
          .filter((village: any) => village.villageName !== ""),
      };

      const url = "location/set-village";
      try {
        const response = await API.post(url, villageData);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.village_name).join(', ')
          toasterSuccess(`Following village/villages have been added successfully: ${passedName}`, response.data.id, 3000)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.village_name).join(', ')
          toasterError(`Following village/villages have been skipped as they already exist: ${failedName}`, response.data.id, 3000)
        }
        router.push('/master/location/village')
      } catch (error) {
        setIsSubmitting(true);
        console.log(error, "error");
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
                  <Link href="/master/location/village">
                    Village
                  </Link>
                </li>
                <li>Add Village</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div className="flex flex-wrap">
            <div>
              <select
                value={formData.countryId}
                onChange={(event) => handleChange(event)}
                className="w-60 border rounded px-2 py-1 mt-3 text-sm"
                name="countryId"
              >
                <option value="">Select Country *</option>
                {countries.map((country: any) => (
                  <option key={country.id} value={country.id}>
                    {country.county_name}
                  </option>
                ))}
              </select>
              {error?.countries && (
                <div className="text-red-500 text-sm mt-1">{error.countries}</div>
              )}
            </div>
            <div>
              <select
                value={formData.stateId}
                onChange={(event) => handleChange(event)}
                className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm"
                // onChange={(event) => handleChange(event)}
                name="stateId"
              >
                <option value="">Select State *</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.state_name}
                  </option>
                ))}
              </select>
              {error?.state && (
                <div className="text-red-500 text-sm ml-5 mt-1">
                  {error.state}
                </div>
              )}
            </div>
            <div>
              <select
                value={formData.districtId}
                onChange={(event) => handleChange(event)}
                name="districtId"
                className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm"
              >
                <option value="">Select District*</option>
                {districts?.map((district: any) => (
                  <option key={district.id} value={district.id}>
                    {district.district_name}
                  </option>
                ))}
              </select>
              {error?.district && (
                <div className="text-red-500 text-sm ml-5 mt-1">
                  {error.district}
                </div>
              )}
            </div>
            <div>
              <select
                value={formData.blockId}
                onChange={(event) => handleChange(event)}
                name="blockId"
                className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm"
              >
                <option value="">Select Block*</option>
                {blocks?.map((block: any) => (
                  <option key={block.id} value={block.id}>
                    {block.block_name}
                  </option>
                ))}
              </select>
              {error?.block && (
                <div className="text-red-500 text-sm ml-5 mt-1">
                  {error.block}
                </div>
              )}
            </div>
          </div>

          <div className="input-container mt-4">
            <div className="input-container mt-4">
              {[...Array(10)].map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-3 gap-4 ">
                <div>
                    <input
                      type="text"
                      name={`villageName[${rowIndex}]`}
                      placeholder={translations.location.village}
                      className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${error[rowIndex] !== "" ? 'border-red-500' : 'border'}`}
                      value={formData.villageName[rowIndex]}
                      onChange={(event) => handleVillageChange(event, rowIndex)}
                      onBlur={(event) => onBlurCheck(event, rowIndex)}
                    />

                    {/* {rowIndex === 0 && error?.village && (
                    <div className="text-red-500 text-sm">
                      {error.village}
                    </div>
                  )} */}

                    {/* {error.village[rowIndex] !== "" && ( */}
                    <div className="text-red-500 text-sm">{onBlurErrors[rowIndex] ? onBlurErrors[rowIndex] : error.village[rowIndex]}</div>
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
