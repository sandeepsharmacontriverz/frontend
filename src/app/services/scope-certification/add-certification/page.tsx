"use client";
import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import { useRouter } from "@lib/router-events";
import "react-datepicker/dist/react-datepicker.css";
import useTitle from "@hooks/useTitle";
import NavLink from "@components/core/nav-link";
import { GrAttachment } from "react-icons/gr";
import API from "@lib/Api";
import { toasterSuccess } from "@components/core/Toaster";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import Select, { GroupBase, StylesConfig } from "react-select";
import Loader from "@components/core/Loader";

export default function page() {
  const [roleLoading] = useRole();
  useTitle("Add Scope Certificate");
  const { translations, loading } = useTranslations();
  const router = useRouter();
  const selectRef = useRef(null);
  const [otherStandard, setOtherStandard] = useState("");
  const [brands, setBrands] = useState<any>([]);
  const [countries, setCountries] = useState<any>([]);
  const [states, setStates] = useState<any>([]);
  const [icsnames, setIcsName] = useState<any>([]);
  const [farmGroups, setFarmGroups] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState<any>({});
  const [programId, setProgramId] = useState(Number);
  const [formData, setFormData] = useState<any>({
    brand: null,
    country: null,
    state: null,
    farmGroup: null,
    icsName: null,
    scopeValidity: null,
    standard: "",
    standardOthers: "",
    uploadDocuments: "",
  });

  const [fileName, setFileName] = useState<any>({
    uploadDocuments: "",
  });

  const [errors, setErrors] = useState<any>({
    brand: null,
    country: "",
    state: "",
    farmGroup: "",
    scopeValidity: "",
    icsName: "",
    standard: "",
    standardOthers: "",
    uploadDocuments: "",
  });

  useEffect(() => {
    getProgram();
    fetchCountry();
  }, []);

  useEffect(() => {
    if (programId) {
      fetchBrand();
    }
  }, [programId]);

  useEffect(() => {
    setStates([]);
    if (formData.country !== undefined && formData.country !== null && formData.country !== "") {
      fetchState();
    }
    else {
      setStates(null)
      setFormData((prevData: any) => ({
        ...prevData,
        state: null,
      }));

    }

  }, [formData.country]);

  useEffect(() => {
    setFarmGroups([]);
    if (formData.brand !== undefined && formData.brand !== null && formData.brand !== "") {
      fetchFarmGroup();
    }
    else {
      setFarmGroups([])
      setFormData((prevData: any) => ({
        ...prevData,
        farmGroup: null,
      }));
    }
  }, [formData.brand]);

  useEffect(() => {
    setIcsName([]);
    if (formData.farmGroup !== undefined && formData.farmGroup !== null && formData.farmGroup !== "") {
      fetchIcsName();
    }
    else {
      setIcsName([])
      setFormData((prevData: any) => ({
        ...prevData,
        icsName: null,
      }));

    }
  }, [formData.farmGroup]);

  const getProgram = async () => {
    try {
      const res = await API.get("program?status=true");
      if (res.success) {
        let isOrganic = res.data.find(
          (item: any) => item.program_name.toLowerCase() === "organic"
        );
        setProgramId(isOrganic.id);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchBrand = async () => {
    try {
      if (programId) {
        const res = await API.get(`brand?programId=${programId}`);
        if (res.success) {
          setBrands(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchCountry = async () => {
    try {
      const res = await API.get(`location/get-countries?status=true`);
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchState = async () => {
    try {
      if (formData.country !== undefined && formData.country !== null && formData.country !== "") {

        const res = await API.get(
          `location/get-states?status=true&countryId=${formData.country}`
        );
        if (res.success) {
          setStates(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchFarmGroup = async () => {
    try {
      if (formData.brand !== undefined && formData.brand !== null && formData.brand !== "") {

        const res = await API.get(`farm-group?brandId=${Number(formData.brand)}`);
        if (res.success) {
          setFarmGroups(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchIcsName = async () => {

    try {
      if (formData.farmGroup !== undefined && formData.farmGroup !== null && formData.farmGroup !== "") {

        const res = await API.get(
          `ics?farmGroupId=${Number(formData.farmGroup)}`
        );
        if (res.success) {
          setIcsName(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleCancel = () => {
    router.back();
  };

  const dataUpload = async (e: any, name: any) => {
    const url = "file/upload";

    const allowedFormats = [
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];
    const dataVideo = new FormData();

    if (!e) {
      return setErrors((prevError: any) => ({
        ...prevError,
        [e]: "No File Selected",
      }));
    } else {
      if (!allowedFormats.includes(e?.type)) {
        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "Invalid file format.Upload a valid Format",
        }));

        e = "";
        return;
      }

      const maxFileSize = 5 * 1024 * 1024;

      if (e.size > maxFileSize) {
        setErrors((prevError: any) => ({
          ...prevError,
          [name]: `File size exceeds the maximum limit (5MB).`,
        }));

        e = "";
        return;
      }

      setErrors((prevError: any) => ({
        ...prevError,
        [name]: "",
      }));

      dataVideo.append("file", e);
      try {
        const response = await API.postFile(url, dataVideo);
        if (response.success) {
          setFileName((prevFile: any) => ({
            ...prevFile,
            [name]: e.name,
          }));
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            [name]: response.data,
          }));

          setErrors((prev: any) => ({
            ...prev,
            [name]: "",
          }));
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  };
  // const handleChange = (e: any, brandName?: string) => {
  const handleChange = (name?: any, value?: any, event?: any) => {

    // if (brandName === "brand") {
    //   setFormData((prevData: any) => ({
    //     ...prevData,
    //     brand: value,
    //   }));
    // }
    if (name === "standard" && value === "Others") {
      setOtherStandard("");
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        standard: value,
      }));
    } else {
      if (name === "uploadDocuments") {
        dataUpload(value, name);
        return;
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
        }));
      }
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      scopeValidity: date,
    }));
  };

  const onBlur = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;

    if (value != "" && type == "alphabets") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only Alphabets and special characters like comma(,),_,-,(),.",
        }));
      }
      return;
    }
  };
  const validateForm = () => {
    const requiredFields = ["brand", "country", "state", "farmGroup", "icsName", "scopeValidity", "uploadDocuments"];
    const newErrors = {} as Record<string, string>;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field] === "") {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is Required`;
      }
    });

    if (formData.standard === "Others" && !formData.standardOthers) {
      newErrors.standardOthers = "Others is Required";
    } else if (formData.standardOthers && !regexAlphabets.test(formData.standardOthers)) {
      newErrors.standardOthers = "Others accepts only Alphabets and special characters like comma(,),_,-,(),.";
    }

    if (!formData.uploadDocuments) {
      newErrors.uploadDocuments = "Upload Document is Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      const url = "scope-certificate";
      const mainFormData = {
        countryId: formData.country,
        stateId: formData.state,
        icsId: formData.icsName,
        brandId: Number(formData.brand),
        farmGroupId: formData.farmGroup,
        validityEnd: formData.scopeValidity,
        standard:
          formData.standard === "Others"
            ? formData.standardOthers
            : formData.standard,
        document: formData.uploadDocuments,
      };
      const mainResponse = await API.post(url, mainFormData);

      if (mainResponse.success) {
        toasterSuccess("Scope Certification added successfully");
        router.push("/services/scope-certification");
      } else {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }

  if (!roleLoading) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <NavLink href="/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>Services</li>
                <li>
                  <NavLink href="/services/scope-certification">
                    Scope Certification
                  </NavLink>
                </li>
                <li>Add Scope Certification</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div className="w-100 mt-4">
            <div className="row">
              <div className="col-12 col-sm-6 col-md-6">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.common?.brand} *
                </label>
                <Select
                  value={formData.brand ? { label: brands?.find((brand: any) => brand.id == formData.brand)?.brand_name, value: formData.brand } : null}
                  isClearable
                  placeholder="Select Brand"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={
                    (brands || []).map(({ id, brand_name }: any) => ({
                      label: brand_name,
                      value: id,
                    }))
                  }
                  onChange={(item: any) => {
                    handleChange("brand", item?.value);
                  }}
                />
                {errors?.brand !== "" && (
                  <div className="text-sm px-2 py-1 text-red-500">
                    {errors.brand}
                  </div>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-6 custom-select">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.common?.country} *
                </label>
                <Select
                  name="country"
                  value={formData.country ? { label: countries?.find((county: any) => county.id == formData.country)?.county_name, value: formData.country } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select a Country"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(countries || []).map(({ id, county_name }: any) => ({
                    label: county_name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleChange("country", item?.value);
                  }}
                />
                {errors?.country && (
                  <p className="text-red-500 text-sm mt-1">{errors?.country}</p>
                )}
              </div>

              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.common?.state} *
                </label>
                <Select
                  name="state"
                  value={formData.state ? { label: states?.find((state: any) => state.id == formData.state)?.state_name, value: formData.state } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select State"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(states || []).map(({ id, state_name }: any) => ({
                    label: state_name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleChange("state", item?.value);
                  }}
                />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>

              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.farmGroup} *
                </label>
                <Select
                  name="farmGroup"
                  value={formData.farmGroup ? { label: farmGroups?.find((farmGroup: any) => farmGroup.id == formData.farmGroup)?.name, value: formData.farmGroup } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Farm Group"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(farmGroups || []).map(({ id, name }: any) => ({
                    label: name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleChange("farmGroup", item?.value);
                  }}
                />
                {errors.farmGroup && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.farmGroup}
                  </p>
                )}
              </div>

              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.icsName} *
                </label>
                <Select
                  name="icsName"
                  value={formData.icsName ? { label: icsnames?.find((ics: any) => ics.id == formData.icsName)?.ics_name, value: formData.icsName } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Ics Name"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(icsnames || []).map(({ id, ics_name }: any) => ({
                    label: ics_name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleChange("icsName", item?.value);
                  }}
                />

                {errors.icsName && (
                  <p className="text-red-500 text-sm mt-1">{errors.icsName}</p>
                )}
              </div>

              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Scope Validity End *
                </label>
                <DatePicker
                  showIcon
                  selected={formData.scopeValidity}
                  onChange={handleDateChange}
                  showYearDropdown
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                />
                {errors.scopeValidity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.scopeValidity}
                  </p>
                )}
              </div>
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Standard
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        className="form-radio"
                        name="standard"
                        value="NOP"
                        checked={formData.standard === "NOP"}
                        onChange={(e) => handleChange("standard", e.target.value)}
                      />
                      <span></span>
                    </section>
                    NOP
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        className="form-radio"
                        name="standard"
                        value="NPOP"
                        checked={formData.standard === "NPOP"}
                        onChange={(e) => handleChange("standard", e.target.value)}
                      />
                      <span></span>
                    </section>
                    NPOP
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        className="form-radio"
                        name="standard"
                        value="Others"
                        checked={formData.standard === "Others"}
                        onChange={(e) => handleChange("standard", e.target.value)}
                      />
                      <span></span>
                    </section>
                    Others
                  </label>
                </div>
                {errors.standard && (
                  <p className="text-red-500 text-sm mt-1">{errors.standard}</p>
                )}
              </div>
              {formData.standard === "Others" && (
                <div className="col-12 col-sm-6 col-md-6 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Others *
                  </label>
                  <input
                    type="text"
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    onChange={(e) => handleChange("standardOthers", e.target.value)}
                    onBlur={(e) => onBlur(e, "alphabets")}
                    value={formData.standardOthers}
                    name="standardOthers"
                  />
                  {errors?.standardOthers !== "" && (
                    <div className="text-sm text-red-500 mt-1">
                      {errors.standardOthers}
                    </div>
                  )}
                </div>
              )}
              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Upload Documents *
                </label>
                <div className="inputFile">
                  <label>
                    Choose File <GrAttachment />
                    <input
                      name="uploadDocuments"
                      type="file"
                      accept="  application/pdf, image/jpg, image/jpeg"
                      onChange={(e) => handleChange("uploadDocuments", e?.target?.files?.[0])}
                    />
                  </label>
                </div>
                <p className="py-2 text-sm">
                  (Max: 500KB) (Format: jpg/jpeg/pdf)
                </p>
                {fileName.uploadDocuments && (
                  <div className="flex text-sm mt-1">
                    <GrAttachment />
                    <p className="mx-1">{fileName.uploadDocuments}</p>
                  </div>
                )}
                {/* {errors?.uploadDocuments !== "" && (
                <div className="text-sm text-red-500">
                  {errors.uploadDocuments}
                </div>
              )} */}

                {imageErrors?.uploadDocuments ? (
                  <div className="text-sm text-red-500  ">
                    {imageErrors.uploadDocuments}
                  </div>
                ) : (
                  errors?.uploadDocuments !== "" && (
                    <div className="text-sm text-red-500  ">
                      {errors.uploadDocuments}
                    </div>
                  )
                )}
              </div>
            </div>

            <hr className="mb-3 mt-3" />

            <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup ">
              <button
                className="btn-purple mr-2"
                disabled={isSubmitting}
                style={
                  isSubmitting
                    ? { cursor: "not-allowed", opacity: 0.8 }
                    : { cursor: "pointer", backgroundColor: "#D15E9C" }
                }
                onClick={handleSubmit}
              >
                {translations?.common?.submit}
              </button>
              <button className="btn-outline-purple" onClick={handleCancel}>
                {translations?.common?.cancel}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
