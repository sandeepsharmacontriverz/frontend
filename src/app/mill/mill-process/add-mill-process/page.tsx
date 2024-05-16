"use client";

import React, { useState, useEffect } from "react";
import useTranslations from "@hooks/useTranslation";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterInfo, toasterSuccess } from "@components/core/Toaster";
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

const initialWeightAndCone = {
  weight: "",
  cone: "",
  originalSampleStatus: "",
};

export default function page() {
  useTitle("New Process");

  const [roleLoading, hasAccesss] = useRole();
  const millId = User.MillId;

  const router = useRouter();
  const { translations, loading } = useTranslations();
  const [Access, setAccess] = useState<any>({});

  const [millData, setMillData] = useState<any>({});
  const [from, setFrom] = useState<Date | null>(new Date());
  const [season, setSeason] = useState<any>();
  const [physicalTraceabilityPartners, setPhysicalTraceabilityPartners] =
    useState<Array<any>>([]);
  const [choosePaddy, setchoosePaddy] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherData, setOtherData] = useState("");
  const [program, setProgram] = useState<any>();
  const [yarnCount, setYarnCount] = useState<any>();
  const [cottonMix, setCottonMix] = useState<any>([]);
  const [totalBlend, setTotalBlend] = useState<any>(0);
  const [riceVariety, setRiceVariety] = useState<any>([]);
  const [riceType, setRiceType] = useState<any>([]);

  const [mandiOutRange, setMandiOutRange] = useState<any>({
    from: "",
    to: "",
  });

  const a = localStorage.getItem("role");

  const [showPreview, setShowPreview] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(false);

  const [riceTypeMulti, setRiceTypeMulti] = useState<any>();
  const [riceQtyMulti, setRiceQtyMulti] = useState<any>([]);
  const [other, setOther] = useState<any>(false);
  const [errors, setErrors] = useState<any>({});
  const [weightAndConeErrors, setWeightAndConeErrors] = useState<Array<any>>([
    JSON.parse(JSON.stringify(initialWeightAndCone)),
  ]);
  const [dataLength, setDataLength] = useState(0);

  const [yarnData, setYarnData] = useState<any>([]);
  const [fileName, setFileName] = useState({
    riceQualityDocument: "",
  });

  const [formData, setFormData] = useState<any>({
    date: new Date(),
    programId: null,
    seasonId: null,
    orderReference: "",
    stackNo: "",
    godownNo: "",
    totalQty: null,
    riceVariety: "",
    riceType: [],
    riceQtyProduced: [],
    riceRealisation: 0,
    netRiceQty: null,
    husks: null,
    noOfBag: null,
    batchLotNo: "",
    // bagId: "",
    processComplete: null,
    otherRequired: null,
    riceQualityDocument: ""
    // enterPhysicalTraceability: "",
    // dateSampleCollection: "",
    // weightAndCone: [JSON.parse(JSON.stringify(initialWeightAndCone))],
    // dataOfSampleDispatch: "",
    // operatorName: "",
    // expectedDateOfYarnSale: "",
    // physicalTraceabilityPartnerId: "",
  });

  useEffect(() => {
    if (millId) {
      getRiceType();
      getRiceVariety();
    }
  }, [millId])

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Mill")) {
      const access = checkAccess("Mill Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    const savedData: any = sessionStorage.getItem("millLint");
    const totalQuantity: any = sessionStorage.getItem("millChoosePaddy");

    const processData = JSON.parse(savedData);
    const cottonData = JSON.parse(totalQuantity);

      const riceVarietiesMap = new Map();
      const riceVarietiesIds = new Map();
      
      cottonData && Object?.values(cottonData)?.forEach((obj:any) => {
          obj?.rice_variety?.forEach((variety:any) => {
              riceVarietiesMap?.set(variety.id, variety.variety_name);
              riceVarietiesIds?.set(variety.id, variety.id);
          });
      });
      
      const riceVarietyArray = Array?.from(riceVarietiesMap?.values());
      const riceVarietiesIdsArray = Array?.from(riceVarietiesIds?.values());

    if (processData) {
      setFormData(processData);
    }
    setchoosePaddy(cottonData);

    setFormData((prev: any) => ({
      ...prev,
      noOfBag: cottonData?.noOfBags,
      riceVarietyName: riceVarietyArray,
      riceVariety: riceVarietiesIdsArray,
    }));
  }, []);

  useEffect(() => {
    const cottonTotal = choosePaddy && choosePaddy?.totalQuantityUsed
      ? choosePaddy?.totalQuantityUsed
      : 0;

    if (cottonTotal > 0) {
      setErrors((prev: any) => ({
        ...prev,
        choosePaddyReq: "",
      }));
    }

    setFormData((prev: any) => ({
      ...prev,
      totalQty: DecimalFormat(+cottonTotal),
    }));


  }, [choosePaddy]);

  useEffect(()=>{
    if(formData.totalQty && formData.riceQtyProduced?.length > 0){
      const totalRice = formData.riceQtyProduced?.reduce((acc:any, curr:any) => acc + curr, 0) || 0;
      const finalVal:any = (totalRice / Number(formData?.totalQty)) * 100;

      if (
         finalVal < Number(mandiOutRange.from) ||
        finalVal > Number(mandiOutRange.to)
      ) {
        setErrors((prev: any) => ({
          ...prev,
          riceRealisation: `Rice Recovery out of range. Rice Recovery should be between ${mandiOutRange.from} and ${mandiOutRange.to}`,
        }));
        setFormData((prev: any) => ({
          ...prev,
          netRiceQty:null,
          riceRealisation:null
        }))
      } else {
        setErrors((prev: any) => ({
          ...prev,
          riceRealisation: "",
        }));

      setFormData((prev: any) => ({
        ...prev,
        husks: Number(formData.totalQty) - Number(totalRice),
        riceRealisation: finalVal.toFixed(2),
        netRiceQty: Number(totalRice) ? Number(totalRice) : 0,
      }));
      }
      if(parseInt(finalVal)){
        toasterInfo(`Rice Recovery is ${finalVal.toFixed(2)}%`, 3000, 1);
      }
    }
    sessionStorage.setItem("millLint", JSON.stringify(formData));
    },[formData.totalQty, formData.riceQtyProduced,mandiOutRange])

  useEffect(() => {
    if (millId) {
      getMillData();
      getSeason();
      // getYarnCount();
      fetchProcessesLength();
      getProgram();
      // getCottonMix();

      // setPhysicalTraceabilityPartners([]);
    }
  }, [millId]);

  const getRiceVariety = async () => {
    const url = `mill-process/get-rice-variety?millId=${millId}`
    try {
      const response = await API.get(url)
      setRiceVariety(response.data)
    }
    catch (error) {
      console.log(error, "error")
    }
  };

  const getRiceType = async () => {
    const url = `mill-process/get-rice-type?millId=${millId}`
    try {
      const response = await API.get(url)
      setRiceType(response.data)
    }
    catch (error) {
      console.log(error, "error")
    }
  };
  const requiredFields = [
    "seasonId",
    "date",
    "programId",
    "otherMix",
    "riceVariety",
    "otherData",
    "cottonmixType",
    "riceRealisation",
    "riceType",
    "riceQtyProduced",
    "batchLotNo",
    "processComplete",
    "otherRequired",
    "processorName",
    "processName",
    "processLoss",
    "dyeingAddress",
    "dateSampleCollection",
    "weightAndCone.weight",
    "weightAndCone.cone",
    "weightAndCone.originalSampleStatus",
    "dataOfSampleDispatch",
    "operatorName",
    "expectedDateOfYarnSale",
    "physicalTraceabilityPartnerId",
    "otherProcesses"
  ];

  const validateField = (name: string, value: any, dataName: string) => {
    if (dataName === "errors") {
      if (requiredFields.includes(name)) {
        switch (name) {
          case "date":
            return value.length === 0 ? "Date is required" : "";
          case "seasonId":
            return value?.length === 0 || value === null || value === undefined
              ? "Season is required"
              : "";
          case "batchLotNo":
            return value.trim() === ""
              ? "Batch Lot No is required"
              : errors.batchLotNo !== ""
                ? errors.batchLotNo
                : "";
          case "programId":
            return value === null ? "Please select any one option" : "";
          case "riceQtyProduced":
            return value === null || formData.riceQtyProduced?.length === 0
              ? "Rice quanity Produced is required"
              : "";
          case "otherMix":
            return value === null ? "Please select any one option" : "";
          // case "noOfBox":
          //   return value === null
          //     ? "No of boxes/Cartons is required" : errors.noOfBox !== "" ? errors.noOfBox : "";
          case "cottonmixType":
            return formData.otherMix === true && totalBlend === 0
              ? "Please Fill the required fields"
              : errors.cottonmixType !== ""
                ? errors.cottonmixType
                : "";
          // case "boxId":
          //   return errors.boxId !== "" ? errors.boxId : "";
          case "yarnRealisation":
            return errors.yarnRealisation !== "" ? errors.yarnRealisation : "";
          case "riceVariety":
            return !value
              ? "Please select any one option"
              : "";
          case "otherData":
            return other && value.trim() === ""
              ? "Others is Required"
              : errors.otherData !== ""
                ? errors.otherData
                : "";
          case "riceType":
            return value === null || formData.riceType?.length === 0
              ? "Rice Quantity Produced(Kgs) is required"
              : "";
          case "processComplete":
            return value === null ? "Please select any one option" : "";
          case "otherRequired":
            return value === null ? "Please select any one option" : "";
          case "processorName":
            return formData.dyeingRequired === true && value.trim() === ""
              ? "Processor name is Required"
              : errors.processorName !== ""
                ? errors.processorName
                : "";
          case "otherProcess":
            return formData.otherRequired === true && value.trim() === ""
              ? "Other Process is Required"
              : "";
          case "dyeingAddress":
            return formData.dyeingRequired === true && value.trim() === ""
              ? "Address is Required"
              : errors.dyeingAddress !== ""
                ? errors.dyeingAddress
                : "";
          case "processLoss":
            return formData.dyeingRequired === true && value === null
              ? "Process Loss is Required"
              : errors.processLoss !== ""
                ? errors.processLoss
                : "";

          case "dateSampleCollection":
            return formData.enterPhysicalTraceability && !value
              ? "Date of sample collection is required"
              : "";
          case "weightAndCone.weight":
            return formData.enterPhysicalTraceability && !value
              ? "Weight is required"
              : "";
          case "weightAndCone.cone":
            return formData.enterPhysicalTraceability && !value
              ? "Cone is required"
              : "";
          case "weightAndCone.originalSampleStatus":
            return formData.enterPhysicalTraceability && !value
              ? "Original sample status is required"
              : "";
          case "dataOfSampleDispatch":
            return formData.enterPhysicalTraceability &&
              (!value || value.trim() === "")
              ? "Data of sample dispatch is required"
              : "";
          case "operatorName":
            return formData.enterPhysicalTraceability &&
              (!value || value.trim() === "")
              ? "Operator name is required"
              : "";
          case "expectedDateOfYarnSale":
            return formData.enterPhysicalTraceability && !value
              ? "Expected date of yarn sale is required"
              : "";
          case "physicalTraceabilityPartnerId":
            return formData.enterPhysicalTraceability && !value
              ? "Rice Testing Partner is required"
              : "";
          default:
            return "";
        }
      } else {
        return "";
      }
    }
  };

  const onCancel = () => {
    router.push("/mill/mill-process");
    sessionStorage.removeItem("millLint");
    sessionStorage.removeItem("millChoosePaddy");
  };

  const handleErrorCheck = async (event: any) => {
    event.preventDefault();

    const newErrors: any = {};

    Object.keys(formData)?.forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "errors"
      );
    });

    newErrors["otherData"] = validateField("otherData", otherData, "errors");

    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (hasErrors) {
      setErrors(newErrors);
    }

    if (!choosePaddy) {
      setErrors((prev: any) => ({
        ...prev,
        choosePaddyReq: "Choose Paddy is Required",
      }));
      return;
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

    if (formData.enterPhysicalTraceability) {
      formData.weightAndCone.map((weightAndCone: any, index: number) => {
        const weightAndConeErrors: any = {};
        Object.keys(weightAndCone)?.forEach((fieldName: string) => {
          const fieldError = validateField(
            `weightAndCone.${fieldName}`,
            weightAndCone[fieldName as keyof any],
            "errors"
          );
          weightAndConeErrors[fieldName] = fieldError || "";
        });
        newWeightAndConeErrors[index] = weightAndConeErrors;
      });
    }

    newErrors["otherData"] = validateField("otherData", otherData, "errors");

    const hasErrors = Object.values(newErrors).some((error) => !!error);

    const hasWeightAndConeErrors = newWeightAndConeErrors.some((errors: any) =>
      Object.values(errors).some((error) => error)
    );
    if (hasWeightAndConeErrors) {
      setWeightAndConeErrors(newWeightAndConeErrors);
    }

    if (hasErrors) {
      setErrors(newErrors);
    }

    if (!choosePaddy) {
      setErrors((prev: any) => ({
        ...prev,
        choosePaddyReq: "Choose Paddy is Required",
      }));
      return;
    }
    const bagsData = Object.values(choosePaddy)?.flatMap((obj:any) => obj.bags)?.filter((item:any)=> item !== undefined);
    const selectedBags = bagsData?.filter((item:any)=> item.select)

    if (!hasErrors && !hasWeightAndConeErrors) {
      try {
        setIsSubmitting(true);
        setIsLoading(true);
        const response = await API.post("mill-process", {
          ...formData,
          bags: selectedBags,
          millId: millId,
          rices: yarnData,
          brandId: millData.brand[0],
          millShortname: millData.short_name,
        });

        if (response.success) {
          toasterSuccess("Process Successfully Created");
          router.push("/mill/mill-process");
          sessionStorage.removeItem("millLint");
          sessionStorage.removeItem("millChoosePaddy");
        } else {
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

  const onBlur = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;

    if (value !== "" && type === "alphabets") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only Alphabets and special characters like comma(,),_,-,(),.",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

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

    if (value !== "" && type === "percentage") {
      if (Number(value) < 0 || Number(value) > 100) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Percentage value should be in between 0 and 100",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

    if (value !== "" && type === "numeric") {
      if (Number(value) <= 0) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Value Should be more than 0",
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: DecimalFormat(+value),
        }));
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

    if (value !== "" && type === "alphaNumeric") {
      const valid = regexAlphaNumeric.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only AlphaNumeric values and special characters like comma(,),.,_,-,()",
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
      setErrors((prev: any) => ({
        ...prev,
        programId: "",
      }));
    } 
    else {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };


  const handleAddMoreWeightAndCone = () => {
    setFormData((prev: any) => ({
      ...prev,
      weightAndCone: [
        ...prev.weightAndCone,
        JSON.parse(JSON.stringify(initialWeightAndCone)),
      ],
    }));
    setWeightAndConeErrors((prev: any) => [
      ...prev,
      JSON.parse(JSON.stringify(initialWeightAndCone)),
    ]);
  };

  const handleDeleteWeightAndCone = (index: number) => {
    const tempWeightAndCone = [...formData.weightAndCone];
    tempWeightAndCone.splice(index, 1);
    setFormData((prev: any) => ({
      ...prev,
      weightAndCone: tempWeightAndCone,
    }));

    const tempWeightAndConeErrors = [...weightAndConeErrors];
    tempWeightAndConeErrors.splice(index, 1);
    setWeightAndConeErrors(tempWeightAndConeErrors);
  };

  const handleWeightAndConeChange = (
    key: string,
    value: any,
    index: number
  ) => {
    const tempWeightAndCone = [...formData.weightAndCone];
    tempWeightAndCone[index][key] = value;
    setFormData((prev: any) => ({
      ...prev,
      weightAndCone: tempWeightAndCone,
    }));

    const tempWeightAndConeErrors = [...weightAndConeErrors];
    tempWeightAndConeErrors[index][key] = "";
    setWeightAndConeErrors(tempWeightAndConeErrors);
  };

  // useEffect(() => {
  //   if (millData.brand) {
  //     getPhysicalTraceabilityPartners();
  //   }
  // }, [millData.brand]);

  const getMillData = async () => {
    const url = `mill/get-mill?id=${millId}`;
    try {
      const response = await API.get(url);
      setMillData(response.data);
      setMandiOutRange({
        from: response.data?.realisation_range_from,
        to: response.data?.realisation_range_to,
      });
    } catch (error) {
      console.log(error, "error");
    }
  };

  const fetchProcessesLength = async () => {
    try {
      const res = await API.get(`mill-process?millId=${millId}`);
      if (res.success) {
        setDataLength(res.data?.length);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSeason = async () => {
    try {
      const res = await API.get(`season?status=true`);
      if (res.success) {
        setSeason(res.data?.slice(-3));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProgram = async () => {
    try {
      const res = await API.get(
        `mill-process/get-program?millId=${millId}`
      );
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dataUpload = async (name: any, e: any,) => {
    const url = "file/upload";
    const allowedFormats = ["application/pdf", "application/doc", "application/docx"];
    const dataVideo = new FormData();
    let updated = false

    if (!e) {
      setErrors((prevError: any) => ({
        ...prevError,
        [name]: `No File Selected.`,
      }));
      return;
    } else {
      if (!allowedFormats.includes(e?.type)) {
        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "Invalid file format. Upload a valid format."
        }));
        e = "";
        return;
      }

      const maxFileSize = 5 * 1024 * 1024;

      if (e.size > maxFileSize) {
        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "File size exceeds the maximum limit (5MB)."
        }));
        e = "";
        return;

      }
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
        setErrors((prevError: any) => ({
          ...prevError,
          [name]: ""
        }));

      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getPhysicalTraceabilityPartners = async () => {
    try {
      const res = await API.get(
        `physical-partner?brandId=${millData?.brand?.join(",") || ""}`
      );
      if (res.success) {
        setPhysicalTraceabilityPartners(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const choosePaddyButton = () => {
    if (formData.programId !== null) {
      sessionStorage.setItem("millLint", JSON.stringify(formData));
      router.push(
        `/mill/mill-process/choose-paddy?id=${formData.programId}`
      );
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to choose Paddy",
      }));
    }
  };


  const addMultiYarn = () => {
    if (Number(formData.totalQty) === 0 || formData.totalQty === null) {
      setErrors((prevData: any) => ({
        ...prevData,
        yarnCount: "Select Choose Paddy",
      }));
      return;
    }
    if (riceTypeMulti?.value > 0 && riceQtyMulti > 0) {
      setErrors((prevData: any) => ({
        ...prevData,
        riceType: "",
        riceQtyProduced: "",
      }));
      if (Number(riceQtyMulti) === 0) {
        setErrors((prevData: any) => ({
          ...prevData,
          riceQtyProduced: "Quantity must be greater than 0",
        }));
      } else if (formData?.riceType?.includes(Number(riceTypeMulti?.value))) {
        setErrors((prevData: any) => ({
          ...prevData,
          riceType: "Already Exist",
        }));
      } else {
        const totalRiceQty = formData.riceQtyProduced.reduce(
          (acc: any, curr: any) => acc + curr,
          0
        );
        if (totalRiceQty + Number(riceQtyMulti) > Number(formData.totalQty)) {
          setErrors((prevData: any) => ({
            ...prevData,
            riceQtyProduced:
              "Rice Quantity Produced cannot be greater than Total Paddy (Kgs)",
          }));
          return;
        }

        if (riceTypeMulti?.value > 0 && riceQtyMulti > 0) {
          setErrors({
            riceType: "",
            riceQtyProduced: "",
          });
          
          setFormData((prevData: any) => ({
            ...prevData,
            riceType: [...prevData.riceType, Number(riceTypeMulti?.value)],
            riceQtyProduced: [
              ...prevData.riceQtyProduced,
              Number(riceQtyMulti),
            ]
          }));

          const newYarnData = {
            riceType: Number(riceTypeMulti?.value),
            riceProduced: Number(riceQtyMulti),
          };

          setYarnData((prevYarnData: any) => [...prevYarnData, newYarnData]);

          setRiceTypeMulti(null);
          setRiceQtyMulti("");
        }
      }
    } else {
      setErrors((prevData: any) => ({
        ...prevData,
        riceType: "Select Rice Type and Rice quantity produced",
      }));
    }
  };

  const removeYarn = (index: any) => {
    let yCount = formData.riceType;
    let yQty = formData.riceQtyProduced;

    let arr1 = yCount.filter((element: any, i: number) => index !== i);
    let arr2 = yQty.filter((element: any, i: number) => index !== i);

    const updatedYarnData = [...yarnData];
    updatedYarnData.splice(index, 1);

    setYarnData(updatedYarnData);
    // if (updatedYarnData.length === 0) {
    //   setFormData((prevData: any) => ({
    //     ...prevData,
    //     yarnRealisation: "",
    //   }));
    // }

    sessionStorage.setItem("millLint", JSON.stringify(formData));

    setFormData((prevData: any) => ({
      ...prevData,
      riceType: arr1,
      riceQtyProduced: arr2,
      riceRealisation: 0,
      netRiceQty: null,
    }));
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
                <NavLink href="/mill/dashboard" className="active">
                  <span className="icon-home"></span>
                </NavLink>
              </li>
              <li>
                <NavLink href="/mill/mill-process">Process</NavLink>
              </li>
              <li>New Process</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-md mt-4 p-4">
          <div className="w-100">
            {dataLength > 0 && (
              <div className="flex justify-left mb-4">
                <button
                  name="mill"
                  type="button"
                  onClick={() =>
                    router.push(
                      "/mill/quality-parameter/upload-test-mill"
                    )
                  }
                  className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                >
                  Upload Test Report
                </button>
              </div>
            )}

            <div className="row">
              <div className="borderFix pt-2 pb-2">
                <div className="row">
                  <div className="col-12 col-sm-6  my-2">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={from}
                      dateFormat={"dd-MM-yyyy"}
                      onChange={handleFrom}
                      showYearDropdown
                      maxDate={new Date()}
                      placeholderText={translations.common?.from + "*"}
                      className="w-100 shadow-none h-11 rounded-md my-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                  </div>

                  <div className="col-12 col-sm-6 my-2">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Season <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="seasonId"
                      value={
                        formData.seasonId
                          ? {
                            label: season?.find(
                              (seasonId: any) =>
                                seasonId.id === formData.seasonId
                            )?.name,
                            value: formData.seasonId,
                          }
                          : null
                      }
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select Season"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={(season || []).map(({ id, name }: any) => ({
                        label: name,
                        value: id,
                        key: id,
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
                </div>
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
                  <div className="text-sm text-red-500">{errors.programId}</div>
                )}
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Order Reference No
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  onBlur={(e) => onBlur(e, "bill")}
                  name="orderReference"
                  placeholder="Order Reference No"
                  value={formData.orderReference || ""}
                  onChange={(e) => handleChange("orderReference", e.target.value)}
                />
                {errors?.orderReference !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.orderReference}
                  </div>
                )}
              </div>

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Choose Paddy<span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <button
                    name="choosePaddy"
                    type="button"
                    onClick={choosePaddyButton}
                    className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                  >
                    Choose Paddy
                  </button>
                  <p className="text-sm flex items-center px-3">
                    {choosePaddy && choosePaddy?.totalQuantityUsed || 0} Kgs chosen
                  </p>
                </div>
                {errors?.choosePaddyReq !== "" && (
                  <div className="text-sm text-red-500">
                    {errors.choosePaddyReq}
                  </div>
                )}
              </div>

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Total Paddy (Kgs)
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  name="totalQty"
                  placeholder="Quantity"
                  value={choosePaddy && choosePaddy?.totalQuantityUsed || ""}
                  onChange={handleChange}
                  disabled
                />
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Godown No
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  onBlur={(e) => onBlur(e, "bill")}
                  name="godownNo"
                  placeholder="Godown No"
                  value={formData.godownNo || ""}
                  onChange={(e) => handleChange("godownNo", e.target.value)}
                />
                {errors?.godownNo !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.godownNo}
                  </div>
                )}
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Stack No
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  onBlur={(e) => onBlur(e, "bill")}
                  name="stackNo"
                  placeholder="stack No"
                  value={formData.stackNo || ""}
                  onChange={(e) => handleChange("stackNo", e.target.value)}
                />
                {errors?.stackNo !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.stackNo}
                  </div>
                )}
              </div>

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                Rice Variety <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"                  
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  name="riceVarietyName"
                  placeholder="Rice Variety"
                  disabled
                  value={formData.riceVarietyName.join(",") || ""}
                />
              </div>

              <div className="col-12 col-sm-6 mt-4"></div>

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Rice Type <span className="text-red-500">*</span>
                </label>

                <Select
                  name="riceType"
                  value={riceTypeMulti}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select rice Type"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  options={
                    (riceType || []).map(({ id, riceType_name }: any) => ({
                      label: riceType_name,
                      value: id,
                    })) as unknown as readonly (string | GroupBase<string>)[]
                  }
                  onChange={(item: any) => setRiceTypeMulti(item)}
                />

                {errors?.riceType !== "" && (
                  <div className="text-sm text-red-500">{errors.riceType}</div>
                )}
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <div className="row">
                  <div className="col-12 col-sm-8">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Rice Quantity Produced(Kgs){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      // onBlur={(e) => onBlur(e, "numeric")}
                      name="riceQtyProduced"
                      placeholder="Quantity"
                      value={riceQtyMulti || ""}
                      onChange={(e: any) => setRiceQtyMulti(e.target.value)}
                    />
                    {errors?.riceQtyProduced !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {errors?.riceQtyProduced}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-4 mt-4 flex items-center">
                    <button
                      name="multiYarn"
                      type="button"
                      onClick={addMultiYarn}
                      className="bg-[#d15e9c] text-sm rounded text-white px-2  h-11 w-16"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {formData?.riceType?.length > 0 && (
                <div className="mt-4 border">
                  {formData?.riceType?.length > 0 &&
                    formData?.riceType?.map((item: any, index: number) => {
                      return (
                        <div className="row py-2" key={index}>
                          <div className="col-12 col-sm-6 ">
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="text"
                              value={
                                (riceType &&
                                  riceType?.find(
                                    (yarn: any) => yarn.id === item
                                  )?.riceType_name) ||
                                ""
                              }
                              onChange={handleChange}
                              disabled
                            />
                          </div>
                          <div className="col-12 col-sm-3">
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="text"
                              value={formData?.riceQtyProduced[index] || ""}
                              onChange={handleChange}
                              disabled
                            />
                          </div>
                          <div className="col-12 col-sm-3 mt-2">
                            <button
                              name="multiYarn"
                              type="button"
                              onClick={() => removeYarn(index)}
                              className="bg-red-500 text-sm rounded text-white px-2 py-1"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Rice Recovery (%) <span className="text-red-500">*</span>
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  name="riceRealisation"
                  placeholder="Rice Realisation"
                  value={formData.riceRealisation || ""}
                  disabled
                />
                {errors?.riceRealisation !== "" && (
                  <div className="text-sm text-red-500">
                    {errors.riceRealisation}
                  </div>
                )}
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Net Rice Quantity (Kgs)
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  name="netRiceQty"
                  placeholder="Net Rice Qty"
                  disabled
                  value={formData.netRiceQty || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-sm-6  mt-4 ">
                <label className="text-gray-500 text-[12px] font-medium">
                  Husks (Kgs)
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  name="husks"
                  placeholder="Husks"
                  value={formData?.husks?.toFixed(2) || ""}
                  disabled
                />
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  No of Bags <span className="text-red-500">*</span>
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  onBlur={(e) => onBlur(e, "bill")}
                  name="noOfBag"
                  placeholder="No Of Bags"
                  disabled
                  value={formData.noOfBag || ""}
                  onChange={(e) => handleChange("noOfBag", e.target.value)}
                />
                {errors?.noOfBag !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.noOfBag}
                  </div>
                )}
              </div>


              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Batch/Lot No <span className="text-red-500">*</span>
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  onBlur={(e) => onBlur(e, "bill")}
                  name="batchLotNo"
                  placeholder="Batch Lot No"
                  value={formData.batchLotNo || ""}
                  onChange={(e) => handleChange("batchLotNo", e.target.value)}
                />
                {errors?.batchLotNo !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.batchLotNo}
                  </div>
                )}
              </div>

              {/* <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Bag Id's
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  onBlur={(e) => onBlur(e, "bill")}
                  name="bagId"
                  placeholder="Bag Id"
                  value={formData.bagId || ""}
                  onChange={(e) => handleChange("bagId", e.target.value)}
                />
           
              </div> */}

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Other Information
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  onBlur={(e) => onBlur(e, "bill")}
                  name="otherInformation"
                  placeholder="other Information"
                  value={formData.otherInformation || ""}
                  onChange={(e) => handleChange("otherInformation", e.target.value)}
                />
            
              </div>



              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Rice Quality Document
                </label>
                <div className="inputFile">
                  <label>
                    Choose File <GrAttachment />
                    <input
                      name="riceQualityDocument"
                      type="file"
                      accept=".doc, .docx, .pdf"
                      onChange={(e) =>
                        dataUpload(
                          "riceQualityDocument",
                          e?.target?.files?.[0]
                        )
                      }
                    />
                  </label>
                </div>
                <p className="py-2 text-sm">
                  (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                </p>
                {fileName.riceQualityDocument && (
                  <div className="flex text-sm mt-1">
                    <GrAttachment />
                    <p className="mx-1">{fileName.riceQualityDocument}</p>
                  </div>
                )}
                {errors?.riceQualityDocument !== "" && (
                  <div className="text-sm text-red-500">
                    {errors.riceQualityDocument}
                  </div>
                )}
              </div>


              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Do you want to Complete the Process{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name={`processComplete`}
                        value="yes"
                        checked={formData.processComplete === true}
                        onChange={(e) =>
                          handleChange("processComplete", e.target.value)
                        }
                      />
                      <span></span>
                    </section>{" "}
                    Yes
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name={`processComplete`}
                        value="no"
                        checked={formData.processComplete === false}
                        onChange={(e) =>
                          handleChange("processComplete", e.target.value)
                        }
                      />
                      <span></span>
                    </section>{" "}
                    No
                  </label>
                </div>
                {errors?.processComplete !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.processComplete}
                  </div>
                )}
              </div>
              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Other Process Required?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name={`otherRequired`}
                        value="yes"
                        checked={formData.otherRequired === true}
                        onChange={(e) =>
                          handleChange("otherRequired", e.target.value)
                        }
                      />
                      <span></span>
                    </section>{" "}
                    Yes
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name={`otherRequired`}
                        value="no"
                        checked={formData.otherRequired === false}
                        onChange={(e) =>
                          handleChange("otherRequired", e.target.value)
                        }
                      />
                      <span></span>
                    </section>{" "}
                    No
                  </label>
                </div>
                {errors?.otherRequired !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.otherRequired}
                  </div>
                )}
              </div>
            </div>

            {formData.otherRequired === true && (
              <>
                  <div className="row">
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                      Other processes{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        onBlur={(e) => onBlur(e, "bill")}
                        name="otherProcess"
                        placeholder="Other processes"
                        value={formData.otherProcess || ""}
                        onChange={(e) =>
                          handleChange("otherProcess", e.target.value)
                        }
                      />
                      {errors.otherProcess && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.otherProcess}
                        </p>
                      )}
                    </div>
                  </div>
              </>
            )}
            {/* {formData.dyeingRequired === true && (
              <>
                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">
                    Other Process:
                  </h4>
                  <div className="row">
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Name of The Processor{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        onBlur={(e) => onBlur(e, "alphabets")}
                        name="processorName"
                        placeholder="Processor Name"
                        value={formData.processorName || ""}
                        onChange={(e) =>
                          handleChange("processorName", e.target.value)
                        }
                      />
                      {errors.processorName && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.processorName}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Address <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        onBlur={(e) => onBlur(e, "bill")}
                        name="dyeingAddress"
                        placeholder="Address"
                        value={formData.dyeingAddress || ""}
                        onChange={(e) =>
                          handleChange("dyeingAddress", e.target.value)
                        }
                      />
                      {errors.dyeingAddress && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.dyeingAddress}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Name Process <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        onBlur={(e) => onBlur(e, "alphabets")}
                        name="processName"
                        placeholder="Process Name"
                        value={formData.processName || ""}
                        onChange={(e) =>
                          handleChange("processName", e.target.value)
                        }
                      />
                      {errors.processName && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.processName}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Qty of Yarn Delivered
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="yarnDelivered"
                        value={formData.yarnDelivered + " Kgs" || "0.00 Kgs"}
                        onChange={(e) =>
                          handleChange("yarnDelivered", e.target.value)
                        }
                        type="text"
                        disabled
                      />
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Process Loss (%) If Any?{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        onBlur={(e) => onBlur(e, "percentage")}
                        name="processLoss"
                        placeholder="Process Loss (%) If Any?"
                        value={formData.processLoss || ""}
                        onChange={(e) =>
                          handleChange("processLoss", e.target.value)
                        }
                      />
                      {errors.processLoss && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.processLoss}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Net Yarn Qty
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="processNetYarnQty"
                        disabled
                        value={
                          formData.processNetYarnQty + " Kgs" || "0.00 Kgs"
                        }
                        onChange={(e) =>
                          handleChange("processNetYarnQty", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )} */}


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
              season={season}
              onClick={handleSubmit}
              //
              data1_label={"Date : "}
              data1={moment(formData?.date).format("DD-MM-yyyy")}
              data2_label={"Season : "}
              data2={
                formData?.seasonId
                  ? season?.find(
                    (seasonId: any) => seasonId.id === formData.seasonId
                  )?.name
                  : null
              }
              data3_label={"Order Reference : "}
              data3={formData?.orderReference}
              data4_label={"Total Paddy (Kgs) : "}
              data4={formData?.totalQty}
              data5_label={"Godown No : "}
              data5={formData?.godownNo}
              data6_label={"Stack No : "}
              data6={formData?.stackNo}
              data7_label={"Rice Variety : "}
              data7={formData?.riceVariety ? riceVariety?.find(
                (variety: any) => variety.id === formData.riceVariety
              )?.variety_name
              : null}
              data8_label={"Husks :"}
              data8={formData?.husks}
              data9_label={"Rice Recovery :"}
              data9={formData?.riceRealisation}
              data10_label={"Net Rice Quantity : "}
              data10_data={formData?.netRiceQty}
              data11_label={"No of Bags : "}
              data11_data={formData?.noOfBag}
              data12_label={"Batch/Lot No : "}
              data12_data={formData?.batchLotNo}
              // data13_label={"Bag Id's : "}
              // data13_data={formData?.bagId}
              data14_label={"Other Information : "}
              data14_data={formData?.otherInformation}
              data7_txt_label={
                "Do you want to complete the process : "
              }
              data7_txt={formData?.processComplete ? "Yes" : "No"}
              data8_txt_label={
                "Other Process Required : "
              }
              data8_txt={formData?.otherRequired ? "Yes" : "No"}
              
              data15_label={"Other processes : "}
              data15_data={formData?.otherProcess}
             
              data1_file_OR_txt_label={"Rice Quality Document : "}
              data1_single_file={
                formData?.riceQualityDocument ? [formData?.riceQualityDocument] : null
              }
              // table 3
              table_2_show={true}
              table2_title={""}
              table2_option1_label={"Rice Type"} // => first colunm
              table2_option1_match_id={formData.riceType}
              table2_option1_full_list={riceType}
              table2_option1_dynamic_filed_name={"riceType_name"}
              table2_option2_label={"RIce Quantity Produced(Kgs)"} // => second colunm
              table2_option2_show_arr_values={formData?.riceQtyProduced}
            />
          </div>
          {isLoading ? <ModalLoader /> : null}
        </div>
      </div>
    );
  }
}
