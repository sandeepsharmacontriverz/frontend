"use client";

import { useRouter } from "@lib/router-events";
import React, { useState, useEffect, useRef } from "react";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import { AiFillDelete } from "react-icons/ai";
import Multiselect from "multiselect-react-dropdown";
import API from "@lib/Api";
import useTranslations from "@hooks/useTranslation";
import { BiFilterAlt } from "react-icons/bi";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import useDebounce from "@hooks/useDebounce";
import { useSearchParams } from "next/navigation";
import Loader from "@components/core/Loader";
interface TableData {
  id: number;
  date: string;
  season_id: string;
  farmGroup: {
    name: string;
  };
  farmer: {
    firstName: string;
  };
  ics: {
    ics_name: string;
  };
  transactions?: [];
  market_rate: string;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Premium Validation");
  const { translations, loading } = useTranslations();
  const [roleLoading] = useRole();

  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("activeTab");

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([]);
  const [isClear, setIsClear] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [limit, setLimit] = useState(10);
  const [activeProcessor, setActiveProcessor] = useState("");
  const [brands, setBrands] = useState<any>();
  const [farmGroups, setfarmGroups] = useState<any>();
  const [icsName, setIcsNames] = useState<any>();
  const [showFilter, setShowFilter] = useState(false);
  const [checkedBrand, setCheckBrand] = useState<any>([]);
  const [checkedFarmGroup, setCheckFarmGroup] = useState<any>([]);
  const [checkedIcsName, setCheckedIcsName] = useState<any>([]);
  const debouncedSearch = useDebounce(encodeURIComponent(searchQuery), 200);

  useEffect(() => {
    setIsClient(true);
    fetchBrand();
    if (activeTab) {
      setActiveProcessor(activeTab);
    } else {
      setActiveProcessor("Farmer");
    }
  }, []);

  useEffect(() => {
    if (activeProcessor) {
      fetchFarmer();
    }
  }, [debouncedSearch, activeProcessor, page, limit, isClear]);

  useEffect(() => {
    if (checkedBrand.length !== 0) {
      fetchFarmGroup();
    } else {
      setCheckFarmGroup([]);
      setfarmGroups([]);
    }
  }, [checkedBrand]);

  useEffect(() => {
    if (checkedFarmGroup.length !== 0) {
      icsname();
    } else {
      setIcsNames([]);
      setCheckedIcsName([]);
    }
  }, [checkedFarmGroup]);

