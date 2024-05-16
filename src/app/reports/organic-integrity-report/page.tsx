"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "@components/core/nav-link";
import useTranslations from "@hooks/useTranslation";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";


export default function page() {
  useTitle("Integrity Summary Report");
  const [roleLoading] = useRole();
  const { translations } = useTranslations();
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedFarmGroups, setCheckedFarmGroups] = React.useState<any>([]);
  const [seasons, setSeasons] = useState<any>();
  const [farmGroups, setFarmGroups] = useState<any>();
  const [isClear, setIsClear] = useState(false);

  const code = encodeURIComponent(searchQuery);

  const getOrganicReport = async () => {
    const url = `reports/get-organic-integrity-report?seasonId=${checkedSeasons}&farmGroupId=${checkedFarmGroups}&limit=${limit}&page=${page}&search=${code}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      setCount(0);
    }
  };

  useEffect(() => {
    getOrganicReport();
  }, [isClear, page, limit, searchQuery]);

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const clearFilter = () => {
    setCheckedSeasons([]);
    setCheckedFarmGroups([]);
    setIsClear(!isClear);
  };

  const handleChange = (
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
    } else if (name === "farmGroups") {
      if (checkedFarmGroups.includes(itemId)) {
        setCheckedFarmGroups(
          checkedFarmGroups.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedFarmGroups([...checkedFarmGroups, itemId]);
      }
    }
  };

  const getSeasons = async () => {
    try {
      const res = await API.get("season");
      if (res.success) {
        setSeasons(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFarmGroups = async () => {
    try {
      const res = await API.get(`farm-group?status=true`);
      if (res.success) {
        setFarmGroups(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSeasons();
  }, []);

  useEffect(() => {
    getFarmGroups();
  }, []);

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-0 left-0 right-0 bottom-0 p-3 "
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
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Seasons
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={seasons?.filter((item: any) =>
                            checkedSeasons.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "seasons",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "seasons")
                          }
                          options={seasons}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Farm Group
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={farmGroups?.filter((item: any) =>
                            checkedFarmGroups.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "farmGroups",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(
                              selectedList,
                              selectedItem,
                              "farmGroups"
                            )
                          }
                          options={farmGroups}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getOrganicReport();
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
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Farm Group/Ginner</p>,
      selector: (row: any) => row.farmGroup_name,
      wrap: true

    },
    {
      name: <p className="text-[13px] font-medium">Test Stage</p>,
      selector: (row: any) => row.test_stage,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Positive</p>,
      selector: (row: any) => row.positives,
      wrap: true

    },
    {
      name: <p className="text-[13px] font-medium">Negative</p>,
      selector: (row: any) => row.negatives,
      wrap: true

    },
    {
      name: <p className="text-[13px] font-medium">Integrity Percentage</p>,
      selector: (row: any) => row.negativePercentage,
      wrap: true

    },
  ];
  if (!roleLoading) {
    return (
      <>
        <div>
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
                  <li>Integrity Summary Report</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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
