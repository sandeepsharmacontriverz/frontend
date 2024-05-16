"use client";
import React, { useState, useEffect } from "react";
import NavLink from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DatePicker from "react-datepicker";
import TimePicker from "rc-time-picker";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";
import { PreView } from "@components/preview/PreView";
import moment, { Moment } from "moment";
import ModalLoader from "@components/core/ModalLoader";
import "react-datepicker/dist/react-datepicker.css";
import "rc-time-picker/assets/index.css";

export default function page() {
  useTitle("New Sale");
  const [roleLoading, hasAccesss] = useRole();
  const millId = User.MillId;
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});
  const [selectedTime, setSelectedTime] = useState<Moment>();

  const [from, setFrom] = useState<Date | null>(new Date());
  const [fumigationDate, setFumigationDate] = useState<Date | null>(new Date());
  const [dispatch, setDispatch] = useState<Date | null>(new Date());
  const [containerData, setContainerData] = useState<any>([]);
  const [program, setProgram] = useState([]);
  const [season, setSeason] = useState<any>();
  const [containerNameMulti, setContainerNameMulti] = useState<any>([]);
  const [containerNoMulti, setContainerNoMulti] = useState<any>([]);
  const [containerWeightMulti, setContainerWeightMulti] = useState<any>([]);

  const [buyerOptions, setBuyerOptions] = useState<any>();
  const [fileName, setFileName] = useState({
    contractFile: "",
    deliveryNotes: "",
    invoiceFile: [],
    qualityDoc: "",
    tcFiles: "",
    fumigationChemicalInvoice: ""
  });
  const [formData, setFormData] = useState<any>({
    millId: millId,
    date: new Date(),
    programId: null,
    seasonId: null,
    orderRef: "",
    buyerType: "",
    buyerId: null,
    processorName: "",
    processorAddress: "",
    totalQty: null,
    transactionViaTrader: null,
    transactionAgent: "",
    noOfContainers: null,
    batchLotNo: "",
    reelLotNno: "",
    riceType: [],
    riceVariety: [],
    containerName: [],
    containerNo: [],
    containerWeight: [],
    invoiceNo: "",
    billOfLadding: "",
    transporterName: "",
    vehicleNo: "",
    invoiceFile: [],
    price: null,
    dispatchDate: new Date(),
    fumigationDate: new Date(),
    fumigationChemicalsDetails: "",
    fumigationTotalQty: null,
    fumigationTotalChemicalUsed: null,
    fumigationChemicalInvoice: "",
    fumigationTime: "",

  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [riceType, setRiceType] = useState<any>([]);
  const [riceVariety, setRiceVariety] = useState<any>([]);
  const [showPreview, setShowPreview] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(false);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Mill")) {
      const access = checkAccess("Mill Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    getSeason();
  }, []);

  useEffect(() => {
    if (millId) {
      getPrograms();
      getBuyerOptions();
      setFormData((prevData: any) => ({
        ...prevData,
        millId: millId,
      }));
    }
  }, [millId]);

  useEffect(() => {
    const savedData: any = sessionStorage.getItem("millSales");
    const chooseRice: any = sessionStorage.getItem("chooseRice");
    const conData: any = sessionStorage.getItem("containersData");

    const processData = JSON.parse(savedData);
    const riceData = JSON.parse(chooseRice);
    const containerData = JSON.parse(conData);

    if (processData || riceData) {
      const reelLotNos = riceData?.map((item: any) => item.reelLotNo)
        .filter((value: any) => value !== null && value !== undefined);

      const uniqueReelLotNos = new Set(reelLotNos);

      const reel =
        uniqueReelLotNos.size > 0 ? [...uniqueReelLotNos].join(", ") : "";

      const riceTypeArray = riceData?.map(
        (item: any) => item?.riceType
      );

      const riceVarietyArray = riceData?.map(
        (item: any) => item?.riceVariety
      );

      setRiceVariety(riceData?.map(
        (item: any) => item?.riceVarietyName
      ).flat())

      setRiceType(riceData?.map(
        (item: any) => item?.riceTypeName
      ).flat())

      const batch = riceData?.map(
        (item: any) => item?.batchLotNo
      );
      const uniqueBatchLot = [...new Set(batch)];

      setFormData({
        ...processData,
        reelLotNno: reel,
        totalQty: riceData && riceData[0]?.total_qty_used,
        chooseRice: riceData && riceData,
        riceType: riceData && riceTypeArray.flat(),
        riceVariety: riceData && riceVarietyArray.flat(),
        batchLotNo: uniqueBatchLot.toString(),
      });

      setContainerData(containerData)

    }
  }, []);

  useEffect(() => {
    const totalRiceQty = formData.containerWeight.reduce(
      (acc: any, curr: any) => acc + curr,
      0
    );

    setFormData((prevFormData: any) => ({
      ...prevFormData,
      noOfContainers: formData.containerName.length,
      totalContainerWeight: totalRiceQty
    }));
  }, [formData.containerName, formData.containerWeight])

useEffect(()=>{
if(formData.totalContainerWeight > formData.totalQty){
  setErrors((prevFormData: any) => ({
    ...prevFormData,
    containerWeight: "Total Container Weight should not be greater than Total Rice Quantity"
  }))
} 
  else{
    setErrors((prevFormData: any) => ({
      ...prevFormData,
      containerWeight: ""
    }));
  }
},[formData.totalContainerWeight])

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

  const getPrograms = async () => {
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

  const getBuyerOptions = async () => {
    try {
      const res = await API.get(
        `mill-process/get-cms?millId=${millId}`
      );
      if (res.success) {
        setBuyerOptions(res.data);
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


  const handleDispatch = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setDispatch(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      dispatchDate: newDate,
    }));
  };


  const handleFumigationDate = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setFumigationDate(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      fumigationDate: newDate,
    }));
  };


  const getChooseRice = () => {
    if (formData.programId) {
      sessionStorage.setItem("millSales", JSON.stringify(formData));
      sessionStorage.setItem("containersData", JSON.stringify(containerData));

      router.push(`/mill/sales/choose-rice?id=${formData.programId}`);
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to Choose Rice",
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
    if (name === "invoiceFile") {
      let filesLink: any = [...formData.invoiceFile];
      let filesName: any = [...fileName.invoiceFile];

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

  const removeImage = (index: any) => {
    let filename = fileName.invoiceFile;
    let fileNavLink = formData.invoiceFile;
    let arr1 = filename.filter((element: any, i: number) => index !== i);
    let arr2 = fileNavLink.filter((element: any, i: number) => index !== i);
    setFileName((prevData: any) => ({
      ...prevData,
      invoiceFile: arr1,
    }));
    setFormData((prevData: any) => ({
      ...prevData,
      invoiceFile: arr2,
    }));
  };

  const handleTimeChange = (newTime: any, name: any) => {
    if (!moment.isMoment(newTime)) {
      if (name === "fumigationTime") {
        setSelectedTime(undefined);
      }
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: null,
      }));
      return;
    }
    const isStartTime = name === "fumigationTime";
    if (isStartTime) {
      setSelectedTime(newTime);
    }
    const formatted = newTime.format("HH:mm:ss");
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: formatted,
    }));
    setErrors((prevFormData: any) => ({
      ...prevFormData,
      [name]: "",
    }));
  };

  const handleChange = (name?: any, value?: any, event?: any) => {
    if (name === "transactionViaTrader") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value === "Yes" ? true : false,
        transactionAgent: value === "Yes" ? prevData.transactionAgent : "",
      }));
    } else if (name === "buyerType") {
      setFormData((prevData: any) => ({
        ...prevData,
        buyerId: null,
        processorName: "",
        processorAddress: "",
      }));
      setErrors((prev: any) => ({
        ...prev,
        buyerId: "",
        processorName: "",
        processorAddress: "",
      }));
      if (name === "buyerType" && value === "Mapped") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          buyerId: null,
          processorName: "",
          processorAddress: "",
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          buyerId: null,
        }));
      }
    } else if (name === "buyerId") {
      setFormData((prevData: any) => ({
        ...prevData,
        buyerId: value
      }))
    }
    else {
      if (
        name === "contractFile" ||
        name === "deliveryNotes" ||
        name === "invoiceFile" ||
        name === "qualityDoc" ||
        name === "tcFiles" ||
        name === "fumigationChemicalInvoice"
      ) {
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


  const addMultiContainer = () => {
    if (formData.totalQty === 0  || formData.totalQty === null || formData.totalQty === "") {
      setErrors((prevData: any) => ({
        ...prevData,
        containerName: "Select Choose Rice",
      }));
      return;
    }

    if (containerNameMulti.length == 0 && containerNoMulti.length == 0) {
      setErrors((prev: any) => ({
        ...prev,
        containerName: "Please Enter Values to add",
      }));
      return;
    }
    const totalRiceQty = formData.containerWeight.reduce(
      (acc: any, curr: any) => acc + curr,
      0
    );

    if (
      totalRiceQty + Number(containerWeightMulti) > Number(formData.totalQty)
    ) {
      setErrors((prevData: any) => ({
        ...prevData,
        containerWeight:
          "Cannot Add. Total Container Weight cannot exceeds Total Rice Quantity (Kgs).",
      }));
    } 
    else{

      setFormData((prevData: any) => ({
        ...prevData,
        containerName: [...prevData.containerName, containerNameMulti],
        containerNo: [
          ...prevData.containerNo,
          containerNoMulti,
        ],
        containerWeight: [
          ...prevData.containerWeight,
          Number(containerWeightMulti),
        ]
      }));

    const newRiceData = {
      containerName: containerNameMulti,
      containerNo: containerNoMulti,
      containerWeight: Number(containerWeightMulti)
    };
    
    setContainerData((prevYarnData: any) => [...prevYarnData, newRiceData]);
    
    setContainerNameMulti('');
    setContainerNoMulti("");
    setContainerWeightMulti('')
    setErrors((prev: any) => ({
      ...prev,
      containerName: "",
      containerNo: "",
      containerWeight: ""
    }));
  }
  }

  const removeContainer = (index: any) => {
    let containerName = formData.containerName;
    let containerNo = formData.containerNo;
    let containerWeight = formData.containerWeight;

    let arr1 = containerName.filter((element: any, i: number) => index !== i);
    let arr2 = containerNo.filter((element: any, i: number) => index !== i);
    let arr3 = containerWeight.filter((element: any, i: number) => index !== i);


    const updatedContainerData = [...containerData];
    updatedContainerData.splice(index, 1);

    setContainerData(updatedContainerData);

    setFormData((prevData: any) => ({
      ...prevData,
      containerName: arr1,
      containerNo: arr2,
      containerWeight: arr3
    }));
  };

  const onBlur = (e: any, type: any) => {
    const { name, value } = e.target;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;
    if (type === "alphabets") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Accepts only Alphabets and special characters like _,-,()",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

    if (type === "billNumbers") {
      const valid = regexBillNumbers.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    }

    if (value != "" && type == "numbers") {
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

    if (value != "" && type == "float") {
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
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
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
        if (Number(value)) {
          const formattedValue =
            Number(value) % 1 === 0
              ? Number(value)?.toFixed(0)
              : Number(value)?.toFixed(2);
          const newVal = formattedValue.toString().replace(/\.00$/, "");
          setFormData((prevData: any) => ({
            ...prevData,
            [name]: Number(newVal),
          }));
          setErrors((prev: any) => ({
            ...prev,
            [name]: "",
          }));
        }
      }
    }
  };

  const requiredMillFields = [
    "seasonId",
    "date",
    "dispatchDate",
    "programId",
    "orderRef",
    "buyerType",
    "buyerId",
    "noOfContainers",
    "containerName",
    "containerNo",
    "transactionViaTrader",
    "transactionAgent",
    "processorName",
    "processorAddress",
    "invoiceNo",
    "containerWeight",
    "billOfLadding",
    "transporterName",
    "vehicleNo",
    "invoiceFile",
    "price",
    "fumigationDate",
    "fumigationChemicalsDetails",
    "fumigationTotalQty",
    "fumigationTotalChemicalUsed",
    "fumigationChemicalInvoice",
    "fumigationTime"
  ];

  const validateField = (name: string, value: any, index: number = 0) => {
    if (requiredMillFields.includes(name)) {
      switch (name) {
        case "seasonId":
          return value?.length === 0 || value === null || value === undefined
            ? "Season is required"
            : "";
        case "date":
          return value?.length === 0 || value === null
            ? "Date is required"
            : "";
        case "dispatchDate":
          return value?.length === 0 || value === null
            ? "Dispatch Date is required"
            : "";
        case "fumigationDate":
          return value?.length === 0 || value === null
            ? "Fumigation Date  is required"
            : "";
        case "programId":
          return value?.length === 0 || value === null
            ? "Please select any one option"
            : "";
        case "containerName":
          return formData.containerName.length === 0 && formData.containerNo.length === 0
            ? "Please Add Container Name, Container No and Container Weight"
            : errors.containerName != ""
              ? errors.containerName
              : "";
        case "price":
          return value === null
            ? "Price/Kg is required"
            : errors.price != ""
              ? errors.price
              : "";
        case "buyerType":
          return value.trim() === "" ? "Please select any one option" : "";
        case "transactionViaTrader":
          return value?.length === 0 || value === null
            ? "Please select any one option"
            : "";
        case "transactionAgent":
          return formData.transactionViaTrader === true && value?.trim() === ""
            ? "Agent Details is required"
            : errors?.transactionAgent
              ? errors?.transactionAgent
              : "";
        case "buyerId":
          return formData.buyerType === "Mapped" &&
            (value === null || !value)
            ? "Container Management System is required"
            : "";
        case "processorName":
          return formData.buyerType === "New Buyer" && value?.trim() === ""
            ? "This Field is required"
            : errors?.processorName
              ? errors?.processorName
              : "";
        case "processorAddress":
          return formData.buyerType === "New Buyer" && value?.trim() === ""
            ? "This Field is required"
            : errors?.processorAddress
              ? errors?.processorAddress
              : "";

        case "invoiceNo":
          return value.trim() === ""
            ? "Invoice No is required"
            : errors?.invoiceNo
              ? errors?.invoiceNo
              : "";
        case "containerWeight": 
        return  Number(formData.totalContainerWeight) < Number(formData.totalQty) ? "Total Container Weight should be equal to Total Rice Quantity (Kgs)" : errors.containerWeight ? errors.containerWeight : ""     
        case "billOfLadding":
          return value.trim() === ""
            ? "This field is required"
            : errors?.billOfLadding
              ? errors?.billOfLadding
              : "";
        case "transporterName":
          return value.trim() === ""
            ? "Transporter Name is required"
            : errors?.transporterName
              ? errors?.transporterName
              : "";
        case "vehicleNo":
          return value.trim() === ""
            ? "Vehicle No is required"
            : errors?.vehicleNo
              ? errors?.vehicleNo
              : "";
        case "invoiceFile":
          return value.length === 0 ? "Invoice File is required" : "";
        case "fumigationChemicalsDetails":
          return !value ? "Fumigation Chemicals Details is required" : "";
        case "fumigationTotalQty":
          return value === null ? "Fumigation Total Qty is required" : "";
        case "fumigationTotalChemicalUsed":
          return value === null ? "Fumigation Total Chemical Used is required" : "";
        case "fumigationChemicalInvoice":
          return !value ? "Fumigation Chemical Invoice is required" : "";
        case "fumigationTime":
          return !value ? "Fumigation Time is required" : "";
        default:
          return "";
      }
    }
  };


  const handleErrorCheck = async (event: any) => {
    event.preventDefault();

    const newSpinnerErrors: any = {};

    Object.keys(formData).forEach((fieldName: string) => {
      newSpinnerErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any]
      );
    });

    const hasSpinnerErrors = Object.values(newSpinnerErrors).some(
      (error) => !!error
    );

    if (hasSpinnerErrors) {
      setErrors(newSpinnerErrors);
    }


    if (!formData.totalQty) {
      setErrors((prev: any) => ({
        ...prev,
        chooseRice: "Choose Rice is Required",
      }));
      return;
    }

    if (!hasSpinnerErrors) {
      setShowPreview(true);
    } else {
      return;
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newSpinnerErrors: any = {};

    Object.keys(formData).forEach((fieldName: string) => {
      newSpinnerErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any]
      );
    });

    const hasSpinnerErrors = Object.values(newSpinnerErrors).some(
      (error) => !!error
    );

    if (hasSpinnerErrors) {
      setErrors(newSpinnerErrors);
    }

    if (!formData.totalQty) {
      setErrors((prev: any) => ({
        ...prev,
        chooseRice: "Choose Rice is Required",
      }));
      return;
    }

    if (!hasSpinnerErrors) {
      try {
        setIsSubmitting(true);
        setIsLoading(true);
        const response = await API.post("mill-process/sales", {
          ...formData,
        containers: containerData
        }
        );
        if (response.success) {
          toasterSuccess("Sales Successfully Created");
          sessionStorage.removeItem("millSales");
          sessionStorage.removeItem("chooseRice");
          sessionStorage.removeItem("containersData");
          router.push("/mill/sales");
        } else {
          setIsSubmitting(false);
          setIsLoading(false);
        }
      } catch (error) {
        toasterError("An Error occurred.");
        setIsSubmitting(false);
        setIsLoading(false);
      }
    } else {
      return;
    }
  };

  const onCancel = () => {
    sessionStorage.removeItem("millSales");
    sessionStorage.removeItem("chooseRice");
    sessionStorage.removeItem("containersData");

    router.push("/mill/sales");
  };

  if (roleLoading || isSubmitting) {
    return <Loader />;
  }

  if (!roleLoading && !Access.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access.create) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <NavLink href="/mill/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>Sale</li>
                <li>New Sale</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div className="w-100 mt-4">
            <div className="customFormSet">
              <div className="w-100">
                <div className="row">
                  <div className="col-12 col-sm-6 mt-4">
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
                    {errors?.seasonId && (
                      <div className="text-sm text-red-500">
                        {errors.seasonId}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date <span className="text-red-500">*</span>
                    </label>

                    <DatePicker
                      selected={from ? from : null}
                      dateFormat={"dd-MM-yyyy"}
                      onChange={handleFrom}
                      showYearDropdown
                      maxDate={new Date()}
                      placeholderText="From"
                      className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.date && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date of Dispatch  <span className="text-red-500">*</span>
                    </label>

                    <DatePicker
                      selected={dispatch ? dispatch : null}
                      dateFormat={"dd-MM-yyyy"}
                      onChange={handleDispatch}
                      showYearDropdown
                      // maxDate={new Date()}
                      placeholderText="From"
                      className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.dispatch && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.dispatch}
                      </p>
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
                              checked={formData.programId == program.id}
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
                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Order Reference
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="orderRef"
                      value={formData.orderRef || ""}
                      onChange={(e) =>
                        handleChange("orderRef", e.target.value)
                      }
                      onBlur={(e) => onBlur(e, "billNumbers")}
                      type="text"
                      placeholder="Order Reference"
                    />
                    {errors?.orderRef !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.orderRef}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Choose Rice <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <button
                        name="chooseRice"
                        type="button"
                        onClick={() => getChooseRice()}
                        className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                      >
                        Choose Rice
                      </button>
                      <p className="text-sm flex items-center px-3">
                        {formData?.totalQty || 0} Kgs chosen
                      </p>
                    </div>
                    {errors?.chooseRice !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.chooseRice}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Choose Buyer <span className="text-red-500">*</span>
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="buyerType"
                            checked={formData.buyerType === "Mapped"}
                            onChange={(e) =>
                              handleChange("buyerType", e.target.value)
                            }
                            value="Mapped"
                          />
                          <span></span>
                        </section>{" "}
                        Mapped
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="buyerType"
                            checked={formData.buyerType === "New Buyer"}
                            onChange={(e) =>
                              handleChange("buyerType", e.target.value)
                            }
                            value="New Buyer"
                          />
                          <span></span>
                        </section>{" "}
                        New Buyer
                      </label>
                    </div>
                    {errors?.buyerType !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.buyerType}
                      </div>
                    )}
                  </div>
                  {formData.buyerType === "Mapped" ? (
                    <>
                      <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Container Management System
                          <span className="text-red-500">*</span>
                        </label>
                        <Select
                          name="buyerId"
                          value={formData.buyerId
                            ? {
                              label: buyerOptions?.find(
                                (buyerId: any) =>
                                  buyerId.id === formData.buyerId
                              )?.name,
                              value: formData.buyerId,
                            }
                            : null}
                          menuShouldScrollIntoView={false}
                          isClearable
                          placeholder="Select Container Management System"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                          options={(buyerOptions || []).map(({ id, name }: any) => ({
                            label: name,
                            value: id,
                            key: id,
                          }))}
                          onChange={(item: any) => {
                            handleChange("buyerId", item?.value);
                          }}
                        />
                        {errors?.buyerId && (
                          <div className="text-sm text-red-500">
                            {errors.buyerId}
                          </div>
                        )}
                      </div>
                    </>
                  ) : formData.buyerType === "New Buyer" ? (
                    <>
                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Processor Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          name="processorName"
                          value={formData.processorName || ""}
                          onChange={(e) =>
                            handleChange("processorName", e.target.value)
                          }
                          onBlur={(e) => onBlur(e, "alphabets")}
                          type="text"
                          placeholder="Processor Name"
                        />
                        {errors?.processorName && (
                          <div className="text-sm text-red-500">
                            {errors.processorName}
                          </div>
                        )}
                      </div>
                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          name="processorAddress"
                          value={formData.processorAddress}
                          onChange={(e) =>
                            handleChange("processorAddress", e.target.value)
                          }
                          onBlur={(e) => onBlur(e, "billNumbers")}
                          placeholder="Address"
                          rows={3}
                        />
                        {errors?.processorAddress !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.processorAddress}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Transaction via Trader{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="transactionViaTrader"
                            checked={formData.transactionViaTrader === true}
                            onChange={(e) =>
                              handleChange(
                                "transactionViaTrader",
                                e.target.value
                              )
                            }
                            value={"Yes"}
                          />
                          <span></span>
                        </section>{" "}
                        Yes
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="transactionViaTrader"
                            checked={
                              formData.transactionViaTrader === false
                            }
                            onChange={(e) =>
                              handleChange(
                                "transactionViaTrader",
                                e.target.value
                              )
                            }
                            value={""}
                          />
                          <span></span>
                        </section>{" "}
                        No
                      </label>
                    </div>
                    {errors?.transactionViaTrader !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.transactionViaTrader}
                      </div>
                    )}
                  </div>
                  {formData.transactionViaTrader && (
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Agent Details{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="transactionAgent"
                        value={formData.transactionAgent || ""}
                        onChange={(e) =>
                          handleChange("transactionAgent", e.target.value)
                        }
                        onBlur={(e) => onBlur(e, "billNumbers")}
                        placeholder="Agent Details"
                        rows={3}
                      />
                      {errors?.transactionAgent !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.transactionAgent}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Total Rice Quantity (Kgs)
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      placeholder="Total Rice Quantity (Kgs)"
                      name="totalQty"
                      value={formData.totalQty || ""}
                      onChange={(e) =>
                        handleChange("totalQty", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      No of Containers
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      placeholder="No of Containers"
                      name="noOfContainers"
                      disabled
                      value={formData.noOfContainers || ""}
                      onChange={(e) =>
                        handleChange("noOfContainers", e.target.value)
                      }
                    />
                  </div>

                  <div className="row">
                    <div className="col-12 col-sm-3 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Container Name<span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        // onBlur={(e) => onBlur(e, "numeric")}
                        name="containerName"
                        placeholder="Container Name"
                        value={containerNameMulti || ""}
                        onChange={(e: any) => setContainerNameMulti(e.target.value)}
                      />

                      {errors?.containerName !== "" && (
                        <div className="text-sm text-red-500">{errors.containerName}</div>
                      )}
                    </div>
                    <div className="col-12 col-sm-3 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Container No
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="containerNo"
                        placeholder="Container No"
                        value={containerNoMulti || ""}
                        onChange={(e: any) => setContainerNoMulti(e.target.value)}
                      />
                      {errors?.containerNo !== "" && (
                        <div className="text-sm pt-1 text-red-500">
                          {errors?.containerNo}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-3 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Container Weight
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="containerWeight"
                        value={containerWeightMulti || []}
                        onBlur={(e) => onBlur(e, "numbers")}
                        onChange={(e: any) => setContainerWeightMulti(e.target.value)}
                        type="number"
                        placeholder="Container Weight"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.containerWeight !== "" && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.containerWeight}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-3 mt-4">
                      <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                        <button
                          name="multiYarn"
                          type="button"
                          onClick={addMultiContainer}
                          className="bg-[#d15e9c] text-sm rounded text-white px-2  h-11 w-16"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {formData?.containerName?.length > 0 && (
                      <div className="mt-4 border">
                        {formData?.containerName?.length > 0 &&
                          formData?.containerName?.map(
                            (item: any, index: number) => {
                              return (
                                <div className="row py-2" key={index}>
                                  <div className="col-12 col-sm-3 ">
                                    <input
                                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                      type="text"
                                      value={formData?.containerName[index] || ""}
                                      onChange={handleChange}
                                      disabled
                                    />
                                  </div>
                                  <div className="col-12 col-sm-3">
                                    <input
                                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                      type="text"
                                      value={formData?.containerNo[index] || ""}
                                      onChange={handleChange}
                                      disabled
                                    />
                                  </div>
                                  <div className="col-12 col-sm-3">
                                    <input
                                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                      type="text"
                                      value={formData?.containerWeight[index] || ""}
                                      onChange={handleChange}
                                      disabled
                                    />
                                  </div>
                                  <div className="col-12 col-sm-3 mt-2">
                                    <button
                                      name="multiYarn"
                                      type="button"
                                      onClick={() => removeContainer(index)}
                                      className="bg-red-500 text-sm rounded text-white px-2 py-1"
                                    >
                                      X
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                          )}
                      </div>
                    )}

                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Total Container Weight <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      placeholder=" Total Container Weight"
                      name="totalContainerWeight"
                      disabled
                      value={formData.totalContainerWeight || ""}
                      onChange={(e) =>
                        handleChange("totalContainerWeight", e.target.value)
                      }
                    />    
                    </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Batch/Lot No <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      placeholder="Batch/Lot No"
                      name="batchLotNo"
                      onBlur={(e) => onBlur(e, "billNumbers")}
                      disabled
                      value={formData.batchLotNo || ""}
                      onChange={(e) =>
                        handleChange("batchLotNo", e.target.value)
                      }
                    />
                    {errors.batchLotNo && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.batchLotNo}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Rice Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      placeholder="Rice Type"
                      name="riceType"
                      // onBlur={(e) => onBlur(e, "billNumbers")}
                      disabled
                      value={riceType}
                      onChange={(e) =>
                        handleChange("riceType", e.target.value)
                      }
                    />
                    {errors.riceType && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.riceType}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Rice Variety <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      placeholder="Rice Variety"
                      name="riceVariety"
                      // onBlur={(e) => onBlur(e, "billNumbers")}
                      disabled
                      value={riceVariety}
                      onChange={(e) =>
                        handleChange("riceVariety", e.target.value)
                      }
                    />
                    {errors.riceVariety && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.riceVariety}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      REEL Lot No
                    </label>
                    <textarea
                      className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      disabled
                      placeholder="REEL Lot No"
                      name="reelLotNno"
                      value={formData.reelLotNno || ""}
                      onChange={(e) =>
                        handleChange("reelLotNno", e.target.value)
                      }
                      style={{ width: "100%", minHeight: "80px" }}
                    />
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Price/Kg <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      placeholder="Price/Kg"
                      name="price"
                      value={formData.price || ""}
                      onBlur={(e) => onBlur(e, "numeric")}
                      onChange={(e) =>
                        handleChange("price", e.target.value)
                      }
                    />
                    {errors?.price !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {errors?.price}{" "}
                      </div>
                    )}
                  </div>
                </div>
                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">
                    OTHER INFORMATION:
                  </h4>
                  <div className="row">
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Invoice No <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="invoiceNo"
                        value={formData.invoiceNo || ""}
                        onChange={(e) =>
                          handleChange("invoiceNo", e.target.value)
                        }
                        onBlur={(e) => onBlur(e, "billNumbers")}
                        type="text"
                        placeholder="Invoice No *"
                      />
                      {errors.invoiceNo && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.invoiceNo}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        LR/BL No <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="billOfLadding"
                        value={formData.billOfLadding || ""}
                        onChange={(e) =>
                          handleChange("billOfLadding", e.target.value)
                        }
                        type="text"
                        onBlur={(e) => onBlur(e, "billNumbers")}
                        placeholder="Bill Of Ladding"
                      />
                      {errors.billOfLadding && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.billOfLadding}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Transporter Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="transporterName"
                        value={formData.transporterName || ""}
                        onChange={(e) =>
                          handleChange("transporterName", e.target.value)
                        }
                        onBlur={(e) => onBlur(e, "alphabets")}
                        type="text"
                        placeholder="Transporter Name"
                      />
                      {errors.transporterName && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.transporterName}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Vehicle No <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="vehicleNo"
                        value={formData.vehicleNo || ""}
                        onChange={(e) =>
                          handleChange("vehicleNo", e.target.value)
                        }
                        onBlur={(e) => onBlur(e, "billNumbers")}
                        type="text"
                        placeholder="Vehicle No"
                      />
                      {errors.vehicleNo && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.vehicleNo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">
                    OTHER DOCUMENTS:
                  </h4>
                  <div className="row">
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Quality Document
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            type="file"
                            name="qualityDoc"
                            accept=".pdf,.zip, image/jpg, image/jpeg"
                            onChange={(e) =>
                              handleChange(
                                "qualityDoc",
                                e?.target?.files?.[0]
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                      </p>
                      {fileName.qualityDoc && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.qualityDoc}</p>
                        </div>
                      )}
                      {errors?.qualityDoc !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.qualityDoc}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload TC's
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="tcFiles"
                            type="file"
                            accept=".pdf,.zip, image/jpg, image/jpeg"
                            onChange={(e) =>
                              handleChange("tcFiles", e?.target?.files?.[0])
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                      </p>
                      {fileName.tcFiles && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.tcFiles}</p>
                        </div>
                      )}
                      {errors?.tcFiles !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.tcFiles}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Contract Files
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="contractFile"
                            type="file"
                            accept=".pdf,.zip, image/jpg, image/jpeg"
                            onChange={(e) =>
                              handleChange(
                                "contractFile",
                                e?.target?.files?.[0]
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                      </p>
                      {fileName.contractFile && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.contractFile}</p>
                        </div>
                      )}
                      {errors?.contractFile !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.contractFile}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Invoice Files{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="invoiceFile"
                            type="file"
                            multiple
                            accept=".pdf,.zip, image/jpg, image/jpeg"
                            onChange={(e) =>
                              handleChange("invoiceFile", e?.target?.files)
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                      </p>
                      {errors?.invoiceFile !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.invoiceFile}
                        </div>
                      )}
                      {fileName.invoiceFile &&
                        fileName.invoiceFile.map(
                          (item: any, index: any) => (
                            <div className="flex text-sm mt-1" key={index}>
                              <GrAttachment />
                              <p className="mx-1">{item}</p>
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
                          )
                        )}
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Delivery Notes
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="deliveryNotes"
                            type="file"
                            accept=".pdf,.zip, image/jpg, image/jpeg"
                            onChange={(e) =>
                              handleChange(
                                "deliveryNotes",
                                e?.target?.files?.[0]
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                      </p>
                      {fileName.deliveryNotes && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.deliveryNotes}</p>
                        </div>
                      )}
                      {errors?.deliveryNotes !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.deliveryNotes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">
                    FUMIGATION PROCESS:
                  </h4>
                  <div className="row">
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Date of Fumigation  <span className="text-red-500">*</span>
                      </label>

                      <DatePicker
                        selected={fumigationDate ? fumigationDate : null}
                        dateFormat={"dd-MM-yyyy"}
                        onChange={handleFumigationDate}
                        showYearDropdown
                        // maxDate={new Date()}
                        placeholderText="From"
                        className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.fumigationDate && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.fumigationDate}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Fumigation Chemical Details{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="fumigationChemicalsDetails"
                        value={formData.fumigationChemicalsDetails || ""}
                        onChange={(e) =>
                          handleChange("fumigationChemicalsDetails", e.target.value)
                        }
                        onBlur={(e) => onBlur(e, "numbers")}
                        placeholder="Fumigation Chemical Details"
                        rows={3}
                      />
                      {errors?.fumigationChemicalsDetails !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.fumigationChemicalsDetails}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Fumigation Quantity (Kgs) <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        placeholder="Total Rice Quantity (Kgs)"
                        onBlur={(e) => onBlur(e, "numbers")}
                        name="fumigationTotalQty"
                        value={formData.fumigationTotalQty || ""}
                        onChange={(e) =>
                          handleChange("fumigationTotalQty", e.target.value)
                        }
                      />
                      {errors.fumigationTotalQty && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.fumigationTotalQty}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Fumigation Chemical Used
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        onBlur={(e) => onBlur(e, "billNumbers")}
                        placeholder="Total Fumigation Chemical Used"
                        name="fumigationTotalChemicalUsed"
                        value={formData.fumigationTotalChemicalUsed || ""}
                        onChange={(e) =>
                          handleChange("fumigationTotalChemicalUsed", e.target.value)
                        }
                      />
                      {errors.fumigationTotalChemicalUsed && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.fumigationTotalChemicalUsed}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Fumigation Chemical Invoice <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            type="file"
                            name="fumigationChemicalInvoice"
                            accept=".pdf,.zip, image/jpg, image/jpeg"
                            onChange={(e) =>
                              handleChange(
                                "fumigationChemicalInvoice",
                                e?.target?.files?.[0]
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                      </p>
                      {fileName.fumigationChemicalInvoice && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.fumigationChemicalInvoice}</p>
                        </div>
                      )}
                      {errors?.fumigationChemicalInvoice !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.fumigationChemicalInvoice}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Fumigation Time <span className="text-red-500">*</span>
                      </label>
                      <div className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom">
                        <TimePicker
                          className="w-100"
                          onChange={(e) => handleTimeChange(e, "fumigationTime")}
                          value={selectedTime}
                          placeholder="- - : - -"
                          showSecond={false}
                          use12Hours={true}
                        />
                      </div>
                      {errors.fumigationTime && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.fumigationTime}
                        </p>
                      )}
                    </div>

                  </div>
                </div>

                <hr className="mt-4" />
                <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                  <section>
                    <button
                      className="btn-purple mr-2"
                      disabled={isSubmitting}
                      style={
                        isSubmitting
                          ? { cursor: "not-allowed", opacity: 0.8 }
                          : {
                            cursor: "pointer",
                            backgroundColor: "#D15E9C",
                          }
                      }
                      onClick={handleErrorCheck}
                    >
                      PREVIEW & SUBMIT
                    </button>
                    <button
                      className="btn-outline-purple"
                      onClick={onCancel}
                    >
                      CANCEL
                    </button>
                  </section>
                </div>
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
                  data1_label={"Season : "}
                  data1={
                    formData?.seasonId
                      ? season?.find(
                        (seasonId: any) =>
                          seasonId.id === formData.seasonId
                      )?.name
                      : null
                  }
                  data2_label={"Date : "}
                  data2={moment(formData?.date).format("DD-MM-yyyy")}
                  data3_label={"Order Reference : "}
                  data3={formData?.orderRef}
                  data4_label={"Choosed Buyer : "}
                  data4={formData.buyerId ?
                    buyerOptions?.find(
                      (buyerId: any) =>
                        buyerId.id === formData.buyerId
                    )?.name
                    : formData.processorName}
                  data6_label={"Transaction via Trader : "}
                  data6={formData?.transactionViaTrader ? "Yes" : "No"}
                  data7_label={"Agent Details : "}
                  data7={formData?.transactionAgent}
                  data8_label={"Total Rice Quantity (Kgs) :"}
                  data8={formData?.totalQty}
                  data10_label={"No of Boxes/Cartons : "}
                  data10_data={formData?.noOfBoxes}
                  data11_label={"Batch/Lot No : "}
                  data11_data={formData?.batchLotNo}
                  data12_label={"REEL Lot No : "}
                  data12_data={formData?.reelLotNno}
                  data13_label={"Processor Name : "}
                  data13_data={formData?.processorName}
                  data14_label={"Processor Address : "}
                  data14_data={formData?.processorAddress}
                  data15_label={"Box ID : "}
                  data15_data={formData?.boxIds}
                  data16_label={"Price/Kg : "}
                  data16_data={formData?.price}
                  data17_label={"Invoice No :"}
                  data17_data={formData?.invoiceNo}
                  data18_label={"LR/BL No : "}
                  data18_data={formData?.billOfLadding}
                  data19_label={"Transporter Name : "}
                  data19_data={formData?.transporterName}
                  data20_label={"Vehicle No : "}
                  data20_data={formData?.vehicleNo}
                  data1_file_OR_txt_label={"Upload Quality Document : "}
                  data1_single_file={
                    formData?.qualityDoc ? [formData?.qualityDoc] : null
                  }
                  data2_file_OR_txt_label={"Upload TC`s : "}
                  data2_single_file={
                    formData?.tcFiles ? [formData?.tcFiles] : null
                  }
                  data3_file_OR_txt_label={"Contract Files : "}
                  data3_single_file={
                    formData?.contractFile ? [formData?.contractFile] : null
                  }
                  array_img_label={"Invoice Files :"}
                  array_img={formData?.invoiceFile}
                  array2_img_label={"Delivery Notes : "}
                  array2_img={
                    formData?.deliveryNotes
                      ? [formData?.deliveryNotes]
                      : null
                  }

                />
              </div>
              {isLoading ? <ModalLoader /> : null}
            </div>
          </div>
        </div>
      </>
    );
  }
}
