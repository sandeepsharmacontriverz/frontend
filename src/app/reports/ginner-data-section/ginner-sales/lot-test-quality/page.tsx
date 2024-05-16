"use client";
import { useRouter } from "@lib/router-events";
import { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { useSearchParams } from "next/navigation";
import moment from "moment";
import { FaEye } from "react-icons/fa";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";

export default function Page() {
  useTitle("Lot Test Quality Report");
  const search = useSearchParams();
  const id = search.get("id");
  const [roleLoading] = useRole();
  const router = useRouter();

  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState<any>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);
  const code = encodeURIComponent(searchQuery);

  useEffect(() => {
    if (id) {
      fetchSingleCottonQuality();
    }
  }, [searchQuery, page, limit]);

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
  };

  const fetchSingleCottonQuality = async () => {
    try {
      const res = await API.get(
        `quality-parameter/get-value?id=${id}&search=${code}&page=${page}&limit=${limit}&pagination=true`
      );
      if (res.success) {
        setData([res.data]);
        const count = [res.data];
        setCount(count?.length);
        setIsLoaded(true);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
      setIsLoaded(true);
    }
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };
  const { translations, loading } = useTranslations();
  if (loading) {
    return <div>  <Loader /> </div>;
  }

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
        name: (<p className="text-[13px] font-medium">Action</p>),
        selector: (row: any) => (
          <>
            <div className="flex items-center">
              <FaEye
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer mr-2"
                onClick={() => handleView(row)}
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
                  <h3 className="text-lg pb-2">Documents</h3>
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
      name: (<p className="text-[13px] font-medium"> {translations.common.srNo}</p>),
      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.mandiInterface.ginlotNo}</p>),
      selector: (row: any) => row.process.lot_no,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.mandiInterface.reelLotNo} </p>),
      selector: (row: any) => row.process.reel_lot_no,
      wrap: true,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.qualityParameter.labName} </p>),
      selector: (row: any) => row.lab_name,
      sortable: false,
      wrap: true,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.qualityParameter.dateReport} </p>),
      selector: (row: any) => dateFormatter(row?.test_report),
      wrap: true,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations.qualityParameter.sci} </p>),
      selector: (row: any) => row.sci,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations.qualityParameter.moisture} </p>),
      selector: (row: any) => row.moisture,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.qualityParameter.mic} </p>),
      selector: (row: any) => row.mic,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations.qualityParameter.mat} </p>),
      selector: (row: any) => row.mat,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.qualityParameter.uhml} </p>),
      selector: (row: any) => row.uhml,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.qualityParameter.ui}</p>),
      selector: (row: any) => row.ui,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.qualityParameter.sf} </p>),
      selector: (row: any) => row.sf,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations.qualityParameter.str} </p>),
      selector: (row: any) => row.str,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations.qualityParameter.elg} </p>),
      selector: (row: any) => row.elg,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations.qualityParameter.rd}</p>),
      selector: (row: any) => row.rd,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations.qualityParameter.b} </p>),
      selector: (row: any) => row.plusb,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations.qualityParameter.document} </p>),
      cell: (row: any) =>
        row?.document && row?.document.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row?.document)}
              title="Click to View All Files"
            />
          </>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (!roleLoading && isLoaded) {
    return (
      <div className="">
        <div>
          {/* breadcrumb */}
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li>
                    <Link href="/dashboard" className="active">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li>Reports</li>
                  <li>
                    <Link href="/reports/ginner-data-section">
                      Ginner Sales Report
                    </Link>
                  </li>

                  <li>Lot Test Quality Report</li>
                </ul>
              </div>
            </div>
          </div>
          {/* farmgroup start */}
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form">
                <div className="table-minwidth w-100">
                  {/* search */}
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="search-bars mb-4">
                        <label className="text-md font-bold">
                          {translations.transactions.date}:
                        </label>{" "}
                        <span className="text-sm ml-5">
                          {data &&
                            data?.map((item: any) => {
                              return dateFormatter(item?.process?.date);
                            })}
                        </span>
                      </div>
                    </div>

                    <div className="search-filter-right">
                      <button
                        className="py-1.5 px-4 bg-gray-100 rounded border text-sm"
                        onClick={() =>
                          router.push(
                            "/reports/ginner-data-section"
                          )
                        }
                      >
                        {translations.common.back}
                      </button>
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
      </div>
    );
  }
}
