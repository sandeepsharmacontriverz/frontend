"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import useDebounce from '@hooks/useDebounce';
import Loader from '@components/core/Loader';
import DeleteConfirmation from '@components/core/DeleteConfirmation';
import CommonDataTable from '@components/core/Table';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import API from '@lib/Api';
import User from '@lib/User';
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";

interface seedAvailabilityData {
    id: number;
    season_id: number;
    season: {
        id: number;
        name: string;
        status: boolean;
        from: string;
        to: string;
    } | null;
    seed_company_id: number;
    seed_company: {
        id: number;
        name: string;
        status: boolean;
    } | null;
    lot_no: string;
    variety: string;
    pkt: string;
    state: string;
}

const SeedAvailability = () => {
    useTitle("Seed Availability");

    const [roleLoading] = useRole();
    const router = useRouter();
    const { translations, loading } = useTranslations();

    const [isClient, setIsClient] = useState<boolean>(false);
    const [data, setData] = useState<Array<seedAvailabilityData>>([]);
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

    const fetchSeedAvailabilities = async () => {
        try {
            const res = await API.get(`organic-program-data-digitization/seed-availability?limit=${limit}&page=${page}&search=${debouncedSearch}&sort=desc&pagination=true`);
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
        fetchSeedAvailabilities();
        setIsClient(true);
    }, [limit, page, debouncedSearch]);

    if (loading) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    const columns = [
        {
            name: <p className="text-[13px] font-medium">{translations.common.srNo}</p>,
            cell: (row: seedAvailabilityData, index: number) => ((page - 1) * limit) + index + 1
        },
        {
            name: <p className="text-[13px] font-medium">Season</p>,
            cell: (row: seedAvailabilityData) => row?.season?.name || "",
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Seed Company Name</p>,
            cell: (row: seedAvailabilityData) => row?.seed_company?.name || "",
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Lot No.</p>,
            cell: (row: seedAvailabilityData) => row.lot_no,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Variety</p>,
            cell: (row: seedAvailabilityData) => row.variety,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">PKT</p>,
            cell: (row: seedAvailabilityData) => row.pkt,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">State</p>,
            cell: (row: seedAvailabilityData) => row.state,
            sortable: false
        },
        {
            name: translations.common.action,
            cell: (row: seedAvailabilityData) => (
                <>
                    <button className="bg-green-500 p-2 rounded" onClick={() => router.push(`/services/organic-program-data-digitization/seed-availability/edit-seed-availability?id=${row.id}`)}>
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
                                        <li>Seed Availability</li>
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
                                        const url = "organic-program-data-digitization/seed-availability";
                                        try {
                                            const response = await API.delete(url, {
                                                id: deleteItemId
                                            });
                                            if (response.success) {
                                                toasterSuccess('Record has been deleted successfully');
                                                fetchSeedAvailabilities();
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

export default SeedAvailability;