"use client";
import React, { useState, useEffect, useRef } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import NavLink from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { FaDownload, FaEye } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import User from "@lib/User";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { AiFillDelete } from "react-icons/ai";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import Link from "@components/core/nav-link";
import { LuFileEdit } from "react-icons/lu";
import moment from "moment";

export default function page() {
  const router = useRouter();
  useTitle("Mandi Sale");
  const [roleLoading, hasAccess] = useRole();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [Access, setAccess] = useState<any>({});

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const MandiId = User.MandiId;
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Mandi")) {
      const access = checkAccess("Mandi Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (MandiId) {
      fetchSales();
    }
  }, [searchQuery, page, limit, MandiId]);

  useEffect(() => {
    const isAdminData: any =
      sessionStorage.getItem("User") && localStorage.getItem("orgToken");
    if (isAdminData?.length > 0) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [isAdmin]);

  const fetchSales = async () => {
    try {
      const response = await API.get(
        `mandi-process/sales?mandiId=${MandiId}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
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
  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
  };

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
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
        `mandi-process/sales/export?mandiId=${MandiId}&search=${searchQuery}`
      );
      if (res.success) {
        handleDownload(res.data, "Sales Report", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const fileName = (item: any) => {
      let file = item.split("file/");
      return file ? file[1] : "";
    };
    const columnsArr: any = [
      {
        name: (
          <p className="text-[13px] font-medium">
            {translations?.common?.srNo}
          </p>
        ),
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: (
          <p className="text-[13px] font-medium">
            {translations?.knitterInterface?.File}
          </p>
        ),
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: (
          <p className="text-[13px] font-medium">
            {translations?.common?.Action}
          </p>
        ),
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
                onClick={() => handleDownloadData(row, "Invoice File")}
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
                  <h3 className="text-lg pb-2">
                    {translations?.common?.InVoiceFiles}
                  </h3>
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
  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };
  const { translations, loading } = useTranslations();

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S. No</p>,

      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">Created Date</p>,
      cell: (row: any) => dateFormatter(row?.createdAt),
      wrap: true,
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      selector: (row: any) => dateFormatter(row?.date),
      width: "120px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      selector: (row: any) => row?.season?.name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      wrap: true,
      selector: (row: any) => row?.invoice_no,
    },
    {
      name: <p className="text-[13px] font-medium">Sold To</p>,
      wrap: true,
      width: "160px",
      selector: (row: any) => row?.buyerdata?.name,
    },
    {
      name: <p className="text-[13px] font-medium">No of Bags</p>,
      selector: (row: any) => row?.no_of_bags,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Bag Lot</p>,
      wrap: true,
      selector: (row: any) => row?.lot_no,
    },
    {
      name: <p className="text-[13px] font-medium">Bag No</p>,
      selector: (row: any) => row?.bag_press_no,
      cell: (row: any) => (
        <NavLink href={`/mandi/sales/view-sale?id=${row.id}`}>
          <span
            className="hover:text-blue-600 text-blue-500"
            rel="noopener noreferrer"
          >
            {row.bag_press_no}
          </span>
        </NavLink>
      ),
      wrap: true,
      width: "120px",
    },

    {
      name: <p className="text-[13px] font-medium">REEL Lot No</p>,
      // selector: (row: any) => row?.reel_lot_no,
      selector: (row: any) => (
        // <Link
        //   href={`/mandi/mandi-process/view-tracing?reelLotNo=${row?.reel_lot_no}`}
        //   className="hover:text-blue-600 text-blue-500"
        // >
          row?.reel_lot_no
        // </Link>
      ),
      wrap: true,
      width: "160px",
    },
    {
      name: <p className="text-[13px] font-medium">Rate/KG</p>,
      selector: (row: any) => row?.rate,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Total Weight</p>,
      selector: (row: any) => row.total_qty,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      selector: (row: any) => row?.program?.program_name,
      wrap: true,
    },
    // {
    //   name: "Village",
    //   // selector: (row: any) => ,
    // },
    {
      name: <p className="text-[13px] font-medium">Vehicle No</p>,
      wrap: true,
      selector: (row: any) => row?.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">Transaction via Trader</p>,
      selector: (row: any) => (row?.transaction_via_trader ? "Yes" : "No"),
      wrap: true,
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">Agent Details</p>,
      wrap: true,
      selector: (row: any) => row?.transaction_agent,
    },
    {
      name: <p className="text-[13px] font-medium">TC File</p>,
      center: true,
      cell: (row: any) =>
        row.tc_file && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row?.tc_file)}
            />
            <FaDownload
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={() => handleDownloadData(row?.tc_file, "tcFile")}
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Contract Files</p>,
      center: true,
      cell: (row: any) =>
        row.contract_file && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row?.contract_file)}
            />
            <FaDownload
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={() =>
                handleDownloadData(row?.contract_file, "contractFile")
              }
            />
          </>
        ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.InVoiceFiles}
        </p>
      ),
      cell: (row: any) =>
        row?.invoice_file &&
        row?.invoice_file.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row?.invoice_file)}
              title="Click to View All Files"
            />
          </>
        ),
    },

    {
      name: <p className="text-[13px] font-medium">Delivery Notes</p>,
      selector: (row: any) => row?.delivery_notes,
      cell: (row: any) => {
        return (
          <>
            {row.delivery_notes ? (
              <>
                <FaEye
                  size={18}
                  className="text-black hover:text-blue-600 cursor-pointer"
                  onClick={() => handleView(row?.delivery_notes)}
                />
                <FaDownload
                  size={18}
                  className="text-black hover:text-blue-600 cursor-pointer ml-2"
                  onClick={() =>
                    handleDownloadData(row?.delivery_notes, ".png")
                  }
                />
              </>
            ) : (
              ""
            )}
          </>
        );
      },
    },
    {
      name: <p className="text-[13px] font-medium">Status</p>,
      cell: (row: any) =>
        row.status === "To be Submitted" && Access.create ? (
          <button
            onClick={() =>
              router.push(`/mandi/sales/mandi-submitted?id=${row.id}`)
            }
            className="bg-yellow-500 px-1 py-1 rounded text-white "
          >
            {row.status}
          </button>
        ) : (
          row.status
        ),
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">QR Code</p>,
      center: true,
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
      name: translations?.common?.action,
      right: true,
      cell: (row: any) => (
        <>
          {/* {row.status !== "To be Submitted" &&  */}
          {/* {row.status !== "To be Submitted" && Access.edit && (
            <button
              className="bg-green-500 p-2 rounded "
              onClick={() =>
                router.push(`/mandi/sales/edit-bag-sale?id=${row.id}`)
              }
            >
              <LuFileEdit size={18} color="white" />
            </button>
          )} */}
          {row.status === "Sold" && !isAdmin ? (
            ""
          ) : (
            <button
              onClick={() => handleDelete(row.id)}
              className={`bg-red-500 p-2 rounded ${
                row.status !== "To be Submitted" && "ml-3"
              }`}
            >
              <AiFillDelete size={18} color="white" />
            </button>
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ].filter(Boolean);

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  if (loading || roleLoading) {
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
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "mandi-process/sales";
                try {
                  const response = await API.delete(url, {
                    id: deleteItemId,
                  });
                  if (response.success) {
                    toasterSuccess("Record has been deleted successfully");
                    fetchSales();
                  } else {
                    toasterError(response.error.code, 5000, deleteItemId);
                  }
                } catch (error) {
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
                  <NavLink href="/mandi/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li> Sale</li>
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
                  <div className="space-x-4">
                    <button
                      className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                      onClick={fetchExport}
                    >
                      {translations?.knitterInterface?.salereport}
                    </button>
                    {Access.create && (
                      <button
                        className="btn btn-all btn-purple"
                        onClick={() =>
                          router.push("/mandi/sales/add-paddy-sale")
                        }
                      >
                        {translations?.knitterInterface?.newsale}
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
