"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa";
import checkAccess from "@lib/CheckAccess";
import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import User from "@lib/User";
import API from "@lib/Api";
import Loader from "@components/core/Loader";
import { LuEdit } from "react-icons/lu";
import Link from "@components/core/nav-link";

export default function page() {
  const { translations, loading } = useTranslations();
  useTitle(translations?.knitterInterface?.Process);
  const router = useRouter();
  const [roleLoading, hasAccesss] = useRole();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const code = encodeURIComponent(searchQuery);
  const garmentId = User.garmentId;
  const [isAdmin, setIsAdmin] = useState<any>(false);
  const [Access, setAccess] = useState<any>({});


  useEffect(() => {
    const isAdminData: any = sessionStorage.getItem("User") && localStorage.getItem("orgToken");
    if (isAdminData?.length > 0) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
      const access = checkAccess("Garment Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    if (garmentId) {
      fetchSales();
    }
  }, [searchQuery, page, limit, garmentId]);

  const fetchSales = async () => {
    try {
      const response = await API.get(
        `garment-sales/process?garmentId=${garmentId}&pagination=true&search=${code}&limit=${limit}&page=${page}`
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
  const fetchExport = async () => {
    try {
      const res = await API.get(
        `garment-sales/export-process?garmentId=${garmentId}`
      );
      if (res.success) {
        handleDownload(res.data, "Process Report", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  if (loading) {
    return <div> <Loader /> </div>;
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.transactions?.date}</p>,
      selector: (row: any) => row.date?.substring(0, 10),
      wrap: true,
      width: "120px"
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.seasonName}</p>,
      selector: (row: any) => row.season?.name,
      wrap: true,
    },

    {
      name: <p className="text-[13px] font-medium">{translations?.knitterInterface?.BrandOrderReference}</p>,
      selector: (row: any) => row.brand_order_ref || "-",
      wrap: true,
      width: "120px"
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.FabricOrderRef}</p>,
      selector: (row: any) => row.fabric_order_ref || "-",
      wrap: true,
      width: "120px"

    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.FactoryLotNo}</p>,
      selector: (row: any) => row.factory_lot_no,
      wrap: true,
      width: "120px"

    },
    {
      name: <p className="text-[13px] font-medium">{translations?.mandiInterface?.reelLotNo}</p>,
      // selector: (row: any) => row.reel_lot_no,
      selector: (row: any) => (
        <Link
          href={`/garment/process/view-tracing?reel_lot_no=${row?.reel_lot_no}`}
          className="hover:text-blue-600 text-blue-500"
        >
          {row?.reel_lot_no}
        </Link>
      ),
      wrap: true,
      width: "120px"

    },
    {
      name: <p className="text-[13px] font-medium">{translations?.ticketing?.styleMark}</p>,
      selector: (row: any) => row.style_mark_no?.join(","),
      wrap: true,
      width: "160px"

    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.productType}</p>,
      selector: (row: any) => row.garment_type?.join(","),
      wrap: true,
      width: "160px"

    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.productSize}</p>,
      selector: (row: any) => row.garment_size?.join(","),
      wrap: true,
      width: "160px"

    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.color}</p>,
      selector: (row: any) => row.color?.join(","),
      wrap: true,
      width: "160px"

    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.noofPieces}</p>,
      selector: (row: any) => row.no_of_pieces?.join(","),
      wrap: true,
      width: "160px"

    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.noOfBoxes} </p>,
      selector: (row: any) => row.no_of_boxes?.join(","),
      wrap: true,
      width: "160px"

    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.totalLength}
        </p>
      ),
      selector: (row: any) => row.fabric_length,
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.totalWeigh}
        </p>
      ),
      selector: (row: any) => row.fabric_weight,
      wrap: true,
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.program}</p>,
      selector: (row: any) => row.program?.program_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium"> {translations?.common?.embOtherProcess}
        </p>
      ),
      cell: (row: any) => (
        <>
          {row.embroidering_required === true ? (
            <NavLink
              href={`/garment/process/embroidering-view?id=${row.embroidering_id}`}
            >
              <FaEye size={18} />
            </NavLink>
          ) : null}
        </>
      ),
      wrap: true,
      width: "130px",
    },

    {
      name: <p className="text-[13px] font-medium">{translations?.mandiInterface?.qrCode}</p>,
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
                "QR",
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
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,
      selector: (row: any) => row.status,
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: translations?.common?.action,
      cell: (row: any) => Access?.edit && row.status === "Pending" && (
        <button
          className="bg-green-500 p-2 rounded "
          onClick={() =>
            router.push(
              `/garment/process/edit-new-process?id=${row.id}`
            )
          }
        >
          <LuEdit size={18} color="white" />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];
  if (!roleLoading && !Access.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access.view) {
    return (
      <>
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li className="active">
                    <NavLink href="/garment/dashboard">
                      <span className="icon-home"></span>
                    </NavLink>
                  </li>
                  <li>{translations?.knitterInterface?.Process}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="table-minwidth min-w-[650px]">
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
                  <div className="space-x-4">
                    <button
                      className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                      onClick={fetchExport}
                    >
                      {translations?.millInterface?.processReport}
                    </button>
                    {Access.create &&
                      <button
                        className="btn btn-all btn-purple"
                        onClick={() =>
                          router.push("/garment/process/new-process")
                        }
                      >
                        {translations?.millInterface?.newProcess}
                      </button>
                    }
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
      </>
    );
  }
}
