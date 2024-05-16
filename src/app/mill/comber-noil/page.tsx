"use client";
import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { FaDownload, FaEye } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import User from "@lib/User";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";

export default function page() {
  const router = useRouter();
  useTitle("Comber Noil");
  const spinnerId = User.MillId;
  const [roleLoading, hasAccesss] = useRole();
  const [Access, setAccess] = useState<any>({});

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);

  const code = encodeURIComponent(searchQuery);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Mill")) {
      const access = checkAccess("Comber Noil");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    if (spinnerId) {
      fetchComberNoil();
    }
  }, [searchQuery, spinnerId]);

  const fetchComberNoil = async () => {
    try {
      const response = await API.get(
        `mill-process/comber-noil?spinnerId=${spinnerId}&limit=${limit}&page=${page}&search=${code}&pagination=true`
      );
      if (response.success) {
        setData(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.error(error);
      setCount(0);
    }
  };
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div>  <Loader /></div>;
  }
  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: translations.comberNoil.batchLotNo,
      selector: (row: any) => row.batch_lot_no,
    },
    {
      name: translations.program,
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: translations.comberNoil.quantity,
      selector: (row: any) => row.comber_noil,
    },
    {
      name: translations.comberNoil.avaialableQty,
      selector: (row: any) => row.comber_noil_stock,
    },
  ];

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  

  if (!roleLoading && Access.view) {
    return (
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/mandi/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Home</li>
                <li>Process</li>
                <li>Comber Noil</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="table-minwidth w-100">
                {/* search */}
                <div className="search-filter-row">
                  <div className="search-filter-left ">
                    <div className="search-bars">
                      <form className="form-group mb-0 search-bar-inner">
                        <input
                          type="text"
                          className="form-control form-control-new jsSearchBar "
                          placeholder="Search "
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
    );
  }
}
