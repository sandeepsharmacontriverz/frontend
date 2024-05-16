"use client";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import Link from "@components/core/nav-link";
import useTranslations from "@hooks/useTranslation";
import "react-datepicker/dist/react-datepicker.css"
import { useRouter, useSearchParams } from "next/navigation";
import API from "@lib/Api";
import DataTable from "react-data-table-component";
import useRole from "@hooks/useRole";
import { FaEye } from "react-icons/fa"

export default function qrProcurementReport() {
    const [roleLoding] = useRole();

    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const router = useRouter();
    const { translations, loading } = useTranslations();
    const [data, setData] = useState<any>([])
    const [showFilter, setShowFilter] = useState(false);
    const [dataArray, setDataArray] = useState<Array<string>>([]);

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await API.get(`quality-parameter/get-value?id=${id}`);
            if (response.success) {
                setData([response.data]);

            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    if (loading) {
        return <div> Loading...</div>;
    }

    const handleToggleFilter = (rowData: Array<string>) => {
        setDataArray(rowData);
        setShowFilter(!showFilter);
    };

    const handleView = (url: string) => {
        window.open(url, "_blank");
    };

    const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
        const popupRef = useRef<HTMLDivElement>(null);
        const fileName = (item: any) => {
            let file = item.split("file/")
            return file ? file[1] : ""
        }
        const columnsArr: any = [
            {
                name: (<p className="text-[13px] font-medium">{translations?.common?.srNo}</p>),
                width: "70px",
                cell: (row: any, index: any) => index + 1,
            },
            {
                name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.File}</p>),
                cell: (row: any, index: any) => fileName(row),
            },
            {
                name: (<p className="text-[13px] font-medium">Action</p>),
                selector: (row: any) => (
                    <>
                        <div className="flex items-center">
                            <FaEye
                                size={18}
                                className="text-black  hover:text-blue-600 cursor-pointer mr-2"
                                onClick={() => handleView(row)}
                            />
                        </div>

                    </>
                ),
                center: true,
                wrap: true,
            }
        ]

        return (
            <div>
                {openFilter && (
                    <>
                        <div ref={popupRef} className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
                            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                                <div className="flex justify-between align-items-center">
                                    <h3 className="text-lg pb-2">Documents</h3>
                                    <button
                                        className="text-[20px]"
                                        onClick={() => setShowFilter(!showFilter)}
                                    >
                                        &times;
                                    </button>
                                </div>
                                <div className="w-100 mt-0">
                                    <div className="customFormSet">
                                        <div className="w-100">
                                            <div className="row">
                                                <DataTable
                                                    columns={columnsArr}
                                                    data={dataArray}
                                                    persistTableHead
                                                    fixedHeader={true}
                                                    noDataComponent={<p className="py-3 font-bold text-lg">No data available in table</p>}
                                                    fixedHeaderScrollHeight="600px"
                                                />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
        )
    }

    const columns: any = [
        {
            name: (<p className="text-[13px] font-medium">{translations.common.srNo}</p>),
            cell: (row: any, index: any) => index + 1,
            wrap: true
        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.ginLotNumber}</p>),
            selector: (row: any) => row?.lot_no,
            wrap: true
        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.reelLotNumber}</p>),
            selector: (row: any) => row?.reel_lot_no,
            wrap: true
        },

        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.labName}</p>),
            selector: (row: any) => row.lab_name,
            wrap: true
        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.dateReport}</p>),
            cell: (row: any) => row.test_report?.substring(0, 10),
            wrap: true
        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.sci}</p>),
            selector: (row: any) => row.sci,
            wrap: true
        },
        {
            name: (<p className="text-[13px] font-medium">Moisture %</p>),
            selector: (row: any) => row.moisture,
            wrap: true

        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.mic}</p>),
            selector: (row: any) => row.mic,
            wrap: true

        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.mat}</p>),
            selector: (row: any) => row.mat,
            wrap: true

        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.uhml}</p>),
            selector: (row: any) => row.uhml,
            wrap: true

        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.ui}</p>),
            selector: (row: any) => row.ui,
            wrap: true

        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.sf}</p>),
            selector: (row: any) => row.sf,
            wrap: true

        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.str}</p>),
            selector: (row: any) => row.str,
            wrap: true

        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.elg}</p>),
            selector: (row: any) => row.elg,
            wrap: true

        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.rd}</p>),
            selector: (row: any) => row.rd,
            wrap: true
        },
        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.b}</p>),
            selector: (row: any) => row.plusb,
            wrap: true
        },

        {
            name: (<p className="text-[13px] font-medium">{translations.qualityParameter.document}</p>),
            cell: (row: any) => (
                row.document &&
                <>
                    <FaEye
                        size={18}
                        className="text-black hover:text-blue-600 cursor-pointer"
                        onClick={() => handleToggleFilter(row?.document)}
                    />
                </>
            ),

            wrap: true
        }
    ];

    if (!roleLoding) {
        return (
            <>
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
                                    <li><Link href="/quality-parameter">{translations?.common?.CottonQualityParameter}</Link></li>
                                    <li>{translations?.common?.DetailReport}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-md p-4 ">
                        <div className="w-100 d-flex justify-between customButtonGroup">
                            <div>
                                {data && data.map((item: any, index: number) => (
                                    item.process ? (
                                        <p key={`process-${item.process.id}`} className="key">
                                            <span className="font-bold">{translations?.transactions?.date}:</span>
                                            <span className="ml-2">{item.process.date?.substring(0, 10)}</span>
                                        </p>
                                    ) : item.sales ? (
                                        <p key={`sales-${item.sales.id}`}>
                                            <span className="font-bold">Date:</span>
                                            <span className="ml-2">{item.sales.date?.substring(0, 10)}</span>
                                        </p>
                                    ) : null
                                ))}
                            </div>


                            <button
                                className="btn-outline-purple mr-2 mb-5"
                                onClick={() => router.back()}
                            >
                                {translations?.common?.back}
                            </button>
                        </div>

                        <DocumentPopup openFilter={showFilter} dataArray={dataArray} onClose={() => setShowFilter(false)} />

                        <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                            <DataTable
                                columns={columns}
                                data={data}
                                noDataComponent={<p className="py-3 font-bold text-lg">No data available in table</p>}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
