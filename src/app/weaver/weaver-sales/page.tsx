"use client";
import React, { useState, useEffect, useRef } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { FaDownload, FaEye } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import moment from "moment";
import User from "@lib/User";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import { LuEdit } from "react-icons/lu";

export default function page() {
  const router = useRouter();
  useTitle("Sales");
  const [roleLoading, hasAccess] = useRole();
  const [Access, setAccess] = useState<any>({});

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);
  const code = encodeURIComponent(searchQuery);
  const weaverId = User.LabId;


  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
      const access = checkAccess("Weaver Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (weaverId) {
      fetchProcess();
    }
  }, [searchQuery, page, limit, weaverId]);

  const fetchProcess = async () => {
    try {
      const response = await API.get(
        `weaver-process?weaverId=${weaverId}&limit=${limit}&page=${page}&search=${code}&pagination=true`
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

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
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

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const fetchExport = async () => {
    try {
      const res = await API.get(
        `weaver-process/export?weaverId=${weaverId}&search=${code}`
      );
      if (res.success) {
        handleDownload(res.data, "Weaver Sales Report", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };

  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    const fileName = (item: any) => {
      let file = item.split("file/");
      return file ? file[1] : "";
    };
    const columnsArr: any = [
      {
        name: <p className="text-[13px] font-medium">S. No</p>,
        width: "70px",
        cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      },
      {
        name: <p className="text-[13px] font-medium">File</p>,
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: <p className="text-[13px] font-medium">Action</p>,
        selector: (row: any) => (
          <>
            <div className="flex items-center">
              <FaEye
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer mr-2"
                onClick={() => handleView(row)}
              />
              <FaDownload
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer"
                onClick={() => handleDownloadData(row, "Blend Document")}
              />
            </div>
          </>
        ),
        center: true,
        wrap: true,
      },
    ];

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">Invoice Files</h3>
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
                        <DataTable
                          columns={columnsArr}
                          data={dataArray}
                          persistTableHead
                          fixedHeader={true}
                          noDataComponent={
                            <p className="py-3 font-bold text-lg">
                              No data available in table
                            </p>
                          }
                          fixedHeaderScrollHeight="600px"
                        />
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

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div>  <Loader /></div>;
  }
  const columns = [
    {
      name: <p className="text-[13px] font-medium">S. No</p>,
      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      width: "120px",
      center: true,
      cell: (row: any) => dateFormatter(row.date),
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      cell: (row: any) => row.season?.name,
      sortable: false,
      center: true,
    },
    {
      name: <p className="text-[13px] font-medium">Sold To</p>,
      cell: (row: any) =>
        row.buyer_id
          ? row.buyer?.name
          : row.fabric_id
            ? row.dyingwashing?.name
            : row.processor_name,
      sortable: false,
      wrap: true,
      center: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Garment Order Reference No.</p>
      ),
      cell: (row: any) => row.garment_order_ref,
      wrap: true,
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Brand Order Reference No.</p>
      ),
      cell: (row: any) => row.brand_order_ref,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      cell: (row: any) => row.invoice_no,
      sortable: false,
      wrap: true,
      center: true,
    },
    {
      name: <p className="text-[13px] font-medium">Batch/Lot No</p>,
      cell: (row: any) => row.batch_lot_no,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Fabric Quantity (in Mts)
        </p>
      ),
      cell: (row: any) => row.total_yarn_qty,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      cell: (row: any) => row.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">Vehicle No</p>,
      cell: (row: any) => row.vehicle_no,
    },
    {
      name: <p className="text-[12px] font-medium">Transaction via Trader</p>,
      selector: (row: any) => (row.transaction_via_trader ? "Yes" : "No"),
    },
    {
      name: <p className="text-[13px] font-medium">Agent Details</p>,
      cell: (row: any) => row.transaction_agent,
      sortable: false,
      center: true,
    },
    {
      name: <p className="text-[13px] font-medium">TC File</p>,
      cell: (row: any) =>
        row.tc_file && (
          <>
            <FaEye
              size={18}
              className="text-black  hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleView(row.tc_file)}
            />
            <FaDownload
              size={18}
              className="text-black  hover:text-blue-600 cursor-pointer"
              onClick={() => handleDownloadData(row.tc_file, "tc_file")}
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Contract Files</p>,
      cell: (row: any) =>
        row.contract_file && (
          <>
            <FaEye
              size={18}
              className="text-black  hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleView(row.contract_file)}
            />
            <FaDownload
              size={18}
              className="text-black  hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.contract_file, "contract_file")
              }
            />
          </>
        ),
    },

    {
      name: <p className="text-[13px] font-medium">InVoice Files</p>,
      cell: (row: any) =>
        row.invoice_file &&
        row.invoice_file.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row.invoice_file)}
              title="Click to view all files"
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Delivery Notes</p>,
      cell: (row: any) =>
        row.delivery_notes && (
          <>
            <FaEye
              size={18}
              className="text-black  hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleView(row.delivery_notes)}
            />
            <FaDownload
              size={18}
              className="text-black  hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.delivery_notes, "delivery_notes")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Status</p>,
      cell: (row: any) => <p>{row.status}</p>,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.mandiInterface.qrCode}
        </p>
      ),
      cell: (row: any) => (
        <>
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
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.action}
        </p>
      ),
      cell: (row: any) => (
        <button
          className="bg-green-500 p-2 rounded"
          onClick={() => router.push(`/weaver/weaver-sales/edit-weaver-sales?id=${row.id}`)}
        >
          <LuEdit size={18} color="white" />
        </button>
      )
    }
  ];

  if (roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access?.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.view) {
    return (
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/weaver/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Sales</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="table-minwidth">
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
                  <div className="flex gap-4">
                    <button
                      className=" py-1.5 px-4 rounded-lg bg-yellow-500 text-white font-bold text-sm"
                      onClick={fetchExport}
                    >
                      Sales Report
                    </button>
                    {Access?.create && (
                      <button
                        className="btn btn-all btn-purple"
                        onClick={() =>
                          router.push("/weaver/weaver-sales/add-weaver-sales")
                        }
                      >
                        New Sale
                      </button>
                    )}
                  </div>
                </div>
                <DocumentPopup
                  openFilter={showFilter}
                  dataArray={dataArray}
                  onClose={() => setShowFilter(false)}
                />

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
