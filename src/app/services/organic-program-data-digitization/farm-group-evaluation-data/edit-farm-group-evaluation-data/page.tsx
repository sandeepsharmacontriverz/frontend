"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Multiselect from "multiselect-react-dropdown";
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import CommonDataTable from '@components/core/Table';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import API from '@lib/Api';
import User from '@lib/User';
import { GrAttachment } from "react-icons/gr";

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

const EditFarmGroupEvaluationData = () => {
    useTitle("Edit Farm Group Evaluation Data");

    const router = useRouter();
    const { translations, loading } = useTranslations();

    const [seasons, setSeasons] = useState<Array<Season>>([]);
    const [brands, setBrands] = useState<Array<any>>([]);
    const [farmGroups, setFarmGroups] = useState<Array<FarmGroup>>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [formData, setFormData] = useState<any>({
        id: "",
        season_id: "",
        agronomist_name: "",
        visit_from: "",
        visit_to: "",
        farm_group_type: "",
        farm_group_id: "",
        farm_group_name: "",
        address: "",
        registration_details: "",
        company_type: "",
        parent_company_name: "",
        owner_name: "",
        establishment_year: "",
        district_project_presence: "",
        program_type_by_organization: "",
        total_beneficiaries: "",
        brand_id: "",
        sustainable_cotton_program_type: "",
        total_no_farmers_in_organic_cotton: "",
        program_wise_no_farmers_in_other_sustain_cotton_program: "",
        total_number_of_current_ics: "",
        name_of_organic_certification_agencies: "",
        cotton_variety_grown_in_program_areas: "",
        state: "",
        district: "",
        block: "",
        village: "",
        no_of_farmers_met: "",
        scope_certificate_of_last_year_based_on_ics_score: "",
        scope_certificate_of_last_year_based_on_ics_remarks_doc: null,
        scope_certificate_of_last_year_based_on_ics_action: "",
        farmer_field_dairy_score: "",
        farmer_field_dairy_remarks_doc: null,
        farmer_field_dairy_action: "",
        farmer_training_attendence_register_score: "",
        farmer_training_attendence_register_remarks_doc: null,
        farmer_training_attendence_register_action: "",
        demonstration_register_score: "",
        demonstration_register_remarks_doc: null,
        demonstration_register_action: "",
        farmers_are_aware_of_organization_score: "",
        farmers_are_aware_of_organization_remarks: "",
        farmers_getting_support_of_any_kind_score: "",
        farmers_getting_support_of_any_kind_remarks: "",
        frequency_of_selling_your_cotton_to_the_organization_score: "",
        frequency_of_selling_your_cotton_to_the_organization_remarks: "",
        farmers_associated_organic_program_score: "",
        farmers_associated_organic_program_remarks: "",
        field_executive_support_by_imparing_knowledge_score: "",
        field_executive_support_by_imparing_knowledge_remarks: "",
        farmers_knows_the_name_of_field_executive_score: "",
        farmers_knows_the_name_of_field_executive_remarks: "",
        awareness_of_the_farmers_organic_practices_score: "",
        awareness_of_the_farmers_organic_practices_remarks: "",
        awareness_of_the_farmers_regarding_organic_certification_score: "",
        awareness_of_the_farmers_regarding_organic_certification_remarks: ""
    });
    const [errors, setErrors] = useState<any>({});
    const [uploadedFileNames, setUploadedFileNames] = useState<any>({
        scope_certificate_of_last_year_based_on_ics_remarks_doc: "",
        farmer_field_dairy_remarks_doc: "",
        farmer_training_attendence_register_remarks_doc: "",
        demonstration_register_remarks_doc: ""
    });

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const fetchFarmGroupEvaluationData = async () => {
        const response = await API.get(`organic-program-data-digitization/farm-group-evaluation-data/${id}`);
        if (response.success) {
            setFormData((prevData: any) => {
                return {
                    ...prevData,
                    id: response.data.id,
                    season_id: response.data.season_id,
                    agronomist_name: response.data.agronomist_name,
                    visit_from: response.data.visit_from,
                    visit_to: response.data.visit_to,
                    farm_group_type: "EXISTING",
                    farm_group_id: response.data.farm_group_id,
                    farm_group_name: "",
                    address: response.data.address,
                    registration_details: response.data.registration_details,
                    company_type: response.data.company_type,
                    parent_company_name: response.data.parent_company_name,
                    owner_name: response.data.owner_name,
                    establishment_year: response.data.establishment_year,
                    district_project_presence: response.data.district_project_presence,
                    program_type_by_organization: response.data.program_type_by_organization,
                    total_beneficiaries: response.data.total_beneficiaries,
                    brand_id: response.data.brand_id,
                    sustainable_cotton_program_type: response.data.sustainable_cotton_program_type,
                    total_no_farmers_in_organic_cotton: response.data.total_no_farmers_in_organic_cotton,
                    program_wise_no_farmers_in_other_sustain_cotton_program: response.data.program_wise_no_farmers_in_other_sustain_cotton_program,
                    total_number_of_current_ics: response.data.total_number_of_current_ics,
                    name_of_organic_certification_agencies: response.data.name_of_organic_certification_agencies,
                    cotton_variety_grown_in_program_areas: response.data.cotton_variety_grown_in_program_areas,
                    state: response.data.state,
                    district: response.data.district,
                    block: response.data.block,
                    village: response.data.village,
                    no_of_farmers_met: response.data.no_of_farmers_met,
                    scope_certificate_of_last_year_based_on_ics_score: response.data.scope_certificate_of_last_year_based_on_ics_score,
                    scope_certificate_of_last_year_based_on_ics_remarks_doc: response.data.scope_certificate_of_last_year_based_on_ics_remarks_doc,
                    scope_certificate_of_last_year_based_on_ics_action: response.data.scope_certificate_of_last_year_based_on_ics_action,
                    farmer_field_dairy_score: response.data.farmer_field_dairy_score,
                    farmer_field_dairy_remarks_doc: response.data.farmer_field_dairy_remarks_doc,
                    farmer_field_dairy_action: response.data.farmer_field_dairy_action,
                    farmer_training_attendence_register_score: response.data.farmer_training_attendence_register_score,
                    farmer_training_attendence_register_remarks_doc: response.data.farmer_training_attendence_register_remarks_doc,
                    farmer_training_attendence_register_action: response.data.farmer_training_attendence_register_action,
                    demonstration_register_score: response.data.demonstration_register_score,
                    demonstration_register_remarks_doc: response.data.demonstration_register_remarks_doc,
                    demonstration_register_action: response.data.demonstration_register_action,
                    farmers_are_aware_of_organization_score: response.data.farmers_are_aware_of_organization_score,
                    farmers_are_aware_of_organization_remarks: response.data.farmers_are_aware_of_organization_remarks,
                    farmers_getting_support_of_any_kind_score: response.data.farmers_getting_support_of_any_kind_score,
                    farmers_getting_support_of_any_kind_remarks: response.data.farmers_getting_support_of_any_kind_remarks,
                    frequency_of_selling_your_cotton_to_the_organization_score: response.data.frequency_of_selling_your_cotton_to_the_organization_score,
                    frequency_of_selling_your_cotton_to_the_organization_remarks: response.data.frequency_of_selling_your_cotton_to_the_organization_remarks,
                    farmers_associated_organic_program_score: response.data.farmers_associated_organic_program_score,
                    farmers_associated_organic_program_remarks: response.data.farmers_associated_organic_program_remarks,
                    field_executive_support_by_imparing_knowledge_score: response.data.field_executive_support_by_imparing_knowledge_score,
                    field_executive_support_by_imparing_knowledge_remarks: response.data.field_executive_support_by_imparing_knowledge_remarks,
                    farmers_knows_the_name_of_field_executive_score: response.data.farmers_knows_the_name_of_field_executive_score,
                    farmers_knows_the_name_of_field_executive_remarks: response.data.farmers_knows_the_name_of_field_executive_remarks,
                    awareness_of_the_farmers_organic_practices_score: response.data.awareness_of_the_farmers_organic_practices_score,
                    awareness_of_the_farmers_organic_practices_remarks: response.data.awareness_of_the_farmers_organic_practices_remarks,
                    awareness_of_the_farmers_regarding_organic_certification_score: response.data.awareness_of_the_farmers_regarding_organic_certification_score,
                    awareness_of_the_farmers_regarding_organic_certification_remarks: response.data.awareness_of_the_farmers_regarding_organic_certification_remarks
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

    const fetchBrands = async () => {
        try {
            const res = await API.get("brand");
            if (res.success) {
                setBrands(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchFarmGroups = async () => {
        if (formData.brand_id) {
            try {
                const res = await API.get(`farm-group?brandId=${formData.brand_id}`);
                if (res.success) {
                    setFarmGroups(res.data);
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            setFarmGroups([]);
            setFormData((prev: any) => ({
                ...prev,
                farm_group_id: ""
            }))
        }
    };

    const getFarmersCountByBrandAndFarmGroup = async () => {
        if (formData.brand_id && formData.farm_group_id) {
            try {
                const res = await API.get(`organic-program-data-digitization/farm-group-evaluation-data/farmer-count?brand_id=${formData.brand_id}&farmGroup_id=${formData.farm_group_id}`);
                if (res.success) {
                    setFormData((prev: any) => ({
                        ...prev,
                        total_no_farmers_in_organic_cotton: res.data.farmerCount
                    }));
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    const minimumScoreToQualify = useMemo(() => {
        const score = Number(formData.scope_certificate_of_last_year_based_on_ics_score) +
            Number(formData.farmer_field_dairy_score) +
            Number(formData.farmer_training_attendence_register_score) +
            Number(formData.demonstration_register_score) +
            Number(formData.farmers_are_aware_of_organization_score) +
            Number(formData.farmers_getting_support_of_any_kind_score) +
            Number(formData.frequency_of_selling_your_cotton_to_the_organization_score) +
            Number(formData.farmers_associated_organic_program_score) +
            Number(formData.field_executive_support_by_imparing_knowledge_score) +
            Number(formData.farmers_knows_the_name_of_field_executive_score) +
            Number(formData.awareness_of_the_farmers_organic_practices_score) +
            Number(formData.awareness_of_the_farmers_regarding_organic_certification_score);
        return score;
    }, [
        formData.scope_certificate_of_last_year_based_on_ics_score,
        formData.farmer_field_dairy_score,
        formData.farmer_training_attendence_register_score,
        formData.demonstration_register_score,
        formData.farmers_are_aware_of_organization_score,
        formData.farmers_getting_support_of_any_kind_score,
        formData.frequency_of_selling_your_cotton_to_the_organization_score,
        formData.farmers_associated_organic_program_score,
        formData.field_executive_support_by_imparing_knowledge_score,
        formData.farmers_knows_the_name_of_field_executive_score,
        formData.awareness_of_the_farmers_organic_practices_score,
        formData.awareness_of_the_farmers_regarding_organic_certification_score
    ]);

    const handleChange = (key: string, value: any) => {
        setFormData((prevFormData: any) => ({
            ...prevFormData,
            [key]: value,
        }));

        setErrors((prev: any) => ({
            ...prev,
            [key]: "",
        }));
    };

    const handleDocumentsUpload = async (key: string, file: File | null) => {
        if (file) {
            const allowedFormats = [
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ];

            if (!allowedFormats.includes(file?.type)) {
                setErrors((prevError: any) => ({
                    ...prevError,
                    [key]: "Invalid file format. Upload a valid file",
                }));
                return;
            }

            const maxFileSize = 200 * 1024 * 1024;
            if (file.size > maxFileSize) {
                setErrors((prevError: any) => ({
                    ...prevError,
                    [key]: `File size exceeds the maximum limit (200MB).`,
                }));
                return;
            }

            const url = "file/upload";
            const fileFormData = new FormData();
            fileFormData.append("file", file);
            try {
                const response = await API.postFile(url, fileFormData);
                if (response.success) {
                    setUploadedFileNames((prevFile: any) => ({
                        ...prevFile,
                        [key]: file.name,
                    }));

                    setFormData((prevFormData: any) => ({
                        ...prevFormData,
                        [key]: response.data,
                    }));

                    setErrors((prevError: any) => ({
                        ...prevError,
                        [key]: "",
                    }));
                }
            } catch (error) {
                console.log(error, "error");
            }
        } else {
            toasterError("Could not select file, try again to select.");
        }
    }

    const validateField = (name: string, value: any) => {
        switch (name) {
            case "season_id":
                return !value ? "Season is required" : "";
            case "agronomist_name":
                return !value || value.trim() === "" ? "Visitor/Evaluator name is required" : "";
            case "address":
                return !value || value.trim() === "" ? "Address is required" : "";
            case "visit_from":
                return !value ? "Visit from is required" : "";
            case "visit_to":
                return !value ? "Visit to is required" : "";
            case "registration_details":
                return !value || value.trim() === "" ? "Registration details is required" : "";
            case "company_type":
                return !value || value.trim() === "" ? "Type of company is required" : "";
            case "parent_company_name":
                return !value || value.trim() === "" ? "Name of parent company is required" : "";
            case "owner_name":
                return !value || value.trim() === "" ? "Name of owner is required" : "";
            case "establishment_year":
                return !value || value.trim() === "" ? "Establishment year is required" : "";
            case "district_project_presence":
                return !value || value.trim() === "" ? "Districts presence is required" : "";
            case "program_type_by_organization":
                return !value || value.trim() === "" ? "Type of programs is required" : "";
            case "total_beneficiaries":
                return !value || value.trim() === "" ? "Total beneficiaries is required" : "";
            case "brand_id":
                return !value ? "Brand is required" : "";
            case "farm_group_type":
                return !value ? "Select farm froup type" : "";
            case "farm_group_id":
                return formData.farm_group_type === "EXISTING" && !value ? "Farm group is required" : "";
            case "farm_group_name":
                return formData.farm_group_type === "NEW" && (!value || value.trim() === "") ? "Farm group name is required" : "";
            case "sustainable_cotton_program_type":
                return !value || value.trim() === "" ? "Type of sustainable cotton programs is required" : "";
            case "total_no_farmers_in_organic_cotton":
                return value === "" || isNaN(value) ? "Total number of farmers is required" : "";
            case "program_wise_no_farmers_in_other_sustain_cotton_program":
                return value === "" || isNaN(value) ? "Program wise number of farmers is required" : "";
            case "total_number_of_current_ics":
                return !value || value.trim() === "" ? "Total number of current ICS is required" : "";
            case "name_of_organic_certification_agencies":
                return !value || value.trim() === "" ? "Name of organic certification agencies is required" : "";
            case "cotton_variety_grown_in_program_areas":
                return !value || value.trim() === "" ? "Cotton variety grown in program areas is required" : "";
            case "state":
                return !value || value.trim() === "" ? "State is required" : "";
            case "district":
                return !value || value.trim() === "" ? "District is required" : "";
            case "block":
                return !value || value.trim() === "" ? "Taluka/Block is required" : "";
            case "village":
                return !value || value.trim() === "" ? "Village is required" : "";
            case "no_of_farmers_met":
                return value === "" || isNaN(value) ? "Number of farmers met is required" : "";

            case "scope_certificate_of_last_year_based_on_ics_score":
                return value === "" ? "Score is required" : "";
            case "scope_certificate_of_last_year_based_on_ics_action":
                return !value || value.trim() === "" ? "Action is required" : "";
            case "farmer_field_dairy_score":
                return value === "" ? "Score is required" : "";
            case "farmer_field_dairy_action":
                return !value || value.trim() === "" ? "Action is required" : "";
            case "farmer_training_attendence_register_score":
                return value === "" ? "Score is required" : "";
            case "farmer_training_attendence_register_action":
                return !value || value.trim() === "" ? "Action is required" : "";
            case "demonstration_register_score":
                return value === "" ? "Score is required" : "";
            case "demonstration_register_action":
                return !value || value.trim() === "" ? "Action is required" : "";

            case "farmers_are_aware_of_organization_score":
                return value === "" ? "Score is required" : "";
            case "farmers_are_aware_of_organization_remarks":
                return !value || value.trim() === "" ? "Remarks is required" : "";
            case "farmers_getting_support_of_any_kind_score":
                return value === "" ? "Score is required" : "";
            case "farmers_getting_support_of_any_kind_remarks":
                return !value || value.trim() === "" ? "Remarks is required" : "";
            case "frequency_of_selling_your_cotton_to_the_organization_score":
                return value === "" ? "Score is required" : "";
            case "frequency_of_selling_your_cotton_to_the_organization_remarks":
                return !value || value.trim() === "" ? "Remarks is required" : "";
            case "farmers_associated_organic_program_score":
                return value === "" ? "Score is required" : "";
            case "farmers_associated_organic_program_remarks":
                return !value || value.trim() === "" ? "Remarks is required" : "";
            case "field_executive_support_by_imparing_knowledge_score":
                return value === "" ? "Score is required" : "";
            case "field_executive_support_by_imparing_knowledge_remarks":
                return !value || value.trim() === "" ? "Remarks is required" : "";
            case "farmers_knows_the_name_of_field_executive_score":
                return value === "" ? "Score is required" : "";
            case "farmers_knows_the_name_of_field_executive_remarks":
                return !value || value.trim() === "" ? "Remarks is required" : "";
            case "awareness_of_the_farmers_organic_practices_score":
                return value === "" ? "Score is required" : "";
            case "awareness_of_the_farmers_organic_practices_remarks":
                return !value || value.trim() === "" ? "Remarks is required" : "";
            case "awareness_of_the_farmers_regarding_organic_certification_score":
                return value === "" ? "Score is required" : "";
            case "awareness_of_the_farmers_regarding_organic_certification_remarks":
                return !value || value.trim() === "" ? "Remarks is required" : "";
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
                    formData[fieldName]
                );
            });

            const hasErrors = Object.values(newErrors).some((error) => error);
            if (!hasErrors) {
                const url = "organic-program-data-digitization/farm-group-evaluation-data";
                const { id, ...mainData } = formData;
                const mainFormData = { id, data: { ...mainData, created_by: User.id } };
                const mainResponse = await API.put(url, mainFormData);

                if (mainResponse.success) {
                    toasterSuccess("Record updated successfully");
                    router.push("/services/organic-program-data-digitization/farm-group-evaluation-data");
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
            fetchFarmGroupEvaluationData();
        }
    }, [id]);

    useEffect(() => {
        fetchSeasons();
        fetchBrands();
    }, []);

    useEffect(() => {
        fetchFarmGroups();
    }, [formData.brand_id]);

    useEffect(() => {
        getFarmersCountByBrandAndFarmGroup();
    }, [formData.farm_group_id]);

    if (loading) {
        return (<div><Loader /></div>);
    }

    const supportingDocumentsColumns = [
        {
            name: <p className="text-[13px] font-medium  py-2"></p>,
            cell: (row: any) => (
                <>
                    <div className='py-3'>
                        <label className="text-gray-500 text-[12px] font-medium">
                            {row.label}
                        </label>
                    </div>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true
        },
        {
            name: <p className="text-[13px] font-medium  py-2">Score</p>,
            cell: (row: any) => (
                <>
                    <div className='py-3'>
                        <div className="w-100 chooseOption d-flex flex-wrap">
                            <label className="mt-1 d-flex mr-4 align-items-center">
                                <section>
                                    <input
                                        type="radio"
                                        name={row.scoreKey}
                                        value={1}
                                        checked={formData[row.scoreKey] === 1}
                                        onChange={(e) => handleChange(e.target.name, parseFloat(e.target.value))}
                                    />
                                    <span></span>
                                </section>
                                Available
                            </label>

                            <label className="mt-1 d-flex mr-4 align-items-center">
                                <section>
                                    <input
                                        type="radio"
                                        name={row.scoreKey}
                                        value={0}
                                        checked={formData[row.scoreKey] === 0}
                                        onChange={(e) => handleChange(e.target.name, parseFloat(e.target.value))}
                                    />
                                    <span></span>
                                </section>
                                Not Available
                            </label>
                        </div>
                        {errors[row.scoreKey] !== "" && (
                            <div className="text-sm text-red-500 ">{errors[row.scoreKey]}</div>
                        )}
                    </div>
                </>
            ),
            minWidth: '150px',
            ignoreRowClick: true,
            allowOverflow: true
        },
        {
            name: <p className="text-[13px] font-medium  py-2">Remarks</p>,
            cell: (row: any) => (
                <>
                    <div className='py-3 w-full'>
                        <div className="inputFile">
                            <label>
                                Choose File <GrAttachment />
                                <input
                                    type="file"
                                    accept=".doc, .docx"
                                    name={row.remarksKey}
                                    id={row.remarksKey}
                                    onChange={(e) => handleDocumentsUpload(e.target.name, e.target.files?.[0] || null)}
                                    onClick={(event: any) => {
                                        event.currentTarget.value = null;
                                    }}
                                />
                            </label>
                        </div>
                        {uploadedFileNames[row.remarksKey] && (
                            <div className="flex text-sm mt-1">
                                <GrAttachment />
                                <p className="mx-1">{uploadedFileNames[row.remarksKey]}</p>
                            </div>
                        )}
                        {errors[row.remarksKey] !== "" && (
                            <div className="text-sm text-red-500 ">{errors[row.remarksKey]}</div>
                        )}
                    </div>
                </>
            ),
            minWidth: '150px',
            ignoreRowClick: true,
            allowOverflow: true
        },
        {
            name: <p className="text-[13px] font-medium py-2">Corrective action suggested (mention specific date given to FE to complete any remaining task)</p>,
            cell: (row: any) => (
                <>
                    <div className='py-3 w-full'>
                        <input
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            name={row.actionKey}
                            value={formData[row.actionKey] || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                        {errors[row.actionKey] !== "" && (
                            <div className="text-sm text-red-500 ">{errors[row.actionKey]}</div>
                        )}
                    </div>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true
        }
    ]

    const supportingDocuments = [
        {
            label: "Scope certificates of last year based on the ICSs",
            scoreKey: "scope_certificate_of_last_year_based_on_ics_score",
            remarksKey: "scope_certificate_of_last_year_based_on_ics_remarks_doc",
            actionKey: "scope_certificate_of_last_year_based_on_ics_action"
        },
        {
            label: "Farmer Field Diary or Organic Survey tools",
            scoreKey: "farmer_field_dairy_score",
            remarksKey: "farmer_field_dairy_remarks_doc",
            actionKey: "farmer_field_dairy_action"
        },
        {
            label: "Farmer Training/Attendance Register",
            scoreKey: "farmer_training_attendence_register_score",
            remarksKey: "farmer_training_attendence_register_remarks_doc",
            actionKey: "farmer_training_attendence_register_action"
        },
        {
            label: "Demonstration Register (optional)",
            scoreKey: "demonstration_register_score",
            remarksKey: "demonstration_register_remarks_doc",
            actionKey: "demonstration_register_action"
        }
    ]

    const farmerConnectColumns = [
        {
            name: <p className="text-[13px] font-medium  py-2"></p>,
            cell: (row: any) => (
                <>
                    <div className='py-3'>
                        <label className="text-gray-500 text-[12px] font-medium">
                            {row.label}
                        </label>
                    </div>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true
        },
        {
            name: <p className="text-[13px] font-medium  py-2">Score</p>,
            cell: (row: any) => (
                <>
                    <div className='py-3'>
                        <div className="w-100 chooseOption d-flex flex-wrap">
                            {row.options.map((opt: any, index: number) => (
                                <label key={index} className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name={row.scoreKey}
                                            value={opt.value}
                                            checked={formData[row.scoreKey] === opt.value}
                                            onChange={(e) => handleChange(e.target.name, parseFloat(e.target.value))}
                                        />
                                        <span></span>
                                    </section>
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                        {errors[row.scoreKey] !== "" && (
                            <div className="text-sm text-red-500 ">{errors[row.scoreKey]}</div>
                        )}
                    </div>
                </>
            ),
            minWidth: '150px',
            ignoreRowClick: true,
            allowOverflow: true
        },
        {
            name: <p className="text-[13px] font-medium py-2">Remarks</p>,
            cell: (row: any) => (
                <>
                    <div className='py-3 w-full'>
                        <textarea
                            className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            rows={2}
                            name={row.remarksKey}
                            value={formData[row.remarksKey] || ""}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}

                        />
                        {errors[row.remarksKey] !== "" && (
                            <div className="text-sm text-red-500 ">{errors[row.remarksKey]}</div>
                        )}
                    </div>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true
        }
    ]

    const farmerConnect = [
        {
            label: "Farmers are aware of the organization",
            scoreKey: "farmers_are_aware_of_organization_score",
            remarksKey: "farmers_are_aware_of_organization_remarks",
            options: [{ label: "Available", value: 1 }, { label: "Not Available", value: 0 }]
        },
        {
            label: "Farmers getting support of any kind (trainings, inputs etc.)",
            scoreKey: "farmers_getting_support_of_any_kind_score",
            remarksKey: "farmers_getting_support_of_any_kind_remarks",
            options: [{ label: "Available", value: 1 }, { label: "Not Available", value: 0 }]
        },
        {
            label: "Frequency of selling your cotton to the organization",
            scoreKey: "frequency_of_selling_your_cotton_to_the_organization_score",
            remarksKey: "frequency_of_selling_your_cotton_to_the_organization_remarks",
            options: [{ label: "Always", value: 2 }, { label: "Sometimes", value: 1 }, { label: "Never", value: 0 }]
        },
        {
            label: "Are the farmers associated with Organic program",
            scoreKey: "farmers_associated_organic_program_score",
            remarksKey: "farmers_associated_organic_program_remarks",
            options: [{ label: "Available", value: 1 }, { label: "Not Available", value: 0 }]
        },
        {
            label: "Do the field executive support by imparting knowledge or providing suggestions to the farmers",
            scoreKey: "field_executive_support_by_imparing_knowledge_score",
            remarksKey: "field_executive_support_by_imparing_knowledge_remarks",
            options: [{ label: "Available", value: 1 }, { label: "Not Available", value: 0 }]
        },
        {
            label: "Do the farmers knows the name of the Field Executive of the ICS",
            scoreKey: "farmers_knows_the_name_of_field_executive_score",
            remarksKey: "farmers_knows_the_name_of_field_executive_remarks",
            options: [{ label: "Available", value: 1 }, { label: "Not Available", value: 0 }]
        },
        {
            label: "Awareness of the farmers in organic practices",
            scoreKey: "awareness_of_the_farmers_organic_practices_score",
            remarksKey: "awareness_of_the_farmers_organic_practices_remarks",
            options: [{ label: "High", value: 2 }, { label: "Intermediate", value: 1 }, { label: "None", value: 0 }]
        },
        {
            label: "Awareness of the farmers regarding organic certification",
            scoreKey: "awareness_of_the_farmers_regarding_organic_certification_score",
            remarksKey: "awareness_of_the_farmers_regarding_organic_certification_remarks",
            options: [{ label: "High", value: 2 }, { label: "Intermediate", value: 1 }, { label: "None", value: 0 }]
        }
    ]

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
                                <Link href="/services/organic-program-data-digitization/farm-group-evaluation-data">
                                    Farm Group Evaluation Data
                                </Link>
                            </li>
                            <li>Edit Farm Group Evaluation Data</li>
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
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
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
                                Name of the Visitor/Evaluator Official *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="agronomist_name"
                                value={formData.agronomist_name || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.agronomist_name !== "" && (
                                <div className="text-sm text-red-500 ">{errors.agronomist_name}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Address *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="address"
                                value={formData.address || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.address !== "" && (
                                <div className="text-sm text-red-500 ">{errors.address}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Visit From *
                            </label>
                            <DatePicker
                                name='visit_from'
                                selected={formData.visit_from ? new Date(formData.visit_from) : null}
                                onChange={(date) => handleChange("visit_from", date)}
                                showYearDropdown
                                placeholderText="Select a date"
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            />
                            {errors.visit_from !== "" && (
                                <div className="text-sm text-red-500 ">{errors.visit_from}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Visit To *
                            </label>
                            <DatePicker
                                name='visit_to'
                                selected={formData.visit_to ? new Date(formData.visit_to) : null}
                                onChange={(date) => handleChange("visit_to", date)}
                                showYearDropdown
                                placeholderText="Select a date"
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            />
                            {errors.visit_to !== "" && (
                                <div className="text-sm text-red-500 ">{errors.visit_to}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Registration Details *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="registration_details"
                                value={formData.registration_details || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.registration_details !== "" && (
                                <div className="text-sm text-red-500 ">{errors.registration_details}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Type of Company *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="company_type"
                                value={formData.company_type || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.company_type !== "" && (
                                <div className="text-sm text-red-500 ">{errors.company_type}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Name of parent company *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="parent_company_name"
                                value={formData.parent_company_name || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.parent_company_name !== "" && (
                                <div className="text-sm text-red-500 ">{errors.parent_company_name}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Name of Owner/Directors/Trustees of Company *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="owner_name"
                                value={formData.owner_name || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.owner_name !== "" && (
                                <div className="text-sm text-red-500 ">{errors.owner_name}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Establishment year of organization *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="establishment_year"
                                value={formData.establishment_year || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.establishment_year !== "" && (
                                <div className="text-sm text-red-500 ">{errors.establishment_year}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Districts where project has its presence *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="district_project_presence"
                                value={formData.district_project_presence || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.district_project_presence !== "" && (
                                <div className="text-sm text-red-500 ">{errors.district_project_presence}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Type of programs undertaken by organization *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="program_type_by_organization"
                                value={formData.program_type_by_organization || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.program_type_by_organization !== "" && (
                                <div className="text-sm text-red-500 ">{errors.program_type_by_organization}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Total beneficiaries with the programs *
                            </label>
                            <input
                                type='number'
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="total_beneficiaries"
                                value={formData.total_beneficiaries || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.total_beneficiaries !== "" && (
                                <div className="text-sm text-red-500 ">{errors.total_beneficiaries}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Brand *
                            </label>
                            <select
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="brand_id"
                                value={formData.brand_id || ""}
                                onChange={(e) => {
                                    handleChange(e.target.name, e.target.value);
                                    handleChange('total_no_farmers_in_organic_cotton', 0);
                                }}
                            >
                                <option value="">{translations?.common?.Selectbrand}</option>
                                {brands?.map((brand: any) => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.brand_name}
                                    </option>
                                ))}
                            </select>
                            {errors.brand_id !== "" && (
                                <div className="text-sm text-red-500 ">{errors.brand_id}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Type of sustainable cotton programs undertaken *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="sustainable_cotton_program_type"
                                value={formData.sustainable_cotton_program_type || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.sustainable_cotton_program_type !== "" && (
                                <div className="text-sm text-red-500 ">{errors.sustainable_cotton_program_type}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Farm Group *
                            </label>
                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                <label className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name="farm_group_type"
                                            value="NEW"
                                            checked={formData.farm_group_type === "NEW"}
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                        />
                                        <span></span>
                                    </section>
                                    New
                                </label>

                                <label className="mt-1 d-flex mr-4 align-items-center">
                                    <section>
                                        <input
                                            type="radio"
                                            name="farm_group_type"
                                            value="EXISTING"
                                            checked={formData.farm_group_type === "EXISTING"}
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                        />
                                        <span></span>
                                    </section>
                                    Existing
                                </label>
                            </div>
                            {errors.farm_group_type !== "" && (
                                <div className="text-sm text-red-500 ">{errors.farm_group_type}</div>
                            )}
                        </div>

                        {formData.farm_group_type === "EXISTING" && (
                            <div className="col-12 col-sm-6 col-md-4 mt-2">
                                <label className="text-gray-500 text-[12px] font-medium">
                                    Select Farm Group *
                                </label>
                                <select
                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                    name="farm_group_id"
                                    value={formData.farm_group_id || ""}
                                    onChange={(e) => handleChange(e.target.name, e.target.value)}
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
                        )}

                        {formData.farm_group_type === "NEW" && (
                            <div className="col-12 col-sm-6 col-md-3 mt-2">
                                <label className="text-gray-500 text-[12px] font-medium">
                                    Farm group name *
                                </label>
                                <input
                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                    name="farm_group_name"
                                    value={formData.farm_group_name || ""}
                                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                                />
                                {errors.farm_group_name !== "" && (
                                    <div className="text-sm text-red-500 ">{errors.farm_group_name}</div>
                                )}
                            </div>
                        )}

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Total number of farmers in organic cotton programs *
                            </label>
                            <input
                                type='number'
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="total_no_farmers_in_organic_cotton"
                                value={formData.total_no_farmers_in_organic_cotton !== undefined ? formData.total_no_farmers_in_organic_cotton : ""}
                                onChange={(e) => {
                                    let value: string | number = parseFloat(e.target.value);
                                    value = isNaN(value) ? "" : value;
                                    handleChange(e.target.name, value);
                                }}
                            />
                            {errors.total_no_farmers_in_organic_cotton !== "" && (
                                <div className="text-sm text-red-500 ">{errors.total_no_farmers_in_organic_cotton}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Program wise number of farmers in other sustainable cotton programs *
                            </label>
                            <input
                                type='number'
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="program_wise_no_farmers_in_other_sustain_cotton_program"
                                value={formData.program_wise_no_farmers_in_other_sustain_cotton_program !== undefined ? formData.program_wise_no_farmers_in_other_sustain_cotton_program : ""}
                                onChange={(e) => {
                                    let value: string | number = parseFloat(e.target.value);
                                    value = isNaN(value) ? "" : value;
                                    handleChange(e.target.name, value);
                                }}
                            />
                            {errors.program_wise_no_farmers_in_other_sustain_cotton_program !== "" && (
                                <div className="text-sm text-red-500 ">{errors.program_wise_no_farmers_in_other_sustain_cotton_program}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-3 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Total number of current ICS *
                            </label>
                            <Multiselect
                                className="multiselect-dropdown w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                displayValue="total_number_of_current_ics"
                                selectedValues={formData.total_number_of_current_ics.split(',').map((e: string) => e.trim()).filter(Boolean)}
                                onKeyPressFn={function noRefCheck() { }}
                                onRemove={(selectedList: any, selectedItem: any) => {
                                    handleChange('total_number_of_current_ics', selectedList.join(", "));
                                }}
                                onSelect={(selectedList: any, selectedItem: any) => {
                                    handleChange('total_number_of_current_ics', selectedList.join(", "));
                                }}
                                isObject={false}
                                options={['IC1', 'IC2', 'IC3', 'Organic']}
                                showCheckbox
                            />
                            {errors.total_number_of_current_ics !== "" && (
                                <div className="text-sm text-red-500 ">{errors.total_number_of_current_ics}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-3 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Name of organic certification agencies *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="name_of_organic_certification_agencies"
                                value={formData.name_of_organic_certification_agencies || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.name_of_organic_certification_agencies !== "" && (
                                <div className="text-sm text-red-500 ">{errors.name_of_organic_certification_agencies}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Cotton variety grown in program areas (staple length) *
                            </label>
                            <Multiselect
                                className="multiselect-dropdown w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                displayValue="cotton_variety_grown_in_program_areas"
                                selectedValues={formData.cotton_variety_grown_in_program_areas.split(',').map((e: string) => e.trim()).filter(Boolean)}
                                onKeyPressFn={function noRefCheck() { }}
                                onRemove={(selectedList: any, selectedItem: any) => {
                                    handleChange('cotton_variety_grown_in_program_areas', selectedList.join(", "));
                                }}
                                onSelect={(selectedList: any, selectedItem: any) => {
                                    handleChange('cotton_variety_grown_in_program_areas', selectedList.join(", "));
                                }}
                                isObject={false}
                                options={['Short', 'Medium', 'Medium - Long  28 to 30 MM Mic 3.8 to 4.5', 'Long', 'Extra-Long']}
                                showCheckbox
                            />
                            {errors.cotton_variety_grown_in_program_areas !== "" && (
                                <div className="text-sm text-red-500 ">{errors.cotton_variety_grown_in_program_areas}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                State *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="state"
                                value={formData.state || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.state !== "" && (
                                <div className="text-sm text-red-500 ">{errors.state}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                District *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="district"
                                value={formData.district || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.district !== "" && (
                                <div className="text-sm text-red-500 ">{errors.district}</div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Taluka/ Block *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="block"
                                value={formData.block || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.block !== "" && (
                                <div className="text-sm text-red-500 ">{errors.block}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Village Name *
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="village"
                                value={formData.village || ""}
                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                            />
                            {errors.village !== "" && (
                                <div className="text-sm text-red-500 ">{errors.village}</div>
                            )}
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Number of farmers met *
                            </label>
                            <input
                                type='number'
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="no_of_farmers_met"
                                value={formData.no_of_farmers_met !== undefined ? formData.no_of_farmers_met : ""}
                                onChange={(e) => {
                                    let value: string | number = parseFloat(e.target.value);
                                    value = isNaN(value) ? "" : value;
                                    handleChange(e.target.name, value);
                                }}
                            />
                            {errors.no_of_farmers_met !== "" && (
                                <div className="text-sm text-red-500 ">{errors.no_of_farmers_met}</div>
                            )}
                        </div>
                    </div>

                    <div className='row mt-5'>
                        <h2 className="text-l font-semibold">Supporting documents to be provided</h2>
                        <div className='mt-2'>
                            <CommonDataTable columns={supportingDocumentsColumns} data={supportingDocuments} pagination={false} count={supportingDocuments.length} />
                        </div>
                    </div>

                    <div className='row mt-5'>
                        <h2 className="text-l font-semibold">Farmer connect with the Farm Group (observations based on FGD)</h2>
                        <div className='mt-2'>
                            <CommonDataTable columns={farmerConnectColumns} data={farmerConnect} pagination={false} count={farmerConnect.length} />
                        </div>
                    </div>

                    <div className='row mt-5'>
                        <div className="col-12 col-sm-6 col-md-4 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                                Minimum score to qualify
                            </label>
                            <input
                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                name="minimum_score_to_qualify"
                                disabled
                                value={minimumScoreToQualify}
                            />
                        </div>
                    </div>

                    <hr className="mb-3 mt-5" />

                    <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                        <button
                            className="btn-purple mr-2"
                            disabled={isSubmitting || minimumScoreToQualify < 12}
                            style={
                                (isSubmitting || minimumScoreToQualify < 12)
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

export default EditFarmGroupEvaluationData;