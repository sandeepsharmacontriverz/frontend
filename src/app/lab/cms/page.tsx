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
import Multiselect from 'multiselect-react-dropdown';

const LabCMS = () => {
    useTitle("Container Management System Details");

    const labId = User.LabId;

    const [roleLoading] = useRole();
    const { translations, loading } = useTranslations();

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [data, setData] = useState<Array<any>>([]);
    const [count, setCount] = useState<number>();
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const [cms, setCMS] = useState<Array<any>>([]);
    const [thirdParty, setThirdParty] = useState<Array<any>>([]);
    const [program, setProgram] = useState<Array<any>>([]);

    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [appliedFilters, setAppliedFilters] = useState<any>({
        cms_id: [],
        third_party: [],
        program_id: []
    });
    const [isClear, setIsClear] = useState(false);

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

    const fetchCMS = async () => {
        const url = `lab/get-lab?id=${labId}`;
        try {
            const response = await API.get(url);
            if (response?.data?.brand?.length > 0) {
                getCMS(response?.data?.brand);
                getThirdParty(response?.data?.brand);
                getProgram(response?.data?.brand)
            }
        } catch (error) {
            console.log(error, "error");
        }
    };

    const getCMS = async (id: any) => {
        try {
            const res = await API.get(`container-management-system?brandId=${id}`);
            if (res.success) {
                setCMS(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getProgram = async (id: any) => {
        try {
            const res = await API.get(`brand/program/get?brandId=${id}`);
            if (res.success) {
                setProgram(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };


    const getThirdParty = async (id: any) => {
        const url = `third-party-inspection?brandId=${id}`;
        try {
            const response = await API.get(url);
            if (response.success) {
                const res = response.data;
                setThirdParty(res);
            }
        } catch (error) {
            console.log(error, "error");
        }
    };


    const fetchLabCMS = async () => {
        try {
            const res = await API.get(`lab-report/fetch-cms-samples?labId=${labId}&cmsId=${appliedFilters.cms_id}&thirdPartyId=${appliedFilters.third_party}&programId=${appliedFilters.program_id}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
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
        if (labId) {
            fetchLabCMS();
        }
    }, [searchQuery, page, limit, labId, isClear]);

    useEffect(() => {
        if (showFilter) {
            fetchCMS();
        }
    }, [showFilter]);

    // const handleFilterChange = (name: string, value: any) => {
    //     setAppliedFilters((prev: any) => ({ ...prev, [name]: value }));
    // };


    const handleFilterChange = (
        selectedList: any,
        selectedItem: any,
        name: string,
        remove: boolean = false
    ) => {
        let itemId = selectedItem?.id;
        if (name === "cms") {
            if (appliedFilters?.cms_id?.includes(itemId)) {
                setAppliedFilters((prev: any) => ({ ...prev, cms_id: appliedFilters?.cms_id?.filter((item: any) => item != itemId) }));
            } else {
                setAppliedFilters((prev: any) => ({ ...prev, cms_id: [...appliedFilters?.cms_id, itemId] }));
            }
        } else if (name === "thirdParty") {
            if (appliedFilters?.third_party?.includes(itemId)) {
                setAppliedFilters((prev: any) => ({ ...prev, third_party: appliedFilters?.third_party?.filter((item: any) => item != itemId) }));
            } else {
                setAppliedFilters((prev: any) => ({ ...prev, third_party: [...appliedFilters?.third_party, itemId] }));
            }
        }
        else if (name === "program") {
            if (appliedFilters?.program_id?.includes(itemId)) {
                setAppliedFilters((prev: any) => ({ ...prev, program_id: appliedFilters?.program_id?.filter((item: any) => item != itemId) }));
            } else {
                setAppliedFilters((prev: any) => ({ ...prev, program_id: [...appliedFilters?.program_id, itemId] }));
            }
        }
    };

    const clearFilterList = () => {
        setAppliedFilters((prev: any) => ({ ...prev, 
            cms_id: [],
            third_party: [],
            program_id: []
        }));

        setIsClear(!isClear);
    };

    const FilterPopupList = ({ openFilter, onClose }: any) => {
        const popupRef = useRef<HTMLDivElement>(null);
        return (
            <div>
                {openFilter && (
                    <div
                        ref={popupRef}
                        className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
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

                                            <div className="col-md-6 col-sm-12 mt-2">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Select Container Management Name
                                                </label>
                                                <Multiselect
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    // id="programs"
                                                    displayValue="name"
                                                    selectedValues={cms?.filter((item: any) =>
                                                        appliedFilters?.cms_id?.includes(item.id)
                                                    )}
                                                    onKeyPressFn={function noRefCheck() { }}
                                                    onRemove={(selectedList: any, selectedItem: any) => {
                                                        handleFilterChange(
                                                            selectedList,
                                                            selectedItem,
                                                            "cms",
                                                            true
                                                        );
                                                    }}
                                                    onSearch={function noRefCheck() { }}
                                                    onSelect={(selectedList: any, selectedItem: any) =>
                                                        handleFilterChange(
                                                            selectedList,
                                                            selectedItem,
                                                            "cms",
                                                            true
                                                        )
                                                    }
                                                    options={cms}
                                                    showCheckbox
                                                />
                                            </div>


                                            <div className="col-md-6 col-sm-12 mt-2">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Select Third Party
                                                </label>
                                                <Multiselect
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    // id="programs"
                                                    displayValue="name"
                                                    selectedValues={thirdParty?.filter((item: any) =>
                                                        appliedFilters?.third_party?.includes(item.id)
                                                    )}
                                                    onKeyPressFn={function noRefCheck() { }}
                                                    onRemove={(selectedList: any, selectedItem: any) => {
                                                        handleFilterChange(
                                                            selectedList,
                                                            selectedItem,
                                                            "thirdParty",
                                                            true
                                                        );
                                                    }}
                                                    onSearch={function noRefCheck() { }}
                                                    onSelect={(selectedList: any, selectedItem: any) =>
                                                        handleFilterChange(
                                                            selectedList,
                                                            selectedItem,
                                                            "thirdParty"
                                                        )
                                                    }
                                                    options={thirdParty}
                                                    showCheckbox
                                                />
                                            </div>
                                            <div className="col-md-6 col-sm-12 mt-2">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Select Program
                                                </label>
                                                <Multiselect
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    // id="programs"
                                                    displayValue="program_name"
                                                    selectedValues={program?.filter((item: any) =>
                                                        appliedFilters?.program_id?.includes(item.id)
                                                    )}
                                                    onKeyPressFn={function noRefCheck() { }}
                                                    onRemove={(selectedList: any, selectedItem: any) => {
                                                        handleFilterChange(
                                                            selectedList,
                                                            selectedItem,
                                                            "program",
                                                            true
                                                        );
                                                    }}
                                                    onSearch={function noRefCheck() { }}
                                                    onSelect={(selectedList: any, selectedItem: any) =>
                                                        handleFilterChange(
                                                            selectedList,
                                                            selectedItem,
                                                            "program"
                                                        )
                                                    }
                                                    options={program}
                                                    showCheckbox
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                                            <section>
                                                <button
                                                    className="btn-purple mr-2"
                                                    onClick={() => {
                                                        fetchLabCMS();
                                                        setShowFilter(false);
                                                    }}
                                                >
                                                    APPLY ALL FILTERS
                                                </button>
                                                <button
                                                    className="btn-outline-purple"
                                                    onClick={clearFilterList}
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
            name: (<p className="text-[13px] font-medium">CMS Name</p>),
            selector: (row: any) => row?.cms?.name || "",
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Lot No</p>),
            selector: (row: any) => row?.lot_no || "",
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Container No</p>),
            selector: (row: any) => row?.container?.container_no || "",
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Date of sample collection</p>),
            cell: (row: any) => dateFormatter(row.sample_date),
            wrap: true,
            width: '120px',
        },
        {
            name: (<p className="text-[13px] font-medium">Lab name</p>),
            selector: (row: any) => row.lab.name,
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Third party inspector name</p>),
            selector: (row: any) => row.thirdparty.name,
            wrap: true,
        },
        {
            name: (<p className="text-[13px] font-medium">Expected date</p>),
            cell: (row: any) => dateFormatter(row.expected_date),
            wrap: true,
            width: '120px',
        },
        {
            name: (<p className="text-[13px] font-medium">No of samples</p>),
            cell: (row: any) => row.no_of_samples,
            wrap: true,
            width: '120px',
        },

        {
            name: (<p className="text-[13px] font-medium">Samples</p>),
            cell: (row: any) => (
                <Link
                    href={`/lab/cms/view-samples?id=${row.id}`}
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
                row.sample_reports ? (
                    <Link
                        href={`/lab/cms/view-result?id=${row.id}`}
                        className="hover:text-blue-600 text-blue-500"
                    >
                        View Result
                    </Link>
                ) : (
                    <Link
                        href={`/lab/cms/add-result?id=${row.id}`}
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
                                        <Link href="/lab/dashboard" className="active">
                                            <span className="icon-home"></span>
                                        </Link>
                                    </li>
                                    <li>Container Management System</li>
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
                                                    <FilterPopupList
                                                        openFilter={showFilter}
                                                        onClose={!showFilter} />
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

export default LabCMS;