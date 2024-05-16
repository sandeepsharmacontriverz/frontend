"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useDebounce from '@hooks/useDebounce';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import CommonDataTable from '@components/core/Table';
import DeleteConfirmation from '@components/core/DeleteConfirmation';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import API from '@lib/Api';
import User from '@lib/User';
import { LuEdit } from "react-icons/lu";
import { BiFilterAlt } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";

interface Season {
    id: number;
    name: string;
    status: boolean;
    from: string;
    to: string;
}

interface FarmGroup {
    id: number;
    name: string;
    brand_id: number;
    status: boolean;
    latitude: string | null;
    longitude: string | null;
}

interface FarmGroupEvaluation {
    id: number;
    season_id: number;
    season: Season | null;
    agronomist_name: string;
    visit_from: string;
    visit_to: string;
    farm_group_id: number;
    farm_group: FarmGroup | null;
    address: string;
    registration_details: string;
    company_type: string;
    parent_company_name: string;
    owner_name: string;
    establishment_year: string;
}

const FarmGroupEvaluationData = () => {
    useTitle("Farm Group Evaluation Data");

    const [roleLoading] = useRole();
    const router = useRouter();
    const { translations, loading } = useTranslations();

    const [isClient, setIsClient] = useState<boolean>(false);
    const [data, setData] = useState<Array<FarmGroupEvaluation>>([]);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

    const [brands, setBrands] = useState<Array<any>>([]);
    const [farmGroups, setFarmGroups] = useState<Array<FarmGroup>>([]);
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [appliedFilters, setAppliedFilters] = useState<{
        brand_id: string | number;
        farm_group_id: string | number;
    }>({
        brand_id: "",
        farm_group_id: ""
    });

    const code = encodeURIComponent(searchQuery);
    const debouncedSearch = useDebounce(code, 200);

    const searchData = (e: any) => {
        setSearchQuery(e.target.value);
    }

    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page);
        setLimit(limitData);
    }

    const fetchFarmGroupEvaluationData = async () => {
        try {
            const res = await API.get(`organic-program-data-digitization/farm-group-evaluation-data?limit=${limit}&page=${page}&brand_id=${appliedFilters.brand_id}&farm_group_id=${appliedFilters.farm_group_id}&search=${debouncedSearch}&sort=desc&pagination=true`);
            if (res.success) {
                setData(res.data);
                setCount(res.count);
            }
        } catch (error) {
            console.log(error);
            setCount(0);
        }
    };

    const handleDelete = (id: number) => {
        setDeleteItemId(id);
        setShowDeleteConfirmation(true);
    };

    const handleCancel = () => {
        setShowDeleteConfirmation(false);
        setDeleteItemId(null);
    }

    const dateFormatter = (date: any) => {
        const formatted = moment(date).format("DD-MM-YYYY");
        return formatted;
    };

    const fetchBrands = async () => {
        try {
            const res = await API.get("brand");
            if (res.success) {
                setBrands(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchFarmGroups = async () => {
        if (appliedFilters.brand_id) {
            try {
                const res = await API.get(`farm-group?brandId=${appliedFilters.brand_id}`);
                if (res.success) {
                    setFarmGroups(res.data);
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            setFarmGroups([]);
        }
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        User.role();
    }, []);

    useEffect(() => {
        fetchFarmGroupEvaluationData();
        setIsClient(true);
    }, [limit, page, debouncedSearch]);

    useEffect(() => {
        if (showFilter) {
            fetchBrands();
        }
    }, [showFilter]);

    useEffect(() => {
        fetchFarmGroups();
    }, [appliedFilters.brand_id]);

    const handleFilterChange = (name: string, value: any) => {
        setAppliedFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilter = () => {
        setAppliedFilters({
            brand_id: "",
            farm_group_id: ""
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
                            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
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
                                                <div className="col-12 col-md-6 col-lg-3 mt-2">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        Select Brand
                                                    </label>
                                                    <select
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        name="brand_id"
                                                        value={appliedFilters.brand_id || ""}
                                                        onChange={(e) => handleFilterChange(e.target.name, e.target.value)}
                                                    >
                                                        <option value="">Select Brand</option>
                                                        {brands?.map((brand: any) => (
                                                            <option key={brand.id} value={brand.id}>
                                                                {brand.brand_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-12 col-md-6 col-lg-3 mt-2">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        Select Farm Group
                                                    </label>
                                                    <select
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        name="farm_group_id"
                                                        value={appliedFilters.farm_group_id || ""}
                                                        onChange={(e) => handleFilterChange(e.target.name, e.target.value)}
                                                    >
                                                        <option value="">Select Farm Group</option>
                                                        {farmGroups?.map((farmGroup: FarmGroup) => (
                                                            <option key={farmGroup.id} value={farmGroup.id}>
                                                                {farmGroup.name}
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
                                                            fetchFarmGroupEvaluationData();
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

    if (loading) {
        return (<div><Loader /></div>);
    }

    const columns = [
        {
            name: <p className="text-[13px] font-medium">{translations.common.srNo}</p>,
            cell: (row: FarmGroupEvaluation, index: number) => ((page - 1) * limit) + index + 1
        },
        {
            name: <p className="text-[13px] font-medium">Season</p>,
            cell: (row: FarmGroupEvaluation) => row?.season?.name || "",
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Name of the Visitor/Evaluator Official</p>,
            cell: (row: FarmGroupEvaluation) => (
                <>
                    {
                        row?.agronomist_name ? (
                            <button
                                onClick={() => router.push(`/services/organic-program-data-digitization/farm-group-evaluation-data/view-farm-group-evaluation-data?id=${row.id}`)}
                                className="text-blue-500 hover:text-blue-300 text-left"
                            >
                                {row.agronomist_name}
                            </button>
                        ) : (
                            <></>
                        )
                    }
                </>
            ),
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Visit Date</p>,
            cell: (row: FarmGroupEvaluation) => `${dateFormatter(row.visit_from)} - ${dateFormatter(row.visit_to)}`,
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Farmer Group Name</p>,
            cell: (row: FarmGroupEvaluation) => row?.farm_group?.name || "",
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Address</p>,
            cell: (row: FarmGroupEvaluation) => row.address,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Registration Details</p>,
            cell: (row: FarmGroupEvaluation) => row.registration_details,
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Company Type</p>,
            cell: (row: FarmGroupEvaluation) => row.company_type,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Parent Company Name</p>,
            cell: (row: FarmGroupEvaluation) => row.parent_company_name,
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Owner Name</p>,
            cell: (row: FarmGroupEvaluation) => row.owner_name,
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Establishment Year</p>,
            cell: (row: FarmGroupEvaluation) => row.establishment_year,
            minWidth: '200px',
            sortable: false
        },
        {
            name: translations.common.action,
            cell: (row: FarmGroupEvaluation) => (
                <>
                    <button className="bg-green-500 p-2 rounded" onClick={() => router.push(`/services/organic-program-data-digitization/farm-group-evaluation-data/edit-farm-group-evaluation-data?id=${row.id}`)}>
                        <LuEdit size={18} color="white" />
                    </button>
                    <button className="bg-red-500 p-2 ml-3 rounded" onClick={() => handleDelete(row.id)}>
                        <AiFillDelete size={18} color="white" />
                    </button>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true
        }
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
                                        <li className="active">
                                            <Link href="/dashboard">
                                                <span className="icon-home"></span>
                                            </Link>
                                        </li>
                                        <li>Services</li>
                                        <li>Organic Program Data Digitization</li>
                                        <li>Farm Group Evaluation Data</li>
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
                                        <div className="search-filter-row">
                                            <div className="search-filter-left">
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
                                            <div className="flex">
                                                <div className="search-filter-right">
                                                    <button
                                                        className="btn btn-all btn-purple"
                                                        onClick={() =>
                                                            router.push("/services/organic-program-data-digitization/farm-group-evaluation-data/add-farm-group-evaluation-data")
                                                        }
                                                    >
                                                        {translations.common.add}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {showDeleteConfirmation && (
                            <DeleteConfirmation
                                message="Are you sure you want to delete this?"
                                onDelete={async () => {
                                    if (deleteItemId !== null) {
                                        const url = "organic-program-data-digitization/farm-group-evaluation-data";
                                        try {
                                            const response = await API.delete(url, {
                                                id: deleteItemId
                                            });
                                            if (response.success) {
                                                toasterSuccess('Record has been deleted successfully');
                                                fetchFarmGroupEvaluationData();
                                            } else {
                                                toasterError('Failed to delete record');
                                            }
                                        }
                                        catch (error) {
                                            console.log(error, "error");
                                            toasterError('An error occurred');
                                        }
                                        setShowDeleteConfirmation(false);
                                        setDeleteItemId(null);
                                    }
                                }}
                                onCancel={handleCancel}
                            />
                        )}
                    </div>
                ) : (
                    'Loading...'
                )}
            </div>
        );
    }
}

export default FarmGroupEvaluationData;