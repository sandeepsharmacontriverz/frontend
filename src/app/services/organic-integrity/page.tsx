"use client";

import { useRouter } from "@lib/router-events";
import React, { useState, useEffect, useRef } from "react";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import { AiFillDelete } from "react-icons/ai";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";
import useDebounce from "@hooks/useDebounce";
import Loader from "@components/core/Loader";

interface TableData {
  id: number;
  date: string;
  farmer: string;
  farmgroup: {
    name: string;
  };
  teststage: string;
  icsname?: string;
  seedlotno: string;
  sealno?: string;
  samplecode: string;
  integrity_score: boolean;
}

export default function Page() {
  const [roleLoading] = useRole();
  useTitle("Organic Integrity");
  const { translations, loading } = useTranslations();

  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [isClear, setIsClear] = useState(false);

  const code = encodeURIComponent(searchQuery);
  const debouncedSearch = useDebounce(code, 200);

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };
  const columns = [
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.common?.srNo} </p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.date}{" "}
        </p>
      ),
      selector: (row: TableData) => row.date?.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Farmer Name/Ginner </p>,
      selector: (row: any) => {
        row?.farmerdetails ? row?.farmerdetails?.firstName : row.ginner?.name;
      },
      wrap: true,
      cell: (row: any) => (
        <Link
          // legacyBehavior
          href={`/services/organic-integrity/view-organic-integrity?id=${row.id}`}
        // passHref
        >
          <span className="text-blue-500" rel="noopener noreferrer">
            {row?.farmerdetails
              ? row?.farmerdetails?.firstName
              : row.ginner?.name}
          </span>
        </Link>
      ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.farmGroup} </p>
      ),
      selector: (row: any) => row?.farmGroup?.name || "-",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Test Stage </p>,
      selector: (row: any) => row.test_stage || "-",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.icsName}</p>,
      selector: (row: any) => row?.ics?.ics_name || "-",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Seed lot No </p>,
      selector: (row: any) => row.seed_lot || "-",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Seal No </p>,
      selector: (row: any) => row.seal_no || "-",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Sample Code No</p>,
      selector: (row: any) => row.sample_code || "-",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Score</p>,
      selector: (row: any) => row.integrity_score || "-",
      wrap: true,
      cell: (row: any) => (
        <p>{row.integrity_score ? "Positive" : "Negative"}</p>
      ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.menuEntitlement?.delete}
        </p>
      ),
      cell: (row: TableData) => (
        <>
          <button onClick={() => handleDelete(row.id)}>
            <AiFillDelete
              size={30}
              className="mr-4  p-1.5  bg-red-500 text-white"
            />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const fetchOrganic = async () => {
    try {
      const res = await API.get(
        `organic-integrity?search=${debouncedSearch}&brandId=${checkedBrand}&farmGroupId=${checkedFarmGroup}&icsId=${checkedIcsName}&limit=${limit}&page=${page}&pagination=true`
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

  const [brands, setBrands] = useState<any>();
  const [farmGroups, setfarmGroups] = useState<any>();
  const [icsNames, setIcsNames] = useState<any>();
  const [showFilter, setShowFilter] = useState(false);
  const [checkedBrand, setCheckBrand] = useState<any>([]);
  const [checkedFarmGroup, setCheckFarmGroup] = useState<any>([]);
  const [checkedIcsName, setCheckedIcsName] = useState<any>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchOrganic();
    setIsClient(true);
  }, [limit, page, debouncedSearch, isClear]);

  useEffect(() => {
    fetchBrand();
  }, []);

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
      setCheckedIcsName([]);
      setIcsNames([]);
    }
  }, [checkedFarmGroup]);

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

  const clearFilter = () => {
    setCheckedIcsName([]);
    setCheckFarmGroup([]);
    setCheckBrand([]);
    setSearchFilter("");
    setIsClear(!isClear);
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
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
              <div className="bg-white border w-auto py-3  px-2 border-gray-300 shadow-lg rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">
                    {translations?.common?.filter}
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
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select ICS
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="ics_name"
                            selectedValues={icsNames?.filter((item: any) =>
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
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "icsnames"
                              )
                            }
                            options={icsNames}
                            showCheckbox
                          />
                        </div>
                      </div>
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              fetchOrganic();
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
                const url = "organic-integrity";
                try {
                  const response = await API.delete(url, {
                    id: deleteItemId,
                  });
                  if (response.success) {
                    toasterSuccess(
                      "Record has been deleted successfully",
                      3000,
                      response.data?.organicIntegrity
                    );
                    fetchOrganic();
                  } else {
                    toasterError("Failed to delete record");
                  }
                } catch (error) {
                  console.log(error, "error");
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
                    <li>Organic Integrity</li>
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
                        <div className="search-bars">
                          <form className="form-group mb-0 search-bar-inner">
                            <input
                              type="text"
                              className="form-control form-control-new jsSearchBar "
                              placeholder="Search by Farmer name,Group"
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
                      <div className="search-filter-right">
                        <button
                          className="btn btn-all btn-purple"
                          onClick={() =>
                            router.push(
                              "/services/organic-integrity/add-organic-integrity"
                            )
                          }
                        >
                          {translations.common.add}
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
