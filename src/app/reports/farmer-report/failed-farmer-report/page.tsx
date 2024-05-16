"use client";

import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { handleDownload,handleReportDownload } from "@components/core/Download";
import { BiFilterAlt } from "react-icons/bi";
import moment from "moment";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "@components/core/Loader";
import useDebounce from "@hooks/useDebounce";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";

const FailedReports: any = () => {
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();

  useTitle(translations?.common?.failedRecord);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [season, setSeason] = useState([]);
  const [checkedSeasonsForFilter, setCheckedSeasonsForFilter] =
    React.useState<any>([]);

  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);

  const [showFilter, setShowFilter] = useState(false);

  const [isClear, setIsClear] = useState(false);
  const code = encodeURIComponent(searchQuery);

  const brandId = User.brandId;

  const [isAPILoading, setIsAPILoading] = useState<any>(null);
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);

  const debouncedSearch = useDebounce(code, 200);

  // const [exportAllCountVeryFirstTime, setExportAllCountVeryFirstTime] =
  //   useState(0);

  const [fullDataCount, setFullDataCount] = useState<any>(null);

  // useEffect(() => {
  //   const getReportsCount = async () => {
  //     try {
  //       const response = await API.get(
  //         `failed-records?page=${page}&limit=${limit}&pagination=true`
  //       );
  //       console.log(
  //         "Get failed-records Reports Count Response : ",
  //         response?.count
  //       );
  //       setFullDataCount(response?.count);
  //     } catch (error) {
  //       console.log("Get failed-records Reports Count Error : ", error);
  //     }
  //   };
  //   getReportsCount();
  // }, []);

  // useEffect(() => {
  //   // fetchExportAll
  //   if (isAPILoading) {
  //     async function loadFunction() {
  //       const url = "reports/check-export-load";
  //       try {
  //         const response = await API.post(url, {
  //           file_name: "failed-records.xlsx",
  //         });

  //         if (response.data) {
  //           setIsAPILoading(null);
  //           handleDownload(
  //             response.data,
  //             "Cotton Connect - Failed Farmer Report",
  //             ".xlsx"
  //           );
  //           return setIsDataLoading(false);
  //         }
  //       } catch (error) {
  //         console.log("Process Report API Error : ", error);
  //         setIsDataLoading(false);
  //       }
  //     }

  //     const intervelID = setInterval(loadFunction, 10000);

  //     return () => clearTimeout(intervelID);
  //   }
  // }, [isAPILoading]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getSeason();
  }, []);

  useEffect(() => {
    getFailedReports();
  }, [debouncedSearch, page, limit, isClear, brandId]);

  const getFailedReports = async () => {
    const url = `failed-records?search=${debouncedSearch}&page=${page}&limit=${limit}&pagination=true&seasonId=${checkedSeasons}&type=Farmer&startDate=${
      from ? from?.toISOString() : ""
    }&endDate=${to ? to?.toISOString() : ""}`;
    try {
      const response = await API.get(url);
      // console.log("Get Failed Reports Response : ", response);
      // setExportAllCountVeryFirstTime(1 + exportAllCountVeryFirstTime);

      setData(response.data);
      setCount(response.count);
    } catch (error) {
      setCount(0);
    }
    finally {
      setIsFilterUsed(false)
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleExport = async () => {
    const url = `failed-records/export?type=Farmer&seasonId=${checkedSeasons}&search=${debouncedSearch}&page=${page}&limit=${limit}&startDate=${
      from ? from?.toISOString() : ""
    }&endDate=${to ? to?.toISOString() : ""}&pagination=true`;
    try {
      setIsDataLoading(true);
      const response = await API.get(url);
      if (response.success) {
        handleDownload(
          response.data,
          "Rice Traceability - Failed Farmer Report",
          ".xlsx"
        );
        return setIsDataLoading(false);
      }
    } catch (error) {
      console.log(error, "error");
      setIsDataLoading(false);
    }
  };

  const fetchExportAll = async () => {
    // if (fullDataCount) {
      setIsDataLoading(true);

      const url = `failed-records/export?type=Farmer&exportType=all`;

      try {
        const response = await API.get(url);
        if (response.success) {
          handleReportDownload(
            response.data,
            "Rice Traceability - Failed Farmer Report",
            ".xlsx"
          );
          return setIsDataLoading(false);
        }
      } catch (error) {
        console.log(error, "error");
        setIsDataLoading(false);
      }
    // }
    //  else {
    //   alert("Pleaase wait a minutes");
    // }
  };

  const getSeason = async () => {
    const url = "season";
    try {
      const response = await API.get(url);

      if (response.success) {
        setSeason(response.data);
        const lastThree = response?.data.slice(-3).map((item: any) => item.id);
        setCheckedSeasonsForFilter(lastThree);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  if (loading) {
    return (
      <div>
        {" "}
        <Loader />{" "}
      </div>
    );
  }

  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "seasons") {
      if (checkedSeasons.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    }
  };

  const clearFilter = () => {
    setIsFilterUsed(true)
    setCheckedSeasons([]);
    setFrom(null);
    setTo(null);
    // setExportAllCountVeryFirstTime(0);
    setIsClear(!isClear);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    const handleTo = (date: any) => {
      setTo(date);
    };

    const handleFrom = (date: Date | null) => {
      if (date) {
        setFrom(date);
      } else {
        setFrom(null);
      }
    };
    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">
                  {translations?.common?.Filters}
                </h3>
                <button
                  className="text-[20px]"
                  onClick={() => setShowFilter(!showFilter)}
                  disabled = {isFilterUsed}
                  style={
                    isFilterUsed
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer"}
                }
                >
                  &times;
                </button>
              </div>
              <div className="w-100 mt-0">
                <div className="customFormSet">
                  <div className="w-100">
                    <div className="row">
                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.from}
                        </label>
                        <DatePicker
                          selected={from}
                          selectsStart
                          startDate={from}
                          endDate={to}
                          maxDate={to ? to : null}
                          onChange={handleFrom}
                          dateFormat={"dd-MM-yyyy"}
                          showYearDropdown
                          placeholderText={translations?.common?.from}
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.to}
                        </label>
                        <DatePicker
                          selectsEnd
                          startDate={to}
                          endDate={to}
                          minDate={from}
                          onChange={handleTo}
                          showYearDropdown
                          selected={to}
                          dateFormat={"dd-MM-yyyy"}
                          placeholderText={translations?.common?.to}
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                      </div>

                      <div className="col-12 col-md-6  mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.SelectSeason}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={season?.filter((item: any) =>
                            checkedSeasons.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "seasons",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "seasons"
                            )
                          }
                          options={season}
                          showCheckbox
                        />
                      </div>
                    </div>
                    {
                      isFilterUsed && (
                          <div className="mt-6">
                        <Loader height={'30px'}/>
                      </div>
                        ) 
                      }
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            setIsFilterUsed(true);
                            getFailedReports().then(()=> setShowFilter(false));
                          }}
                          disabled = {isFilterUsed}
                          style={
                            isFilterUsed
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : { cursor: "pointer", backgroundColor: "#D15E9C" }
                        }
                        >
                          {translations?.common?.ApplyAllFilters}
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={clearFilter}
                          disabled = {isFilterUsed}
                          style={
                            isFilterUsed
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : { cursor: "pointer"}
                        }
                        >
                          {translations?.common?.ClearAllFilters}
                        </button>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
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
          {translations?.common?.processDate}
        </p>
      ),
      wrap: true,
      selector: (row: any) => dateFormatter(row?.createdAt),
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.common?.type}</p>
      ),
      wrap: true,
      selector: (row: any) => row?.type,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions.season}
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.season?.name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions.farmerCode}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row?.farmer_code,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions.farmerName}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row?.farmer_name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.reason}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row?.reason,
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <p className="text-sm my-2">
                  <span className="font-bold">
                    {translations?.common?.note}
                  </span>{" "}
                  {translations?.common?.failedNote}
                </p>
                <div className="table-form ">
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
                        <div className="fliterBtn">
                          <button
                            className="flex"
                            type="button"
                            onClick={() => setShowFilter(!showFilter)}
                          >
                            {translations?.common?.Filters}{" "}
                            <BiFilterAlt className="m-1" />
                          </button>

                          <div className="relative">
                            <FilterPopup
                              openFilter={showFilter}
                              onClose={!showFilter}
                            />
                          </div>
                        </div>
                      </div>
                      {!brandId && (
                        <div className="flex">
                          <div className="search-filter-right">
                            <button
                              className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                              onClick={() => {
                                handleExport();
                              }}
                            >
                              {translations?.common?.export}
                            </button>
                            <button
                              className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm ml-3"
                              onClick={() => {
                                fetchExportAll();
                              }}
                            >
                              {translations?.common?.exportAll}
                            </button>
                          </div>
                        </div>
                      )}
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

            {isDataLoading ? (
              <div>
                <ModalLoader />
              </div>
            ) : null}
          </div>
        ) : (
          "Loading..."
        )}
      </div>
    );
  } else {
    return (
      <>
        <Loading />
      </>
    );
  }
};

export default FailedReports;
