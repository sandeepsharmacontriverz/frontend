"use client";
import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import CommonDataTable from "@components/core/Table";
import User from "@lib/User";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa6";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";

export default function page() {
  const [roleLoading] = useRole();
  useTitle("Barcode");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const brandId = User.brandId;

  const code = encodeURIComponent(searchQuery);

  const { translations, loading } = useTranslations();

  useEffect(() => {
    if (brandId) {
      getTransaction();
    }
  }, [brandId, page, limit, code]);

  const getTransaction = async () => {
    try {
      const response = await API.get(
        `reports/get-Qr-track-report?brandId=${brandId}&search=${code}&limit=${limit}&page=${page}&pagination=true`
      );

      if (response.success) {
        setData(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setCount(0);
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

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

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
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
      name: <p className="text-[13px] font-medium">Sr No.</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
      width: "70px",
    },
    {
      name: translations?.mandiInterface?.qrCode,
      center: true,
      cell: (row: any) => (
        <div className="h-16 flex">
          <img
            className=""
            src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
          />

          <button
            className=""
            onClick={() =>
              handleDownload(
                process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
                "qr",
                ".png"
              )
            }
          >
            <FaDownload size={18} color="black" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      selector: (row: any) => row.invoice_no,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Garment Type</p>,
      selector: (row: any) =>
        row.garment_type?.map((item: any) => item).join(", "),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Style/Mark No</p>,
      selector: (row: any) =>
        row.style_mark_no?.map((item: any) => item).join(", "),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Total No. of Pieces</p>,
      selector: (row: any) =>
        row.total_no_of_pieces,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">Action</p>,
      selector: (row: any) => (
        <>
          <div className="flex items-center">
            <FaEye
              size={18}
              className="text-black  hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleView(`/brand/qr-details/garment-sales?id=${row.id}`)}
            />
          </div>
        </>
      ),
      center: true,
      wrap: true,
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/brand/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Brand</li>
                <li>Barcode</li>
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
