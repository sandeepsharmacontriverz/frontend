"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import { exportToExcel } from '@components/core/ExcelExporter';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import CommonDataTable from '@components/core/Table';
import DeleteConfirmation from '@components/core/DeleteConfirmation';
import API from '@lib/Api';
import User from '@lib/User';
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";

const LabMaster = () => {
    useTitle("Lab Master");

    const [roleLoading] = useRole();
    const router = useRouter();

    const [isClient, setIsClient] = useState<boolean>(false);
    const [data, setData] = useState<Array<object>>([]);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [editVisible, setEditVisible] = useState<boolean>(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editDefault, setEditDefault] = useState<string>('');
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

    const searchData = (e: any) => {
        setSearchQuery(e.target.value);
    }

    const handleExport = () => {
        if (data.length > 0) {
            const dataToExport = data.map((element: any, index: number) => {
                return {
                    srNo: ((page - 1) * limit) + index + 1,
                    lab_name: element.name,
                    status: element.status
                }
            });
            exportToExcel(dataToExport, "Master-LabMaster Data");
        } else {
            toasterError("Nothing to export!");
        }
    }

    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page);
        setLimit(limitData);
    }

    const changeStatus = async (row: any) => {
        const newStatus = !row.status;
        const url = "lab-master/status";
        try {
            const response = await API.put(url, {
                id: row.id,
                status: newStatus
            })
            if (response.success) {
                getLabMasters();
            }
        }
        catch (error) {
            console.log(error, "error");
        }
    }

    const getLabMasters = async () => {
        const url = `lab-master?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`;
        try {
            const response = await API.get(url);
            setData(response.data);
            setCount(response.count);
        }
        catch (error) {
            console.log(error, "error");
            setCount(0);
        }
    };

    const editHandle = (row: any) => {
        setEditId(row.id);
        setEditDefault(row.name);
        setEditVisible(true);
    }

    const handleDelete = (id: number) => {
        setDeleteItemId(id);
        setShowDeleteConfirmation(true);
    };

    const handleCancel = () => {
        setEditVisible(false);
        setShowDeleteConfirmation(false);
    }

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        User.role();
    }, []);

    useEffect(() => {
        getLabMasters();
    }, [searchQuery, page, limit]);

    const { translations, loading } = useTranslations();
    if (loading) {
        return <div>Loading translations...</div>;
    }

    const columns = [
        {
            name: translations.common.srNo,
            cell: (row: any, index: number) => ((page - 1) * limit) + index + 1
        },
        {
            name: translations.labMaster.labname,
            cell: (row: any) => row.name,
            sortable: false
        },
        {
            name: translations.common.status,
            cell: (row: any) => (
                <button onClick={() => changeStatus(row)} className={row.status ? "text-green-500" : "text-red-500"}>
                    {row.status ? (
                        <BsCheckLg size={20} className="mr-4" />
                    ) : (
                        <RxCross1 size={20} className="mr-4" />
                    )}
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true
        },
        {
            name: translations.common.action,
            cell: (row: any) => (
                <>
                    <button className="bg-green-500 p-2 rounded" onClick={() => editHandle(row)}>
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
                                        <li>
                                            <Link href="/dashboard" className="active">
                                                <span className="icon-home"></span>
                                            </Link>
                                        </li>
                                        <li>Master</li>
                                        <li>Lab Master</li>
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
                                                            onChange={searchData} />
                                                        <button type="submit" className="search-btn">
                                                            <span className="icon-search"></span>
                                                        </button>
                                                    </form>
                                                </div>

                                            </div>
                                            <div className="search-filter-right">
                                                <button className="btn btn-all btn-purple" onClick={() => router.push("/master/lab-master/add-lab-master")} >{translations.common.add}</button>
                                            </div>
                                        </div>

                                        <div className="flex mt-2 justify-end borderFix pt-2 pb-2">
                                            <div className="search-filter-right">
                                                <button
                                                    onClick={handleExport}
                                                    className="h-100 py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                                                >
                                                    {translations.common.export}
                                                </button>
                                            </div>
                                        </div>

                                        <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Edit openPopup={editVisible} onCancel={handleCancel} editId={editId} defaultValue={editDefault} getItems={getLabMasters} />
                        </div>

                        {showDeleteConfirmation && (
                            <DeleteConfirmation
                                message="Are you sure you want to delete this?"
                                onDelete={async () => {
                                    if (deleteItemId !== null) {
                                        const url = "lab-master";
                                        try {
                                            const response = await API.delete(url, {
                                                id: deleteItemId
                                            });
                                            if (response.success) {
                                                toasterSuccess('Record has been deleted successfully');
                                                getLabMasters();
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

const Edit = ({ openPopup, onCancel, editId, defaultValue, getItems }: any) => {
    const [labname, setLabname] = useState<string>("");
    const [errors, setErrors] = useState<{ name: string }>({ name: '' });

    const handleCancel = () => {
        onCancel();
        setErrors({ name: '' });
        setLabname(defaultValue);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setLabname(value);
        setErrors({ name: '' });
    };

    const handleSubmit = async () => {
        const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
        const valid = regex.test(labname);
        if (!labname || !valid) {
            setErrors((prevError) => ({
                ...prevError,
                name: !labname ? "Lab name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _",
            }));
        } else {
            const url = "lab-master";
            try {
                const response = await API.put(url, {
                    id: editId,
                    labName: labname
                });
                if (response.success) {
                    toasterSuccess('Record has been updated successfully');
                    setLabname('');
                    getItems();
                    onCancel();
                }
                else {
                    toasterError(response.error.code === 'ALREADY_EXITS' ? 'Lab name already exist' : response.error.code);
                    onCancel();
                }
            }
            catch (error) {
                console.log(error, "error");
            }
        }
    };

    useEffect(() => {
        setLabname(defaultValue);
    }, [defaultValue]);

    return (
        <div>
            {openPopup && (
                <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
                    <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
                        <div className="flex justify-between">
                            <h3
                            >Edit Lab Master</h3>
                            <button
                                onClick={handleCancel}
                            >
                                &times;
                            </button>
                        </div>
                        <hr />
                        <div className="py-2">

                            <div className="flex py-3 justify-between">
                                <span className="text-sm mr-8">Lab Name * </span>
                                <div>
                                    <input
                                        type="text"
                                        id="labname"
                                        name="labname"
                                        value={labname}
                                        onChange={handleInputChange}
                                        className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                                        placeholder='Lab Name'
                                    />
                                    {errors.name && (
                                        <p className="text-red-500  text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 mt-5 flex justify-end border-t">
                            <button
                                onClick={handleSubmit}
                                className="bg-green-500 mr-2 text-sm text-white font-bold py-2 px-4 rounded border"
                            >
                                Submit
                            </button>
                            <button
                                onClick={handleCancel}
                                className="mr-2 bg-gray-200 text-sm font-bold py-2 px-4 rounded border"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LabMaster;