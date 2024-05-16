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
import { GrAttachment } from "react-icons/gr";

interface SeedCompany {
    id: number;
    name: string;
    status: boolean;
}

interface SeedTestingLinkageReport {
    id: number;
    seed_testing_linkage_id: number;
    report: string;
}

interface LabMaster {
    id: number;
    name: string;
    status: boolean;
}

interface SeedTestingLinkageData {
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
    seed_company: SeedCompany | null;
    lotno: string;
    variety: string;
    packets: string;
    district: string;
    state: string;
    testing_code: string;
    seal_no: string;
    date_sending_sample: string;
    date_of_report: string;
    report_no: string;
    nos: string;
    thirtyfives: string;
    result_of_lab: string;
    lab_master_id: string;
    lab_master: LabMaster | null;
    seed_testing_linkage_reports: Array<SeedTestingLinkageReport>;
    selected: boolean | undefined;
}

const SeedTestingLinkage = () => {
    useTitle("Seed Testing Linkage");

    const [roleLoading] = useRole();
    const router = useRouter();
    const { translations, loading } = useTranslations();

    const [isClient, setIsClient] = useState<boolean>(false);
    const [data, setData] = useState<Array<SeedTestingLinkageData>>([]);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
    const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);
    const [showViewReportsPopup, setShowViewReportsPopup] = useState<boolean>(false);
    const [viewingReports, setViewingReports] = useState<Array<SeedTestingLinkageReport>>([]);
    const [showUploadReportPopup, setShowUploadReportPopup] = useState(false);

    const [seedCompanies, setSeedCompanies] = useState<Array<SeedCompany>>([]);
    const [showFilter, setShowFilter] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({
        seed_company_id: ""
    });

    const code = encodeURIComponent(searchQuery);
    const debouncedSearch = useDebounce(code, 200);

    const searchData = (e: any) => {
        setSearchQuery(e.target.value);
    }

    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page);
        setLimit(limitData);
        setSelectAllChecked(false);
    }

    const fetchSeedTestingLinkages = async () => {
        try {
            const res = await API.get(`organic-program-data-digitization/seed-testing-linkage?limit=${limit}&page=${page}&seed_company_id=${appliedFilters.seed_company_id}&search=${debouncedSearch}&sort=desc&pagination=true`);
            if (res.success) {
                setData(res.data);
                setCount(res.count);
            }
        } catch (error) {
            console.log(error);
            setCount(0);
        }
    };

    const handleShowReportsPopup = (row: SeedTestingLinkageData) => {
        setViewingReports(row.seed_testing_linkage_reports);
        setShowViewReportsPopup(true);
    };

    const handleShowUploadReportsPopup = () => {
        const selectedSTLToUploadReport = data.filter(d => d.selected);

        if (selectedSTLToUploadReport.length > 0) {
            setShowUploadReportPopup(true);
        } else {
            alert('Select Checbox to upload report');
        }
    }

    const handleDelete = (id: number) => {
        setDeleteItemId(id);
        setShowDeleteConfirmation(true);
    };

    const handleCancel = () => {
        setShowUploadReportPopup(false);
        setShowViewReportsPopup(false);
        setShowDeleteConfirmation(false);
        setDeleteItemId(null);
    }

    const dateFormatter = (date: any) => {
        const formatted = moment(date).format("DD-MM-YYYY");
        return formatted;
    };

    const fetchSeedCompanies = async () => {
        try {
            const res = await API.get("seed-company");
            if (res.success) {
                setSeedCompanies(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        User.role();
    }, []);

    useEffect(() => {
        fetchSeedTestingLinkages();
        setIsClient(true);
    }, [limit, page, debouncedSearch]);

    useEffect(() => {
        if (showFilter) {
            fetchSeedCompanies();
        }
    }, [showFilter]);

    const handleFilterChange = (name: string, value: any) => {
        setAppliedFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilter = () => {
        setAppliedFilters({
            seed_company_id: ""
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
                                                        Select Seed Company
                                                    </label>
                                                    <select
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        name="seed_company_id"
                                                        value={appliedFilters.seed_company_id || ""}
                                                        onChange={(e) => handleFilterChange("seed_company_id", e.target.value)}
                                                    >
                                                        <option value="">Select Seed Company</option>
                                                        {seedCompanies?.map((seedCompnay: SeedCompany) => (
                                                            <option key={seedCompnay.id} value={seedCompnay.id}>
                                                                {seedCompnay.name}
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
                                                            fetchSeedTestingLinkages();
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
        return (
            <div>
                <Loader />
            </div>
        );
    }

    const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventChecked = event.target.checked;
        setSelectAllChecked(eventChecked);

        const updatedData = data.map((item: SeedTestingLinkageData) => {
            const isChecked = eventChecked && item.seed_testing_linkage_reports.length === 0 ? true : false;
            return {
                ...item,
                selected: isChecked,
            }
        });
        setData(updatedData);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const isChecked = event.target.checked;
        const updatedData = [...data];
        updatedData[index].selected = isChecked;
        setData(updatedData);

        const isAllChecked = updatedData.every((item) => item.selected);
        setSelectAllChecked(isAllChecked);
    };

    const columns = [
        {
            name: (
                <div className="flex justify-between">
                    <input
                        name="select-all"
                        type="checkbox"
                        checked={selectAllChecked}
                        onChange={handleSelectAllChange}
                        className="mr-3"
                    />
                    Select All
                </div>
            ),
            cell: (row: SeedTestingLinkageData, index: number) => (
                <>
                    <input
                        type="checkbox"
                        checked={row?.selected || false}
                        onChange={(event) => handleCheckboxChange(event, index)}
                        disabled={row.seed_testing_linkage_reports.length > 0}
                    />
                </>
            )
        },
        {
            name: <p className="text-[13px] font-medium">{translations.common.srNo}</p>,
            cell: (row: SeedTestingLinkageData, index: number) => ((page - 1) * limit) + index + 1
        },
        {
            name: <p className="text-[13px] font-medium">Season</p>,
            cell: (row: SeedTestingLinkageData) => row?.season?.name || "",
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Seed Company Name</p>,
            cell: (row: SeedTestingLinkageData) => (
                <>
                    {
                        row?.seed_company?.name ? (
                            <button
                                onClick={() => router.push(`/services/organic-program-data-digitization/seed-testing-linkage/view-seed-testing-linkage?id=${row.id}`)}
                                className="text-blue-500 hover:text-blue-300"
                            >
                                {row?.seed_company?.name}
                            </button>
                        ) : (
                            <></>
                        )
                    }
                </>
            ),
            minWidth: '200px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Lot No.</p>,
            cell: (row: SeedTestingLinkageData) => row.lotno,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Variety</p>,
            cell: (row: SeedTestingLinkageData) => row.variety,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Available Packets</p>,
            cell: (row: SeedTestingLinkageData) => row.packets,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Location Dist.</p>,
            cell: (row: SeedTestingLinkageData) => row.district,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">State</p>,
            cell: (row: SeedTestingLinkageData) => row.state,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Testing Code</p>,
            cell: (row: SeedTestingLinkageData) => row.testing_code,
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Seal No.</p>,
            cell: (row: SeedTestingLinkageData) => row.seal_no,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Date of Sending Sample to LAB</p>,
            cell: (row: SeedTestingLinkageData) => dateFormatter(row.date_sending_sample),
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Date Of The Report</p>,
            cell: (row: SeedTestingLinkageData) => dateFormatter(row.date_of_report),
            minWidth: '120px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Test Report No.</p>,
            cell: (row: SeedTestingLinkageData) => row.report_no,
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">NOS</p>,
            cell: (row: SeedTestingLinkageData) => row.nos,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">35 s</p>,
            cell: (row: SeedTestingLinkageData) => row.thirtyfives,
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Result of External Lab  (GMO)</p>,
            cell: (row: SeedTestingLinkageData) => row.result_of_lab,
            minWidth: '150px',
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Name of Lab</p>,
            cell: (row: SeedTestingLinkageData) => row?.lab_master?.name || "",
            sortable: false
        },
        {
            name: <p className="text-[13px] font-medium">Report</p>,
            cell: (row: SeedTestingLinkageData) => (
                <>
                    <button
                        onClick={() => handleShowReportsPopup(row)}
                        className="text-blue-500 hover:text-blue-300"
                    >
                        View Report
                    </button>
                </>
            ),
            sortable: false
        },
        {
            name: translations.common.action,
            cell: (row: SeedTestingLinkageData) => (
                <>
                    <button className="bg-green-500 p-2 rounded" onClick={() => router.push(`/services/organic-program-data-digitization/seed-testing-linkage/edit-seed-testing-linkage?id=${row.id}`)}>
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
                                        <li>Seed Testing Linkage</li>
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
                                                            router.push("/services/organic-program-data-digitization/seed-testing-linkage/add-seed-testing-linkage")
                                                        }
                                                    >
                                                        {translations.common.add}
                                                    </button>
                                                </div>
                                                <div className="search-filter-right ml-3">
                                                    <button
                                                        onClick={handleShowUploadReportsPopup}
                                                        className="py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                                                    >
                                                        Upload Report
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />

                                        <div>
                                            <ViewReportsPopup
                                                openPopup={showViewReportsPopup}
                                                onCancel={handleCancel}
                                                reports={viewingReports}
                                                translations={translations}
                                                fetchSeedTestingLinkages={fetchSeedTestingLinkages}
                                            />
                                        </div>
                                        <div>
                                            <UploadReportPopup
                                                openPopup={showUploadReportPopup}
                                                onCancel={handleCancel}
                                                seedTestingLinkages={data.map((d, i) => ({ ...d, srNo: ((page - 1) * limit) + i + 1 })).filter(d => d.selected)}
                                                translations={translations}
                                                fetchSeedTestingLinkages={fetchSeedTestingLinkages}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {showDeleteConfirmation && (
                            <DeleteConfirmation
                                message="Are you sure you want to delete this?"
                                onDelete={async () => {
                                    if (deleteItemId !== null) {
                                        const url = "organic-program-data-digitization/seed-testing-linkage";
                                        try {
                                            const response = await API.delete(url, {
                                                id: deleteItemId
                                            });
                                            if (response.success) {
                                                toasterSuccess('Record has been deleted successfully');
                                                fetchSeedTestingLinkages();
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

export default SeedTestingLinkage;

const ViewReportsPopup = ({ openPopup, onCancel, reports, translations, fetchSeedTestingLinkages }: any) => {
    const [seedTestingLinkageReports, setSeedTestingLinkageReports] = useState<Array<SeedTestingLinkageReport>>(reports);
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

    const handleDelete = (id: number) => {
        setDeleteItemId(id);
        setShowDeleteConfirmation(true);
    };

    const handleCancel = () => {
        setShowDeleteConfirmation(false);
        setDeleteItemId(null);
    }

    const handleView = (filename: string) => {
        const url = `${process.env.NEXT_PUBLIC_API_URL}file/${filename}`;
        window.open(url, "_blank");
    };

    useEffect(() => {
        setSeedTestingLinkageReports(reports);
    }, [reports]);

    const columns = [
        {
            name: <p className="text-[13px] font-medium">Report</p>,
            cell: (row: SeedTestingLinkageReport) => (
                <>
                    <button
                        onClick={() => handleView(row.report)}
                        className="text-blue-500 hover:text-blue-300"
                    >
                        {row.report}
                    </button>
                </>
            ),
            minWidth: '250px',
            sortable: false
        },
        {
            name: translations.common.action,
            cell: (row: SeedTestingLinkageReport) => (
                <>
                    <button className="bg-red-500 p-2 ml-3 rounded" onClick={() => handleDelete(row.id)}>
                        <AiFillDelete size={18} color="white" />
                    </button>
                </>
            ),
            width: "100px",
            ignoreRowClick: true,
            allowOverflow: true
        }
    ];

    return (
        <div>
            {openPopup && (
                <div className="flex h-full w-auto z-10 fixed justify-center bg-black bg-opacity-70 top-3 left-0 right-0 bottom-0 p-3 ">
                    <div className="bg-white border h-fit w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
                        <div className="flex justify-between">
                            <h3>View Reports</h3>
                            <button onClick={onCancel}>&times;</button>
                        </div>
                        <hr />
                        <div className="py-2 mt-2">
                            <CommonDataTable columns={columns} count={seedTestingLinkageReports.length} data={seedTestingLinkageReports} pagination={false} />
                        </div>

                        {showDeleteConfirmation && (
                            <DeleteConfirmation
                                message="Are you sure you want to delete this?"
                                onDelete={async () => {
                                    if (deleteItemId !== null) {
                                        const url = "organic-program-data-digitization/seed-testing-linkage-report";
                                        try {
                                            const response = await API.delete(url, {
                                                id: deleteItemId
                                            });
                                            if (response.success) {
                                                toasterSuccess('Record has been deleted successfully');
                                                setSeedTestingLinkageReports(seedTestingLinkageReports.filter(r => r.id !== deleteItemId));
                                                fetchSeedTestingLinkages();
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
                </div>
            )}
        </div>
    );
}

const UploadReportPopup = ({ openPopup, onCancel, seedTestingLinkages, translations, fetchSeedTestingLinkages }: any) => {
    const [formData, setFormData] = useState<any>({});
    const [errors, setErrors] = useState<any>({});
    const [uploadedFileNames, setUploadedFileNames] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleDocumentsUpload = async (key: string, files: FileList | null, seed_testing_linkage_id: string) => {
        if (files?.length && files.length > 0) {
            let isAnyFileInvalid = false;

            for (const file of files) {
                const maxFileSize = 200 * 1024 * 1024;
                if (file.size > maxFileSize) {
                    setErrors((prevError: any) => ({
                        ...prevError,
                        [key]: 'Any of the file size exceeds the maximum limit (200MB).',
                    }));
                    isAnyFileInvalid = true;
                }
            }

            if (!isAnyFileInvalid) {
                setUploadedFileNames((prevFile: any) => ({ ...prevFile, [key]: [] }));
                const uploadPromises = Array.from(files).map(async (file) => {
                    try {
                        const url = "file/upload";
                        const fileFormData = new FormData();
                        fileFormData.append("file", file);

                        const response = await API.postFile(url, fileFormData);
                        if (response.success) {
                            setUploadedFileNames((prevFile: any) => ({
                                ...prevFile,
                                [key]: [...prevFile[key], file.name],
                            }));
                            return response.data;
                        } else {
                            return null;
                        }
                    } catch (error) {
                        console.log('Error uploading seed testing linkage reports:', error);
                        return null;
                    }
                });

                const reportUrls = (await Promise.all(uploadPromises)).filter(Boolean);
                setFormData((prevFormData: any) => ({
                    ...prevFormData,
                    [key]: {
                        seed_testing_linkage_id,
                        reports: reportUrls
                    }
                }));
                setErrors((prevError: any) => ({ ...prevError, [key]: "" }));
            }
        } else {
            toasterError("Could not select files, try again to select.");
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            const hasErrors = Object.values(errors).some((error) => error);
            if (!hasErrors) {
                const url = "organic-program-data-digitization/seed-testing-linkage-report";

                const uploadedReports = Object.values(formData).reduce((acc: any, value: any) => {
                    const { seed_testing_linkage_id, reports } = value;
                    return acc.concat(reports.map((report: any) => {
                        const reportUrlComponents = report.split('/');
                        const reportName = reportUrlComponents[reportUrlComponents.length - 1];
                        return { seed_testing_linkage_id, report: reportName }
                    }));
                }, []);

                const mainResponse = await API.post(url, { reports: uploadedReports });

                if (mainResponse.success) {
                    toasterSuccess("Report uploaded successfully!");
                    setFormData({});
                    setErrors({});
                    setUploadedFileNames({});
                    await fetchSeedTestingLinkages();
                    onCancel();
                }
            }
            setIsSubmitting(false);
        } catch (error) {
            console.log("Error submitting form:", error);
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            {openPopup && (
                <div className="flex h-full w-auto z-10 fixed justify-center bg-black bg-opacity-70 top-3 left-0 right-0 bottom-0 p-3">
                    <div className="bg-white border h-fit w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md min-w-[100%] md:min-w-[500px]">
                        <div className="flex justify-between">
                            <h3>Upload Report</h3>
                            <button onClick={onCancel}>&times;</button>
                        </div>
                        <hr />
                        <div>
                            {seedTestingLinkages.map((seedTestingLinkage: any, i: number) => (
                                <div key={i} className='mt-2'>
                                    <label className="text-gray-500 text-[12px] font-medium">
                                        {seedTestingLinkage.srNo}-{seedTestingLinkage?.seed_company?.name}
                                    </label>
                                    <div className="inputFile">
                                        <label>
                                            Choose File <GrAttachment />
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/jpeg, image/gif, image/png,application/pdf, image/x-eps"
                                                name={`upload-report-${seedTestingLinkage.srNo}`}
                                                id={`upload-report-${seedTestingLinkage.srNo}`}
                                                onChange={(e) => {
                                                    handleDocumentsUpload(e.target.name, e.target.files || null, seedTestingLinkage.id);
                                                }}
                                                onClick={(event: any) => {
                                                    event.currentTarget.value = null;
                                                }}
                                            />
                                        </label>
                                    </div>
                                    {uploadedFileNames[`upload-report-${seedTestingLinkage.srNo}`] && (
                                        <div className="flex text-sm mt-1">
                                            <GrAttachment />
                                            <p className="mx-1">{uploadedFileNames[`upload-report-${seedTestingLinkage.srNo}`].join(", ")}</p>
                                        </div>
                                    )}
                                    {errors[`upload-report-${seedTestingLinkage.srNo}`] !== "" && (
                                        <div className="text-sm text-red-500 ">{errors[`upload-report-${seedTestingLinkage.srNo}`]}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-end mt-4 space-x-3 customButtonGroup">
                            <button
                                className="btn-purple mr-2"
                                disabled={isSubmitting}
                                style={
                                    isSubmitting
                                        ? { cursor: "not-allowed", opacity: 0.8 }
                                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                                }
                                onClick={handleSubmit}
                            >
                                {translations?.common?.submit}
                            </button>
                            <button
                                className="btn-outline-purple"
                                onClick={onCancel}
                            >
                                {translations?.common?.cancel}
                            </button>
                        </div>
                    </div>
                </div >
            )}
        </div >
    );
}