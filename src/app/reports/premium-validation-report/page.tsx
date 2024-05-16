"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import Multiselect from "multiselect-react-dropdown";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";

const page = () => {
  useTitle("Premium Validation Report");
  const [roleLoading] = useRole();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [seasons, setSeasons] = useState<any>();
  const [farmGroups, setfarmGroups] = useState<any>();
  const [checkedSeason, setCheckedSeason] = useState<any>([]);
  const [checkedFarmGroup, setCheckFarmGroup] = useState<any>([]);
  const [data, setData] = useState([]);
  const [isClear, setIsClear] = useState(false);
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);

  useEffect(() => {
    fetchSeason();
    fetchFarmGroup();
  }, []);

  useEffect(() => {
    fetchValidationReport();
  }, [isClear]);

  const fetchSeason = async () => {
    try {
      const res = await API.get("season");
      if (res.success) {
        setSeasons(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFarmGroup = async () => {
    try {
      const res = await API.get("farm-group?status=true");
      if (res.success) {
        setfarmGroups(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchValidationReport = async () => {
    try {
      const res = await API.get(
        `reports/get-validation-project-report?seasonId=${checkedSeason}&farmGroupId=${checkedFarmGroup}`
      );
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
    finally {
      setIsFilterUsed(false)
    }
  };
  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      selector: (row: any) => row.season?.name,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Farm Group</p>,
      selector: (row: any) => row.farmGroup?.name,
      sortable: false,
      cell: (row: any) => (
        <Link
          // legacyBehavior
          href={"/reports/premium-validation-report/view-premium-validation"}
        // passHref
        >
          <span className="text-blue-500" rel="noopener noreferrer">
            {row.farmGroup?.name}
          </span>
        </Link>
      ),
      wrap: true

    },
    {
      name: <p className="text-[13px] font-medium">Total Number of Farmers</p>,
      selector: (row: any) => row.no_of_farmers,
      wrap: true
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Seed Cotton Purchased (MT)
        </p>
      ),
      selector: (row: any) => row.cotton_purchased,
      wrap: true

    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Lint Cotton Sold to Spinner (MT)
        </p>
      ),
      selector: (row: any) => row.qty_of_lint_sold,
      wrap: true

    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Lint Cost Recieved from Spinner (INR)
        </p>
      ),
      selector: (row: any) => row.premium_recieved,
      wrap: true

    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Premium Transferred to Farmers (INR)
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.premium_transfered?.join(","),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Average Seed Cotton Purchase Price (INR/Kg)
        </p>
      ),
      selector: (row: any) => row.avg_purchase_price,
      wrap: true

    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Average Conventional Cotton Price (INR/Kg)
        </p>
      ),
      selector: (row: any) => row.avg_market_price,
      wrap: true

    },
    {
      name: (
        <p className="text-[13px] font-medium">
          % Premium Transferred per KG of Seed Cotton Procured
        </p>
      ),
      selector: (row: any) => row.price_variance,
      wrap: true

    },
  ];

  const clearFilter = () => {
    setIsFilterUsed(true)
    setCheckedSeason([]);
    setCheckFarmGroup([]);
    setIsClear(!isClear);
  };

  const handleChange = (
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
    } else if (name === "farmGroups") {
      if (checkedFarmGroup.includes(itemId)) {
        setCheckFarmGroup(
          checkedFarmGroup.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckFarmGroup([...checkedFarmGroup, itemId]);
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
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-0 left-0 right-0 bottom-0 p-3 "
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
                    <div className="row">
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Seasons
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={seasons?.filter((item: any) =>
                            checkedSeason.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "season",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "season")
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
                            checkedFarmGroup.includes(item.id)
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
                            fetchValidationReport().then(()=> setShowFilter(false));
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


  if (!roleLoading) {
    return (
      <>
        <section className="right-content">
          <div className="right-content-inner">
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li className="active">
                      <Link href="/dashboard">
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>Reports</li>
                    <li>
                      <Link href="/services/premium-validation">
                        Premium Validation Report
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form">
                  <div className="table-minwidth w-100">
                    <div className="search-filter-row">
                      <div className="search-filter-left ">
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
                    <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                      <DataTable
                        columns={columns}
                        data={data}
                        noDataComponent={
                          <p className="py-3 font-bold text-lg">
                            No data available in table
                          </p>
                        }
                        persistTableHead
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
};

export default page;
