"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import NavLink from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import CommonDataTable from "@components/core/Table";

import User from "@lib/User";
import API from "@lib/Api";
import { AiFillDelete } from "react-icons/ai";
import useTranslations from "@hooks/useTranslation";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import Link from "@components/core/nav-link";

export default function page() {
  useTitle("Compacting Process");
  const router = useRouter();
  const [roleLoading, hasAccesss] = useRole();
  const { translations, loading } = useTranslations();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [dataInvoiceList, setDataInvoiceList] = useState<Array<string>>([]);
  const code = encodeURIComponent(searchQuery);
  const [Access, setAccess] = useState<any>({});

  const fabricId = User.fabricId;
  useEffect(() => {
    if (fabricId) {
      fetchSales();
    }
  }, [searchQuery, page, limit, fabricId]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Fabric")) {
      const access = checkAccess("Fabric Compacting Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  const fetchSales = async () => {
    try {
      const response = await API.get(
        `fabric-process/compacting-process?fabricId=${fabricId}&search=${searchQuery}&limit=${limit}&page=${page}&pagination=true`
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

  const fetchExport = async () => {
    const url = `fabric-process/export-compacting-process?fabricId=${fabricId}&page=${page}&limit=${limit}&search=${code}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        if (response.data) {
          handleDownload(response.data, "Compacting_Report", ".xlsx");
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  if (loading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataInvoiceList(rowData);
    setShowInvoiceList(!showInvoiceList);
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

  const DocumentPopup = ({ openFilter, dataInvList, onClose, type }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const fileName = (item: any) => {
      let file = item.split("file/");
      return file ? file[1] : "";
    };

    const columnsArr: any = [
      {
        name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: <p className="text-[13px] font-medium">{translations?.knitterInterface?.File}</p>,
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: <p className="text-[13px] font-medium">{translations?.common?.Action}</p>,
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
                onClick={() => handleDownloadData(row, "Cotton-connect|Invoice File")}
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
                  <h3 className="text-lg pb-2">{translations?.common?.InVoiceFiles}</h3>
                  <button
                    className="text-[20px]"
                    onClick={() => setShowInvoiceList(!showInvoiceList)}
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
                          data={dataInvList}
                          persistTableHead
                          fixedHeader={true}
                          noDataComponent={"No data available in table"}
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

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S. No</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      selector: (row: any) => row.date?.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Fabric Processor Type </p>,
      selector: (row: any) => row.buyer_type,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Sold To </p>,
      selector: (row: any) =>
        row.buyer?.name ? row.buyer?.name : row.processor_name,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No </p>,
      selector: (row: any) => row.invoice_no,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">View Invoice</p>,
      center: true,
      cell: (row: any) =>
        row?.invoice_files &&
        row?.invoice_files.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row?.invoice_files)}
              title="Click to View All Files"
            />
          </>
        ),
      wrap: true,
      width: "120px"
    },
    {
      name: <p className="text-[13px] font-medium">Batch/Lot No</p>,
      // selector: (row: any) => row.batch_lot_no,
      selector: (row: any) => (
        <Link
          href={`/fabric/view-tracing?batch_lot_no=${row?.batch_lot_no}&type=compacting`}
          className="hover:text-blue-600 text-blue-500"
        >
          {row?.batch_lot_no}
        </Link>
      ),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Compacted Fabric Quantity</p>
      ),
      wrap: true,
      selector: (row: any) => row.total_fabric_quantity,
    },
    // {
    //   name: <p className="text-[13px] font-medium">Knit/ Woven Fabric Type</p>,
    //   wrap: true,
    // },
    {
      name: <p className="text-[13px] font-medium">Length in Mts </p>,
      selector: (row: any) => row.fabric_length,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Finished Fabric GSM </p>,
      selector: (row: any) => row.gsm,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Fabric Net Weight (Kgs)</p>,
      selector: (row: any) => row.fabric_net_weight,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Program </p>,
      selector: (row: any) => row.program?.program_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Status </p>,
      selector: (row: any) => row.status,
      wrap: true,
    },
    {
      name: translations?.mandiInterface?.qrCode,
      center: true,
      cell: (row: any) => row?.qr && (
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
      name: translations.menuEntitlement.delete,
      cell: (row: any) => (
        <>
          {row.status === "Pending" && (
            <button
              onClick={() => handleDelete(row.id)}
              className="bg-red-500 p-2 ml-3 rounded"
            >
              <AiFillDelete size={18} color="white" />
            </button>
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };
  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  if (loading || roleLoading) {
    return <Loader />;
  }

  if (!roleLoading && !Access?.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  return (
    <div>
      {showDeleteConfirmation && (
        <DeleteConfirmation
          message="Are you sure you want to delete this?"
          onDelete={async () => {
            if (deleteItemId !== null) {
              const url = "fabric-process/delete-compacting-process";
              try {
                const response = await API.delete(url, {
                  id: deleteItemId,
                });
                if (response.success) {
                  toasterSuccess(
                    "Record has been deleted successfully",
                    3000,
                    deleteItemId
                  );
                  fetchSales();
                } else {
                  toasterError("Failed to delete record");
                }
              } catch (error) {
                console.log(error, "error");
                toasterError("An error occurred");
              }
              setShowDeleteConfirmation(false);
              setDeleteItemId(null);
            }
          }}
          onCancel={handleCancel}
        />
      )}
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li className="active">
                <NavLink href="/fabric/dashboard">
                  <span className="icon-home"></span>
                </NavLink>
              </li>
              <li>Process</li>
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
                <div className="flex gap-4 flex-wrap">
                  <button
                    className=" py-1.5 px-4 rounded-lg bg-yellow-500 text-white font-bold text-sm"
                    onClick={fetchExport}
                  >
                    Compacting Process Report
                  </button>
                  {Access?.create &&
                    <button
                      className="btn btn-all btn-purple"
                      onClick={() => {
                        router.push("/fabric/compacting-process/new-process");
                        sessionStorage.removeItem("fabricData");
                        sessionStorage.removeItem("chooseFabric");
                      }}
                    >
                      New Process
                    </button>}
                </div>
              </div>
              <DocumentPopup
                openFilter={showInvoiceList}
                dataInvList={dataInvoiceList}
                onClose={() => setShowInvoiceList(false)}
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
