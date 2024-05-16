"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import CommonDataTable from '@components/core/Table';
import API from '@lib/Api';
import { useRouter } from '@lib/router-events';

const PhysicalTraceabilityWeaverViewSamples = () => {
    useTitle("View Samples");

    const [roleLoading] = useRole();
    const router = useRouter();
    const { translations, loading } = useTranslations();

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [data, setData] = useState<Array<any>>([]);
    const [count, setCount] = useState<number>();
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const searchData = (e: any) => {
        setSearchQuery(e.target.value);
    };

    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page);
        setLimit(limitData);
    };

    const fetchPhysicalTraceabilityWeaverSamples = async () => {
        try {
            const res = await API.get(`physical-traceability/weaver-samples?physicalTraceabilityWeaverId=${id}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
            if (res.success) {
                setData(res.data);
                setCount(res.count);
            }
        } catch (error) {
            console.log(error);
            setCount(0);
        }
    };

    useEffect(() => {
        if (id) {
            fetchPhysicalTraceabilityWeaverSamples();
        }
    }, [searchQuery, page, limit, id]);

    if (loading || roleLoading) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    const columns = [
        {
            name: translations?.common?.srNo,
            cell: (row: any, index: any) => (page - 1) * limit + index + 1,
            width: '70px',
            wrap: true
        },
        {
            name: (<p className="text-[13px] font-medium">Weight</p>),
            selector: (row: any) => row.weight,
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Roll</p>),
            selector: (row: any) => row.roll,
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Original Sample Status</p>),
            selector: (row: any) => row.original_sample_status,
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Code</p>),
            selector: (row: any) => row.code,
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Sample Result</p>),
            selector: (row: any) => row.sample_result === 2 ? 'Positive' : row.sample_result === 1 ? 'Negative' : 'NA',
            wrap: true,
        }
    ].filter(Boolean);

    if (!roleLoading) {
        return (
            <div>
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
                                        <Link href="/physical-partner/weaver" className="active">
                                            Weaver
                                        </Link>
                                    </li>
                                    <li>View Samples</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="farm-group-box">
                        <div className="farm-group-inner">
                            <div >
                                <div className="table-minwidth w-100">
                                    <div className="search-filter-row">
                                        <div className="search-filter-left ">
                                            <div className="search-bars">
                                                <form className="form-group mb-0 search-bar-inner">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-new jsSearchBar "
                                                        placeholder={translations?.common?.search}
                                                        value={searchQuery}
                                                        onChange={searchData}
                                                    />
                                                    <button type="submit" className="search-btn">
                                                        <span className="icon-search"></span>
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <div className="search-filter-right customButtonGroup">
                                                <button
                                                    className="btn-outline-purple"
                                                    onClick={() => router.back()}
                                                >
                                                    {translations.common.back}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <CommonDataTable
                                        columns={columns}
                                        count={count}
                                        data={data}
                                        updateData={updatePage}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default PhysicalTraceabilityWeaverViewSamples;