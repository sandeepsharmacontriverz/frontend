"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import moment from 'moment';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import API from '@lib/Api';

const ViewSeedTestingLinkage = () => {
    useTitle("Seed Testing Linkage Details");

    const [roleLoading] = useRole();
    const router = useRouter();
    const { translations, loading } = useTranslations();
    const [seedTestingLinkage, setSeedTestingLinkage] = useState<any>({});

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const dateFormatter = (date: any) => {
        const formatted = moment(date).format("DD-MM-YYYY");
        return formatted;
    };

    const fetchSeedTestingLinkages = async () => {
        try {
            const res = await API.get(`organic-program-data-digitization/seed-testing-linkage/${id}`);
            if (res.success) {
                setSeedTestingLinkage(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchSeedTestingLinkages();
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
                                    <Link href="/services/organic-program-data-digitization/seed-testing-linkage">
                                        Seed Testing Linkage
                                    </Link>
                                </li>
                                <li>Seed Testing Linkage Details</li>
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
                                        {seedTestingLinkage?.season?.name || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Seed Company Name:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.seed_company?.name || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Lot No:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.lotno || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Variety:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.variety || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Available packets (450 gm):</span>
                                    <span className="val">
                                        {seedTestingLinkage?.packets || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Location Dist.:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.district || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">State:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.state || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Testing Code:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.testing_code || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Seal No:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.seal_no || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Date of Sending Sample to LAB:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.date_sending_sample ? dateFormatter(seedTestingLinkage.date_sending_sample) : ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Date Of The Report:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.date_of_report ? dateFormatter(seedTestingLinkage.date_of_report) : ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Test Report No:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.report_no || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">NOS:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.nos || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">35 S:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.thirtyfives || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Result of External Lab (GMO):</span>
                                    <span className="val">
                                        {seedTestingLinkage?.result_of_lab || ""}
                                    </span>
                                </li>
                                <li className="item">
                                    <span className="label">Name of Lab:</span>
                                    <span className="val">
                                        {seedTestingLinkage?.lab_master?.name || ""}
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

export default ViewSeedTestingLinkage;