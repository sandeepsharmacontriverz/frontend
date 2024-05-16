"use client";

import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
import NavLink from "@components/core/nav-link";
import Loader from "@components/core/Loader";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";
import { PreView } from "@components/preview/PreView";
import moment from "moment";
import { FaPlus, FaMinus } from "react-icons/fa";
import ModalLoader from "@components/core/ModalLoader";

const initialWeightAndRoll = {
  weight: "",
  roll: "",
  originalSampleStatus: "",
};

export default function page() {
  useTitle("New Process");

  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const [from, setFrom] = useState<Date | null>(new Date());
  const [chooseYarn, setChooseYarn] = useState<any>([]);
  const [Access, setAccess] = useState<any>({});

  const [weftCottonmixType, setWeftCottonMixtype] = useState<any>("");
  const [weftCottonmixQty, setWeftCottonmixQty] = useState<any>();
  const [totalBlend, setTotalBlend] = useState<any>(0);

  const [cottonMix, setCottonMix] = useState<any>([]);

  const [weaverData, setWeaverData] = useState<any>({});
  const [program, setProgram] = useState([]);
  const [season, setSeason] = useState<any>();
  const [fabric, setFabric] = useState<any>();
  const [physicalTraceabilityPartners, setPhysicalTraceabilityPartners] =
    useState<Array<any>>([]);

  const [weavFabType, setWeavFabType] = useState<any>("");
  const [weavFabLength, setWeavFabLength] = useState<any>();
  const [weavGsm, setWeavGsm] = useState<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fabricData, setFabricData] = useState<any>([]);

  const [fileName, setFileName] = useState({
    blendInvoice: "",
    blendDocuments: [],
  });
  const [formData, setFormData] = useState<any>({
    date: new Date(),
    programId: null,
    seasonId: null,
    garmentOrderRef: "",
    brandOrderRef: "",
    yarnQty: 0,
    additionalYarnQty: 0,
    blendChoosen: null,
    cottonmixType: [],
    cottonmixQty: [],
    blendMaterial: "",
    blendVendor: "",
    totalYarnQty: null,
    fabricType: [],
    fabricLength: [],
    fabricGsm: [],
    batchLotNo: "",
    jobDetailsGarment: "",
    noOfRolls: "",
    // physicalTraceablity: false,
    totalFabricLength: 0,
    blendInvoice: null,
    blendDocuments: [],
    dyeingRequired: null,
    processName: "",
    reelLotNo: "",
    processorName: "",
    dyeingAddress: "",
    yarnDelivered: null,
    processLoss: null,
    processNetYarnQty: 0,
    enterPhysicalTraceability: "",
    dateSampleCollection: "",
    weightAndRoll: [JSON.parse(JSON.stringify(initialWeightAndRoll))],
    dataOfSampleDispatch: "",
    operatorName: "",
    expectedDateOfFabricSale: "",
    physicalTraceabilityPartnerId: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [showPreview, setShowPreview] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [weightAndRollErrors, setWeightAndRollErrors] = useState<Array<any>>([
    JSON.parse(JSON.stringify(initialWeightAndRoll)),
  ]);

  const weaverId = User.LabId;

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
      const access = checkAccess("Weaver Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (weaverId) {
      getWeaverData();
      getPrograms();
      getSeason();
      getFabricType();
      getCottonMix();

      setPhysicalTraceabilityPartners([]);
    }
  }, [weaverId]);

  useEffect(() => {
    if (weaverData.brand) {
      getPhysicalTraceabilityPartners();
    }
  }, [weaverData.brand]);

  useEffect(() => {
    if (formData.programId) {
      const foundProgram: any = program?.find(
        (program: any) => program.id == formData.programId
      );

      if (foundProgram && foundProgram?.program_name?.toLowerCase() === "reel") {
        getReelLotNo();
      } else {
        setFormData((prev: any) => ({
          ...prev,
          reelLotNo: "",
        }));
      }
    }
  }, [program, formData.programId]);

  useEffect(() => {
    const savedData: any = sessionStorage.getItem("savedData");
    const savedWeaver: any = sessionStorage.getItem("savedWeaver");

    const processData = JSON.parse(savedData);
    const cottonData = JSON.parse(savedWeaver);

    if (processData) {
      setFormData(processData);
    }

    setChooseYarn(cottonData);
  }, []);

  useEffect(() => {
    const sum: any = formData.cottonmixQty?.reduce(
      (accumulator: any, currentValue: any) => accumulator + currentValue,
      0
    );
    setTotalBlend(sum);
    const totalFabricLength: any = formData.fabricLength?.reduce(
      (accumulator: any, currentValue: any) => accumulator + currentValue,
      0
    );
    const totQtyWarn = chooseYarn?.map((item: any) =>
      item.type === "warp" ? item.qtyUsed : 0
    );
    const totSumtotQtyWarn: any = totQtyWarn?.reduce(
      (accumulator: any, currentValue: any) =>
        Number(accumulator) + Number(currentValue),
      0
    );

    const totQtyWeft = chooseYarn?.map((item: any) =>
      item.type === "weft" ? item.qtyUsed : 0
    );
    const totSumtotQtyWeft: any = totQtyWeft?.reduce(
      (accumulator: any, currentValue: any) =>
        Number(accumulator) + Number(currentValue),
      0
    );
    setFormData((prevData: any) => ({
      ...prevData,
      totalFabricLength: totalFabricLength,
      yarnQty: totSumtotQtyWarn || 0,
      additionalYarnQty: totSumtotQtyWeft || 0,
      totalYarnQty: (totSumtotQtyWarn || 0) + (totSumtotQtyWeft || 0) + sum,
      yarnDelivered: totalFabricLength ? totalFabricLength : 0,
      processNetYarnQty: formData.processLoss
        ? (
            totalFabricLength -
            totalFabricLength * (formData.processLoss / 100)
          ).toFixed(2)
        : totalFabricLength || 0,
    }));
  }, [
    chooseYarn,
    formData.cottonmixQty,
    formData.fabricLength,
    formData.processLoss,
    formData.fabricLength,
  ]);

  const getSeason = async () => {
    try {
      const res = await API.get(`season`);
      if (res.success) {
        setSeason(res.data?.slice(-3));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getReelLotNo = async () => {
    try {
      const res = await API.get(
        `weaver-process/get-reel-lot-no?weaverId=${weaverId}`
      );
      if (res.success) {
        setFormData((prevData: any) => ({
          ...prevData,
          reelLotNo: res.data?.reelLotNo,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFabricType = async () => {
    try {
      const res = await API.get(`fabric-type`);
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
        `weaver-process/get-program?weaverId=${weaverId}`
      );
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCottonMix = async () => {
    try {
      const res = await API.get(`cottonmix`);
      if (res.success) {
        setCottonMix(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getWeaverData = async () => {
    const url = `weaver/get-weaver?id=${weaverId}`;
    try {
      const response = await API.get(url);
      setWeaverData(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getPhysicalTraceabilityPartners = async () => {
    try {
      const res = await API.get(
        `physical-partner?brandId=${weaverData?.brand?.join(",") || ""}`
      );
      if (res.success) {
        setPhysicalTraceabilityPartners(res.data);
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

  const getChooseYarn = (type: string) => {
    if (formData.programId) {
      sessionStorage.setItem("savedData", JSON.stringify(formData));
      router.push(
        `/weaver/weaver-process/choose-yarn?id=${formData.programId}&type=${type}`
      );
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to choose yarn",
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
    if (name === "blendDocuments") {
      let filesLink: any = [...formData.blendDocuments];
      let filesName: any = [...fileName.blendDocuments];

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

  const handleAddMoreWeightAndRoll = () => {
    setFormData((prev: any) => ({
      ...prev,
      weightAndRoll: [
        ...prev.weightAndRoll,
        JSON.parse(JSON.stringify(initialWeightAndRoll)),
      ],
    }));
    setWeightAndRollErrors((prev: any) => [
      ...prev,
      JSON.parse(JSON.stringify(initialWeightAndRoll)),
    ]);
  };

  const handleDeleteWeightAndRoll = (index: number) => {
    const tempWeightAndRoll = [...formData.weightAndRoll];
    tempWeightAndRoll.splice(index, 1);
    setFormData((prev: any) => ({
      ...prev,
      weightAndRoll: tempWeightAndRoll,
    }));

    const tempWeightAndRollErrors = [...weightAndRollErrors];
    tempWeightAndRollErrors.splice(index, 1);
    setWeightAndRollErrors(tempWeightAndRollErrors);
  };

  const handleWeightAndRollChange = (
    key: string,
    value: any,
    index: number
  ) => {
    const tempWeightAndRoll = [...formData.weightAndRoll];
    tempWeightAndRoll[index][key] = value;
    setFormData((prev: any) => ({
      ...prev,
      weightAndRoll: tempWeightAndRoll,
    }));

    const tempWeightAndRollErrors = [...weightAndRollErrors];
    tempWeightAndRollErrors[index][key] = "";
    setWeightAndRollErrors(tempWeightAndRollErrors);
  };

  const handleChange = (name?: any, value?: any, event?: any) => {
    // const { name, value } = event.target;
    if (name === "transactionViaTrader") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    } else if (name == "dyeingRequired") {
      if (value == "yes") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: true,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: false,
          processName: "",
          processLoss: null,
          processNetYarnQty: null,
          processorName: "",
          dyeingAddress: "",
          yarnDelivered: null,
        }));
      }
    }
    // else if (name === "physicalTraceablity") {
    //   if (value == "yes") {
    //     setFormData((prevData: any) => ({
    //       ...prevData,
    //       [name]: true,
    //     }));
    //   } else {
    //     setFormData((prevData: any) => ({
    //       ...prevData,
    //       [name]: false,
    //     }));
    //   }
    // }
    else if (name === "buyerType") {
      setErrors((prev: any) => ({
        ...prev,
        buyerId: "",
        fabricId: "",
      }));
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    } else if (name === "blendChoosen") {
      if (value == "Yes") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: true,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: false,
          cottonmixType: [],
          cottonmixQty: [],
        }));
      }
    } else {
      if (name === "blendDocuments" || name === "blendInvoice") {
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

  const onBlur = (e: any, type: any) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;

    if (value != "" && type === "alphabets") {
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

    if (value != "" && type === "alphaNumeric") {
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

    if (value != "" && type == "percentage") {
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

    if (value != "" && type === "billNumbers") {
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
  };

  const addWeav = () => {
    if (
      Number(formData.totalYarnQty) === 0 ||
      formData.totalYarnQty === null ||
      formData.totalYarnQty === ""
    ) {
      setErrors((prevData: any) => ({
        ...prevData,
        fabricType: "Select Choose Yarn",
      }));
      return;
    }
    if (
      weavFabType?.value > 0 &&
      weavGsm?.length > 0 &&
      weavFabLength?.length > 0
    ) {
      const parsedGsm = weavGsm;
      const parsednetweight = Number(weavFabLength);

      const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
      const valid = regexAlphaNumeric.test(parsedGsm);
      if (
        formData.totalFabricLength > formData.totalYarnQty ||
        (formData.totalYarnQty > 0 &&
          formData.totalYarnQty - formData.totalFabricLength < parsednetweight)
      ) {
        setErrors((prevData: any) => ({
          ...prevData,
          fabricType:
            "Cannot Add Items.Total Fabric Net Weight cannot exceeds Total Yarn Utilized fabric.",
          fabricGsm: "",
          fabricLength: "",
        }));
      } else if (formData.fabricType?.includes(Number(weavFabType?.value))) {
        setErrors((prevData: any) => ({
          ...prevData,
          fabricType: "Already Exist",
        }));
      } else {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          fabricType: "",
          fabricGsm:
            parsedGsm?.length > 20
              ? "Value should not exceed 20 characters"
              : !valid
              ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
              : "",
          fabricLength:
            parsednetweight <= 0
              ? "Quantity must be greater than 0"
              : parsednetweight.toString().length > 10
              ? "Value should not exceed 10 characters"
              : "",
        }));

        if (
          parsedGsm.length < 20 &&
          valid &&
          parsednetweight > 0 &&
          parsednetweight.toString().length < 10
        ) {
          sessionStorage.setItem("savedData", JSON.stringify(formData));
          setFormData((prevData: any) => ({
            ...prevData,
            fabricType: [...prevData.fabricType, Number(weavFabType?.value)],
            fabricGsm: [...prevData.fabricGsm, parsedGsm],
            fabricLength: [...prevData.fabricLength, parsednetweight],
          }));

          const newFabData = {
            fabricType: Number(weavFabType?.value),
            fabricGsm: parsedGsm,
            fabricLength: Number(parsednetweight),
          };

          setFabricData((prevFabData: any) => [...prevFabData, newFabData]);

          setWeavFabType(null);
          setWeavGsm([]);
          setWeavFabLength([]);
        }
      }
    } else {
      setErrors((prevData: any) => ({
        ...prevData,
        fabricType:
          weavFabType?.length === 0 || weavFabType === undefined
            ? "Select knit Fabric is Required"
            : "",
        fabricLength:
          weavFabLength?.length === 0 || weavFabType === undefined
            ? "Fabric Net Length is Required"
            : "",
        fabricGsm:
          weavGsm?.length === 0 || weavFabType === undefined
            ? "This field is Required"
            : "",
      }));
    }
  };

  const removeWeav = (index: any) => {
    let fabricType = formData.fabricType;
    let fabricGsm = formData.fabricGsm;
    let fabricLength = formData.fabricLength;
    let arr1 = fabricType.filter((element: any, i: number) => index !== i);
    let arr2 = fabricGsm.filter((element: any, i: number) => index !== i);
    let arr3 = fabricLength.filter((element: any, i: number) => index !== i);

    const updatedFabricData = [...fabricData];
    updatedFabricData.splice(index, 1);
    setFabricData(updatedFabricData);

    setFormData((prevData: any) => ({
      ...prevData,
      fabricType: arr1,
      fabricGsm: arr2,
      fabricLength: arr3,
    }));
  };

  const removeImage = (index: any) => {
    let filename = fileName.blendDocuments;
    let fileLink = formData.blendDocuments;

    let arr1 = filename.filter((element: any, i: number) => index !== i);
    let arr2 = fileLink.filter((element: any, i: number) => index !== i);

    setFileName((prevData: any) => ({
      ...prevData,
      blendDocuments: arr1,
    }));
    setFormData((prevData: any) => ({
      ...prevData,
      blendDocuments: arr2,
    }));
  };

  const addBlend = () => {
    if (weftCottonmixQty?.length > 0 && weftCottonmixType?.value > 0) {
      if (formData.cottonmixType.includes(Number(weftCottonmixType?.value))) {
        setErrors((prevData: any) => ({
          ...prevData,
          cottonmixType: "Already Exist",
        }));
      } else {
        setErrors((prevData: any) => ({
          ...prevData,
          cottonmixType: "",
          cottonmixQty: "",
        }));
        sessionStorage.setItem("savedData", JSON.stringify(formData));
        setFormData((prevData: any) => ({
          ...prevData,
          cottonmixType: [
            ...prevData.cottonmixType,
            Number(weftCottonmixType?.value),
          ],
          cottonmixQty: [...prevData.cottonmixQty, Number(weftCottonmixQty)],
        }));
        setWeftCottonMixtype([]);
        setWeftCottonmixQty("");
      }
    } else {
      setErrors((prevData: any) => ({
        ...prevData,
        cottonmixType: "Select cotton Mix Quantity and Type",
      }));
    }
  };

  const removeBlend = (index: any) => {
    let blendType = formData.cottonmixType;
    let blendQty = formData.cottonmixQty;

    let arr1 = blendType.filter((element: any, i: number) => index !== i);
    let arr2 = blendQty.filter((element: any, i: number) => index !== i);

    setFormData((prevData: any) => ({
      ...prevData,
      cottonmixType: arr1,
      cottonmixQty: arr2,
    }));
  };

  const requiredSpinnerFields = [
    "seasonId",
    "date",
    "programId",
    "garmentOrderRef",
    "brandOrderRef",
    "blendMaterial",
    "blendVendor",
    "buyerType",
    "buyerId",
    "blendChoosen",
    "fabricId",
    "transactionViaTrader",
    "cottonmixType",
    "cottonmixQty",
    "baleIds",
    "fabricContruction",
    "fabricWeight",
    "fabricLength",
    "fabricType",
    "fabricGsm",
    "batchLotNo",
    "invoiceNo",
    "billOfLadding",
    "transporterName",
    "vehicleNo",
    "dyeingRequired",
    "jobDetailsGarment",
    "processName",
    "processorName",
    "dyeingAddress",
    "processLoss",
    // "physicalTraceablity",
    "noOfRolls",
    "dateSampleCollection",
    "weightAndRoll.weight",
    "weightAndRoll.roll",
    "weightAndRoll.originalSampleStatus",
    "dataOfSampleDispatch",
    "operatorName",
    "expectedDateOfFabricSale",
    "physicalTraceabilityPartnerId",
  ];

  const validateField = (name: string, value: any) => {
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;

    if (requiredSpinnerFields.includes(name)) {
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
        case "garmentOrderRef":
          return value === ""
            ? "Garment Order Reference No is Required"
            : regexAlphaNumeric.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
            : value.length > 50
            ? "Value should not exceed 50 characters"
            : "";
        case "blendMaterial":
          return formData.blendChoosen === true && value.trim() === ""
            ? "This Field is Required"
            : regexAlphabets.test(value) === false
            ? "Accepts only Alphabets and special characters like _,-,()"
            : "";
        case "blendVendor":
          return formData.blendChoosen === true && value.trim() === ""
            ? "This Field is Required"
            : regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "brandOrderRef":
          return value === ""
            ? "Brand Order Reference No is Required"
            : regexAlphaNumeric.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
            : value.length > 50
            ? "Value should not exceed 50 characters"
            : "";
        case "blendChoosen":
          return value?.length === 0 || value === null
            ? "Please select any one option"
            : "";
        // case "physicalTraceablity":
        //   return value?.length === 0 || value === null
        //     ? "Please select any one option"
        //     : "";
        case "batchLotNo":
          return value.trim() === ""
            ? "Batch/Lot No is required"
            : value.length > 20
            ? "Value should not exceed 20 characters"
            : regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "noOfRolls":
          return value?.trim() === "" || value.length === 0 || value === null
            ? "No. of Rolls is required"
            : Number(value) <= 0
            ? "Value Should be more than 0"
            : "";
        case "cottonmixType":
          return formData.blendChoosen === true &&
            (value?.length === 0 || value === null)
            ? "Blend Type is required"
            : "";
        case "cottonmixQty":
          return formData.blendChoosen === true &&
            (value?.length === 0 || value === null)
            ? "Blend Qunatity is required"
            : "";
        case "fabricType":
          return value?.length === 0 || value === null
            ? "Fabric Type is required"
            : "";
        case "fabricLength":
          return value?.length === 0 || value === null
            ? "Fabric length is required"
            : "";
        case "fabricGsm":
          return value?.length === 0 || value === null
            ? "Fabric GSM is required"
            : "";
        case "dyeingRequired":
          return value === null ? "Please select any one option" : "";
        case "processorName":
          return formData.dyeingRequired === true && value.trim() === ""
            ? "Processor name is Required"
            : value.length > 20
            ? "Value should not exceed 20 characters"
            : formData.dyeingRequired === true &&
              regexAlphabets.test(value) === false
            ? "Accepts only Alphabets and special characters like _,-,()"
            : "";
        case "processName":
          return formData.dyeingRequired === true && value.trim() === ""
            ? "Process name is Required"
            : value.length > 10
            ? "Value should not exceed 10 characters"
            : formData.dyeingRequired === true &&
              regexAlphabets.test(value) === false
            ? "Accepts only Alphabets and special characters like _,-,()"
            : "";
        case "dyeingAddress":
          return formData.dyeingRequired === true && value.trim() === ""
            ? "Address is Required"
            : value.length > 20
            ? "Value should not exceed 20 characters"
            : formData.dyeingRequired === true &&
              regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "processLoss":
          return formData.dyeingRequired === true && value === null
            ? "Process Loss is Required"
            : (formData.dyeingRequired === true &&
                value !== null &&
                Number(value) < 0) ||
              Number(value) > 100
            ? "Percentage value should be in between 0 and 100"
            : "";
        case "jobDetailsGarment":
          return regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";

        case "dateSampleCollection":
          return formData.enterPhysicalTraceability && !value
            ? "Date of sample collection is required"
            : "";
        case "weightAndRoll.weight":
          return formData.enterPhysicalTraceability && !value
            ? "Weight is required"
            : "";
        case "weightAndRoll.roll":
          return formData.enterPhysicalTraceability && !value
            ? "Roll is required"
            : "";
        case "weightAndRoll.originalSampleStatus":
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
        case "expectedDateOfFabricSale":
          return formData.enterPhysicalTraceability && !value
            ? "Expected date of fabric sale is required"
            : "";
        case "physicalTraceabilityPartnerId":
          return formData.enterPhysicalTraceability && !value
            ? "Physical Traceability Partner is required"
            : "";
        default:
          return "";
      }
    } else {
      return "";
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

    const hasWeaversErrors = Object.values(newSpinnerErrors).some(
      (error) => !!error
    );

    if (hasWeaversErrors) {
      setErrors(newSpinnerErrors);
    }
    if (!chooseYarn) {
      setErrors((prev: any) => ({
        ...prev,
        yarnQty: "Choose Yarn is Required",
      }));
      return;
    }

    if (!hasWeaversErrors) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const newSpinnerErrors: any = {};
    const newWeightAndRollErrors: any = [];

    Object.keys(formData).forEach((fieldName: string) => {
      newSpinnerErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any]
      );
    });

    if (formData.enterPhysicalTraceability) {
      formData.weightAndRoll.map((weightAndRoll: any, index: number) => {
        const weightAndRollErrors: any = {};
        Object.keys(weightAndRoll).forEach((fieldName: string) => {
          const fieldError = validateField(
            `weightAndRoll.${fieldName}`,
            weightAndRoll[fieldName as keyof any]
          );
          weightAndRollErrors[fieldName] = fieldError || "";
        });
        newWeightAndRollErrors[index] = weightAndRollErrors;
      });
    }

    const hasWeaversErrors = Object.values(newSpinnerErrors).some(
      (error) => !!error
    );

    const hasWeightAndRollErrors = newWeightAndRollErrors.some((errors: any) =>
      Object.values(errors).some((error) => error)
    );
    if (hasWeightAndRollErrors) {
      setWeightAndRollErrors(newWeightAndRollErrors);
    }

    if (hasWeaversErrors) {
      setErrors(newSpinnerErrors);
    }
    if (!chooseYarn) {
      setErrors((prev: any) => ({
        ...prev,
        yarnQty: "Choose Yarn is Required",
      }));
      return;
    }

    if (!hasWeaversErrors && !hasWeightAndRollErrors) {
      try {
        setIsLoading(true);
        setIsSubmitting(true);

        const response = await API.post("weaver-process/process", {
          ...formData,
          weaverId: weaverId,
          chooseYarn: chooseYarn,
          fabrics: fabricData,
          brandId: weaverData.brand[0],
          weaverShortname: weaverData.short_name,
        });

        if (response.success) {
          toasterSuccess("Process created successfully");
          router.push("/weaver/weaver-process");
          sessionStorage.removeItem("savedData");
          sessionStorage.removeItem("savedWeaver");
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

  if (roleLoading || isSubmitting) {
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
      <>
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li>
                    <NavLink href="/weaver/dashboard" className="active">
                      <span className="icon-home"></span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink href="/weaver/weaver-process" className="active">
                      Process
                    </NavLink>
                  </li>
                  <li>New Process</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4">
            <div className="w-100 mt-4">
              <div className="customFormSet">
                <div className="w-100">
                  <div className="row">
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
                    <div className="col-12 col-sm-6 mt-2">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={from}
                        dateFormat={"dd-MM-yyyy"}
                        maxDate={new Date()}
                        onChange={handleFrom}
                        showYearDropdown
                        placeholderText="From"
                        className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.date && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.date}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Garment Order Reference No{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="garmentOrderRef"
                        value={formData.garmentOrderRef || ""}
                        onChange={(e) =>
                          handleChange("garmentOrderRef", e.target.value)
                        }
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        type="text"
                        placeholder="Garment Order Reference"
                      />
                      {errors?.garmentOrderRef !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.garmentOrderRef}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Brand Order Reference No{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="brandOrderRef"
                        value={formData.brandOrderRef || ""}
                        onChange={(e) =>
                          handleChange("brandOrderRef", e.target.value)
                        }
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        type="text"
                        placeholder="Brand Order Reference"
                      />
                      {errors?.brandOrderRef !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.brandOrderRef}
                        </div>
                      )}
                    </div>

                    {!chooseYarn && (
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
                  </div>

                  <div className="row">
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Choose Yarn <span className="text-red-500">*</span>
                      </label>
                      <button
                        name="chooseYarn"
                        type="button"
                        onClick={() => getChooseYarn("warp")}
                        className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                      >
                        Choose Yarn
                      </button>
                      {errors?.yarnQty !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.yarnQty}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Quantity in kgs
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="yarnQty"
                        value={`${formData.yarnQty} Kgs` || `0 kgs`}
                        onChange={(event) => handleChange(event)}
                        type="text"
                        disabled
                      />
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Add Yarn <span className="text-red-500"></span>
                      </label>
                      <button
                        name="chooseYarn"
                        type="button"
                        onClick={() => getChooseYarn("weft")}
                        className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                      >
                        Add Yarn
                      </button>
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Additional Yarn Quantity(in kgs)
                      </label>
                      <input
                        type="text"
                        name="additionalYarnQty"
                        placeholder="Weft Yarn Qty"
                        disabled
                        value={`${formData.additionalYarnQty} Kgs` || `0 kgs`}
                        onChange={(event) => handleChange(event)}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {/* {errors?.additionalYarnQty !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.additionalYarnQty}
                      </div>
                    )} */}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Do you want to blend?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>
                            <input
                              type="radio"
                              name="blendChoosen"
                              checked={formData.blendChoosen === true}
                              onChange={(e) =>
                                handleChange("blendChoosen", e.target.value)
                              }
                              value="Yes"
                            />
                            <span></span>
                          </section>{" "}
                          Yes
                        </label>
                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>
                            <input
                              type="radio"
                              name="blendChoosen"
                              checked={formData.blendChoosen === false}
                              onChange={(e) =>
                                handleChange("blendChoosen", e.target.value)
                              }
                              value="No"
                            />
                            <span></span>
                          </section>{" "}
                          No
                        </label>
                      </div>
                      {errors?.blendChoosen !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.blendChoosen}
                        </div>
                      )}
                    </div>

                    {formData.blendChoosen === true && (
                      <>
                        <hr className="mt-4" />

                        <div className="col-12 col-sm-12 mt-4 py-2 ">
                          <h5 className="font-semibold">Blending</h5>
                          <div className="row">
                            <div className="col-12 col-sm-3 mt-4">
                              <label className="text-gray-500 text-[12px] font-medium">
                                Blend Type
                              </label>
                              {/* <Form.Select
                                aria-label="fabricType"
                                className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                                value={weftCottonmixType}
                                name="cottonmixType"
                                onChange={(e: any) =>
                                  setWeftCottonMixtype(e.target.value)
                                }
                              >
                                <option value="">Select</option>
                                {cottonMix?.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.cottonMix_name}
                                  </option>
                                ))}
                              </Form.Select> */}
                              <Select
                                value={weftCottonmixType}
                                name="cottonmixType"
                                menuShouldScrollIntoView={false}
                                isClearable
                                placeholder="Select"
                                className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                options={
                                  (cottonMix || []).map(
                                    ({ id, cottonMix_name }: any) => ({
                                      label: cottonMix_name,
                                      value: id,
                                      key: id,
                                    })
                                  ) as unknown as readonly (
                                    | string
                                    | GroupBase<string>
                                  )[]
                                }
                                onChange={(item: any) => {
                                  setWeftCottonMixtype(item);
                                }}
                              />
                              {errors?.cottonmixType !== "" && (
                                <div className="text-sm text-red-500">
                                  {errors.cottonmixType}
                                </div>
                              )}
                            </div>

                            <div className="col-12 col-sm-3 mt-4">
                              <label className="text-gray-500 text-[12px] font-medium">
                                Blend Quantity
                              </label>
                              <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                type="number"
                                placeholder="Blend Quantity"
                                onBlur={(e) => onBlur(e, "numbers")}
                                name="cottonmixQty"
                                value={weftCottonmixQty || ""}
                                onChange={(e: any) =>
                                  setWeftCottonmixQty(e.target.value)
                                }
                              />
                              {errors?.cottonmixQty !== "" && (
                                <div className="text-sm text-red-500">
                                  {errors.cottonmixQty}
                                </div>
                              )}
                            </div>
                            <div className="col-12 col-sm-3 mt-4">
                              <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                                <button
                                  className="btn-purple mr-2"
                                  onClick={() => addBlend()}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>

                          {formData?.cottonmixType?.length > 0 &&
                            formData?.cottonmixType.map(
                              (item: any, index: number) => {
                                return (
                                  <div className="row py-2" key={index}>
                                    <div className="col-12 col-sm-3">
                                      <input
                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                        type="text"
                                        value={
                                          (cottonMix &&
                                            cottonMix?.find(
                                              (yarn: any) => yarn.id === item
                                            )?.cottonMix_name) ||
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
                                        value={formData?.cottonmixQty[index]}
                                        onChange={handleChange}
                                        disabled
                                      />
                                    </div>
                                    <div className="col-12 col-sm-3 mt-2">
                                      <button
                                        onClick={() => removeBlend(index)}
                                        className="bg-red-500 text-sm rounded text-white px-2 py-1"
                                      >
                                        X
                                      </button>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          <div className="flex gap-3 mt-2 px-2 py-1">
                            <div className="flex w-1/2">
                              <div className="w-1/2 text-sm">Total:</div>
                              <div className="w-1/2 text-sm">{totalBlend}</div>
                            </div>
                          </div>
                          <hr className="mt-4" />
                        </div>

                        <div className="col-12 col-sm-6  mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Name of the Blending Material
                          </label>
                          <input
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            type="text"
                            onBlur={(e) => onBlur(e, "alphabets")}
                            placeholder="Name of the Blending Material"
                            name="blendMaterial"
                            value={formData.blendMaterial || ""}
                            onChange={(e) =>
                              handleChange("blendMaterial", e.target.value)
                            }
                          />
                          {errors?.blendMaterial && (
                            <div className="text-sm text-red-500">
                              {errors.blendMaterial}
                            </div>
                          )}
                        </div>

                        <div className="col-12 col-sm-6  mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Blending Material Vendor Details
                          </label>
                          <textarea
                            className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            rows={3}
                            placeholder="Blending Material Vendor Details"
                            onBlur={(e) => onBlur(e, "billNumbers")}
                            name="blendVendor"
                            value={formData.blendVendor || ""}
                            onChange={(e) =>
                              handleChange("blendVendor", e.target.value)
                            }
                          />
                          {errors?.blendVendor && (
                            <div className="text-sm text-red-500">
                              {errors.blendVendor}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Yarn and Blend material Utilized (Kgs)
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        disabled
                        placeholder="Total Yarn and Blend material Utilized (Kgs)"
                        name="totalYarnQty"
                        value={formData.totalYarnQty || ""}
                        onChange={(event) => handleChange(event)}
                      />
                    </div>

                    <hr className="mt-5" />
                    <div className="row py-4">
                      <div className="col-12 col-sm-3 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Weaver Fabric Type{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={weavFabType}
                          name="fabricType"
                          menuShouldScrollIntoView={false}
                          isClearable
                          placeholder="Select Fabric"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                          options={
                            (fabric || []).map(
                              ({ id, fabricType_name }: any) => ({
                                label: fabricType_name,
                                value: id,
                                key: id,
                              })
                            ) as unknown as readonly (
                              | string
                              | GroupBase<string>
                            )[]
                          }
                          onChange={(item: any) => {
                            setWeavFabType(item);
                          }}
                        />
                        {/*
                        <Form.Select
                          aria-label="fabricType"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                          name="fabricType"
                          value={weavFabType || ""}
                          onChange={(e: any) => setWeavFabType(e.target.value)}
                        >
                          <option value="">Select Fabric</option>
                          {fabric?.map((fabricType: any) => (
                            <option key={fabricType.id} value={fabricType.id}>
                              {fabricType.fabricType_name}
                            </option>
                          ))}
                        </Form.Select> */}
                        {errors?.fabricType && (
                          <div className="text-sm text-red-500">
                            {errors.fabricType}
                          </div>
                        )}
                      </div>

                      <div className="col-12 col-sm-3 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Finished Fabric Length in Mts
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="number"
                          placeholder="Fabric Length"
                          name="fabricLength"
                          value={weavFabLength || []}
                          onChange={(e: any) =>
                            setWeavFabLength(e.target.value)
                          }
                        />
                        {errors.fabricLength && (
                          <p className="text-red-500  text-sm mt-1">
                            {errors.fabricLength}
                          </p>
                        )}
                      </div>
                      <div className="col-12 col-sm-3 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Finished Fabric (GSM)
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="text"
                          placeholder="Gsm"
                          // onBlur={(e) => onBlur(e, 'billNumbers')}
                          name="fabricGsm"
                          value={weavGsm || []}
                          onChange={(e: any) => setWeavGsm(e.target.value)}
                        />
                        {errors.fabricGsm && (
                          <p className="text-red-500  text-sm mt-1">
                            {errors.fabricGsm}
                          </p>
                        )}
                      </div>

                      <div className="col-12 col-sm-3 mt-4">
                        <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                          <button
                            className="btn-purple mr-2"
                            onClick={() => addWeav()}
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {formData.fabricType?.length > 0 &&
                        formData.fabricType?.map((item: any, index: number) => {
                          return (
                            <div className="row py-2" key={index}>
                              <div className="col-12 col-sm-3 ">
                                <input
                                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                  type="text"
                                  value={
                                    (fabric &&
                                      fabric?.find(
                                        (fab: any) => fab.id === item
                                      )?.fabricType_name) ||
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
                                  value={formData?.fabricLength[index]}
                                  onChange={handleChange}
                                  disabled
                                />
                              </div>
                              <div className="col-12 col-sm-3">
                                <input
                                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                  type="text"
                                  value={formData?.fabricGsm[index]}
                                  onChange={handleChange}
                                  disabled
                                />
                              </div>
                              <div className="col-12 col-sm-3 mt-2">
                                <button
                                  name="multiYarn"
                                  type="button"
                                  onClick={() => removeWeav(index)}
                                  className="bg-red-500 text-sm rounded text-white px-2 py-1"
                                >
                                  X
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <hr className="mt-4" />

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Finished Fabric Length(in Mts)
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        disabled
                        placeholder="Total Finished Fabric Length"
                        name="totalFabricLength"
                        value={formData.totalFabricLength}
                        onChange={(event) => handleChange(event)}
                      />
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Finished Batch/Lot No{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        placeholder="Batch/Lot No"
                        name="batchLotNo"
                        onBlur={(e) => onBlur(e, "billNumbers")}
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
                        Fabric Reel Lot No
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        placeholder="Fabric Reel Lot No"
                        disabled
                        name="reelLotNo"
                        value={formData.reelLotNo || ""}
                        onChange={(e) =>
                          handleChange("reelLotNo", e.target.value)
                        }
                      />
                      {errors.reelLotNo && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.reelLotNo}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Job details from garment
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        onBlur={(e) => onBlur(e, "billNumbers")}
                        placeholder="Job details for Garment"
                        name="jobDetailsGarment"
                        value={formData.jobDetailsGarment}
                        onChange={(e) =>
                          handleChange("jobDetailsGarment", e.target.value)
                        }
                      />
                      {errors.jobDetailsGarment && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.jobDetailsGarment}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        No.of Rolls <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        onBlur={(e) => onBlur(e, "numbers")}
                        placeholder="No.of Rolls"
                        name="noOfRolls"
                        value={formData.noOfRolls}
                        onChange={(e) =>
                          handleChange("noOfRolls", e.target.value)
                        }
                      />
                      {errors.noOfRolls && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.noOfRolls}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">DOCUMENTS:</h4>
                  <div className="row">
                    {formData.blendChoosen && (
                      <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Upload Blending Invoice
                        </label>
                        <div className="inputFile">
                          <label>
                            Choose File <GrAttachment />
                            <input
                              name="blendInvoice"
                              type="file"
                              accept=".pdf,.zip, image/jpg, image/jpeg"
                              onChange={(e) =>
                                handleChange(
                                  "blendInvoice",
                                  e?.target?.files?.[0]
                                )
                              }
                            />
                          </label>
                        </div>
                        <p className="py-2 text-sm">
                          (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                        </p>
                        {fileName.blendInvoice && (
                          <div className="flex text-sm mt-1">
                            <GrAttachment />
                            <p className="mx-1">{fileName.blendInvoice}</p>
                          </div>
                        )}
                        {errors?.blendInvoice !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.blendInvoice}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Blending material other documents (Multi Upload)
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="blendDocuments"
                            type="file"
                            multiple
                            accept=".pdf,.zip, image/jpg, image/jpeg"
                            onChange={(e) =>
                              handleChange("blendDocuments", e?.target?.files)
                            }
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                      </p>
                      {errors?.blendDocuments !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.blendDocuments}
                        </div>
                      )}
                      {fileName.blendDocuments &&
                        fileName.blendDocuments.map((item: any, index: any) => (
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
                        ))}
                    </div>
                  </div>
                </div>

                <hr className="mt-4" />
                <div className="row">
                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Dyeing/Other Process Required?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name={`dyeingRequired`}
                            value="yes"
                            checked={formData.dyeingRequired === true}
                            onChange={(e) =>
                              handleChange("dyeingRequired", e.target.value)
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
                            name={`dyeingRequired`}
                            value="no"
                            checked={formData.dyeingRequired === false}
                            onChange={(e) =>
                              handleChange("dyeingRequired", e.target.value)
                            }
                          />
                          <span></span>
                        </section>{" "}
                        No
                      </label>
                    </div>
                    {errors?.dyeingRequired !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {errors?.dyeingRequired}
                      </div>
                    )}
                  </div>

                  {formData.dyeingRequired == true && (
                    <>
                      <hr className="mt-4" />
                      <div className="mt-4">
                        <h4 className="text-md font-semibold">
                          Dyeing/Other Process:
                        </h4>
                        <div className="row">
                          <div className="col-12 col-sm-6  mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Name of The Processor
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
                              Address<span className="text-red-500">*</span>
                            </label>

                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              type="text"
                              onBlur={(e) => onBlur(e, "billNumbers")}
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
                              Name Process
                              <span className="text-red-500">*</span>
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
                              value={formData.yarnDelivered || 0}
                              onChange={(e) =>
                                handleChange("yarnDelivered", e.target.value)
                              }
                              type="text"
                              disabled
                            />
                          </div>
                          <div className="col-12 col-sm-6  mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Process Loss (%) If Any?
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
                              value={formData.processNetYarnQty || 0}
                              onChange={(e) =>
                                handleChange(
                                  "processNetYarnQty",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Do you want to enter Physical Traceability?
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name={`physicalTraceablity`}
                            value="yes"
                            checked={formData.physicalTraceablity === true}
                            onChange={(e) => handleChange(e)}
                          />
                          <span></span>
                        </section>{" "}
                        Yes
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name={`physicalTraceablity`}
                            value="no"
                            checked={formData.physicalTraceablity === false}
                            onChange={(e) => handleChange(e)}
                          />
                          <span></span>
                        </section>{" "}
                        No
                      </label>
                    </div>
                    {errors?.physicalTraceablity !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.physicalTraceablity}
                      </div>
                    )}
                  </div> */}
                </div>

                <div className="borderFix pt-2 pb-3 mt-4">
                  <div className="row">
                    <div className="col-12 col-sm-6 mt-2">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Do you want to enter physical traceability details? *
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
                        Physical Traceability Process:
                      </h2>
                      <div className="row">
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

                        <div className="col-12 col-sm-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Expected date of fabric sale *
                          </label>
                          <DatePicker
                            name="expectedDateOfFabricSale"
                            selected={
                              formData.expectedDateOfFabricSale
                                ? new Date(formData.expectedDateOfFabricSale)
                                : null
                            }
                            onChange={(date) =>
                              handleChange("expectedDateOfFabricSale", date)
                            }
                            showYearDropdown
                            placeholderText="Select a date"
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errors.expectedDateOfFabricSale !== "" && (
                            <div className="text-sm text-red-500 ">
                              {errors.expectedDateOfFabricSale}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Weight and Roll Details *
                        </label>
                        {formData.weightAndRoll.map(
                          (element: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
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
                                    handleWeightAndRollChange(
                                      e.target.name,
                                      value,
                                      i
                                    );
                                  }}
                                />
                                {weightAndRollErrors[i]?.weight && (
                                  <div className="text-sm text-red-500">
                                    {weightAndRollErrors[i]?.weight || ""}
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow">
                                <input
                                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                  placeholder="Enter roll"
                                  name="roll"
                                  value={element.roll || ""}
                                  onChange={(e) => {
                                    let value: string | number = parseFloat(
                                      e.target.value
                                    );
                                    value = isNaN(value) ? "" : value;
                                    handleWeightAndRollChange(
                                      e.target.name,
                                      value,
                                      i
                                    );
                                  }}
                                />
                                {weightAndRollErrors[i]?.roll && (
                                  <div className="text-sm text-red-500">
                                    {weightAndRollErrors[i]?.roll || ""}
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
                                    handleWeightAndRollChange(
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
                                {weightAndRollErrors[i]
                                  ?.originalSampleStatus && (
                                  <div className="text-sm text-red-500 ">
                                    {weightAndRollErrors[i]
                                      ?.originalSampleStatus || ""}
                                  </div>
                                )}
                              </div>
                              <div>
                                {i === 0 ? (
                                  <button
                                    className="mt-1 p-2 rounded"
                                    onClick={handleAddMoreWeightAndRoll}
                                    style={{
                                      backgroundColor: "#E08E0B",
                                    }}
                                  >
                                    <FaPlus color="#fff" />
                                  </button>
                                ) : (
                                  <button
                                    className="mt-1 p-2 rounded"
                                    onClick={() => handleDeleteWeightAndRoll(i)}
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
                            Physical Traceability Partner *
                          </label>
                          <select
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            name="physicalTraceabilityPartnerId"
                            value={formData.physicalTraceabilityPartnerId || ""}
                            onChange={(e) =>
                              handleChange(
                                "physicalTraceabilityPartnerId",
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Select Physical Traceability Partner
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
                </div>

                <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                  <section>
                    <button
                      className="btn-purple mr-2"
                      disabled={isSubmitting}
                      style={
                        isSubmitting
                          ? { cursor: "not-allowed", opacity: 0.8 }
                          : { cursor: "pointer", backgroundColor: "#D15E9C" }
                      }
                      onClick={handleErrorCheck}
                    >
                      PREVIEW & SUBMIT
                    </button>
                    <button
                      className="btn-outline-purple"
                      onClick={() => {
                        router.push("/weaver/weaver-process");
                        sessionStorage.removeItem("savedData");
                        sessionStorage.removeItem("savedWeaver");
                      }}
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
                    onClick={handleSubmit}
                    //
                    data1_label={"Season : "}
                    data1={
                      formData?.seasonId
                        ? season?.find(
                            (seasonId: any) => seasonId.id === formData.seasonId
                          )?.name
                        : null
                    }
                    data2_label={"Date : "}
                    data2={moment(formData?.date).format("DD-MM-yyyy")}
                    data3_label={"Garment Order Reference No : "}
                    data3={formData?.garmentOrderRef}
                    data4_label={"Brand Order Reference No : "}
                    data4={formData?.brandOrderRef}
                    data5_label={"Quantity in kgs : "}
                    data5={formData?.yarnQty}
                    data6_label={"Additional Yarn Quantity(in kgs) : "}
                    data6={formData?.additionalYarnQty}
                    data7_label={"Total yarn Utilized(Kgs) : "}
                    data7={formData?.totalYarnQty}
                    data8_label={"Do you want to blend? :"}
                    data8={formData?.blendChoosen ? "Yes" : "No"}
                    data9_file_label={"Finished Batch/Lot No :"}
                    data9={formData?.batchlotno}
                    data10_label={"Fabric Reel Lot No : "}
                    data10_data={formData?.reelLotNo}
                    data11_label={"Job Details from garments : "}
                    data11_data={formData?.jobDetailsGarment}
                    data12_label={"No of Rolls : "}
                    data12_data={formData?.noOfRolls}
                    data13_label={"Dyeing/Other Process Required : "}
                    data13_data={formData?.dyeingRequired ? "Yes" : "No"}
                    // data3_array_label={"Blend Type : "}
                    // data3_array={formData.cottonmixType}
                    // data3_array_total_list={cottonMix}
                    // data2_array_single_map_label={"Blend Quantity : "}
                    // data2_array_single_map={formData?.cottonmixQty}
                    data14_label={"Name of the Blending Material : "}
                    data14_data={formData?.blendMaterial}
                    data15_label={"Blending Material Vendor Details : "}
                    data15_data={formData?.blendVendor}
                    data16_label={"Name of The Processor : "}
                    data16_data={formData?.processorName}
                    data17_label={"Dyeing Address :"}
                    data17_data={formData?.dyeingAddress}
                    data18_label={"Name Process : "}
                    data18_data={formData?.processName}
                    data19_label={"Qty of Yarn Delivered : "}
                    data19_data={formData?.yarnDelivered}
                    data20_label={"Process Loss (%) If Any : "}
                    data20_data={formData?.processLoss}
                    data21_label={"Net Yarn Qty : "}
                    data21_data={formData?.processNetYarnQty}
                    array_img_label={"DOCUMENTS : "}
                    array_img={formData?.blendDocuments}
                    // data1_array_total_list={yarnCount}
                    // data2_array_label={"Yarn Quantity Produced(Kgs) : "}
                    // data2_array={formData.yarnQtyProduced}
                    // data2_array_total_list={""}

                    //

                    //
                    //
                    //
                    //

                    // data2_file_OR_txt_label={"Rate (local currency) : "}
                    // data2_txt={formData?.Rate}
                    // data3_file_OR_txt_label={"Dispatch from : "}
                    // data3_txt={formData?.DispatchFrom}

                    data4_txt={formData?.fabricGsm}
                    //
                    //
                    //
                    //
                    //
                    data7_txt_label={
                      "Do you want to enter physical traceability details : "
                    }
                    data7_txt={
                      formData?.enterPhysicalTraceability ? "Yes" : "No"
                    }
                    data8_txt_label={"Date of sample collection : "}
                    data8_txt={
                      formData?.enterPhysicalTraceability
                        ? formData?.dateSampleCollection
                          ? moment(
                              new Date(formData?.dateSampleCollection)
                            ).format("MM/DD/YYYY")
                          : null
                        : null
                    }
                    data9_txt_label={"Expected date of fabric sale : "}
                    data9_txt={
                      formData?.enterPhysicalTraceability
                        ? formData?.expectedDateOfFabricSale
                          ? moment(
                              new Date(formData?.expectedDateOfFabricSale)
                            ).format("MM/DD/YYYY")
                          : null
                        : null
                    }
                    //
                    data7_array_single_table_show={
                      formData?.enterPhysicalTraceability
                        ? formData?.weightAndRoll[0]?.weight
                        : null
                    }
                    data7_array_single_map_label={"Weight and Roll Details : "}
                    data7_array_single_map={formData?.weightAndRoll}
                    data7_array_dynamicPropertyName1_label={"Weight"}
                    data7_array_dynamicPropertyName1={"weight"}
                    data7_array_dynamicPropertyName2_label={"Roll"}
                    data7_array_dynamicPropertyName2={"roll"}
                    data7_array_dynamicPropertyName3_label={
                      "Original Sample Status"
                    }
                    data7_array_dynamicPropertyName3={"originalSampleStatus"}
                    //
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
                    data12_txt_label={"Physical Traceability Partner : "}
                    data12_txt={
                      formData?.enterPhysicalTraceability
                        ? physicalTraceabilityPartners?.find(
                            (physicalTraceabilityPartner: any) =>
                              physicalTraceabilityPartner.id ==
                              formData.physicalTraceabilityPartnerId
                          )?.name
                        : null
                    }
                    //
                    //
                    //big table
                    show_big_table={
                      formData?.fabricLength?.length ? true : false
                    }
                    big_table1_title={""}
                    big_table1_option1_label={"Weaver Fabric Type"}
                    big_table1_option1_lists={formData?.fabricType}
                    big_table1_option1_lists_map={fabric}
                    big_table1_option1_dynamicProperty_name={"fabricType_name"}
                    big_table1_option2_label={"Finished Fabric Length in Mts"}
                    big_table1_option2_lists={formData?.fabricLength}
                    big_table1_option3_label={"Finished Fabric (GSM)"}
                    big_table1_option3_lists={formData?.fabricGsm}
                    //
                    //table 2
                    table_2_show={formData?.cottonmixQty?.length ? true : false}
                    table2_title={""}
                    table2_option1_label={"Blend Type"} // => first colunm
                    table2_option1_match_id={formData?.cottonmixType}
                    table2_option1_full_list={cottonMix}
                    table2_option1_dynamic_filed_name={"cottonMix_name"}
                    table2_option2_label={"Blend Quantity"} // => second colunm
                    table2_option2_show_arr_values={formData?.cottonmixQty}
                  />
                </div>
                {isLoading ? <ModalLoader /> : null}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
