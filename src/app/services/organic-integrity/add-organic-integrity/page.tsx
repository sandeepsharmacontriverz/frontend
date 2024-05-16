"use client";
import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NavLink from "@components/core/nav-link";
import useTitle from "@hooks/useTitle";
import { GrAttachment } from "react-icons/gr";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import { toasterSuccess } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import Select from "react-select";

interface FormDataState {
  brand: string;
  test: string;
  farmgroup: string;
  icsname: string;
  farmer: string;
  integrityscore: string;
  uploaddocuments: string;
}
export default function page() {
  useTitle("Add Organic Integrity ");
  const { translations, loading } = useTranslations();

  const router = useRouter();
  const [brands, setBrands] = useState<any>([]);
  const [farmgroups, setFarmGroups] = useState<any>([]);
  const [ginners, setGinner] = useState<any>([]);
  const [icsNames, setIcsName] = useState<any>([]);
  const [farmers, setFarmers] = useState<any>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filename, setFileName] = useState("")

  const [formData, setFormData] = useState<any>({
    date: new Date(),
    brand: null,
    teststage: "",
    farmgroup: null,
    icsname: null,
    ginner: null,
    farmer: null,
    sealno: "",
    samplecodeno: "",
    seedlotno: "",
    integrityscore: "",
    uploaddocuments: null,
  });
  const [errors, setErrors] = useState<any>({});
  const requiredFields = [
    "brand",
    "date",
    "teststage",
    "farmgroup",
    "icsname",
    "farmer",
    "integrityscore",
    "uploaddocuments",
    "ginner",
  ];
  const validateField = (name: string, value: any) => {
    if (requiredFields.includes(name)) {
      switch (name) {
        case "date":
          return !value ? "Select Date is Required" : "";
        case "brand":
          return value === "" || value === undefined || value === null ? "Select Brand is Required" : "";
        case "teststage":
          return value === "" || value === undefined || value === null ? "Select Test Stage is Required" : "";
        case "farmgroup":
          return formData.teststage !== "Lint Cotton" && (value === "" || value === undefined || value === null)
            ? "Farm Group is Required"
            : "";
        case "icsname":
          return formData.teststage !== "Lint Cotton" && (value == "" || value == undefined || value == null) ?
            "ICS Name is Required"
            : "";
        case "farmer":
          return formData.teststage !== "Lint Cotton" && (value === "" || value === undefined || value === null) ?
            "Farmer is Required"
            : "";
        case "ginner":
          return formData.teststage === "Lint Cotton" && (value === "" || value === undefined || value === null) ?
            "Select Ginner is Required"
            : "";
        case "integrityscore":
          return typeof value !== "boolean" ? "Select at least one option" : "";
        case "uploaddocuments":
          return value === "" || value === undefined || value === null ?
            "Select Upload File is Required"
            : "";

        default:
          return "";
      }
    }
  };
  useEffect(() => {
    if (formData.brand !== null && formData.brand !== undefined && formData.brand !== "") {
      setFarmGroups([])
      setGinner([])
      setIcsName([])
      setFarmers([])
      setFormData((prev: any) => ({
        ...prev,
        ginner: null,
        farmer: null,
        icsname: null,
        farmgroup: null
      }));
    }
    else {
      fetchBrand()
    }
  }, []);

  useEffect(() => {
    if (formData.brand !== null && formData.brand !== undefined && formData.brand !== "") {
      fetchFarmGroup();
    }
    else {
      setFarmGroups([])
      setFormData((prev: any) => ({
        ...prev,
        farmgroup: null,
      }));
    }
  }, [formData.brand]);

  useEffect(() => {
    if (formData.brand !== null && formData.brand !== undefined && formData.brand !== "") {
      fetchGinner();
    }
    else {
      setGinner([])
      setFormData((prev: any) => ({
        ...prev,
        ginner: null,
      }));
    }
  }, [formData.brand]);

  useEffect(() => {
    if (formData.farmgroup !== null && formData.farmgroup !== undefined && formData.farmgroup !== "") {
      icsname();
    }
    else {
      setIcsName([])
      setFormData((prev: any) => ({
        ...prev,
        icsname: null,
      }));
    }
  }, [formData.farmgroup]);

  useEffect(() => {
    if (formData.icsname !== null && formData.icsname !== undefined && formData.icsname !== "") {
      farmer();
    }
    else {
      setFarmers([])
      setFormData((prev: any) => ({
        ...prev,
        farmer: null,
      }));
    }
  }, [formData.icsname]);

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
  const fetchGinner = async () => {
    try {
      if (formData.brand !== null && formData.brand !== undefined && formData.brand !== "") {
        const res = await API.get(`ginner?brandId=${formData.brand}`);
        if (res.success) {
          setGinner(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchFarmGroup = async () => {
    try {
      if (formData.brand !== null && formData.brand !== undefined && formData.brand !== "") {
        const res = await API.get(`farm-group?brandId=${formData.brand}`);
        if (res.success) {
          setFarmGroups(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const icsname = async () => {
    try {
      if (formData.farmgroup !== null && formData.farmgroup !== undefined && formData.farmgroup !== "") {
        const res = await API.get(`ics?farmGroupId=${formData.farmgroup}`);
        if (res.success) {
          setIcsName(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const farmer = async () => {
    try {
      if (formData.icsname !== null && formData.icsname !== undefined && formData.icsname !== "") {
        const res = await API.get(`farmer?icsId=${formData.icsname}`);
        if (res.success) {
          setFarmers(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStartDate = (date: Date) => {
    setStartDate(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      date: date,
    }));
  };
  const dataUpload = async (e?: any, name?: any) => {
    const url = "file/upload";

    const allowedFormats = [
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];
    const dataVideo = new FormData();
    if (name === "uploaddocuments") {
      if (!e.target.files || !e.target.files[0]) {
        return setErrors((prevError: any) => ({
          ...prevError,
          [e.target.name]: "No File Selected",
        }));
      } else {
        if (!allowedFormats.includes(e.target.files[0]?.type)) {
          setErrors((prevError: any) => ({
            ...prevError,
            [name]: "Invalid file format.Upload a valid Format",
          }));

          e.target.value = "";
          return;
        }

        const maxFileSize = 5 * 1024 * 1024;

        if (e.target.files[0].size > maxFileSize) {
          setErrors((prevError: any) => ({
            ...prevError,
            [name]: `File size exceeds the maximum limit (5MB).`,
          }));

          e.target.value = "";
          return;
        }

        setErrors((prevError: any) => ({
          ...prevError,
          [e.target.name]: "",
        }));
      }
      dataVideo.append("file", e.target.files[0]);
      try {
        const response = await API.postFile(url, dataVideo);
        if (response.success) {
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

  const handleChange = (name?: any, value?: any, event?: any) => {

    if (name === "uploaddocuments") {
      const file = event.target.files[0];
      dataUpload(event, name);
      setFileName(file?.name)
    } else {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
    if (name === "integrityscore") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        integrityscore: value === "Positive" ? true : false,
      }));
    }

    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async () => {
    try {
      const newErrors: any = {};
      Object.keys(formData).forEach((fieldName: string) => {
        newErrors[fieldName] = validateField(
          fieldName,
          formData[fieldName as keyof FormDataState]
        );
      });
      if (formData.uploaddocuments == null && formData.uploaddocuments == "" && formData.uploaddocuments == undefined) {
        newErrors["uploaddocuments"] = "Please select image/pdf";
      }

      const hasErrors = Object.values(newErrors).some((error) => !!error);
      if (!hasErrors) {
        setIsSubmitting(true);
        const url = "organic-integrity";
        const mainFormData = {
          date: formData.date,
          brandId: Number(formData.brand),
          testStage: formData.teststage,
          farmGroupId: Number(formData.farmgroup),
          icsId: Number(formData.icsname),
          ginnerId: Number(formData.ginner),
          farmer: Number(formData.farmer),
          sealNo: formData.sealno,
          sampleCode: formData.samplecodeno,
          seedLot: formData.seedlotno,
          integrityScore: formData.integrityscore,
          documents: formData.uploaddocuments,
        };
        const mainResponse = await API.post(url, mainFormData);

        if (mainResponse.success) {
          toasterSuccess("Record added successfully");
          router.back();
        }
      } else {
        setErrors(newErrors);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.log(error);
    }
  };

  if (loading) {
    return <div>  <Loader /> </div>;
  }

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
              <li className="active">
                <NavLink href="/services/organic-integrity">
                  <span>Organic Integrity</span>
                </NavLink>
              </li>
              <li>Add Organic Integrity</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4">
        <div className="w-100 mt-4">
          <div className="row">
            <div className="col-12 col-sm-6 col-md-6">
              <label className="text-gray-500 text-[12px] font-medium">
                {translations?.transactions?.date} *
              </label>
              <DatePicker
                showIcon
                selected={startDate}
                onChange={handleStartDate}
                showYearDropdown
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            <div className="col-12 col-sm-6 col-md-6">
              <label className="text-gray-500 text-[12px] font-medium">
                {translations?.common?.brand} *
              </label>
              <Select
                name="brand"
                value={formData.brand ? { label: brands?.find((brand: any) => brand.id === formData.brand)?.brand_name, value: formData.brand } : null}
                menuShouldScrollIntoView={false}
                isClearable
                placeholder="Select Brand"
                className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                options={(brands || []).map(({ id, brand_name }: any) => ({
                  label: brand_name,
                  value: id,
                  key: id
                }))}
                onChange={(item: any) => {
                  handleChange("brand", item?.value);
                }}
              />
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
              )}
            </div>

            <div className="col-12 col-sm-6 col-md-6 mt-2">
              <label className="text-gray-500 text-[12px] font-medium">
                Test Stage *
              </label>
              <Select
                name="teststage"
                value={formData.teststage ? { label: formData.teststage, value: formData.teststage } : null}
                menuShouldScrollIntoView={false}
                placeholder="Select Test Stage"
                className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                options={[
                  { label: "Seed Testing (Farm)", value: "Seed Testing" },
                  { label: "Leaf Stage", value: "Leaf Stage" },
                  { label: "Seed Cotton", value: "Seed Cotton" },
                  { label: "Lint Cotton", value: "Lint Cotton" }
                ]}
                onChange={(item: any) => {
                  handleChange("teststage", item?.value);
                }}
              />
              {errors.teststage && (
                <p className="text-red-500 text-sm mt-1">{errors.teststage}</p>
              )}
            </div>

            {formData.teststage === "Lint Cotton" ? (
              <div className="col-12 col-sm-6 col-md-6 mt-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.common?.ginner} *
                </label>
                <Select
                  name="ginner"
                  value={formData.ginner ? { label: ginners?.find((ginner: any) => ginner.id === formData.ginner)?.name, value: formData.ginner } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Ginner"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(ginners || []).map(({ id, name }: any) => ({
                    label: name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleChange("ginner", item?.value);
                  }}
                />
                {errors.ginner && (
                  <p className="text-red-500 text-sm mt-1">{errors.ginner}</p>
                )}
              </div>
            ) : (
              <div className="col-12 col-sm-6 col-md-6 mt-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.farmGroup} *
                </label>
                <Select
                  name="farmGroup"
                  value={formData.farmgroup ? { label: farmgroups?.find((farmGroup: any) => farmGroup.id === formData.farmgroup)?.name, value: formData.farmgroup } : null}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Farm Group"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={(farmgroups || []).map(({ id, name }: any) => ({
                    label: name,
                    value: id,
                    key: id
                  }))}
                  onChange={(item: any) => {
                    handleChange("farmgroup", item?.value);
                  }}
                />
                {errors.farmgroup && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.farmgroup}
                  </p>
                )}
              </div>
            )}

            {formData.teststage === "Lint Cotton" ? (
              <div className="col-12 col-sm-6 col-md-6 mt-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  Seal No
                </label>
                <input
                  type="text"
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  placeholder="Seal No"
                  name="sealno"
                  value={formData.sealno}
                  onChange={(e: any) => handleChange("sealno", e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="col-12 col-sm-6 col-md-6 mt-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    {translations?.icsName} *
                  </label>
                  <Select
                    name="icsname"
                    value={formData.icsname ? { label: icsNames?.find((icsname: any) => icsname.id === formData.icsname)?.ics_name, value: formData.icsname } : null}
                    menuShouldScrollIntoView={false}
                    isClearable
                    placeholder="Select ICS Name"
                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                    options={(icsNames || []).map(({ id, ics_name }: any) => ({
                      label: ics_name,
                      value: id,
                      key: id
                    }))}
                    onChange={(item: any) => {
                      handleChange("icsname", item?.value);
                    }}
                  />
                  {errors.icsname && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.icsname}
                    </p>
                  )}
                </div>

                <div className="col-12 col-sm-6 col-md-6 mt-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Farmer *
                  </label>
                  <Select
                    name="farmer"
                    value={formData.farmer ? { label: farmers?.find((farmer: any) => farmer.farmer_id === formData.farmer)?.farmer.firstName, value: formData.farmer } : null}
                    menuShouldScrollIntoView={false}
                    isClearable
                    placeholder="Select Farmer"
                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                    options={(farmers || []).map((farmer: any) => ({
                      label: farmer.farmer.firstName,
                      value: farmer.farmer_id,
                      key: farmer.farmer_id,
                    }))}
                    onChange={(item: any) => {
                      handleChange("farmer", item?.value);
                    }}
                  />
                  {errors.farmer && (
                    <p className="text-red-500 text-sm mt-1 ">
                      {errors.farmer}
                    </p>
                  )}
                </div>
                <div className="col-12 col-sm-6 col-md-6 mt-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Seal No
                  </label>
                  <input
                    type="text"
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    placeholder="Seal No"
                    name="sealno"
                    value={formData.sealno}
                    onChange={(e: any) => handleChange("sealno", e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="col-12 col-sm-6 col-md-6 mt-2">
              <label className="text-gray-500 text-[12px] font-medium">
                Sample Code No
              </label>
              <input
                type="text"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                name="samplecodeno"
                value={formData.samplecodeno}
                placeholder=" Sample Code No"
                onChange={(e: any) => handleChange("samplecodeno", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-6 mt-2">
              <label className="text-gray-500 text-[12px] font-medium">
                Seed Lot No
              </label>
              <input
                type="text"
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                name="seedlotno"
                placeholder="Seed Lot No"
                value={formData.seedlotno}
                onChange={(e: any) => handleChange("seedlotno", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-6 mt-4 mt-2">
              <label className="text-gray-500 text-[12px] font-medium">
                Integrity Score *
              </label>
              <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                <label className="mt-1 d-flex mr-4 align-items-center">
                  <section>
                    <input
                      type="radio"
                      name="integrityscore"
                      value="Positive"
                      className="form-radio"
                      checked={formData.integrityscore === true}
                      onChange={(e: any) => handleChange("integrityscore", e.target.value)}
                    />
                    <span></span>
                  </section>
                  Positive
                </label>
                <label className="mt-1 d-flex mr-4 align-items-center">
                  <section>
                    <input
                      type="radio"
                      name="integrityscore"
                      value="Negative"
                      className="form-radio"
                      checked={formData.integrityscore === false}
                      onChange={(e: any) => handleChange("integrityscore", e.target.value)}
                    />
                    <span></span>
                  </section>
                  Negative
                </label>
              </div>
              {errors.integrityscore && (
                <div className="text-sm text-red-500 ">
                  {errors.integrityscore}
                </div>
              )}
            </div>

            <div className="col-12 col-sm-6 mt-2">
              <label className="text-gray-500 text-[12px] font-medium">
                Upload Documents *
              </label>
              <div className="inputFile">
                <label>
                  Choose File <GrAttachment />
                  <input
                    name="uploaddocuments"
                    type="file"
                    accept=".pdf,.zip, image/jpg, image/jpeg"
                    onChange={(event) => handleChange("uploaddocuments", event?.target?.files, event)}
                  />
                </label>
              </div>
              <p className="py-2 text-sm">
                (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
              </p>
              {errors.uploaddocuments && (
                <div className="text-sm text-red-500">
                  {errors.uploaddocuments}
                </div>
              )}
              {formData.uploaddocuments && (
                <div className="flex text-sm mt-1">
                  <GrAttachment />
                  <p className="mx-1">{filename}</p>
                </div>
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
            <button className="btn-outline-purple" onClick={() => router.back()}>
              {translations?.common?.cancel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
