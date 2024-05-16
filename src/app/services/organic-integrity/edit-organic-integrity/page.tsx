"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import { toasterSuccess } from "@components/core/Toaster";
import { GrAttachment } from "react-icons/gr";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "@components/core/nav-link";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
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
  useTitle("Edit Organic Integrity");
  const { translations, loading } = useTranslations();

  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [farmgroups, setFarmGroups] = useState([]);
  const [ginners, setGinner] = useState([]);
  const [icsNames, setIcsName] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState<any>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({
    date: "",
    brand: "",
    teststage: "",
    farmgroup: "",
    icsname: "",
    farmer: "",
    ginner: "",
    sealno: "",
    samplecodeno: "",
    seedlotno: "",
    integrityscore: "",
    uploaddocuments: "",
  });

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    const response = await API.get(
      `organic-integrity/get-organic-integrity?id=${id}`
    );
    if (response.success) {
      setFormData((prevData: any) => {
        return {
          ...prevData,
          id: response.data.id,
          date: response.data.date.substring(0, 10),
          brand: response.data.brand?.id,
          teststage: response.data.test_stage,
          farmgroup: response.data.farmGroup?.id,
          ginner: response.data.ginner?.id,
          icsname: response.data.ics?.id,
          farmer: response.data?.farmer,
          sealno: response.data?.seal_no,
          samplecodeno: response.data?.sample_code,
          seedlotno: response.data?.seed_lot,
          integrityscore: response.data?.integrity_score,
          uploaddocuments: response.data?.documents,
        };
      });
    }
  };

  useEffect(() => {
    fetchBrand();
  }, []);

  useEffect(() => {
    if (formData.brand) {
      fetchFarmGroup();
    }
  }, [formData.brand]);

  useEffect(() => {
    if (formData.brand) {
      fetchGinner();
    }
  }, [formData.brand]);

  useEffect(() => {
    if (formData.farmgroup) {
      icsname();
    }
  }, [formData.farmgroup]);

  useEffect(() => {
    if (formData.icsname) {
      farmer();
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
      const res = await API.get(`ginner?brandId=${formData.brand}`);
      if (res.success) {
        setGinner(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchFarmGroup = async () => {
    try {
      const res = await API.get(`farm-group?brandId=${formData.brand}`);
      if (res.success) {
        setFarmGroups(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const icsname = async () => {
    try {
      const res = await API.get(`ics?farmGroupId=${formData.farmgroup}`);
      if (res.success) {
        setIcsName(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const farmer = async () => {
    try {
      const res = await API.get(`farmer?icsId=${formData.icsname}`);
      if (res.success) {
        setFarmers(res.data);
      }
    } catch (error) {
      console.log(error);
    }
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
    if (name === "uploaddocuments") {
      if (!e.target.files[0]) {
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

    if (name === "integrityscore") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        integrityscore: value === "Positive" ? true : false,
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
  const handleStartDate = (date: Date) => {
    setStartDate(date);
    const formattedDate = date?.toLocaleDateString("en-CA");
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      date: formattedDate,
    }));
  };

  const requiredFields = [
    "date",
    "brand",
    "teststage",
    "farmgroup",
    "icsname",
    "farmer",
    "integrityscore",
    "uploaddocuments",
    "ginner",
  ];
  const [errors, setErrors] = useState<any>({});

  const validateField = (name: string, value: any) => {
    if (requiredFields.includes(name)) {
      switch (name) {
        case "date":
          return !value ? "Select Brand is required" : "";
        case "brand":
          return value === undefined || value === ""
            ? "Select Brand is required"
            : "";
        case "teststage":
          return value.trim() === "" ? "Select Test Stage is required" : "";
        case "farmgroup":
          return formData.teststage !== "Lint Cotton" &&
            (value === undefined || value === "" || !value)
            ? "Farm Group is required"
            : "";
        case "icsname":
          return formData.teststage !== "Lint Cotton" &&
            (value === undefined || value === "")
            ? "ICS Name is required"
            : "";
        case "farmer":
          return formData.teststage !== "Lint Cotton" &&
            (value === undefined || value === "" || !value)
            ? "Farmer is required"
            : "";
        case "ginner":
          return formData.teststage === "Lint Cotton" &&
            (value === undefined || value === "")
            ? "Select Ginner is required"
            : "";
        case "integrityscore":
          return typeof value !== "boolean" ? "Select at least one option" : "";

        default:
          return "";
      }
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const newErrors: any = {};
      Object.keys(formData).forEach((fieldName: string) => {
        newErrors[fieldName] = validateField(
          fieldName,
          formData[fieldName as keyof FormDataState]
        );
      });
      const hasErrors = Object.values(newErrors).some((error) => !!error);
      if (!hasErrors) {
        const url = "organic-integrity";
        const mainFormData = {
          id: formData.id,
          date: formData.date,
          brandId: Number(formData.brand),
          testStage: formData.teststage,
          farmGroupId: Number(formData.farmgroup),
          icsId: Number(formData.icsname),
          farmer: formData.farmer,
          sealNo: formData.sealno,
          sampleCode: formData.samplecodeno,
          seedLot: formData.seedlotno,
          integrityScore: formData.integrityscore,
          documents: formData.uploaddocuments,
        };

        const mainResponse = await API.put(url, mainFormData);

        if (mainResponse.success) {
          toasterSuccess("Record updated successfully");
          router.push("/services/organic-integrity");
        }
      } else {
        setErrors(newErrors);
      }
    } catch (error) {
      console.log("Error submitting form:", error);
    }
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }

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
                {" "}
                <Link href="/services/organic-integrity">
                  Organic Integrity
                </Link>
              </li>
              <li>Edit Organic Integrity</li>
            </ul>
          </div>
        </div>
      </div>
      {/* <hr className="mb-5 mt-5" /> */}

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
                value={formData.date || ""}
                onChange={handleStartDate}
                showYearDropdown
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
              />
              {errors?.date !== "" && (
                <div className="text-sm text-red-500 ">{errors.date}</div>
              )}
            </div>
            <div className="col-12 col-sm-6 col-md-6">
              <label className="text-gray-500 text-[12px] font-medium">
                {translations?.common?.brand} *
              </label>
              <select
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                onChange={handleChange}
                value={formData.brand || ""}
                name="brand"
              >
                <option value="">{translations?.common?.Selectbrand}</option>
                {brands?.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.brand_name}
                  </option>
                ))}
              </select>
              {errors?.brand !== "" && (
                <div className="text-sm text-red-500 ">{errors.brand}</div>
              )}
            </div>
            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                Test Stage *
              </label>
              <select
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                name="teststage"
                value={formData.teststage || ""}
                onChange={handleChange}
              >
                <option value="">Select </option>
                <option value="Seed Testing">Seed Testing (Farm)</option>
                <option value="Leaf Stage">Leaf Stage</option>
                <option value="Seed Cotton">Seed Cotton</option>
                <option value="Lint Cotton">Lint Cotton</option>
              </select>
              {errors?.teststage !== "" && (
                <div className="text-sm text-red-500 ">{errors.teststage}</div>
              )}
            </div>
            {formData.teststage === "Lint Cotton" ? (
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Ginner *{/* {translations?.common?.ginner} * */}
                </label>
                <select
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  name="ginner"
                  value={formData.ginner || ""}
                  onChange={handleChange}
                >
                  <option value="">{translations?.common?.SelectGinner}</option>
                  {ginners?.map((ginner: any) => (
                    <option key={ginner.id} value={ginner.id}>
                      {ginner.name}
                    </option>
                  ))}
                </select>
                {errors?.ginner !== "" && (
                  <div className="text-sm text-red-500 ">{errors.ginner}</div>
                )}
              </div>
            ) : (
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  {translations?.farmGroup} *
                </label>
                <select
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  name="farmgroup"
                  value={formData.farmgroup || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Farm Group</option>
                  {farmgroups?.map((farm: any) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
                {errors?.farmgroup !== "" && (
                  <div className="text-sm text-red-500 ">
                    {errors.farmgroup}
                  </div>
                )}
              </div>
            )}
            {formData.teststage === "Lint Cotton" ? (
              <div className="col-12 col-sm-6 col-md-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Seal No
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  placeholder="Seal No"
                  name="sealno"
                  value={formData.sealno || ""}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <>
                <div className="col-12 col-sm-6 col-md-6 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    {translations?.icsName} *
                  </label>
                  <select
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    name="icsname"
                    value={formData.icsname || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select ICS Name</option>
                    {icsNames?.map((ics: any) => (
                      <option key={ics.id} value={ics.id}>
                        {ics.ics_name}
                      </option>
                    ))}
                  </select>
                  {errors?.icsname !== "" && (
                    <div className="text-sm text-red-500 ">
                      {errors.icsname}
                    </div>
                  )}
                </div>
                <div className="col-12 col-sm-6 col-md-6 mt-4">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Farmer *
                  </label>
                  <select
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    name="farmer"
                    value={formData.farmer || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Farmer</option>
                    {farmers?.map((farmer: any) => (
                      <option key={farmer.farmer?.id} value={farmer.farmer?.id}>
                        {farmer.farmer?.firstName}
                      </option>
                    ))}
                  </select>
                  {errors?.farmer !== "" && (
                    <div className="text-sm text-red-500 ">{errors.farmer}</div>
                  )}
                </div>
                <div className="col-12 col-sm-6 col-md-6 mt-3">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Seal No
                  </label>
                  <input
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    placeholder="Seal No"
                    name="sealno"
                    value={formData.sealno || ""}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                Sample Code No:
              </label>
              <input
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                name="samplecodeno"
                value={formData.samplecodeno || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-sm-6 col-md-6 mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                Seed Lot No
              </label>
              <input
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                name="seedlotno"
                value={formData.seedlotno || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-sm-6 col-md-6 mt-4">
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                    accept=".pdf,.zip, image/jpg, image/jpeg"
                    onChange={(event) => handleChange(event)}
                  />
                </label>
              </div>
              <p className="py-2 text-sm">
                (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
              </p>
              {formData.uploaddocuments && (
                <div className="flex text-sm mt-1">
                  <GrAttachment />
                  <p className="mx-1">{formData.uploaddocuments}</p>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-6 mt-4">
            <label className="text-gray-500 text-[12px] font-medium">
              Integrity Documents
            </label>
            {formData.uploaddocuments && (
              <img
                src={
                  formData.uploaddocuments
                    ? formData.uploaddocuments
                    : "/images/image-placeholder.png"
                }
                width={200}
                height={150}
                alt="Image"
              />
            )}
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
