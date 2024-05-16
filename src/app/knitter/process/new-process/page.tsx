"use client";

import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "@components/core/Loader";
import Link from "@components/core/nav-link";
import { GrAttachment } from "react-icons/gr";
import { toasterSuccess } from "@components/core/Toaster";
import User from "@lib/User";
import useTranslations from "@hooks/useTranslation";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";
import { PreView } from "@components/preview/PreView";
import moment from "moment";
import { FaPlus, FaMinus } from "react-icons/fa";
import ModalLoader from "@components/core/ModalLoader";

interface WeightAndRoll {
  weight: number | string;
  roll: number | string;
  originalSampleStatus: string;
}

interface FormData {
  knitterId: any;
  seasonId: any;
  date: string;
  programId: string | number | null;
  vendorDetails: any;
  blendMaterial: any;
  garmentOrder: any;
  // traceability?: any;
  quantChooseYarn: string;
  contractFile: string;
  processorName: string;
  processLoss: any;
  totalQty: string | null;
  agentDetails: string;
  fabricWeight: any;
  nameProcess: string;
  yarnDeliveryFinal: string;
  yarnDelivery1: string;
  address: string;
  blend: any;
  KnitFabric: any;
  jobDetailsGarment: string;
  dyeing: any;
  cottonmixType: any;
  cottonmixQty: any;
  knitWeight: any;
  fabricGsm: any;
  brandorderRef: any;
  reelLotNo: any;
  noroll: any;
  batchlotno: any;
  totalfabric: any;
  blendDocuments: any;
  blendInvoice: any;
  enterPhysicalTraceability: string | boolean;
  dateSampleCollection: string;
  weightAndRoll: Array<WeightAndRoll>;
  dataOfSampleDispatch: string;
  operatorName: string;
  expectedDateOfFabricSale: string;
  physicalTraceabilityPartnerId: string;
}

const initialWeightAndRoll: WeightAndRoll = {
  weight: "",
  roll: "",
  originalSampleStatus: "",
};

