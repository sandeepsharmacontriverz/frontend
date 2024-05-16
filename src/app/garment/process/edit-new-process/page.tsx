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
import Select from "react-select";
import { GrAttachment } from "react-icons/gr";
import useTranslations from "@hooks/useTranslation";
import { DecimalFormat } from "@components/core/DecimalFormat";
import checkAccess from "@lib/CheckAccess";
import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import { useSearchParams } from "next/navigation";


export default function page() {
    const [roleLoading, hasAccesss] = useRole();

    const { translations, loading } = useTranslations();
    useTitle("Edit Process");

    const search = useSearchParams();
    const processId = search.get("id");
    const router = useRouter();
    const [from, setFrom] = useState<Date | null>(new Date());
    const [program, setProgram] = useState([]);
    const [season, setSeason] = useState<any>();
    const [departments, setDepartments] = useState<any>([]);
    const [chooseFabricknit, setChooseFabricknit] = useState<any>(0);
    const [chooseFabricweaver, setChooseFabricknitweaver] = useState<any>(0);
    const [wasteWightknit, setWasteWeightknit] = useState<any>([]);
    const [wasteWightWeaver, setWasteWeaver] = useState<any>([]);
    const [garmenttype, setGarmentType] = useState<any>([]);
    const [styleMark, setStyleMark] = useState<any>([]);

    const [additionalknit, setadditionalknit] = useState<any>(0);
    const [additionalWeaver, setadditionalWeaver] = useState<any>(0);
    const [Access, setAccess] = useState<any>({});

    const [totalknit, setTotalknitData] = useState<any>([]);
    const [totalWeav, setTotalWeavdata] = useState<any>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fields, setFields] = useState(1);
    const garmentId = User.garmentId;

    const [formData, setFormData] = useState<any>({
        garmentId: "",
        date: new Date().toISOString(),
        programId: null,
        seasonId: null,
        departmentId: null,
        fabricOrderRef: "",
        brandOrderRef: "",
        factoryLotNo: "",
        reelLotNo: "",
        fabricLength: "",
        additionalFabricLength: "",
        additionalFabricWeight: "",
        totalFabricWeight: "",
        wastePercentage: "",
        wasteWeight: "",
        wasteLength: "",
        wasteFabricSoldTo: "",
        wasteFabricInvoice: "",
        physicalTraceabilty: null,
        embroideringRequired: "",
        processorName: "",
        address: "",
        processName: "",
        embNoOfPieces: "",
        processLoss: "",
        finalNoOfPieces: "",
        total_fabric_length: null,
        total_fabric_weight: null,
    });

    const [fileName, setFileName] = useState({
        wasteFabricInvoice: "",
    });
    const [errors, setErrors] = useState<any>({});
    const [otherData, setotherdata] = useState<any>({
        styleMarkNo: [""],
        garmentSize: [""],
        color: [""],
        noOfPieces: [""],
        noOfBoxes: [""],
        finishedGarmentImage: [""],
        garmentType: [""],
    });

    useEffect(() => {
        if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
            const access = checkAccess("Garment Process");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccesss]);

    useEffect(() => {
        const sum = otherData.noOfPieces?.reduce(
            (acc: any, val: any) => acc + parseInt(val, 10),
            0
        );
        setFormData((prevFormData: any) => ({
            ...prevFormData,
            embNoOfPieces: sum,
        }));
    }, [otherData.noOfPieces]);

    const [chooseyarnData, setchooseyarnData] = useState({
        id: "",
        qtyUsed: "",
        totalQty: "",
    });

    useEffect(() => {
        if (garmentId) {
            getPrograms();
            getSeason();
            getDepartments();
            getGarmentType()
            getStyleMarkNo()
            fetchProcess();
        }
    }, [garmentId]);
    //     const savedData: any = sessionStorage.getItem("garmentNewProcessData");
    //     const savedData2: any = sessionStorage.getItem("otherData");
    //     const processData = JSON.parse(savedData);
    //     const processData2 = JSON.parse(savedData2);
    //     if (processData) {
    //         setFormData(processData);
    //     }
    //     if (processData2) {
    //         setotherdata(processData2);
    //     }
    // }, []);

    // useEffect(() => {
    //     const storedTotal = sessionStorage.getItem("selectedData");

    //     if (storedTotal) {
    //         const parsedTotal = JSON.parse(storedTotal);
    //         setchooseyarnData(parsedTotal);

    //         if (parsedTotal && parsedTotal.length > 0) {
    //             const chooseYarnItems = parsedTotal.filter(
    //                 (item: any) => item.type === "choosefabric"
    //             );
    //             const chooseAddItems = parsedTotal.filter(
    //                 (item: any) => item.type === "addfabric"
    //             );

    //             const calculateTotal = (items: any, processorToExclude: any) => {
    //                 return items
    //                     .map((item: any) =>
    //                         item.processor !== processorToExclude ? item.qtyUsed : 0
    //                     )
    //                     .reduce((acc: any, curr: any) => +acc + +curr, 0);
    //             };

    //             const totalChooseYarn = calculateTotal(chooseYarnItems, "weaver");
    //             const totalChooseYarnWeav = calculateTotal(chooseYarnItems, "knitter");

    //             setChooseFabricknit(totalChooseYarn);
    //             setChooseFabricknitweaver(totalChooseYarnWeav);

    //             const totaladditionalknit = calculateTotal(chooseAddItems, "weaver");
    //             const totaladditionalweav = calculateTotal(chooseAddItems, "knitter");

    //             setadditionalknit(totaladditionalknit);
    //             setadditionalWeaver(totaladditionalweav);

    //             const totalknittedData = totalChooseYarn + totaladditionalknit;
    //             setTotalknitData(totalknittedData);

    //             const totalWeaverData = totalChooseYarnWeav + totaladditionalweav;
    //             setTotalWeavdata(totalWeaverData);
    //         }
    //     }
    // }, []);

    useEffect(() => {
        const wasteWeight = (totalknit * formData.wastePercentage) / 100;
        setWasteWeightknit(DecimalFormat(wasteWeight));
    }, [totalknit, formData.wastePercentage]);

    useEffect(() => {
        const wasteWeightweav = (totalWeav * formData.wastePercentage) / 100;
        setWasteWeaver(DecimalFormat(wasteWeightweav));
    }, [totalknit, formData.wastePercentage]);

    useEffect(() => {
        if (formData.programId) {
            const foundProgram: any = program?.find(
                (program: any) => program.id == formData.programId
            );
            if (foundProgram && foundProgram?.program_name?.toLowerCase() === "reel") {
                getReellotno();
            } else {
                setFormData((prev: any) => ({
                    ...prev,
                    reelLotNo: "",
                }));
            }
        }
    }, [program, formData.programId]);

    const fetchProcess = async () => {
        try {
            const res = await API.get(`garment-sales/process/get-process?id=${processId}`);
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
                    factoryLotNo: data?.factory_lot_no,
                    reelLotNo: data?.reel_lot_no,
                    fabricLength: data?.fabric_length,
                    additionalFabricLength: data?.additional_fabric_length,
                    additionalFabricWeight: data?.additional_fabric_weight,
                    totalFabricWeight: data?.total_fabric_weight,
                    wastePercentage: data?.total_waste_perct,
                    wasteWeight: data?.waste_weight,
                    wasteLength: data?.waste_length,
                    wasteFabricSoldTo: data?.waste_fabric_sold_to,
                    wasteFabricInvoice: data?.waste_fabric_invoice,
                    physicalTraceabilty: data?.physical_traceablity,
                    embroideringRequired: data?.embroidering_required,
                    processorName: data?.embroidering?.processor_name,
                    address: data?.embroidering?.address,
                    processName: data?.embroidering?.process_name,
                    embNoOfPieces: data?.embroidering?.no_of_pieces,
                    processLoss: data?.embroidering?.process_loss,
                    finalNoOfPieces: data?.no_of_pieces,
                    total_fabric_length: data?.total_fabric_length,
                    total_fabric_weight: data?.total_fabric_weight,
                })
                const fileNames = data?.finished_garment_image?.map((url: any) => {
                    const parts = url.split('/');
                    return parts[parts.length - 1];
                });

                setotherdata({
                    styleMarkNo: data?.style_mark_no,
                    garmentSize: data?.garment_size,
                    color: data?.color,
                    noOfPieces: data?.no_of_pieces,
                    noOfBoxes: data?.no_of_boxes,
                    finishedGarmentImage: fileNames,
                    garmentType: data?.garment_type,
                });
                setFields(data?.style_mark_no?.length);
                const getFileId = (path: any) => (path && path.split("file/")[1]);
                setFileName({
                    wasteFabricInvoice: getFileId(data?.waste_fabric_invoice),
                });

                setTotalknitData(+data?.total_fabric_weight + +data?.additional_fabric_length);
                setTotalWeavdata(+data?.total_fabric_weight + +data?.additional_fabric_weight);

            }
        } catch (error) {
            console.log(error);
        }
    };

    const getReellotno = async () => {
        const url = `garment-sales/get-reel-lot-no?garmentId=${garmentId}`;
        try {
            const response = await API.get(url);
            setFormData((prev: any) => ({
                ...prev,
                reelLotNo: response.data.reelLotNo,
            }));
        } catch (error) {
            console.log(error, "error");
        }
    };

    const getDepartments = async () => {
        const url = `department?status=true`;
        try {
            const response = await API.get(url);
            setDepartments(response.data);
        } catch (error) {
            console.log(error, "error");
        }
    };

    const getGarmentType = async () => {
        const url = `garment-type?status=true`;
        try {
            const response = await API.get(url);
            setGarmentType(response.data);
        } catch (error) {
            console.log(error, "error");
        }
    };

    const getStyleMarkNo = async () => {
        const url = "style-mark?status=true";
        try {
            const response = await API.get(url);
            setStyleMark(response.data);
        } catch (error) {
            console.log(error, "error");
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
    const getChooseFabric = (type: string) => {
        if (formData.programId) {
            sessionStorage.setItem("garmentNewProcessData", JSON.stringify(formData));
            sessionStorage.setItem("otherData", JSON.stringify(otherData));
            router.push(
                `/garment/process/choose-fabric?id=${formData.programId}&type=${type}`
            );
        } else {
            setErrors((prev: any) => ({
                ...prev,
                programId: "Select a program to choose yarn",
            }));
        }
    };
    const handleChange = (event: any, val?: any, field?: any, index?: any) => {
        const { name, value } = event.target;
        if (name === "processLoss" || name === "wastePercentage") {
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
        if (name === "transactionViaTrader" && value === "No") {
            setErrors((prevErrors: any) => ({
                ...prevErrors,
                transactionViaTrader: "",
            }));
        }
        if (name === "embroideringRequired" || name === "transactionViaTrader") {
            setFormData((prevFormData: any) => ({
                ...prevFormData,
                [name]: value === "Yes" ? true : false,
            }));
        } else if (name === "wasteFabricInvoice") {
            dataUpload(event, name);
            return;
        } else
            setFormData((prevData: any) => ({
                ...prevData,
                [name]: value,
            }));
        setErrors((prev: any) => ({
            ...prev,
            [name]: "",
        }));
    };
    const handleFileChange = (event: any, index: any) => {
        const updatedFiles = [...otherData.finishedGarmentImage];
        const files = event.target.files;

        if (files && files.length > 0) {
            updatedFiles[index] = files[0].name;

            setotherdata((prev: any) => ({
                ...prev,
                finishedGarmentImage: updatedFiles,
            }));
        }
    };
    const handleChangeAdd = (event: any, index: any, id?: any) => {
        const updateErrors: any = { ...errors };
        if (event === `garmentType${id}` || event === `styleMarkNo${id}`) {
            setotherdata((pre: any) => {
                const updateStylemark = [...pre.styleMarkNo];
                const updateGarmentType = [...pre.garmentType];

                const updateArray = (array: any, value: any) => {
                    if (array.length <= id) {
                        array.push(value?.toString())
                    } else {
                        array[id] = value?.toString()
                    }
                    updateErrors[`styleMarkNo${id}`] = "";
                };

                if (event === `styleMarkNo${id}`) {
                    updateArray(updateStylemark, index?.value);
                }
                if (event === `garmentType${id}`) {
                    updateArray(updateGarmentType, index?.value);
                }

                return {
                    ...pre,
                    styleMarkNo: updateStylemark,
                    garmentType: updateGarmentType
                };
            });
        }

        else {
            const { name, value } = event.target || {};
            setotherdata((pre: any) => {
                // const updateStylemark = [...pre.styleMarkNo];
                const updateFabricGsm = [...pre.garmentSize];
                const updatecolor = [...pre.color];
                const updatePieces = [...pre.noOfPieces];
                const updateBoxes = [...pre.noOfBoxes];
                const updateImage = [...pre.finishedGarmentImage];
                // const updateGarmentType = [...pre.garmentType];
                const updateArray = (array: any, index: number) => {
                    if (array.length <= index) {
                        array.push(value);
                    } else {
                        array[index] = value;
                    }
                    // updateErrors[`styleMarkNo${index}`] = "";
                };
                // if (name === `styleMarkNo${index}`) {
                //     updateArray(updateStylemark, index);
                // }
                if (name === `garmentSize${index}`) {
                    updateArray(updateFabricGsm, index);
                }
                if (name === `color${index}`) {
                    updateArray(updatecolor, index);
                }
                if (name === `noOfPieces${index}`) {
                    updateArray(updatePieces, index);
                }
                if (name === `noOfBoxes${index}`) {
                    updateArray(updateBoxes, index);
                }
                if (name === `finishedGarmentImage${index}`) {
                    updateArray(updateImage, index);
                }
                // if (name === `garmentType${index}`) {
                //     updateArray(updateGarmentType, index);
                // }
                return {
                    ...pre,
                    // styleMarkNo: updateStylemark,
                    garmentSize: updateFabricGsm,
                    color: updatecolor,
                    noOfPieces: updatePieces,
                    noOfBoxes: updateBoxes,
                    finishedGarmentImage: updateImage,
                    // garmentType: updateGarmentType,
                };
            });
        }
    };

    const handleAdd = () => {
        if (fields >= 5) {
            setErrors((pre: any) => ({
                ...pre,
                [`garmentType${0}`]: "Cannot Add More than 5 Times ",
            }));
        } else {
            const newGarmentErrors: any = {};
            let formIsValid = true;

            [
                "styleMarkNo",
                "garmentSize",
                "color",
                "noOfPieces",
                "noOfBoxes",
                "finishedGarmentImage",
                "garmentType",
            ].forEach((field) => {
                const [errors, formValid] = validateGarmentData(
                    otherData[field],
                    field
                );
                Object.assign(newGarmentErrors, errors);
                formIsValid = formIsValid && formValid;
            });
            setErrors(newGarmentErrors);

            if (formIsValid) {
                [
                    "styleMarkNo",
                    "garmentSize",
                    "color",
                    "noOfPieces",
                    "noOfBoxes",
                    "finishedGarmentImage",
                    "garmentType",
                ].forEach((field) => {
                    otherData[field].push("");
                });
                setFields((prevCount) => prevCount + 1);
            }
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
        if (!e.target.files[0]) {
            return setErrors((prevError: any) => ({
                ...prevError,
                [e.target.name]: "No File Selected",
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

            setErrors((prevError: any) => ({
                ...prevError,
                [e.target.name]: "",
            }));
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

                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "",
                }));
            }
        } catch (error) {
            console.log(error, "error");
        }
    };

    const requireGarmentFields = [
        "date",
        "fabricOrderRef",
        "brandOrderRef",
        "garmentType",
        "noOfPieces",
        "styleMarkNo",
    ];
    const validateField = (
        name: any,
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
                        ? "Season is required"
                        : "";
                case "departmentId":
                    return value?.length === 0 || value === null
                        ? "Select Department is Required"
                        : "";
                case "date":
                    return value?.length === 0 || value === null
                        ? "Date is required"
                        : "";
                case "programId":
                    return value?.length === 0 || value === null
                        ? "Please select any one option"
                        : "";
                case "factoryLotNo":
                    return value.trim() === ""
                        ? "Select Factory Lot Number is Required"
                        :
                        regexAlphaNumeric.test(value) === false
                            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                            : "";
                case "factoryLotNo":
                    return value?.trim() === "" ? "Select Factory lot Number" : "";
                case "wastePercentage":
                    return value?.trim() === "" ? "Waste Percentage is Required" : "";
                case "wasteFabricSoldTo":
                    return value?.trim() === "" ? "Waste Fabric Sold  is Required" : "";
                case "fabricOrderRef":
                    return value === "" ? "Fabric Order Reference No is Required" : regexAlphaNumeric.test(value) === false
                        ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                        : value.length > 50
                            ? "Value should not exceed 50 characters"
                            : "";
                case "brandOrderRef":
                    return value === "" ? "Brand Order Reference No is Required" : regexAlphaNumeric.test(value) === false
                        ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                        : value.length > 50
                            ? "Value should not exceed 50 characters"
                            : "";

                case "embroideringRequired":
                    return value === "" ? "Please select any one option" : "";
                case "processorName":
                    return formData.embroideringRequired === true && value.trim() === ""
                        ? "Processor name is Required"
                        : value.length > 20
                            ? "Value should not exceed 20 characters"
                            : formData.embroideringRequired === true &&
                                regexAlphabets.test(value) === false
                                ? "Accepts only Alphabets and special characters like _,-,()"
                                : "";
                case "processName":
                    return formData.embroideringRequired === true && value.trim() === ""
                        ? "Process name is Required"
                        : value.length > 10
                            ? "Value should not exceed 10 characters"
                            : formData.embroideringRequired === true &&
                                regexAlphabets.test(value) === false
                                ? "Accepts only Alphabets and special characters like _,-,()"
                                : "";
                case "address":
                    return formData.embroideringRequired === true && value.trim() === ""
                        ? "Address is Required"
                        : value.length > 20
                            ? "Value should not exceed 20 characters"
                            : formData.embroideringRequired === true &&
                                regexBillNumbers.test(value) === false
                                ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
                                : "";
                case "processLoss":
                    return formData.embroideringRequired === true && value === ""
                        ? "Process Loss is Required"
                        : "";
                default:
                    return "";
            }
        }
    };
    const fieldDisplayNames: { [key: string]: string } = {
        styleMarkNo: "Style Mark No",
        garmentSize: "Garment Size",
        finishedGarmentImage: "Finished Garment Image",
        noOfPieces: "No of Pieces",
        noOfBoxes: "No of Boxes",
        garmentType: "Garment Type",
    };
    const validateGarmentData = (
        data: any,
        fieldPrefix: string
    ): [{ [key: string]: string }, boolean] => {
        const errors: { [key: string]: string } = {};
        let formIsValid = true;
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;

        data.forEach((item: any, index: any) => {
            const fieldName = `${fieldPrefix}${index}`;
            const fieldDisplayName = fieldDisplayNames[fieldPrefix] || fieldPrefix;

            if (!item || item === "") {
                errors[fieldName] = ` ${fieldDisplayName} is Required`;
                formIsValid = false;
            }
            if (fieldPrefix === 'noOfPieces' && (item <= 0 || isNaN(item))) {
                errors[fieldName] = ` Value Should be more than 0`;
                formIsValid = false;
            }

            if (fieldPrefix === 'garmentSize' && !regexAlphaNumeric.test(item)) {
                errors[fieldName] = "Accepts only AlphaNumeric values and special characters like comma(,),.,_,-,()"
                formIsValid = false;
            }

            if (fieldPrefix === 'color' && !regexAlphabets.test(item)) {
                errors[fieldName] = "Accepts only Alphabets and special characters like _,-,()"
                formIsValid = false;
            }


        });

        return [errors, formIsValid];
    };
    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const newGarmentErrors: any = {};
        let formIsValid = true;
        [
            "styleMarkNo",
            "garmentSize",
            "color",
            "noOfPieces",
            "noOfBoxes",
            "finishedGarmentImage",
            "garmentType",
        ].forEach((field) => {
            const [errors, formValid] = validateGarmentData(otherData[field], field);
            Object.assign(newGarmentErrors, errors);
            formIsValid = formIsValid && formValid;
        });

        Object.keys(formData).forEach((fieldName: string, index: number) => {
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
            const keys = Object.keys(otherData);
            const result = [];
            const numCombinations = otherData[keys[0]].filter(Boolean).length;

            for (let i = 0; i < numCombinations; i++) {
                const obj: any = {};

                keys.forEach(key => {
                    const value = otherData[key][i];
                    if (value) {
                        obj[key] = value;
                    }
                });
                result.push(obj);
            }

            try {
                setIsSubmitting(true);
                const response = await API.put("garment-sales/process", {
                    id: processId,
                    date: formData?.date,
                    fabricOrderRef: formData?.fabricOrderRef,
                    brandOrderRef: formData?.brandOrderRef,
                    garmentType: otherData.garmentType,
                    styleMarkNo: otherData.styleMarkNo,
                    garmentSize: otherData.garmentSize,
                    color: otherData.color,
                    noOfPieces: otherData.noOfPieces,
                    noOfBoxes: otherData.noOfBoxes,
                    finishedGarmentImage: otherData.finishedGarmentImage,
                    garmentfabrics: result,
                });
                if (response.success) {
                    toasterSuccess("Process created successfully");
                    sessionStorage.removeItem("garmentNewProcessData");
                    sessionStorage.removeItem("chooseFabric");
                    sessionStorage.removeItem("selectedData");
                    sessionStorage.removeItem("otherData");
                    router.push("/garment/process");
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

    if (loading) {
        return <Loader />;
    }

    const calculateFinalnoofPices = () => {
        const initialWeight = formData.embNoOfPieces;
        const processLossPercentage = formData.processLoss;

        if (processLossPercentage >= 0 && processLossPercentage <= 100) {
            const lossAmount = (initialWeight * processLossPercentage) / 100;
            const finishedWeight = initialWeight - lossAmount;
            return finishedWeight;
        }
        return 0;
    };

    const finishedNo = calculateFinalnoofPices();

    if (loading || roleLoading) {
        return <div> <Loader /> </div>;
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
                                        <NavLink href="/garment/process">{translations?.knitterInterface?.Process}</NavLink>{" "}
                                    </li>
                                    <li>Edit Process</li>
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
                                                onChange={(event: any) => handleChange(event)}
                                                disabled
                                            >
                                                <option value="">{translations?.common?.SelectSeason}</option>
                                                {season?.map((season: any) => (
                                                    <option key={season.id} value={season.id}>
                                                        {season.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            {errors?.seasonId && (
                                                <div className="text-sm text-red-500">
                                                    {errors.seasonId}
                                                </div>
                                            )}
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
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.FabricOrderRef} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                name="fabricOrderRef"
                                                value={formData.fabricOrderRef || ""}
                                                onBlur={(e) => onBlur(e, "alphaNumeric")}
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
                                                {translations?.knitterInterface?.BrandOrderReference} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                name="brandOrderRef"
                                                value={formData.brandOrderRef || ""}
                                                onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                onChange={(event) => handleChange(event)}
                                                placeholder={translations?.knitterInterface?.BrandOrderReference}

                                            />
                                            {errors?.brandOrderRef !== "" && (
                                                <div className="text-sm text-red-500">
                                                    {errors.brandOrderRef}
                                                </div>
                                            )}
                                        </div>
                                        {!chooseFabricknit && !chooseFabricweaver ? (
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
                                                                    value={program.id || ""}
                                                                    onChange={handleChange}
                                                                    disabled
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
                                                {translations?.department}
                                            </label>
                                            <Form.Select
                                                aria-label="Default select example"
                                                className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                                                name="departmentId"
                                                value={formData.departmentId || ""}
                                                onChange={(event: any) => handleChange(event)}
                                                disabled
                                            >
                                                <option value="">{translations?.common?.SelectDepartment}</option>
                                                {departments?.map((dept: any) => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.dept_name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            {errors?.departmentId && (
                                                <div className="text-sm text-red-500">
                                                    {errors.departmentId}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.ChooseWeight}
                                            </label>

                                            <input
                                                name="fabricWeight"
                                                value={formData?.total_fabric_weight}
                                                onChange={(event) => handleChange(event)}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.chooseLength}
                                            </label>
                                            <input
                                                name="fabricLength"
                                                value={formData?.total_fabric_length}
                                                onChange={(event) => handleChange(event)}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.addFabricWeight}
                                            </label>
                                            <input
                                                name="fabricLength"
                                                value={additionalknit}
                                                onChange={(event) => handleChange(event)}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.addFabricLength}
                                            </label>
                                            <input
                                                name="fabricLength"
                                                value={additionalWeaver}
                                                onChange={(event) => handleChange(event)}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.totalFabweight}
                                            </label>
                                            <input
                                                name="totalFabricLength"
                                                value={totalknit}
                                                onChange={(event) => handleChange(event)}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.totalFabLength}
                                            </label>
                                            <input
                                                name="totalFabricWeight"
                                                value={totalWeav}
                                                onChange={(event) => handleChange(event)}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.FactoryLotNo}
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                name="factoryLotNo"
                                                onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                value={formData.factoryLotNo || ""}
                                                onChange={(event) => handleChange(event)}
                                                placeholder={translations?.common?.FactoryLotNo}
                                                readOnly
                                            />
                                            {errors.factoryLotNo && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.factoryLotNo}
                                                </p>
                                            )}
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.mandiInterface?.reelLotNo}
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                name="reelLotNo"
                                                value={formData.reelLotNo || ""}
                                                onChange={(event) => handleChange(event)}
                                                placeholder={translations?.mandiInterface?.reelLotNo}
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.TotalWasteFabric}
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="number"
                                                name="wastePercentage"
                                                value={formData.wastePercentage || ""}
                                                onChange={(event) => handleChange(event)}
                                                placeholder={translations?.common?.TotalWasteFabric}
                                                readOnly
                                            />
                                            {errors.wastePercentage && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.wastePercentage}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.calculatedWasteWeight}
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                name="wasteWeight"
                                                value={wasteWightknit}
                                                onBlur={(e) => onBlur(e, "alphabets")}
                                                onChange={(event) => handleChange(event)}
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.calculatedWasteLength}
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                name="wasteLength"
                                                value={wasteWightWeaver}
                                                onBlur={(e) => onBlur(e, "alphabets")}
                                                onChange={(event) => handleChange(event)}
                                                readOnly
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.WasteFabSold}
                                            </label>
                                            <textarea
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                name="wasteFabricSoldTo"
                                                value={formData.wasteFabricSoldTo}
                                                onChange={(event) => handleChange(event)}
                                                placeholder={translations?.common?.WasteFabSold}
                                                readOnly
                                            />
                                            {errors.wasteFabricSoldTo && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.wasteFabricSoldTo}
                                                </p>
                                            )}
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.common?.UploadWasteinvoice}
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    {translations?.knitterInterface?.ChooseFile} <GrAttachment />
                                                    <input
                                                        name="wasteFabricInvoice"
                                                        type="file"
                                                        accept=".pdf,.zip, image/jpg, image/jpeg"
                                                        onChange={(event) => handleChange(event)}
                                                        disabled
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                            </p>
                                            {fileName.wasteFabricInvoice && (
                                                <div className="flex text-sm mt-1">
                                                    <GrAttachment />
                                                    <p className="mx-1">{fileName.wasteFabricInvoice}</p>
                                                </div>
                                            )}
                                            {errors?.wasteFabricInvoice !== "" && (
                                                <div className="text-sm text-red-500">
                                                    {errors.wasteFabricInvoice}
                                                </div>
                                            )}
                                        </div>

                                        <hr className="mt-4" />
                                        <h5 className="font-semibold mt-4 col-6 col-sm-6">
                                            {translations?.common?.chooseTypw}
                                        </h5>

                                        {[...Array(fields)].map((_, index) => (
                                            <div key={index}>
                                                {index === 0 && (
                                                    <div className="col-12 flex justify-end text-center">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {""}
                                                        </label>
                                                        <button
                                                            className="btn-purple mr-2"
                                                            onClick={() => handleAdd()}
                                                        >
                                                            {translations?.common?.add}
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="row">
                                                    <div className="col-6 col-sm-6 mt-2">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.productType} <span className="text-red-500">*</span>
                                                        </label>
                                                        <Select
                                                            name={`garmentType${index}`}
                                                            value={otherData.garmentType[index] ? { label: otherData.garmentType[index], value: otherData.garmentType[index] } : null}
                                                            menuShouldScrollIntoView={false}
                                                            isClearable
                                                            placeholder="Select Garment / Product Type"
                                                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom" options={(garmenttype || []).map(({ id, name }: any) => ({
                                                                label: name,
                                                                value: name,
                                                                key: id
                                                            }))}
                                                            onChange={(item: any) => handleChangeAdd(`garmentType${index}`, item, index)}
                                                        />

                                                        {errors[`garmentType${index}` as keyof typeof errors] && (
                                                            <div>
                                                                <div className="text-sm text-red-500">
                                                                    {errors[`garmentType${index}` as keyof typeof errors]}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.ticketing?.styleMark} <span className="text-red-500">*</span>
                                                        </label>
                                                        <Select
                                                            name={`styleMarkNo${index}`}
                                                            value={otherData.styleMarkNo[index] ? { label: otherData.styleMarkNo[index], value: otherData.styleMarkNo[index] } : null}
                                                            menuShouldScrollIntoView={false}
                                                            isClearable
                                                            placeholder="Select Style Mark No"
                                                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom" options={(styleMark || []).map(({ id, style_mark_no }: any) => ({
                                                                label: style_mark_no,
                                                                value: style_mark_no,
                                                                key: id
                                                            }))}
                                                            onChange={(item: any) => handleChangeAdd(`styleMarkNo${index}`, item, index)}
                                                        />

                                                        {errors[`styleMarkNo${index}` as keyof typeof errors] && (
                                                            <div>
                                                                <div className="text-sm text-red-500">
                                                                    {errors[`styleMarkNo${index}` as keyof typeof errors]}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.productSize} <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="text"
                                                            name={`garmentSize${index}`}
                                                            value={otherData.garmentSize[index]}
                                                            onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                            onChange={(event) => handleChangeAdd(event, index)}
                                                            placeholder={translations?.common?.productSize}
                                                        />
                                                        {errors[
                                                            `garmentSize${index}` as keyof typeof errors
                                                        ] && (
                                                                <div>
                                                                    <div className="text-sm text-red-500">
                                                                        {
                                                                            errors[
                                                                            `garmentSize${index}` as keyof typeof errors
                                                                            ]
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.color} <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="text"
                                                            name={`color${index}`}
                                                            value={otherData.color[index]}
                                                            onBlur={(e) => onBlur(e, "alphabets")}
                                                            onChange={(event) => handleChangeAdd(event, index)}
                                                            placeholder={translations?.common?.color}
                                                        />
                                                        {errors[`color${index}` as keyof typeof errors] && (
                                                            <div>
                                                                <div className="text-sm text-red-500">
                                                                    {errors[`color${index}` as keyof typeof errors]}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.totPices} <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            name={`noOfPieces${index}`}
                                                            onBlur={(e) => onBlur(e, "numbers")}
                                                            value={otherData.noOfPieces[index]}
                                                            onChange={(event) => handleChangeAdd(event, index)}
                                                            placeholder={translations?.common?.totPices}
                                                        />
                                                        {errors[
                                                            `noOfPieces${index}` as keyof typeof errors
                                                        ] && (
                                                                <div>
                                                                    <div className="text-sm text-red-500">
                                                                        {
                                                                            errors[
                                                                            `noOfPieces${index}` as keyof typeof errors
                                                                            ]
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.millInterface?.noOfBoxes} <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="number"
                                                            name={`noOfBoxes${index}`}
                                                            value={otherData.noOfBoxes[index]}
                                                            onBlur={(e) => onBlur(e, "numbers")}
                                                            onChange={(event) => handleChangeAdd(event, index)}
                                                            placeholder={translations?.millInterface?.noOfBoxes}
                                                        />
                                                        {errors[
                                                            `noOfBoxes${index}` as keyof typeof errors
                                                        ] && (
                                                                <div>
                                                                    <div className="text-sm text-red-500">
                                                                        {
                                                                            errors[
                                                                            `noOfBoxes${index}` as keyof typeof errors
                                                                            ]
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>

                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.image} <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="inputFile">
                                                            <label>
                                                                {translations?.knitterInterface?.ChooseFile} <GrAttachment />
                                                                <input
                                                                    name={`finishedGarmentImage${index}`}
                                                                    type="file"
                                                                    accept=".pdf,.zip, image/jpg, image/jpeg"
                                                                    onChange={(event) =>
                                                                        handleFileChange(event, index)
                                                                    }

                                                                />
                                                            </label>
                                                        </div>
                                                        <p className="py-2 text-sm">
                                                            (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                                        </p>
                                                        {otherData.finishedGarmentImage[index] && (
                                                            <div className="flex text-sm mt-1">
                                                                <GrAttachment />
                                                                <p className="mx-1">
                                                                    {otherData.finishedGarmentImage[index]}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {errors[
                                                            `finishedGarmentImage${index}` as keyof typeof otherData
                                                        ] && (
                                                                <div>
                                                                    <div className="text-sm text-red-500">
                                                                        {
                                                                            errors[
                                                                            `finishedGarmentImage${index}` as keyof typeof errors
                                                                            ]
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                                <hr className="mt-4" />
                                            </div>
                                        ))}

                                        {/* <hr className="mt-4" /> */}

                                        <div className="row">
                                            <div className="col-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.common?.EmbroideringRequired}
                                                </label>

                                                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                    <label className="mt-1 d-flex mr-4 align-items-center">
                                                        <section>
                                                            <input
                                                                type="radio"
                                                                name="embroideringRequired"
                                                                checked={formData.embroideringRequired === true}
                                                                onChange={handleChange}
                                                                value="Yes"
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
                                                                name="embroideringRequired"
                                                                checked={formData.embroideringRequired === false}
                                                                onChange={handleChange}
                                                                value="No"
                                                                disabled
                                                            />
                                                            <span></span>
                                                        </section>
                                                        No
                                                    </label>
                                                </div>
                                                {errors?.embroideringRequired !== "" && (
                                                    <div className="text-sm text-red-500">
                                                        {errors.embroideringRequired}
                                                    </div>
                                                )}
                                            </div>
                                            {/* <div className="col-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Do you want to enter Physical Traceability?                                            </label>

                                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                <label className="mt-1 d-flex mr-4 align-items-center">
                                                    <section>
                                                        <input
                                                            type="radio"
                                                            name="physicalTraceabilty"
                                                            checked={formData.physicalTraceabilty === true}
                                                            onChange={handleChange}
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
                                                            name="physicalTraceabilty"
                                                            checked={formData.physicalTraceabilty === false}
                                                            onChange={handleChange}
                                                            value="No"
                                                        />
                                                        <span></span>
                                                    </section>
                                                    No
                                                </label>
                                            </div>
                                            {errors?.physicalTraceabilty !== "" && (
                                                <div className="text-sm text-red-500">
                                                    {errors.physicalTraceabilty}
                                                </div>
                                            )}
                                        </div> */}
                                        </div>

                                        {formData.embroideringRequired === true && (
                                            <div>
                                                <div className="row mt-2">
                                                    <div className=" col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.knitterInterface?.nameProcess}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="processorName"
                                                            onBlur={(e) => onBlur(e, "alphabets")}
                                                            value={formData.processorName}
                                                            onChange={handleChange}
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            readOnly
                                                        />
                                                        {errors.processorName && (
                                                            <p className="text-red-500 text-sm mt-1">
                                                                {errors.processorName}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.address}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="address"
                                                            onBlur={(e) => onBlur(e, "alphabets")}
                                                            value={formData.address}
                                                            onChange={handleChange}
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            readOnly
                                                        />
                                                        {errors.address && (
                                                            <p className="text-red-500 text-sm mt-1">
                                                                {errors.address}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.knitterInterface?.dyeingName}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="processName"
                                                            value={formData.processName}
                                                            onBlur={(e) => onBlur(e, "alphabets")}
                                                            onChange={handleChange}
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            readOnly
                                                        />
                                                        {errors.processName && (
                                                            <p className="text-red-500 text-sm mt-1">
                                                                {errors.processName}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.noofPieces}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="embdpieces"
                                                            value={formData.embNoOfPieces || ""}
                                                            onChange={handleChange}
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            readOnly
                                                        />
                                                    </div>

                                                    <div className="col-12 col-sm-6 mt-4 mb-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.knitterInterface?.processloss}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="processLoss"
                                                            value={formData.processLoss}
                                                            onChange={handleChange}
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            readOnly
                                                        />
                                                        {errors.processLoss && (
                                                            <p className="text-red-500 text-sm mt-1">
                                                                {errors.processLoss}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.FinalPieces}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="finalNoOfPieces"
                                                            value={finishedNo || ""}
                                                            onChange={handleChange}
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

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
                                                    {translations?.common?.submit}
                                                </button>

                                                <button
                                                    className="btn-outline-purple"
                                                    onClick={() => {
                                                        router.push("/garment/process");
                                                        sessionStorage.removeItem("garmentNewProcessData");
                                                        sessionStorage.removeItem("selectedData");
                                                        sessionStorage.removeItem("otherData");
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
