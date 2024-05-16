"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { handleDownload,handleReportDownload } from "@components/core/Download";
import Multiselect from "multiselect-react-dropdown";
import Loader from "@components/core/Loader";
import User from "@lib/User";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";

const ProcurementTracker: any = () => {
  const [roleLoading] = useRole();
  const [isClient, setIsClient] = useState(false);

  const { translations, loading } = useTranslations();

  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);
  const [checkedSeasonsForFilter, setCheckedSeasonsForFilter] =
    React.useState<any>([]);

  const [isClear, setIsClear] = useState(false);

  const [isDataLoading, setIsDataLoading] = useState(false);

  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);

  const [showFilter, setShowFilter] = useState(false);
  const code = encodeURIComponent(searchQuery);

  const brandId = User.brandId;

  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);
  const [isAPILoading, setIsAPILoading] = useState<any>(null);

  const [exportAllCountVeryFirstTime, setExportAllCountVeryFirstTime] =
    useState(0);

  // const [fullDataCount, setFullDataCount] = useState<any>(null);

  // useEffect(() => {
  //   const getReportsCount = async () => {
  //     try {
  //       const response = await API.get(
  //         `reports/get-pscp-precurement-report?page=${page}&limit=${limit}&pagination=true`
  //       );
  //       console.log(
  //         "Get pscp-precurement Reports Count Response : ",
  //         response?.count
  //       );
  //       setFullDataCount(response?.count);
  //     } catch (error) {
  //       console.log("Get pscp-precurement Reports Count Error : ", error);
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
  //           file_name: "pscp-cotton-procurement.xlsx",
  //         });
  //         if (response.data) {
  //           setIsAPILoading(null);
  //           handleDownload(
  //             response?.data,
  //             "Cotton Connect - Procurement Tracker Report",
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
    getReports(), getCountry();
    getSeason();
  }, [isClear, page, limit, searchQuery, brandId]);

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleExport = async () => {
    const url = `reports/export-pscp-precurement-report?seasonId=${checkedSeasons}&brandId=${
      brandId ? brandId : ""
    }&countryId=${checkedCountries}&search=${code}&page=${page}&limit=${limit}&pagination=true`;
    try {
      setIsDataLoading(true);
      const response = await API.get(url);
      if (response.success) {
        handleDownload(
          response.data,
          "Cotton Connect - Procurement Tracker Report",
          ".xlsx"
        );
      setIsDataLoading(false);

      }
    } catch (error) {
      console.log(error, "error");
      setIsDataLoading(false);
    }
  };

  const fetchExportAll = async () => {
    // if (fullDataCount) {
    //   const totalPages = Math.ceil(
    //     (exportAllCountVeryFirstTime === 1 ? fullDataCount : count) / 10
    //   );

      const url = `reports/export-pscp-precurement-report?exportType=all`;
      try {
        setIsDataLoading(true);

        const response = await API.get(url);
        if (response.success) {
          handleReportDownload(
            response.data,
            "Cotton Connect - Procurement Tracker Report",
            ".xlsx"
          );
      setIsDataLoading(false);

        }
      } catch (error) {
        console.log(error, "error");

        setIsDataLoading(false);
      }
    // } else {
    //   alert("Pleaase wait a minutes");
    // }
  };

  const getReports = async () => {
    const url = `reports/get-pscp-precurement-report?seasonId=${checkedSeasons}&brandId=${
      brandId ? brandId : ""
    }&countryId=${checkedCountries}&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
      setExportAllCountVeryFirstTime(exportAllCountVeryFirstTime + 1);
    } catch (error) {
      setCount(0);
    }
    finally {
      setIsFilterUsed(false)
    }
  };

  const getCountry = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCountry(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getSeason = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setSeason(res);
        const lastThree = res.slice(-3).map((item: any) => item.id);
        setCheckedSeasonsForFilter(lastThree);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "countries") {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "seasons") {
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
    setCheckedCountries([]);
    setCheckedSeasons([]);
    setExportAllCountVeryFirstTime(0);
    setIsClear(!isClear);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-0 left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">
                  {" "}
                  {translations?.common?.Filters}{" "}
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
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.SelectCountry}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="county_name"
                          selectedValues={country?.filter((item: any) =>
                            checkedCountries.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "countries",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "countries",
                              true
                            )
                          }
                          options={country}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
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
                            getReports().then(()=> setShowFilter(false));
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

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  const formatDecimal = (value: string | number): string | number => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (Number.isFinite(numericValue)) {
      const formattedValue =
        numericValue % 1 === 0
          ? numericValue.toFixed(0)
          : numericValue.toFixed(2);
      return formattedValue.toString().replace(/\.00$/, "");
    }

    return numericValue;
  };
  const columns = [
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.srNo}</p>
      ),
      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.season}
        </p>
      ),
      wrap: true,
      selector: (row: any) => (
        <Link
          // legacyBehavior
          href={`/reports/procurement/procurement-tracker/view-procurement-tracker?id=${row.season_id}&season=${row.season}`}
          // passHref
        >
          <span
            className="text-blue-500"
            rel="noopener noreferrer"
            onClick={() => sessionStorage.setItem("Tab", "Procurement Tracker")}
          >
            {row.season}
          </span>
        </Link>
      ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.estimatedSeedCottonMT}
        </p>
      ),
      wrap: true,
      selector: (row: any) => formatDecimal(row.estimated_seed_cotton),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.estimatedLintMT}
        </p>
      ),
      selector: (row: any) => formatDecimal(row.estimated_lint),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.procuredSeedCottonMT}
        </p>
      ),
      selector: (row: any) => formatDecimal(row.procurement_seed_cotton),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.procurementPercentage}
        </p>
      ),
      selector: (row: any) => formatDecimal(row.procurement),
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.procuredLintCottonMT}
        </p>
      ),
      selector: (row: any) => formatDecimal(row.procured_lint_cotton),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.mandiInterface.noOfBales}
        </p>
      ),
      selector: (row: any) => row.no_of_bales,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.totalQuantityLintProducedMT}
        </p>
      ),
      wrap: true,
      selector: (row: any) => formatDecimal(row.total_qty_lint_produced),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.soldBales}
        </p>
      ),
      selector: (row: any) => row.sold_bales,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.totalQuantityLintSoldMT}
        </p>
      ),
      selector: (row: any) => formatDecimal(row.total_qty_sold_lint),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.balanceStockbales}
        </p>
      ),
      selector: (row: any) => row.balace_stock,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.balanceLintQuantityStockMT}
        </p>
      ),
      cell: (row: any) => formatDecimal(row.balance_lint_quantity),
      wrap: true,
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form ">
                  <div className="table-minwidth w-100">
                    <div className="search-filter-row">
                      <div className="search-filter-left ">
                        <div className="search-bars">
                          <form className="form-group mb-0 search-bar-inner">
                            <input
                              type="text"
                              className="form-control form-control-new jsSearchBar "
                              placeholder={translations.common.search}
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
                      <div className="flex">
                        <div className="search-filter-right">
                          <button
                            className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                            onClick={() => {
                              handleExport();
                            }}
                          >
                            {translations.common.export}
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

export default ProcurementTracker;
