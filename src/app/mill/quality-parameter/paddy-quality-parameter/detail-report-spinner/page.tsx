"use client"
import { useRouter } from '@lib/router-events';
import { useState, useEffect } from "react";
import CommonDataTable from '@components/core/Table';
import useTranslations from '@hooks/useTranslation';
import API from '@lib/Api';
import useTitle from '@hooks/useTitle';
import useRole from '@hooks/useRole';
import Link from '@components/core/nav-link';
import { useSearchParams } from 'next/navigation';
import moment from 'moment';

export default function Page() {
    useTitle("Paddy Quality Parameter")
    const search = useSearchParams();
    const id = search.get("id");
    const [roleLoading] = useRole();
    const router = useRouter();

    const [isLoaded, setIsLoaded] = useState(false)
    const [data, setData] = useState<any>(null);

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [count, setCount] = useState<any>()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const code = encodeURIComponent(searchQuery);

    useEffect(() => {
        if (id) {
            fetchSingleCottonQuality();
        }
    }, [searchQuery, page, limit, id])

    const fetchSingleCottonQuality = async () => {
        try {
            const res = await API.get(`quality-parameter/get-value?id=${id}&search=${code}&page=${page}&limit=${limit}&pagination=true`);
            if (res.success) {
                setData([res.data])
                setCount(res.count)
                setIsLoaded(true)
            }
        } catch (error) {
            console.log(error)
            setCount(0)
            setIsLoaded(true)
        }
    }

    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page)
        setLimit(limitData)
    }

    const searchData = (e: any) => {
        setSearchQuery(e.target.value)
    }

    const dateFormatter = (date: any) => {
        const formatted = moment(date).format("DD-MM-YYYY");
        return formatted
    }

    const { translations, loading } = useTranslations();

    if (loading) {
        return <div> Loading translations...</div>;
    }

    const columns = [
        {
            name: translations.common.srNo,
            cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
            sortable: false,
        },
        {
            name: translations.millInterface.milllotNo,
            selector: (row: any) => row.process?.lot_no,
            sortable: false,
        },
        {
            name: translations.mandiInterface.reelLotNo,
            selector: (row: any) => row.process?.reel_lot_no,
            sortable: false,
        },
        {
            name: translations.qualityParameter.labName,
            selector: (row: any) => row.lab_name,
            sortable: false,
        },
        {
            name: translations.qualityParameter.dateReport,
            selector: (row: any) => row.test_report,
            sortable: false,
        },
        {
            name: translations.qualityParameter.sci,
            selector: (row: any) => row.sci,
            sortable: false,
        },
        {
            name: translations.qualityParameter.moisture,
            selector: (row: any) => row.moisture,
            sortable: false,
        },
        {
            name: translations.qualityParameter.mic,
            selector: (row: any) => row.mic,
            sortable: false,
        },
        {
            name: translations.qualityParameter.mat,
            selector: (row: any) => row.mat,
            sortable: false,
        },
        {
            name: translations.qualityParameter.uhml,
            selector: (row: any) => row.uhml,
            sortable: false,
        },
        {
            name: translations.qualityParameter.ui,
            selector: (row: any) => row.ui,
            sortable: false,
        },
        {
            name: translations.qualityParameter.sf,
            selector: (row: any) => row.sf,
            sortable: false,
        },
        {
            name: translations.qualityParameter.str,
            selector: (row: any) => row.str,
            sortable: false,
        },
        {
            name: translations.qualityParameter.elg,
            selector: (row: any) => row.elg,
            sortable: false,
        },
        {
            name: translations.qualityParameter.rd,
            selector: (row: any) => row.rd,
            sortable: false,
        },
        {
            name: translations.qualityParameter.b,
            selector: (row: any) => row.plusb,
            sortable: false,
        },
        {
            name: translations.qualityParameter.document,
            cell: (row: any) => (
                <>
                    <button className="text-blue-700" onClick={() => window.open(row.document)}>
                        {new URL(row.document).pathname.split('/').pop()}
                    </button>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
        },
    ];

    if (!roleLoading && isLoaded) {
        return (
            <div className="">
                <div >
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
                                    <li>Dashboard</li>
                                    <li>Paddy Quality Parameter</li>

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
                                    <div className="search-filter-left ">
                                        <div className="search-bars mb-4">
                                            <label className='text-md font-bold'>{translations.transactions.date}:</label> <span className='text-sm ml-5'>{data ? dateFormatter(data.process?.date) : ''}</span>
                                        </div>
                                    </div>
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

                                        <div className="search-filter-right">
                                            <button className="py-1.5 px-4 bg-gray-100 rounded border text-sm" onClick={() => router.push("/mill/quality-parameter/cotton-quality-parameter")} >{translations.common.back}</button>
                                        </div>
                                    </div>
                                    <CommonDataTable data={data} columns={columns} count={count} updateData={updatePage} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )
    };
}
