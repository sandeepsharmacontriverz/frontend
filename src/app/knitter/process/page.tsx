"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa";
import User from "@lib/User";
import API from "@lib/Api";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import { LuEdit } from "react-icons/lu";

export default function page() {
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();

  useTitle(translations?.knitterInterface?.Process);
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);
  const code = encodeURIComponent(searchQuery);
  const knitterId = User.ThirdPartyInspectionId;

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Knitter")) {
      const access = checkAccess("Knitter Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (knitterId) {
      fetchSales();
    }
  }, [searchQuery, page, limit, knitterId]);

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
  };
  const fetchSales = async () => {
    try {
      const response = await API.get(
        `knitter-process/process?knitterId=${knitterId}&search=${code}&limit=${limit}&page=${page}&pagination=true`
      );
      if (response.success) {
        setData(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.error(error);
      setCount(0)
    }
  };
  const fetchExport = async () => {
    try {
      const res = await API.get(`knitter-process/export-process?knitterId=${knitterId}&search=${searchQuery}`);
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

  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const fileName = (item: any) => {
      let file = item.split("file/")
      return file ? file[1] : ""
    }
    const columnsArr: any = [
      {
        name: (<p className="text-[13px] font-medium">{translations?.common?.srNo}</p>),
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.File}</p>),
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: (<p className="text-[13px] font-medium">{translations?.common?.Action}</p>),
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
                onClick={() => handleDownloadData(row, "Blend Material Other Document")}
              />
            </div>

          </>
        ),
        center: true,
        wrap: true,
      }
    ]

    return (
      <div>
        {openFilter && (
          <>
            <div ref={popupRef} className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{translations?.knitterInterface?.Blendingmaterial}</h3>
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
                          noDataComponent={<p className="py-3 font-bold text-lg">No data available in table</p>}
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
    )
  }

  const columns = [
    {
      name: (<p className="text-[13px] font-medium">{translations?.common?.srNo}</p>),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.transactions?.date}</p>),
      selector: (row: any) => row.date?.substring(0, 10),
      wrap: true,
      width: "120px"
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.transactions?.season} </p>),
      selector: (row: any) => row.season?.name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.GarmentOrderReference}</p>),
      selector: (row: any) => row?.garment_order_ref,
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.BrandOrderReference}</p>),
      selector: (row: any) => row.brand_order_ref,
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.FinishedBatch} </p>),
      selector: (row: any) => row.batch_lot_no,
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.FabricReelLotNo}</p>),
      // selector: (row: any) => row.reel_lot_no ? row.reel_lot_no : "N/A",
      selector: (row: any) => (
        <Link
          href={`/knitter/process/view-tracing?reel_lot_no=${row?.reel_lot_no}`}
          className="hover:text-blue-600 text-blue-500"

        >
          {row?.reel_lot_no}
        </Link>
      ),
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.KnitFabricType}</p>),
      selector: (row: any) => row.fabrictypes?.map((item: any) => item?.fabricType_name)?.join(","),
      width: '100px',
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.FinishedFabricGSM}</p>),
      selector: (row: any) => row?.fabric_gsm?.join(","),
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.FinishedFabricNetWeight} </p>),
      selector: (row: any) => row?.total_fabric_weight,
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.JobDetailsfromgarments} </p>),
      selector: (row: any) => row?.job_details_garment,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Total Yarn Utilized</p>,
      cell: (row: any) => row?.total_yarn_qty,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.program} </p>),
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.BlendingInvoice} </p>),
      cell: (row: any) =>
        row?.blend_invoice ? (
          <>
            <FaEye
              size={18}
              className="text-black  hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleView(row?.blend_invoice)}
            />
            <FaDownload
              size={18}
              className="text-black  hover:text-blue-600 cursor-pointer"
              onClick={() => handleDownloadData(row?.blend_invoice, "Blend Invoice")}
            />
          </>
        ) : (""),
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.Blendingmaterial}</p>),
      cell: (row: any) =>
        row?.blend_document && row?.blend_document.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row?.blend_document)}
              title="Click to View All Files"
            />
          </>
        ),
      width: "120px"

    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.DyeingProcess} </p>),
      cell: (row: any) => (
        <>
          {row?.dyeing_required === true ? (
            <Link href={`/knitter/process/dyeing-view-process?id=${row?.dyeing_id}`}>
              <FaEye size={18} />
            </Link>
          ) : null}
        </>
      ),
    },

    {
      name: (<p className="text-[13px] font-medium">{translations?.common?.status}</p>),
      cell: (row: any) => row.status,
      wrap: true

    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.mandiInterface?.qrCode}</p>),
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
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.action}
        </p>
      ),
      cell: (row: any) => (

        row.status === "Pending" &&
        <>
          <button
            className="bg-green-500 p-2 rounded"
            onClick={() => router.push(`/knitter/process/edit-process?id=${row?.id}`)}
          >
            <LuEdit size={18} color="white" />
          </button>
        </>

      )
    }
  ]

  if (roleLoading || loading) {
    return <Loader />;
  }

  if (!roleLoading && !Access.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  if (!roleLoading && Access?.view) {
    return (
      <>
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li className="active">
                    <Link href="/knitter/dashboard">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li>{translations?.knitterInterface?.Process} </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6" />

          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form ">
                <div className="table-minwidth w-100">
                  {/* search */}
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
                      {Access?.create && (
                        <button
                          className="btn btn-all btn-purple"
                          onClick={() => router.push("/knitter/process/new-process")}
                        >
                          {translations?.millInterface?.newProcess}
                        </button>
                      )}
                    </div>
                  </div>
                  <DocumentPopup openFilter={showFilter} dataArray={dataArray} onClose={() => setShowFilter(false)} />

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
      </>
    );
  }
}



