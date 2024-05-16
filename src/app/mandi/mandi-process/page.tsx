"use client";
import { useRouter } from "@lib/router-events";
import { useState, useEffect } from "react";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";

import { FaDownload, FaEye } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { toasterError, toasterSuccess } from "@components/core/Toaster";

import { handleDownload } from "@components/core/Download";
import moment from "moment";
import User from "@lib/User";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import { LuFileEdit } from "react-icons/lu";
import CheckProcessPopup from "@components/core/CheckProcessPopup";
import ModalLoader from "@components/core/ModalLoader";

export default function Page() {
  useTitle("Paddy Process");
  const MandiId = User.MandiId;

  const [roleLoading, hasAccesss] = useRole();
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const { translations, loading } = useTranslations();
  const [processAcesss, setProcessAcesss] = useState<any>({
    open: false,
    access: false,
  });

  useEffect(() => {
    const isAdminData: any =
      sessionStorage.getItem("User") && localStorage.getItem("orgToken");
    if (isAdminData?.length > 0) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Mandi")) {
      const access = checkAccess("Mandi Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    if (MandiId) {
      fetchProcesses();
      setIsClient(true);
    }
  }, [searchQuery, page, limit, MandiId]);


  const fetchProcesses = async () => {
    try {
      const res = await API.get(
        `mandi-process?mandiId=${MandiId}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
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

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };
  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,

      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: "70px",
      wrap: true,
    },

    {
      name: <p className="text-[13px] font-medium">Created Date</p>,
      cell: (row: any) => dateFormatter(row?.createdAt),
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.date}
        </p>
      ),
      cell: (row: any) => dateFormatter(row?.date),
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.season}
        </p>
      ),
      selector: (row: any) => row?.season?.name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Lot No
        </p>
      ),
      selector: (row: any) => row?.lot_no,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Bag No
        </p>
      ),
      selector: (row: any) => (
        <Link
          href={`/mandi/mandi-process/view-bags?id=${row.id}`}
          className="hover:text-blue-600 text-blue-500"
        >
          {row?.mandi_press_no}
        </Link>
      ),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          REEL Lot No
        </p>
      ),
      selector: (row: any) => (
        // <Link
        //   href={`/mandi/mandi-process/view-tracing?reelLotNo=${row?.reel_lot_no}`}
        //   className="hover:text-blue-600 text-blue-500"
        // >
          row?.reel_lot_no
        // </Link>
      ),
      width: "200px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Heap Number</p>,
      selector: (row: any) => row?.heap_number,
      width: "200px",
      wrap: true,
    },

    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.mandiInterface?.noOfBales}
        </p>
      ),
      selector: (row: any) => row?.no_of_bags,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Paddy Quantity in bags (kgs)        </p>
      ),
      selector: (row: any) => row?.lint_quantity,
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.program}
        </p>
      ),
      selector: (row: any) => row?.program?.program_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.mandiInterface?.got}
        </p>
      ),
      selector: (row: any) => row?.mandi_out_turn,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Paddy Consumed(kgs)
        </p>
      ),
      selector: (row: any) => row?.total_qty,
      wrap: true,
      width: "130px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Farmer Name
        </p>
      ),
      selector: (row: any) =>
        row.farmer.map((item: any) =>
          (item?.farmer?.firstName || "") + (item?.farmer?.lastName ? " " + item?.farmer?.lastName : "")
        ).join(", "),
      wrap: true,
    },

    {
      name: (
        <p className="text-[13px] font-medium">
          Rice Variety
        </p>
      ),
      selector: (row: any) =>
        row.farmer.map((item: any) =>
          item?.rice_variety?.variety_name
        ),

      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Heap Register</p>,
      cell: (row: any) =>
        row.heap_register && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.heap_register)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.heap_register, "Heap Number")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Weigh Bridge Receipt</p>,
      cell: (row: any) =>
        row.weigh_bridge && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.weigh_bridge)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.weigh_bridge, "Weigh Bridge")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Delivery Challan</p>,
      cell: (row: any) =>
        row.delivery_challan && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.delivery_challan)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.delivery_challan, "Delivery Challan")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Paddy Process</p>,
      cell: (row: any) =>
        row.bag_process && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.bag_process)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.bag_process, "Paddy Process")
              }
            />
          </>
        ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.mandiInterface?.qrCode}
        </p>
      ),
      cell: (row: any) => (
        <>
          <img
            className=" w-20 h-16"
            src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
          />

          <button
            className=""
            onClick={() =>
              handleDownload(
                process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr,
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
      wrap: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.action}</p>,

      center: true,
      cell: (row: any) => (
        <>
          {/* {Access.edit && (
            <button
              className="bg-green-500 p-2 rounded "
              onClick={() =>
                router.push(
                  `/mandi/mandi-process/edit-mandi-process?id=${row.id}`
                )
              }
            >
              <LuFileEdit size={18} color="white" />
            </button>
          )} */}
          {isAdmin && (
            <button
              onClick={() => handleDelete(row?.id)}
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
  ].filter(Boolean);

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const fetchExport = async () => {
    const url = `mandi-process/export?mandiId=${MandiId}&search=${searchQuery}`;
    try {
      setIsDataLoading(true);
      const response = await API.get(url);
      if (response.success) {
        handleDownload(response.data, "Process Report", ".xlsx");
        setIsDataLoading(false);
      }
    } catch (error) {
      console.log(error, "error");
      setIsDataLoading(false);
    }
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
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
      <div className="">
        {isDataLoading ? (
          <div>
            <ModalLoader />
          </div>
        ) : null}
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "mandi-process";
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
                    fetchProcesses();
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
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li>
                    <Link href="/mandi/dashboard" className="active">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li> Paddy Process</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div>
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
                    {/* <div className="search-filter-right">
                           <button
                      className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                      onClick={fetchExport}
                      >
                      {translations?.millInterface?.processReport}
                    </button>
                      {Access?.create && (
                        <button
                          className="btn btn-all btn-purple"
                          onClick={() => {
                            processAcesss.access == true ?
                              setProcessAcesss({ ...processAcesss, open: true })
                              :
                              router.push(
                                "/ginner/ginner-process/add-ginner-process"
                              )
                          }
                          }
                        >
                          {translations?.mandiInterface?.newProcess}
                        </button>
                    )}
                      </div> */}
                       <div className="space-x-4">
                    <button
                      className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                        onClick={fetchExport}
                      >
                        {translations?.millInterface?.processReport}
                      </button>
                      {Access.create && (
                        <button
                          className="btn btn-all btn-purple"
                          onClick={() => {
                            // processAcesss.access == true
                            //   ? setProcessAcesss({
                            //     ...processAcesss,
                            //     open: true,
                            //   })
                            //   :
                            router.push(
                              "/mandi/mandi-process/add-mandi-process"
                            );
                          }}
                        >
                          {translations?.mandiInterface?.newProcess}
                        </button>
                      )}
                    </div>
                  </div>

                  <CommonDataTable
                    columns={columns}
                    count={count}
                    data={data}
                    updateData={updatePage}
                  />
                  <CheckProcessPopup
                    showModal={processAcesss.open}
                    setShowModal={setProcessAcesss}
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
