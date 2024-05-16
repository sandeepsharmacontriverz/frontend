"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

interface FarmGroup {
    id: number;
    name: string;
    brand_id: number;
    status: boolean;
    latitude: string | null;
    longitude: string | null;
}

interface Ics {
    id: number;
    ics_name: string;
    farmGroup_id: number;
    ics_latitude: string | null;
    ics_longitude: string | null;
    ics_status: boolean;
}

interface CropCurrentSeason {
    id: number;
    crop_name: string;
}

interface FormDataState {
    season_id: string | number;
    farm_group_id: string | number;
    ics_id: string | number;
    no_of_farmer: string;
    total_area: string;
    est_cotton_area: string;
    estimated_lint: string;
    verified_row_cotton: string;
    verified_ginner: string;
    crop_current_season_id: string | number;
    organic_standard: string;
    certification_body: string;
    scope_issued_date: string;
    scope_certification_validity: string;
    scope_certification_no: string;
    nop_scope_certification_no: string;
    district: string;
    state: string;
    remark: string;
}

const AddIcsQuantityEstimation = () => {
    useTitle("Add Ics Quantity Estimation");

    const router = useRouter();
    const { translations, loading } = useTranslations();

    const [seasons, setSeasons] = useState<Array<Season>>([]);
    const [farmGroups, setFarmGroups] = useState<Array<FarmGroup>>([]);
    const [ics, setIcs] = useState<Array<Ics>>([]);
    const [cropCurrentSeasons, setCropCurrentSeasons] = useState<Array<CropCurrentSeason>>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [formData, setFormData] = useState<FormDataState>({
        season_id: "",
        farm_group_id: "",
        ics_id: "",
        no_of_farmer: "",
        total_area: "",
        est_cotton_area: "",
        estimated_lint: "",
        verified_row_cotton: "",
        verified_ginner: "",
        crop_current_season_id: "",
        organic_standard: "",
        certification_body: "",
        scope_issued_date: "",
        scope_certification_validity: "",
        scope_certification_no: "",
        nop_scope_certification_no: "",
        district: "",
        state: "",
        remark: ""
    });
    const [errors, setErrors] = useState<FormDataState>({
        season_id: "",
        farm_group_id: "",
        ics_id: "",
        no_of_farmer: "",
        total_area: "",
        est_cotton_area: "",
        estimated_lint: "",
        verified_row_cotton: "",
        verified_ginner: "",
        crop_current_season_id: "",
        organic_standard: "",
        certification_body: "",
        scope_issued_date: "",
        scope_certification_validity: "",
        scope_certification_no: "",
        nop_scope_certification_no: "",
        district: "",
        state: "",
        remark: ""
    });

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

    const fetchFarmGroups = async () => {
        try {
            const res = await API.get("farm-group");
            if (res.success) {
                setFarmGroups(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchIcs = async () => {
        if (formData.farm_group_id) {
            try {
                const res = await API.get(`ics?farmGroupId=${formData.farm_group_id}`);
                if (res.success) {
                    setIcs(res.data);
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            setIcs([]);
        }
    };

    const fetchCropCurrentSeasons = async () => {
        try {
            const res = await API.get("crop-current-season");
            if (res.success) {
                setCropCurrentSeasons(res.data);
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
            case "farm_group_id":
                return !value ? "Farm group is required" : "";
            case "ics_id":
                return !value ? "Ics name is required" : "";
            case "no_of_farmer":
                return !value ? "No of farmers is required" : "";
            case "total_area":
                return !value ? "Total area is required" : "";
            case "est_cotton_area":
                return !value ? "Est. cotton area is required" : "";
            case "estimated_lint":
                return !value ? "Estimated Lint is required" : "";
            case "verified_row_cotton":
                return value.trim() === "" ? "Verified volume by CB as per TC (RAW COTTON) is required" : "";
            case "verified_ginner":
                return value.trim() === "" ? "Verified volume by CB as per TC (GINNER) is required" : "";
            case "crop_current_season_id":
                return !value ? "Status for current season crop is required" : "";
            case "organic_standard":
                return value.trim() === "" ? "Organic standard is required" : "";
            case "certification_body":
                return value.trim() === "" ? "Certification body is required" : "";
            case "scope_issued_date":
                return !value ? "Scope issued date is required" : "";
            case "scope_certification_validity":
                return value.trim() === "" ? "Scope certificate validity is required" : "";
            case "scope_certification_no":
                return value.trim() === "" ? "Scope certificate no. is required" : "";
            case "nop_scope_certification_no":
                return value.trim() === "" ? "NOP scope certificate no. is required" : "";
            case "district":
                return value.trim() === "" ? "District is required" : "";
            case "state":
                return value.trim() === "" ? "State is required" : "";
            case "remark":
                return value.trim() === "" ? "Remark is required" : "";
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
                const url = "organic-program-data-digitization/ics-quantity-estimation";
                const mainFormData: FormDataState = {
                    season_id: formData.season_id,
                    farm_group_id: formData.farm_group_id,
                    ics_id: formData.ics_id,
                    no_of_farmer: formData.no_of_farmer,
                    total_area: formData.total_area,
                    est_cotton_area: formData.est_cotton_area,
                    estimated_lint: formData.estimated_lint,
                    verified_row_cotton: formData.verified_row_cotton,
                    verified_ginner: formData.verified_ginner,
                    crop_current_season_id: formData.crop_current_season_id,
                    organic_standard: formData.organic_standard,
                    certification_body: formData.certification_body,
                    scope_issued_date: formData.scope_issued_date,
                    scope_certification_validity: formData.scope_certification_validity,
                    scope_certification_no: formData.scope_certification_no,
                    nop_scope_certification_no: formData.nop_scope_certification_no,
                    district: formData.district,
                    state: formData.state,
                    remark: formData.remark
                };

                const mainResponse = await API.post(url, mainFormData);

                if (mainResponse.success) {
                    toasterSuccess("Record updated successfully");
                    router.push("/services/organic-program-data-digitization/ics-quantity-estimation");
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
        fetchSeasons();
        fetchFarmGroups();
        fetchCropCurrentSeasons();
    }, []);

    useEffect(() => {
        fetchIcs();
    }, [formData.farm_group_id]);

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
                                <Link href="/services/organic-program-data-digitization/ics-quantity-estimation">
                                    Ics Quantity Estimation
                                </Link>
                            </li>
                            <li>Add Ics Quantity Estimation</li>
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
                                Farm Group *
                            </label>
                            <select
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="farm_group_id"
                                value={formData.farm_group_id || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Farm Group</option>
                                {farmGroups?.map((farmGroup: FarmGroup) => (
                                    <option key={farmGroup.id} value={farmGroup.id}>
                                        {farmGroup.name}
                                    </option>
                                ))}
                            </select>
                            {errors.farm_group_id !== "" && (
                                <div className="text-sm text-red-500 ">{errors.farm_group_id}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                ICS Name *
                            </label>
                            <select
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="ics_id"
                                value={formData.ics_id || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Ics Name</option>
                                {ics?.map((i: Ics) => (
                                    <option key={i.id} value={i.id}>
                                        {i.ics_name}
                                    </option>
                                ))}
                            </select>
                            {errors.ics_id !== "" && (
                                <div className="text-sm text-red-500 ">{errors.ics_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                No.of farmers *
                            </label>
                            <input
                                type='number'
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter no. of farmers'
                                name="no_of_farmer"
                                value={formData.no_of_farmer || ""}
                                onChange={handleChange}
                            />
                            {errors.no_of_farmer !== "" && (
                                <div className="text-sm text-red-500 ">{errors.no_of_farmer}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Total Area (Ha) *
                            </label>
                            <input
                                type='number'
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter total area (HA)'
                                name="total_area"
                                value={formData.total_area || ""}
                                onChange={handleChange}
                            />
                            {errors.total_area !== "" && (
                                <div className="text-sm text-red-500 ">{errors.total_area}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Est. Cotton Area (Ha) *
                            </label>
                            <input
                                type='number'
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter est. cotton area (HA)'
                                name="est_cotton_area"
                                value={formData.est_cotton_area || ""}
                                onChange={handleChange}
                            />
                            {errors.est_cotton_area !== "" && (
                                <div className="text-sm text-red-500 ">{errors.est_cotton_area}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Estimated Lint (MT) *
                            </label>
                            <input
                                type='number'
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter estimated lint (MT)'
                                name="estimated_lint"
                                value={formData.estimated_lint || ""}
                                onChange={handleChange}
                            />
                            {errors.estimated_lint !== "" && (
                                <div className="text-sm text-red-500 ">{errors.estimated_lint}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Verified volume by CB as per TC (RAW COTTON) *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter verified row cotton'
                                name="verified_row_cotton"
                                value={formData.verified_row_cotton || ""}
                                onChange={handleChange}
                            />
                            {errors.verified_row_cotton !== "" && (
                                <div className="text-sm text-red-500 ">{errors.verified_row_cotton}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Verified volume by CB as per TC (GINNER) *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter verified ginner'
                                name="verified_ginner"
                                value={formData.verified_ginner || ""}
                                onChange={handleChange}
                            />
                            {errors.verified_ginner !== "" && (
                                <div className="text-sm text-red-500 ">{errors.verified_ginner}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Status for current season Crop (Organic/ NPOP/ IC2) *
                            </label>
                            <select
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="crop_current_season_id"
                                value={formData.crop_current_season_id || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Crop Current Season</option>
                                {cropCurrentSeasons?.map((cropCurrentSeason: CropCurrentSeason) => (
                                    <option key={cropCurrentSeason.id} value={cropCurrentSeason.id}>
                                        {cropCurrentSeason.crop_name}
                                    </option>
                                ))}
                            </select>
                            {errors.crop_current_season_id !== "" && (
                                <div className="text-sm text-red-500 ">{errors.crop_current_season_id}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Organic standard NPOP/NOP *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter organic standard'
                                name="organic_standard"
                                value={formData.organic_standard || ""}
                                onChange={handleChange}
                            />
                            {errors.organic_standard !== "" && (
                                <div className="text-sm text-red-500 ">{errors.organic_standard}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Certification body *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter certification body'
                                name="certification_body"
                                value={formData.certification_body || ""}
                                onChange={handleChange}
                            />
                            {errors.certification_body !== "" && (
                                <div className="text-sm text-red-500 ">{errors.certification_body}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Scope Issued Date *
                            </label>
                            <DatePicker
                                name='scope_issued_date'
                                selected={formData.scope_issued_date ? new Date(formData.scope_issued_date) : null}
                                onChange={(date) => {
                                    setFormData((prev: any) => ({ ...prev, scope_issued_date: date }));
                                    setErrors((prev: any) => ({ ...prev, scope_issued_date: "" }));
                                }}
                                showYearDropdown
                                placeholderText="Select a date"
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            />
                            {errors.scope_issued_date !== "" && (
                                <div className="text-sm text-red-500 ">{errors.scope_issued_date}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Scope certificate Validity / Lint avaibility in month *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter scope certificate validity'
                                name="scope_certification_validity"
                                value={formData.scope_certification_validity || ""}
                                onChange={handleChange}
                            />
                            {errors.scope_certification_validity !== "" && (
                                <div className="text-sm text-red-500 ">{errors.scope_certification_validity}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Scope Certificate No. *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter scope certificate no'
                                name="scope_certification_no"
                                value={formData.scope_certification_no || ""}
                                onChange={handleChange}
                            />
                            {errors.scope_certification_no !== "" && (
                                <div className="text-sm text-red-500 ">{errors.scope_certification_no}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                NOP Scope Certificate No. *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder='Enter nop scope certificate no'
                                name="nop_scope_certification_no"
                                value={formData.nop_scope_certification_no || ""}
                                onChange={handleChange}
                            />
                            {errors.nop_scope_certification_no !== "" && (
                                <div className="text-sm text-red-500 ">{errors.nop_scope_certification_no}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                District *
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
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Remark
                            </label>
                            <textarea
                                className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                placeholder="Enter remark"
                                name="remark"
                                rows={4}
                                value={formData.remark}
                                onChange={handleChange}

                            />
                            {errors.remark && (
                                <div className="text-red-500 text-sm ">{errors.remark}</div>
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
    );
}

export default AddIcsQuantityEstimation;