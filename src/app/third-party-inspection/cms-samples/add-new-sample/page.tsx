"use client";

import React, { useState, useEffect } from "react";
import useTranslations from "@hooks/useTranslation";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterError, toasterInfo, toasterSuccess } from "@components/core/Toaster";
import User from "@lib/User";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import { DecimalFormat } from "@components/core/DecimalFormat";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";
import moment from "moment";
import { PreView } from "@components/preview/PreView";
import { FaPlus, FaMinus } from "react-icons/fa";
import ModalLoader from "@components/core/ModalLoader";
import { GrAttachment } from "react-icons/gr";
import { isFloat32Array } from "util/types";
import { BsPlusCircleFill } from "react-icons/bs";

export default function page() {
  useTitle("Add New Sample");

  const [roleLoading, hasAccesss] = useRole();
  const thirdPartyId = User.ThirdPartyInspectionId;

  const router = useRouter();
  const { translations, loading } = useTranslations();
  const [Access, setAccess] = useState<any>({});

  const [millData, setMillData] = useState<any>([]);
  const [from, setFrom] = useState<Date | null>(new Date());
  const [expectedDate, setExpectedDate] = useState<Date | null>(new Date());
  const [LotData, setLotData] = useState<any>([]);
  const [containersData, setContainersData] = useState<any>([]);

  const [labData, setLabData] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPreview, setShowPreview] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(false);

  const [errors, setErrors] = useState<any>({});

  const initialSampleDetails = {
    sampleName: "",
    sampleUpload: ""
  };

  const [fileName, setFileName] = useState<any>([])

  const [sampleDetailsErrors, setSampleDetailsErrors] = useState<Array<any>>([
    JSON.parse(JSON.stringify(initialSampleDetails)),
  ]);

  const [formData, setFormData] = useState<any>({
    date: new Date(),
    programId: null,
    reelLotNo : "",
    cmsId: null,
    millSalesId: null,
    lotNo: "",
    containerId: null,
    sampleCollector: "",
    noOfSamples: null,
    labId: null,
    expectedDate: new Date(),
    samples: [JSON.parse(JSON.stringify(initialSampleDetails))]
  });

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Third_Party_Inspection")) {
      const access = checkAccess("Sample Details");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    if (thirdPartyId) {
      getMillData();
    }
  }, [thirdPartyId]);
  
  useEffect(() => {
    if (formData.lotNo) {
      const filteredData = LotData?.filter(
        (item: any) => item.batch_lot_no.includes(formData.lotNo)
      );
      
      if (filteredData.length > 0) {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          programId: filteredData[0]?.program.id,
          reelLotNo : filteredData[0]?.reel_lot_no,
          millSalesId: filteredData[0]?.id
        }));
      } else {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          programId: null,
          millSalesId: null
        }));
      }
    }
  }, [formData.lotNo]);
  
  
  useEffect(()=>{
    const numberofSamples = formData.samples?.filter((item:any)=> item.sampleUpload !== "")?.length
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      noOfSamples: numberofSamples
    }));

  },[formData.samples])


