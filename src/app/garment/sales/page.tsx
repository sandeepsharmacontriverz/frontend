"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa";
import User from "@lib/User";
import API from "@lib/Api";
import DataTable from "react-data-table-component";
import useDebounce from "@hooks/useDebounce";
import Loader from "@components/core/Loader";
import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import checkAccess from "@lib/CheckAccess";
import { LuFileEdit } from "react-icons/lu";

export default function page() {
  const [roleLoading, hasAccesss] = useRole();
  const { translations, loading } = useTranslations();

  useTitle(translations?.knitterInterface?.sale);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [dataArray, setDataArray] = useState<Array<string>>([]);
  const [showFilter, setShowFilter] = useState(false);
  const garmentId = User.garmentId;
  const code = encodeURIComponent(searchQuery);
  const debouncedSearch = useDebounce(code, 200);
  const [Access, setAccess] = useState<any>({});

  useEffect(() => {
    if (garmentId) {
      fetchSales();
    }
  }, [debouncedSearch, page, limit, garmentId]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
      const access = checkAccess("Garment Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  const fetchSales = async () => {
    // if (garmentId) {
    try {
      const response = await API.get(
        `garment-sales?garmentId=${garmentId}&pagination=true&search=${debouncedSearch}&limit=${limit}&page=${page}`
      );
      if (response.success) {
        setData(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.error(error);
      setCount(0);
      // }
    }
  };

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
  };

  const fetchExport = async () => {
    try {
      const res = await API.get(`garment-sales/export?garmentId=${garmentId}`);
      if (res.success) {
        handleDownload(res.data, "Sales Report", ".xlsx");
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

  const columns = [
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.date}
        </p>
      ),
      selector: (row: any) => row.date?.substring(0, 10),
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.season}
        </p>
      ),
      selector: (row: any) => row.season?.name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.brandname}
        </p>
      ),
      selector: (row: any) =>
        row.buyer?.brand_name ? row.buyer?.brand_name : row.garment?.name,
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.FabricOrderRef}
        </p>
      ),
      selector: (row: any) => row.fabric_order_ref,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.knitterInterface?.BrandOrderReference}
        </p>
      ),
      selector: (row: any) => row.brand_order_ref,
      wrap: true,
    },
    // {
    //   name: (
    //     <p className="text-[13px] font-medium">{translations?.common?.totallength}</p>
    //   ),
    //   selector: (row: any) => row.total_fabric_length,
    //   wrap: true,
    // },
    // {
    //   name: (
    //     <p className="text-[13px] font-medium">{translations?.common?.totalweight}</p>
    //   ),
    //   selector: (row: any) => row.total_fabric_weight,
    //   wrap: true,
    // },

    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.totPices}
        </p>
      ),
      selector: (row: any) => row.total_no_of_pieces,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.totalBoxes}
        </p>
      ),
      selector: (row: any) => row.total_no_of_boxes,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.invoiceNumber}
        </p>
      ),
      selector: (row: any) => row.invoice_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.program}</p>,
      selector: (row: any) => row.program?.program_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.transactionViatrader}
        </p>
      ),
      selector: (row: any) => (row.transaction_via_trader ? "Yes" : "No"),
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.agentDetails}
        </p>
      ),
      selector: (row: any) => row.transaction_agent || "NA",
      wrap: true,
    },

    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.tcFiles}
        </p>
      ),
      center: true,
      cell: (row: any) =>
        row.tc_file && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.tc_file)}
            />
            <FaDownload
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={() => handleDownloadData(row.tc_file, "Tc File")}
            />
          </>
        ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.ContractFiles}
        </p>
      ),
      center: true,
      cell: (row: any) =>
        row.contract_file && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.contract_file)}
            />
            <FaDownload
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={() =>
                handleDownloadData(row.contract_file, "Contract File")
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
        row.invoice_files &&
        row.invoice_files.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row.invoice_files)}
              title="Click to View All Files"
            />
          </>
        ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.DeliveryNotes}
        </p>
      ),
      selector: (row: any) => row.delivery_notes,
      cell: (row: any) => {
        return (
          <>
            {row.delivery_notes ? (
              <>
                <FaEye
                  size={18}
                  className="text-black hover:text-blue-600 cursor-pointer"
                  onClick={() => handleView(row.delivery_notes)}
                />
                <FaDownload
                  size={18}
                  className="text-black hover:text-blue-600 cursor-pointer ml-2"
                  onClick={() =>
                    handleDownloadData(row.delivery_notes, "Delivery Notes")
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
      name: (
        <p className="text-[13px] font-medium">
          {translations?.mandiInterface?.qrCode}
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
          {translations?.common?.status}
        </p>
      ),
      selector: (row: any) => row.status,
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: translations?.common?.action,
      cell: (row: any) =>
        Access?.edit && (
          <button
            className="bg-green-500 p-2 rounded "
            onClick={() =>
              router.push(`/garment/sales/edit-new-sale?id=${row.id}`)
            }
          >
            <LuFileEdit size={18} color="white" />
          </button>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

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
                <li> {translations?.knitterInterface?.sale}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="farm-group-box">
        <div className="farm-group-inner">
          <div className="table-form ">
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
                    {translations?.knitterInterface?.salereport}
                  </button>
                  {Access.create && (
                    <button
                      className="btn btn-all btn-purple"
                      onClick={() => router.push("/garment/sales/new-sale")}
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
    </>
  );
}
