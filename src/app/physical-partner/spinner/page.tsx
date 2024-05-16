"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import CommonDataTable from '@components/core/Table';
import API from '@lib/Api';
import User from '@lib/User';
import { BiFilterAlt } from "react-icons/bi";

const PhysicalTraceabilitySpinner = () => {
    useTitle("Spinner Details");

    const physicalPartnerId = User.physicalPartnerId;

    const [roleLoading] = useRole();
    const { translations, loading } = useTranslations();

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [data, setData] = useState<Array<any>>([]);
    const [count, setCount] = useState<number>();
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const [spinners, setSpinners] = useState<Array<any>>([]);
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [appliedFilters, setAppliedFilters] = useState<any>({
        spinner_id: ""
    });

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

    const fetchSpinners = async () => {
        try {
            const res = await API.get("spinner");
            if (res.success) {
                setSpinners(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchPhysicalTraceabilitySpinner = async () => {
        try {
            const res = await API.get(`physical-traceability/spinner?physicalPartnerId=${physicalPartnerId}&spinnerId=${appliedFilters.spinner_id}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
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
        const isAdminData: any = sessionStorage.getItem("User") && localStorage.getItem("orgToken");
        if (isAdminData?.length > 0) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (physicalPartnerId) {
            fetchPhysicalTraceabilitySpinner();
        }
    }, [searchQuery, page, limit, physicalPartnerId]);

    useEffect(() => {
        if (showFilter) {
            fetchSpinners();
        }
    }, [showFilter]);

    const handleFilterChange = (name: string, value: any) => {
        setAppliedFilters((prev: any) => ({ ...prev, [name]: value }));
    };

    const clearFilter = () => {
        setAppliedFilters({
            spinner_id: ""
        });
    };

    const FilterPopup = ({ openFilter }: any) => {
        const popupRef = useRef<HTMLDivElement>(null);

        return (
            <div>
                {openFilter && (
                    <>
                        <div
                            ref={popupRef}
                            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3  "
                        >
                            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                                <div className="flex justify-between align-items-center">
                                    <h3 className="text-lg pb-2">Filters</h3>
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
                                                <div className="col-12 col-md-6 col-lg-6 mt-2">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        Select Spinner
                                                    </label>
                                                    <select
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        name="spinner_id"
                                                        value={appliedFilters.spinner_id || ""}
                                                        onChange={(e) => handleFilterChange(e.target.name, e.target.value)}
                                                    >
                                                        <option value="">Select Spinner</option>
                                                        {spinners?.map((spinner: any) => (
                                                            <option key={spinner.id} value={spinner.id}>
                                                                {spinner.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                                                <section>
                                                    <button
                                                        className="btn-purple mr-2"
                                                        onClick={() => {
                                                            fetchPhysicalTraceabilitySpinner();
                                                            setShowFilter(false);
                                                        }}
                                                    >
                                                        APPLY ALL FILTERS
                                                    </button>
                                                    <button
                                                        className="btn-outline-purple"
                                                        onClick={clearFilter}
                                                    >
                                                        CLEAR ALL FILTERS
                                                    </button>
                                                </section>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

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
            name: (<p className="text-[13px] font-medium">Spinner Name</p>),
            selector: (row: any) => row?.spinner?.name || "",
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Yarn REEL Lot No</p>),
            selector: (row: any) => row?.spin_process?.reel_lot_no || "",
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Date of sample collection</p>),
            cell: (row: any) => dateFormatter(row.date_sample_collection),
            wrap: true,
            width: '120px',
        },
        {
            name: (<p className="text-[13px] font-medium">Data of sample dispatch</p>),
            selector: (row: any) => row.data_of_sample_dispatch,
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Operator name</p>),
            selector: (row: any) => row.operator_name,
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Expected date of yarn sale</p>),
            cell: (row: any) => dateFormatter(row.expected_date_of_yarn_sale),
            wrap: true,
            width: '120px',
        },
        {
            name: (<p className="text-[13px] font-medium">Samples</p>),
            cell: (row: any) => (
                <Link
                    href={`/physical-partner/spinner/view-samples?id=${row.id}`}
                    className="hover:text-blue-600 text-blue-500"
                >
                    View Samples
                </Link>
            ),
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Submit Result</p>,
            cell: (row: any) => (
                row.upload_report ? (
                    <Link
                        href={`/physical-partner/spinner/view-result?id=${row.id}`}
                        className="hover:text-blue-600 text-blue-500"
                    >
                        View Result
                    </Link>
                ) : (
                    <Link
                        href={`/physical-partner/spinner/add-result?id=${row.id}`}
                        className="hover:text-blue-600 text-blue-500"
                    >
                        Add Result
                    </Link>
                )
            )
        },
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
                                    <li>Spinner</li>
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
                                            <div className="fliterBtn">
                                                <button
                                                    className="flex"
                                                    type="button"
                                                    onClick={() => setShowFilter(!showFilter)}
                                                >
                                                    FILTERS <BiFilterAlt className="m-1" />
                                                </button>

                                                <div className="relative">
                                                    <FilterPopup openFilter={showFilter} />
                                                </div>
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

export default PhysicalTraceabilitySpinner;