console.log(formData)
  useEffect(() => {
    if (formData.cmsId) {
      getLotData();
    }
  }, [formData.cmsId])

  useEffect(()=>{
    if(formData.millSalesId){
      getContainerData()
    }
  },[formData.millSalesId])

  const getMillData = async () => {
    const url = `third-party-inspection/get-third-party-inspection?id=${thirdPartyId}`;
    try {
      const response = await API.get(url);
      if (response?.data?.brand?.length > 0) {
        getMill(response?.data?.brand);
        getLabData(response?.data?.brand)
      }
    } catch (error) {
      console.log(error, "error");
    }
  }

  const getMill = async (id: any) => {
    try {
      const res = await API.get(`container-management-system?brandId=${id}`);
      if (res.success) {
        setMillData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLabData = async (id: any) => {
    try {
      const res = await API.get(`lab?brandId=${id}`);
      if (res.success) {
        setLabData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const requiredFields = [
    "date",
    "cmsId",
    "programId",
    "lotNo",
    "noOfSamples",
    "expectedDate",
    "labId"
  ];

  const validateField = (name: string, value: any, dataName: string) => {
    if (dataName === "errors") {
      if (requiredFields.includes(name)) {
        switch (name) {
          case "date":
            return value.length === 0 ? "Date is required" : "";
          case "expectedDate":
            return value.length === 0 ? "Expected Sample Date is required" : "";
          case "lotNo":
            return !value
              ? "Lot No is required"
              : errors.lotNo !== ""
                ? errors.lotNo
                : "";
          case "cmsId":
            return !value
              ? "CMS is required"
              : errors.cmsId !== ""
                ? errors.cmsId
                : "";
          case "labId":
            return !value
              ? "Lab Name is required"
              : errors.labId !== ""
                ? errors.labId
                : "";
          case "programId":
            return value === null ? "Please Choose Lot No" : "";
          case "noOfSamples":
            return value === null
              ? "No of Samples is required" : errors.noOfSamples !== "" ? errors.noOfSamples : "";


          default:
            return "";
        }
      } else {
        return "";
      }
    }
  };

  const onCancel = () => {
    router.push("/third-party-inspection/cms-samples");
  };

  const handleErrorCheck = async (event: any) => {
    event.preventDefault();

    const newErrors: any = {};
    const sampleError: any = {...sampleDetailsErrors};

    Object.keys(formData)?.forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "errors"
      );
    });

    if(formData.samples[0]?.sampleName===""){
      sampleError[0].sampleName = "Sample Name is required";
    }

    if(formData.samples[0]?.sampleUpload===""){
      sampleError[0].sampleUpload = "Sample Upload is required";
    }
    
    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (hasErrors) {
      setErrors(newErrors);
    }

    if (!hasErrors) {
      setShowPreview(true);
    } else {
      return;
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const newErrors: any = {};
    const newWeightAndConeErrors: any = [];

    Object.keys(formData)?.forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "errors"
      );
    });

    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (hasErrors) {
      setErrors(newErrors);
    }

    if (!hasErrors) {
      try {
        setIsSubmitting(true);
        setIsLoading(true);
        const response = await API.post("third-party-sample/create-cms-sample", {
          ...formData,
          thirdPartyId: thirdPartyId,
        });

        if (response.success) {
          toasterSuccess("Sample Created successfully", 2000, thirdPartyId);
          router.push("/third-party-inspection/cms-samples");

        } else {
          toasterError(response.error.code, 2000, thirdPartyId)
          setIsSubmitting(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
        setIsSubmitting(false);
        setIsLoading(false);
      }
    } else {
      return;
    }
  };

  const handleFrom = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setFrom(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      date: newDate,
    }));
  };

  const handleExpectedDate = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setExpectedDate(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      expectedDate: newDate,
    }));
  };


  const onBlur = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;



    if (value !== "" && type === "numbers") {
      if (Number(value) <= 0) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Value Should be more than 0",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

    if (type === "bill") {
      if (value !== "") {
        const valid = regexBillNumbers.test(value);
        if (!valid) {
          setErrors((prev: any) => ({
            ...prev,
            [name]:
              "Accepts only AlphaNumeric values  and special characters like comma(,),_,-,(),/",
          }));
        } else {
          setErrors({ ...errors, [name]: "" });
        }
      }
      return;
    }
  };

  const handleChange = (name?: any, value?: any, event?: any) => {
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
    if (name === "processComplete") {
      if (value === "yes") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: true,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: false,
        }));
      }
    } else if (name === "otherRequired") {
      if (value === "yes") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: true,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: false,
        }));
      }
    } else if (name === "riceQtyProduced") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    } else if (name === "riceVariety") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
    else if (name === "noOfBag") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: parseInt(value),
      }));
    } else if (name === "programId") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
    else {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };


  const getLotData = async () => {
    try {
      const res = await API.get(`third-party-sample/get-cms-lot?cmsId=${formData.cmsId}`);
      if (res.success) {
        setLotData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getContainerData = async () => {
    try {
      const res = await API.get(`third-party-sample/get-cms-containers?millSalesId=${formData.millSalesId}`);
      if (res.success) {
        setContainersData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

console.log(sampleDetailsErrors)

const dataUpload = async (name: any, value: any, index: any) => {
  const updatedFiles = [...formData.samples];
  const Files = [...fileName];
 
  const allowedFormats = [
    "application/pdf",
    "application/doc",
    "application/docx",
  ];
  const url = "file/upload";
  if (!allowedFormats.includes(value[0]?.type)) {
      setSampleDetailsErrors(prev => {
        let errors = [...prev];
        errors[index] = { ...initialSampleDetails, sampleUpload: 'Invalid file format. Upload a valid format.' };
        return errors;
      });
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (value[0]?.size > maxFileSize) {
      setSampleDetailsErrors(prev => {
        let errors = [...prev];
        errors[index] = { ...initialSampleDetails, sampleUpload: 'File size exceeds the maximum limit (5MB).' };
        return errors;
      });
      return;
    }

  const formNewData = new FormData();
  formNewData.append("file", value[0]);

    try {
      const response = await API.postFile(url, formNewData);
      if (response.success) {
      Files[index] = value[0]?.name;
      setFileName(Files);
        updatedFiles[index].sampleUpload = response.data
        setFormData((prev: any) => ({
          ...prev,
          sampleUpload: updatedFiles,
        }));
      }
  } catch (error) {
    console.log(error, "error");
  }
};

  const handleAddMoreImage = () => {
    setFormData((prev: any) => ({
      ...prev,
      samples: [
        ...prev.samples,
        JSON.parse(JSON.stringify(initialSampleDetails)),
      ],
    }));
    setSampleDetailsErrors((prev: any) => [
      ...prev,
      JSON.parse(JSON.stringify(initialSampleDetails)),
    ]);
  };

  const handleRemoveImage = (index: number) => {
    const tempWeightAndCone = [...formData.samples];
    tempWeightAndCone.splice(index, 1);
    const tempfiles = [...fileName];
    tempfiles.splice(index, 1);
    setFileName(tempfiles);
    setFormData((prev: any) => ({
      ...prev,
      samples: tempWeightAndCone,
    }));

    const tempWeightAndConeErrors = [...sampleDetailsErrors];
    tempWeightAndConeErrors.splice(index, 1);
    setSampleDetailsErrors(tempWeightAndConeErrors);
  };

  const handleSampleDetailsChange = (
    key: string,
    value: any,
    index: number
  ) => {
    const tempWeightAndCone = [...formData.samples];
    tempWeightAndCone[index][key] = value;
    if(key === 'sampleUpload'){
      dataUpload(key, value, index)
    }
    setFormData((prev: any) => ({
      ...prev,
      samples: tempWeightAndCone,
    }));

    const tempWeightAndConeErrors = [...sampleDetailsErrors];
    tempWeightAndConeErrors[index][key] = "";
    setSampleDetailsErrors(tempWeightAndConeErrors);
  };



  if (loading || roleLoading || isSubmitting) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access?.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.create) {
    return (
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <NavLink href="/third-party-inspection/dashboard" className="active">
                  <span className="icon-home"></span>
                </NavLink>
              </li>
              <li>
                <NavLink href="/cms/cms-samples">Sample Details</NavLink>
              </li>
              <li>Add New Sample</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-md mt-4 p-4">
          <div className="w-100">

            <div className="row">
              <div className="borderFix pt-2 pb-2">
                <div className="row">
                  <div className="col-12 col-sm-6  my-2">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Sampling Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={from}
                      dateFormat={"dd-MM-yyyy"}
                      onChange={handleFrom}
                      showYearDropdown
                      maxDate={new Date()}
                      placeholderText={'Date' + "*"}
                      className="w-100 shadow-none h-11 rounded-md my-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                  </div>
                  <div className="col-12 col-sm-6 my-2">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Select CMS <span className="text-red-500">*</span>
                    </label>

                    <Select
                      name="cmsId"
                      value={formData.cmsId ? {
                        label: millData?.find(
                          (Id: any) =>
                            Id.id === formData.cmsId
                        )?.name,
                        value: formData.cmsId,
                      }
                        : null
                      }
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select CMS"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={
                        (millData || []).map(({ id, name }: any) => ({
                          label: name,
                          value: id,
                        })) as unknown as readonly (string | GroupBase<string>)[]
                      }
                      onChange={(item: any) => {
                        handleChange("cmsId", item?.value);
                      }}
                    />

                    {errors?.cmsId !== "" && (
                      <div className="text-sm text-red-500">{errors.cmsId}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                Select Container / Lot No <span className="text-red-500">*</span>
                </label>

                <Select
                  name="lotNo"
                  value={
                    formData.lotNo ? {
                      label: LotData?.find(
                        (Id: any) =>
                          Id.batch_lot_no === formData.lotNo
                      )?.batch_lot_no,
                      value: formData.lotNo,
                    }
                      : ''}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Container / Lot No"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={
                    (LotData || []).map(({ batch_lot_no }: any) => ({
                      label: batch_lot_no,
                      value: batch_lot_no,
                    })) as unknown as readonly (string | GroupBase<string>)[]
                  }
                  onChange={(item: any) => {
                    handleChange("lotNo", item?.value);
                  }}
                />

                {errors?.lotNo !== "" && (
                  <div className="text-sm text-red-500">{errors.lotNo}</div>
                )}
              </div>

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Sample Collector Details
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  onBlur={(e) => onBlur(e, 'bill')}
                  name="sampleCollector"
                  placeholder=" Sample Collector Details"
                  value={formData.sampleCollector || ""}
                  onChange={(e) => handleChange("sampleCollector", e.target.value)}
                />
                {errors?.sampleCollector !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.sampleCollector}
                  </div>
                )}
              </div>

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                Select Container No <span className="text-red-500">*</span>
                </label>

                <Select
                  name="containerId"
                  value={
                    formData.containerId ? {
                      label: containersData?.find(
                        (Id: any) =>
                          Id.id === formData.containerId
                      )?.container_no,
                      value: formData.containerId,
                    }
                      : ''}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Container No"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={
                    (containersData || []).map(({ id, container_no }: any) => ({
                      label: container_no,
                      value: id,
                    })) as unknown as readonly (string | GroupBase<string>)[]
                  }
                  onChange={(item: any) => {
                    handleChange("containerId", item?.value);
                  }}
                />

                {errors?.containerId !== "" && (
                  <div className="text-sm text-red-500">{errors.containerId}</div>
                )}
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Total No of Sample Collected
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="number"
                  // onBlur={(e) => onBlur(e, 'numbers')}
                  name="noOfSamples"
                  disabled
                  placeholder="No Of Samples"
                  value={formData.noOfSamples || ""}
                  onChange={(e) => handleChange("noOfSamples", e.target.value)}
                />
              </div>

            </div>
            {/* <div className="row">
              <div className="col-12 col-sm-6 my-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  Samples
                </label>
                <div className="inputFile">
                  <label>
                    Choose File <GrAttachment />
                    <input
                      name="samples"
                      type="file"
                      accept=".doc, .docx, .pdf"
                      onChange={(e) =>
                        dataUpload(
                          "samples",
                          e?.target?.files
                        )
                      }
                    />
                  </label>
                </div>

                <p className="py-2 text-sm">
                  (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                </p>
                {errors?.samples !== "" && (
                  <div className="text-sm text-red-500">
                    {errors.samples}
                  </div>
                )}
              </div>
              <div className="col-12 col-sm-6 mt-4">
                <button
                  className="flex h-11 items-center gap-2 px-2 py-1.5 m-2 bg-yellow-500 text-white rounded text-sm my-2"
                  onClick={() => console.log('abc')}
                >
                  <BsPlusCircleFill color="white" size={18} />
                  Add More
                </button>
              </div>
              {fileName.samples &&
                fileName.samples.map((item: any, index: any) => (
                  <div className="flex text-sm mt-1" key={index}>
                    <GrAttachment />
                    <p className="mx-1">Sample {index + 1}:{item}</p>
                    <div className="w-1/3">
                      <button
                        name="handle"
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-sm rounded text-black px-2 font-semibold"
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))}

            </div> */}

            <div className="mt-3">
              <label className="text-gray-500 text-[12px] font-medium">
                Sample Details *
              </label>
              {formData.samples.map((element: any, i: number) => (
                <div key={i} className="row">
                  <div className="col-12 col-sm-6 my-2">
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      placeholder="Enter sample Details"
                      name="sampleName"
                      value={element.sampleName || ""}
                      onChange={(e) => {
                        let value: string = e.target.value;
                        handleSampleDetailsChange(
                          e.target.name,
                          value,
                          i
                        );
                      }}
                    />
                    {sampleDetailsErrors[i]?.sampleName && (
                      <div className="text-sm text-red-500">
                        {sampleDetailsErrors[i]?.sampleName || ""}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-3 my-2">
                    <div className="inputFile">
                      <label>
                        Choose File <GrAttachment />
                        <input
                          name="sampleUpload"
                          type="file"
                          accept=".doc, .docx, .pdf"
                          // onChange={(e) =>
                          //   dataUpload(
                          //     "samples",
                          //     e?.target?.files
                          //   )
                          // }
                          onChange={(e) => {
                            let value: any = e.target.files;
                            handleSampleDetailsChange(
                              e.target.name,
                              value,
                              i
                            );
                          }}

                        />
                      </label>
                    </div>
                    {fileName[i] && (
                      <div className="text-sm text-black">
                      {fileName[i]}
                      </div>
                    )}
                    {sampleDetailsErrors[i]?.sampleUpload && (
                      <div className="text-sm text-red-500">
                        {sampleDetailsErrors[i]?.sampleUpload || ""}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-sm-3 my-2">
                    {i === 0 ? (
                      <button
                        className="mt-1 p-2 rounded"
                        onClick={handleAddMoreImage}
                        style={{
                          backgroundColor: "#E08E0B",
                        }}
                      >
                        <FaPlus color="#fff" />
                      </button>
                    ) : (
                      <button
                        className="mt-1 p-2 rounded"
                        onClick={() => handleRemoveImage(i)}
                        style={{
                          backgroundColor: "#D73925",
                        }}
                      >
                        <FaMinus color="#fff" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="row">
              <div className="col-12 col-sm-6 my-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  Lab Name <span className="text-red-500">*</span>
                </label>

                <Select
                  name="labId"
                  value={
                    formData.labId ? {
                      label: labData?.find(
                        (Id: any) =>
                          Id.id === formData.labId
                      )?.name,
                      value: formData.labId,
                    }
                      : ''}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Lab Name"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={
                    (labData || []).map(({ id, name }: any) => ({
                      label: name,
                      value: id,
                    })) as unknown as readonly (string | GroupBase<string>)[]
                  }
                  onChange={(item: any) => {
                    handleChange("labId", item?.value);
                  }}
                />

                {errors?.labId !== "" && (
                  <div className="text-sm text-red-500">{errors.labId}</div>
                )}
              </div>


              <div className="col-12 col-sm-6  my-2">
                <label className="text-gray-500 text-[12px] font-medium">
                  Expected Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={expectedDate}
                  dateFormat={"dd-MM-yyyy"}
                  onChange={handleExpectedDate}
                  showYearDropdown
                  maxDate={new Date()}
                  placeholderText={'Date' + "*"}
                  className="w-100 shadow-none h-11 rounded-md my-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                />
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Program <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <input
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    type="text"
                    name="programId"
                    placeholder="program"
                    disabled
                    value={formData.programId ?
                      LotData?.find(
                        (Id: any) =>
                          Id.program.id === formData.programId
                      )?.program?.program_name : ''
                    }
                    onChange={(e) => handleChange("programId", e.target.value)}
                  />
                </div>
                {errors?.programId !== "" && (
                  <div className="text-sm text-red-500">{errors.programId}</div>
                )}
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Reel Lot No <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <input
                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    type="text"
                    name="reelLotNo"
                    placeholder="Reel Lot No"
                    disabled
                    value={formData.reelLotNo ?
                      LotData?.find(
                        (Id: any) =>
                          Id.reel_lot_no === formData.reelLotNo
                      )?.reel_lot_no : ''
                    }
                    onChange={(e) => handleChange("reelLotNo", e.target.value)}
                  />
                </div>
                {errors?.reelLotNo !== "" && (
                  <div className="text-sm text-red-500">{errors.reelLotNo}</div>
                )}
              </div>
            </div>

          </div>
          <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
            <section>
              <button
                className="btn-purple mr-2"
                style={
                  isSubmitting
                    ? { cursor: "not-allowed", opacity: 0.8 }
                    : { cursor: "pointer", backgroundColor: "#D15E9C" }
                }
                disabled={isSubmitting}
                onClick={handleErrorCheck}
              >
                PREVIEW & SUBMIT
              </button>
              <button className="btn-outline-purple" onClick={() => onCancel()}>
                CANCEL
              </button>
            </section>
          </div>

          <div className="relative">
            <PreView
              isLoading={isLoading}
              openFilter={showPreview}
              onClose={!showPreview}
              setShowPreview={setShowPreview}
              showPreview={showPreview}
              data={formData}
              onClick={handleSubmit}
              //
              data1_label={"Date : "}
              data1={moment(formData?.date).format("DD-MM-yyyy")}
              data2_label={"Expected Date : "}
              data2={moment(formData?.expectedDate).format("DD-MM-yyyy")}
              data3_label={"Selected Mill : "}
              data3={formData?.cmsId ? millData?.find(
                (seasonId: any) =>
                  seasonId.id === formData.cmsId
              )?.name
                : null}
              data4_label={"Sample Collection Details: "}
              data4={formData?.sampleCollector}
              data5_label={"Total No of Sample Collected * : "}
              data5={formData?.noOfSamples}
              data6_label={"Lab Name : "}
              data6={formData?.labId ? labData?.find(
                (seasonId: any) =>
                  seasonId.id === formData.labId
              )?.name
                : null}
                data10_label={"Reel Lot No : "}
                data10_data={formData?.reelLotNo}
                data11_label={"Batch/Lot No : "}
                data11_data={formData?.lotNo}
                data12_label={"Program : "}
                data12_data={formData.programId ?
                  LotData?.find(
                    (Id: any) =>
                      Id.program.id === formData.programId
                  )?.program?.program_name : ''}
              // array_img_label={"Samples :"}
              // array_img={formData?.samples}
            />
          </div>
          {isLoading ? <ModalLoader /> : null}
        </div>
      </div>
    );
  }
}