  const fetchFarmer = async () => {
    try {
      const res = await API.get(
        `premium-validation/${activeProcessor === "Ginner" ? "project" : "farmer"
        }?limit=${limit}&page=${page}&search=${debouncedSearch}&pagination=true&brandId=${checkedBrand}&farmGroupId=${checkedFarmGroup}&icsId=${checkedIcsName}`
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

  const fetchBrand = async () => {
    try {
      const res = await API.get("brand");
      if (res.success) {
        setBrands(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFarmGroup = async () => {
    try {
      if (checkedBrand.length !== 0) {
        const res = await API.get(`farm-group?brandId=${checkedBrand}`);
        if (res.success) {
          setfarmGroups(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const icsname = async () => {
    try {
      if (checkedFarmGroup.length !== 0) {
        const res = await API.get(`ics?farmGroupId=${checkedFarmGroup}`);
        if (res.success) {
          setIcsNames(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const commonColumns = [
    {
      name: translations?.common?.srNo,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations?.transactions?.date}{" "}
        </p>
      ),
      selector: (row: TableData) => row?.date.substring(0, 10),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations?.transactions?.season}{" "}
        </p>
      ),
      selector: (row: any) => row?.season?.name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Farmer Name/Ginner </p>,
      selector: (row: TableData) => row?.farmer?.firstName,
      wrap: true,
      cell: (row: TableData) => (
        <Link
          // legacyBehavior
          href={`/services/premium-validation/view-premium-validation-farmer?id=${row.id}`}
        // passHref
        >
          <span
            className="text-blue-500 hover:text-blue-300"
            rel="noopener noreferrer"
          >
            {row?.farmer?.firstName}
          </span>
        </Link>
      ),
    },
    {
      name: (
        <p className="text-[13px] font-medium"> {translations?.farmGroup} </p>
      ),
      cell: (row: TableData) =>
        activeProcessor === "Ginner" ? (
          <Link
            // legacyBehavior
            href={`/services/premium-validation/premium-validation-project/view-premium-validation-project?id=${row.id}`}
          // passHref
          >
            <span
              className="text-blue-500 hover:text-blue-300"
              rel="noopener noreferrer"
            >
              {row?.farmGroup?.name}
            </span>
          </Link>
        ) : (
          row.farmGroup?.name
        ),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium"> {translations?.icsName} </p>
      ),
      selector: (row: TableData) => row?.ics?.ics_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Procured Quantity </p>,
      selector: (row: TableData) =>
        row?.transactions?.length
          ? row.transactions.map((data: any) => data?.qty_purchased)
          : "-",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations?.transactions?.price}
        </p>
      ),
      selector: (row: TableData) =>
        row?.transactions?.length
          ? row.transactions.map((data: any) => data?.average_rate)
          : "-",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common?.action}</p>
      ),
      cell: (row: TableData) => (
        <>
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-500 p-2 ml-3 rounded"
          >
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      wrap: true,
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const columns =
    activeProcessor === "Ginner"
      ? commonColumns?.filter((column) => {
        const columnName =
          typeof column.name === "string"
            ? column?.name?.trim()
            : column?.name?.props?.children?.toString()?.trim();
        const isMatch =
          columnName === `${translations?.common?.srNo}` ||
          columnName === `,${translations?.transactions?.date},` ||
          columnName === `,${translations?.transactions?.season},` ||
          columnName === `,${translations?.farmGroup},` ||
          columnName === `${translations?.common?.action}`;
        return isMatch;
      })
      : commonColumns;

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const clearFilter = () => {
    setCheckedIcsName([]);
    setCheckFarmGroup([]);
    setCheckBrand([]);
    setIsClear(!isClear);
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "brands") {
      if (checkedBrand.includes(itemId)) {
        setCheckBrand(checkedBrand.filter((item: any) => item !== itemId));
      } else {
        setCheckBrand([...checkedBrand, itemId]);
      }
    } else if (name === "farmGroups") {
      if (checkedFarmGroup.includes(itemId)) {
        setCheckFarmGroup(
          checkedFarmGroup.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckFarmGroup([...checkedFarmGroup, itemId]);
      }
    } else if (name === "icsnames") {
      if (checkedIcsName.includes(itemId)) {
        setCheckedIcsName(
          checkedIcsName.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedIcsName([...checkedIcsName, itemId]);
      }
    }
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto py-3  px-3 border-gray-300 shadow-lg rounded-md">
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
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.Selectbrand}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="brand_name"
                            selectedValues={brands?.filter((item: any) =>
                              checkedBrand.includes(item?.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "brands"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "brands")
                            }
                            options={brands}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 mt-2">
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
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "farmGroups"
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
                        {activeProcessor === "Farmer" && (
                          <div className="col-12 col-md-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Select ICS Name
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="ics_name"
                              selectedValues={icsName?.filter((item: any) =>
                                checkedIcsName.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "icsnames"
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "icsnames"
                                )
                              }
                              options={icsName}
                              showCheckbox
                            />
                          </div>
                        )}
                      </div>
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              fetchFarmer();
                              setShowFilter(false);
                            }}
                          >
                            {translations?.common?.ApplyAllFilters}
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={() => {
                              clearFilter();
                            }}
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
          </>
        )}
      </div>
    );
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  const switchProcessorTab = (processorType: string) => {
    setSearchQuery("");
    setActiveProcessor(processorType);
    setCheckBrand([]);
    setCheckFarmGroup([]);
    setCheckedIcsName([]);
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }

  if (!roleLoading) {
    return (
      <div>
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const GinnerUrl = "premium-validation/project";
                const FarmerUrl = "premium-validation/farmer";
                try {
                  const response = await API.delete(
                    activeProcessor === "Ginner" ? GinnerUrl : FarmerUrl,
                    {
                      id: deleteItemId,
                    }
                  );
                  if (response.success) {
                    toasterSuccess(
                      `${activeProcessor === "Ginner"
                        ? "Project/Ginner"
                        : activeProcessor
                      } has been deleted successfully`,
                      3000,
                      response.data
                    );
                    fetchFarmer();
                  } else {
                    toasterError("Failed to delete record");
                  }
                } catch (error) {
                  toasterError("An error occurred");
                }
                setShowDeleteConfirmation(false);
                setDeleteItemId(null);
              }
            }}
            onCancel={handleCancel}
          />
        )}
        {isClient ? (
          <>
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li className="active">
                      <Link href="/dashboard">
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>Services</li>
                    <li>
                      Premium Validation{" "}
                      {activeProcessor === "Ginner"
                        ? "- Project/Ginner"
                        : "- Farmer"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="topTrader">
              <section>
                <button
                  className={`${activeProcessor === "Farmer" ? "activeFilter" : ""
                    }`}
                  type="button"
                  onClick={() => switchProcessorTab("Farmer")}
                >
                  Farmer
                </button>
                <button
                  className={`${activeProcessor === "Ginner" ? "activeFilter" : ""
                    }`}
                  type="button"
                  onClick={() => switchProcessorTab("Ginner")}
                >
                  Project/Ginner
                </button>
              </section>
              <section className="buttonTab" />
            </div>
            {/* farmgroup start */}
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form">
                  <div className="table-minwidth w-100">
                    {/* search */}
                    <div className="search-filter-row">
                      <div className="search-filter-left ">
                        {activeProcessor === "Farmer" && (
                          <div className="search-bars">
                            <form className="form-group mb-0 search-bar-inner">
                              <input
                                type="text"
                                className="form-control form-control-new jsSearchBar "
                                placeholder={`Search by Farmer Name`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                              <button type="submit" className="search-btn">
                                <span className="icon-search"></span>
                              </button>
                            </form>
                          </div>
                        )}
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

                      <div className="search-filter-right">
                        <button
                          className="btn btn-all btn-purple"
                          onClick={() =>
                            router.push(
                              activeProcessor === "Farmer"
                                ? "/services/premium-validation/add-premium-validation-farmer"
                                : "/services/premium-validation/premium-validation-project/add-premium-validation-project"
                            )
                          }
                        >
                          {translations?.common?.add}
                        </button>
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
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
}
