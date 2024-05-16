"use client";
import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import Form from "react-bootstrap/Form";
import User from "@lib/User";
import { GrAttachment } from "react-icons/gr";
import useTranslations from "@hooks/useTranslation";
import { DecimalFormat } from "@components/core/DecimalFormat";
import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import checkAccess from "@lib/CheckAccess";
import { useSearchParams } from "next/navigation";

export default function page() {
    const [roleLoading, hasAccesss] = useRole();
    const { translations, loading } = useTranslations();
    useTitle("Edit Sale");
    const router = useRouter();
    const search = useSearchParams();
    const saleId = search.get("id");

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
        selectedDepartment?.includes(dept.id)
    );

    useEffect(() => {
        if (garmentId) {
            getPrograms();
            getSeason();
            getBrands();
            getDepartments();
            getProcessors();
            fetchSale();
        }
    }, [garmentId]);

    useEffect(() => {
        if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
            const access = checkAccess("Garment Sale");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccesss]);

    const fetchSale = async () => {
        try {
            const res = await API.get(`garment-sales/get-sale?id=${saleId}`);
            if (res.success) {
                let data = res?.data
                setFrom(new Date(data?.date));
                setFormData({
                    date: new Date(data?.date),
                    programId: data?.program_id,
                    seasonId: data?.season_id,
                    departmentId: data?.department_id,
                    fabricOrderRef: data?.fabric_order_ref,
                    brandOrderRef: data?.brand_order_ref,
                    buyerType: data?.buyer_type,
                    buyerId: data?.buyer_id,
                    traderId: data?.trader_id,
                    transactionViaTrader: data?.transaction_via_trader,
                    transactionAgent: data?.transaction_agent,
                    shipmentAddress: data?.shipment_address,
                    garmentType: data?.garment_type,
                    styleMarkNo: data?.style_mark_no,
                    totalNoOfPieces: data?.total_no_of_pieces,
                    totalNoOfBoxes: data?.total_no_of_boxes,
                    invoiceNo: data?.invoice_no,
                    billOfLadding: data?.bill_of_ladding,
                    transportorName: data?.transportor_name,
                    contractNo: data?.contract_no,
                    tcFiles: data?.tc_file,
                    contractFile: data?.contract_file,
                    invoiceFiles: data?.invoice_files,
                    deliveryNotes: data?.delivery_notes,
                    vehicleNo: data?.vehicle_no,
                    agentDetails: data?.transaction_agent,
                })
                const fileNames = data?.invoice_files?.map((url: any) => {
                    const parts = url.split('/');
                    return parts[parts.length - 1];
                });

                const getFileId = (path: any) => (path && path.split("file/")[1]);
                setFileName({
                    contractFile: getFileId(data?.contract_file),
                    deliveryNotes: getFileId(data?.delivery_notes),
                    invoiceFiles: fileNames,
                    tcFiles: getFileId(data?.tc_file),
                });

                setSelectedDepartment(data?.department_id);
                setChooseFabricKnit(data?.total_fabric_length);
                setChooseFabricWoven(data?.total_fabric_weight);

            }
        } catch (error) {
            console.log(error);
        }
    };

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
            const res = await API.get(`garment-sales/get-brand?garmentId=${garmentId}`);
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
                setSeason(res.data);
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
            for (let i = 0; i < e.target.files.length; i++) {
                if (!e.target.files[i]) {
                    return setErrors((prevError: any) => ({
                        ...prevError,
                        [name]: "No File Selected",
                    }));
                } else {
                    if (!allowedFormats.includes(e.target.files[i]?.type)) {
                        setErrors((prevError: any) => ({
                            ...prevError,
                            [name]: "Invalid file format.Upload a valid Format",
                        }));

                        e.target.value = "";
                        return;
                    }

                    const maxFileSize = 5 * 1024 * 1024;

                    if (e.target.files[i].size > maxFileSize) {
                        setErrors((prevError: any) => ({
                            ...prevError,
                            [name]: `File size exceeds the maximum limit (5MB).`,
                        }));

                        e.target.value = "";
                        return;
                    }
                }
                dataVideo.set("file", e.target.files[i]);
                try {
                    const response = await API.postFile(url, dataVideo);
                    if (response.success) {
                        filesLink.push(response.data);
                        filesName.push(e.target.files[i].name);

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
                [e.target.name]: filesLink,
            }));
            setFileName((prevFile: any) => ({
                ...prevFile,
                [e.target.name]: filesName,
            }));
        } else {
            if (!e.target.files[0]) {
                return setErrors((prevError: any) => ({
                    ...prevError,
                    [name]: "No File Selected",
                }));
            } else {
                if (!allowedFormats.includes(e.target.files[0]?.type)) {
                    setErrors((prevError: any) => ({
                        ...prevError,
                        [name]: "Invalid file format.Upload a valid Format",
                    }));

                    e.target.value = "";
                    return;
                }

                const maxFileSize = 5 * 1024 * 1024;

                if (e.target.files[0].size > maxFileSize) {
                    setErrors((prevError: any) => ({
                        ...prevError,
                        [name]: `File size exceeds the maximum limit (5MB).`,
                    }));

                    e.target.value = "";
                    return;
                }
            }

            dataVideo.append("file", e.target.files[0]);

            try {
                const response = await API.postFile(url, dataVideo);
                if (response.success) {
                    setFileName((prevFile: any) => ({
                        ...prevFile,
                        [e.target.name]: e.target.files[0].name,
                    }));

                    setFormData((prevFormData: any) => ({
                        ...prevFormData,
                        [e.target.name]: response.data,
                    }));

                    setErrors((prevError: any) => ({
                        ...prevError,
                        [name]: "",
                    }));
                }
            } catch (error) {
                console.log(error, "error");
            }
        }
    };
    const handleChange = (event: any, val?: any) => {
        const { name, value, type } = event.target;
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
        }
        else if (name === "totalQuantity") {
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
                dataUpload(event, name);
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
            const numericValue = DecimalFormat(Number(value))
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
        "date",
        "invoiceNo",
        "vehicleNo",
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
                    return value?.length === 0 || value === null
                        ? "Season is Required"
                        : "";
                case "departmentId":
                    return value?.length === 0 || value === null
                        ? "Select Department is Required"
                        : "";
                case "date":
                    return !from ? "Date is required" : "";
                case "programId":
                    return value?.length === 0 || value === null
                        ? "Please select any one option"
                        : "";
                // case "fabricOrderRef":
                //   return regexAlphaNumeric.test(value) === false
                //     ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                //     : value.length > 50
                //       ? "Value should not exceed 50 characters"
                //       : "";
                // case "brandOrderRef":
                //   return regexAlphaNumeric.test(value) === false
                //     ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                //     : value.length > 50
                //       ? "Value should not exceed 50 characters"
                //       : "";
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
                        (value?.length === 0 || value === null)
                        ? "Select Brand is required"
                        : "";
                case "traderId":
                    return formData.buyerType === "New Buyer" &&
                        (value?.length === 0 || value === null)
                        ? "Select processor is required"
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
                case "totalNoOfBoxes":
                    return value?.trim() === ""
                        ? "No of Boxes is Required"
                        : "";
                case "totalNoOfPieces":
                    return value?.trim() === ""
                        ? "No of Pieces is Required"
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

        if (!hasGarmentErrors) {
            try {
                setIsSubmitting(true);
                const response = await API.put("garment-sales", {
                    id: saleId,
                    date: formData?.date,
                    invoiceNo: formData?.invoiceNo,
                    vehicleNo: formData?.vehicleNo
                });
                if (response.success) {
                    toasterSuccess("Sales update successfully");
                    router.push(`/garment/sales`);
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
    if (!roleLoading && !Access?.edit) {
        return (
            <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
                <h3>You doesn't have Access of this Page.</h3>
            </div>
        );
    }

    if (!roleLoading && Access?.edit) {
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
                                        <NavLink href="/garment/sales">{translations?.knitterInterface?.sale} </NavLink>{" "}
                                    </li>
                                    <li>Edit Sale</li>
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
                                                {translations?.transactions?.season}
                                            </label>
                                            <Form.Select
                                                aria-label="Default select example"
                                                className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                                                name="seasonId"
                                                value={formData.seasonId || ""}
                                                disabled
                                            >
                                                <option value="">{translations?.common?.SelectSeason}</option>
                                                {season?.map((season: any) => (
                                                    <option key={season.id} value={season.id}>
                                                        {season.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.transactions?.date} <span className="text-red-500">*</span>
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

                                        {/* {!chooseFabricKnit && !chooseFabricWoven ? ( */}
                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.program}
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
                                                                value={program.id}
                                                                onChange={handleChange}
                                                                disabled
                                                            />
                                                            <span></span>
                                                        </section>
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
                                        {/* ) : null} */}
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.department}
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
                                        {/* <div className="col-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.chooseGarment} <span className="text-red-500">*</span>
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
                                        </div> */}
                                    </div>
                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-4">
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
                                        </div>

                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.FabricOrderRef}
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                name="fabricOrderRef"
                                                value={formData.fabricOrderRef || ""}
                                                readOnly
                                                onChange={(event) => handleChange(event)}
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
                                                readOnly
                                                name="brandOrderRef"
                                                value={formData.brandOrderRef || ""}
                                                onChange={(event) => handleChange(event)}
                                                placeholder={translations?.knitterInterface?.BrandOrderReference}
                                            />
                                            {errors?.brandOrderRef !== "" && (
                                                <div className="text-sm text-red-500">
                                                    {errors.brandOrderRef}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.ChooseBuyer}
                                            </label>
                                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                <label className="mt-1 d-flex mr-4 align-items-center">
                                                    <section>
                                                        <input
                                                            type="radio"
                                                            name="buyerType"
                                                            value="Mapped"
                                                            checked={formData.buyerType === "Mapped"}
                                                            onChange={(event) => handleChange(event)}
                                                            disabled
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
                                                            onChange={(event) => handleChange(event)}
                                                            disabled
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
                                                        {translations?.common?.brand}
                                                    </label>

                                                    <Form.Select
                                                        aria-label="Default select example"
                                                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                                                        name="buyerId"
                                                        value={formData.buyerId || ""}
                                                        onChange={handleChange}
                                                        disabled
                                                    >
                                                        <option value="">{translations?.common?.Selectbrand}</option>

                                                        {brands?.map((brand: any) => (
                                                            <option key={brand.id} value={brand.id}>
                                                                {brand.brand_name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
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
                                                        {translations?.common?.selectProcesor}
                                                    </label>

                                                    <Form.Select
                                                        aria-label="Default select example"
                                                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                                                        name="traderId"
                                                        value={formData.traderId || ""}
                                                        onChange={handleChange}
                                                        disabled
                                                    >
                                                        <option value="">{translations?.common?.selectProcesor}</option>
                                                        {processors?.map((garment: any) => (
                                                            <option key={garment.id} value={garment.id}>
                                                                {garment.name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
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
                                                {translations?.common?.transactionViatrader}
                                            </label>
                                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                <label className="mt-1 d-flex mr-4 align-items-center">
                                                    <section>
                                                        <input
                                                            type="radio"
                                                            name="transactionViaTrader"
                                                            checked={formData.transactionViaTrader === true}
                                                            onChange={handleChange}
                                                            value="Yes"
                                                            className="form-radio"
                                                            disabled
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
                                                            onChange={handleChange}
                                                            value="No"
                                                            className="form-radio"
                                                            disabled
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
                                                    {translations?.common?.agentDetails}
                                                </label>
                                                <textarea
                                                    name="agentDetails"
                                                    value={formData.agentDetails}
                                                    onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                    onChange={(event) => handleChange(event)}
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    placeholder={translations?.common?.agentDetails}
                                                    disabled
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
                                                {translations?.common?.ShippingAddress}
                                            </label>
                                            <textarea
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                name="shipmentAddress"
                                                onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                value={formData.shipmentAddress || ""}
                                                onChange={(event) => handleChange(event)}
                                                placeholder={translations?.common?.ShippingAddress}
                                                rows={3}
                                                disabled
                                            />
                                            {errors.shipmentAddress && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.shipmentAddress}
                                                </p>
                                            )}
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.totalBoxes}
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
                                                {translations?.common?.totPices}
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="number"
                                                name="totalNoOfPieces"
                                                disabled
                                                value={formData.totalNoOfPieces || ""}
                                                onChange={(event) => handleChange(event)}
                                                placeholder={translations?.common?.totPices}
                                            />
                                            {errors.totalNoOfPieces && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.totalNoOfPieces}
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
                                                        {translations?.common?.invoiceNumber} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        name="invoiceNo"
                                                        value={formData.invoiceNo || ""}
                                                        onChange={(event) => handleChange(event)}
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
                                                    </label>
                                                    <input
                                                        name="billOfLadding"
                                                        value={formData.billOfLadding || ""}
                                                        readOnly
                                                        type="text"
                                                        placeholder={translations?.common?.billofladding}
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    />
                                                </div>
                                                <div className="col-12 col-sm-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.supplyChain?.number}
                                                    </label>
                                                    <input
                                                        name="contractNo"
                                                        value={formData.contractNo || ""}
                                                        type="text"
                                                        readOnly
                                                        placeholder={translations?.supplyChain?.number}
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    />
                                                </div>

                                                <div className="col-12 col-sm-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.common?.TransportName}
                                                    </label>
                                                    <input
                                                        name="transportorName"
                                                        value={formData.transportorName || ""}
                                                        readOnly
                                                        type="text"
                                                        placeholder={translations?.common?.TransportName}
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    />
                                                </div>
                                                <div className="col-6  mt-4 mb-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.transactions?.vehicleNo} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        name="vehicleNo"
                                                        value={formData.vehicleNo || ""}
                                                        onChange={(event) => handleChange(event)}
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
                                                        {translations?.knitterInterface?.ChooseFile} <GrAttachment />
                                                        <input
                                                            name="tcFiles"
                                                            type="file"
                                                            accept=".pdf,.zip, image/jpg, image/jpeg"
                                                            disabled
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
                                                        {translations?.knitterInterface?.ChooseFile} <GrAttachment />
                                                        <input
                                                            name="contractFile"
                                                            type="file"
                                                            accept=".pdf,.zip, image/jpg, image/jpeg"
                                                            disabled
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
                                                    {translations?.common?.invoice}  <span className="text-red-500">*</span>
                                                </label>
                                                <div className="inputFile">
                                                    <label>
                                                        {translations?.knitterInterface?.ChooseFile} <GrAttachment />
                                                        <input
                                                            name="invoiceFiles"
                                                            type="file"
                                                            multiple
                                                            accept=".pdf,.zip, image/jpg, image/jpeg"
                                                            disabled
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
                                                    fileName.invoiceFiles?.map((item: any, index: any) => (
                                                        <div className="flex text-sm mt-1" key={index}>
                                                            <GrAttachment />
                                                            <p className="mx-1">{item}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.common?.DeliveryNotes}
                                                </label>
                                                <div className="inputFile">
                                                    <label>
                                                        {translations?.knitterInterface?.ChooseFile}  <GrAttachment />
                                                        <input
                                                            name="deliveryNotes"
                                                            type="file"
                                                            accept=".pdf,.zip, image/jpg, image/jpeg"
                                                            disabled
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
                                                            : { cursor: "pointer", backgroundColor: "#D15E9C" }
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
