"use client";

import React, { useEffect, useState } from 'react';
import Link from '@components/core/nav-link';
import API from '@lib/Api';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import CommonDataTable from '@components/core/Table';
import { exportToExcel } from '@components/core/ExcelExporter';
import { toasterError } from '@components/core/Toaster';
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";

const DyeignOldsales = () => {
    useTitle("Dyeing Oldsales");
    const [roleLoading] = useRole();
    const { translations, loading } = useTranslations();

    const [isClient, setIsClient] = useState<boolean>(true);
    const [data, setData] = useState<Array<object>>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const searchData = (e: any) => {
        setSearchQuery(e.target.value);
    };

    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page);
        setLimit(limitData);
    };

    const fetchDyeingOldSales = async () => {
        try {
            const res = await API.get(`oldsales/dyeing-oldsales?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
            if (res.success) {
                setData(res.data);
                setCount(res.count);
            }
        } catch (error) {
            console.log(error);
            setCount(0);
        }
    };

    const getDataToExport = (data: Array<any>, pagination = false) => {
        const dataToExport = data.map((element: any, index: number) => {
            return {
                srNo: pagination ? (page - 1) * limit + index + 1 : index + 1,
                "Date": element.date,
                "Fabric processor Type": element.buyer_type,
                "Sold to": "",
                "Invoice No": element.invoice_no,
                "Batch/lot No": element.batch_lot_no,
                "Dyed Fabric Quantity": element.total_fabric_quantity,
                "Length in Mts": element.fabric_length,
                "GSM": element.gsm,
                "Fabric Net Weight(Kgs)": element.fabric_net_weight,
                "Program": element.program_data?.program_name || "",
                "Status": element.status ? "TRUE" : "FALSE"
            };
        });

        return dataToExport;
    }

    const handleExport = () => {
        if (data.length > 0) {
            const dataToExport = getDataToExport(data, true);
            exportToExcel(dataToExport, `Old dyeing sales data - page${page}`);
        } else {
            toasterError("Nothing to export!");
        }
    };

    const handleExportAll = async () => {
        try {
            const res = await API.get(`oldsales/dyeing-oldsales?search=${searchQuery}&pagination=false`);
            if (res.success) {
                if (res.data.length > 0) {
                    const dataToExport = getDataToExport(res.data);
                    exportToExcel(dataToExport, "Old dyeing sales data");
                } else {
                    toasterError("Nothing to export!");
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchDyeingOldSales();
        setIsClient(true);
    }, [searchQuery, page, limit]);

    if (loading) {
        return <div> Loading translations...</div>;
    }

    const columns = [
        {
            name: translations.common.srNo,
            cell: (row: any, index: any) => (page - 1) * limit + index + 1,
            sortable: false,
        },
        {
            name: "Date",
            selector: (row: any) => row.date,
            sortable: false,
        },
        {
            name: "Fabric processor Type",
            selector: (row: any) => row.buyer_type,
            sortable: false,
        },
        {
            name: "Sold to",
            selector: (row: any) => "",
            sortable: false,
        },
        {
            name: "Invoice No",
            selector: (row: any) => row.invoice_no,
            sortable: false,
        },
        {
            name: "Batch/lot No",
            selector: (row: any) => row.batch_lot_no,
            sortable: false,
        },
        {
            name: "Dyed Fabric Quantity",
            selector: (row: any) => row.total_fabric_quantity,
            sortable: false,
        },
        {
            name: "Length in Mts",
            selector: (row: any) => row.fabric_length,
            sortable: false,
        },
        {
            name: "GSM",
            selector: (row: any) => row.gsm,
            sortable: false,
        },
        {
            name: "Fabric Net Weight(Kgs)",
            selector: (row: any) => row.fabric_net_weight,
            sortable: false,
        },
        {
            name: "Program",
            selector: (row: any) => row.program_data?.program_name || "",
            sortable: false,
        },
        {
            name: translations.common.status,
            cell: (row: any) => (
                <div className={row.status ? "text-green-500" : "text-red-500"}>
                    {row.status ? (
                        <BsCheckLg size={20} className="mr-4" />
                    ) : (
                        <RxCross1 size={20} className="mr-4" />
                    )}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
        },
    ];

    if (!roleLoading) {
        return (
            <div>
                {isClient ? (
                    <div>
                        {/* breadcrumb */}
                        <div className="breadcrumb-box">
                            <div className="breadcrumb-inner light-bg">
                                <div className="breadcrumb-left">
                                    <ul className="breadcrum-list-wrap">
                                        <li>
                                            <Link href="/dashboard" className="active">
                                                <span className="icon-home"></span>
                                            </Link>
                                        </li>
                                        <li>Oldsales</li>
                                        <li>Fabric</li>
                                        <li>Dyeing</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* farmgroup start */}
                        <div className="farm-group-box">
                            <div className="farm-group-inner">
                                <div className="table-form lr-mCustomScrollbar">
                                    <div className="table-minwidth min-w-[650px]">
                                        {/* search */}
                                        {/* <div className="search-filter-row">
                                            <div className="search-filter-left ">
                                                <div className="search-bars">
                                                    <form className="form-group mb-0 search-bar-inner">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-new jsSearchBar "
                                                            placeholder={translations.common.search}
                                                            value={searchQuery}
                                                            onChange={searchData}
                                                        />
                                                        <button type="submit" className="search-btn">
                                                            <span className="icon-search"></span>
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div> */}

                                        <div className="flex mt-2 gap-2 justify-end borderFix pt-2 pb-2">
                                            <div className="search-filter-right">
                                                <button
                                                    onClick={handleExport}
                                                    className="h-100 py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                                                >
                                                    {translations.common.export}
                                                </button>
                                            </div>
                                            <div className="search-filter-right">
                                                <button
                                                    onClick={handleExportAll}
                                                    className="h-100 py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                                                >
                                                    {translations.common.exportAll}
                                                </button>
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
                ) : (
                    "Loading..."
                )}
            </div>
        );
    }
}

export default DyeignOldsales;