"use client";
import React, { useState, useRef, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import CommonDataTable from "@components/core/Table";
import User from "@lib/User";
import Multiselect from "multiselect-react-dropdown";
import { handleDownload } from "@components/core/Download";

export default function page() {
  const { translations, loading } = useTranslations();
  const [roleLoading] = useRole();

  useTitle("PSCP Procurement and Sell Live Tracker");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [checkedCountry, setCheckedCountry] = useState<any>([]);
  const [checkedDate, setCheckedDate] = useState<any>([]);
  const [checkedGinner, setCheckedGinner] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [isClear, setIsClear] = useState(false);
  const brandId = User.brandId;

  const [filterRec, setFilterRec] = useState<any>({
    country: [],
    season: [],
    ginner: [],
  });

  useEffect(() => {
    if (brandId) {
      getProcurement();
    }
  }, [page, limit, searchQuery, brandId, isClear]);

  useEffect(() => {
    if (brandId) {
      getSeasons();
      getCountries();
      getGinner();
    }
  }, [brandId, checkedCountry]);

  const getProcurement = async () => {
    try {
      const res = await API.get(
        `reports/get-pscp-precurement-live-tracker-report?brandId=${brandId}&search=${searchQuery}&countryId=${checkedCountry}&ginnerId=${checkedGinner}&seasonId=${checkedDate}&limit=${limit}&page=${page}&pagination=true`
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

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true");
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
        setFilterRec((prev: any) => ({
          ...prev,
          season: res.data,
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
    const url = `reports/export-pscp-precurement-live-tracker-report?brandId=${brandId}&countryId=${checkedCountry}&ginnerId=${checkedGinner}&seasonId=${checkedDate}&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      if (response.success) {
        if (response.data) {
          handleDownload(response.data, "PSCP Sales and Live Tracker", ".xlsx");
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const clearFilter = () => {
    setCheckedCountry([]);
    setCheckedGinner([]);
    setCheckedDate([]);
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
      if (checkedDate.includes(itemId)) {
        setCheckedDate(checkedDate.filter((item: any) => item !== itemId));
      } else {
        setCheckedDate([...checkedDate, itemId]);
      }
    } else if (name === "country") {
      if (checkedCountry.includes(itemId)) {
        setCheckedCountry(
          checkedCountry.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountry([...checkedCountry, itemId]);
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
            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">Filters</h3>
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
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Country
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
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

                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Season
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={filterRec.season?.filter(
                            (item: any) => checkedDate.includes(item.id)
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

                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Ginner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
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
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getProcurement();
                            setShowFilter(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={clearFilter}
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
  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">Ginning mill</p>,
      cell: (row: any) => row?.ginner?.name,
    },
    {
      name: <p className="text-[13px] font-medium">State</p>,
      cell: (row: any) => row.state?.state_name,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      cell: (row: any) => row.program?.program_name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Expected Seed Cotton (KG)</p>
      ),
      cell: (row: any) => row.expected_seed_cotton,
    },
    {
      name: <p className="text-[13px] font-medium">Expected Lint (MT)</p>,
      cell: (row: any) => row.expected_lint,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Procurement - Seed Cotton (KG)
        </p>
      ),
      cell: (row: any) => row.procurement_seed_cotton,
    },
    {
      name: <p className="text-[13px] font-medium">Procurement %</p>,
      cell: (row: any) => row.procurement,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Procurement - Seed Cotton Pending at Ginner (KG)
        </p>
      ),
      cell: (row: any) => row.pending_seed_cotton,
    },
    {
      name: <p className="text-[13px] font-medium">Procurement Lint in (KG)</p>,
      cell: (row: any) => row.procured_lint_cotton_kgs,
    },
    {
      name: <p className="text-[13px] font-medium">Procurement Lint (MT)</p>,
      cell: (row: any) => row.procured_lint_cotton_mt,
    },
    {
      name: <p className="text-[13px] font-medium">No of Bales produced</p>,
      cell: (row: any) => row.no_of_bales,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Bales Sold for this season</p>
      ),
      cell: (row: any) => row.sold_bales,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          LINT Sold for this season (MT)
        </p>
      ),
      cell: (row: any) => row.total_qty_sold_lint,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Ginner Order in Hand (MT)</p>
      ),
      cell: (row: any) => row.order_in_hand,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Balance stock in bales with Ginner
        </p>
      ),
      cell: (row: any) => row.balace_stock,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Balance stock with Ginner (MT)
        </p>
      ),
      cell: (row: any) => row.balance_lint_quantity,
    },
    {
      name: <p className="text-[13px] font-medium">Ginner Sale %</p>,
      cell: (row: any) => row.ginner_sale_percentage,
    },
  ];
  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#146CA7",
        color: "white",
        width: "220px",
      },
    },
  };

  if (!roleLoading) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/brand/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>PSCP Procurement and Sell Live Tracker</li>
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
                    </div>
                  </div>
                </div>

                <CommonDataTable
                  columns={columns}
                  count={count}
                  data={data}
                  customStyles={customStyles}
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
