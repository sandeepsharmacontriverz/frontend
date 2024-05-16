"use client";
import React, { useState, useEffect } from "react";
import NavLink from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import User from "@lib/User";
import { GrAttachment } from "react-icons/gr";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";

export default function page() {
  useTitle("Washing New Process");
  const [roleLoading, hasAccesss] = useRole();

  const router = useRouter();
  const [from, setFrom] = useState<Date | null>(new Date());
  const [program, setProgram] = useState([]);
  const [season, setSeason] = useState<any>();
  const [garment, setGarment] = useState<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [Access, setAccess] = useState<any>({});

  const [fabric, setFabric] = useState<any>();
  const [printing, setPrinitng] = useState<any>();
  const [compacting, setCompacting] = useState<any>();
  const [fabricData, setFabricData] = useState(0);

  const fabricId = User.fabricId;

  const [formData, setFormData] = useState<any>({
    programId: null,
    seasonId: null,
    date: new Date().toISOString(),
    garmentOrderRef: "",
    brandOrderRef: "",
    buyerType: "",
    buyerId: null,
    buyerFabricId: null,
    processorName: null,
    processorAddress: null,
    oldFabricQuantity: "",
    addFabricQuantity: null,
    fabricQuantity: null,
    totalFabricQuantity: "",
    fabricType: null,
    fabricLength: "",
    fabricGsm: "",
    fabricNetWeight: "",
    processWeight: null,
    weightGain: null,
    weightLoss: null,
    batchLotNo: "",
    jobDetails: "",
    washingDetails: "",
    wash_type: "",
    invoiceNo: "",
    orderDetails: "",
    billOfLadding: "",
    transportInfo: "",
    invoiceFiles: [],
    otherDocs: [],
  });

  const [fileName, setFileName] = useState<any>({
    invoiceFiles: [],
    otherDocs: [],
  });

  const [chooseFabric, setChooseFabric] = useState();

  const [errors, setErrors] = useState<any>({});
  useEffect(() => {
    if (
      fabricId &&
      (formData.buyerType === "Printing" || formData.buyerType === "Compacting")
    ) {
      getFabrics(formData.buyerType);
    }
  }, [formData.buyerType, fabricId]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Fabric")) {
      const access = checkAccess("Fabric Washing Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);
  useEffect(() => {
    const savedData: any = sessionStorage.getItem("washing-process");
    const processData = JSON.parse(savedData);
    if (processData) {
      setFormData(processData);
    }
  }, []);

  useEffect(() => {
    const storedTotal = sessionStorage.getItem("choose-washing-process");
    if (storedTotal !== null && storedTotal !== undefined) {
      const parsedTotal = JSON.parse(storedTotal);
      setChooseFabric(parsedTotal);

      if (parsedTotal && parsedTotal.length > 0) {
        const processor = [...new Set(parsedTotal.map((item: any) => item.salesType))]?.join(", ")?.toLowerCase();
        const uniqueIds = new Set<string>();
        const totalChooseYarn = parsedTotal.reduce((acc: number, item: any) => {
          if (!uniqueIds.has(item.id)) {
            uniqueIds.add(item.id);
            return +acc + +item.qtyUsed;
          }
          return acc;
        }, 0);
        setFabricData(totalChooseYarn);
        //updated quanity in fabric and total
        const afterWeightGain =
          formData?.weightGain?.length > 0
            ? totalChooseYarn +
            totalChooseYarn * (Number(formData.weightGain) / 100)
            : totalChooseYarn;
        const afterWeightLoss =
          formData?.weightLoss?.length > 0
            ? totalChooseYarn -
            totalChooseYarn * (Number(formData.weightLoss) / 100)
            : totalChooseYarn;

        setFormData((prevFormData: any) => ({
          ...prevFormData,
          salesType: processor,
          oldFabricQuantity: totalChooseYarn,
          fabricQuantity:
            formData.processWeight === "WeightGain"
              ? afterWeightGain
              : formData.processWeight === "weightLoss"
                ? afterWeightLoss
                : totalChooseYarn,
          totalFabricQuantity:
            formData.processWeight === "WeightGain"
              ? afterWeightGain
              : formData.processWeight === "weightLoss"
                ? afterWeightLoss
                : totalChooseYarn,
        }));
      }
    }
  }, [formData?.weightGain, formData?.weightLoss, formData.processWeight]);

  useEffect(() => {
    if (fabricId) {
      getPrograms();
      getSeason();
      getGarment();
      getKnitFabric();
    }
  }, [fabricId]);

  const getFabrics = async (type: any) => {
    try {
      const fabric = await API.get(
        `fabric-process/get-fabrics?fabricId=${fabricId}&type=${type}`
      );
      if (fabric.success) {
        if (formData.buyerType === "Printing") {
          setPrinitng(fabric.data);
        } else {
          setCompacting(fabric.data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getGarment = async () => {
    try {
      const res = await API.get(
        `fabric-process/get-garments?fabricId=${fabricId}`
      );
      if (res.success) {
        setGarment(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getSeason = async () => {
    try {
      const res = await API.get("season");
      if (res.success) {
        setSeason(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getKnitFabric = async () => {
    try {
      const res = await API.get("fabric-type?status=true");
      if (res.success) {
        setFabric(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getPrograms = async () => {
    try {
      const res = await API.get(
        `fabric-process/get-program?fabricId=${fabricId}`
      );
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
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
  const getChooseYarn = () => {
    if (formData.programId) {
      sessionStorage.setItem("washing-process", JSON.stringify(formData));
      router.push(
        `/fabric/washing-process/choose-fabric?id=${formData.programId}`
      );
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to choose Fabric",
      }));
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
    if (name === "invoiceFiles" || name === "otherDocs") {
      let filesLink: any = [...formData[name]];
      let filesName: any = [...fileName[name]];


      for (let i = 0; i < e?.length; i++) {
        if (!e[i]) {
          return setErrors((prevError: any) => ({
            ...prevError,
            [name]: "No File Selected",
          }));
        } else {
          if (!allowedFormats.includes(e[i]?.type)) {
            setErrors((prevError: any) => ({
              ...prevError,
              [name]: "Invalid file format.Upload a valid Format",
            }));

            e = "";
            return;
          }

          const maxFileSize = 5 * 1024 * 1024;

          if (e[i].size > maxFileSize) {
            setErrors((prevError: any) => ({
              ...prevError,
              [name]: `File size exceeds the maximum limit (5MB).`,
            }));

            e = "";
            return;
          }
        }
        dataVideo.set("file", e[i]);
        try {
          const response = await API.postFile(url, dataVideo);
          if (response.success) {
            filesLink.push(response.data);
            filesName.push(e[i].name);

            setErrors((prev: any) => ({
              ...prev,
              [name]: "",
            }));
          }
        } catch (error) {
          console.log(error, "error");
        }
      }
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: filesLink,
      }));
      setFileName((prevFile: any) => ({
        ...prevFile,
        [name]: filesName,
      }));
    } else {
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
      }
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
  const handleChange = (name?: any, value?: any, event?: any) => {

    if (name === "programId") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    } else if (name === "buyerType") {
      if (value === "Garment") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          buyerFabricId: null,
          processorName: null,
          processorAddress: null,
        }));
      } else if (value === "Printing" || value === "Compacting") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          buyerId: null,
          buyerFabricId: null,
          processorName: null,
          processorAddress: null,
        }));
        if (value === "Printing") {
          setFormData((prevData: any) => ({
            ...prevData,
            [name]: value,
          }));
        } else {
          setFormData((prevData: any) => ({
            ...prevData,
            [name]: value,
          }));
        }
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          buyerFabricId: null,
          buyerId: null,
        }));
      }
    } else if (name === "processWeight") {
      if (value === "WeightGain") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          weightLoss: null,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          weightGain: null,
        }));
      }
    } else if (name === "weightGain" || name === "weightLoss") {
      if (formData.processWeight === "WeightGain") {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [name]: value,
          weightLoss: null,
        }));
      } else {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [name]: value,
          weightGain: null,
        }));
      }
    } else {
      if (name === "otherDocs" || name === "invoiceFiles") {
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

  const onBlur = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;
    const errors = {};

    if (value != "" && type == "alphabets") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Accepts only Alphabets and special characters like _,-,()",
        }));
      }
      return;
    }

    if (value != "" && type == "numbers") {
      const numericValue = value.replace(/[^\d.]/g, "");
      const isValidValue = /^(0*[1-9]\d*(\.\d+)?|0*\.\d+)$/.test(numericValue);

      if (!isValidValue) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Value should be greater than zero.",
        }));
      } else {
        setFormData((prev: any) => ({
          ...prev,
          [name]: numericValue,
        }));
      }
      return;
    }

    if (value != "" && type == "numeric") {
      if (Number(value) <= 0) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Value Should be more than 0",
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: Number(value).toFixed(2),
        }));
      }
      return;
    }

    if (value != "" && type == "alphaNumeric") {
      const valid = regexAlphaNumeric.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only AlphaNumeric values and special characters like _,-,()",
        }));
      }
      return;
    }

    if (type === "bill") {
      if (value != "") {
        const valid = regexBillNumbers.test(value);
        if (!valid) {
          setErrors((prev: any) => ({
            ...prev,
            [name]:
              "Accepts only AlphaNumeric values  and special characters like ,_,-,(),/",
          }));
        }
      }
      return;
    }
  };

  const requiredWeaverFields = [
    "seasonId",
    "date",
    "programId",
    "brandOrderRef",
    "garmentOrderRef",
    "buyerType",
    "buyerId",
    "buyerFabricId",
    "processWeight",
    "processorAddress",
    "processorName",
    "oldFabricQuantity",
    "washingDetails",
    "wash_type",
    "fabricLength",
    "fabricGsm",
    "fabricNetWeight",
    "weightGain",
    "weightLoss",
    "batchLotNo",
    "jobDetails",
    "orderDetails",
    "invoiceNo",
    "billOfLadding",
    "transportInfo",
    "invoiceFiles",
  ];

  const validateField = (
    name: string,
    value: any,
    dataName: string,
    index: number = 0
  ) => {
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;
    const regexNumbers = /^(0*[1-9]\d*(\.\d+)?|0*\.\d+)$/;

    if (requiredWeaverFields.includes(name)) {
      switch (name) {
        case "seasonId":
          return value?.length === 0 || value === null || value === undefined
            ? "Season is required"
            : "";
        case "date":
          return value?.length === 0 || value === null
            ? "Date is required"
            : "";
        case "programId":
          return value?.length === 0 || value === null
            ? "Please select any one option"
            : "";
        case "washingDetails":
          return regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "wash_type":
          return value?.trim() === ""
            ? "Wash Type is Required"
            : regexBillNumbers.test(value) === false
              ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
              : "";
        case "garmentOrderRef":
          return regexAlphaNumeric.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
            : value?.length > 50
              ? "Value should not exceed 50 characters"
              : "";
        case "brandOrderRef":
          return regexAlphaNumeric.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
            : value?.length > 50
              ? "Value should not exceed 50 characters"
              : "";
        case "oldFabricQuantity":
          return value?.length === 0 || value === null
            ? "This field is required"
            : "";
        case "buyerType":
          return value?.trim() === "" ? "Please select any one option" : "";
        case "buyerId":
          return formData.buyerType === "Garment" &&
            (value?.length === 0 || value === null)
            ? "This field is required"
            : "";
        case "invoiceFiles":
          return value?.length === 0 || value === null
            ? "This field is required"
            : "";
        case "buyerFabricId":
          return (formData.buyerType === "Printing" ||
            formData.buyerType === "Compacting") &&
            (value?.length === 0 || value === null)
            ? "This field is required"
            : "";
        case "processWeight":
          return value?.length === 0 || value === null
            ? "Please select any one option"
            : "";
        case "fabricLength":
          return value?.length === 0 || value === null
            ? "Fabric length is required"
            : regexNumbers.test(value) === false
              ? "Value should be greater than zero."
              : value?.length > 4
                ? "Value should not exceed 4 characters"
                : "";
        case "fabricNetWeight":
          return value?.length === 0 || value === null
            ? "Fabric Net Weight is required"
            : regexNumbers.test(value) === false
              ? "Value should be greater than zero."
              : value?.length > 7
                ? "Value should not exceed 7 characters"
                : "";
        case "fabricGsm":
          return value?.length === 0 || value === null
            ? "Fabric GSM is required"
            : value?.length > 20
              ? "Value should not exceed 20 characters"
              : regexAlphaNumeric.test(value) === false
                ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
                : "";
        case "weightGain":
          return formData.processWeight === "WeightGain" && value === null
            ? "Weight gain is required"
            : value !== null && regexNumbers.test(value) === false
              ? "Value should be greater than zero."
              : formData.processWeight === "WeightGain" &&
                (Number(value) < 1 || Number(value) > 15)
                ? "Please enter value beetween 1 to 15"
                : "";
        case "weightLoss":
          return formData.processWeight === "weightLoss" && value === null
            ? "Weight Loss is required"
            : value !== null && regexNumbers.test(value) === false
              ? "Value should be greater than zero."
              : formData.processWeight === "weightLoss" &&
                (Number(value) < 1 || Number(value) > 15)
                ? "Please enter value beetween 1 to 15"
                : "";
        case "jobDetails":
          return regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "orderDetails":
          return regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "batchLotNo":
          return value?.trim() === ""
            ? "Batch/Lot No is required"
            : regexBillNumbers.test(value) === false
              ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
              : value?.length > 20
                ? "Value should not exceed 20 characters"
                : "";
        case "processorAddress":
          return formData.buyerType === "New" && value?.trim() === ""
            ? "Processor Address is required"
            : regexBillNumbers.test(value) === false
              ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
              : "";
        case "processorName":
          return formData.buyerType === "New" && value?.trim() === ""
            ? "Processor Name is required"
            : regexAlphabets.test(value) === false
              ? "Accepts only Alphabets and special characters like _,-,()"
              : "";
        case "invoiceNo":
          return value?.trim() === ""
            ? "Invoice No is required"
            : regexBillNumbers.test(value) === false
              ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
              : "";
        case "billOfLadding":
          return value?.trim() === ""
            ? "This field is required"
            : regexBillNumbers.test(value) === false
              ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
              : "";
        case "transportInfo":
          return value?.trim() === ""
            ? "Transporter Info is required"
            : regexAlphaNumeric.test(value) === false
              ? "Accepts only AlphaNumeric values and special characters like _,-,()"
              : "";

        default:
          return "";
      }
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newWeaverErrors: any = {};

    Object.keys(formData).forEach((fieldName: string) => {
      newWeaverErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "weaver"
      );
    });

    const hasWeaversErrors = Object.values(newWeaverErrors).some(
      (error) => !!error
    );

    if (hasWeaversErrors) {
      setErrors(newWeaverErrors);
    }

    if (!hasWeaversErrors) {
      try {
        setIsSubmitting(true);
        const response = await API.post("fabric-process/washing-process", {
          ...formData,
          washingId: fabricId,
          chooseFabric: chooseFabric,
          buyerId:
            formData.buyerType === "Garment" ? Number(formData?.buyerId?.value) : null,
          buyerFabricId: Number(formData?.buyerFabricId?.value),

        });
        if (response.success) {
          toasterSuccess("Process created successfully");
          sessionStorage.removeItem("washing-process");
          sessionStorage.removeItem("choose-washing-process");
          router.push(`/fabric/washing-process`);
        } else {
          setIsSubmitting(false);
        }
      } catch (error) {
        toasterError("An Error occurred.");
        setIsSubmitting(false);
      }
    } else {
      return;
    }
  };

  const removeImage = (index: any, name: string) => {
    let nameInvoice = fileName.invoiceFiles;
    let linkInvoice = formData.invoiceFiles;

    let nameOther = fileName.otherDocs;
    let linkOther = formData.otherDocs;

    let invoiceName = nameInvoice.filter(
      (element: any, i: number) => index !== i
    );
    let invoiceLink = linkInvoice.filter(
      (element: any, i: number) => index !== i
    );

    let otherName = nameOther.filter((element: any, i: number) => index !== i);
    let otherLink = linkOther.filter((element: any, i: number) => index !== i);

    setFormData((prevData: any) => ({
      ...prevData,
      invoiceFiles: invoiceLink,
      otherDocs: otherLink,
    }));
    if (name === "invoiceFiles") {
      setFileName((prevData: any) => ({
        ...prevData,
        invoiceFiles: invoiceName,
      }));
    } else {
      setFileName((prevData: any) => ({
        ...prevData,
        otherDocs: otherName,
      }));
    }
  };

  if (roleLoading) {
    return <Loader />;
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
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <NavLink href="/fabric/dashboard" className="active">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/fabric/washing-process" className="active">
                    Process/Sale
                  </NavLink>
                </li>
                <li>New Process </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div className="w-100">
            <div className="customFormSet">
              <div className="w-100">
                <div className="row">
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Season <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="seasonId"
                      value={formData.seasonId ? { label: season?.find((seasonId: any) => seasonId.id === formData.seasonId)?.name, value: formData.seasonId } : null}
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Season"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(season || []).map(({ id, name }: any) => ({
                        label: name,
                        value: id,
                        key: id
                      }))}
                      onChange={(item: any) => {
                        handleChange("seasonId", item?.value);
                      }}
                    />
                    {errors?.seasonId !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.seasonId}
                      </div>
                    )}
                  </div>
                  <div className=" col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={from}
                      dateFormat={"dd-MM-yyyy"}
                      maxDate={new Date()}
                      onChange={handleFrom}
                      showYearDropdown
                      className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.date && (
                      <p className="text-red-500  text-sm mt-1">{errors.date}</p>
                    )}
                  </div>

                  <div className=" col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Garment Order Reference
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="garmentOrderRef"
                      value={formData.garmentOrderRef || ""}
                      onBlur={(e) => onBlur(e, "alphaNumeric")}
                      onChange={(e) => handleChange("garmentOrderRef", e.target.value)}
                      placeholder="Garment Order Reference"
                    />
                    {errors?.garmentOrderRef !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.garmentOrderRef}
                      </div>
                    )}
                  </div>
                  <div className=" col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Brand Order Reference
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="brandOrderRef"
                      value={formData.brandOrderRef || ""}
                      onBlur={(e) => onBlur(e, "alphaNumeric")}
                      onChange={(e) => handleChange("brandOrderRef", e.target.value)}
                      placeholder="Brand Order Reference"
                    />
                    {errors?.brandOrderRef !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.brandOrderRef}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Program <span className="text-red-500">*</span>
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      {program?.map((program: any) => (
                        <label
                          className="mt-1 d-flex mr-4 align-items-center"
                          key={program.id}
                        >
                          <section>
                            <input
                              type="radio"
                              name="programId"
                              checked={formData.programId === program.id}
                              value={program.id || ""}
                              onChange={() => handleChange("programId", program.id)}

                            />
                            <span></span>
                          </section>{" "}
                          {program.program_name}
                        </label>
                      ))}
                    </div>
                    {errors?.programId !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.programId}
                      </div>
                    )}
                  </div>

                  <div className="col-12  col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Choose Fabric <span className="text-red-500">*</span>
                    </label>
                    <button
                      name="chooseYarn"
                      type="button"
                      onClick={() => getChooseYarn()}
                      className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                    >
                      Choose Fabric
                    </button>
                    {errors?.oldFabricQuantity && (
                      <div className="text-sm text-red-500">
                        {errors.oldFabricQuantity}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Quantity in kgs (Knitted Fabric)<span className="text-red-500">*</span>
                    </label>
                    <input
                      name="oldFabricQuantity"
                      value={formData.salesType === "knitter" && formData.totalFabricQuantity || ""}
                      onChange={(event) => handleChange(event)}
                      type="text"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      readOnly
                    />
                    {errors?.oldFabricQuantity && (
                      <div className="text-sm text-red-500">
                        {errors.oldFabricQuantity}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Quantity in Mts (Woven Fabric){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="oldFabricQuantity"
                      value={formData.salesType !== "knitter" && formData.totalFabricQuantity || ""}
                      onChange={(event) => handleChange(event)}
                      type="text"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      readOnly
                    />
                    {errors?.oldFabricQuantity && (
                      <div className="text-sm text-red-500">
                        {errors.oldFabricQuantity}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Choose Buyer <span className="text-red-500">*</span>
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="buyerType"
                            value="Garment"
                            checked={formData.buyerType === "Garment"}
                            onChange={(e) => handleChange("buyerType", e.target.value)}
                          />
                          <span></span>
                        </section>
                        Garment
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="buyerType"
                            checked={formData.buyerType === "Printing"}
                            onChange={(e) => handleChange("buyerType", e.target.value)}
                            value="Printing"
                          />
                          <span></span>
                        </section>{" "}
                        Printing
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="buyerType"
                            checked={formData.buyerType === "Compacting"}
                            onChange={(e) => handleChange("buyerType", e.target.value)}
                            value="Compacting"
                          />
                          <span></span>
                        </section>{" "}
                        Compacting
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="buyerType"
                            value="New"
                            checked={formData.buyerType === "New"}
                            onChange={(e) => handleChange("buyerType", e.target.value)}
                          />
                          <span></span>
                        </section>
                        New Buyer
                      </label>
                    </div>
                    {errors?.buyerType !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.buyerType}
                      </div>
                    )}
                  </div>

                  {formData.buyerType === "Garment" ? (
                    <>
                      <div className=" col-12 col-sm-6 mt-4 ">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Garment
                          <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={formData.buyerId}
                          name="buyerId"
                          menuShouldScrollIntoView={false}
                          isClearable
                          placeholder="Select Garment"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                          options={
                            (garment || []).map(({ id, name }: any) => ({
                              label: name,
                              value: id,
                              key: id
                            })) as unknown as readonly (
                              | string
                              | GroupBase<string>
                            )[]
                          }
                          onChange={(item: any) =>
                            handleChange("buyerId", item)
                          }
                        />
                        {errors?.buyerId !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.buyerId}
                          </div>
                        )}
                      </div>
                    </>
                  ) : formData.buyerType === "New" ? (
                    <>
                      <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Processor Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="processorName"
                          onBlur={(e) => onBlur(e, "alphabets")}
                          value={formData.processorName || ""}
                          onChange={(e) => handleChange("processorName", e.target.value)}
                          placeholder="Processor Name"
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                        {errors?.processorName !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.processorName}
                          </div>
                        )}
                      </div>

                      <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="processorAddress"
                          onBlur={(e) => onBlur(e, "bill")}
                          value={formData.processorAddress || ""}
                          onChange={(e) => handleChange("processorAddress", e.target.value)}
                          placeholder="Address"
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                        {errors?.processorAddress !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.processorAddress}
                          </div>
                        )}
                      </div>
                    </>
                  ) : formData.buyerType === "Printing" ? (
                    <>
                      {/* <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Printing <span className="text-red-500">*</span>
                        </label>
                        <Form.Select
                          aria-label="buyerFabricId"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                          name="buyerFabricId"
                          value={formData.buyerFabricId || ""}
                          onChange={(event) => handleChange(event)}
                        >
                          <option value="">Select Printing</option>
                          {printing?.map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </Form.Select>
                        {errors?.buyerFabricId && (
                          <div className="text-sm text-red-500">
                            {errors.buyerFabricId}
                          </div>
                        )}
                      </div> */}

                      <>
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Printing
                            <span className="text-red-500">*</span>
                          </label>
                          <Select
                            name="buyerFabricId"
                            value={formData.buyerFabricId}
                            menuShouldScrollIntoView={false}
                            isClearable
                            placeholder="Select Printing"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={
                              (printing || []).map(({ id, name }: any) => ({
                                label: name,
                                value: id,
                                key: id
                              })) as unknown as readonly (
                                | string
                                | GroupBase<string>
                              )[]
                            }
                            onChange={(item: any) =>
                              handleChange("buyerFabricId", item)
                            }
                          />
                          {errors?.buyerFabricId && (
                            <div className="text-sm text-red-500">
                              {errors.buyerFabricId}
                            </div>
                          )}
                        </div>
                      </>
                    </>
                  ) : formData.buyerType === "Compacting" ? (
                    <>
                      <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Compacting
                          <span className="text-red-500">*</span>
                        </label>
                        <Select
                          name="buyerFabricId"
                          value={formData.buyerFabricId}
                          menuShouldScrollIntoView={false}
                          isClearable
                          placeholder="Select Compacting"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                          options={
                            (compacting || []).map(({ id, name }: any) => ({
                              label: name,
                              value: id,
                              key: id
                            })) as unknown as readonly (
                              | string
                              | GroupBase<string>
                            )[]
                          }
                          onChange={(item: any) =>
                            handleChange("buyerFabricId", item)
                          }
                        />
                        {errors?.buyerFabricId && (
                          <div className="text-sm text-red-500">
                            {errors.buyerFabricId}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    ""
                  )}

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Process Weight Loss/Gain{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="processWeight"
                            checked={formData.processWeight === "WeightGain"}
                            onChange={(e) => handleChange("processWeight", e.target.value)}
                            value="WeightGain"
                            className="form-radio"
                          />
                          <span></span>
                        </section>
                        Weight Gain
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="processWeight"
                            checked={formData.processWeight === "weightLoss"}
                            onChange={(e) => handleChange("processWeight", e.target.value)}
                            value="weightLoss"
                            className="form-radio"
                          />
                          <span></span>
                        </section>
                        Weight Loss
                      </label>
                    </div>
                    {errors?.processWeight !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.processWeight}
                      </div>
                    )}
                  </div>

                  {formData.processWeight === "weightLoss" && (
                    <div className="col-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Weight Loss <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="weightLoss"
                        value={formData.weightLoss || ""}
                        onBlur={(e) => onBlur(e, "numbers")}
                        onChange={(e) => handleChange("weightLoss", e.target.value)}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        placeholder="Weight Loss"
                      />
                      {errors?.weightLoss !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.weightLoss}
                        </div>
                      )}
                    </div>
                  )}
                  {formData.processWeight === "WeightGain" && (
                    <div className="col-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Weight Gain <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="weightGain"
                        value={formData.weightGain || ""}
                        onBlur={(e) => onBlur(e, "numbers")}
                        onChange={(e) => handleChange("weightGain", e.target.value)}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        placeholder="Weight Gain"
                      />
                      {errors?.weightGain !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.weightGain}
                        </div>
                      )}
                    </div>
                  )}

                  <div className=" col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Washing Details
                    </label>
                    <input
                      name="washingDetails"
                      value={formData.washingDetails}
                      onBlur={(e) => onBlur(e, "bill")}
                      placeholder="Washing Details"
                      onChange={(e) => handleChange("washingDetails", e.target.value)}
                      type="text"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors?.washingDetails !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.washingDetails}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Type of Wash <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="wash_type"
                      value={formData.wash_type}
                      onChange={(e) => handleChange("wash_type", e.target.value)}
                      onBlur={(e) => onBlur(e, "bill")}
                      type="text"
                      placeholder="Type of Wash"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors?.wash_type && (
                      <div className="text-sm text-red-500">
                        {errors.wash_type}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Finished Washed Fabric Length in Mts{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      name="fabricLength"
                      value={formData.fabricLength}
                      onBlur={(e) => onBlur(e, "numbers")}
                      onChange={(e) => handleChange("fabricLength", e.target.value)}
                      type="number"
                      placeholder="Fabric Length"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors?.fabricLength && (
                      <div className="text-sm text-red-500">
                        {errors.fabricLength}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Finished Washed Fabric GSM{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="fabricGsm"
                      value={formData.fabricGsm || ""}
                      onBlur={(e) => onBlur(e, "alphaNumeric")}
                      onChange={(e) => handleChange("fabricGsm", e.target.value)}
                      type="text"
                      placeholder="GSM"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors?.fabricGsm !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.fabricGsm}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Finished Washed Fabric Net Weight{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="fabricNetWeight"
                      value={formData.fabricNetWeight}
                      onBlur={(e) => onBlur(e, "numbers")}
                      onChange={(e) => handleChange("fabricNetWeight", e.target.value)}
                      type="number"
                      placeholder="Fabric Net Weight"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.fabricNetWeight && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.fabricNetWeight}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Batch/Lot No <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="batchLotNo"
                      value={formData.batchLotNo}
                      onBlur={(e) => onBlur(e, "bill")}
                      onChange={(e) => handleChange("batchLotNo", e.target.value)}
                      type="text"
                      placeholder="Batch Lot No"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.batchLotNo && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.batchLotNo}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Job details from garment
                    </label>
                    <input
                      name="jobDetails"
                      value={formData.jobDetails}
                      onBlur={(e) => onBlur(e, "bill")}
                      onChange={(e) => handleChange("jobDetails", e.target.value)}
                      type="text"
                      placeholder="Job details from garment"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.jobDetails && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.jobDetails}
                      </p>
                    )}
                  </div>

                  <div className="col-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Order details
                    </label>
                    <input
                      name="orderDetails"
                      value={formData.orderDetails}
                      onChange={(e) => handleChange("orderDetails", e.target.value)}
                      onBlur={(e) => onBlur(e, "bill")}
                      type="text"
                      placeholder="Order details"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.orderDetails && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.orderDetails}
                      </p>
                    )}
                  </div>
                </div>

                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">OTHER INFORMATION:</h4>
                  <div className="row">
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Invoice No
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="invoiceNo"
                        value={formData.invoiceNo}
                        onChange={(e) => handleChange("invoiceNo", e.target.value)}
                        onBlur={(e) => onBlur(e, "bill")}
                        type="text"
                        placeholder="Invoice No"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.invoiceNo && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.invoiceNo}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Bill of Lading <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="billOfLadding"
                        value={formData.billOfLadding}
                        onBlur={(e) => onBlur(e, "bill")}
                        onChange={(e) => handleChange("billOfLadding", e.target.value)}
                        type="text"
                        placeholder="bill Of Ladding"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.billOfLadding && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.billOfLadding}
                        </p>
                      )}
                    </div>

                    <div className="col-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Transporter Information{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="transportInfo"
                        value={formData.transportInfo}
                        onChange={(e) => handleChange("transportInfo", e.target.value)}
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        type="text"
                        placeholder="Transport Info"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.transportInfo && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.transportInfo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">DOCUMENTS:</h4>
                  <div className="row">
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Invoice File(Multi Upload){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="invoiceFiles"
                            type="file"
                            multiple
                            accept=".pdf,.zip, image/jpg, image/jpeg"
                            onChange={(e) => handleChange("invoiceFiles", e?.target?.files)}
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                      </p>
                      {errors?.invoiceFiles !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.invoiceFiles}
                        </div>
                      )}
                      {fileName.invoiceFiles &&
                        fileName.invoiceFiles.map((item: any, index: any) => (
                          <div className="flex text-sm mt-1" key={index}>
                            <GrAttachment />
                            <p className="mx-1">{item}</p>
                            <div className="w-1/3">
                              <button
                                name="handle"
                                type="button"
                                onClick={() => removeImage(index, "invoiceFiles")}
                                className="text-sm rounded text-black px-2 font-semibold"
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Other documents
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="otherDocs"
                            type="file"
                            multiple
                            accept=".pdf,.zip, image/jpg, image/jpeg"
                            onChange={(e) => handleChange("otherDocs", e?.target?.files)}
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                      </p>
                      {errors?.otherDocs !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.otherDocs}
                        </div>
                      )}
                      {fileName.otherDocs &&
                        fileName.otherDocs.map((item: any, index: any) => (
                          <div className="flex text-sm mt-1" key={index}>
                            <GrAttachment />
                            <p className="mx-1">{item}</p>
                            <div className="w-1/3">
                              <button
                                name="handle"
                                type="button"
                                onClick={() =>
                                  removeImage(index, "otherDocs")
                                }
                                className="text-sm rounded text-black px-2 font-semibold"
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div>
                  <hr className="mt-5 mb-5" />
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
                      Submit
                    </button>
                    <button
                      className="btn-outline-purple"
                      onClick={() => {
                        router.push("/fabric/washing-process");
                        sessionStorage.removeItem("washing-process");
                        sessionStorage.removeItem("choose-washing-process");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
