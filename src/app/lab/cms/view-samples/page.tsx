"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useRole from '@hooks/useRole';
import useTitle from '@hooks/useTitle';
import useTranslations from '@hooks/useTranslation';
import Loader from '@components/core/Loader';
import CommonDataTable from '@components/core/Table';
import API from '@lib/Api';
import { useRouter } from '@lib/router-events';
import { FaDownload, FaEye } from 'react-icons/fa';

const LabCmsViewSamples = () => {
    useTitle("View Samples");

    const [roleLoading] = useRole();
    const router = useRouter();
    const { translations, loading } = useTranslations();

    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [data, setData] = useState<Array<any>>([]);
    const [count, setCount] = useState<number>();
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    const searchData = (e: any) => {
        setSearchQuery(e.target.value);
    };

    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page);
        setLimit(limitData);
    };

    const fetchCmsSamples = async () => {
        try {
            const res = await API.get(`lab-report/container-samples?cmsSampleId=${id}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
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
        if (id) {
            fetchCmsSamples();
        }
    }, [searchQuery, page, limit, id]);

    if (loading || roleLoading) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    
  const handleDownloadData = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const blobURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobURL);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

    const columns = [
        // {
        //     name: translations?.common?.srNo,
        //     cell: (row: any, index: any) => (page - 1) * limit + index + 1,
        //     width: '100px',
        //     wrap: true
        // },
        {
            name: (<p className="text-[13px] font-medium">Sample Name</p>),
            selector: (row: any) => row.sample_name,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Sample File</p>,
            wrap: true,
            cell: (row: any) => (
              <>
                {row.sample_upload && (
                  <div className='flex gap-2'>
                    <FaEye
                      size={18}
                      className="text-black hover:text-blue-600 cursor-pointer"
                      onClick={() => handleView(row.sample_upload)}
                    />
                    <FaDownload
                      size={18}
                      className="text-black hover:text-blue-600 cursor-pointer"
                      onClick={() => handleDownloadData(row.sample_upload, "Sample Upload")}
                    />
                  </div>
                )}
              </>
            ),
          },
        {
            name: (<p className="text-[13px] font-medium">Sample Result</p>),
            selector: (row: any) => row.sample_status,
            wrap: true,
        }
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
                                    <li>
                                        <Link href="/lab/cms" className="active">
                                            Container Management System
                                        </Link>
                                    </li>
                                    <li>View Samples</li>
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
                                        </div>
                                        <div className="flex">
                                            <div className="search-filter-right customButtonGroup">
                                                <button
                                                    className="btn-outline-purple"
                                                    onClick={() => router.push('/lab/cms')}
                                                >
                                                    {translations.common.back}
                                                </button>
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

export default LabCmsViewSamples;