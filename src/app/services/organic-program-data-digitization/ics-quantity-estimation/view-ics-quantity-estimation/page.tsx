"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import API from '@lib/Api';

const ViewIcsQuantityEstimation = () => {
    useTitle("Ics Quantity Estimation Details");

    const router = useRouter();
    const [roleLoading] = useRole();
    const { translations, loading } = useTranslations();
    const [icsQuantityEstimation, setIcsQuantityEstimation] = useState<any>({});

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const fetchIcsQuantityEstimation = async () => {
        try {
            const res = await API.get(`organic-program-data-digitization/ics-quantity-estimation/${id}`);
            if (res.success) {
                setIcsQuantityEstimation(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchIcsQuantityEstimation();
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
                                    <Link href="/services/organic-program-data-digitization/ics-quantity-estimation">
                                        Ics Quantity Estimation
                                    </Link>
                                </li>
                                <li>Ics Quantity Estimation Details</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-md p-10 mt-2 mb-2">
                    <div className="w-full customButtonGroup">
                        <button
                            className="btn-outline-purple"
                            onClick={() => router.back()}
                        >
                            {translations.common.back}
                        </button>
                    </div>
                    <div>
                        <div className="details-list-group mg-t-44">
                            <ul className="detail-list lg:max-w-[50%]">
                                <li className="item">
                                    <span className="label">Season:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.season?.name || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Farmer Group Name:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.farm_group?.name || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">ICS Name:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.ics?.ics_name || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">No of Farmer:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.no_of_farmer || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Total Area:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.total_area || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Est. Cotton Area:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.est_cotton_area || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Estimated Lint (MT):</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.estimated_lint || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Verified volume by CB as per TC (RAW COTTON):</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.verified_row_cotton || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Verified volume by CB as per TC (GINNER):</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.verified_ginner || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Status of current season:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.crop_current_season?.crop_name || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Organic standard:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.organic_standard || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Certification body:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.certification_body || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Scope Issued Date:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.scope_issued_date || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Scope certificate Validity / Lint avaibility in month:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.scope_certification_validity || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Scope Certificate No.:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.scope_certification_no || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Dist:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.district || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">State:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.state || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Remark:</span>
                                    <span className="val">
                                        {icsQuantityEstimation?.remark || ""}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ViewIcsQuantityEstimation;