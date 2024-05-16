"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import moment from 'moment';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import Accordian from "@components/core/Accordian";
import CommonDataTable from '@components/core/Table';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import API from '@lib/Api';
import { useRouter } from '@lib/router-events';
import { GrAttachment } from "react-icons/gr";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";

const AddMillResult = () => {
    useTitle("Add Mill Result Details");

    const router = useRouter();
    const [roleLoading] = useRole();
    const { translations, loading } = useTranslations();

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [labMill, setLabMill] = useState<any>({});
    const [sampleResults, setSampleResults] = useState<any>("");
    const [uploadReports, setUploadReports] = useState<Array<string>>([]);
    const [uploadReportFileNames, setUploadReportFileNames] = useState<Array<string>>([]);
    const [errors, setErrors] = useState<any>({
        sampleResults: "",
        uploadReports: ""
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const dateFormatter = (date: any) => {
        const formatted = moment(date).format("DD-MM-YYYY");
        return formatted;
    };

    const fetchLabMill = async () => {
        try {
            const res = await API.get(`third-party-sample/get-rice-sample?id=${id}`);
            if (res.success) {
                setLabMill(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSampleResultChange = (key: string, value: any, index: number) => {
        setSampleResults(value);
    }

    const handleDocumentsUpload = async (files: FileList | null) => {
        if (files?.length && files.length > 0) {
            let isAnyFileInvalid = false;

            for (const file of files) {
                const allowedFormats = ["image/jpeg", "image/png", "application/pdf"];

                if (!allowedFormats.includes(file?.type)) {
                    setErrors((prevError: any) => ({
                        ...prevError,
                        uploadReports: "Invalid file format for any of the file. Upload valid files",
                    }));
                    isAnyFileInvalid = true;
                    return;
                }

                const maxFileSize = 200 * 1024 * 1024;
                if (file.size > maxFileSize) {
                    setErrors((prevError: any) => ({
                        ...prevError,
                        uploadReports: 'Any of the file size exceeds the maximum limit (200MB).',
                    }));
                    isAnyFileInvalid = true;
                }
            }

            if (!isAnyFileInvalid) {
                setUploadReportFileNames([]);
                const uploadPromises = Array.from(files).map(async (file) => {
                    try {
                        const url = "file/upload";
                        const fileFormData = new FormData();
                        fileFormData.append("file", file);

                        const response = await API.postFile(url, fileFormData);
                        if (response.success) {
                            setUploadReportFileNames((prevFile: any) => ([...prevFile, file.name]));
                            return response.data;
                        } else {
                            return null;
                        }
                    } catch (error) {
                        console.log('Error uploading reports:', error);
                        return null;
                    }
                });

                const reportUrls = (await Promise.all(uploadPromises)).filter(Boolean);
                setUploadReports(reportUrls);
                setErrors((prevError: any) => ({ ...prevError, uploadReports: "" }));
            }
        } else {
            toasterError("Could not select files, try again to select.");
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            let isError = false;
            const newErrors: any = {
                sampleResults: "",
                uploadReports: ""
            };

            if (uploadReports.length === 0) {
                newErrors.uploadReports = "Upload report";
                isError = true;
            }

            if (sampleResults === "") {
                newErrors.sampleResults = "Selet any one option";
                isError = true;
            }
     
            if (!isError) {
                const url = "lab-report";
                const mainFormData = {
                    id: id,
                    sampleReports: uploadReports,
                    sampleResult: sampleResults
                };
                const mainResponse = await API.post(url, mainFormData);

                if (mainResponse.success) {
                    toasterSuccess("Results added successfully");
                    router.push("/lab/mill");
                }
            } else {
                setErrors(newErrors);
            }

            setIsSubmitting(false);
        } catch (error) {
            console.log("Error submitting form:", error);
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (id) {
            fetchLabMill();
        }
    }, [id]);

    if (loading) {
        return (<div><Loader /></div>);
    }

    const renderMillLabInformation = () => {
        return (
            <div className="details-list-group mg-t-44">
                <ul className="detail-list">
                    <li className="item">
                        <span className="label">Mill Name:</span>
                        <span className="val">
                            {labMill?.mill?.name || ""}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Lot No:</span>
                        <span className="val">
                            {labMill?.lot_no}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Date of sample collection:</span>
                        <span className="val">
                            {labMill?.sample_date ? dateFormatter(labMill.sample_date) : ""}
                        </span>
                    </li>
                    {/* <li className="item">
                        <span className="label">Data of sample dispatch:</span>
                        <span className="val">
                            {labMill?.data_of_sample_dispatch}
                        </span>
                    </li> */}
                    <li className="item">
                        <span className="label">Lab name:</span>
                        <span className="val">
                            {labMill?.lab?.name}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Expected date:</span>
                        <span className="val">
                            {labMill?.expected_date ? dateFormatter(labMill.expected_date) : ""}
                        </span>
                    </li>
                </ul>
            </div>
        )
    }

    const columns = [
        // {
        //     name: translations?.common?.srNo,
        //     cell: (row: any, index: any) => index + 1,
        //     width: '70px',
        //     wrap: true
        // },
        {
            name: (<p className="text-[13px] font-medium">Code</p>),
            selector: (row: any) => row.code,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium  py-2">Sample Result *</p>,
            cell: (row: any, index: number) => {
                return (
                    <>
                        <div className='py-3'>
                            <div className="w-100 chooseOption d-flex flex-wrap">
                                <label className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name={`sample-result-${index}`}
                                            value={"Accepted"}
                                            checked={sampleResults == "Accepted"}
                                            onChange={(e) => handleSampleResultChange("value", e.target.value, index)}
                                        />
                                        <span></span>
                                    </section>
                                    Accept
                                </label>

                                <label className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name={`sample-result-${index}`}
                                            value={"Rejected"}
                                            checked={sampleResults == "Rejected"}
                                            onChange={(e) => handleSampleResultChange("value", e.target.value, index)}
                                        />
                                        <span></span>
                                    </section>
                                    Reject
                                </label>
                            </div>
                            {errors?.sampleResults && (
                                <div className="text-sm text-red-500 ">{errors?.sampleResults}</div>
                            )}
                        </div>
                    </>
                )
            },
            ignoreRowClick: true,
            allowOverflow: true
        },
    ]

    if (!roleLoading) {
        return (
            <div>
                <div className="breadcrumb-box">
                    <div className="breadcrumb-inner light-bg">
                        <div className="breadcrumb-left">
                            <ul className="breadcrum-list-wrap">
                                <li>
                                    <Link href="/physical-partner/dashboard" className="active">
                                        <span className="icon-home"></span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/physical-partner/spinner" className="active">
                                        Mill
                                    </Link>
                                </li>
                                <li>Add Result</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-md p-10 mt-2 mb-2">
                    <div className="w-full">
                        <div className="flex flex-col lg:flex-row lg:w-full gap-4 md:w-full sm:w-full ">
                            <div className='w-full'>
                                <Accordian
                                    title={"General Information"}
                                    content={renderMillLabInformation()}
                                    firstSign={<FaAngleDown color="white" />}
                                    secondSign={<FaAngleRight color="white" />}
                                />
                            </div>
                        </div>
                        <div className='mt-2'>
                            <CommonDataTable columns={columns} data={labMill.code ? [labMill] : []} pagination={false} count={[labMill].length} />
                        </div>
                    </div>
                    <div className='row mt-4'>
                        <div className='col-lg-6'>
                            <label className="text-gray-500 text-[12px] font-medium">
                                Upload Report (.jpg, .jpeg, .png, .pdf) *
                            </label>
                            <div className="inputFile">
                                <label>
                                    Choose File <GrAttachment />
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/jpeg, image/png, application/pdf"
                                        name="upload-report"
                                        id="upload-report"
                                        onChange={(e) => {
                                            handleDocumentsUpload(e.target.files || null);
                                        }}
                                        onClick={(event: any) => {
                                            event.currentTarget.value = null;
                                        }}
                                    />
                                </label>
                            </div>
                            {uploadReportFileNames.length > 0 && (
                                <div className="flex text-sm mt-1">
                                    <GrAttachment />
                                    <p className="mx-1">{uploadReportFileNames.join(', ')}</p>
                                </div>
                            )}
                            {errors.uploadReports !== "" && (
                                <div className="text-sm text-red-500 ">{errors.uploadReports}</div>
                            )}
                        </div>
                    </div>

                    <hr className="mb-3 mt-5" />

                    <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                        <button
                            className="btn-purple mr-2"
                            disabled={isSubmitting}
                            style={
                                (isSubmitting)
                                    ? { cursor: "not-allowed", opacity: 0.8 }
                                    : { cursor: "pointer", backgroundColor: "#D15E9C" }
                            }
                            onClick={handleSubmit}
                        >
                            {translations?.common?.submit}
                        </button>
                        <button
                            className="btn-outline-purple"
                            onClick={() => router.push('/lab/mill')}
                        >
                            {translations?.common?.cancel}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddMillResult;