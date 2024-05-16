"use client";
import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import Link from "@components/core/nav-link";
import "react-datepicker/dist/react-datepicker.css";
import useTitle from "@hooks/useTitle";
import { GrAttachment } from "react-icons/gr";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import { toasterSuccess } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";

export default function page() {
  const [roleLoading] = useRole();
  useTitle("Edit Scope Certificate");
  const { translations, loading } = useTranslations();

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [startDate, setStartDate] = useState<any>(null);
  const [otherStandard, setOtherStandard] = useState("");
  const [brands, setBrands] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [icsnames, setIcsName] = useState([]);
  const [farmGroups, setFarmGroups] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState<any>({});
  const [fileName, setFileName] = useState<any>();

  const [formData, setFormData] = useState<any>({
    id,
    date: "",
    brand: "",
    country: "",
    state: "",
    farmGroup: "",
    icsName: "",
    scopeValidity: "",
    standard: "",
    uploaddocuments: "",
  });

  const [errors, setErrors] = useState<any>({
    brand: "",
    country: "",
    state: "",
    farmGroup: "",
    scopeValidity: "",
    icsName: "",
    standard: "",
    standardOthers: "",
    uploaddocuments: "",
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    fetchBrand();
    fetchCountry();
  }, []);

  useEffect(() => {
    if (formData.country) {
      fetchState();
    } else {
      setStates([]);
      setFormData({ ...formData, state: "" });
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.brand) {
      fetchFarmGroup();
    } else {
      setFarmGroups([]);
      setIcsName([]);
      setFormData({ ...formData, farmGroup: "", icsName: "" });
    }
  }, [formData.brand]);

  useEffect(() => {
    if (formData.farmGroup) {
      fetchIcsName();
    } else {
      setIcsName([]);
      setFormData({ ...formData, icsName: "" });
    }
  }, [formData.farmGroup]);

  const fetchData = async () => {
    const response = await API.get(`scope-certificate/${id}`);
    if (response.success) {
      setFormData((prevData: any) => {
        return {
          ...prevData,
          brand: response?.data?.brand?.id,
          country: response?.data?.country.id,
          state: response?.data?.state.id,
          farmGroup: response?.data?.farmGroup?.id,
          icsName: response?.data?.ics?.id,
          scopeValidity: response?.data?.validity_end?.substring(0, 10),
          standard:
            response?.data?.standard === ""
              ? ""
              : response?.data?.standard === "NOP"
                ? "NOP"
                : response?.data?.standard === "NPOP"
                  ? "NPOP"
                  : "Others",
          uploaddocuments: response?.data?.document,
        };
      });
      let file = response?.data?.document?.split("file/");
      setFileName(file[1]);

      setOtherStandard(
        response?.data?.standard === "NOP"
          ? ""
          : response?.data?.standard === "NPOP"
            ? ""
            : response?.data?.standard
      );
      setStartDate(new Date(response?.data?.validity_end));
    }
  };

  const fetchBrand = async () => {
    try {
      const res = await API.get("brand");
      if (res.success) {
        setBrands(res.data);
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
      const res = await API.get(
        `location/get-states?status=true&countryId=${formData.country}`
      );
      if (res.success) {
        setStates(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchFarmGroup = async () => {
    try {
      const res = await API.get(`farm-group?brandId=${Number(formData.brand)}`);
      if (res.success) {
        setFarmGroups(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchIcsName = async () => {
    try {
      const res = await API.get(
        `ics?farmGroupId=${Number(formData.farmGroup)}`
      );
      if (res.success) {
        setIcsName(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dataUpload = async (e: any, name: any) => {
    const url = "file/upload";

    const allowedFormats = ["image/jpeg", "image/jpg", "application/pdf"];

    const dataVideo = new FormData();
    if (name === "uploaddocuments") {
      if (!e.target.files[0]) {
        return setImageErrors((prevError: any) => ({
          ...prevError,
          [e.target.name]: "No File Selected",
        }));
      } else {
        if (!allowedFormats.includes(e.target.files[0]?.type)) {
          setImageErrors((prevError: any) => ({
            ...prevError,
            [name]: "Invalid file format.Upload a valid Format",
          }));

          e.target.value = "";
          return;
        }

        const maxFileSize = 500 * 1024;

        if (e.target.files[0].size > maxFileSize) {
          setImageErrors((prevError: any) => ({
            ...prevError,
            [name]: `File size exceeds the maximum limit (500KB)`,
          }));

          e.target.value = "";
          return;
        }

        setErrors((prevError: any) => ({
          ...prevError,
          [e.target.name]: "",
        }));

        setImageErrors((prevError: any) => ({
          ...prevError,
          [e.target.name]: "",
        }));
      }
      dataVideo.append("file", e.target.files[0]);
      try {
        const response = await API.postFile(url, dataVideo);
        if (response.success) {
          setFileName(e.target.files[0].name);
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            [e.target.name]: response.data,
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

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const file = e.target.files[0];
      setSelectedFiles(file);
    } else {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
    if (name === "uploaddocuments") {
      dataUpload(e, name);
      return;
    }
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {} as Record<string, string>;

    if (!formData.brand) {
      newErrors.brand = "Brand is Required";
    }

    if (!formData.country) {
      newErrors.country = "Country is Required";
    }

    if (!formData.state) {
      newErrors.state = "State is Required";
    }

    if (!formData.farmGroup) {
      newErrors.farmGroup = "FarmGroup is Required";
    }

    if (!formData.icsName) {
      newErrors.icsName = "ICS Name is Required";
    }

    if (!formData.scopeValidity) {
      newErrors.scopeValidity = "Date is Required";
    }

    if (
      formData.standard === "Others" &&
      (!otherStandard || otherStandard === "")
    ) {
      newErrors.standardOthers = "Others is Required";
    }

    if (!formData.uploaddocuments) {
      newErrors.uploaddocuments = "Upload Document is Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleStartDate = (date: any) => {
    const formattedDate = date?.toLocaleDateString("en-CA");
    setStartDate(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      scopeValidity: formattedDate,
    }));
  };
  function isPDF(url: any) {
    return typeof url === "string" && url.endsWith(".pdf");
  }
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);

      const url = "scope-certificate";
      const mainFormData = {
        id: formData.id,
        countryId: formData.country,
        stateId: formData.state,
        icsId: formData.icsName,
        brandId: Number(formData.brand),
        farmGroupId: formData.farmGroup,
        validityEnd: formData.scopeValidity,
        standard:
          formData.standard === ""
            ? ""
            : formData.standard === "Others"
              ? otherStandard
              : formData.standard,
        document: formData.uploaddocuments,
      };

      const mainResponse = await API.put(url, mainFormData);

      if (mainResponse.success) {
        toasterSuccess("Scope Certification edit successfully");
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
                  <Link href="/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Services</li>
                <li>
                  <Link href="/services/scope-certification">
                    Scope Certification
                  </Link>
                </li>
                <li>Edit Scope Certification</li>
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
                <select
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  onChange={handleChange}
                  name="brand"
                  value={formData.brand}
                >
                  <option value="">{translations?.common?.Selectbrand}</option>
                  {brands?.map((brand: any) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.brand_name}
                    </option>
                  ))}
                </select>
                {errors.brand && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
                )}
              </div>

              <div className="col-12 col-sm-6 col-md-6 ">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.common?.country} *
                </label>
                <select
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  onChange={handleChange}
                  name="country"
                  value={formData.country}
                >
                  <option value="">
                    {translations?.common?.SelectCountry}
                  </option>
                  {countries?.map((country: any) => (
                    <option key={country.id} value={country.id}>
                      {country.county_name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                )}
              </div>

              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.common?.state} *
                </label>
                <select
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  onChange={handleChange}
                  name="state"
                  value={formData.state}
                >
                  <option value="">{translations?.common?.SelectState}</option>
                  {states?.map((state: any) => (
                    <option key={state.id} value={state.id}>
                      {state.state_name}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>

              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.farmGroup} *
                </label>
                <select
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  value={formData.farmGroup}
                  name="farmGroup"
                  onChange={handleChange}
                >
                  <option value="">Select Farm Group</option>
                  {farmGroups?.map((farmgroup: any) => (
                    <option key={farmgroup.id} value={farmgroup.id}>
                      {farmgroup.name}
                    </option>
                  ))}
                </select>
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
                <select
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  onChange={handleChange}
                  value={formData.icsName}
                  name="icsName"
                >
                  <option value="">Select ICS Name</option>
                  {icsnames?.map((icsname: any) => (
                    <option key={icsname.id} value={icsname.id}>
                      {icsname.ics_name}
                    </option>
                  ))}
                </select>
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
                  selected={startDate}
                  onChange={handleStartDate}
                  value={formData.scopeValidity}
                  name="scopeValidity"
                  showYearDropdown
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                />
                {errors.scopeValidity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.scopeValidity}
                  </p>
                )}
              </div>

              {formData.standard !== "" && (
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
                          onChange={handleChange}
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
                          onChange={handleChange}
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
                          onChange={handleChange}
                        />
                        <span></span>
                      </section>
                      Others
                    </label>
                  </div>
                  {errors.standard && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.standard}
                    </p>
                  )}
                </div>
              )}
              {formData.standard === "Others" && (
                <div className="col-12 col-sm-6 col-md-6 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Others *
                  </label>
                  <input
                    type="text"
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    onChange={(event) => setOtherStandard(event.target.value)}
                    value={otherStandard}
                    name="otherStandard"
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
                      name="uploaddocuments"
                      type="file"
                      accept="application/pdf, image/jpg, image/jpeg"
                      onChange={(event) => handleChange(event)}
                    />
                  </label>
                </div>
                <p className="py-2 text-sm">
                  (Max: 500KB) (Format: jpg/jpeg/pdf)
                </p>

                {formData.uploaddocuments && (
                  <div className="flex text-sm mt-1">
                    <GrAttachment />
                    <p className="mx-1">{fileName}</p>
                  </div>
                )}

                {imageErrors?.uploaddocuments ? (
                  <div className="text-sm text-red-500  ">
                    {imageErrors.uploaddocuments}
                  </div>
                ) : (
                  errors?.uploaddocuments !== "" && (
                    <div className="text-sm text-red-500  ">
                      {errors.uploaddocuments}
                    </div>
                  )
                )}
              </div>
              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Scope Certificate Documents *
                </label>
                {isPDF(formData.uploaddocuments) ? (
                  <img
                    src="/images/pdf-icon.png"
                    width={200}
                    height={150}
                    alt="PDF Icon"
                  />
                ) : (
                  <img
                    src={
                      formData.uploaddocuments
                        ? formData.uploaddocuments
                        : "/images/image-placeholder.png"
                    }
                    width={200}
                    height={150}
                    alt=" Image"
                  />
                )}
              </div>
            </div>

            <hr className="mb-3 mt-3" />

            <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
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
              <button
                className="btn-outline-purple"
                onClick={() => router.back()}
              >
                {translations?.common?.cancel}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
