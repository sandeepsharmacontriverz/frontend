"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

interface Ics {
    id: number;
    ics_name: string;
    farmGroup_id: number;
    ics_latitude: string | null;
    ics_longitude: string | null;
    ics_status: boolean;
}

interface CropCurrentSeason {
    id: number;
    crop_name: string;
}

interface IcsQuantityEstimationData {
    id: number;
    season_id: number;
    season: Season | null;
    farm_group_id: number;
    farm_group: FarmGroup | null;
    ics_id: number;
    ics: Ics | null;
    no_of_farmer: string;
    total_area: string;
    est_cotton_area: string;
    estimated_lint: string;
    verified_row_cotton: string;
    verified_ginner: string;
    crop_current_season_id: number;
    crop_current_season: CropCurrentSeason | null;
    organic_standard: string;
    certification_body: string;
    scope_issued_date: string;
    scope_certification_validity: string;
    scope_certification_no: string;
    nop_scope_certification_no: string;
    district: string;
    state: string;
    remark: string;
}

const IcsQuantityEstimation = () => {
    useTitle("Ics Quantity Estimation");

    const [roleLoading] = useRole();
    const router = useRouter();
    const { translations, loading } = useTranslations();

    const [isClient, setIsClient] = useState<boolean>(false);
    const [data, setData] = useState<Array<IcsQuantityEstimationData>>([]);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

    const code = encodeURIComponent(searchQuery);
    const debouncedSearch = useDebounce(code, 200);

    const searchData = (e: any) => {
        setSearchQuery(e.target.value);
    }

    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page);
        setLimit(limitData);
    }

    const fetchIcsQuantityEstimations = async () => {
        try {
            const res = await API.get(`organic-program-data-digitization/ics-quantity-estimation?limit=${limit}&page=${page}&search=${debouncedSearch}&sort=desc&pagination=true`);
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

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        User.role();
    }, []);

    useEffect(() => {
        fetchIcsQuantityEstimations();
        setIsClient(true);
    }, [limit, page, debouncedSearch]);

    if (loading) {
        return (<div><Loader /></div>);
    }

    const columns = [
        {
            name: <p className="text-[13px] font-medium">{translations.common.srNo}</p>,
            cell: (row: IcsQuantityEstimationData, index: number) => ((page - 1) * limit) + index + 1
        },
        {
            name: <p className="text-[13px] font-medium">Season</p>,
            cell: (row: IcsQuantityEstimationData) => row?.season?.name || "",
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Farmer Group Name</p>,
            cell: (row: IcsQuantityEstimationData) => (
                <>
                    {
                        row?.farm_group?.name ? (
                            <button
                                onClick={() => router.push(`/services/organic-program-data-digitization/ics-quantity-estimation/view-ics-quantity-estimation?id=${row.id}`)}
                                className="text-blue-500 hover:text-blue-300 text-left"
                            >
                                {row?.farm_group?.name}
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
            name: <p className="text-[13px] font-medium">ICS Name</p>,
            cell: (row: IcsQuantityEstimationData) => row?.ics?.ics_name || "",
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">No of Farmer</p>,
            cell: (row: IcsQuantityEstimationData) => row.no_of_farmer,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Total Area</p>,
            cell: (row: IcsQuantityEstimationData) => row.total_area,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Est. Cotton Area</p>,
            cell: (row: IcsQuantityEstimationData) => row.est_cotton_area,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Estimated Lint (MT)</p>,
            cell: (row: IcsQuantityEstimationData) => row.estimated_lint,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Verified  volume by CB as per TC (RAW COTTON)</p>,
            cell: (row: IcsQuantityEstimationData) => row.verified_row_cotton,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Verified  volume by CB as per TC (GINNER)</p>,
            cell: (row: IcsQuantityEstimationData) => row.verified_ginner,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Status of current season</p>,
            cell: (row: IcsQuantityEstimationData) => row?.crop_current_season?.crop_name || "",
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Organic standard</p>,
            cell: (row: IcsQuantityEstimationData) => row.organic_standard,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Certification body</p>,
            cell: (row: IcsQuantityEstimationData) => row.certification_body,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Scope Issued Date </p>,
            cell: (row: IcsQuantityEstimationData) => row.scope_issued_date,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Scope certificate Validity / Lint avaibility in month</p>,
            cell: (row: IcsQuantityEstimationData) => row.scope_certification_validity,
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Scope Certificate No.</p>,
            cell: (row: IcsQuantityEstimationData) => row.scope_certification_no,
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Dist</p>,
            cell: (row: IcsQuantityEstimationData) => row.district,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">State</p>,
            cell: (row: IcsQuantityEstimationData) => row.state,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Remark</p>,
            cell: (row: IcsQuantityEstimationData) => row.remark,
            sortable: false
        },
        {
            name: translations.common.action,
            cell: (row: IcsQuantityEstimationData) => (
                <>
                    <button className="bg-green-500 p-2 rounded" onClick={() => router.push(`/services/organic-program-data-digitization/ics-quantity-estimation/edit-ics-quantity-estimation?id=${row.id}`)}>
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
                                        <li>Ics Quantity Estimation</li>
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
                                            <div className="flex">
                                                <div className="search-filter-right">
                                                    <button
                                                        className="btn btn-all btn-purple"
                                                        onClick={() =>
                                                            router.push("/services/organic-program-data-digitization/ics-quantity-estimation/add-ics-quantity-estimation")
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
                                        const url = "organic-program-data-digitization/ics-quantity-estimation";
                                        try {
                                            const response = await API.delete(url, {
                                                id: deleteItemId
                                            });
                                            if (response.success) {
                                                toasterSuccess('Record has been deleted successfully');
                                                fetchIcsQuantityEstimations();
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

export default IcsQuantityEstimation;