"use client";
import { useState, useEffect } from "react";
import React from "react";
import { useRouter } from "@lib/router-events";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import moment from "moment";
import { BiFilterAlt } from "react-icons/bi";
import { FaDownload, FaEye } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";

const tracebaleTraining: any = () => {
    useTitle("Paddy Quality Parameter");
    const [roleLoading,hasAccesss] = useRole();
    const router = useRouter();
    const spinnerId = User.MillId;
  const [Access, setAccess] = useState<any>({});

    const [isClient, setIsClient] = useState(false);
    const [data, setData] = useState([])
    const [count, setCount] = useState<any>()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [isClear, setIsClear] = useState(false);

    const [showFilter, setShowFilter] = useState(false);


    const [from, setFrom] = useState<any>('');


    useEffect(() => {
        if (!roleLoading && hasAccesss?.processor?.includes("Mill")) {
          const access = checkAccess("Paddy Quality Parameters");
          if (access) setAccess(access);
        }
      }, [roleLoading,hasAccesss]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const code = encodeURIComponent(searchQuery);

    const getQualityParameter = async () => {
        const url = `quality-parameter?spinnerId=${spinnerId}&limit=${limit}&page=${page}&search=${code}&date=${from}&pagination=true`
        try {
            const response = await API.get(url)
            setData(response.data)
            setCount(response.count)
        }
        catch (error) {
            console.log(error, "error")
            setCount(0)
        }
    };

    const searchData = (e: any) => {
        setSearchQuery(e.target.value)

    }

    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page)
        setLimit(limitData)
    }

    const fetchExportAll = async () => {
        try {
            const res = await API.get(`quality-parameter/export?spinnerId=${spinnerId}&search=${code}&date=${from}`);
            if (res.success) {
                handleDownload(res.data, "Quality Parameter", ".xlsx");
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSingleDownload = async (id: number) => {
        try {

            const res = await API.get(`quality-parameter/export-single?qualityId=${id}`);
            if (res.success) {
                handleDownload(res.data, "Cotton_connect Quality Parameter", ".xlsx");
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (spinnerId) {
            getQualityParameter()
        }
    }, [searchQuery, page, limit, isClear, spinnerId]);


    const handleFrom = (date: any) => {
        const formatted = new Date(date)
        setFrom(formatted);
    };

    const clearFilter = () => {
        setFrom('')
        setIsClear(!isClear)
    }

    const FilterPopup = ({ openFilter, onClose }: any) => {
        const popupRef = React.useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: any) => {
                if (popupRef.current && !(popupRef.current as any).contains(event.target)) {
                    setShowFilter(false)
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [popupRef, onClose]);

        return (
            <div>
                {openFilter && (
                    <div ref={popupRef} className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
                        <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                            <div className="flex justify-between align-items-center">
                                <h3 className="text-lg pb-2">Filters</h3>
                                <button className="text-[20px]" onClick={() => setShowFilter(!showFilter)}>&times;</button>
                            </div>
                            <div className="w-100 mt-0">
                                <div className="customFormSet">
                                    <div className="w-100">
                                        <div className="row">
                                            <div className="col-md-12 col-sm-12 mt-2">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Date of Report
                                                </label>
                                                <DatePicker
                                                    selected={from}
                                                    dateFormat={'dd-MM-yyyy'}
                                                    onChange={handleFrom}
                                                    showYearDropdown
                                                    placeholderText={translations.transactions.date + "*"}
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                                            <section>
                                                <button
                                                    className="btn-purple mr-2"
                                                    onClick={() => {
                                                        getQualityParameter()
                                                        setShowFilter(false);
                                                    }}
                                                >
                                                    APPLY ALL FILTERS
                                                </button>
                                                <button className="btn-outline-purple"
                                                    onClick={clearFilter}
                                                >CLEAR ALL FILTERS</button>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }



    const dateFormatter = (date: any) => {
        const formatted = new Date(date)?.toJSON()?.slice(0, 10).split('-').reverse().join('/')
        return formatted
    }


    const { translations, loading } = useTranslations();
    if (loading) {
        return <div>  <Loader /></div>;
    }

    const columns = [
        {
            name: <p className="text-[13px] font-medium">S No.</p>,
            width: '70px',
            cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
            wrap: true
        },
        {
            name: <p className="text-[13px] font-medium">Date of Process</p>,
            cell: (row: any) => dateFormatter(row.sales?.date),
            wrap: true

        },
        {
            name: <p className="text-[13px] font-medium">Date of Report</p>,
            cell: (row: any) => dateFormatter(row.test_report),
            wrap: true
        },
        {
            name: <p className="text-[13px] font-medium">Bale Lot Number</p>,
            cell: (row: any) => row.lot_no,
            wrap: true

        }, {
            name: <p className="text-[13px] font-medium">Reel Lot Number</p>,
            cell: (row: any) => row.reel_lot_no,
            wrap: true

        },
        {
            name: <p className="text-[13px] font-medium">Sold to</p>,
            cell: (row: any) => row.sold?.name,
            wrap: true

        },
        {
            name: <p className="text-[13px] font-medium">{translations.common.action}</p>,
            width: '200px',
            cell: (row: any) => (
                <>
                    <button className="text-white py-2 px-2 mr-3 rounded-md bg-green-600  hover:text-white" onClick={() => router.push(`/mill/quality-parameter/detail-report-spinner?id=${row.id}`)}>
                        <FaEye size={18} color="white" />
                    </button>

                    <button className="bg-yellow-500 p-2 rounded" onClick={() => handleSingleDownload(row.id)}>
                        <FaDownload size={18} color="white" />
                    </button>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
        },
    ];

    if (!roleLoading && !Access.view) {
        return (
          <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
            <h3>You doesn't have Access of this Page.</h3>
          </div>
        );
      }
    
      if (!roleLoading && Access.view) {
        return (
            <div >
                {isClient ? (
                    <>
                        <section className="right-content">
                            <div className="right-content-inner">
                                {/* breadcrumb */}
                                <div className="breadcrumb-box">
                                    <div className="breadcrumb-inner light-bg">
                                        <div className="breadcrumb-left">
                                            <ul className="breadcrum-list-wrap">
                                                <li className="active">
                                                    <Link href="/mill/dashboard">
                                                        <span className="icon-home"></span>
                                                    </Link>
                                                </li>
                                                <li>Paddy Quality Parameter</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* farmgroup start */}
                                <div className="farm-group-box">
                                    <div className="farm-group-inner">
                                        <div className="table-form">
                                            <div className="table-minwidth w-100">
                                                {/* search */}
                                                <div className="search-filter-row">
                                                    <div className="search-filter-left ">
                                                        <div className="search-bars">
                                                            <form className="form-group mb-0 search-bar-inner">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-new jsSearchBar "
                                                                    placeholder="Search"
                                                                    value={searchQuery}
                                                                    onChange={searchData}
                                                                />
                                                                <button type="submit" className="search-btn">
                                                                    <span className="icon-search"></span>
                                                                </button>
                                                            </form>
                                                        </div>
                                                        <div className="fliterBtn">
                                                            <button className="flex" type="button" onClick={() => setShowFilter(!showFilter)} >
                                                                FILTERS <BiFilterAlt className="m-1" />
                                                            </button>

                                                            <div className="relative">
                                                                <FilterPopup
                                                                    openFilter={showFilter}
                                                                    onClose={!showFilter}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="search-filter-right">
                                                        <button
                                                            className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                                                            onClick={fetchExportAll}

                                                        >
                                                            Export All
                                                        </button>

                                                    </div>
                                                </div>
                                                <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="w-full min-h-screen flex justify-center items-center">
                        <span>Processing...</span>
                    </div>
                )}
            </div>
        )
    }
};

export default tracebaleTraining;

