"use client";
import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
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
import NavLink from "@components/core/nav-link";
import Select, { GroupBase } from "react-select";

export default function page() {
  useTitle("New Sales");
  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});

  const [from, setFrom] = useState<Date | null>(new Date());
  const [chooseFabric, setChooseFabric] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [program, setProgram] = useState([]);
  const [season, setSeason] = useState<any>();
  const [garments, setGarments] = useState<any>();
  const [dying, setDying] = useState<any>();
  const [washing, setWashing] = useState<any>();

  const [fabricTypeName, setFabricTypeName] = useState<any>([]);

  const [fileName, setFileName] = useState({
    contractFile: "",
    deliveryNotes: "",
    invoiceFile: [],
    qualityDoc: "",
    tcFiles: "",
  });

  const [formData, setFormData] = useState<any>({
    date: new Date(),
    programId: null,
    seasonId: null,
    garmentOrderRef: "",
    brandOrderRef: "",
    buyerType: "",
    buyerId: null,
    fabricId: null,
    processorName: "",
    processorAddress: "",
    totalYarnQty: 0,
    transactionViaTrader: null,
    transactionAgent: "",
    batchLotNo: "",
    invoiceNo: "",
    billOfLadding: "",
    transporterName: "",
    vehicleNo: "",
    tcFiles: null,
    contractFile: null,
    invoiceFile: [],
    deliveryNotes: null,
    noOfRolls: null,
    fabricType: [],
    totalFabricLength: 0,
  });

  const [errors, setErrors] = useState<any>({});

  const weaverId = User.LabId;

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
      const access = checkAccess("Weaver Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (weaverId) {
      getPrograms();
      getSeason();
      getGarments();
    }
  }, [weaverId]);

  useEffect(() => {
    if (formData.buyerType === "Dyeing" || formData.buyerType === "Washing") {
      getFabrics(formData.buyerType);
    }
  }, [formData.buyerType]);

  useEffect(() => {
    const savedData: any = sessionStorage.getItem("salesData");
    const savedWeaver: any = sessionStorage.getItem("chooseFabric");

    const processData = JSON.parse(savedData);
    const cottonData = JSON.parse(savedWeaver);

    if (processData) {
      setFormData(processData);
    }

    setChooseFabric(cottonData);
  }, []);

  useEffect(() => {
    const totQtyWarn = chooseFabric?.map((item: any) => item.qtyUsed);
    const totSumtotQtyWarn: any = totQtyWarn?.reduce(
      (accumulator: any, currentValue: any) => +accumulator + +currentValue,
      0
    );

    const batchLotNos = chooseFabric?.map((item: any) => item.batch_lot_no);
    const uniqueLots = [...new Set(batchLotNos)]?.join(", ");

    const noOfRollsData = chooseFabric?.map((item: any) => item?.noOfRolls);

    const noOfRolls = noOfRollsData?.reduce(
      (acc: any, curr: any) => +acc + +curr,
      0
    );
    const totalYarnData = chooseFabric?.map((item: any) => item?.totalYarnQty);

    const totalYarn = totalYarnData?.reduce(
      (acc: any, curr: any) => +acc + +curr,
      0
    );

    const fabricTypeData = chooseFabric?.map((item: any) => item?.fabricType);
    const fabricType = fabricTypeData?.flat();

    const fabType = chooseFabric
      ?.map((item: any) => item?.fabricTypeName)
      .flat();
    const fabNames = fabType?.map((fab: any) => fab?.fabricType_name);
    const uniqueFabricTypeNames = [...new Set(fabNames)];
    setFabricTypeName(uniqueFabricTypeNames);

    const brandOrder = chooseFabric?.map((item: any) => item?.brandOrderRef);
    const uniqueBrands = [...new Set(brandOrder)]?.join(", ");
    const garmentOrder = chooseFabric?.map(
      (item: any) => item?.garmentOrderRef
    );
    const uniqueGarments = [...new Set(garmentOrder)]?.join(", ");

    setFormData((prevData: any) => ({
      ...prevData,
      batchLotNo: uniqueLots,
      totalFabricLength: totSumtotQtyWarn || 0,
      noOfRolls: noOfRolls,
      fabricType: fabricType,
      totalYarnQty: totalYarn,
      garmentOrderRef: uniqueGarments,
      brandOrderRef: uniqueBrands,
    }));
  }, [chooseFabric, weaverId, formData.programId]);

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

  const getGarments = async () => {
    try {
      const garment = await API.get(
        `weaver-process/get-garments?weaverId=${weaverId}`
      );
      if (garment.success) {
        setGarments(garment.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getFabrics = async (type: any) => {
    try {
      const fabric = await API.get(
        `weaver-process/get-fabrics?weaverId=${weaverId}&type=${type}`
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
      sessionStorage.setItem("salesData", JSON.stringify(formData));
      router.push(
        `/weaver/weaver-sales/choose-fabric?id=${formData.programId}`
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
    if (name === "transactionViaTrader") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value === "Yes" ? true : false,
        transactionAgent: value === "Yes" ? prevData.transactionAgent : "",
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
          dyeingProcessorName: "",
          dyeingAddress: "",
          yarnDelivered: null,
        }));
      }
    } else if (name === "buyerType") {
      setFormData((prevData: any) => ({
        ...prevData,
        buyerId: null,
        fabricId: null,
      }));
      setErrors((prev: any) => ({
        ...prev,
        buyerId: "",
        fabricId: "",
      }));
      if (name === "buyerType" && value === "Garment") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          fabricId: null,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          buyerId: null,
        }));
      }
    } else if (name === "weftChoosen") {
      if (value === "Yarn") {
        setFormData((prevData: any) => ({
          ...prevData,
          weftCottonmixQty: [],
          weftCottonmixType: [],
        }));
      } else {
        if (chooseFabric && chooseFabric.length > 0) {
          const yarnDetails = chooseFabric.filter(
            (element: any, i: number) => element.type === "warp"
          );
          sessionStorage.setItem("chooseFabric", JSON.stringify(yarnDetails));
          setChooseFabric(yarnDetails);
        }
      }
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      if (
        name === "contractFile" ||
        name === "deliveryNotes" ||
        name === "invoiceFile" ||
        name === "tcFiles"
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

  const onBlur = (e: any, type: any) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
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

    if (type === "alphaNumeric") {
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
  };

  const requiredWeaverFields = [
    "seasonId",
    "date",
    "programId",
    "buyerType",
    "buyerId",
    "fabricId",
    "transactionAgent",
    "processorAddress",
    "processorName",
    "transactionViaTrader",
    "invoiceNo",
    "billOfLadding",
    "transporterName",
    "vehicleNo",
    "invoiceFile",
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
        case "transactionAgent":
          return regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "buyerType":
          return value.trim() === "" ? "Please select any one option" : "";
        case "buyerId":
          return formData.buyerType === "Garment" &&
            (value?.length === 0 || value === null)
            ? "This field is required"
            : "";
        case "fabricId":
          return (formData.buyerType === "Dyeing" ||
            formData.buyerType === "Washing") &&
            (value?.length === 0 || value === null)
            ? "This field is required"
            : "";
        case "transactionViaTrader":
          return value?.length === 0 || value === null
            ? "Please select any one option"
            : "";
        case "processorAddress":
          return formData.buyerType === "New Buyer" && value.trim() === ""
            ? "Processor Address is required"
            : regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "processorName":
          return formData.buyerType === "New Buyer" && value.trim() === ""
            ? "Processor Name is required"
            : regexAlphabets.test(value) === false
            ? "Accepts only Alphabets and special characters like _,-,()"
            : "";
        case "invoiceNo":
          return value.trim() === ""
            ? "Invoice No is required"
            : regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "billOfLadding":
          return value.trim() === ""
            ? "This field is required"
            : regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "transporterName":
          return value.trim() === ""
            ? "Transporter Name is required"
            : regexAlphabets.test(value) === false
            ? "Accepts only Alphabets and special characters like _,-,()"
            : "";
        case "vehicleNo":
          return value.trim() === ""
            ? "Vehicle No is required"
            : regexAlphaNumeric.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
            : "";
        case "invoiceFile":
          return value.length === 0 ? "Invoice File is Required" : "";

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
    if (!chooseFabric) {
      setErrors((prev: any) => ({
        ...prev,
        totalYarnQty: "Choose Fabric is Required",
      }));
      return;
    }

    if (!hasWeaversErrors) {
      try {
        setIsSubmitting(true);
        const response = await API.post("weaver-process", {
          ...formData,
          weaverId: weaverId,
          chooseFabric: chooseFabric,
          buyerId:
            formData.buyerType === "Garment"
              ? Number(formData?.buyerId?.value)
              : null,
          fabricId: Number(formData?.fabricId?.value),
        });
        if (response.success) {
          toasterSuccess("Sales created successfully");
          sessionStorage.removeItem("salesData");
          sessionStorage.removeItem("chooseFabric");
          router.push(
            `/weaver/weaver-sales/transaction-summary?id=${response.data.weaverSales.id}`
          );
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
                  <NavLink href="/weaver/weaver-sales" className="active">
                    Sale
                  </NavLink>
                </li>
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
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Choose Fabric <span className="text-red-500">*</span>
                    </label>
                    <button
                      name="chooseFabric"
                      type="button"
                      onClick={() => getChooseYarn()}
                      className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                    >
                      Choose Fabric
                    </button>
                    {errors?.totalYarnQty !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.totalYarnQty}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Quantity in Mts
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="totalYarnQty"
                      value={`${formData.totalFabricLength} Mts` || `0 Mts`}
                      onChange={(e) =>
                        handleChange("totalYarnQty", e.target.value)
                      }
                      type="text"
                      disabled
                    />
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Garment Order Reference No.
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="garmentOrderRef"
                      disabled
                      value={formData.garmentOrderRef || ""}
                      onChange={(e) =>
                        handleChange("garmentOrderRef", e.target.value)
                      }
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
                      Brand Order Reference No.
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="brandOrderRef"
                      disabled
                      value={formData.brandOrderRef || ""}
                      onChange={(e) =>
                        handleChange("brandOrderRef", e.target.value)
                      }
                      type="text"
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
                            checked={formData.buyerType === "Garment"}
                            onChange={(e) =>
                              handleChange("buyerType", e.target.value)
                            }
                            value="Garment"
                          />
                          <span></span>
                        </section>{" "}
                        Garment
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
                        Dying
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
                        Washing
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
                  {formData.buyerType === "Garment" ? (
                    <>
                      <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Garment <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={formData.buyerId}
                          name="buyerId"
                          menuShouldScrollIntoView={false}
                          isClearable
                          placeholder="Select Garment"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                          options={
                            (garments || []).map(({ id, name }: any) => ({
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
                        {errors?.buyerId && (
                          <div className="text-sm text-red-500">
                            {errors.buyerId}
                          </div>
                        )}
                      </div>
                    </>
                  ) : formData.buyerType === "Dyeing" ? (
                    <>
                      <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Dying <span className="text-red-500">*</span>
                        </label>
                        <Select
                          name="fabricId"
                          value={formData.fabricId}
                          menuShouldScrollIntoView={false}
                          isClearable
                          placeholder="Select Dying"
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
                          Washing <span className="text-red-500">*</span>
                        </label>
                        <Select
                          name="fabricId"
                          value={formData.fabricId}
                          menuShouldScrollIntoView={false}
                          isClearable
                          placeholder="Select Washing"
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
                  ) : formData.buyerType === "New Buyer" ? (
                    <>
                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Processor Name <span className="text-red-500">*</span>
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
                            checked={formData.transactionViaTrader === false}
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
                        Agent Details <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="transactionAgent"
                        value={formData.transactionAgent}
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
                      Finished Batch/Lot No{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      placeholder="Batch/Lot No"
                      name="batchLotNo"
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
                </div>
                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">OTHER INFORMATION:</h4>
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
                        Transporter Name <span className="text-red-500">*</span>
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
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
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
                  <h4 className="text-md font-semibold">OTHER DOCUMENTS:</h4>
                  <div className="row">
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
                        Invoice Files <span className="text-red-500">*</span>
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
                        fileName.invoiceFile.map((item: any, index: any) => (
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
                      onClick={handleSubmit}
                    >
                      SUBMIT
                    </button>
                    <button
                      className="btn-outline-purple"
                      onClick={() => {
                        router.push("/weaver/weaver-sales");
                        sessionStorage.removeItem("salesData");
                        sessionStorage.removeItem("chooseFabric");
                      }}
                    >
                      CANCEL
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
