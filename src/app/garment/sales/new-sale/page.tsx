"use client";
import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import User from "@lib/User";
import { GrAttachment } from "react-icons/gr";
import useTranslations from "@hooks/useTranslation";
import { DecimalFormat } from "@components/core/DecimalFormat";
import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";

export default function page() {
  const [roleLoading, hasAccesss] = useRole();
  const { translations, loading } = useTranslations();
  useTitle(translations?.knitterInterface?.newsale);
  const router = useRouter();
  const [from, setFrom] = useState<Date | null>(new Date());
  const [program, setProgram] = useState([]);
  const [season, setSeason] = useState<any>();
  const [brands, setBrands] = useState<any>();
  const [departments, setDepartments] = useState<any>([]);
  const [processors, setProcessors] = useState<any>([]);
  const [chooseFabricKnit, setChooseFabricKnit] = useState<any>(0);
  const [selectedDepartment, setSelectedDepartment] = useState<any>([]);
  const [chooseFabricWoven, setChooseFabricWoven] = useState<any>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const garmentId = User.garmentId;
  const [Access, setAccess] = useState<any>({});

  const [formData, setFormData] = useState<any>({
    garmentId: null,
    date: new Date().toISOString(),
    programId: null,
    seasonId: null,
    fabricOrderRef: "",
    brandOrderRef: "",
    buyerType: "",
    buyerId: null,
    traderId: null,
    transactionViaTrader: false,
    transactionAgent: "",
    shipmentAddress: "",
    garmentType: null,
    styleMarkNo: null,
    totalNoOfPieces: "",
    totalNoOfBoxes: "",
    invoiceNo: "",
    billOfLadding: "",
    transportorName: "",
    contractNo: "",
    tcFiles: "",
    contractFile: "",
    invoiceFiles: [],
    deliveryNotes: "",
    vehicleNo: "",
    agentDetails: "",
  });

  const [fileName, setFileName] = useState({
    contractFile: "",
    deliveryNotes: "",
    invoiceFiles: [],
    tcFiles: "",
  });
  const [chooseyarnData, setchooseyarnData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const matchingDepartments = departments.filter((dept: any) =>
    selectedDepartment.includes(dept.id)
  );

  useEffect(() => {
    if (garmentId) {
      getPrograms();
      getSeason();
      getBrands();
      getDepartments();
      getProcessors();
    }
  }, [garmentId]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
      const access = checkAccess("Garment Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    const savedData: any = sessionStorage.getItem("garmentSaleData");
    const files: any = sessionStorage.getItem("fileName");

    const processData = JSON.parse(savedData);
    const filesData = JSON.parse(files);
    if (processData) {
      setFormData(processData);
      setFrom(processData?.date === null ? null : new Date(processData?.date));
    }
    if (filesData) {
      setFileName(filesData);
    }
  }, []);

  useEffect(() => {
    const storedTotal = sessionStorage.getItem("selectedData");
    if (storedTotal !== null && storedTotal !== undefined) {
      const chooseYarnItems = JSON.parse(storedTotal);
      setchooseyarnData(chooseYarnItems);

      if (chooseYarnItems && chooseYarnItems.length > 0) {
        // const chooseYarnItems = parsedTotal.filter(
        //   (item: any) => item.type === "choosefabric"
        // );

        const chooseNoOfPieces = chooseYarnItems.map((item: any) =>
          Number(item.no_of_pieces)
        );

        const chooseNoOfBoxes = chooseYarnItems.map((item: any) =>
          Number(item.no_of_boxes)
        );

        const totalPieces = chooseNoOfPieces.reduce(
          (acc: any, curr: any) => +acc + +curr,
          0
        );

        const totalBoxes = chooseNoOfBoxes.reduce(
          (acc: any, curr: any) => +acc + +curr,
          0
        );
        const uniqueDepartmentIds = [
          ...new Set(chooseYarnItems.map((item: any) => item.department)),
        ];

        if (chooseYarnItems) {
          let garmentType: any = [];
          let styleMarkNo: any = [];
          let color: any = [];
          let garmentSize: any = [];
          let NoOfPieces: any = [];
          let NoOfBoxes: any = [];

          chooseYarnItems.forEach((item: any) => {
            garmentType = [...garmentType, item?.garment_type];
            styleMarkNo = [...styleMarkNo, item?.style_mark_no];
            color = [...color, item.color];
            garmentSize = [...garmentSize, item?.garment_size];
            NoOfPieces = [...NoOfPieces, item?.no_of_pieces];
            NoOfBoxes = [...NoOfBoxes, item?.no_of_boxes];
          });

          setFormData((pre: any) => ({
            ...pre,
            garmentType,
            styleMarkNo,
            color,
            garmentSize,
            NoOfPieces,
            NoOfBoxes,
          }));
        }

        setSelectedDepartment(uniqueDepartmentIds);
        const brandOrderSet = new Set(
          chooseYarnItems?.map((item: any) => item.brandOrderRef)
        );
        const brandOrder = [...brandOrderSet].join(", ");

        const fabricOrderSet = new Set(
          chooseYarnItems?.map((item: any) => item.garmentOrderRef)
        );
        const fabricOrder = [...fabricOrderSet].join(", ");

        setFormData((prevFormData: any) => ({
          ...prevFormData,
          brandOrderRef: brandOrder,
          fabricOrderRef: fabricOrder,
          totalNoOfPieces: totalPieces,
          totalNoOfBoxes: totalBoxes,
        }));
      }
    }
  }, []);

  const getDepartments = async () => {
    const url = "department?status=true";
    try {
      const response = await API.get(url);
      setDepartments(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getBrands = async () => {
    try {
      const res = await API.get(
        `garment-sales/get-brand?garmentId=${garmentId}`
      );
      if (res.success) {
        setBrands(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getProcessors = async () => {
    try {
      const res = await API.get("garment-sales/get-buyer-processors");
      if (res.success) {
        setProcessors(res.data);
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
        `garment-sales/get-program?garmentId=${garmentId}`
      );
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  //   const handleFrom = (date: any) => {
  //     let d = date ? new Date(date) : null;

  //     if (d) {
  //         d.setHours(d.getHours() + 5);
  //         d.setMinutes(d.getMinutes() + 30);
  //     }

  //     const newDate: any = d ? d.toISOString() : null;

  //     setFrom(d);
  //     setFormData((prevFormData: any) => ({
  //         ...prevFormData,
  //         date: newDate,
  //     }));
  // };

  const handleFrom = (date: any) => {
    let d: any = date ? new Date(date) : null;
    if (d) {
      d.setHours(d.getHours() + 5);
      d.setMinutes(d.getMinutes() + 30);
    }
    const newDate: any = d ? d.toISOString() : null;
    setFrom(d);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      date: newDate,
    }));
  };
  const getChooseFabric = (type: string) => {
    if (formData.programId) {
      for (const key in formData) {
        if (formData[key] === undefined) {
          formData[key] = null;
        }
      }
      sessionStorage.setItem("garmentSaleData", JSON.stringify(formData));
      sessionStorage.setItem("fileName", JSON.stringify(fileName));
      router.push(
        `/garment/sales/choose-garment?id=${formData.programId}&type=${type}`
      );
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to choose Garment",
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
    if (name === "invoiceFiles") {
      let filesLink: any = [...formData.invoiceFiles];
      let filesName: any = [...fileName.invoiceFiles];

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
    // const { name, value, type } = event.target;
    if (name === "programId" || name === "buyerType") {
      if (name === "buyerType") {
        setFormData((prevData: any) => ({
          ...prevData,
          buyerId: null,
          traderId: null,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
        }));
      }
    }
    if (name === "transactionViaTrader") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: value === "Yes" ? true : false,
        agentDetails: value === "No" ? "" : prevFormData.agentDetails,
      }));
    } else if (name === "totalQuantity") {
      const selectedValues = Array.isArray(formData.totalQuantity)
        ? formData.totalQuantity
        : [];

      const updatedTotalQuantity = selectedValues.includes(value)
        ? selectedValues.filter((item: any) => item !== value)
        : [...selectedValues, value];

      setFormData((prevData: any) => ({
        ...prevData,
        totalQuantity: updatedTotalQuantity,
      }));
    } else {
      if (
        name === "contractFile" ||
        name === "deliveryNotes" ||
        name === "invoiceFiles" ||
        name === "tcFiles"
      ) {
        dataUpload(value, name);
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
    const errors = {};

    const validateAlphabets = () => {
      const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
      const valid = regexAlphabets.test(value);
      return valid
        ? ""
        : "Accepts only Alphabets and special characters like comma(,),_,-,(),.";
    };

    const validateNumbers = () => {
      return Number(value) <= 0 ? "Value should be more than 0" : "";
    };

    const validatePercentage = () => {
      return Number(value) < 0 || Number(value) > 100
        ? "Percentage value should be in between 0 and 100"
        : "";
    };

    const validateNumeric = () => {
      const numericValue = DecimalFormat(Number(value));
      setFormData((prevData: any) => ({ ...prevData, [name]: numericValue }));
      return Number(value) <= 0 ? "Value should be more than 0" : "";
    };

    const validateAlphaNumeric = () => {
      const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
      const valid = regexAlphaNumeric.test(value);
      return valid
        ? ""
        : "Accepts only AlphaNumeric values and special characters like comma(,),.,_,-,()";
    };

    const validateBill = () => {
      const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;
      const valid = regexBillNumbers.test(value);
      return valid
        ? ""
        : "Accepts only AlphaNumeric values and special characters like comma(,),_,-,(),/";
    };

    const validationFunctions: any = {
      alphabets: validateAlphabets,
      numbers: validateNumbers,
      percentage: validatePercentage,
      numeric: validateNumeric,
      alphaNumeric: validateAlphaNumeric,
      bill: validateBill,
    };

    const validationMessage = validationFunctions[type]();

    setErrors((prev: any) => ({ ...prev, [name]: validationMessage }));
  };

  const requireGarmentFields = [
    "seasonId",
    "departmentId",
    "date",
    "programId",
    "brand",
    "buyerType",
    "garmentType",
    "styleMarkNo",
    "contractNo",
    "buyerId",
    "traderId",
    "shipmentAddress",
    "transportorName",
    "agentDetails",
    "transactionAgent",
    "processor",
    "transactionViaTrader",
    "invoiceNo",
    "vehicleNo",
    "billOfLadding",
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

    if (requireGarmentFields.includes(name)) {
      switch (name) {
        case "seasonId":
          return value?.length === 0 || value === null || value === undefined
            ? "Season is Required"
            : "";
        case "departmentId":
          return value?.length === 0 || value === null
            ? "Select Department is Required"
            : "";
        case "date":
          return !from ? "Date is Required" : "";
        case "programId":
          return value?.length === 0 || value === null
            ? "Please select any one option"
            : "";
        case "contractNo":
          return regexAlphaNumeric.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
            : value.length > 50
            ? "Value should not exceed 50 characters"
            : "";
        case "invoiceFiles":
          return value?.length === 0 || value === null
            ? "Invoice File is Required"
            : "";
        case "transportorName":
          return value?.trim() === ""
            ? "Transporter Name is Required"
            : regexAlphabets.test(value) === false
            ? "Accepts only Alphabets and special characters like comma(,),_,-,(),."
            : value.length > 50
            ? "Value should not exceed 50 characters"
            : "";
        case "vehicleNo":
          return value?.trim() === ""
            ? "Vehicle Number is Required"
            : regexAlphaNumeric.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
            : value.length > 50
            ? "Value should not exceed 50 characters"
            : "";
        case "billOfLadding":
          return value?.trim() === ""
            ? "LR/BR No is Required"
            : regexAlphaNumeric.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
            : value.length > 50
            ? "Value should not exceed 50 characters"
            : "";
        case "buyerId":
          return formData.buyerType === "Mapped" &&
            (value?.length === 0 || value === null || value === undefined)
            ? "Select Brand is Required"
            : "";
        case "traderId":
          return formData.buyerType === "New Buyer" &&
            (value?.length === 0 || value === null || value === undefined)
            ? "Select processor is Required"
            : "";
        case "transactionAgent":
          return regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "buyerType":
          return value.trim() === "" ? "Please select any one option" : "";
        case "shipmentAddress":
          return value?.trim() === ""
            ? "Shipment Address is Required"
            : regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        case "agentDetails":
          return formData.transactionViaTrader === true && value.trim() === ""
            ? "Agent Details is Required"
            : "";
        case "invoiceNo":
          return value?.trim() === ""
            ? "Invoice No is Required"
            : regexBillNumbers.test(value) === false
            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
            : "";
        default:
          return "";
      }
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const newGarmentErrors: any = {};
    Object.keys(formData).forEach((fieldName: string) => {
      newGarmentErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "garment"
      );
    });

    const hasGarmentErrors = Object.values(newGarmentErrors).some(
      (error) => !!error
    );

    if (hasGarmentErrors) {
      setErrors(newGarmentErrors);
    }
    if (
      formData?.totalNoOfPieces === null ||
      (formData?.totalNoOfBoxes &&
        (formData?.totalNoOfPieces === null || formData?.totalNoOfBoxes <= 0))
    ) {
      setErrors((prev: any) => ({
        ...prev,
        quatAddFab: "Choose Fabric is Required",
      }));
      return;
    }
    if (!hasGarmentErrors) {
      try {
        setIsSubmitting(true);
        const response = await API.post("garment-sales", {
          ...formData,
          garmentId: garmentId,
          chooseGarment: chooseyarnData,
          departmentId: selectedDepartment,
          // totalFabricLength: chooseFabricKnit,
          // totalFabricWeight: chooseFabricWoven,
          garmentType: formData.garmentType,
          styleMarkNo: formData.styleMarkNo,
          transactionAgent: formData?.agentDetails,
        });
        if (response.success) {
          toasterSuccess("Sales created successfully");
          sessionStorage.removeItem("garmentSaleData");
          sessionStorage.removeItem("selectedData");
          sessionStorage.removeItem("fileName");
          router.push(
            `/garment/sales/transaction-summary?id=${response.data?.id}`
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

  const removeImage = (index: any) => {
    let filename = fileName.invoiceFiles;
    let fileLink = formData.invoiceFiles;
    let arr1 = filename.filter((element: any, i: number) => index !== i);
    let arr2 = fileLink.filter((element: any, i: number) => index !== i);
    setFileName((prevData: any) => ({
      ...prevData,
      invoiceFiles: arr1,
    }));
    setFormData((prevData: any) => ({
      ...prevData,
      invoiceFiles: arr2,
    }));
  };
  if (loading) {
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
      <>
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li>
                    <NavLink href="/garment/dashboard" className="active">
                      <span className="icon-home"></span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink href="/garment/sales">
                      {translations?.knitterInterface?.sale}{" "}
                    </NavLink>{" "}
                  </li>
                  <li>{translations?.knitterInterface?.newsale} </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4">
            <div className="w-100">
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
                    <div className="col-12 col-sm-6 my-2">
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

                    {!chooseFabricKnit && !chooseFabricWoven ? (
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
                    ) : null}
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.department}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="departmentId"
                        value={
                          matchingDepartments.map(
                            (data: any) => data.dept_name,
                            ","
                          ) || ""
                        }
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        onChange={(event) => handleChange(event)}
                        placeholder={translations?.department}
                        readOnly
                      />
                    </div>
                    <div className="col-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.chooseGarment}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <button
                        name="chooseYarn"
                        type="button"
                        onClick={() => getChooseFabric("choosefabric")}
                        className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                      >
                        {translations?.knitterInterface?.chooseGarment}
                      </button>
                      {errors?.quatAddFab && (
                        <div className="text-sm text-red-500">
                          {errors.quatAddFab}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    {/* <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.common?.totallength}
                      </label>
                      <input
                        name="knit"
                        value={chooseFabricKnit || 0}
                        onChange={(event) => handleChange(event)}
                        type="text"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.common?.totalweight}
                      </label>
                      <input
                        name="weight"
                        value={chooseFabricWoven || 0}
                        onChange={(event) => handleChange(event)}
                        type="text"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        readOnly
                      />
                    </div> */}
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.common?.totalBoxes}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        name="totalNoOfBoxes"
                        value={formData.totalNoOfBoxes || ""}
                        placeholder=" No of Boxes"
                        readOnly
                      />
                      {errors.totalNoOfBoxes && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.totalNoOfBoxes}
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.common?.totPices}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        name="totalNoOfPieces"
                        value={formData.totalNoOfPieces || ""}
                        placeholder={translations?.common?.totPices}
                        readOnly
                      />
                    </div>

                    <div className=" col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.common?.FabricOrderRef}
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="fabricOrderRef"
                        disabled
                        value={formData.fabricOrderRef || ""}
                        placeholder={translations?.common?.FabricOrderRef}
                      />
                      {errors?.fabricOrderRef !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.fabricOrderRef}
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
                        name="brandOrderRef"
                        disabled
                        value={formData.brandOrderRef || ""}
                        placeholder={
                          translations?.knitterInterface?.BrandOrderReference
                        }
                      />
                      {errors?.brandOrderRef !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.brandOrderRef}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        {translations?.knitterInterface?.ChooseBuyer}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                        <label className="mt-1 d-flex mr-4 align-items-center">
                          <section>
                            <input
                              type="radio"
                              name="buyerType"
                              value="Mapped"
                              checked={formData.buyerType === "Mapped"}
                              onChange={(e) =>
                                handleChange("buyerType", e.target.value)
                              }
                            />
                            <span></span>
                          </section>
                          Mapped
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
                          New Buyer
                        </label>
                      </div>
                      {errors?.buyerType !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.buyerType}
                        </div>
                      )}
                    </div>

                    {formData.buyerType === "Mapped" && (
                      <>
                        <div className="col-6 mt-4 ">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.brand}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          {/* 
                          <Form.Select
                            aria-label="Default select example"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                            name="buyerId"
                            value={formData.buyerId || ""}
                            onChange={handleChange}
                          >
                            <option value="">{translations?.common?.Selectbrand}</option>

                            {brands?.map((brand: any) => (
                              <option key={brand.id} value={brand.id}>
                                {brand.brand_name}
                              </option>
                            ))}
                          </Form.Select> */}
                          <Select
                            name="buyerId"
                            value={
                              formData.buyerId
                                ? {
                                    label: brands?.find(
                                      (brand: any) =>
                                        brand.id === formData.buyerId
                                    )?.brand_name,
                                    value: formData.buyerId,
                                  }
                                : null
                            }
                            menuShouldScrollIntoView={false}
                            isClearable
                            placeholder="Select Brand"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={(brands || []).map(
                              ({ id, brand_name }: any) => ({
                                label: brand_name,
                                value: id,
                                key: id,
                              })
                            )}
                            onChange={(item: any) => {
                              handleChange("buyerId", item?.value);
                            }}
                          />
                          {errors?.buyerId !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.buyerId}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {formData.buyerType === "New Buyer" && (
                      <>
                        <div className="col-6 mt-4 ">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.selectProcesor}{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          {/* <Form.Select
                            aria-label="Default select example"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                            name="traderId"
                            value={formData.traderId || ""}
                            onChange={handleChange}
                          >
                            <option value="">{translations?.common?.selectProcesor}</option>
                            {processors?.map((garment: any) => (
                              <option key={garment.id} value={garment.id}>
                                {garment.name}
                              </option>
                            ))}
                          </Form.Select> */}
                          <Select
                            name="traderId"
                            value={
                              formData.traderId
                                ? {
                                    label: processors?.find(
                                      (trader: any) =>
                                        trader.id === formData.traderId
                                    )?.name,
                                    value: formData.traderId,
                                  }
                                : null
                            }
                            menuShouldScrollIntoView={false}
                            isClearable
                            placeholder={translations?.common?.selectProcesor}
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={(processors || []).map(
                              ({ id, name }: any) => ({
                                label: name,
                                value: id,
                                key: id,
                              })
                            )}
                            onChange={(item: any) => {
                              handleChange("traderId", item?.value);
                            }}
                          />
                          {errors?.traderId !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.traderId}
                            </div>
                          )}
                        </div>
                      </>
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
                        {translations?.common?.ShippingAddress}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="shipmentAddress"
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        value={formData.shipmentAddress || ""}
                        onChange={(e) =>
                          handleChange("shipmentAddress", e.target.value)
                        }
                        placeholder={translations?.common?.ShippingAddress}
                        rows={3}
                      />
                      {errors.shipmentAddress && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.shipmentAddress}
                        </p>
                      )}
                    </div>
                    <hr className="mt-4" />
                    <div className="mt-4">
                      <h4 className="text-md font-semibold">
                        {translations?.knitterInterface?.info}:
                      </h4>
                      <div className="row">
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.invoiceNumber}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            name="invoiceNo"
                            value={formData.invoiceNo || ""}
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

                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.billofladding}
                            <span className="text-red-500">*</span>
                          </label>

                          <input
                            name="billOfLadding"
                            value={formData.billOfLadding || ""}
                            onChange={(e) =>
                              handleChange("billOfLadding", e.target.value)
                            }
                            onBlur={(e) => onBlur(e, "bill")}
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
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.supplyChain?.number}
                          </label>

                          <input
                            name="contractNo"
                            value={formData.contractNo || ""}
                            onChange={(e) =>
                              handleChange("contractNo", e.target.value)
                            }
                            onBlur={(e) => onBlur(e, "alphaNumeric")}
                            type="text"
                            placeholder={translations?.supplyChain?.number}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errors.contractNo && (
                            <p className="text-red-500  text-sm mt-1">
                              {errors.contractNo}
                            </p>
                          )}
                        </div>

                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.TransportName}{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <input
                            name="transportorName"
                            value={formData.transportorName || ""}
                            onChange={(e) =>
                              handleChange("transportorName", e.target.value)
                            }
                            onBlur={(e) => onBlur(e, "alphabets")}
                            type="text"
                            placeholder={translations?.common?.TransportName}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errors.transportorName && (
                            <p className="text-red-500  text-sm mt-1">
                              {errors.transportorName}
                            </p>
                          )}
                        </div>
                        <div className="col-6  mt-4 mb-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.transactions?.vehicleNo}{" "}
                            <span className="text-red-500">*</span>
                          </label>

                          <input
                            name="vehicleNo"
                            value={formData.vehicleNo || ""}
                            onChange={(e) =>
                              handleChange("vehicleNo", e.target.value)
                            }
                            onBlur={(e) => onBlur(e, "alphaNumeric")}
                            type="text"
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
                            {translations?.knitterInterface?.ChooseFile}{" "}
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
                            {translations?.knitterInterface?.ChooseFile}{" "}
                            <GrAttachment />
                            <input
                              name="invoiceFiles"
                              type="file"
                              multiple
                              accept=".pdf,.zip, image/jpg, image/jpeg"
                              onChange={(e) =>
                                handleChange("invoiceFiles", e?.target?.files)
                              }
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
                          fileName.invoiceFiles?.map(
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

                    <div>
                      <hr className="mt-5 mb-5" />
                      <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                        <button
                          disabled={isSubmitting}
                          style={
                            isSubmitting
                              ? { cursor: "not-allowed", opacity: 0.8 }
                              : {
                                  cursor: "pointer",
                                  backgroundColor: "#D15E9C",
                                }
                          }
                          className="btn-purple mr-2"
                          onClick={handleSubmit}
                        >
                          {translations?.common?.submit}
                        </button>

                        <button
                          className="btn-outline-purple"
                          onClick={() => {
                            router.push("/garment/sales");
                            sessionStorage.removeItem("garmentSaleData");
                            sessionStorage.removeItem("selectedData");
                            sessionStorage.removeItem("fileName");
                          }}
                        >
                          {translations?.common?.cancel}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
