"use client"
import { useRouter } from '@lib/router-events';
import { useState, useEffect } from "react";
import useTranslations from '@hooks/useTranslation';

import useTitle from '@hooks/useTitle';
import useRole from '@hooks/useRole';
import Link from '@components/core/nav-link';
import DataTable from 'react-data-table-component';

import { BiCheck } from 'react-icons/bi';
import { RxCross2 } from 'react-icons/rx';
import Loader from '@components/core/Loader';

export default function Page() {
    useTitle("Upload Status")
    const [roleLoading] = useRole();
    const router = useRouter();

    const [isClient, setIsClient] = useState(false)
    const [data, setData] = useState<any>([]);

    const [passData, setPassData] = useState(0);
    const [failCount, setFailCount] = useState(0);

    const [visibleMessage, setVisibleMessage] = useState({
        div1: true,
        div2: true,
    });

    const handleCrossClick = (divId: any) => {
        setVisibleMessage((prevVisibleDivs) => ({
            ...prevVisibleDivs,
            [divId]: false,
        }));
    };


    const pass: any = localStorage.getItem("pass");
    const query: any = localStorage.getItem("fail") || null;
    const failLength: any = localStorage.getItem("failCount");

    const decodedData = JSON.parse(query);

    const fetchData = () => {
        try {
            if (pass && decodedData) {
                setPassData(pass);
                setData(decodedData);
                setFailCount(failLength);
                localStorage.removeItem("pass");
                localStorage.removeItem("fail");
                localStorage.removeItem("failCount");
            }
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        fetchData();
        setIsClient(true)

    }, [])

    const { translations, loading } = useTranslations();
    if (loading) {
        return <div> <Loader /> </div>;
    }
    const columns = [
        {
            name: translations.common.srNo,
            cell: (row: any, index: number) => index + 1,
            sortable: false,
        },
        {
            name: 'Farmer Name',
            cell: (row: any) => row.data?.farmerName,
            sortable: false,
        },
        {
            name: 'Farmer Code',
            cell: (row: any) => row.data?.farmerNo,
            sortable: false,
        },
        {
            name: translations.common.error,
            cell: (row: any) => (
                <span >
                    {row.message}
                </span>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
        },

    ].filter(Boolean);

    if (!roleLoading) {
        return (
            <div className="">
                {isClient ?
                    (
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
                                            <li>services</li>
                                            <li>
                                                <Link href="/services/upload-linen">Upload Linen</Link>
                                            </li>
                                            <li>Upload Status</li>
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
                                            <div className="flex justify-end">
                                                <button className="btn btn-all border" onClick={() => {
                                                    router.push("/services/upload-linen");
                                                    localStorage.removeItem("pass");
                                                    localStorage.removeItem("fail");
                                                }} >{translations.common.back}</button>
                                            </div>
                                            {passData > 0 && visibleMessage.div1 &&
                                                <div className='w-auto bg-green-600 h-14 rounded-md my-2 flex items-center px-3 justify-between'>
                                                    <div className='flex'>
                                                        <BiCheck color='white' size={24} />
                                                        <span className='text-white ml-3'>{passData} records has been added.</span>
                                                    </div>
                                                    <button onClick={() => handleCrossClick('div1')}><RxCross2 color='black' /></button>

                                                </div>
                                            }
                                            {data?.length > 0 && visibleMessage.div2 &&
                                                <div className='w-auto bg-red-600 h-14 my-3 rounded-md flex items-center px-3 justify-between'>
                                                    <div className='flex'>
                                                        <RxCross2 color='white' size={24} />
                                                        <span className='text-white ml-3'> Failed to insert {failCount} record(s).</span>
                                                    </div>
                                                    <button onClick={() => handleCrossClick('div2')}><RxCross2 color='black' /></button>

                                                </div>
                                            }
                                            <span className='text-[28px]'>Failed Records</span>
                                            <div className='flex justify-center items-center'>
                                                <DataTable
                                                    persistTableHead
                                                    fixedHeader={true}
                                                    noDataComponent={<p className="py-3 font-bold text-lg">
                                                        No data available in table
                                                    </p>}
                                                    fixedHeaderScrollHeight='500px'
                                                    columns={columns}
                                                    data={data}
                                                    responsive
                                                    progressPending={loading}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )
                    : 'Loading...'}
            </div>
        )
    };
}

