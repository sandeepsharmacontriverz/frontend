"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import { toasterSuccess } from '@components/core/Toaster';
import API from '@lib/Api';

interface Season {
    id: number;
    name: string;
    status: boolean;
    from: string;
    to: string;
}

interface SeedCompany {
    id: number;
    name: string;
    status: boolean;
}

interface LabMaster {
    id: number;
    name: string;
    status: boolean;
}

interface FormDataState {
    id?: string | number;
    season_id: number | string;
    seed_company_id: number | string;
    lotno: string;
    variety: string;
    packets: string;
    district: string;
    state: string;
    testing_code: string;
    seal_no: string;
    date_sending_sample: string;
    date_of_report: string;
    report_no: string;
    nos: string;
    thirtyfives: string;
    result_of_lab: string;
    lab_master_id: number | string;
}

const EditSeedTestingLinkage = () => {
    useTitle("Edit Seed Testing Linkage");

    const router = useRouter();
    const { translations, loading } = useTranslations();

    const [seasons, setSeasons] = useState<Array<Season>>([]);
    const [seedCompanies, setSeedCompanies] = useState<Array<SeedCompany>>([]);
    const [labMasters, setLabMasters] = useState<Array<LabMaster>>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [formData, setFormData] = useState<FormDataState>({
        id: "",
        season_id: "",
        seed_company_id: "",
        lotno: "",
        variety: "",
        packets: "",
        district: "",
        state: "",
        testing_code: "",
        seal_no: "",
        date_sending_sample: "",
        date_of_report: "",
        report_no: "",
        nos: "",
        thirtyfives: "",
        result_of_lab: "",
        lab_master_id: ""
    });
    const [errors, setErrors] = useState<FormDataState>({
        season_id: "",
        seed_company_id: "",
        lotno: "",
        variety: "",
        packets: "",
        district: "",
        state: "",
        testing_code: "",
        seal_no: "",
        date_sending_sample: "",
        date_of_report: "",
        report_no: "",
        nos: "",
        thirtyfives: "",
        result_of_lab: "",
        lab_master_id: ""
    });

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const fetchSeedTestingLinkage = async () => {
        const response = await API.get(`organic-program-data-digitization/seed-testing-linkage/${id}`);
        if (response.success) {
            setFormData((prevData: FormDataState) => {
                return {
                    ...prevData,
                    id: response.data.id,
                    season_id: response.data.season_id,
                    seed_company_id: response.data.seed_company_id,
                    lotno: response.data.lotno,
                    variety: response.data.variety,
                    packets: response.data.packets,
                    district: response.data.district,
                    state: response.data.state,
                    testing_code: response.data.testing_code,
                    seal_no: response.data.seal_no,
                    date_sending_sample: response.data.date_sending_sample,
                    date_of_report: response.data.date_of_report,
                    report_no: response.data.report_no,
                    nos: response.data.nos,
                    thirtyfives: response.data.thirtyfives,
                    result_of_lab: response.data.result_of_lab,
                    lab_master_id: response.data.lab_master_id
                };
            });
        }
    };

    const fetchSeasons = async () => {
        try {
            const res = await API.get("season");
            if (res.success) {
                setSeasons(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSeedCompanies = async () => {
        try {
            const res = await API.get("seed-company");
            if (res.success) {
                setSeedCompanies(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchLabMasters = async () => {
        try {
            const res = await API.get("lab-master");
            if (res.success) {
                setLabMasters(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        setFormData((prevFormData: any) => ({
            ...prevFormData,
            [name]: value,
        }));

        setErrors((prev: any) => ({
            ...prev,
            [name]: "",
        }));
    };

    const validateField = (name: string, value: any) => {
        switch (name) {
            case "season_id":
                return !value ? "Season is required" : "";
            case "seed_company_id":
                return !value ? "Seed company name is required" : "";
            case "lotno":
                return value.trim() === "" ? "Lot no. is required" : "";
            case "variety":
                return value.trim() === "" ? "Variety is required" : "";
            case "packets":
                return value.trim() === "" ? "Packets is required" : "";
            case "district":
                return value.trim() === "" ? "District is required" : "";
            case "state":
                return value.trim() === "" ? "State is required" : "";
            case "testing_code":
                return value.trim() === "" ? "Testing code is required" : "";
            case "seal_no":
                return value.trim() === "" ? "Seal no. is required" : "";
            case "date_sending_sample":
                return !value ? "Date of Sending Sample is required" : "";
            case "date_of_report":
                return !value ? "Date of the report is required" : "";
            case "report_no":
                return value.trim() === "" ? "Report no. is required" : "";
            case "nos":
                return value.trim() === "" ? "NOS is required" : "";
            case "thirtyfives":
                return value.trim() === "" ? "35 S is required" : "";
            case "result_of_lab":
                return value.trim() === "" ? "Result of lab is required" : "";
            case "lab_master_id":
                return !value ? "Lab name is required" : "";
            default:
                return "";
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const newErrors: any = {};
            Object.keys(formData).forEach((fieldName: string) => {
                newErrors[fieldName] = validateField(
                    fieldName,
                    formData[fieldName as keyof FormDataState]
                );
            });

            const hasErrors = Object.values(newErrors).some((error) => error);
            if (!hasErrors) {
                const url = "organic-program-data-digitization/seed-testing-linkage";
                const mainFormData: FormDataState = {
                    id: formData.id,
                    season_id: formData.season_id,
                    seed_company_id: formData.seed_company_id,
                    lotno: formData.lotno,
                    variety: formData.variety,
                    packets: formData.packets,
                    district: formData.district,
                    state: formData.state,
                    testing_code: formData.testing_code,
                    seal_no: formData.seal_no,
                    date_sending_sample: formData.date_sending_sample,
                    date_of_report: formData.date_of_report,
                    report_no: formData.report_no,
                    nos: formData.nos,
                    thirtyfives: formData.thirtyfives,
                    result_of_lab: formData.result_of_lab,
                    lab_master_id: formData.lab_master_id
                };

                const mainResponse = await API.put(url, mainFormData);

                if (mainResponse.success) {
                    toasterSuccess("Record updated successfully");
                    router.push("/services/organic-program-data-digitization/seed-testing-linkage");
                }
            } else {
                setErrors(newErrors);
            }
            setIsSubmitting(false);
        } catch (error) {
            console.log("Error submitting form:", error);
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchSeedTestingLinkage();
        }
    }, [id]);

    useEffect(() => {
        fetchSeasons();
        fetchSeedCompanies();
        fetchLabMasters();
    }, []);

    if (loading) {
        return (<div><Loader /></div>);
    }

    return (
        <>
            <div className="breadcrumb-box">
                <div className="breadcrumb-inner light-bg">
                    <div className="breadcrumb-left">
                        <ul className="breadcrum-list-wrap">
                            <li className="active">
                                <Link href="/dashboard">
                                    <span className="icon-home"></span>
                                </Link>
                            </li>
                            <li>Services</li>
                            <li>Organic Program Data Digitization</li>
                            <li>
                                <Link href="/services/organic-program-data-digitization/seed-testing-linkage">
                                    Seed Testing Linkage
                                </Link>
                            </li>
                            <li>Edit Seed Testing Linkage</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-md p-4 mt-2">
                <div className="w-100 mt-2">
                    <div className="row">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Season *
                            </label>
                            <select
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="season_id"
                                value={formData.season_id || ""}
                                onChange={handleChange}
                            >
                                <option value="">{translations?.common?.SelectSeason}</option>
                                {seasons?.map((season: Season) => (
                                    <option key={season.id} value={season.id}>
                                        {season.name}
                                    </option>
                                ))}
                            </select>
                            {errors.season_id !== "" && (
                                <div className="text-sm text-red-500 ">{errors.season_id}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Seed Company Name *
                            </label>
                            <select
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="seed_company_id"
                                value={formData.seed_company_id || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Seed Company</option>
                                {seedCompanies?.map((seedCompnay: SeedCompany) => (
                                    <option key={seedCompnay.id} value={seedCompnay.id}>
                                        {seedCompnay.name}
                                    </option>
                                ))}
                            </select>
                            {errors.seed_company_id !== "" && (
                                <div className="text-sm text-red-500 ">{errors.seed_company_id}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Lot No *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter lot no.'
                                name="lotno"
                                value={formData.lotno || ""}
                                onChange={handleChange}
                            />
                            {errors.lotno !== "" && (
                                <div className="text-sm text-red-500 ">{errors.lotno}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Variety *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter variety'
                                name="variety"
                                value={formData.variety || ""}
                                onChange={handleChange}
                            />
                            {errors.variety !== "" && (
                                <div className="text-sm text-red-500 ">{errors.variety}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Available packets (450 gm) *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter available packets'
                                name="packets"
                                value={formData.packets || ""}
                                onChange={handleChange}
                            />
                            {errors.packets !== "" && (
                                <div className="text-sm text-red-500 ">{errors.packets}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Location Dist. *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter district'
                                name="district"
                                value={formData.district || ""}
                                onChange={handleChange}
                            />
                            {errors.district !== "" && (
                                <div className="text-sm text-red-500 ">{errors.district}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                State *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter state'
                                name="state"
                                value={formData.state || ""}
                                onChange={handleChange}
                            />
                            {errors.state !== "" && (
                                <div className="text-sm text-red-500 ">{errors.state}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Testing Code *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter testing code'
                                name="testing_code"
                                value={formData.testing_code || ""}
                                onChange={handleChange}
                            />
                            {errors.testing_code !== "" && (
                                <div className="text-sm text-red-500 ">{errors.testing_code}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Seal No. *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter seal no.'
                                name="seal_no"
                                value={formData.seal_no || ""}
                                onChange={handleChange}
                            />
                            {errors.seal_no !== "" && (
                                <div className="text-sm text-red-500 ">{errors.seal_no}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Date of Sending Sample to LAB *
                            </label>
                            <DatePicker
                                name='date_sending_sample'
                                selected={formData.date_sending_sample ? new Date(formData.date_sending_sample) : null}
                                onChange={(date) => {
                                    setFormData((prev: any) => ({ ...prev, date_sending_sample: date }));
                                    setErrors((prev: any) => ({ ...prev, date_sending_sample: "" }));
                                }}
                                showYearDropdown
                                placeholderText="Select a date"
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            />
                            {errors.date_sending_sample !== "" && (
                                <div className="text-sm text-red-500 ">{errors.date_sending_sample}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Date Of The Report *
                            </label>
                            <DatePicker
                                name='date_of_report'
                                selected={formData.date_of_report ? new Date(formData.date_of_report) : null}
                                onChange={(date) => {
                                    setFormData((prev: any) => ({ ...prev, date_of_report: date }));
                                    setErrors((prev: any) => ({ ...prev, date_of_report: "" }));
                                }}
                                showYearDropdown
                                placeholderText="Select a date"
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            />
                            {errors.date_of_report !== "" && (
                                <div className="text-sm text-red-500 ">{errors.date_of_report}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Test Report No. *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter test report no.'
                                name="report_no"
                                value={formData.report_no || ""}
                                onChange={handleChange}
                            />
                            {errors.report_no !== "" && (
                                <div className="text-sm text-red-500 ">{errors.report_no}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                NOS *
                            </label>
                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                <label className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name="nos"
                                            value="Positive"
                                            checked={formData.nos === "Positive"}
                                            onChange={handleChange}
                                        />
                                        <span></span>
                                    </section>
                                    Positive
                                </label>

                                <label className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name="nos"
                                            value="Negative"
                                            checked={formData.nos === "Negative"}
                                            onChange={handleChange}
                                        />
                                        <span></span>
                                    </section>
                                    Negative
                                </label>
                            </div>
                            {errors.nos !== "" && (
                                <div className="text-sm text-red-500 ">{errors.nos}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                35 S *
                            </label>
                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                <label className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name="thirtyfives"
                                            value="Positive"
                                            checked={formData.thirtyfives === "Positive"}
                                            onChange={handleChange}
                                        />
                                        <span></span>
                                    </section>
                                    Positive
                                </label>

                                <label className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name="thirtyfives"
                                            value="Negative"
                                            checked={formData.thirtyfives === "Negative"}
                                            onChange={handleChange}
                                        />
                                        <span></span>
                                    </section>
                                    Negative
                                </label>
                            </div>
                            {errors.thirtyfives !== "" && (
                                <div className="text-sm text-red-500 ">{errors.thirtyfives}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Result of External Lab (GMO) *
                            </label>
                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                <label className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name="result_of_lab"
                                            value="Positive"
                                            checked={formData.result_of_lab === "Positive"}
                                            onChange={handleChange}
                                        />
                                        <span></span>
                                    </section>
                                    Positive
                                </label>

                                <label className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name="result_of_lab"
                                            value="Negative"
                                            checked={formData.result_of_lab === "Negative"}
                                            onChange={handleChange}
                                        />
                                        <span></span>
                                    </section>
                                    Negative
                                </label>
                            </div>
                            {errors.result_of_lab !== "" && (
                                <div className="text-sm text-red-500 ">{errors.result_of_lab}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Name of Lab *
                            </label>
                            <select
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="lab_master_id"
                                value={formData.lab_master_id || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Lab</option>
                                {labMasters?.map((labMaster: LabMaster) => (
                                    <option key={labMaster.id} value={labMaster.id}>
                                        {labMaster.name}
                                    </option>
                                ))}
                            </select>
                            {errors.lab_master_id !== "" && (
                                <div className="text-sm text-red-500 ">{errors.lab_master_id}</div>
                            )}
                        </div>
                    </div>

                    <hr className="mb-3 mt-5" />

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
                            onClick={() => router.back()}
                        >
                            {translations?.common?.cancel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EditSeedTestingLinkage;