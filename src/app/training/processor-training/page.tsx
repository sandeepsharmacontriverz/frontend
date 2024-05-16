"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "next/link";

import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import { useRouter } from "next/navigation";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import moment from "moment";
import Multiselect from "multiselect-react-dropdown";
import useRole from "@hooks/useRole";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";

const ProcessorType = [
  {
    id: 1,
    name: "Mandi",
  },
  {
    id: 2,
    name: "Mill",
  },

];

const trainingMode = [
  {
    id: 1,
    name: "Online",
  },
  {
    id: 2,
    name: "Offline",
  },
];

export default function page() {
  useTitle("Processor Training");
  const [roleLoading] = useRole();

  const router = useRouter();
  const { translations, loading } = useTranslations();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [country, setCountry] = useState([]);
  const [state, setState] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");

  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedProcessors, setCheckedProcessors] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [checkedTrainingMode, setCheckedTrainingMode] = React.useState<any>([]);

  const [showFilter, setShowFilter] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [hasAccess, setHasAccess] = useState<any>({});

  const code = encodeURIComponent(searchQuery || searchFilter);
  const brandId = User.brandId;

  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Processor Training");
      if (access) setHasAccess(access);
    }
  }, [roleLoading]);

  useEffect(() => {
    getCountry();
    getBrands();
  }, []);

  useEffect(() => {
    if (checkedCountries.length > 0) {
      getStates();
    } else {
      setCheckedStates([]);
      setState([]);
    }
  }, [checkedCountries]);

  useEffect(() => {
    getTrainingList();
  }, [searchQuery, page, limit, isClear, brandId]);

  const getTrainingList = async () => {
    const url = `training/get-trainings?countryId=${checkedCountries}&brandId=${brandId ? brandId : checkedBrands
      }&stateId=${checkedStates}&processor=${checkedProcessors}&trainingMode=${checkedTrainingMode}&search=${code}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
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

  const getBrands = async () => {
    const url = "brand";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setBrands(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getStates = async () => {
    const url = `location/get-states?status=true&countryId=${checkedCountries.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setState(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true);
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
  };

  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    let itemName = selectedItem?.name;

    if (name === "countries") {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "brands") {
      if (checkedBrands.includes(itemId)) {
        setCheckedBrands(checkedBrands.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrands([...checkedBrands, itemId]);
      }
    } else if (name === "states") {
      if (checkedStates.includes(itemId)) {
        setCheckedStates(checkedStates.filter((item: any) => item !== itemId));
      } else {
        setCheckedStates([...checkedStates, itemId]);
      }
    } else if (name === "processor") {
      if (checkedProcessors.includes(itemName)) {
        setCheckedProcessors(
          checkedProcessors.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedProcessors([...checkedProcessors, itemName]);
      }
    } else if (name === "trainingMode") {
      if (checkedTrainingMode.includes(itemName)) {
        setCheckedTrainingMode(
          checkedTrainingMode.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedTrainingMode([...checkedTrainingMode, itemName]);
      }
    }
  };

  const clearFilter = () => {
    setCheckedCountries([]);
    setCheckedStates([]);
    setCheckedProcessors([]);
    setCheckedBrands([]);
    setCheckedTrainingMode([]);
    setIsClear(!isClear);
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }
  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (
          popupRef.current &&
          !(popupRef.current as any).contains(event.target)
        ) {
          setShowFilter(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [popupRef, onClose]);

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
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
                      {!brandId && (
                        <div className="col-12 col-md-6 col-lg-4 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Brand
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="brand_name"
                            selectedValues={brands?.filter((item: any) =>
                              checkedBrands.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "brands"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "brands"
                              )
                            }
                            options={brands}
                            showCheckbox
                          />
                        </div>
                      )}

                      <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Processor
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={ProcessorType?.filter((item: any) =>
                            checkedProcessors.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "processor"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "processor"
                            )
                          }
                          options={ProcessorType}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Country
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="county_name"
                          selectedValues={country?.filter((item: any) =>
                            checkedCountries.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "countries"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "countries"
                            )
                          }
                          options={country}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a States
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="state_name"
                          selectedValues={state?.filter((item: any) =>
                            checkedStates.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "states"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "states"
                            )
                          }
                          options={state}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Mode of Training
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={trainingMode?.filter((item: any) =>
                            checkedTrainingMode.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "trainingMode"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "trainingMode"
                            )
                          }
                          options={trainingMode}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getTrainingList();
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

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };

  function formatTime(timeString: any) {
    if (timeString) {
      const [hourString, minute] = timeString?.split(":");
      const hour = +hourString % 24;
      return (hour % 12 || 12) + ":" + minute + (hour < 12 ? "AM" : "PM");
    } else {
      return "";
    }
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      cell: (row: any) => dateFormatter(row.date),
      wrap: true,
      width: "120px"
    },
    {
      name: <p className="text-[13px] font-medium">Time</p>,
      cell: (row: any) =>
        formatTime(row.start_time) +
        (row.end_time ? "-" : "") +
        formatTime(row.end_time),
      wrap: true,
    },
    !brandId && {
      name: <p className="text-[13px] font-medium">Brand</p>,
      cell: (row: any) => row.brand?.brand_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Processor</p>,
      cell: (row: any) => row.processor,
    },
    {
      name: <p className="text-[13px] font-medium">Country</p>,
      cell: (row: any) => row.country?.county_name,
    },
    {
      name: <p className="text-[13px] font-medium">State</p>,
      cell: (row: any) => row.state?.state_name,
    },
    {
      name: <p className="text-[13px] font-medium">Training Type</p>,
      cell: (row: any) => row.training_type,
    },
    {
      name: <p className="text-[13px] font-medium">Venue</p>,
      cell: (row: any) => row.venue,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.action}</p>
      ),
      width: "200px",
      cell: (row: any) => (
        <>
          {hasAccess?.edit && !brandId && (
            <button
              onClick={() =>
                router.push(
                  `/training/processor-training/edit-processor-training?id=${row.id}`
                )
              }
              className="bg-green-500 p-2 rounded "
            >
              <LuEdit size={18} color="white" />
            </button>
          )}
          {hasAccess?.delete && !brandId && (
            <button
              onClick={() => handleDelete(row.id)}
              className="bg-red-500 p-2 ml-2 rounded"
            >
              <AiFillDelete size={18} color="white" />
            </button>
          )}
          <button
            onClick={() =>
              router.push(
                `/training/processor-training/status-processor-training?id=${row.id}`
              )
            }
            className=" p-1.5 ml-2 bg-yellow-500 text-white rounded text-sm"
          >
            Status
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ].filter(Boolean);

  if (!roleLoading && !hasAccess.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  return (
    <div>
      <div>
        {/* breadcrumb */}
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href={!brandId ? "/dashboard" : "/brand/dashboard"} className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Training</li>
                <li>Processor Training</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form ">
              <div className="table-minwidth w-100">
                {/* search */}
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
                  {hasAccess?.create && !brandId && (
                    <div className="flex">
                      <div className="search-filter-right ml-3">
                        <button
                          className="btn btn-all btn-purple"
                          onClick={() =>
                            router.push(
                              "/training/processor-training/create-processor-training"
                            )
                          }
                        >
                          {translations.menuEntitlement.create}
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
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "training/delete-training";
                try {
                  const response = await API.delete(url, {
                    id: deleteItemId,
                  });
                  if (response.success) {
                    toasterSuccess(
                      "Record has been deleted successfully",
                      3000,
                      deleteItemId
                    );
                    getTrainingList();
                  } else {
                    toasterError("Failed to delete record", 3000, deleteItemId);
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
      </div>
    </div>
  );
}
