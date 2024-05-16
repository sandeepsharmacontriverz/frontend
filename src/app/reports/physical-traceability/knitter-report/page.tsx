"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import CommonDataTable from '@components/core/Table';
import { handleDownload } from '@components/core/Download';
import API from '@lib/Api';
import { FaDownload } from "react-icons/fa";

const PhysicalTraceabilityKnitterReport = () => {
    useTitle("Physical Tracebility Details - Knitter");

    const [roleLoading] = useRole();
    const { translations, loading } = useTranslations();

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

    const dateFormatter = (date: any) => {
        const formatted = moment(date).format("DD-MM-YYYY");
        return formatted;
    };

    const handleView = (url: string) => {
        window.open(url, "_blank");
    };

    const fetchPhysicalTraceabilityKnitterReport = async () => {
        try {
            const res = await API.get(`physical-traceability/knitter?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
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
        fetchPhysicalTraceabilityKnitterReport();
    }, [searchQuery, page, limit]);

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
            name: (<p className="text-[13px] font-medium">Knitter Name</p>),
            selector: (row: any) => row?.knitter?.name || "",
            wrap: true,
        },
        // {
        //     name: (<p className="text-[13px] font-medium">Finished Batch/Lot No</p>),
        //     selector: (row: any) => row?.knit_process?.batch_lot_no || "",
        //     wrap: true,
        // },
        {
            name: (<p className="text-[13px] font-medium">Date of sample collection</p>),
            cell: (row: any) => dateFormatter(row.date_sample_collection),
            wrap: true,
            width: '120px',
        },
        {
            name: (<p className="text-[13px] font-medium">Opeator sample code and dispatch details</p>),
            selector: (row: any) => row.data_of_sample_dispatch,
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Operator name</p>),
            selector: (row: any) => row.operator_name,
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Expected date of fabric sale</p>),
            cell: (row: any) => dateFormatter(row.expected_date_of_fabric_sale),
            wrap: true,
            width: '120px',
        },
        {
            name: (<p className="text-[13px] font-medium">Samples</p>),
            cell: (row: any) => (
                <Link
                    href={`/reports/physical-traceability/knitter-report/view-samples?id=${row.id}`}
                    className="hover:text-blue-600 text-blue-500"
                >
                    View Samples
                </Link>
            ),
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Upload</p>,
            cell: (row: any) => (
                <div className='py-2'>
                    {row.upload_report ? (
                        <div className='flex flex-col gap-2'>
                            {row.upload_report.map((report: any, i: number) => {
                                const urlComponent = report.split('/');
                                const filename = urlComponent[urlComponent.length - 1];
                                const filetype = filename.split('.').pop();

                                return report.includes('.pdf') ? (
                                    <div key={i} className='flex gap-2'>
                                        <button
                                            className="hover:text-blue-600 text-blue-500 text-sm"
                                            onClick={() => handleView(report)}
                                        >
                                            View pdf
                                        </button>
                                        <button
                                            onClick={() => handleDownload(report, filename, filetype)}
                                        >
                                            <FaDownload size={18} color="black" />
                                        </button>
                                    </div>
                                ) : (
                                    <div key={i} className='flex gap-2'>
                                        <img
                                            className=" w-20 h-16 rounded"
                                            src={report}
                                        />
                                        <button
                                            onClick={() => handleDownload(report, filename, filetype)}
                                        >
                                            <FaDownload size={18} color="black" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            ),
            minWidth: '150px'
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
                                    <li className="active">
                                        <Link href="/dashboard">
                                            <span className="icon-home"></span>
                                        </Link>
                                    </li>
                                    <li>Reports</li>
                                    <li>Rice Testing Reports</li>
                                    <li>Knitter Report</li>
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

export default PhysicalTraceabilityKnitterReport;