"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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

interface FormDataState {
    id?: string | number;
    season_id: number | string;
    project_name: string;
    seed_company_id: number | string;
    seed_variety: string;
    numbers_of_packets: string;
    project_location: string;
    remark: string;
}

const EditSeedDemand = () => {
    useTitle("Edit Seed Demand");

    const router = useRouter();
    const { translations, loading } = useTranslations();

    const [seasons, setSeasons] = useState<Array<Season>>([]);
    const [seedCompanies, setSeedCompanies] = useState<Array<SeedCompany>>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [formData, setFormData] = useState<FormDataState>({
        id: "",
        season_id: "",
        project_name: "",
        seed_company_id: "",
        seed_variety: "",
        numbers_of_packets: "",
        project_location: "",
        remark: ""
    });
    const [errors, setErrors] = useState<FormDataState>({
        season_id: "",
        project_name: "",
        seed_company_id: "",
        seed_variety: "",
        numbers_of_packets: "",
        project_location: "",
        remark: ""
    });

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const fetchSeedDemand = async () => {
        const response = await API.get(`organic-program-data-digitization/seed-demand/${id}`);
        if (response.success) {
            setFormData((prevData: FormDataState) => {
                return {
                    ...prevData,
                    id: response.data.id,
                    season_id: response.data.season_id,
                    project_name: response.data.project_name,
                    seed_company_id: response.data.seed_company_id,
                    seed_variety: response.data.seed_variety,
                    numbers_of_packets: response.data.numbers_of_packets,
                    project_location: response.data.project_location,
                    remark: response.data.remark
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
            case "project_name":
                return value.trim() === "" ? "Project name is required" : "";
            case "seed_company_id":
                return !value ? "Seed company name is required" : "";
            case "seed_variety":
                return value.trim() === "" ? "Seed variety is required" : "";
            case "numbers_of_packets":
                return value.trim() === "" ? "Numbers of packets is required" : "";
            case "project_location":
                return value.trim() === "" ? "Project location is required" : "";
            case "remark":
                return value.trim() === "" ? "Suggestion / Remark is required" : "";
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
                const url = "organic-program-data-digitization/seed-demand";
                const mainFormData: FormDataState = {
                    id: formData.id,
                    season_id: formData.season_id,
                    project_name: formData.project_name,
                    seed_company_id: formData.seed_company_id,
                    seed_variety: formData.seed_variety,
                    numbers_of_packets: formData.numbers_of_packets,
                    project_location: formData.project_location,
                    remark: formData.remark
                };

                const mainResponse = await API.put(url, mainFormData);

                if (mainResponse.success) {
                    toasterSuccess("Record updated successfully");
                    router.push("/services/organic-program-data-digitization/seed-demand");
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
            fetchSeedDemand();
        }
    }, [id]);

    useEffect(() => {
        fetchSeasons();
        fetchSeedCompanies();
    }, []);

    if (loading) {
        return (
            <div>
                <Loader />
            </div>
        );
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
                                <Link href="/services/organic-program-data-digitization/seed-demand">
                                    Seed Demand
                                </Link>
                            </li>
                            <li>Edit Seed Demand</li>
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
                                Project Name *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter project name'
                                name="project_name"
                                value={formData.project_name || ""}
                                onChange={handleChange}
                            />
                            {errors.project_name !== "" && (
                                <div className="text-sm text-red-500 ">{errors.project_name}</div>
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
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Seed Variety *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter seed variety'
                                name="seed_variety"
                                value={formData.seed_variety || ""}
                                onChange={handleChange}
                            />
                            {errors.seed_variety !== "" && (
                                <div className="text-sm text-red-500 ">{errors.seed_variety}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Numbers of packets *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter numbers of packets'
                                name="numbers_of_packets"
                                value={formData.numbers_of_packets || ""}
                                onChange={handleChange}
                            />
                            {errors.numbers_of_packets !== "" && (
                                <div className="text-sm text-red-500 ">{errors.numbers_of_packets}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Project Location *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter project location'
                                name="project_location"
                                value={formData.project_location || ""}
                                onChange={handleChange}
                            />
                            {errors.project_location !== "" && (
                                <div className="text-sm text-red-500 ">{errors.project_location}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Suggestion / Remark *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter suggestion/remark'
                                name="remark"
                                value={formData.remark || ""}
                                onChange={handleChange}
                            />
                            {errors.remark !== "" && (
                                <div className="text-sm text-red-500 ">{errors.remark}</div>
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

export default EditSeedDemand;