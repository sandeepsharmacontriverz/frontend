"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import CommonDataTable from '@components/core/Table';
import API from '@lib/Api';
import { useRouter } from '@lib/router-events';

const ViewCmsResult = () => {
    useTitle("View Result");

    const router = useRouter();
    const [roleLoading] = useRole();
    const { translations, loading } = useTranslations();

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [labCms, setLabCms] = useState<any>({});

    const fetchLabCms = async () => {
        try {
            const res = await API.get(`third-party-sample/get-cms-sample?id=${id}`);
            if (res.success) {
                setLabCms(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleView = (url: string) => {
        window.open(url, "_blank");
    };

    useEffect(() => {
        if (id) {
            fetchLabCms();
        }
    }, [id]);

    if (loading) {
        return (<div><Loader /></div>);
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
            cell: (row: any, index: number) => row.status,
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
                                    <Link href="/lab/dashboard" className="active">
                                        <span className="icon-home"></span>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/lab/cms" className="active">
                                        Container Management System
                                    </Link>
                                </li>
                                <li>View Result</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-md p-10 mt-2 mb-2">
                    <div className="customButtonGroup text-right">
                        <button
                            className="btn-outline-purple"
                            onClick={() => router.push('/lab/cms')}
                        >
                            {translations.common.back}
                        </button>
                    </div>
                    <div className='mt-4'>
                        <CommonDataTable columns={columns} data={[labCms]} pagination={false} count={[labCms]?.length} />
                    </div>

                    <div className='row mt-5'>
                        <h2 className="text-l font-semibold">Uploaded Report:</h2>
                        <div className='mt-2 flex gap-2'>
                            {labCms?.sample_reports?.map((report: any, i: number) => {
                                return report.includes('.pdf') ? (
                                    <div key={i}>
                                        <button
                                            className="btn-purple"
                                            onClick={() => handleView(report)}
                                        >
                                            View pdf
                                        </button>
                                    </div>
                                ) : (
                                    <div key={i} className='flex gap-2'>
                                        <img
                                            className=" w-40 h-40 rounded"
                                            src={report}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ViewCmsResult;