export default function page() {
  const { translations, loading } = useTranslations();
  useTitle(translations?.millInterface?.newProcess);

  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});

  const [knitterData, setKnitterData] = useState<any>({});
  const [from, setFrom] = useState<Date | null>(new Date());
  const [program, setProgram] = useState([]);
  const [season, setSeason] = useState<any>();
  const [cotton, setCotton] = useState<any>();

  const [cottonMixType, setCottonMixtype] = useState<any>([]);
  const [cottonMixQty, setCottonMixQty] = useState<any>([]);
  const [physicalTraceabilityPartners, setPhysicalTraceabilityPartners] =
    useState<Array<any>>([]);

  const [knitFabType, setKnitFabType] = useState<any>("");
  const [knitnetWeight, setKnitnetWight] = useState<any>("");
  const [knitGsm, setKnitGsm] = useState<any>("");

  const [showPreview, setShowPreview] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(false);

  const [fabric, setFabric] = useState<any>();
  const [chooseYarn, setchooseYarn] = useState<any>(0);
  const [yarnTotal, setYarnTotal] = useState<any>([]);
  const [yarnQty, setYarnQty] = useState<any>([]);
  const [totalFabric, setTotalFabric] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fileName, setFileName] = useState({
    blendDocuments: [],
    blendInvoice: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [weightAndRollErrors, setWeightAndRollErrors] = useState<Array<any>>([
    JSON.parse(JSON.stringify(initialWeightAndRoll)),
  ]);
  const [fabricData, setFabricData] = useState<any>([]);

  const [formData, setFormData] = useState<FormData>({
    knitterId: "",
    seasonId: null,
    date: new Date().toISOString(),
    programId: null,
    brandorderRef: "",
    blendMaterial: "",
    vendorDetails: "",
    garmentOrder: "",
    cottonmixType: [],
    cottonmixQty: [],
    // traceability: false,
    contractFile: "",
    quantChooseYarn: "",
    processorName: "",
    processLoss: "",
    totalQty: "",
    agentDetails: "",
    nameProcess: "",
    yarnDeliveryFinal: "",
    yarnDelivery1: "",
    address: "",
    blend: "",
    KnitFabric: [],
    knitWeight: [],
    fabricGsm: [],
    fabricWeight: [],
    reelLotNo: "",
    dyeing: "",
    jobDetailsGarment: "",
    noroll: "",
    batchlotno: "",
    totalfabric: "",
    blendDocuments: [],
    blendInvoice: null,
    enterPhysicalTraceability: "",
    dateSampleCollection: "",
    weightAndRoll: [JSON.parse(JSON.stringify(initialWeightAndRoll))],
    dataOfSampleDispatch: "",
    operatorName: "",
    expectedDateOfFabricSale: "",
    physicalTraceabilityPartnerId: "",
  });

  const [chooseyarnData, setchooseyarnData] = useState({
    id: "",
    qtyUsed: "",
    totalQty: "",
  });

  const knitterId = User.ThirdPartyInspectionId;

  let quant: any[] | undefined = formData.cottonmixQty;
  let total = quant?.reduce((acc: any, curr: any) => +acc + +curr, 0);

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Knitter")) {
      const access = checkAccess("Knitter Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (formData.blend === true) {
      setYarnQty(
        Number(
          total
            ? Number(total) + Number(chooseYarn) + Number(yarnTotal)
            : Number(total) + Number(chooseYarn) + Number(yarnTotal)
        )
      );
    } else {
      setYarnQty(Number(Number(chooseYarn) + Number(yarnTotal)));
    }
  }, [formData.blend, total, chooseYarn, yarnTotal]);

  const totalfabric = formData.knitWeight?.reduce(
    (acc: any, curr: any) => +acc + +curr,
    0
  );

  useEffect(() => {
    setTotalFabric(totalfabric);
  }, [formData.knitWeight]);

  useEffect(() => {
    const savedData: any = sessionStorage.getItem("knitterProcess");
    const processData = JSON.parse(savedData);
    if (processData) {
      setFormData(processData);
    }
  }, []);

  useEffect(() => {
    const storedTotal = sessionStorage.getItem("selectedProcess");
    if (storedTotal !== null && storedTotal !== undefined) {
      const parsedTotal = JSON.parse(storedTotal);
      setchooseyarnData(parsedTotal);

      if (parsedTotal && parsedTotal?.length > 0) {
        const chooseYarnItems = parsedTotal.filter(
          (item: any) => item.type === "chooseyarn"
        );
        const chooseAddItems = parsedTotal.filter(
          (item: any) => item.type === "addyarn"
        );

        const chooseyarndata = chooseYarnItems.map((item: any) => item.qtyUsed);
        const totalChooseYarn = chooseyarndata.reduce(
          (acc: any, curr: any) => +acc + +curr,
          0
        );
        setchooseYarn(totalChooseYarn);
        const addyarndata = chooseAddItems.map((item: any) => item.qtyUsed);
        const totalAddYarn = addyarndata.reduce(
          (acc: any, curr: any) => +acc + +curr,
          0
        );
        setYarnTotal(totalAddYarn);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.programId) {
      const foundProgram: any = program?.find(
        (program: any) => program.id == formData.programId
      );
      if (foundProgram && foundProgram.program_name?.toLowerCase() === "reel") {
        getReellotno();
      } else {
        setFormData((prev: any) => ({
          ...prev,
          reelLotNo: "",
        }));
      }
    }
  }, [program, formData.programId]);

  useEffect(() => {
    if (knitterId) {
      getKnitterData();
      getPrograms();
      getSeason();
      getCottonMix();
      getKnitFabric();

      setPhysicalTraceabilityPartners([]);
    }
  }, [knitterId]);

  useEffect(() => {
    if (knitterData.brand) {
      getPhysicalTraceabilityPartners();
    }
  }, [knitterData.brand]);

  const getKnitterData = async () => {
    const url = `knitter/get-knitter?id=${knitterId}`;
    try {
      const response = await API.get(url);
      setKnitterData(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getPhysicalTraceabilityPartners = async () => {
    try {
      const res = await API.get(
        `physical-partner?brandId=${knitterData?.brand?.join(",") || ""}`
      );
      if (res.success) {
        setPhysicalTraceabilityPartners(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getReellotno = async () => {
    try {
      const res = await API.get(
        `knitter-process/get-reel-lot-no?knitterId=${knitterId}`
      );
      if (res.success) {
        setFormData((prev: any) => ({
          ...prev,
          reelLotNo: res.data.reelLotNo,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSeason = async () => {
    try {
      const res = await API.get("season");
      if (res.success) {
        setSeason(res.data?.slice(-3));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCottonMix = async () => {
    try {
      const res = await API.get("cottonmix");
      if (res.success) {
        setCotton(res.data);
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
        `knitter-process/get-program?knitterId=${knitterId}`
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

  const getChooseYarn = (type: string) => {
    if (formData.programId) {
      sessionStorage.setItem("knitterProcess", JSON.stringify(formData));
      router.push(
        `/knitter/process/choose-yarn?id=${formData.programId}&type=${type}`
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

  const addBlend = () => {
    if (cottonMixQty?.length > 0 && cottonMixType?.value > 0) {
      const parsedQty = Number(cottonMixQty);

      if (formData.cottonmixType?.includes(Number(cottonMixType?.value))) {
        setErrors((prevData: any) => ({
          ...prevData,
          cottonmixType: "Already Exist",
          cottonmixQty: parsedQty <= 0 ? "Value Should be more than 0" : "",
        }));
      } else {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          cottonmixType: "",
          cottonmixQty: parsedQty <= 0 ? "Value Should be more than 0" : "",
        }));

        if (parsedQty > 0) {
          sessionStorage.setItem("knitterProcess", JSON.stringify(formData));
          setFormData((prevData: any) => ({
            ...prevData,
            cottonmixType: [
              ...(prevData.cottonmixType || []),
              Number(cottonMixType?.value),
            ],
            cottonmixQty: [...(prevData.cottonmixQty || []), parsedQty],
          }));

          setCottonMixtype([]);
          setCottonMixQty([]);
        }
      }
    } else {
      setErrors((prevData: any) => ({
        ...prevData,
        cottonmixType: cottonMixType === 0 ? "Select Cotton is Required" : "",
        cottonmixQty:
          cottonMixQty?.length === 0 ? "Select Quantity is Required" : "",
      }));
    }
  };

  const addknit = () => {
    if (Number(yarnQty) === 0 || yarnQty === null || yarnQty === "") {
      setErrors((prevData: any) => ({
        ...prevData,
        KnitFabric: "Select Choose Yarn",
      }));
      return;
    }
    if (
      knitFabType?.value > 0 &&
      knitGsm?.length > 0 &&
      knitnetWeight?.length > 0
    ) {
      const parsedGsm = knitGsm;
      const parsednetweight = Number(knitnetWeight);
      const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
      const valid = regexAlphaNumeric.test(parsedGsm);

      if (
        totalFabric > yarnQty ||
        (yarnQty > 0 && yarnQty - totalFabric < parsednetweight)
      ) {
        setErrors((prevData: any) => ({
          ...prevData,
          KnitFabric:
            "Cannot Add more Items.Total Fabric Net Weight cannot exceeds Total Yarn Utilized fabric.",
          fabricGsm: "",
          knitWeight: "",
        }));
      } else if (formData.KnitFabric?.includes(Number(knitFabType?.value))) {
        setErrors((prevData: any) => ({
          ...prevData,
          KnitFabric: "Already Exist",
        }));
      } else {
        setErrors((prevErrors: any) => ({
          ...prevErrors,
          KnitFabric: "",
          fabricGsm:
            parsedGsm?.length > 20
              ? "Value should not exceed 20 characters"
              : !valid
              ? "Accepts only AlphaNumeric values and special characters like comma(,),.,_,-,()"
              : "",
          knitWeight:
            parsednetweight <= 0
              ? "Quantity must be greater than 0"
              : parsednetweight.toString()?.length > 10
              ? "Value should not exceed 10 characters"
              : "",
        }));

        if (
          parsedGsm?.length < 20 &&
          valid &&
          parsednetweight > 0 &&
          parsednetweight.toString()?.length < 10
        ) {
          sessionStorage.setItem("knitterProcess", JSON.stringify(formData));
          setFormData((prevData: any) => ({
            ...prevData,
            KnitFabric: [
              ...(prevData.KnitFabric || []),
              Number(knitFabType?.value),
            ],
            fabricGsm: [...(prevData.fabricGsm || []), knitGsm],
            knitWeight: [...(prevData.knitWeight || []), parsednetweight],
          }));

          const newFabData = {
            fabricType: Number(knitFabType?.value),
            fabricGsm: knitGsm,
            fabricWeight: Number(parsednetweight),
          };

          setFabricData((prevFabData: any) => [...prevFabData, newFabData]);

          setKnitFabType(null);
          setKnitGsm([]);
          setKnitnetWight([]);
        }
      }
    } else {
      setErrors((prevData: any) => ({
        ...prevData,
        KnitFabric: knitFabType === 0 ? "Select knit Fabric is Required" : "",
        knitWeight:
          knitnetWeight?.length === 0 ? "Fabric Net Weight is Required" : "",
        fabricGsm: knitGsm?.length === 0 ? "Fabric Gsm is Required" : "",
      }));
    }
  };

  const removeKnit = (index: any) => {
    let knitfabric = formData.KnitFabric;
    let fabricGsm = formData.fabricGsm;
    let knitweight = formData.knitWeight;
    let arr1 = knitfabric.filter((element: any, i: number) => index !== i);
    let arr2 = fabricGsm.filter((element: any, i: number) => index !== i);
    let arr3 = knitweight.filter((element: any, i: number) => index !== i);

    const updatedFabricData = [...fabricData];
    updatedFabricData.splice(index, 1);
    setFabricData(updatedFabricData);

    setFormData((prevData: any) => ({
      ...prevData,
      KnitFabric: arr1,
      fabricGsm: arr2,
      knitWeight: arr3,
    }));
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

  const calculateFinishedWeight = () => {
    const initialWeight = totalFabric;
    const processLossPercentage = formData.processLoss;

    if (processLossPercentage >= 0 && processLossPercentage <= 100) {
      const lossAmount = (initialWeight * processLossPercentage) / 100;
      const finishedWeight = initialWeight - lossAmount;
      return finishedWeight;
    }
    return 0;
  };

  const finishedWeight = calculateFinishedWeight();

  const handleChange = (name?: any, value?: any, event?: any) => {
    if (name === "processLoss") {
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
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
        }));
      }
      return;
    }
    if (name === "programId") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }

    if (name === "blend" || name === "dyeing") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: value === "Yes" ? true : false,
      }));
    }
    // else if (name === "traceability") {
    //   setFormData((prevData: any) => ({
    //     ...prevData,
    //     traceability: value === "Yes" ? true : false,
    //   }));
    // }
    else {
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
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
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
      if (value != "") {
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
    const tempWeightAndRoll: Array<WeightAndRoll> = [...formData.weightAndRoll];
    tempWeightAndRoll[index][key as keyof WeightAndRoll] = value;
    setFormData((prev: any) => ({
      ...prev,
      weightAndRoll: tempWeightAndRoll,
    }));

    const tempWeightAndRollErrors = [...weightAndRollErrors];
    tempWeightAndRollErrors[index][key] = "";
    setWeightAndRollErrors(tempWeightAndRollErrors);
  };

  const validateForm = () => {
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const newErrors = {} as Partial<FormData>;
    const newWeightAndRollErrors: any = [];

    if (!formData.seasonId || formData.seasonId === undefined) {
      newErrors.seasonId = "Season is Required";
    }
    if (!formData.programId) {
      newErrors.programId = "Select Program is Required";
    }
    if (!formData.garmentOrder) {
      newErrors.garmentOrder = "Garment Order Reference No is Required";
    }
    if (formData.garmentOrder) {
      if (regexAlphaNumeric.test(formData.garmentOrder) === false) {
        newErrors.garmentOrder =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
      if (formData.garmentOrder && errors.garmentOrder) {
        newErrors.garmentOrder = errors.garmentOrder;
      }
    }
    if (formData.garmentOrder && formData.garmentOrder.length > 50) {
      newErrors.garmentOrder = " Value should not exceed 50 characters";
    }
    if (!formData.brandorderRef) {
      newErrors.brandorderRef = "brand Order Reference No is Required";
    }
    if (formData.brandorderRef) {
      if (regexAlphaNumeric.test(formData.brandorderRef) === false) {
        newErrors.brandorderRef =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
      if (formData.brandorderRef && errors.brandorderRef) {
        newErrors.brandorderRef = errors.brandorderRef;
      }
    }
    if (formData.brandorderRef && formData.brandorderRef.length > 50) {
      newErrors.brandorderRef = " Value should not exceed 50 characters";
    }
    if (formData.blend === "") {
      newErrors.blend = "Select Blend is Required";
    } else {
      delete newErrors.blend;
    }
    if (formData.blend === true && formData.cottonmixType?.length === 0) {
      newErrors.cottonmixType = "Select Cotton is Required";
    }
    if (formData.blend === true && formData.cottonmixQty?.length === 0) {
      newErrors.cottonmixQty = "Select Quantity is Required";
    }
    if (!formData.batchlotno) {
      newErrors.batchlotno = "Batch Lot No is Required";
    }
    if (formData.batchlotno) {
      if (regexAlphaNumeric.test(formData.batchlotno) === false) {
        newErrors.batchlotno =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
      if (formData.batchlotno && errors.batchlotno) {
        newErrors.batchlotno = errors.batchlotno;
      }
    }
    if (formData.KnitFabric?.length === 0) {
      newErrors.KnitFabric = "Select knit Fabric is Required";
    }
    if (formData.knitWeight?.length === 0) {
      newErrors.knitWeight = "Fabric Net Weight is Required";
    } else if (knitnetWeight?.length > 20) {
      newErrors.knitWeight = "Value should not exceed 20 characters";
    }
    if (formData.fabricGsm?.length === 0) {
      newErrors.fabricGsm = "Fabric Gsm is Required";
    } else if (knitGsm?.length > 20) {
      newErrors.fabricGsm = "Value should not exceed 20 characters";
    }
    if (formData.blend === true && !formData.blendMaterial) {
      newErrors.blendMaterial = "This Field is Required";
    }
    if (formData.blendMaterial) {
      if (regexAlphaNumeric.test(formData.blendMaterial) === false) {
        newErrors.blendMaterial =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
      if (formData.blendMaterial && errors.blendMaterial) {
        newErrors.blendMaterial = errors.blendMaterial;
      }
    }
    if (formData.vendorDetails) {
      if (regexAlphaNumeric.test(formData.vendorDetails) === false) {
        newErrors.vendorDetails =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
      if (formData.vendorDetails && errors.vendorDetails) {
        newErrors.vendorDetails = errors.vendorDetails;
      }
    }
    if (formData.blend === true && !formData.vendorDetails) {
      newErrors.vendorDetails = "This Field is Required";
    }
    if (formData.jobDetailsGarment && errors.jobDetailsGarment) {
      newErrors.jobDetailsGarment = errors.jobDetailsGarment;
    }
    if (formData.jobDetailsGarment) {
      if (regexAlphaNumeric.test(formData.jobDetailsGarment) === false) {
        newErrors.jobDetailsGarment =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
      if (formData.jobDetailsGarment && errors.jobDetailsGarment) {
        newErrors.jobDetailsGarment = errors.jobDetailsGarment;
      }
    }
    if (formData.dyeing === "") {
      newErrors.dyeing = "Select Dyeing/Other Process is Required";
    }
    if (formData.dyeing === true) {
      if (!formData.processorName) {
        newErrors.processorName = "Processor Name is Required";
      } else if (formData.processorName?.length > 20) {
        newErrors.processorName = "Value should not exceed 20 characters";
      }
    }
    if (formData.dyeing === true) {
      if (regexAlphabets.test(formData.processorName) === false) {
        newErrors.processorName =
          "Accepts only Alphabets and special characters like comma(,),_,-,(),.";
      }
      if (
        formData.dyeing === true &&
        formData.processorName &&
        errors.processorName
      ) {
        newErrors.processorName = errors.processorName;
      }
    }
    if (formData.dyeing === true) {
      if (!formData.address) {
        newErrors.address = "Address  is Required";
      } else if (formData.address?.length > 20) {
        newErrors.address = "Value should not exceed 20 characters";
      }
    }
    if (formData.dyeing === true) {
      if (regexAlphaNumeric.test(formData.address) === false) {
        newErrors.address =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
      if (formData.dyeing === true && formData.address && errors.address) {
        newErrors.address = errors.address;
      }
    }
    if (formData.dyeing === true) {
      if (!formData.nameProcess) {
        newErrors.nameProcess = "Processor Name  is Required";
      } else if (formData.nameProcess?.length >= 10) {
        newErrors.nameProcess = "Value should not exceed 10 characters";
      }
    }
    if (formData.dyeing === true) {
      if (regexAlphabets.test(formData.nameProcess) === false) {
        newErrors.nameProcess =
          "Accepts only Alphabets and special characters like comma(,),_,-,(),.";
      }
      if (
        formData.dyeing === true &&
        formData.nameProcess &&
        errors.nameProcess
      ) {
        newErrors.nameProcess = errors.nameProcess;
      }
    }
    if (formData.dyeing === true && !formData.processLoss) {
      newErrors.processLoss = "Process Loss  is Required";
    } else if (
      formData.dyeing &&
      (formData.processLoss < 0 || formData.processLoss > 100)
    ) {
      newErrors.processLoss = "Process Loss should be between 0 and 100";
    }
    if (chooseYarn === 0) {
      newErrors.quantChooseYarn = "Select Choose Yarn is Required";
    }
    if (!formData.noroll) {
      newErrors.noroll = "No of Roll is Required";
    }

    if (formData.enterPhysicalTraceability) {
      if (!formData.dateSampleCollection) {
        newErrors.dateSampleCollection =
          "Date of sample collection is required";
      }
      if (
        !formData.dataOfSampleDispatch ||
        formData.dataOfSampleDispatch.trim() === ""
      ) {
        newErrors.dataOfSampleDispatch = "Data of sample dispatch is required";
      }
      if (!formData.operatorName || formData.operatorName.trim() === "") {
        newErrors.operatorName = "Operator name is required";
      }
      if (!formData.expectedDateOfFabricSale) {
        newErrors.expectedDateOfFabricSale =
          "Expected date of fabric sale is required";
      }
      if (!formData.physicalTraceabilityPartnerId) {
        newErrors.physicalTraceabilityPartnerId =
          "Physical Traceability Partner is required";
      }

      formData.weightAndRoll.map((weightAndRoll: any, index: number) => {
        const weightAndRollErrors: any = {};
        if (!weightAndRoll.weight) {
          weightAndRollErrors.weight = "Weight is required";
        }
        if (!weightAndRoll.roll) {
          weightAndRollErrors.roll = "Roll is required";
        }
        if (!weightAndRoll.originalSampleStatus) {
          weightAndRollErrors.originalSampleStatus =
            "Original sample status is required";
        }
        newWeightAndRollErrors[index] = weightAndRollErrors;
      });
    }

    setErrors(newErrors);
    setWeightAndRollErrors(newWeightAndRollErrors);
    return (
      Object.keys(newErrors)?.length === 0 &&
      !newWeightAndRollErrors.some((errors: any) =>
        Object.values(errors).some((error) => error)
      )
    );
  };

  const handleErrorCheck = async (event: any) => {
    event.preventDefault();
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      setIsLoading(true);
      const url = "knitter-process/process";
      const mainFormData = {
        knitterId: knitterId,
        date: formData.date,
        programId: Number(formData.programId),
        seasonId: Number(formData.seasonId),
        garmentOrderRef: formData.garmentOrder,
        brandOrderRef: formData.brandorderRef,
        yarnQty: chooseYarn,
        additionalYarnQty: yarnTotal,
        blendChoosen: formData.blend,
        cottonmixType: formData.cottonmixType,
        cottonmixQty: formData.cottonmixQty,
        blendMaterial: formData.blendMaterial,
        blendVendor: formData.vendorDetails,
        totalYarnQty: yarnQty,
        fabricType: formData.KnitFabric,
        fabricGsm: formData.fabricGsm,
        fabricWeight: formData.knitWeight,
        batchLotNo: formData.batchlotno,
        jobDetailsGarment: formData.jobDetailsGarment,
        noOfRolls: Number(formData.noroll),
        // physicalTraceablity: formData.traceability,
        totalFabricWeight: totalFabric,
        blendInvoice: formData.blendInvoice,
        blendDocuments: formData.blendDocuments,
        dyeingRequired: formData.dyeing,
        processName: formData.nameProcess,
        processorName: formData.processorName,
        dyeingAddress: formData.address,
        yarnDelivered: totalFabric,
        processLoss: Number(formData.processLoss),
        processNetYarnQty: finishedWeight,
        chooseYarn: chooseyarnData,
        reelLotNo: formData.reelLotNo,
        fabrics: fabricData,
        enterPhysicalTraceability: formData.enterPhysicalTraceability,
        dateSampleCollection: formData.dateSampleCollection,
        weightAndRoll: formData.weightAndRoll,
        dataOfSampleDispatch: formData.dataOfSampleDispatch,
        operatorName: formData.operatorName,
        expectedDateOfFabricSale: formData.expectedDateOfFabricSale,
        physicalTraceabilityPartnerId: formData.physicalTraceabilityPartnerId,
        brandId: knitterData.brand[0],
        knitterShortname: knitterData.short_name,
      };

      const mainResponse = await API.post(url, mainFormData);

      if (mainResponse.success) {
        toasterSuccess(
          "Process created successfully",
          3000,
          mainFormData.knitterId
        );
        setIsSubmitting(false);
        setIsLoading(false);
        router.push("/knitter/process");
        sessionStorage.removeItem("knitterProcess");
        sessionStorage.removeItem("selectedProcess");
      }
    } else {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  if (loading || roleLoading || isSubmitting) {
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
      <>
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li>
                    <Link href="/knitter/dashboard" className="active">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/knitter/process">
                      {translations?.knitterInterface?.Process}
                    </Link>
                  </li>
                  <li>
                    <Link href="/knitter/process/new-process">
                      {translations?.millInterface?.newProcess}{" "}
                    </Link>
                  </li>
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
                    <div className=" col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.transactions?.date}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={from}
                        dateFormat={"dd-MM-yyyy"}
                        onChange={handleFrom}
                        maxDate={new Date()}
                        showYearDropdown
                        className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.date && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.date}
                        </p>
                      )}
                    </div>
                    <div className=" col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.GarmentOrderReference}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="garmentOrder"
                        value={formData.garmentOrder || ""}
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        onChange={(e) =>
                          handleChange("garmentOrder", e.target.value)
                        }
                        placeholder={
                          translations?.knitterInterface?.GarmentOrderReference
                        }
                      />
                      {errors?.garmentOrder !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.garmentOrder}
                        </div>
                      )}
                    </div>
                    <div className=" col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.BrandOrderReference}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="brandorderRef"
                        value={formData.brandorderRef || ""}
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        onChange={(e) =>
                          handleChange("brandorderRef", e.target.value)
                        }
                        placeholder={
                          translations?.knitterInterface?.BrandOrderReference
                        }
                      />
                      {errors?.brandorderRef !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.brandorderRef}
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
                    <div className="col-12  col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.ChooseYarn}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <button
                        name="chooseYarn"
                        type="button"
                        onClick={() => getChooseYarn("chooseyarn")}
                        className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                      >
                        {translations?.knitterInterface?.ChooseYarn}
                      </button>
                      {errors?.quantChooseYarn && (
                        <div className="text-sm text-red-500">
                          {errors.quantChooseYarn}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.Quantity}
                      </label>
                      <input
                        name="quantChooseYarn"
                        value={+chooseYarn + " Kgs"}
                        onChange={(event) => handleChange(event)}
                        type="text"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        readOnly
                      />
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.AddYarn}
                      </label>
                      <button
                        name="addYarn"
                        type="button"
                        onClick={() => getChooseYarn("addyarn")}
                        className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                      >
                        {translations?.knitterInterface?.AddYarn}
                      </button>
                    </div>
                    <div className=" col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.AdditionalYarn}
                      </label>
                      <input
                        name="yarnQuantity"
                        value={+yarnTotal + " Kgs"}
                        onChange={(event) => handleChange(event)}
                        type="text"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className=" col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.wantblend}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>
                            <input
                              type="radio"
                              name="blend"
                              checked={formData.blend === true}
                              onChange={(e) =>
                                handleChange("blend", e.target.value)
                              }
                              value="Yes"
                              className="form-radio"
                            />
                            <span></span>
                          </section>
                          Yes
                        </label>
                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>
                            <input
                              type="radio"
                              name="blend"
                              checked={formData.blend === false}
                              onChange={(e) =>
                                handleChange("blend", e.target.value)
                              }
                              value="No"
                              className="form-radio"
                            />
                            <span></span>
                          </section>
                          No
                        </label>
                      </div>
                      {errors?.blend !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.blend}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.TotalUtil}
                      </label>
                      <input
                        name="totalQty"
                        value={yarnQty + " Kgs"}
                        onChange={(event) => handleChange(event)}
                        type="text"
                        placeholder="totalQty"
                        readOnly
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                    </div>
                  </div>

                  {formData.blend === true && (
                    <>
                      <hr className="mt-4" />

                      <div className="col-12 col-sm-12 mt-4 py-2 ">
                        <h5 className="font-semibold">
                          {translations?.knitterInterface?.Blending}
                        </h5>
                        <div className="row">
                          <div className="col-12 col-sm-3 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.knitterInterface?.cotton}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Select
                              value={cottonMixType}
                              name="cottonmixType"
                              menuShouldScrollIntoView={false}
                              isClearable
                              placeholder="Select Cotton"
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                              options={
                                (cotton || []).map(
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
                              onChange={(item: any) => setCottonMixtype(item)}
                            />
                            {errors?.cottonmixType && (
                              <div className="text-sm text-red-500">
                                {errors.cottonmixType}
                              </div>
                            )}
                          </div>

                          <div className="col-12 col-sm-3 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.knitterInterface?.quantity}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              name="cottonMixQty"
                              value={cottonMixQty || ""}
                              onBlur={(e) => onBlur(e, "bill")}
                              onChange={(e: any) =>
                                setCottonMixQty(e.target.value)
                              }
                              type="number"
                              placeholder={
                                translations?.knitterInterface?.quantity
                              }
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            />
                            {errors.cottonmixQty && (
                              <p className="text-red-500  text-sm mt-1">
                                {errors.cottonmixQty}
                              </p>
                            )}
                          </div>
                          <div className="col-12 col-sm-4 mt-4">
                            <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                              <button
                                className="btn-purple mr-2"
                                onClick={addBlend}
                              >
                                {translations?.common?.add}
                              </button>
                            </div>
                          </div>

                          {formData?.cottonmixType?.length > 0 &&
                            formData?.cottonmixType.map(
                              (item: any, index: number) => {
                                const selectedCottonMix = cotton?.find(
                                  (mix: any) => mix.id === item
                                );
                                return (
                                  <div
                                    className="row py-2"
                                    key={selectedCottonMix?.id}
                                  >
                                    <div className="col-12 col-sm-3">
                                      <input
                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                        type="text"
                                        value={
                                          selectedCottonMix?.cottonMix_name ||
                                          "N/A"
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
                              <div className="w-1/2 text-sm">
                                {translations?.knitterInterface?.total}:
                              </div>
                              <div className="w-1/2 ">{total}</div>
                            </div>
                          </div>
                        </div>
                        <hr className="mt-4" />
                      </div>
                    </>
                  )}
                  {formData.blend === true && (
                    <>
                      <div className="row">
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.knitterInterface?.blendmaterial}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="blendMaterial"
                            value={formData.blendMaterial || ""}
                            onBlur={(e) => onBlur(e, "bill")}
                            onChange={(e) =>
                              handleChange("blendMaterial", e.target.value)
                            }
                            type="text"
                            placeholder={
                              translations?.knitterInterface?.blendmaterial
                            }
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errors.blendMaterial && (
                            <p className="text-red-500  text-sm mt-1">
                              {errors.blendMaterial}
                            </p>
                          )}
                        </div>

                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.knitterInterface?.vendor}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="vendorDetails"
                            value={formData.vendorDetails || ""}
                            onBlur={(e) => onBlur(e, "bill")}
                            onChange={(e) =>
                              handleChange("vendorDetails", e.target.value)
                            }
                            placeholder={translations?.knitterInterface?.vendor}
                            rows={3}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errors.vendorDetails && (
                            <p className="text-red-500  text-sm mt-1">
                              {errors.vendorDetails}
                            </p>
                          )}
                        </div>
                      </div>
                      <hr className="mt-5" />
                    </>
                  )}

                  <div className="row">
                    <div className="col-12 col-sm-3 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.KnitFabricType}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={knitFabType}
                        name="KnitFabric"
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder={translations?.common?.SelectknitFab}
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
                          setKnitFabType(item);
                        }}
                      />

                      {errors?.KnitFabric && (
                        <div className="text-sm text-red-500">
                          {errors.KnitFabric}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-3 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {
                          translations?.knitterInterface
                            ?.FinishedFabricNetWeight
                        }{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="knitWeight"
                        value={knitnetWeight || ""}
                        onBlur={(e) => onBlur(e, "numbers")}
                        onChange={(e: any) => setKnitnetWight(e.target.value)}
                        type="number"
                        placeholder={
                          translations?.knitterInterface
                            ?.FinishedFabricNetWeight
                        }
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.knitWeight && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.knitWeight}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-3 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.FinishedFabricGSM}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="fabricGsm"
                        value={knitGsm || []}
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        onChange={(e: any) => setKnitGsm(e.target.value)}
                        type="text"
                        placeholder={
                          translations?.knitterInterface?.FinishedFabricGSM
                        }
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.fabricGsm && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.fabricGsm}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-3 mt-4">
                      <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                        <button className="btn-purple mr-2" onClick={addknit}>
                          {translations?.common?.add}
                        </button>
                      </div>
                    </div>

                    {formData?.KnitFabric?.length > 0 && (
                      <div className="mt-4 border">
                        {formData?.KnitFabric?.length > 0 &&
                          formData?.KnitFabric?.map(
                            (item: any, index: number) => {
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
                                      value={formData?.knitWeight[index]}
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
                                      onClick={() => removeKnit(index)}
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

                  <div className="row">
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.TotalFab}
                      </label>
                      <input
                        name="totalfabric"
                        value={totalFabric ? totalFabric + " Kgs" : 0 + " Kgs"}
                        onBlur={(e) => onBlur(e, "bill")}
                        onChange={(e) =>
                          handleChange("totalFabric", e.target.value)
                        }
                        type="text"
                        readOnly
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.FinishedBatch}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="batchlotno"
                        value={formData.batchlotno || ""}
                        onBlur={(e) => onBlur(e, "bill")}
                        onChange={(e) =>
                          handleChange("batchlotno", e.target.value)
                        }
                        type="text"
                        placeholder={
                          translations?.knitterInterface?.FinishedBatch
                        }
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.batchlotno && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.batchlotno}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.FabricReelLotNo}
                      </label>
                      <input
                        name="reelLotNo"
                        value={formData.reelLotNo}
                        onBlur={(e) => onBlur(e, "bill")}
                        onChange={(e) =>
                          handleChange("reelLotNo", e.target.value)
                        }
                        type="text"
                        readOnly
                        placeholder={
                          translations?.knitterInterface?.FabricReelLotNo
                        }
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.reelLotNo && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.reelLotNo}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.JobDetailsfromgarments}
                      </label>
                      <input
                        name="jobDetailsGarment"
                        value={formData.jobDetailsGarment}
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        onChange={(e) =>
                          handleChange("jobDetailsGarment", e.target.value)
                        }
                        type="text"
                        placeholder={
                          translations?.knitterInterface?.JobDetailsfromgarments
                        }
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.jobDetailsGarment && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.jobDetailsGarment}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.rolls}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="noroll"
                        value={formData.noroll || ""}
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        onChange={(e) => handleChange("noroll", e.target.value)}
                        type="number"
                        placeholder={translations?.knitterInterface?.rolls}
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.noroll && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.noroll}
                        </p>
                      )}
                    </div>
                  </div>
                  <hr className="mt-4" />
                  <p className="font-bold py-2 mt-4">DOCUMENTS:</p>
                  <div className="row">
                    {/* <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Do you want to enter Physical Traceability*
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="traceability"
                            checked={formData.traceability === true}
                            onChange={handleChange}
                            value="Yes"
                            className="form-radio"
                          />
                          <span></span>
                        </section>
                        Yes
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="traceability"
                            checked={formData.traceability === false}
                            onChange={handleChange}
                            value="No"
                            className="form-radio"
                          />
                          <span></span>
                        </section>
                        No
                      </label>

                      {errors?.traceability !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.traceability}
                        </div>
                      )}
                    </div>
                  </div> */}

                    {formData.blend === true && (
                      <>
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.knitterInterface?.uploadblend}
                          </label>
                          <div className="inputFile">
                            <label>
                              {translations?.knitterInterface?.ChooseFile}{" "}
                              <GrAttachment />
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
                      </>
                    )}
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.blendother}
                      </label>
                      <div className="inputFile">
                        <label>
                          {translations?.knitterInterface?.ChooseFile}
                          <GrAttachment />
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
                      {errors?.blendDocuments !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.blendDocuments}
                        </div>
                      )}
                    </div>
                    <hr className="mt-4" />
                    <div className="row">
                      <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.knitterInterface?.DyeingOther}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                type="radio"
                                name="dyeing"
                                checked={formData.dyeing === true}
                                onChange={(e) =>
                                  handleChange("dyeing", e.target.value)
                                }
                                value="Yes"
                              />
                              <span></span>
                            </section>
                            Yes
                          </label>
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                type="radio"
                                name="dyeing"
                                checked={formData.dyeing === false}
                                onChange={(e) =>
                                  handleChange("dyeing", e.target.value)
                                }
                                value="No"
                              />
                              <span></span>
                            </section>
                            No
                          </label>
                        </div>
                        {errors?.dyeing !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.dyeing}
                          </div>
                        )}
                      </div>

                      {formData.dyeing === true && (
                        <>
                          <hr className="mt-4" />
                          <div className="row mt-2">
                            <div className="col-6 mt-4">
                              <label className="text-gray-500 text-[12px] font-medium">
                                {translations?.knitterInterface?.nameProcess}{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="processorName"
                                value={formData.processorName}
                                placeholder={
                                  translations?.knitterInterface?.nameProcess
                                }
                                onBlur={(e) => onBlur(e, "alphabets")}
                                onChange={(e) =>
                                  handleChange("processorName", e.target.value)
                                }
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              />
                              {errors.processorName && (
                                <p className="text-red-500  text-sm mt-1">
                                  {errors.processorName}
                                </p>
                              )}
                            </div>

                            <div className="col-6 mt-4">
                              <label className="text-gray-500 text-[12px] font-medium">
                                {translations?.common?.address}{" "}
                                <span className="text-red-500">*</span>
                              </label>

                              <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onBlur={(e) => onBlur(e, "bill")}
                                placeholder={translations?.common?.address}
                                onChange={(e) =>
                                  handleChange("address", e.target.value)
                                }
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              />
                              {errors.address && (
                                <p className="text-red-500  text-sm mt-1">
                                  {errors.address}
                                </p>
                              )}
                            </div>

                            <div className="col-6 mt-4">
                              <label className="text-gray-500 text-[12px] font-medium">
                                {translations?.knitterInterface?.dyeingName}{" "}
                                <span className="text-red-500">*</span>
                              </label>

                              <input
                                type="text"
                                name="nameProcess"
                                onBlur={(e) => onBlur(e, "alphabets")}
                                value={formData.nameProcess}
                                placeholder={
                                  translations?.knitterInterface?.dyeingName
                                }
                                onChange={(e) =>
                                  handleChange("nameProcess", e.target.value)
                                }
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              />
                              {errors.nameProcess && (
                                <p className="text-red-500  text-sm mt-1">
                                  {errors.nameProcess}
                                </p>
                              )}
                            </div>

                            <div className="col-6 mt-4">
                              <label className="text-sm font-medium text-gray-700"></label>
                              <input
                                type="text"
                                name="yarnDelivery1"
                                value={totalFabric || 0}
                                onChange={(e) =>
                                  handleChange("yarnDelivery1", e.target.value)
                                }
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                readOnly
                              />
                            </div>

                            <div className="col-6 mt-4">
                              <label className="text-gray-500 text-[12px] font-medium">
                                {translations?.knitterInterface?.processloss}{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                name="processLoss"
                                value={formData.processLoss || ""}
                                placeholder={
                                  translations?.knitterInterface?.processloss
                                }
                                onChange={(e) =>
                                  handleChange("processLoss", e.target.value)
                                }
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              />
                              {errors.processLoss && (
                                <p className="text-red-500  text-sm mt-1">
                                  {errors.processLoss}
                                </p>
                              )}
                            </div>

                            <div className="col-6 mt-4 mb-5">
                              <label className="text-sm font-medium text-gray-700"></label>
                              <input
                                type="text"
                                name="yarnDeliveryFinal"
                                value={finishedWeight}
                                onChange={(e) =>
                                  handleChange(
                                    "yarnDeliveryFinal",
                                    e.target.value
                                  )
                                }
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                readOnly
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
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
                                      onClick={() =>
                                        handleDeleteWeightAndRoll(i)
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
                              Physical Traceability Partner *
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
                    onClick={handleErrorCheck}
                  >
                    PREVIEW & SUBMIT
                  </button>
                  <button
                    className="btn-outline-purple"
                    onClick={() => {
                      router.push("/knitter/process");
                      sessionStorage.removeItem("knitterProcess");
                      sessionStorage.removeItem("selectedProcess");
                    }}
                  >
                    {translations?.common?.cancel}
                  </button>
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
                    data3_label={"Garment Order Reference No. : "}
                    data3={formData?.garmentOrder}
                    data4_label={"Brand Order Reference No. : "}
                    data4={formData?.brandorderRef}
                    // data5_label={"Total Lint/Blend (Kgs) : "}
                    // data5={formData?.totalQty}
                    data6_label={"Do you want to blend?  : "}
                    data6={formData?.blend ? "Yes" : "No"}
                    data7_label={
                      formData?.blend ? "Blending Quantity Total : " : ""
                    }
                    data7={formData?.blend ? total : null}
                    data8_label={
                      formData?.blend ? "Name of the Blending Material : " : ""
                    }
                    data8={formData?.blend ? formData?.blendMaterial : null}
                    data9_file_label={
                      formData?.blend
                        ? "Blending Material Vendor Details : "
                        : ""
                    }
                    data9={formData?.blend ? formData?.vendorDetails : null}
                    data10_label={"Total Fabric Net Weight : "}
                    data10_data={totalFabric + "Kgs"}
                    data11_label={"Finished Batch/Lot No  : "}
                    data11_data={formData?.batchlotno}
                    data12_label={"Fabric Reel Lot No : "}
                    data12_data={formData?.reelLotNo}
                    data13_label={"Job Details from garments : "}
                    data13_data={formData?.jobDetailsGarment}
                    data14_label={"No of Rolls : "}
                    data14_data={formData?.noroll}
                    data15_label={"Dyeing/Other Process Required : "}
                    data15_data={formData?.dyeing ? "Yes" : "No"}
                    data16_label={"Name of the processor : "}
                    data16_data={formData?.processorName}
                    data17_label={"Name Process :"}
                    data17_data={formData?.nameProcess}
                    data18_label={"Address : "}
                    data18_data={formData?.address}
                    data19_label={"Process Loss (%) If Any? : "}
                    data19_data={formData?.processLoss}
                    // data20_label={"Vehicle No : "}
                    // data20_data={formData?.vehicleNo}
                    data1_array_label={"Knit Fabric Type : "}
                    data1_array_total_list={fabric}
                    data1_array={formData?.KnitFabric}
                    dynamicPropertyName_data1_array={"fabricType_name"}
                    data2_array_label={"Finished Fabric Net Weight (kgs) : "}
                    data2_array={formData?.knitWeight}
                    data2_array_single_map_label={"Finished Fabric GSM : "}
                    data2_array_single_map={formData?.fabricGsm}
                    // data2_array_total_list={""}
                    // data3_array_label={"Blend Selected Cotton : "}
                    // data3_array={formData.cottonmixType}
                    // data3_array_total_list={cottonMix}

                    //

                    //
                    //
                    //
                    //

                    array_img_label={"DOCUMENTS : "}
                    array_img={formData?.blendDocuments}
                    // data2_file_OR_txt_label={"Rate (local currency) : "}
                    // data2_txt={formData?.Rate}
                    // data3_file_OR_txt_label={"Dispatch from : "}
                    // data3_txt={formData?.DispatchFrom}
                    //   data4_file_OR_txt_label={"Bale Process : "}
                    //   data4_single_file={[formData?.baleProcess]}

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
                    show_big_table={formData?.KnitFabric?.length ? true : false}
                    big_table1_title={""}
                    big_table1_option1_label={"Knit Fabric Type"}
                    big_table1_option1_lists={formData?.KnitFabric}
                    big_table1_option1_lists_map={fabric}
                    big_table1_option1_dynamicProperty_name={"fabricType_name"}
                    big_table1_option2_label={
                      "Finished Fabric Net Weight (kgs)"
                    }
                    big_table1_option2_lists={formData?.knitWeight}
                    big_table1_option3_label={"Finished Fabric GSM"}
                    big_table1_option3_lists={formData?.fabricGsm}
                    //
                    //table 2
                    table_2_show={formData?.cottonmixQty?.length ? true : false}
                    table2_title={""}
                    table2_option1_label={"Blend Selected Cotton"} // => first colunm
                    table2_option1_match_id={formData?.cottonmixType}
                    table2_option1_full_list={cotton}
                    table2_option1_dynamic_filed_name={"cottonMix_name"}
                    table2_option2_label={"Blend Selected Cotton Quantity"} // => second colunm
                    table2_option2_show_arr_values={formData?.cottonmixQty}
                  />
                </div>
              </div>
              {isLoading ? <ModalLoader /> : null}
            </div>
          </div>
        </div>
      </>
    );
  }
}
