"use client";
import React, { useState, useRef, useEffect } from "react";
import useRole from "@hooks/useRole";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import CommonDataTable from "@components/core/Table";
import User from "@lib/User";
import Multiselect from "multiselect-react-dropdown";
import { handleDownload,handleReportDownload } from "@components/core/Download";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";
import Loader from "@components/core/Loader";

const Procurementtracker: any = () => {
  const { translations, loading } = useTranslations();
  const [roleLoading] = useRole();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [checkedBrand, setCheckedBrand] = useState<any>([]);
  const [checkedCountry, setCheckedCountry] = useState<any>([]);
  const [checkedDate, setCheckedDate] = useState<any>([]);
  const [checkedSeason, setCheckedSeason] = useState<any>([]);
  const [checkedGinner, setCheckedGinner] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);

  const [isDataLoading, setIsDataLoading] = useState(false);

  const [isClear, setIsClear] = useState(false);
  const brandId = User.brandId;

  const [isAPILoading, setIsAPILoading] = useState<any>(null);
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);
  
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
  //             "Cotton Connect - Procurement Sell and Live Tracker Report",
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

  const [checkedSeasonsForFilter, setCheckedSeasonsForFilter] =
    React.useState<any>([]);

  const [filterRec, setFilterRec] = useState<any>({
    brand: [],
    country: [],
    season: [],
    ginner: [],
  });

  useEffect(() => {
    getProcurement();
  }, [page, limit, searchQuery, brandId, isClear]);

  useEffect(() => {
    getBrands();
    getSeasons();
    getGinner();
  }, [brandId, checkedCountry]);

  useEffect(() => {
    if (checkedBrand?.length === 0) {
      setFilterRec((prev: any) => ({
        ...prev,
        country: [],
      }));
      setCheckedCountry([]);
    }
    getCountries();
  }, [brandId, checkedBrand]);

  const getProcurement = async () => {
    try {
      const res = await API.get(
        `reports/get-pscp-precurement-live-tracker-report?brandId=${
          brandId ? brandId : checkedBrand
        }&search=${searchQuery}&countryId=${checkedCountry}&ginnerId=${checkedGinner}&seasonId=${checkedSeason}&limit=${limit}&page=${page}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
        setExportAllCountVeryFirstTime(exportAllCountVeryFirstTime + 1);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
    finally {
      setIsFilterUsed(false)
    }
  };

  const getBrands = async () => {
    try {
      const res = await API.get("brand?status=true");
      if (res.success) {
        setFilterRec((prev: any) => ({
          ...prev,
          brand: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCountries = async () => {
    try {
      const url =
        checkedBrand.length > 0 || brandId
          ? `brand-interface/get-countries?brandId=${
              brandId ? brandId : checkedBrand
            }`
          : "location/get-countries";

      const res = await API.get(url);
      if (res.success) {
        setFilterRec((prev: any) => ({
          ...prev,
          country: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSeasons = async () => {
    try {
      const res = await API.get("season?status=true");
      if (res.success) {
        let respon = res.data;

        const lastThree = respon.slice(-3).map((item: any) => item.id);
        setCheckedSeasonsForFilter(lastThree);

        setFilterRec((prev: any) => ({
          ...prev,
          season: respon,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getGinner = async () => {
    try {
      const res = await API.get(
        `ginner?status=true&countryId=${checkedCountry}`
      );
      if (res.success) {
        setFilterRec((prev: any) => ({
          ...prev,
          ginner: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleExport = async () => {
    const url = `reports/export-pscp-precurement-live-tracker-report?brandId=${
      brandId ? brandId : checkedBrand
    }&countryId=${checkedCountry}&ginnerId=${checkedGinner}&seasonId=${checkedSeason}&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
    try {
      setIsDataLoading(true);
      const response = await API.get(url);
      if (response.success) {
          handleDownload(
            response.data,
            "Cotton Connect - Procurement Sell and Live Tracker Report",
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
      // const totalPages = Math.ceil(
      //   (exportAllCountVeryFirstTime === 1 ? fullDataCount : count) / 10
      // );

      const url = `reports/export-pscp-precurement-live-tracker-report?exportType=all`;
      try {
        setIsDataLoading(true);

        const response = await API.get(url);
        if (response.success) {
          handleReportDownload(
            response.data,
            "Cotton Connect - Procurement Sell and Live Tracker Report",
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

  const clearFilter = () => {
    setIsFilterUsed(true)
    setCheckedCountry([]);
    setCheckedGinner([]);
    setCheckedBrand([]);
    setCheckedSeason([]);
    setExportAllCountVeryFirstTime(0);
    setIsClear(!isClear);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "season") {
      if (checkedSeason.includes(itemId)) {
        setCheckedSeason(checkedSeason.filter((item: any) => item !== itemId));
      } else {
        setCheckedSeason([...checkedSeason, itemId]);
      }
    } else if (name === "country") {
      if (checkedCountry.includes(itemId)) {
        setCheckedCountry(
          checkedCountry.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountry([...checkedCountry, itemId]);
      }
    } else if (name === "brand") {
      if (checkedBrand.includes(itemId)) {
        setCheckedBrand(checkedBrand.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrand([...checkedBrand, itemId]);
      }
    } else if (name === "ginner") {
      if (checkedGinner.includes(itemId)) {
        setCheckedGinner(checkedGinner.filter((item: any) => item !== itemId));
      } else {
        setCheckedGinner([...checkedGinner, itemId]);
      }
    }
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">Filters</h3>
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
                    <div
                      className={
                        !brandId
                          ? "grid grid-cols-4 space-x-3"
                          : "grid grid-cols-3 space-x-3"
                      }
                    >
                      {!brandId && (
                        <div className="mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Brand
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="brand_name"
                            selectedValues={filterRec.brand?.filter(
                              (item: any) => checkedBrand.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "brand",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() {}}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "brand",
                                true
                              )
                            }
                            options={filterRec.brand}
                            showCheckbox
                          />
                        </div>
                      )}
                      <div className=" mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Country
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="county_name"
                          selectedValues={filterRec.country?.filter(
                            (item: any) => checkedCountry.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "country",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "country",
                              true
                            )
                          }
                          options={filterRec.country}
                          showCheckbox
                        />
                      </div>
                      <div className=" mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Season
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={filterRec.season?.filter(
                            (item: any) => checkedSeason.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "season",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "season",
                              true
                            )
                          }
                          options={filterRec.season}
                          showCheckbox
                        />
                      </div>
                      <div className=" mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Ginner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={filterRec.ginner?.filter(
                            (item: any) => checkedGinner.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "ginner",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "ginner"
                            )
                          }
                          options={filterRec.ginner}
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
                            getProcurement().then(()=> setShowFilter(false));
                          }}
                          disabled = {isFilterUsed}
                          style={
                            isFilterUsed
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : { cursor: "pointer", backgroundColor: "#D15E9C" }
                        }
                        >
                          APPLY ALL FILTERS
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
                          CLEAR ALL FILTERS
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
      name: <p className="text-[13px] font-medium">S No.</p>,
      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">Ginning mill</p>,
      cell: (row: any) => row?.ginner?.name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">State</p>,
      cell: (row: any) => row.state?.state_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      cell: (row: any) => row.program?.program_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Expected Seed Cotton (KG)</p>
      ),
      cell: (row: any) => row.expected_seed_cotton,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Expected Lint (MT)</p>,
      cell: (row: any) => row.expected_lint,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Procurement - Seed Cotton (KG)
        </p>
      ),
      cell: (row: any) => row.procurement_seed_cotton,
      wrap: true,
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium"> Procurement %</p>,
      cell: (row: any) => row.procurement,
      width: "120px",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Procurement - Seed Cotton Pending at Ginner (KG)
        </p>
      ),
      cell: (row: any) => row.pending_seed_cotton,
      width: "120px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Procurement Lint in (KG)</p>,
      cell: (row: any) => row.procured_lint_cotton_kgs,
      wrap: true,
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">Procurement Lint (MT)</p>,
      cell: (row: any) => formatDecimal(row.procured_lint_cotton_mt),
      wrap: true,
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">No of Bags produced</p>,
      cell: (row: any) => row.no_of_bales,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Bales Sold for this season</p>
      ),
      cell: (row: any) => row.sold_bales,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          LINT Sold for this season (MT)
        </p>
      ),
      cell: (row: any) => formatDecimal(row.total_qty_sold_lint),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Ginner Order in Hand (MT)</p>
      ),
      cell: (row: any) => row.order_in_hand,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Balance stock in bales with Ginner
        </p>
      ),
      cell: (row: any) => (
        <span>{row.balace_stock < 0 ? 0 : row.balace_stock}</span>
      ),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Balance stock with Ginner (MT)
        </p>
      ),
      cell: (row: any) => (
        <span>
          {row.balance_lint_quantity < 0
            ? formatDecimal(0)
            : formatDecimal(row.balance_lint_quantity)}
        </span>
      ),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Ginner Sale %</p>,
      cell: (row: any) => row.ginner_sale_percentage,
      wrap: true,
    },
  ];

  if (!roleLoading) {
    return (
      <>
        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="table-minwidth w-100">
                <div className="search-filter-row">
                  <div className="search-filter-left ">
                    <div className="search-bars">
                      <form className="form-group mb-0 search-bar-inner">
                        <input
                          type="text"
                          className="form-control form-control-new jsSearchBar "
                          placeholder="Search"
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
                        FILTERS <BiFilterAlt className="m-1" />
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
      </>
    );
  } else {
    return (
      <>
        <Loading />
      </>
    );
  }
};
export default Procurementtracker;
