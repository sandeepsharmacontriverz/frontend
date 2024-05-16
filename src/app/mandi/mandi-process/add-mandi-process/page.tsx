"use client";

import React, { useState, useEffect, useRef } from "react";
import useTranslations from "@hooks/useTranslation";
import { FaDownload } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import * as XLSX from "xlsx";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  toasterError,
  toasterInfo,
  toasterSuccess,
} from "@components/core/Toaster";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import Select from "react-select";
import { PreView } from "@components/preview/PreView";
import moment from "moment";
import { FaPlus, FaMinus } from "react-icons/fa";
import ModalLoader from "@components/core/ModalLoader";

const initialWeightAndBaleNumber = {
  weight: "",
  baleNumber: "",
  originalSampleStatus: "",
};


const riceQuality :any= [];

for (let i = 1; i <= 14; i++) {
  riceQuality.push({
    id: i,
    riceQuality: 'Q' + i
  });
}


export default function page() {
  useTitle("New Process");

  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const { translations, loading } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [Access, setAccess] = useState<any>({});

  const MandiId = User.MandiId;

  const [jsonStructure, setJsonStructure] = useState<any>(null);
  const [selectedProgram, setSelectedProgram] = useState("");

  const [ginnerData, setGinnerData] = useState<any>({});
  const [season, setSeason] = useState<any>();
  const [program, setProgram] = useState<any>();
  const [physicalTraceabilityPartners, setPhysicalTraceabilityPartners] =
    useState<Array<any>>([]);
  const [from, setFrom] = useState<Date | null>(new Date());
  const [chooseCottonData, setChoosecottonData] = useState<any>([]);
  const [errors, setErrors] = useState<any>({});
  const [weightAndBaleNumberErrors, setWeightAndBaleNumberErrors] = useState<
    Array<any>
  >([JSON.parse(JSON.stringify(initialWeightAndBaleNumber))]);
  const [isSelected, setIsSelected] = useState<any>(true);
  const [showPreview, setShowPreview] = useState<any>(false);

  const [isLoading, setIsLoading] = useState<any>(false);
  const [dataLength, setDataLength] = useState(0);

  const [formData, setFormData] = useState<any>({
    programId: "",
    seasonId: "",
    date: new Date(),
    totalQty: null,
    noOfBags: null,
    mot: null,
    lotNo: "",
    heapNumber: "",
    heapRegister: null,
    weighBridge: null,
    deliveryChallan: null,
    bagProcess: null,
    reelLotNno: "",
    pressNo: "",
    riceQuality: "",
    enterPhysicalTraceability: "",
    endDateOfDNAMarkerApplication: "",
    dateSampleCollection: "",
    weightAndBaleNumber: [
      JSON.parse(JSON.stringify(initialWeightAndBaleNumber)),
    ],
    dataOfSampleDispatch: "",
    operatorName: "",
    cottonConnectExecutiveName: "",
    expectedDateOfLintSale: "",
    physicalTraceabilityPartnerId: "",
  });

  const [fileName, setFileName] = useState({
    upload: "",
    heapRegister: "",
    weighBridge: "",
    deliveryChallan: "",
    bagProcess: "",
  });

  const [ginOutRange, setGinOutRange] = useState<any>({
    from: "",
    to: "",
  });

  const requiredFields = [
    "seasonId",
    "date",
    "lotNo",
    "riceQuality",
    "mot",
    "upload",
    "heapNumber",
    "heapRegister",
    "weighBridge",
    "deliveryChallan",
    "bagProcess",
    "endDateOfDNAMarkerApplication",
    "dateSampleCollection",
    "weightAndBaleNumber.weight",
    "weightAndBaleNumber.baleNumber",
    "weightAndBaleNumber.originalSampleStatus",
    "dataOfSampleDispatch",
    "operatorName",
    "cottonConnectExecutiveName",
    "expectedDateOfLintSale",
    "physicalTraceabilityPartnerId",
  ];

  useEffect(() => {
    if (MandiId) {
      fetchProcessesLength();
      getGinnerData();
      getSeason();
      getProgram();

      setPhysicalTraceabilityPartners([]);
    }
  }, [MandiId]);

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Mandi")) {
      const access = checkAccess("Mandi Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (MandiId) {
      const savedData: any = sessionStorage.getItem("ginnerProcess");
      const totalQuantity: any = sessionStorage.getItem("ginnerCotton");
      const processData = JSON.parse(savedData);
      const cottonData = JSON.parse(totalQuantity);
      if (processData) {
        setFormData(processData);
      }
      setFormData((prev: any) => ({
        ...prev,
        totalQty: !cottonData ? "" : Number(cottonData[0]?.total_qty_used),
      }));

      setChoosecottonData(cottonData);
    }
  }, [MandiId]);

  useEffect(() => {
    if (jsonStructure && formData.totalQty) {
      const baleWeight = jsonStructure?.map((bale: any) => {
        return bale.weight;
      });
      const sum = baleWeight?.reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      );

      const hasZeroInBaleWeight = jsonStructure?.some((bale: any) => {
        const weight = bale.weight;
        return weight == 0;
      });

      if (hasZeroInBaleWeight) {
        setErrors((prev: any) => ({
          ...prev,
          mot: "",
          upload: "bale weight cannot be 0, please upload again.",
        }));
        setJsonStructure(null);
        setFileName((prevFile: any) => ({
          ...prevFile,
          upload: "",
        }));

        setFormData((prev: any) => ({
          ...prev,
          mot: null,
          noOfBags: null,
        }));
        return;
      }

      const notValid = isNaN(sum);
      if (notValid) {
        setErrors((prev: any) => ({
          ...prev,
          mot: "",
          upload: "Some fields are missing; please upload complete Excel",
        }));

        setJsonStructure(null);
        setFileName((prevFile: any) => ({
          ...prevFile,
          upload: "",
        }));

        setFormData((prev: any) => ({
          ...prev,
          mot: null,
          noOfBags: null,
        }));
        return;
      } else {
        gotPercentage();
        setFormData((prev: any) => ({
          ...prev,
          noOfBags: jsonStructure?.length,
        }));
      }
    }
  }, [jsonStructure, formData.totalQty]);

  useEffect(() => {
    if (formData.programId) {
      const foundProgram = program?.find(
        (program: any) => program.id == formData.programId
      );
      if (foundProgram && foundProgram.program_name?.toLowerCase() === "reel") {
        getReelLotNumber();
        setSelectedProgram("REEL");
      } else {
        setSelectedProgram("");
        setFormData((prev: any) => ({
          ...prev,
          reelLotNno: "",
        }));
      }
    }
  }, [program, formData.programId]);

  useEffect(() => {
    if (formData.totalQty) {
      setIsSelected(false);
    }
  }, [formData.totalQty]);

  // useEffect(() => {
  //   if (ginnerData.brand) {
  //     getPhysicalTraceabilityPartners();
  //   }
  // }, [ginnerData.brand]);

  const fetchProcessesLength = async () => {
    try {
      const res = await API.get(`mandi-process?mandiId=${MandiId}`);
      if (res.success) {
        setDataLength(res.data?.length);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getGinnerData = async () => {
    const url = `mandi/get-mandi?id=${MandiId}`;
    try {
      const response = await API.get(url);
      setGinnerData(response.data);
      setGinOutRange({
        from: response.data?.outturn_range_from,
        to: response.data?.outturn_range_to,
      });
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getReelLotNumber = async () => {
    const foundProgram = program?.find(
      (program: any) => program.id == formData.programId
    );

    if (foundProgram && foundProgram?.program_name?.toLowerCase() === 'reel') {
      
      try {
        const res = await API.get(
          `mandi-process/reel?mandiId=${MandiId}&programId=${formData.programId}`
        );
        if (res.success) {
          setFormData((prev: any) => ({
            ...prev,
            reelLotNno: res.data?.id,
          }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getSeason = async () => {
    try {
      const res = await API.get(`season?status=true`);
      if (res.success) {
        setSeason(res?.data?.slice(-3));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProgram = async () => {
    try {
      const res = await API.get(
        `mandi-process/get-program?mandiId=${MandiId}`
      );
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const getPhysicalTraceabilityPartners = async () => {
  //   try {
  //     const res = await API.get(
  //       `physical-partner?brandId=${ginnerData?.brand?.join(",") || ""}`
  //     );
  //     if (res.success) {
  //       setPhysicalTraceabilityPartners(res.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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

  const validateHeaders = (excelHeaders: any, expectedKeys: any) => {
    return excelHeaders.every((header: any) => expectedKeys.includes(header));
  };

  const excelToJson = async (event: any) => {
    const file = event.target.files[0];

    const expectedHeaders = ["Bag No", "Weight", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"];

    const allowedFormats = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/vnd.ms-excel",
    ];

    if (file) {

      if (!allowedFormats.includes(file?.type)) {
        setJsonStructure(null);
        setFileName((prevFile: any) => ({
          ...prevFile,
          [event.target.name]: "",
        }));
        setErrors((prevError: any) => ({
          ...prevError,
          [event.target.name]: "Invalid file format.",
        }));

        event.target.value = "";
        return;
      }

      const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any = XLSX.utils.sheet_to_json(sheet, {
        range: 1,
      });

      const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

      if (headers.length === 0 || !validateHeaders(headers, expectedHeaders)) {
        setJsonStructure(null);
        setFileName((prevFile: any) => ({
          ...prevFile,
          [event.target.name]: "",
        }));
        setFormData((prev: any) => ({
          ...prev,
          mot: null,
          noOfBags: null,
        }));
        setErrors((prevError: any) => ({
          ...prevError,
          upload: "Invalid or empty file",
        }));
        event.target.value = "";
        return;
      } else {
        const convertedData = jsonData.map((item: any) => ({
          bagNo: item["Bag No"],
          weight: Number(item["Weight"]),
          Q1: Number(item["Q1"]),
          Q2: Number(item["Q2"]),
          Q3: Number(item["Q3"]),
          Q4: Number(item["Q4"]),
          Q5: Number(item["Q5"]),
          Q6: Number(item["Q6"]),
          Q7: Number(item["Q7"]),

        }));

        const bags: any = convertedData.map((data: any) => {
          return Number(data.bagNo);
        });


        const pressNo = Math.min(...bags) + "-" + Math.max(...bags);
        setFormData((prev: any) => ({
          ...prev,
          pressNo: pressNo,
        }));

        setJsonStructure(convertedData);
        setFileName((prevFile: any) => ({
          ...prevFile,
          [event.target.name]: event.target.files[0].name,
        }));

        setErrors((prev: any) => ({
          ...prev,
          upload: "",
        }));
      }
    }
  };

  const dataUpload = async (e: any, name: any) => {
    const url = "file/upload";
    const allowedFormats = ["image/jpeg", "image/jpg", "image/png"];

    const dataVideo = new FormData();
    if (!e) {
      return setErrors((prevError: any) => ({
        ...prevError,
        [name]: "No File Selected",
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
          [name]: "",
        }));
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const gotPercentage: any = () => {
    if (jsonStructure && formData.totalQty) {
      const baleWeight = jsonStructure?.map((bale: any) => {
        return bale.weight;
      });
      const sum = baleWeight?.reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      );

      const finalVal = (sum / Number(formData?.totalQty)) * 100;

      if (
        finalVal < Number(90) ||
        finalVal > Number(100)
      ) {
        setErrors((prev: any) => ({
          ...prev,
          mot: `MOT out of range. MOT should be between 90% to 100%`,
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          mot: "",
        }));
        setFormData((prev: any) => ({
          ...prev,
          mot: finalVal.toFixed(2),
        }));
      }
      toasterInfo(`Mandi Out Turn is ${finalVal.toFixed(2)}%`, 3000, 1);
    }
  };

  const chooseCotton = () => {
    if (formData.programId) {
      sessionStorage.setItem("ginnerProcess", JSON.stringify(formData));
      router.push(
        `/mandi/mandi-process/choose-paddy?id=${formData.programId}`
      );
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to choose Paddy",
      }));
    }
  };

  const handleAddMoreWeightAndBaleNumber = () => {
    setFormData((prev: any) => ({
      ...prev,
      weightAndBaleNumber: [
        ...prev.weightAndBaleNumber,
        JSON.parse(JSON.stringify(initialWeightAndBaleNumber)),
      ],
    }));
    setWeightAndBaleNumberErrors((prev: any) => [
      ...prev,
      JSON.parse(JSON.stringify(initialWeightAndBaleNumber)),
    ]);
  };

  const handleDeleteWeightAndBaleNumber = (index: number) => {
    const tempWeightAndBaleNumber = [...formData.weightAndBaleNumber];
    tempWeightAndBaleNumber.splice(index, 1);
    setFormData((prev: any) => ({
      ...prev,
      weightAndBaleNumber: tempWeightAndBaleNumber,
    }));

    const tempWeightAndBaleNumberErrors = [...weightAndBaleNumberErrors];
    tempWeightAndBaleNumberErrors.splice(index, 1);
    setWeightAndBaleNumberErrors(tempWeightAndBaleNumberErrors);
  };

  const handleChange = (name?: any, value?: any, event?: any) => {
    if (
      name === "heapRegister" ||
      name === "weighBridge" ||
      name === "deliveryChallan" ||
      name === "bagProcess"
    ) {
      dataUpload(value, name);
      return;
    } else if (name === "programId" || name === "seasonId") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: Number(value),
      }));
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setErrors((prevErrors: any) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleWeightAndBaleNumberChange = (
    key: string,
    value: any,
    index: number
  ) => {
    const tempWeightAndBaleNumber = [...formData.weightAndBaleNumber];
    tempWeightAndBaleNumber[index][key] = value;
    setFormData((prev: any) => ({
      ...prev,
      weightAndBaleNumber: tempWeightAndBaleNumber,
    }));

    const tempWeightAndBaleNumberErrors = [...weightAndBaleNumberErrors];
    tempWeightAndBaleNumberErrors[index][key] = "";
    setWeightAndBaleNumberErrors(tempWeightAndBaleNumberErrors);
  };

  const onBlur = (e: any) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;

    const valid = regexAlphaNumeric.test(value);
    if (!valid) {
      setErrors((prev: any) => ({
        ...prev,
        [name]:
          "Accepts only AlphaNumeric values and special characters like _,-,()",
      }));
    } else {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const onCancel = () => {
    router.push("/mandi/mandi-process");
    sessionStorage.removeItem("ginnerProcess");
    sessionStorage.removeItem("ginnerCotton");
  };

  const validateField = (name: string, value: any, dataName: string) => {
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const valid = regexAlphaNumeric.test(formData.lotNo);

    if (dataName === "errors") {
      if (requiredFields.includes(name)) {
        switch (name) {
          case "date":
            return value.length === 0 ? "Date is required" : "";
          case "seasonId":
            return value?.length === 0 || value === null || value === undefined
              ? "Season is required"
              : "";
          case "riceQuality":
            return value?.length === 0 || value === null || value === undefined
              ? "Rice Quality is required"
              : "";
          case "mot":
            return errors.mot != "" ? errors.mot : "";
          case "lotNo":
            return value === "" || value === null || value === undefined
              ? "Lot No is required"
              : !valid
                ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                : "";
          case "upload":
            return errors.upload !== "" ? errors.upload : "";
          case "heapNumber":
            return value === "" || value === null || value === undefined
              ? "Heap Number is required"
              : !valid
                ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                : "";
          case "heapRegister":
            return value === null
              ? "Heap Register is required"
              : errors.heapRegister != ""
                ? errors.heapRegister != ""
                : "";
          case "weighBridge":
            return value === null
              ? "Weigh Bridge is required"
              : errors.weighBridge != ""
                ? errors.weighBridge != ""
                : "";
          case "deliveryChallan":
            return value === null
              ? "Delivery Challan is required"
              : errors.deliveryChallan != ""
                ? errors.deliveryChallan != ""
                : "";
          case "bagProcess":
            return value === null
              ? "Paddy Process is required"
              : errors.bagProcess != ""
                ? errors.bagProcess != ""
                : "";

          case "endDateOfDNAMarkerApplication":
            return formData.enterPhysicalTraceability && !value
              ? "End date of DNA marker application is required"
              : "";
          case "dateSampleCollection":
            return formData.enterPhysicalTraceability && !value
              ? "Date of sample collection is required"
              : "";
          case "weightAndBaleNumber.weight":
            return formData.enterPhysicalTraceability && !value
              ? "Weight is required"
              : "";
          case "weightAndBaleNumber.baleNumber":
            return formData.enterPhysicalTraceability && !value
              ? "Bale Number is required"
              : "";
          case "weightAndBaleNumber.originalSampleStatus":
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
          case "cottonConnectExecutiveName":
            return formData.enterPhysicalTraceability &&
              (!value || value.trim() === "")
              ? "RiceTraceability Executive name is required"
              : "";
          case "expectedDateOfLintSale":
            return formData.enterPhysicalTraceability && !value
              ? "Expected date of lint sale is required"
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
  console.log(formData, "form");
  const handleErrors = async (event: any) => {
    event.preventDefault();

    const newErrors: any = {};
    const newWeightAndBaleNumberErrors: any = [];

    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "errors"
      );
    });

    if (formData.enterPhysicalTraceability) {
      formData.weightAndBaleNumber.map(
        (weightAndBaleNumber: any, index: number) => {
          const weightAndBaleNumberErrors: any = {};
          Object.keys(weightAndBaleNumber).forEach((fieldName: string) => {
            const fieldError = validateField(
              `weightAndBaleNumber.${fieldName}`,
              weightAndBaleNumber[fieldName as keyof any],
              "errors"
            );
            weightAndBaleNumberErrors[fieldName] = fieldError || "";
          });
          newWeightAndBaleNumberErrors[index] = weightAndBaleNumberErrors;
        }
      );
    }

    const hasErrors = Object.values(newErrors).some((error) => !!error);
    if (hasErrors) {
      setErrors(newErrors);
    }

    const hasWeightAndBaleNumberErrors = newWeightAndBaleNumberErrors.some(
      (errors: any) => Object.values(errors).some((error) => error)
    );
    if (hasWeightAndBaleNumberErrors) {
      setWeightAndBaleNumberErrors(newWeightAndBaleNumberErrors);
    }

    if (!jsonStructure) {
      setErrors((prev: any) => ({
        ...prev,
        upload: "Csv/Excel is required",
      }));
    }
    if (!hasErrors && jsonStructure) {
      setShowPreview(!showPreview);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const newErrors: any = {};
    const newWeightAndBaleNumberErrors: any = [];

    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "errors"
      );
    });

    if (formData.enterPhysicalTraceability) {
      formData.weightAndBaleNumber.map(
        (weightAndBaleNumber: any, index: number) => {
          const weightAndBaleNumberErrors: any = {};
          Object.keys(weightAndBaleNumber).forEach((fieldName: string) => {
            const fieldError = validateField(
              `weightAndBaleNumber.${fieldName}`,
              weightAndBaleNumber[fieldName as keyof any],
              "errors"
            );
            weightAndBaleNumberErrors[fieldName] = fieldError || "";
          });
          newWeightAndBaleNumberErrors[index] = weightAndBaleNumberErrors;
        }
      );
    }

    const hasErrors = Object.values(newErrors).some((error) => !!error);
    if (hasErrors) {
      setShowPreview(!showPreview);
      setErrors(newErrors);
    }

    const hasWeightAndBaleNumberErrors = newWeightAndBaleNumberErrors.some(
      (errors: any) => Object.values(errors).some((error) => error)
    );
    if (hasWeightAndBaleNumberErrors) {
      setWeightAndBaleNumberErrors(newWeightAndBaleNumberErrors);
    }

    if (!jsonStructure) {
      setErrors((prev: any) => ({
        ...prev,
        upload: "Csv/Excel is required",
      }));
    }

    if (!hasErrors && !hasWeightAndBaleNumberErrors && jsonStructure) {
      setIsSelected(true);
      setIsLoading(true);

      try {
        const response = await API.post("mandi-process", {
          ...formData,
          mot:
            formData.mot !== null && formData.mot !== ""
              ? parseFloat(formData.mot)
              : null,
          mandiId:MandiId,
          bags: jsonStructure,
          choosePaddy: chooseCottonData,
          brandId: ginnerData.brand[0],
          ginnerShortname: ginnerData.short_name,
        });

        if (response.success) {
          toasterSuccess("Process Successfully Created");
          router.push("/mandi/mandi-process");
          sessionStorage.removeItem("ginnerProcess");
          sessionStorage.removeItem("ginnerCotton");
        } else {
          setIsSelected(false);
          setIsLoading(false);
          toasterError(response.error.code, 3000, formData?.MandiId);
        }
      } catch (error) {
        setIsSelected(false);
        setIsLoading(false);
      }
    } else {
      return;
    }
  };

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access.create) {
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
                  <NavLink href="/mandi/dashboard" className="active">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/mandi/mandi-process">Process</NavLink>
                </li>
                <li>New Process</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-md p-4">
            <div className="w-100 mt-4">
              <div className="customFormSet">
                <div className="row">
                  <div className="col-lg-8 col-md-10 col-sm-12">
                    <div className="row">
                      <p className="col-lg-5 col-md-8 col-sm-12 mb-2 text-sm">
                        Download valid excel format to use in upload:
                      </p>

                      <div className="col-lg-6 col-md-8 col-sm-12 mb-2">
                        <div className="row">
                          <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                            <button
                              name="Mandi"
                              onClick={() =>
                                handleDownload(
                                  "/files/mandi_csv_format.xlsx",
                                  "Mandi",
                                  "xlsx"
                                )
                              }
                              className="btn-purple flex p-2"
                            >
                              <FaDownload className="mr-2" />
                              Download
                            </button>
                          </div>
                          {dataLength > 0 && (
                            <div className="col-lg-6 col-md-6 col-sm-12 ">
                              <button
                                name="ginnmandier"
                                type="button"
                                onClick={() =>
                                  router.push(
                                    "/mandi/quality-parameter/upload-test-mandi"
                                  )
                                }
                                className="bg-orange-400 flex rounded-lg text-white font-semibold p-2"
                              >
                                Upload Test Report
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-100">
                  <div className="row">
                    <div className="borderFix pt-2 pb-2">
                      <div className="row">
                        <div className="col-12 col-sm-6  my-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <DatePicker
                            selected={from}
                            maxDate={new Date()}
                            dateFormat={"dd-MM-yyyy"}
                            onChange={handleFrom}
                            showYearDropdown
                            placeholderText={translations.common.from + "*"}
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
                            options={(season || []).map(
                              ({ id, name }: any) => ({
                                label: name,
                                value: id,
                                key: id,
                              })
                            )}
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

                    {!chooseCottonData && (
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
                                  onChange={() =>
                                    handleChange("programId", program.id)
                                  }
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
                    )}

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Choose Paddy <span className="text-red-500">*</span>
                      </label>
                      <button
                        name="chooseLint"
                        type="button"
                        onClick={chooseCotton}
                        className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                      >
                        Choose Paddy
                      </button>
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Quantity(Kg/MT)
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        disabled
                        name="totalQty"
                        value={formData.totalQty || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        No of Bags Produced
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        disabled
                        name="noOfBags"
                        value={formData.noOfBags || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Mandi Out Turn (MOT)
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        disabled
                        name="mot"
                        value={formData.mot || ""}
                        onChange={handleChange}
                      />
                      {errors?.mot !== "" && (
                        <div className="text-sm text-red-500">{errors.mot}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Lot No <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        placeholder="Lot No"
                        onBlur={onBlur}
                        name="lotNo"
                        value={formData.lotNo || ""}
                        onChange={(e) => handleChange("lotNo", e.target.value)}
                      />
                      {errors?.lotNo !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.lotNo}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Heap Number <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        placeholder="Heap Number"
                        onBlur={onBlur}
                        name="heapNumber"
                        value={formData.heapNumber || ""}
                        onChange={(e) =>
                          handleChange("heapNumber", e.target.value)
                        }
                      />
                      {errors?.heapNumber !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.heapNumber}
                        </div>
                      )}
                    </div>

                    {selectedProgram === "REEL" && (
                      <div className="col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          REEL Lot No
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="text"
                          disabled
                          name="reelLotNno"
                          value={formData.reelLotNno}
                          onChange={handleChange}
                        />
                      </div>
                    )}


                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Rice Quality <span className="text-red-500">*</span>
                      </label>
                      <Select
                        name="riceQuality"
                        value={
                          formData.riceQuality
                            ? {
                              label: riceQuality?.find(
                                (riceQuality: any) =>
                                  riceQuality.riceQuality == formData.riceQuality
                              )?.riceQuality,
                              value: formData.riceQuality,
                            }
                            : null
                        }
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select Rice Quality"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                        options={(riceQuality || []).map(
                          ({ id, riceQuality }: any) => ({
                            label: riceQuality,
                            value: riceQuality,
                            key: id,
                          })
                        )}
                        onChange={(item: any) => {
                          handleChange("riceQuality", item?.value);
                        }}
                      />
                      {errors?.riceQuality !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.riceQuality}
                        </div>
                      )}
                    </div>



                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload CSV/Excel <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile mt-1">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            ref={fileInputRef}
                            name="upload"
                            onChange={excelToJson}
                            onClick={(e: any) => {
                              e.target.value = null;
                            }}
                          />
                        </label>
                      </div>
                      {fileName.upload && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.upload}</p>
                        </div>
                      )}
                      {errors?.upload !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.upload}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Heap Register{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            type="file"
                            name="heapRegister"
                            accept="image/jpg, image/jpeg , image/png"
                            onChange={(e) =>
                              handleChange(
                                "heapRegister",
                                e?.target?.files?.[0]
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/png)
                      </p>
                      {fileName.heapRegister && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.heapRegister}</p>
                        </div>
                      )}
                      {errors?.heapRegister !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.heapRegister}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Weigh Bridge Receipt{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="weighBridge"
                            type="file"
                            accept="image/jpg, image/jpeg , image/png"
                            onChange={(e) =>
                              handleChange("weighBridge", e?.target?.files?.[0])
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/png)
                      </p>
                      {fileName.weighBridge && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.weighBridge}</p>
                        </div>
                      )}
                      {errors?.weighBridge !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.weighBridge}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Delivery Challan{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="deliveryChallan"
                            type="file"
                            accept="image/jpg, image/jpeg , image/png"
                            onChange={(e) =>
                              handleChange(
                                "deliveryChallan",
                                e?.target?.files?.[0]
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/png)
                      </p>
                      {fileName.deliveryChallan && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.deliveryChallan}</p>
                        </div>
                      )}
                      {errors?.deliveryChallan !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.deliveryChallan}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Paddy Process{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="bagProcess"
                            type="file"
                            accept="image/jpg, image/jpeg , image/png"
                            onChange={(e) =>
                              handleChange("bagProcess", e?.target?.files?.[0])
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/png)
                      </p>
                      {fileName.bagProcess && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.bagProcess}</p>
                        </div>
                      )}
                      {errors?.bagProcess !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.bagProcess}
                        </div>
                      )}
                    </div>

                    {/* <div className="borderFix pt-2 pb-3 mt-4">
                      <div className="row">
                        <div className="col-12 col-sm-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Do you want to enter Rice Testing details?
                            *
                          </label>
                          <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  type="radio"
                                  name="enterPhysicalTraceability"
                                  value="YES"
                                  checked={
                                    formData.enterPhysicalTraceability === true
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      "enterPhysicalTraceability",
                                      e.target.value === "YES"
                                    )
                                  }
                                />
                                <span></span>
                              </section>
                              Yes
                            </label>

                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  type="radio"
                                  name="enterPhysicalTraceability"
                                  value="NO"
                                  checked={
                                    formData.enterPhysicalTraceability === false
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      "enterPhysicalTraceability",
                                      e.target.value === "YES"
                                    )
                                  }
                                />
                                <span></span>
                              </section>
                              No
                            </label>
                          </div>
                        </div>
                      </div>

                      {formData.enterPhysicalTraceability && (
                        <div className="mt-4">
                          <h2 className="text-l font-semibold mt-3">
                            Rice Testing Process:
                          </h2>
                          <div className="row">
                            <div className="col-12 col-sm-6 mt-2">
                              <label className="text-gray-500 text-[12px] font-medium">
                                End date of DNA marker application *
                              </label>
                              <DatePicker
                                name="endDateOfDNAMarkerApplication"
                                selected={
                                  formData.endDateOfDNAMarkerApplication
                                    ? new Date(
                                      formData.endDateOfDNAMarkerApplication
                                    )
                                    : null
                                }
                                onChange={(date) =>
                                  handleChange(
                                    "endDateOfDNAMarkerApplication",
                                    date
                                  )
                                }
                                showYearDropdown
                                placeholderText="Select a date"
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              />
                              {errors.endDateOfDNAMarkerApplication !== "" && (
                                <div className="text-sm text-red-500 ">
                                  {errors.endDateOfDNAMarkerApplication}
                                </div>
                              )}
                            </div>

                            <div className="col-12 col-sm-6 mt-2">
                              <label className="text-gray-500 text-[12px] font-medium">
                                Date of sample collection *
                              </label>
                              <DatePicker
                                name="dateSampleCollection"
                                selected={
                                  formData.dateSampleCollection
                                    ? new Date(formData.dateSampleCollection)
                                    : null
                                }
                                onChange={(date) =>
                                  handleChange("dateSampleCollection", date)
                                }
                                showYearDropdown
                                placeholderText="Select a date"
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              />
                              {errors.dateSampleCollection !== "" && (
                                <div className="text-sm text-red-500 ">
                                  {errors.dateSampleCollection}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Weight and Bale Number *
                            </label>
                            {formData.weightAndBaleNumber.map(
                              (element: any, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <div className="flex-grow">
                                    <input
                                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                      placeholder="Enter weight"
                                      name="weight"
                                      value={element.weight || ""}
                                      onChange={(e) => {
                                        let value: string | number = parseFloat(
                                          e.target.value
                                        );
                                        value = isNaN(value) ? "" : value;
                                        handleWeightAndBaleNumberChange(
                                          e.target.name,
                                          value,
                                          i
                                        );
                                      }}
                                    />
                                    {weightAndBaleNumberErrors[i]?.weight && (
                                      <div className="text-sm text-red-500">
                                        {weightAndBaleNumberErrors[i]?.weight ||
                                          ""}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow">
                                    <input
                                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                      placeholder="Enter bale number"
                                      name="baleNumber"
                                      value={element.baleNumber || ""}
                                      onChange={(e) => {
                                        let value: string | number = parseFloat(
                                          e.target.value
                                        );
                                        value = isNaN(value) ? "" : value;
                                        handleWeightAndBaleNumberChange(
                                          e.target.name,
                                          value,
                                          i
                                        );
                                      }}
                                    />
                                    {weightAndBaleNumberErrors[i]
                                      ?.baleNumber && (
                                        <div className="text-sm text-red-500">
                                          {weightAndBaleNumberErrors[i]
                                            ?.baleNumber || ""}
                                        </div>
                                      )}
                                  </div>
                                  <div className="flex-grow">
                                    <select
                                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                      // placeholder="Select original sample status"
                                      name="originalSampleStatus"
                                      value={element.originalSampleStatus || ""}
                                      onChange={(e) =>
                                        handleWeightAndBaleNumberChange(
                                          e.target.name,
                                          e.target.value,
                                          i
                                        )
                                      }
                                    >
                                      <option value="">
                                        Select original sample status
                                      </option>
                                      <option value="DNA treated">
                                        DNA treated
                                      </option>
                                      <option value="DNA Untreated">
                                        DNA Untreated
                                      </option>
                                    </select>
                                    {weightAndBaleNumberErrors[i]
                                      ?.originalSampleStatus && (
                                        <div className="text-sm text-red-500 ">
                                          {weightAndBaleNumberErrors[i]
                                            ?.originalSampleStatus || ""}
                                        </div>
                                      )}
                                  </div>
                                  <div>
                                    {i === 0 ? (
                                      <button
                                        className="mt-1 p-2 rounded"
                                        onClick={
                                          handleAddMoreWeightAndBaleNumber
                                        }
                                        style={{
                                          backgroundColor: "#E08E0B",
                                        }}
                                      >
                                        <FaPlus color="#fff" />
                                      </button>
                                    ) : (
                                      <button
                                        className="mt-1 p-2 rounded"
                                        onClick={() =>
                                          handleDeleteWeightAndBaleNumber(i)
                                        }
                                        style={{
                                          backgroundColor: "#D73925",
                                        }}
                                      >
                                        <FaMinus color="#fff" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          <div className="row mt-3">
                            <div className="col-12 col-sm-6 col-md-4 mt-2">
                              <label className="text-gray-500 text-[12px] font-medium">
                                Data of sample dispatch *
                              </label>
                              <textarea
                                className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder="Enter date of sample dispatch"
                                name="dataOfSampleDispatch"
                                rows={4}
                                value={formData.dataOfSampleDispatch || ""}
                                onChange={(e) =>
                                  handleChange(
                                    "dataOfSampleDispatch",
                                    e.target.value
                                  )
                                }
                              />
                              {errors.dataOfSampleDispatch && (
                                <div className="text-red-500 text-sm ">
                                  {errors.dataOfSampleDispatch}
                                </div>
                              )}
                            </div>

                            <div className="col-12 col-sm-6 col-md-4 mt-2">
                              <label className="text-gray-500 text-[12px] font-medium">
                                Operator name *
                              </label>
                              <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder="Enter operator name"
                                name="operatorName"
                                value={formData.operatorName || ""}
                                onChange={(e) =>
                                  handleChange("operatorName", e.target.value)
                                }
                              />
                              {errors.operatorName !== "" && (
                                <div className="text-sm text-red-500 ">
                                  {errors.operatorName}
                                </div>
                              )}
                            </div>

                            <div className="col-12 col-sm-6 col-md-4 mt-2">
                              <label className="text-gray-500 text-[12px] font-medium">
                                CottonConnect Executive name *
                              </label>
                              <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder="Enter cotton connect executive name"
                                name="cottonConnectExecutiveName"
                                value={
                                  formData.cottonConnectExecutiveName || ""
                                }
                                onChange={(e) =>
                                  handleChange(
                                    "cottonConnectExecutiveName",
                                    e.target.value
                                  )
                                }
                              />
                              {errors.cottonConnectExecutiveName !== "" && (
                                <div className="text-sm text-red-500 ">
                                  {errors.cottonConnectExecutiveName}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="row mt-3">
                            <div className="col-12 col-sm-6 mt-2">
                              <label className="text-gray-500 text-[12px] font-medium">
                                Expected date of lint sale *
                              </label>
                              <DatePicker
                                name="expectedDateOfLintSale"
                                selected={
                                  formData.expectedDateOfLintSale
                                    ? new Date(formData.expectedDateOfLintSale)
                                    : null
                                }
                                onChange={(date) =>
                                  handleChange("expectedDateOfLintSale", date)
                                }
                                showYearDropdown
                                placeholderText="Select a date"
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              />
                              {errors.expectedDateOfLintSale !== "" && (
                                <div className="text-sm text-red-500 ">
                                  {errors.expectedDateOfLintSale}
                                </div>
                              )}
                            </div>

                            <div className="col-12 col-sm-6 mt-2">
                              <label className="text-gray-500 text-[12px] font-medium">
                                Rice Testing Partner *
                              </label>
                              <select
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="physicalTraceabilityPartnerId"
                                value={
                                  formData.physicalTraceabilityPartnerId || ""
                                }
                                onChange={(e) =>
                                  handleChange(
                                    "physicalTraceabilityPartnerId",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select Rice Testing Partner
                                </option>
                                {physicalTraceabilityPartners?.map(
                                  (physicalTraceabilityPartner: any) => (
                                    <option
                                      key={physicalTraceabilityPartner.id}
                                      value={physicalTraceabilityPartner.id}
                                    >
                                      {physicalTraceabilityPartner.name}
                                    </option>
                                  )
                                )}
                              </select>
                              {errors.physicalTraceabilityPartnerId !== "" && (
                                <div className="text-sm text-red-500 ">
                                  {errors.physicalTraceabilityPartnerId}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div> */}
                  </div>
                </div>

                <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                  <section>
                    <button
                      className="btn-purple mr-2"
                      // disabled={isSelected}
                      style={
                        isSelected
                          ? { cursor: "not-allowed", opacity: 0.8 }
                          : { cursor: "pointer", backgroundColor: "#D15E9C" }
                      }
                      onClick={(e) => handleErrors(e)}
                    >
                      PREVIEW & SUBMIT
                    </button>
                    <button
                      className="btn-outline-purple"
                      onClick={() => onCancel()}
                    >
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
                    fileName={fileName}
                    onClick={handleSubmit}
                    //
                    data1_label={"Date : "}
                    data1={moment(formData?.date).format("DD/MM/YYYY")}
                    data2_label={"Season : "}
                    data2={
                      formData?.seasonId
                        ? season?.find(
                          (seasonId: any) => seasonId.id === formData.seasonId
                        )?.name
                        : null
                    }
                    data3_label={"Total Qty : "}
                    data3={formData?.totalQty}
                    data4_label={"No of Bags Produced : "}
                    data4={formData?.noOfBags}
                    data5_label={"Mandi Out Turn (MOT) : "}
                    data5={formData?.mot}
                    data6_label={"Lot No : "}
                    data6={formData?.lotNo}
                    data7_label={"Heap Number : "}
                    data7={formData?.heapNumber}
                    data8_label={"REEL Lot No : "}
                    data8={formData?.reelLotNno}
                    data9_file_label={"Upload CSV/Excel :"}
                    data9={fileName?.upload}
                    data1_file_OR_txt_label={"Heap Register : "}
                    data1_single_file={
                      formData?.heapRegister ? [formData?.heapRegister] : null
                    }
                    data2_file_OR_txt_label={"Weigh Bridge : "}
                    data2_single_file={
                      formData?.weighBridge ? [formData?.weighBridge] : null
                    }
                    data3_file_OR_txt_label={"Delivery Challan : "}
                    data3_single_file={
                      formData?.deliveryChallan
                        ? [formData?.deliveryChallan]
                        : null
                    }
                    data4_file_OR_txt_label={"Paddy Process : "}
                    data4_single_file={
                      formData?.bagProcess ? [formData?.bagProcess] : null
                    }
                    //
                    // ---------------->>>>>>>>>>>   physical traceability
                    // data7_txt_label={
                    //   "Do you want to enter Rice Testing details : "
                    // }
                    // data7_txt={
                    //   formData?.enterPhysicalTraceability ? "Yes" : "No"
                    // }
                    data8_txt_label={"End date of DNA marker application : "}
                    data8_txt={
                      formData?.enterPhysicalTraceability
                        ? formData?.endDateOfDNAMarkerApplication
                          ? moment(
                            new Date(formData?.endDateOfDNAMarkerApplication)
                          ).format("MM/DD/YYYY")
                          : null
                        : null
                    }
                    data9_txt_label={"Date of sample collection : "}
                    data9_txt={
                      formData?.enterPhysicalTraceability
                        ? formData?.dateSampleCollection
                          ? moment(
                            new Date(formData?.dateSampleCollection)
                          ).format("MM/DD/YYYY")
                          : null
                        : null
                    }
                    // //
                    data7_array_single_table_show={
                      formData?.enterPhysicalTraceability
                        ? formData?.weightAndBaleNumber[0]?.weight
                        : null
                    }
                    data7_array_single_map_label={"Weight and Bale Number : "}
                    data7_array_single_map={formData?.weightAndBaleNumber}
                    data7_array_dynamicPropertyName1_label={"Weight"}
                    data7_array_dynamicPropertyName1={"weight"}
                    data7_array_dynamicPropertyName2_label={"Bale Number"}
                    data7_array_dynamicPropertyName2={"baleNumber"}
                    data7_array_dynamicPropertyName3_label={
                      "Original Sample Status"
                    }
                    data7_array_dynamicPropertyName3={"originalSampleStatus"}
                    // // //
                    data10_txt_label={"Data of sample dispatch : "}
                    data10_txt={
                      formData?.enterPhysicalTraceability
                        ? formData?.dataOfSampleDispatch
                        : null
                    }
                    data11_txt_label={"Operator name : "}
                    data11_txt={
                      formData?.enterPhysicalTraceability
                        ? formData?.operatorName
                        : null
                    }
                    data12_txt_label={"Cotton Connect Executive Name :"}
                    data12_txt={
                      formData?.enterPhysicalTraceability
                        ? formData?.cottonConnectExecutiveName
                        : null
                    }
                    data13_txt_label={"Expected date of lint sale :"}
                    data13_txt={
                      formData?.enterPhysicalTraceability
                        ? formData?.expectedDateOfLintSale
                          ? moment(
                            new Date(formData?.expectedDateOfLintSale)
                          ).format("MM/DD/YYYY")
                          : null
                        : null
                    }
                    data14_txt_label={"Rice Testing Partner : "}
                    data14_txt={
                      formData?.enterPhysicalTraceability
                        ? physicalTraceabilityPartners?.find(
                          (physicalTraceabilityPartner: any) =>
                            physicalTraceabilityPartner.id ==
                            formData.physicalTraceabilityPartnerId
                        )?.name
                        : null
                    }
                  />
                </div>
                {isLoading ? <ModalLoader /> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
