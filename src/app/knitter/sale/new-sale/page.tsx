"use client";
import React, { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterSuccess } from "@components/core/Toaster";
import User from "@lib/User";
import { GrAttachment } from "react-icons/gr";
import useTranslations from "@hooks/useTranslation";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";
import { PreView } from "@components/preview/PreView";
import moment from "moment";
import ModalLoader from "@components/core/ModalLoader";

interface FormData {
  knitterId: any;
  seasonId: string | number | null;
  date: string;
  programId: string | number | null;
  traderId: string | number | null;
  buyerType: string;
  transactionViaTrader: any;
  invoiceNo: any;
  tcFiles: any;
  quantChooseYarn: string;
  contractFile: any;
  invoiceFile: any;
  deliveryNotes: any;
  brandorderRef: any;
  processorName: string;
  processName: string;
  processorNameBuyer: string;
  addressNewBuyer: string;
  buyerId: any;
  transporterName: string;
  billOfLadding: string;
  vehicleNo: string;
  agentDetails: string;
  batchLotNo: string;
  fabricId: any;
  garmentOrder: any;
  noOfRolls: any;
  totalYarnQty: any;
  totalFabricWeight: any;
  fabricType: any;
}
export default function page() {
  const { translations, loading } = useTranslations();
  useTitle(translations?.knitterInterface?.newsale);

  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});

  const [from, setFrom] = useState<Date | null>(new Date());
  const [program, setProgram] = useState([]);
  const [season, setSeason] = useState<any>();
  const [garment, setGarment] = useState<any>();
  const [chooseFabric, setChooseFabric] = useState<any>(0);
  const [dying, setDying] = useState<any>();
  const [washing, setWashing] = useState<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const knitterId = User.ThirdPartyInspectionId;
  const [fabricTypeName, setFabricTypeName] = useState<any>([]);

  const [showPreview, setShowPreview] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(false);

  const [formData, setFormData] = useState<FormData>({
    knitterId: "",
    seasonId: null,
    date: new Date().toISOString(),
    programId: null,
    fabricId: "",
    traderId: null,
    buyerType: "",
    transactionViaTrader: false,
    tcFiles: null,
    contractFile: null,
    invoiceFile: [],
    deliveryNotes: null,
    quantChooseYarn: "",
    processorName: "",
    processName: "",
    processorNameBuyer: "",
    addressNewBuyer: "",
    buyerId: null,
    transporterName: "",
    billOfLadding: "",
    vehicleNo: "",
    agentDetails: "",
    batchLotNo: "",
    invoiceNo: "",
    brandorderRef: "",
    garmentOrder: "",
    noOfRolls: null,
    totalYarnQty: "",
    totalFabricWeight: "",
    fabricType: [],
  });

  const [chooseyarnData, setchooseyarnData] = useState({
    id: "",
    qtyUsed: "",
    totalQty: "",
  });
  const [fileName, setFileName] = useState(() => {
    const storedFileName = sessionStorage.getItem("fileName");
    return storedFileName
      ? JSON.parse(storedFileName)
      : {
          contractFile: "",
          deliveryNotes: "",
          invoiceFile: [],
          qualityDoc: "",
          tcFiles: "",
        };
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Knitter")) {
      const access = checkAccess("Knitter Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (formData.buyerType === "Dyeing" || formData.buyerType === "Washing") {
      getFabrics(formData.buyerType);
    }
  }, [formData.buyerType]);

  useEffect(() => {
    const savedData: any = sessionStorage.getItem("knitterSales");
    const savedDataFile: any = sessionStorage.getItem("fileName");
    const processData = JSON.parse(savedData);
    if (processData) {
      setFormData(processData);
    }
  }, []);
  useEffect(() => {
    // Save fileName to sessionStorage whenever it changes
    sessionStorage.setItem("fileName", JSON.stringify(fileName));
  }, [fileName]);
  useEffect(() => {
    const storedTotal = sessionStorage.getItem("selectedSales");

    if (storedTotal !== null && storedTotal !== undefined) {
      const parsedTotal = JSON.parse(storedTotal);
      setchooseyarnData(parsedTotal);

      if (parsedTotal && parsedTotal.length > 0) {
        const batchLotNos = parsedTotal.map((item: any) => item.batch_lot_no);
        const uniqueLots = [...new Set(batchLotNos)]?.join(", ");

        const noOfRollsData = parsedTotal.map((item: any) => item.noOfRolls);

        const noOfRolls = noOfRollsData.reduce(
          (acc: any, curr: any) => acc + curr,
          0
        );
        const totalYarnData = parsedTotal.map((item: any) => item.totalYarnQty);
        const totalYarn = totalYarnData.reduce(
          (acc: any, curr: any) => acc + curr,
          0
        );
        const fabricTypeData = parsedTotal.map((item: any) => item.fabricType);

        const fabricType = fabricTypeData.flat();

        const fabType = parsedTotal
          ?.map((item: any) => item?.fabricTypeName)
          .flat();
        const fabNames = fabType?.map((fab: any) => fab?.fabricType_name);
        const uniqueFabricTypeNames = [...new Set(fabNames)];
        setFabricTypeName(uniqueFabricTypeNames);

        const brandOrderRef = parsedTotal.map(
          (item: any) => item.brandOrderRef
        );
        const uniqueBrands = [...new Set(brandOrderRef)]?.join(", ");

        const garmentOrderRef = parsedTotal.map(
          (item: any) => item.garmentOrderRef
        );
        const uniqueGarments = [...new Set(garmentOrderRef)]?.join(", ");

        setFormData((prev: any) => ({
          ...prev,
          batchLotNo: uniqueLots,
          noOfRolls: noOfRolls,
          fabricType: fabricType,
          totalYarnQty: totalYarn,
          brandorderRef: uniqueBrands,
          garmentOrder: uniqueGarments,
        }));

        const chooseFabricData = parsedTotal.map((item: any) => item.qtyUsed);
        const totalChooseFabric = chooseFabricData.reduce(
          (acc: any, curr: any) => +acc + +curr,
          0
        );
        setChooseFabric(totalChooseFabric);
      } else {
        setFormData((prev: any) => ({
          ...prev,
          batchLotNo: "",
        }));
        setChooseFabric(0);
      }
    }
  }, []);
  const removeImage = (index: any) => {
    let filename = fileName.invoiceFile;
    let fileLink = formData.invoiceFile;
    let arr1 = filename.filter((element: any, i: number) => index !== i);
    let arr2 = fileLink.filter((element: any, i: number) => index !== i);
    setFileName((prevData: any) => ({
      ...prevData,
      invoiceFile: arr1,
    }));
    setFormData((prevData: any) => ({
      ...prevData,
      invoiceFile: arr2,
    }));
  };
  useEffect(() => {
    if (knitterId) {
      getPrograms();
      getSeason();
      getGarment();
    }
  }, [knitterId]);
  const getFabrics = async (type: any) => {
    try {
      const fabric = await API.get(
        `knitter-process/get-fabrics?knitterId=${knitterId}&type=${type}`
      );
      if (fabric.success) {
        if (formData.buyerType === "Dyeing") {
          setDying(fabric.data);
        } else {
          setWashing(fabric.data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getGarment = async () => {
    try {
      const res = await API.get(
        `knitter-process/get-garments?knitterId=${knitterId}`
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
        setSeason(res.data?.slice(-3));
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
      sessionStorage.setItem("knitterSales", JSON.stringify(formData));
      sessionStorage.setItem("fileName", JSON.stringify(fileName));
      router.push(
        `/knitter/sale/choose-fabric?id=${formData.programId}&type=${type}`
      );
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to Choose Fabric",
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
  const handleChange = (name?: any, value?: any, event?: any) => {
    switch (name) {
      case "programId":
        setFormData((prevData: any) => ({ ...prevData, [name]: value }));
        break;
      case "blend":
      case "dyeing":
      case "transactionViaTrader":
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [name]: value === "Yes" ? true : false,
          agentDetails: value === "No" ? "" : prevFormData.agentDetails,
        }));
        break;
      case "buyerType":
        switch (formData.buyerType) {
          case "Garment":
            setFormData((prevFormData: any) => ({
              ...prevFormData,
              buyerId: null,
            }));
            break;
          case "New Buyer":
            setFormData((prevFormData: any) => ({
              ...prevFormData,
              processorNameBuyer: "",
              addressNewBuyer: "",
            }));
            break;
          case "Dyeing":
            // Reset fabricId only if the selected buyerType is different from the current one
            if (value !== "Dyeing") {
              setFormData((prevFormData: any) => ({
                ...prevFormData,
                fabricId: null,
              }));
            }
            break;
          case "Washing":
            // Reset fabricId only if the selected buyerType is different from the current one
            if (value !== "Washing") {
              setFormData((prevFormData: any) => ({
                ...prevFormData,
                fabricId: null,
              }));
            }
            break;
          default:
            break;
        }
        // Update buyerType field
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [name]: value,
        }));
        break;
      default:
        if (
          [
            "contractFile",
            "deliveryNotes",
            "invoiceFile",
            "qualityDoc",
            "tcFiles",
          ].includes(name)
        ) {
          dataUpload(value, name);
        } else {
          setFormData((prevData: any) => ({ ...prevData, [name]: value }));
        }
        setErrors((prev: any) => ({ ...prev, [name]: "" }));
        break;
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
  const validateForm = () => {
    const newErrors = {} as Partial<FormData>;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    if (!formData.seasonId || formData.seasonId === undefined) {
      newErrors.seasonId = "Season is Required";
    }
    if (!formData.programId) {
      newErrors.programId = "Select Program is Required";
    }

    if (!formData.buyerType) {
      newErrors.buyerType = "Choose Buyer is required";
    }
    if (formData.buyerType === "Garment" && !formData.buyerId) {
      newErrors.buyerId = "Select Garment is Required";
    }
    if (formData.buyerType === "New Buyer" && !formData.processorNameBuyer) {
      newErrors.processorNameBuyer = "Processor Name is Required";
    }
    if (
      formData.buyerType === "New Buyer" &&
      formData.processorNameBuyer &&
      errors.processorNameBuyer
    ) {
      newErrors.processorNameBuyer = errors.processorNameBuyer;
    }
    if (formData.buyerType === "New Buyer" && !formData.addressNewBuyer) {
      newErrors.addressNewBuyer = "Address is Required";
    }
    if (
      formData.buyerType === "New Buyer" &&
      formData.addressNewBuyer &&
      errors.addressNewBuyer
    ) {
      newErrors.addressNewBuyer = errors.addressNewBuyer;
    }
    if (formData.buyerType === "Dyeing" && !formData.fabricId) {
      newErrors.fabricId = "Select Dyeing is Required";
    }
    if (formData.buyerType === "Washing" && !formData.fabricId) {
      newErrors.fabricId = "Select Washing  is Required";
    }

    if (!formData.invoiceNo) {
      newErrors.invoiceNo = "Invoice Number is Required";
    }
    if (formData.invoiceNo) {
      if (regexAlphaNumeric.test(formData.invoiceNo) === false) {
        newErrors.invoiceNo =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
      if (formData.invoiceNo && errors.invoiceNo) {
        newErrors.invoiceNo = errors.invoiceNo;
      }
    }
    if (!formData.billOfLadding) {
      newErrors.billOfLadding = "Bill of Lading is Required";
    }

    if (formData.billOfLadding) {
      if (regexAlphaNumeric.test(formData.billOfLadding) === false) {
        newErrors.billOfLadding =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
      if (formData.billOfLadding && errors.billOfLadding) {
        newErrors.billOfLadding = errors.billOfLadding;
      }
    }
    if (!formData.transporterName) {
      newErrors.transporterName = "Transporter Name is Required";
    }
    if (formData.transporterName) {
      if (regexAlphabets.test(formData.transporterName) === false) {
        newErrors.transporterName =
          "Accepts only Alphabets and special characters like comma(,),_,-,(),.";
      }
      if (formData.transporterName && errors.transporterName) {
        newErrors.transporterName = errors.transporterName;
      }
    }
    if (!formData.vehicleNo) {
      newErrors.vehicleNo = "Vehicle Number is Required";
    }
    if (formData.vehicleNo) {
      if (regexAlphaNumeric.test(formData.vehicleNo) === false) {
        newErrors.vehicleNo =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
      if (formData.vehicleNo && errors.vehicleNo) {
        newErrors.vehicleNo = errors.vehicleNo;
      }
    }

    if (formData.transactionViaTrader === true && !formData.agentDetails) {
      newErrors.agentDetails = "Agent Details  is Required";
    }
    if (
      formData.transactionViaTrader === true &&
      formData.agentDetails &&
      errors.agentDetails
    ) {
      newErrors.agentDetails = errors.agentDetails;
    }
    if (formData.invoiceFile.length === 0) {
      newErrors.invoiceFile = "Invoice File is Required.";
    }

    if (chooseFabric === 0) {
      newErrors.quantChooseYarn = "Select Choose Fabric is Required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const url = "knitter-process";
      const mainFormData = {
        knitterId: knitterId,
        date: formData.date,
        programId: Number(formData.programId),
        seasonId: Number(formData.seasonId),
        garmentOrderRef: formData.garmentOrder,
        brandOrderRef: formData.brandorderRef,
        buyerType: formData.buyerType,
        buyerId:
          formData.buyerType === "Garment"
            ? Number(formData?.buyerId?.value)
            : null,
        fabricId: Number(formData?.fabricId?.value),
        processorName: formData.processorNameBuyer,
        processorAddress: formData.addressNewBuyer,
        totalYarnQty: formData.totalYarnQty,
        transactionViaTrader: formData.transactionViaTrader,
        transactionAgent: formData.agentDetails,
        batchLotNo: formData.batchLotNo,
        invoiceNo: formData.invoiceNo,
        billOfLadding: formData.billOfLadding,
        transporterName: formData.transporterName,
        vehicleNo: formData.vehicleNo,
        tcFiles: formData.tcFiles,
        contractFile: formData.contractFile,
        invoiceFile: formData.invoiceFile,
        deliveryNotes: formData.deliveryNotes,
        chooseFabric: chooseyarnData,
        noOfRolls: formData.noOfRolls,
        fabricType: formData.fabricType,
        totalFabricWeight: chooseFabric,
      };
      const mainResponse = await API.post(url, mainFormData);
      if (mainResponse.success) {
        toasterSuccess(
          "Sales created successfully",
          3000,
          mainFormData.knitterId
        );
        router.push(
          `/knitter/sale/transaction-summary?id=${mainResponse.data?.id}`
        );
        sessionStorage.removeItem("knitterSales");
        sessionStorage.removeItem("selectedSales");
        sessionStorage.removeItem("fileName");
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
                    <Link href="/knitter/dashboard" className="active">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/knitter/sale">
                      {translations?.knitterInterface?.sale}
                    </Link>
                  </li>
                  <li>{translations?.knitterInterface?.newsale}</li>
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

                    {!chooseFabric && (
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
                        {translations?.knitterInterface?.ChooseFab}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <button
                        name="chooseYarn"
                        type="button"
                        onClick={() => getChooseYarn("chooseFabric")}
                        className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                      >
                        {translations?.knitterInterface?.ChooseFab}
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
                        value={+chooseFabric + " Kgs"}
                        onChange={(event) => handleChange(event)}
                        type="text"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        readOnly
                      />
                    </div>

                    <div className=" col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.GarmentOrderReference}
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="garmentOrder"
                        disabled
                        value={formData.garmentOrder || ""}
                        // onBlur={(e) => onBlur(e, "alphaNumeric")}
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
                        {translations?.knitterInterface?.BrandOrderReference}
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="brandorderRef"
                        disabled
                        value={formData.brandorderRef || ""}
                        // onBlur={(e) => onBlur(e, "alphaNumeric")}
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

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Fabric Type Name
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        disabled
                        placeholder="Fabric Type Name"
                        name="fabricTypeName"
                        value={fabricTypeName}
                        onChange={(e) =>
                          handleChange("fabricTypeName", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.ChooseBuyer}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>
                            <input
                              type="radio"
                              name="buyerType"
                              value="Garment"
                              checked={formData.buyerType === "Garment"}
                              onChange={(e) =>
                                handleChange("buyerType", e.target.value)
                              }
                            />
                            <span></span>
                          </section>
                          {translations?.knitterInterface?.Garment}
                        </label>
                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>
                            <input
                              type="radio"
                              name="buyerType"
                              checked={formData.buyerType === "Dyeing"}
                              onChange={(e) =>
                                handleChange("buyerType", e.target.value)
                              }
                              value="Dyeing"
                            />
                            <span></span>
                          </section>{" "}
                          {translations?.knitterInterface?.Dying}
                        </label>
                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>
                            <input
                              type="radio"
                              name="buyerType"
                              checked={formData.buyerType === "Washing"}
                              onChange={(e) =>
                                handleChange("buyerType", e.target.value)
                              }
                              value="Washing"
                            />
                            <span></span>
                          </section>{" "}
                          {translations?.knitterInterface?.Washing}
                        </label>
                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>
                            <input
                              type="radio"
                              name="buyerType"
                              value="New Buyer"
                              checked={formData.buyerType === "New Buyer"}
                              onChange={(e) =>
                                handleChange("buyerType", e.target.value)
                              }
                            />
                            <span></span>
                          </section>
                          {translations?.knitterInterface?.newbuyer}
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
                            {translations?.common?.SelectGarment}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={formData.buyerId}
                            name="buyerId"
                            menuShouldScrollIntoView={false}
                            isClearable
                            placeholder={translations?.common?.SelectGarment}
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={
                              (garment || []).map(({ id, name }: any) => ({
                                label: name,
                                value: id,
                                key: id,
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
                    ) : formData.buyerType === "New Buyer" ? (
                      <>
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.ProcessorName}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="processorNameBuyer"
                            onBlur={(e) => onBlur(e, "alphabets")}
                            value={formData.processorNameBuyer || ""}
                            onChange={(e) =>
                              handleChange("processorNameBuyer", e.target.value)
                            }
                            placeholder={translations?.common?.ProcessorName}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errors?.processorNameBuyer !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.processorNameBuyer}
                            </div>
                          )}
                        </div>

                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.address}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="addressNewBuyer"
                            onBlur={(e) => onBlur(e, "alphabets")}
                            value={formData.addressNewBuyer}
                            onChange={(e) =>
                              handleChange("addressNewBuyer", e.target.value)
                            }
                            placeholder={translations?.common?.address}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errors?.addressNewBuyer !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.addressNewBuyer}
                            </div>
                          )}
                        </div>
                      </>
                    ) : formData.buyerType === "Dyeing" ? (
                      <>
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.knitterInterface?.Dying}
                            <span className="text-red-500">*</span>
                          </label>
                          <Select
                            name="fabricId"
                            value={formData.fabricId}
                            menuShouldScrollIntoView={false}
                            isClearable
                            placeholder={translations?.common?.SelectDying}
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={
                              (dying || []).map(({ id, name }: any) => ({
                                label: name,
                                value: id,
                                key: id,
                              })) as unknown as readonly (
                                | string
                                | GroupBase<string>
                              )[]
                            }
                            onChange={(item: any) =>
                              handleChange("fabricId", item)
                            }
                          />
                          {errors?.fabricId && (
                            <div className="text-sm text-red-500">
                              {errors.fabricId}
                            </div>
                          )}
                        </div>
                      </>
                    ) : formData.buyerType === "Washing" ? (
                      <>
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.knitterInterface?.Washing}
                            <span className="text-red-500">*</span>
                          </label>
                          <Select
                            name="fabricId"
                            value={formData.fabricId}
                            menuShouldScrollIntoView={false}
                            isClearable
                            placeholder={translations?.common?.SelectWashing}
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={
                              (washing || []).map(({ id, name }: any) => ({
                                label: name,
                                value: id,
                                key: id,
                              })) as unknown as readonly (
                                | string
                                | GroupBase<string>
                              )[]
                            }
                            onChange={(item: any) =>
                              handleChange("fabricId", item)
                            }
                          />
                          {errors?.fabricId && (
                            <div className="text-sm text-red-500">
                              {errors.fabricId}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      ""
                    )}

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.common?.transactionViatrader}{" "}
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
                              name="transactionViaTrader"
                              checked={formData.transactionViaTrader === false}
                              onChange={(e) =>
                                handleChange(
                                  "transactionViaTrader",
                                  e.target.value
                                )
                              }
                              value="No"
                              className="form-radio"
                            />
                            <span></span>
                          </section>
                          No
                        </label>
                      </div>
                    </div>
                    {formData.transactionViaTrader === true && (
                      <div className="col-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.agentDetails}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="agentDetails"
                          value={formData.agentDetails}
                          onBlur={(e) => onBlur(e, "alphaNumeric")}
                          onChange={(e) =>
                            handleChange("agentDetails", e.target.value)
                          }
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          placeholder={translations?.common?.agentDetails}
                          rows={3}
                        />
                        {errors?.agentDetails !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.agentDetails}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.FinishedBatch}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="batchLotNo"
                        value={formData.batchLotNo || ""}
                        onChange={(e) =>
                          handleChange("batchLotNo", e.target.value)
                        }
                        type="text"
                        placeholder={
                          translations?.knitterInterface?.FinishedBatch
                        }
                        readOnly
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.batchLotNo && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.batchLotNo}
                        </p>
                      )}
                    </div>

                    <hr className="mt-4" />
                    <div className="mt-4">
                      <h4 className="text-md font-semibold">
                        OTHER INFORMATION:
                      </h4>
                      <div className="row">
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.invoiceNumber}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="invoiceNo"
                            value={formData.invoiceNo}
                            onChange={(e) =>
                              handleChange("invoiceNo", e.target.value)
                            }
                            onBlur={(e) => onBlur(e, "bill")}
                            type="text"
                            placeholder={translations?.common?.invoiceNumber}
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
                            {translations?.common?.billofladding}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="billOfLadding"
                            value={formData.billOfLadding}
                            onBlur={(e) => onBlur(e, "bill")}
                            onChange={(e) =>
                              handleChange("billOfLadding", e.target.value)
                            }
                            type="text"
                            placeholder={translations?.common?.billofladding}
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
                            {translations?.common?.TransportName}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="transporterName"
                            value={formData.transporterName}
                            onChange={(e) =>
                              handleChange("transporterName", e.target.value)
                            }
                            onBlur={(e) => onBlur(e, "alphabets")}
                            type="text"
                            placeholder={translations?.common?.TransportName}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errors.transporterName && (
                            <p className="text-red-500  text-sm mt-1">
                              {errors.transporterName}
                            </p>
                          )}
                        </div>
                        <div className="col-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.transactions?.vehicleNo}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="vehicleNo"
                            value={formData.vehicleNo}
                            onChange={(e) =>
                              handleChange("vehicleNo", e.target.value)
                            }
                            type="text"
                            onBlur={(e) => onBlur(e, "alphaNumeric")}
                            placeholder={translations?.transactions?.vehicleNo}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
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
                            {translations?.common?.uploadtc}
                          </label>
                          <div className="inputFile">
                            <label>
                              {translations?.knitterInterface?.ChooseFile}{" "}
                              <GrAttachment />
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
                            {translations?.common?.ContractFiles}
                          </label>
                          <div className="inputFile">
                            <label>
                              {translations?.knitterInterface?.ChooseFile}
                              <GrAttachment />
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
                            {translations?.common?.invoice}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="inputFile">
                            <label>
                              {translations?.knitterInterface?.ChooseFile}
                              <GrAttachment />
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
                            {translations?.common?.DeliveryNotes}
                          </label>
                          <div className="inputFile">
                            <label>
                              {translations?.knitterInterface?.ChooseFile}{" "}
                              <GrAttachment />
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
                  </div>
                </div>

                <div>
                  <hr className="mt-4 mb-5" />
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
                        router.push("/knitter/sale");
                        sessionStorage.removeItem("knitterSales");
                        sessionStorage.removeItem("selectedSales");
                        sessionStorage.removeItem("fileName");
                      }}
                    >
                      {translations?.common?.cancel}
                    </button>
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
                    data3_label={"Quantity in kgs : "}
                    data3={chooseFabric}
                    data4_label={"Garment Order Reference No : "}
                    data4={formData?.garmentOrder}
                    data5_label={"Brand Order Reference No : "}
                    data5={formData?.brandorderRef}
                    data6_label={"Fabric Type Name : "}
                    data6={fabricTypeName}
                    data7_label={"Choose Buyer : "}
                    data7={formData?.buyerType}
                    data8_label={"Selected Garment :"}
                    data8={formData?.buyerId?.label}
                    data9_file_label={"Transaction Via Trader  :"}
                    data9={formData?.transactionViaTrader ? "Yes" : "No"}
                    data10_label={"Agent Details : "}
                    data10_data={formData?.agentDetails}
                    data11_label={"Finished Batch/Lot No : "}
                    data11_data={formData?.batchLotNo}
                    data12_label={"Invoice Number : "}
                    data12_data={formData.invoiceNo}
                    data13_label={"LR/BR No : "}
                    data13_data={formData?.billOfLadding}
                    data14_label={"Transporter Name : "}
                    data14_data={formData?.transporterName}
                    data15_label={"Vehicle No  : "}
                    data15_data={formData?.vehicleNo}
                    data1_file_OR_txt_label={"Upload TC`s : "}
                    data1_single_file={
                      formData?.tcFiles ? [formData?.tcFiles] : null
                    }
                    data2_file_OR_txt_label={"Contract Files : "}
                    data2_single_file={
                      formData?.contractFile ? [formData?.contractFile] : null
                    }
                    data3_file_OR_txt_label={"Delivery Notes : "}
                    data3_single_file={
                      formData?.deliveryNotes ? [formData?.deliveryNotes] : null
                    }
                    array_img_label={"Invoice Files"}
                    array_img={formData?.invoiceFile}
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
