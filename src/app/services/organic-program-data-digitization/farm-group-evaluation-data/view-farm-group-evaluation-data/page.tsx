"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import moment from 'moment';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import Accordian from "@components/core/Accordian";
import CommonDataTable from '@components/core/Table';
import API from '@lib/Api';
import { FaAngleDown, FaAngleRight } from "react-icons/fa";

const ViewFarmGroupEvaluationData = () => {
    useTitle("Farm Group Evaluation Data Details");

    const router = useRouter();
    const [roleLoading] = useRole();
    const { translations, loading } = useTranslations();
    const [farmGroupEvaluationData, setFarmGroupEvaluationData] = useState<any>({});

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const fetchFarmGroupEvaluationData = async () => {
        try {
            const res = await API.get(`organic-program-data-digitization/farm-group-evaluation-data/${id}`);
            if (res.success) {
                setFarmGroupEvaluationData(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const dateFormatter = (date: any) => {
        const formatted = moment(date).format("DD-MM-YYYY");
        return formatted;
    };

    const handleView = (url: string) => {
        window.open(url, "_blank");
    };

    const renderGeneralInformation = () => {
        return (
            <div className="details-list-group mg-t-44">
                <ul className="detail-list">
                    <li className="item">
                        <span className="label">Season:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.season?.name || ""}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Name of the Visitor/Evaluator Official:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.agronomist_name}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Visit From:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.visit_from ? dateFormatter(farmGroupEvaluationData.visit_from) : ""}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Visit To:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.visit_to ? dateFormatter(farmGroupEvaluationData.visit_to) : ""}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Address:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.address}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Registration Details:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.registration_details}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Type of Company:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.company_type}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Name of parent company:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.parent_company_name}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Name of Owner/Directors/Trustees of Company:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.owner_name}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Districts where project has its presence:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.district_project_presence}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Type of programs undertaken by organization:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.program_type_by_organization}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Total beneficiaries with the programs:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.total_beneficiaries}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Brand:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.brand?.brand_name}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Farm Group:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.farm_group?.name}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Type of sustainable cotton programs undertaken:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.sustainable_cotton_program_type}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Total number of farmers in organic cotton programs:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.total_no_farmers_in_organic_cotton}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Program wise number of farmers in other sustainable cotton programs:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.program_wise_no_farmers_in_other_sustain_cotton_program}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Total number of current ICS:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.total_number_of_current_ics}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Name of organic certification agencies:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.name_of_organic_certification_agencies}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Cotton variety grown in program areas (staple length):</span>
                        <span className="val">
                            {farmGroupEvaluationData?.cotton_variety_grown_in_program_areas}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">State:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.state}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">District:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.district}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Taluka/ Block:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.block}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Village Name:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.village}
                        </span>
                    </li>
                    <li className="item">
                        <span className="label">Number of farmers met:</span>
                        <span className="val">
                            {farmGroupEvaluationData?.no_of_farmers_met}
                        </span>
                    </li>
                </ul>
            </div>
        )
    }

    const renderSupportingDocuments = () => {
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
        ];

        const supportingDocumentsColumns = [
            {
                name: <p className="text-[13px] font-medium  py-2"></p>,
                cell: (row: any) => (
                    <>
                        <div className='py-3'>
                            <label className="text-gray-500 text-[12px] font-bold">
                                {row.label}
                            </label>
                        </div>
                    </>
                ),
                minWidth: '150px',
                ignoreRowClick: true,
                allowOverflow: true
            },
            {
                name: <p className="text-[13px] font-medium  py-2">Score</p>,
                cell: (row: any) => farmGroupEvaluationData[row.scoreKey] === 0 ? 'Not available' : 'Available',
                ignoreRowClick: true,
                allowOverflow: true
            },
            {
                name: <p className="text-[13px] font-medium  py-2">Remarks</p>,
                cell: (row: any) => (
                    <>
                        {farmGroupEvaluationData[row.remarksKey] ? (
                            <button onClick={() => handleView(farmGroupEvaluationData[row.remarksKey])} className="text-blue-500 hover:text-blue-300 text-left">
                                View Document
                            </button>
                        ) : (
                            <>No document uploaded</>
                        )}
                    </>
                ),
                ignoreRowClick: true,
                allowOverflow: true
            },
            {
                name: <p className="text-[13px] font-medium py-2">Corrective action suggested (mention specific date given to FE to complete any remaining task)</p>,
                cell: (row: any) => farmGroupEvaluationData[row.actionKey],
                minWidth: '200px',
                ignoreRowClick: true,
                allowOverflow: true
            }
        ];

        return (
            <>
                <CommonDataTable columns={supportingDocumentsColumns} data={supportingDocuments} pagination={false} count={supportingDocuments.length} />
            </>
        );
    }

    const renderFarmerConnect = () => {
        const farmerConnect = [
            {
                label: "Farmers are aware of the organization",
                scoreKey: "farmers_are_aware_of_organization_score",
                remarksKey: "farmers_are_aware_of_organization_remarks",
                options: { 0: "Not Available", 1: "Available" }
            },
            {
                label: "Farmers getting support of any kind (trainings, inputs etc.)",
                scoreKey: "farmers_getting_support_of_any_kind_score",
                remarksKey: "farmers_getting_support_of_any_kind_remarks",
                options: { 0: "Not Available", 1: "Available" }
            },
            {
                label: "Frequency of selling your cotton to the organization",
                scoreKey: "frequency_of_selling_your_cotton_to_the_organization_score",
                remarksKey: "frequency_of_selling_your_cotton_to_the_organization_remarks",
                options: { 0: "Never", 1: "Sometimes", 2: "Always" }
            },
            {
                label: "Are the farmers associated with Organic program",
                scoreKey: "farmers_associated_organic_program_score",
                remarksKey: "farmers_associated_organic_program_remarks",
                options: { 0: "Not Available", 1: "Available" }
            },
            {
                label: "Do the field executive support by imparting knowledge or providing suggestions to the farmers",
                scoreKey: "field_executive_support_by_imparing_knowledge_score",
                remarksKey: "field_executive_support_by_imparing_knowledge_remarks",
                options: { 0: "Not Available", 1: "Available" }
            },
            {
                label: "Do the farmers knows the name of the Field Executive of the ICS",
                scoreKey: "farmers_knows_the_name_of_field_executive_score",
                remarksKey: "farmers_knows_the_name_of_field_executive_remarks",
                options: { 0: "Not Available", 1: "Available" }
            },
            {
                label: "Awareness of the farmers in organic practices",
                scoreKey: "awareness_of_the_farmers_organic_practices_score",
                remarksKey: "awareness_of_the_farmers_organic_practices_remarks",
                options: { 0: "None", 1: "Intermediate", 2: "High" }
            },
            {
                label: "Awareness of the farmers regarding organic certification",
                scoreKey: "awareness_of_the_farmers_regarding_organic_certification_score",
                remarksKey: "awareness_of_the_farmers_regarding_organic_certification_remarks",
                options: { 0: "None", 1: "Intermediate", 2: "High" }
            }
        ];

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
                minWidth: '300px',
                ignoreRowClick: true,
                allowOverflow: true
            },
            {
                name: <p className="text-[13px] font-medium  py-2">Score</p>,
                cell: (row: any) => row.options[farmGroupEvaluationData[row.scoreKey]],
                ignoreRowClick: true,
                allowOverflow: true
            },
            {
                name: <p className="text-[13px] font-medium py-2">Remarks</p>,
                cell: (row: any) => farmGroupEvaluationData[row.remarksKey],
                ignoreRowClick: true,
                allowOverflow: true
            }
        ];

        return (
            <>
                <CommonDataTable columns={farmerConnectColumns} data={farmerConnect} pagination={false} count={farmerConnect.length} />
            </>
        );
    }

    useEffect(() => {
        if (id) {
            fetchFarmGroupEvaluationData();
        }
    }, [id]);

    if (loading) {
        return (<div><Loader /></div>);
    }

    if (!roleLoading) {
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
                                <li>Services</li>
                                <li>Organic Program Data Digitization</li>
                                <li>
                                    <Link href="/services/organic-program-data-digitization/farm-group-evaluation-data">
                                        Farm Group Evaluation Data
                                    </Link>
                                </li>
                                <li>Farm Group Evaluation Data Details</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-md p-10 mt-2 mb-2">
                    <div className="search-filter-right text-right">
                        <button
                            className="btn btn-all btn-purple"
                            onClick={() => router.back()}
                        >
                            {translations.common.back}
                        </button>
                    </div>
                    <div className="w-full">
                        <div className="flex flex-col lg:flex-row lg:w-full gap-4 md:w-full sm:w-full ">
                            <div className='w-full lg:w-[50%]'>
                                <Accordian
                                    title={"General Information"}
                                    content={renderGeneralInformation()}
                                    firstSign={<FaAngleDown color="white" />}
                                    secondSign={<FaAngleRight color="white" />}
                                />
                            </div>
                            <div className="flex flex-col w-full lg:w-[50%] gap-4">
                                <Accordian
                                    title={"Supporting documents to be provided"}
                                    content={renderSupportingDocuments()}
                                    firstSign={<FaAngleDown color="white" />}
                                    secondSign={<FaAngleRight color="white" />}
                                />
                                <Accordian
                                    title={"Farmer connect with the Farm Group (observations based on FGD)"}
                                    content={renderFarmerConnect()}
                                    firstSign={<FaAngleDown color="white" />}
                                    secondSign={<FaAngleRight color="white" />}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ViewFarmGroupEvaluationData;