"use client";

import React, { useState } from 'react';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Link from 'next/link';
import { FaDownload } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";
import { Form } from 'react-bootstrap';
import { GrAttachment } from "react-icons/gr";
import { handleDownload } from '@components/core/Download';
import * as XLSX from "xlsx";
import API from '@lib/Api';
import { toasterError, toasterSuccess } from '@components/core/Toaster';

interface FileFormat {
    name: string;
    label: string;
    fileLink: string;
    fileName: string;
    fileType: string;
}

interface FileFormats {
    [key: string]: FileFormat[] | undefined;
}

interface TypeOptions {
    [key: string]: string[] | undefined;
}

interface ApiDetailsType {
    [key: string]: {
        [key: string]: {
            endpoint: string,
            jsonKey: string
        }
    }
}

const processorTypeOptions = [
    { label: "Ginner", value: "GINNER" },
    { label: "Spinner", value: "SPINNER" },
    { label: "Knitter", value: "KNITTER" },
    { label: "Weaver", value: "WEAVER" },
    { label: "Fabric", value: "FABRIC" },
    { label: "Garment", value: "GARMENT" }
];

const typeOptions: TypeOptions = {
    GINNER: ["ginprocessorregistration", "ginprocess", "cottonselection", "ginbales", "ginsales", "baleselection"],
    SPINNER: ["spinprocessorregistration"],
    KNITTER: ["knitterprocessorregistration"],
    WEAVER: ["weaverprocessorregistration"],
    GARMENT: ["garmentprocessorregistration"],
    FABRIC: ["fabricprocessorregistration"]
}

const fileFormats: FileFormats = {
    GINNER: [
        {
            name: "ginprocessorregistration",
            label: "Ginner Processor Registration format",
            fileLink: "/files/ginner/Ginner-Processor-Registration-Format.csv",
            fileName: "Ginner-Processor-Registration-Format",
            fileType: "csv",
        },
        {
            name: "ginprocess",
            label: "Ginner process format",
            fileLink: "/files/ginner/Gin-Process-Format.csv",
            fileName: "Gin-Process-Format",
            fileType: "csv",
        },
        {
            name: "cottonselection",
            label: "Cotton selection format",
            fileLink: "/files/ginner/Cotton-Selection-Format.csv",
            fileName: "Cotton-Selection-Format",
            fileType: "csv",
        },
        {
            name: "ginbales",
            label: "Gin bales format",
            fileLink: "/files/ginner/Gin-Bales-Format.csv",
            fileName: "Gin-Bales-Format",
            fileType: "csv",
        },
        {
            name: "ginsales",
            label: "Gin sales format",
            fileLink: "/files/ginner/Gin-Sales-Format.csv",
            fileName: "Gin-Sales-Format",
            fileType: "csv",
        },
        {
            name: "baleselection",
            label: "Bale selection format",
            fileLink: "/files/ginner/Bale-Selection-Format.csv",
            fileName: "Bale-Selection-Format",
            fileType: "csv",
        }
    ],
    SPINNER: [
        {
            name: "spinprocessorregistration",
            label: "Spinner Processor Registration",
            fileLink: "/files/spinner/Spinner-Processor-Registration.csv",
            fileName: "Spinner-Processor-Registration",
            fileType: "csv",
        }
    ],
    KNITTER: [
        {
            name: "knitterprocessorregistration",
            label: "Knitter Processor Registration",
            fileLink: "/files/knitter/Knitter-Processor-Registration.csv",
            fileName: "Knitter-Processor-Registration",
            fileType: "csv",
        }
    ],
    WEAVER: [
        {
            name: "weaverprocessorregistration",
            label: "Weaver Processor Registration",
            fileLink: "/files/weaver/Weaver-Processor-Registration.csv",
            fileName: "Weaver-Processor-Registration",
            fileType: "csv",
        }
    ],
    GARMENT: [
        {
            name: "garmentprocessorregistration",
            label: "Garment Processor Registration",
            fileLink: "/files/garment/Garment-Processor-Registration.csv",
            fileName: "Garment-Processor-Registration",
            fileType: "csv",
        }
    ],
    FABRIC: [
        {
            name: "fabricprocessorregistration",
            label: "Fabric Processor Registration",
            fileLink: "/files/fabric/Fabric-Processor-Registration.csv",
            fileName: "Fabric-Processor-Registration",
            fileType: "csv",
        }
    ]
}

const apiDetails: ApiDetailsType = {
    GINNER: {
        ginprocessorregistration: {
            endpoint: "datamigration/upload-ginner-processor-registration",
            jsonKey: "processors"
        },
        ginprocess: {
            endpoint: "datamigration/upload-ginner-process",
            jsonKey: "ginners"
        },
        cottonselection: {
            endpoint: "datamigration/upload-cotton-selection",
            jsonKey: "cotton"
        },
        ginbales: {
            endpoint: "datamigration/upload-gin-bales",
            jsonKey: "bales"
        },
        ginsales: {
            endpoint: "datamigration/upload-ginner-sale",
            jsonKey: "ginnersale"
        },
        baleselection: {
            endpoint: "datamigration/upload-bale-selection",
            jsonKey: "bales"
        }
    },
    SPINNER: {
        spinprocessorregistration: {
            endpoint: "datamigration/upload-mill-processor-registration",
            jsonKey: "processors"
        }
    },
    KNITTER: {
        knitterprocessorregistration: {
            endpoint: "datamigration/upload-knitter-processor-registration",
            jsonKey: "processors"
        }
    },
    WEAVER: {
        weaverprocessorregistration: {
            endpoint: "datamigration/upload-weaver-processor-registration",
            jsonKey: "processors"
        }
    },
    GARMENT: {
        garmentprocessorregistration: {
            endpoint: "datamigration/upload-weaver-processor-registration",
            jsonKey: "processors"
        }
    },
    FABRIC: {
        fabricprocessorregistration: {
            endpoint: "datamigration/upload-weaver-processor-registration",
            jsonKey: "processors"
        }
    }
}

const Upload = () => {
    useTitle("Upload");
    const { translations, loading } = useTranslations();

    const [errors, setErrors] = useState<any>({
        processorType: "",
        type: "",
        uploadExcel: ""
    });

    const [selectedProcessorType, setSelectedProcessorType] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");

    const [fileName, setFileName] = useState<string>("");
    const [excelJsonData, setExcelJsonData] = useState<any>([]);
    const [show, setShow] = useState(false);
    const [isSelected, setIsSelected] = useState<boolean>(false);

    const getFileFormats = () => {
        if (selectedProcessorType) {
            return fileFormats[selectedProcessorType] || [];
        } else {
            return fileFormats["GINNER"] || [];
        }
    }

    const handleFile = (fileFormat: FileFormat) => {
        handleDownload(
            fileFormat.fileLink,
            fileFormat.fileName,
            fileFormat.fileType
        );
    };

    const excelToJson = async (event: any) => {
        setFileName("");
        setExcelJsonData([]);
        setErrors({
            processorType: "",
            type: "",
            uploadExcel: ""
        });

        if (!selectedProcessorType) {
            setErrors((prevError: any) => ({
                ...prevError,
                processorType: "Select this field first",
            }));
            return false;
        }
        if (!selectedType) {
            setErrors((prevError: any) => ({
                ...prevError,
                type: "Select this field first",
            }));
            return false;
        }

        const fileFormats = getFileFormats();
        const formatOfSelectedType = fileFormats.find(format => format.name === selectedType);
        if (!formatOfSelectedType) {
            setErrors((prevError: any) => ({
                ...prevError,
                uploadExcel: "Format not found for seleted type",
            }));
            return false;
        }

        const file = event.target?.files[0];
        if (file) {
            const allowedFormats = [
                "text/csv",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
            ];
            if (!allowedFormats.includes(file?.type)) {
                setErrors((prevError: any) => ({
                    ...prevError,
                    uploadExcel: "Invalid file format. Please upload a xlsx, csv or xls file.",
                }));
                return false;
            }

            if (file.name) {
                setFileName(file.name);
            }

            try {
                const formatFileResponse = await fetch(formatOfSelectedType.fileLink);
                const formatFileContent = await formatFileResponse.text();

                const reader = new FileReader();
                reader.onload = async (e: any) => {
                    const userFileContent = new Uint8Array(e.target.result);

                    const userWorkbook = XLSX.read(userFileContent, { type: "array" });
                    const formatWorkbook = XLSX.read(formatFileContent, { type: "binary" });

                    const userSheetName = userWorkbook.SheetNames[0];
                    const userSheet: any = userWorkbook.Sheets[userSheetName];

                    const formatSheetName = formatWorkbook.SheetNames[0];
                    const formatSheet: any = formatWorkbook.Sheets[formatSheetName];

                    const uploadedJsonData: any = XLSX.utils.sheet_to_json(userSheet, { defval: "" });
                    if (uploadedJsonData.length === 0) {
                        setErrors((prevError: any) => ({
                            ...prevError,
                            uploadExcel: "The file you selected is empty",
                        }));
                        return false;
                    }

                    const userFileHeader: string[] = Object.keys(uploadedJsonData[0] || {});

                    const userFileJSONData: any = XLSX.utils.sheet_to_json(formatSheet, { defval: "" });
                    const formatFileHeader: string[] = Object.keys(userFileJSONData[0] || {});

                    const isSameFormat = JSON.stringify(userFileHeader) === JSON.stringify(formatFileHeader);

                    if (isSameFormat) {
                        setExcelJsonData(uploadedJsonData);
                        return true;
                    } else {
                        setErrors((prevError: any) => ({
                            ...prevError,
                            uploadExcel: "Invalid format",
                        }));
                        return false;
                    }
                }
                reader.readAsArrayBuffer(file);
            } catch (error) {
                console.log(error);
                setErrors((prevError: any) => ({
                    ...prevError,
                    uploadExcel: "Uploaded file could not be validated",
                }));
                return false;
            }
        }
    }

    const refreshForm = () => {
        setSelectedProcessorType("");
        setSelectedType("");
        setFileName("");
        setExcelJsonData([]);

        setErrors({
            processorType: "",
            type: "",
            uploadExcel: ""
        });
    }

    const handleErrors = () => {
        let isError = false;

        setErrors((prev: any) => ({
            ...prev,
            processorType: "",
            type: ""
        }));
        if (selectedProcessorType === "") {
            setErrors((prev: any) => ({
                ...prev,
                processorType: "Processor type is required"
            }));
            isError = true;
        }
        if (selectedType === "") {
            setErrors((prev: any) => ({
                ...prev,
                type: "Type is required"
            }));
            isError = true;
        }
        if (excelJsonData.length === 0) {
            setErrors((prev: any) => ({
                ...prev,
                uploadExcel: "Upload a file with valid format"
            }));
            isError = true;
        }

        return isError;
    }

    const handleSubmit = async () => {
        if (handleErrors()) {
            return;
        }

        setShow(true);
        setIsSelected(true);
        try {
            const { endpoint, jsonKey } = apiDetails[selectedProcessorType][selectedType];
            const res = await API.post(endpoint, { [jsonKey]: excelJsonData });

            setShow(false);
            setIsSelected(false);
            if (res.success) {
                refreshForm();
                toasterSuccess("Data uploaded successfully");
            } else {
                toasterError("Something went wrong while uploading data");
            }
        } catch (error: any) {
            console.log(error);
            setShow(false);
            setIsSelected(false);
            toasterError(error?.response?.data?.message || "Something went wrong while uploading data");
        }
    }

    if (loading) {
        return <div> Loading...</div>;
    }

    return (
        <div>
            <div className="breadcrumb-box">
                <div className="breadcrumb-inner light-bg">
                    <div className="breadcrumb-left">
                        <ul className="breadcrum-list-wrap">
                            <li>
                                <Link href="/dashboard" className="active">
                                    <span className="icon-home"></span>
                                </Link>
                            </li>
                            <li>Data Migration</li>
                            <li>Upload</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-white rounded-md p-4">
                <div className="w-100">
                    <p className="text-sm font-semibold">
                        Download these valid format excel sheets to use in upload
                    </p>
                    <div className="customFormSet mt-3">
                        <div className="w-100">
                            <div className="row">
                                <div className="py-3 flex justify-left gap-6 flex-wrap">
                                    {getFileFormats().map((fileFormat, i) => (
                                        <div key={i} className="flex items-center">
                                            <button
                                                name={fileFormat.name}
                                                type="button"
                                                onClick={() => handleFile(fileFormat)}
                                                className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                                            >
                                                <FaDownload className="mr-2" />
                                                {fileFormat.label}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className=" text-sm flex items-center">
                                <IoWarning size={18} />
                                <p className="text-sm m-1">
                                    Do not use cell formatting or formulas
                                </p>
                            </div>
                            <hr className="my-4" />
                            <div className="row mt-5">
                                <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                        Select Processor Type *
                                    </label>
                                    <Form.Select
                                        aria-label="processorType"
                                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                                        name="processorType"
                                        value={selectedProcessorType || ""}
                                        onChange={(e: any) => {
                                            setSelectedProcessorType(e.target.value);
                                            setSelectedType("");
                                            setFileName("");
                                            setExcelJsonData([]);
                                        }}
                                    >
                                        <option value="">Select Processor Type</option>
                                        {processorTypeOptions.map((processorType, index) => (
                                            <option key={index} value={processorType.value}>
                                                {processorType.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {errors.processorType && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.processorType}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                        Select Type *
                                    </label>
                                    <Form.Select
                                        aria-label="type"
                                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                                        name="type"
                                        value={selectedType || ""}
                                        onChange={(e: any) => {
                                            setSelectedType(e.target.value);
                                            setFileName("");
                                            setExcelJsonData([]);
                                        }}
                                    >
                                        <option value="">Select Type</option>
                                        {(typeOptions[selectedProcessorType] || []).map((type, index) => (
                                            <option key={index} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {errors.type && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                                    <label className="text-gray-500 text-[12px] font-medium">
                                        Upload Excel
                                    </label>
                                    <div className="inputFile">
                                        <label>
                                            Choose File <GrAttachment />
                                            <input
                                                type="file"
                                                accept=".xlsx, .csv, .xls"
                                                name="upload"
                                                id="upload"
                                                onChange={excelToJson}
                                                onClick={(event: any) => {
                                                    event.currentTarget.value = null;
                                                }}
                                            />
                                        </label>
                                    </div>
                                    {fileName && (
                                        <div className="flex text-sm mt-1">
                                            <GrAttachment />
                                            <p className="mx-1">{fileName}</p>
                                        </div>
                                    )}
                                    {errors.uploadExcel && (
                                        <p className="text-red-500 text-sm mt-1">{errors.uploadExcel}</p>
                                    )}
                                </div>
                            </div>
                            {show && (
                                <div className="flex justify-center items-center mt-5">
                                    <p className="text-green-600 ">
                                        Uploading, Please wait....
                                    </p>
                                </div>
                            )}
                            <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                                <section>
                                    <button
                                        className="btn-purple mr-2"
                                        disabled={isSelected}
                                        style={isSelected ? {
                                            cursor: "not-allowed",
                                            opacity: 0.8
                                        } : {
                                            cursor: "pointer",
                                            backgroundColor: "#D15E9C"
                                        }}
                                        onClick={handleSubmit}
                                    >
                                        {translations.common.submit}
                                    </button>
                                    <button
                                        className="btn-purple mr-2"
                                        disabled={isSelected}
                                        onClick={refreshForm}
                                        style={{
                                            cursor: "pointer",
                                            borderColor: "#D15E9C",
                                            backgroundColor: "transparent",
                                            color: "#D15E9C"
                                        }}
                                    >
                                        {translations.common.cancel}
                                    </button>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Upload;