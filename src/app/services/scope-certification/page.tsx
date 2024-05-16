"use client";

import { useRouter } from "@lib/router-events";
import React, { useState, useEffect, useRef } from "react";
import Link from "@components/core/nav-link";
import { AiFillDelete } from "react-icons/ai";
import useTitle from "@hooks/useTitle";
import CommonDataTable from "@components/core/Table";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";
import useDebounce from "@hooks/useDebounce";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Scope-Certificate");
  const [roleLoading] = useRole();

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
  const [brands, setBrands] = useState<any>();
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [farmGroups, setfarmGroups] = useState<any>();
  const [icsName, setIcsNames] = useState<any>();
  const [showFilter, setShowFilter] = useState(false);
  const [checkedBrand, setCheckBrand] = useState<any>([]);
  const [checkedCountry, setCheckedCountry] = useState<any>([]);
  const [checkedState, setCHeckedState] = useState<any>([]);
  const [checkedFarmGroup, setCheckFarmGroup] = useState<any>([]);
  const [checkedIcsName, setCheckedIcsName] = useState<any>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [isClear, setIsClear] = useState(false);
  const debouncedSearch = useDebounce(encodeURIComponent(searchQuery), 200);

  useEffect(() => {
    fetchBrand();
    fetchCountry();
  }, []);

  useEffect(() => {
    if (checkedCountry.length !== 0) {
      fetchState();
    } else {
      setCHeckedState([]);
      setStates([]);
    }
  }, [checkedCountry]);

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

  useEffect(() => {
    fetchScope();
    setIsClient(true);
  }, [limit, page, debouncedSearch, isClear]);

  const fetchScope = async () => {
    try {
      const res = await API.get(
        `scope-certificate?limit=${limit}&page=${page}&search=${debouncedSearch}&pagination=true&sort=des&brandId=${checkedBrand}&countryId=${checkedCountry}&stateId=${checkedState}&farmGroupId=${checkedFarmGroup}&icsId=${checkedIcsName}`
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

  const fetchCountry = async () => {
    try {
      const res = await API.get("location/get-countries?status=true");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchState = async () => {
    try {
      if (checkedCountry.length !== 0) {
        const res = await API.get(
          `location/get-states?status=true&countryId=${checkedCountry}`
        );
        if (res.success) {
          setStates(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFarmGroup = async () => {
    try {
      let url = "farm-group?status=true";
      if (checkedBrand.length !== 0) {
        url = `farm-group?brandId=${checkedBrand}`;
      }
      const res = await API.get(url);
      if (res.success) {
        setfarmGroups(res.data);
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

  const columns = [
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations?.common?.srNo}{" "}
        </p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.brand}{" "}
        </p>
      ),
      selector: (row: any) => row?.brand?.brand_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.country}{" "}
        </p>
      ),
      selector: (row: any) => row?.country?.county_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.state}{" "}
        </p>
      ),
      selector: (row: any) => row?.state?.state_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.farmGroup} </p>
      ),
      selector: (row: any) => row?.farmGroup?.name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.icsName}</p>,
      selector: (row: any) => row?.ics?.ics_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Scope Certificate Validity</p>
      ),
      selector: (row: any) => row?.validity_end?.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Standard</p>,
      selector: (row: any) => row?.standard || "-",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.menuEntitlement?.view}
        </p>
      ),
      selector: (row: any) => row?.document,
      wrap: true,
      cell: (row: any) => (
        <Link
          href={`/services/scope-certification/view-certificate?id=${row.id}`}
        // legacyBehavior
        >
          <span className="text-blue-500" rel="noopener noreferrer">
            View Certificate
          </span>
        </Link>
      ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.action}
        </p>
      ),
      cell: (row: any) => (
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

  const clearFilter = () => {
    setCheckedIcsName([]);
    setCheckFarmGroup([]);
    setCheckBrand([]);
    setCheckedCountry([]);
    setCHeckedState([]);
    setSearchFilter("");
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
    }
    if (name === "countries") {
      if (checkedCountry.includes(itemId)) {
        setCheckedCountry(
          checkedCountry.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountry([...checkedCountry, itemId]);
      }
    }
    if (name === "states") {
      if (checkedState.includes(itemId)) {
        setCHeckedState(checkedState.filter((item: any) => item !== itemId));
      } else {
        setCHeckedState([...checkedState, itemId]);
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
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4  border-gray-300 shadow-lg rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">{translations?.common?.filter}</h3>
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
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "brands");
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
                          {translations?.common?.SelectCountry}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="county_name"
                          selectedValues={countries?.filter((item: any) =>
                            checkedCountry.includes(item?.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "countries"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(
                              selectedList,
                              selectedItem,
                              "countries"
                            )
                          }
                          options={countries}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.SelectState}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="state_name"
                          selectedValues={states?.filter((item: any) =>
                            checkedState.includes(item?.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "states");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "states")
                          }
                          options={states}
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
                          onRemove={(selectedList: any, selectedItem: any) => {
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
                          Select ICS Name
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="ics_name"
                          selectedValues={icsName?.filter((item: any) =>
                            checkedIcsName.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "icsnames"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "icsnames")
                          }
                          options={icsName}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchScope();
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
        )}
      </div>
    );
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };
  if (!roleLoading) {
    return (
      <div>
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "scope-certificate";
                try {
                  const response = await API.delete(url, {
                    id: deleteItemId,
                  });
                  if (response.success) {
                    toasterSuccess(
                      "Scope Certification has been deleted successfully",
                      3000,
                      response.data?.scopeCert
                    );
                    fetchScope();
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
          <div>
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
                        <li>Services</li>
                        <li>Scope Certification</li>
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
                            <div className="search-bars">
                              <form className="form-group mb-0 search-bar-inner">
                                <input
                                  type="text"
                                  className="form-control form-control-new jsSearchBar "
                                  placeholder="Search by Brand, Country, State"
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
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
                                {translations?.common?.Filters}
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
                                  "/services/scope-certification/add-certification"
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
              </div>
            </section>
          </div>
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
}
