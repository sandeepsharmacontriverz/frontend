"use client";

import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useRouter } from "@lib/router-events";
import { AiFillDelete } from "react-icons/ai";
import API from "@lib/Api";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { handleDownload } from "@components/core/Download";
import DataTable from "react-data-table-component";
import { BiFilterAlt } from "react-icons/bi";
import moment from "moment";
import Multiselect from "multiselect-react-dropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import { FaEye } from "react-icons/fa6";
import Loader from "@components/core/Loader";

const status = [
  {
    name: "Pending",
  },
  {
    name: "Sold",
  },
  {
    name: "Rejected",
  },
];

export default function transactions() {
  useTitle("Transactions");
  const [roleLoading, hasAccess] = useRole();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [showExportMessage, setShowExportMessage] = useState(false);

  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);
  const [program, setProgram] = useState([]);
  const [farmGroups, setFarmGroups] = useState<any>();
  const [ginner, setGinner] = useState([]);
  const [brands, setBrands] = useState([]);
  const[riceVariety,setRiceVariety]=useState<any>([])
  const [searchFilter, setSearchFilter] = useState("");
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedRiceVariety, setCheckedVariety] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedFarmGroups, setCheckedFarmGroups] = useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedGinners, setCheckedGinners] = React.useState<any>([]);
  const [startDates, setStartDates] = useState<any>("");
  const [endDates, setEndDates] = useState<any>("");
  const [isClear, setIsClear] = useState(false);

  const [showTransactionPopUp, setShowTransactionPopUp] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [viewData, setViewData] = useState<any>([]);

  const [errorExport, setErrorExport] = useState(false);
  const [errorDateExport, setErrorDateExport] = useState(false);
  const [countryExport, setCountryExport] = useState([]);
  const [statesExport, setStatesExport] = useState([]);
  const [seasonExport, setSeasonExport] = useState([]);
  const [programExport, setProgramExport] = useState([]);
  const [farmGroupsExport, setFarmGroupsExport] = useState<any>();
  const [ginnerExport, setGinnerExport] = useState([]);
  const [riceVarietyExport, setRiceVarietyExport] = useState([]);
  const [brandsExport, setBrandsExport] = useState([]);
  const [checkedExportCountries, setCheckedExportCountries] =
    React.useState<any>([]);
  const [checkedExportStates, setCheckedExportStates] = React.useState<any>([]);
  const [checkedExportPrograms, setCheckedExportPrograms] = React.useState<any>(
    []
  );
  const [checkedExportBrands, setCheckedExportBrands] = React.useState<any>([]);
  const [checkedExportRice, setCheckedExportRIce] = React.useState<any>([]);
  const [checkedExportFarmGroups, setCheckedExportFarmGroups] = useState<any>(
    []
  );
  const [hasAllAccess, setHasAllAccess] = useState<any>({});

  const [checkedExportSeasons, setCheckedExportSeasons] = useState<any>([]);
  const [checkedExportGinners, setCheckedExportGinners] = useState<any>([]);
  const [checkedExportStatus, setCheckedExportStatus] = useState<any>([]);
  const [startExportDates, setExportStartDates] = useState<any>("");
  const [endExportDates, setExportEndDates] = useState<any>("");
  const [isExportClear, setIsExportClear] = useState(false);

  const [selectedProgram, setSelectedProgram] = useState<any>("");

  const [showFilterExport, setShowFilterExport] = useState(false);

  const code = encodeURIComponent(searchQuery || searchFilter);

  const { translations, loading } = useTranslations();

  const brandId = User.brandId;

  const router = useRouter();
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getCountry();
    getSeason();
    getRiceVariety( )
    getProgram();
    getBrands();
  }, [brandId, showFilterExport, checkedExportBrands]);

  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Procurement");
      if (access) setHasAllAccess(access);
    }
  }, [roleLoading]);

  useEffect(() => {
    if (checkedExportCountries.length > 0 && showFilterExport) {
      getStates();
    } else {
      setStatesExport([]);
    }
  }, [checkedExportCountries, showFilterExport]);

  useEffect(() => {
    if (checkedBrands.length > 0 || brandId) {
      getGinner();
      getFarmGroups();
    }
    if (checkedExportBrands.length > 0 && showFilterExport) {
      getFarmGroups();
    }
  }, [brandId, checkedBrands, showFilterExport, checkedExportBrands]);

  useEffect(() => {
    if (showFilterExport && checkedExportStates.length > 0) {
      getGinner();
    } else {
      setGinnerExport([]);
    }
  }, [showFilterExport, checkedExportStates]);

  useEffect(() => {
    getTransactions();
  }, [brandId, searchQuery, page, limit, isClear]);

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true);
  };


  const getTransactions = async () => {
    const url = `procurement/get-transactions?RiceVarietyId=${checkedRiceVariety}&countryId=${checkedCountries}&brandId=${brandId ? brandId : checkedBrands
      }&seasonId=${checkedSeasons}&programId=${checkedPrograms}&ginnerId=${checkedGinners}&search=${code}&startDate=${startDates}&endDate=${endDates}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };
  const TransActionDetails = async (seasonId: any, farmerId: any) => {
    const url = `procurement/get-season-farmer-transactions?seasonId=${seasonId}&farmerId=${farmerId}`
    try {
      const response = await API.get(url)
      setViewData(response?.data)
    }
    catch (error) {
      console.log(error, "error");
    }
  }

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleFrom = (date: any) => {
    let start = new Date(date);
    setStartDates(start);
  };
  const handleTo = (date: any) => {
    let end = new Date(date);
    setEndDates(end);
  };

  const handleFromExport = (date: any) => {
    let start = new Date(date);
    setExportStartDates(start);
  };
  const handleToExport = (date: any) => {
    let end = new Date(date);
    setExportEndDates(end);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setShowTransactionPopUp(false);
  };

  const handleExport = async () => {
    if (checkedExportSeasons.length === 0) {
      setErrorExport(true);
      return;
    }
    if (startExportDates !== "" && endExportDates === "") {
      setErrorDateExport(true);
      return;
    }
    const url = `procurement/export-bulk-transactions?countryId=${checkedExportCountries}&stateId=${checkedExportStates}&farmGroupId=${checkedExportFarmGroups}&status=${checkedExportStatus}&brandId=${checkedExportBrands}&seasonId=${checkedExportSeasons}&programId=${checkedExportPrograms}&ginnerId=${checkedExportGinners}&startDate=${startExportDates}&endDate=${endExportDates}`;
    try {
      setShowExportMessage(true);
      setErrorExport(false);
      setErrorDateExport(false);

      setIsExportClear(true);
      const response = await API.get(url);
      if (response.success) {
        if (response.data) {
          handleDownload(response.data, "Transactions", ".xlsx");
          exportClear();
          setShowFilterExport(!showFilterExport);
          setIsExportClear(false);
          setShowExportMessage(false);
        } else {
          setIsExportClear(false);
          setShowExportMessage(false);
        }
      }
    } catch (error) {
      console.log(error, "error");
      setIsExportClear(false);
      setShowExportMessage(false);
    }
  };
  const viewTransactionDetails = (seasonId: any, farmerId: any) => {
    setShowTransactionPopUp(true);
    TransActionDetails(seasonId, farmerId)
  };

  const getRiceVariety = async () => {
    const url = "rice-variety";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        if (showFilterExport === true) {
          setRiceVarietyExport(res);
        } else {
          setRiceVariety(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getCountry = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        if (showFilterExport === true) {
          setCountryExport(res);
        } else {
          setCountry(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getStates = async () => {
    const url = `location/get-states?status=true&countryId=${checkedExportCountries}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        if (showFilterExport === true) {
          setStatesExport(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getFarmGroups = async () => {
    try {
      if (brandId) {
        const res = await API.get(`farm-group?brandId=${brandId}`);
        if (res.success) {
          setFarmGroups(res.data);
        }
      } else if (showFilterExport === true) {
        if (checkedExportBrands.length !== 0) {
          const res = await API.get(
            `farm-group?brandId=${checkedExportBrands}`
          );
          if (res.success) {
            setFarmGroupsExport(res.data);
          }
        } else {
          setFarmGroupsExport([]);
        }
      } else {
        if (checkedBrands.length !== 0) {
          const res = await API.get(`farm-group?brandId=${checkedBrands}`);
          if (res.success) {
            setFarmGroups(res.data);
          }
        } else {
          setFarmGroups([]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSeason = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        if (showFilterExport === true) {
          setSeasonExport(res);
        } else {
          setSeason(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getProgram = async () => {
    try {
      if (showFilterExport === true && checkedExportBrands.length > 0) {
        const response = await API.get(
          `brand/program/get?brandId=${checkedExportBrands}`
        );
        if (response.success) {
          const res = response.data;
          setProgramExport(res);
        }
      } else {
        setProgramExport([]);
      }
      let url = brandId ? `brand/program/get?brandId=${brandId}` : "program";
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setProgram(res);
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
        if (showFilterExport) {
          setBrandsExport(res);
        } else {
          setBrands(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getGinner = async () => {
    const url = `mandi?brandId=${brandId ? brandId : checkedBrands.join(",")}`;
    try {
      if (showFilterExport && checkedExportStates.length > 0) {
        const response = await API.get(`mandi?stateId=${checkedExportStates}`);
        if (response.success) {
          const res = response.data;
          setGinnerExport(res);
        }
      } else {
        setGinnerExport([]);
      }
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setGinner(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  useEffect(() => {
    if (programExport && checkedExportPrograms) {
      const program: any = programExport.find(
        (p: any) => p.program_name === "Organic" || p.program_name === "organic"
      );
      if (program) {
        const programId = program.id;
        if (checkedExportPrograms.includes(programId)) {
          setSelectedProgram("Organic");
        } else {
          setSelectedProgram("");
        }
      }
    }
  }, [programExport, checkedExportPrograms]);

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
    } 
    
   else if (name === "riceVariety") {
      if (checkedRiceVariety.includes(itemId)) {
        setCheckedVariety(
          checkedRiceVariety.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedVariety([...checkedRiceVariety, itemId]);
      }
    }
    else if (name === "brands") {
      if (checkedBrands.includes(itemId)) {
        setCheckedBrands(checkedBrands.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrands([...checkedBrands, itemId]);
      }
    } else if (name === "programs") {
      if (checkedPrograms.includes(itemId)) {
        setCheckedPrograms(
          checkedPrograms.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedPrograms([...checkedPrograms, itemId]);
      }
    } else if (name === "farmGroups") {
      if (checkedFarmGroups.includes(itemId)) {
        setCheckedFarmGroups(
          checkedFarmGroups.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedFarmGroups([...checkedFarmGroups, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    } else if (name === "ginners") {
      if (checkedGinners.includes(itemId)) {
        setCheckedGinners(
          checkedGinners.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGinners([...checkedGinners, itemId]);
      }
    }
  };

  const clearFilter = () => {
    setCheckedCountries([]);
    setCheckedVariety([])
    setCheckedFarmGroups([]);
    setCheckedGinners([]);
    setCheckedPrograms([]);
    setCheckedBrands([]);
    setCheckedSeasons([]);
    setSearchFilter("");
    setStartDates("");
    setEndDates("");
    setIsClear(!isClear);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <>
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
                          <div className="col-12 col-md-6 col-lg-3 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Select a Brand
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
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
                                  "brands",
                                  true
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
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
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Program
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={program?.filter((item: any) =>
                              checkedPrograms.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "programs",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "programs"
                              );
                            }}
                            options={program}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Country
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="county_name"
                            selectedValues={country?.filter((item: any) =>
                              checkedCountries.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "countries",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() { }}
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

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Farm Groups
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={farmGroups?.filter((item: any) =>
                              checkedFarmGroups.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "farmGroups",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "farmGroups"
                              )
                            }
                            options={farmGroups}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Mandi
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={ginner?.filter((item: any) =>
                              checkedGinners.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "ginners",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "ginners"
                              )
                            }
                            options={ginner}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Seasons
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={season?.filter((item: any) =>
                              checkedSeasons.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "seasons",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() { }}
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

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Rice Variety
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="variety_name"
                            selectedValues={riceVariety?.filter((item: any) =>
                              checkedRiceVariety.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "riceVariety",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "riceVariety"
                              )
                            }
                            options={riceVariety}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Date From
                          </label>
                          <DatePicker
                            selected={startDates}
                            onChange={handleFrom}
                            showYearDropdown
                            placeholderText="Select a date"
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Date To
                          </label>
                          <DatePicker
                            selected={endDates}
                            onChange={handleTo}
                            showYearDropdown
                            placeholderText="Select a date"
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                        </div>
                      </div>
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              getTransactions();
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
          </>
        )}
      </div>
    );
  };

  const handleExportChange = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    let itemName = selectedItem?.name;

    if (name === "countries") {
      setCheckedExportStates([]);
      if (checkedExportCountries.includes(itemId)) {
        setCheckedExportCountries(
          checkedExportCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportCountries([...checkedExportCountries, itemId]);
      }
    } 
    else   if (name === "riceVariety") {
      setCheckedExportRIce([]);
      if (checkedExportRice.includes(itemId)) {
        setCheckedExportRIce(
          checkedExportRice.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportRIce([...checkedExportRice, itemId]);
      }
    } 
    else if (name === "states") {
      setCheckedExportGinners([]);
      if (checkedExportStates.includes(itemId)) {
        setCheckedExportStates(
          checkedExportStates.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportStates([...checkedExportStates, itemId]);
      }
    } else if (name === "programs") {
      setCheckedExportFarmGroups([]);
      setCheckedExportPrograms(selectedList.map((item: any) => item.id));
    } else if (name === "brands") {
      setCheckedExportPrograms([]);
      setCheckedExportFarmGroups([]);
      if (checkedExportBrands.includes(itemId)) {
        setCheckedExportBrands(
          checkedExportBrands.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportBrands([...checkedExportBrands, itemId]);
      }
    } else if (name === "farmGroups") {
      if (checkedExportFarmGroups.includes(itemId)) {
        setCheckedExportFarmGroups(
          checkedExportFarmGroups.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportFarmGroups([...checkedExportFarmGroups, itemId]);
      }
    } else if (name === "ginners") {
      if (checkedExportGinners.includes(itemId)) {
        setCheckedExportGinners(
          checkedExportGinners.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportGinners([...checkedExportGinners, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedExportSeasons.includes(itemId)) {
        setCheckedExportSeasons(
          checkedExportSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportSeasons([...checkedExportSeasons, itemId]);
      }
    } else if (name === "status") {
      if (checkedExportStatus.includes(itemName)) {
        setCheckedExportStatus(
          checkedExportStatus.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedExportStatus([...checkedExportStatus, itemName]);
      }
    }
  };

  const exportClear = () => {
    setCheckedExportSeasons([]);
    setCheckedExportRIce([])
    setCheckedExportPrograms([]);
    setCheckedExportBrands([]);
    setCheckedExportCountries([]);
    setCheckedExportStates([]);
    setCheckedExportFarmGroups([]);
    setCheckedExportGinners([]);
    setCheckedExportStatus([]);
    setExportStartDates("");
    setExportEndDates("");
  };

  const FilterExport = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md max-h-full overflow-auto">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">Filters</h3>
                  <button
                    className="text-[20px] w-auto"
                    style={
                      isExportClear
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer" }
                    }
                    disabled={isExportClear}
                    onClick={() => {
                      setErrorExport(false);
                      setErrorDateExport(false);
                      exportClear();
                      setShowFilterExport(!showFilterExport);
                    }}
                  >
                    &times;
                  </button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Seasons
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={seasonExport?.filter((item: any) =>
                              checkedExportSeasons.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "seasons"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "seasons"
                              )
                            }
                            options={seasonExport}
                            showCheckbox
                          />
                          {errorExport && (
                            <p className="text-red-500  text-sm mt-1">
                              Season is Required
                            </p>
                          )}
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Brands
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="brand_name"
                            selectedValues={brandsExport?.filter((item: any) =>
                              checkedExportBrands.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "brands"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "brands"
                              )
                            }
                            options={brandsExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Programs
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={programExport?.filter((item: any) =>
                              checkedExportPrograms.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "programs"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "programs"
                              );
                            }}
                            options={programExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Countries
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="county_name"
                            selectedValues={countryExport?.filter((item: any) =>
                              checkedExportCountries.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "countries"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "countries"
                              )
                            }
                            options={countryExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select States
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="state_name"
                            selectedValues={statesExport?.filter((item: any) =>
                              checkedExportStates.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "states"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "states"
                              )
                            }
                            options={statesExport}
                            showCheckbox
                          />
                        </div>
                        {selectedProgram && (
                          <div className="col-12 col-md-6 col-lg-3 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Select Farm Groups
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
                              displayValue="name"
                              selectedValues={farmGroupsExport?.filter(
                                (item: any) =>
                                  checkedExportFarmGroups.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleExportChange(
                                  selectedList,
                                  selectedItem,
                                  "farmGroups"
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleExportChange(
                                  selectedList,
                                  selectedItem,
                                  "farmGroups"
                                )
                              }
                              options={farmGroupsExport}
                              showCheckbox
                            />
                          </div>
                        )}

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Mandies
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={ginnerExport?.filter((item: any) =>
                              checkedExportGinners.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "ginners"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "ginners"
                              )
                            }
                            options={ginnerExport}
                            showCheckbox
                          />
                        </div>

                        {/* <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Rice Variety
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="variety_name"
                            selectedValues={riceVarietyExport?.filter((item: any) =>
                              checkedExportRice.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "riceVariety"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "riceVariety"
                              )
                            }
                            options={riceVarietyExport}
                            showCheckbox
                          />
                        </div> */}

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Date From
                          </label>
                          <DatePicker
                            selected={startExportDates}
                            onChange={handleFromExport}
                            showYearDropdown
                            placeholderText="Select a date"
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Date To
                          </label>
                          <DatePicker
                            selected={endExportDates}
                            onChange={handleToExport}
                            showYearDropdown
                            placeholderText="Select a date"
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errorDateExport && (
                            <p className="text-red-500  text-sm mt-1">
                              To date is required
                            </p>
                          )}
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Status
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={status?.filter((item: any) =>
                              checkedExportStatus.includes(item.name)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "status"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "status"
                              )
                            }
                            options={status}
                            showCheckbox
                          />
                        </div>
                      </div>
                      {showExportMessage && (
                        <div className="flex justify-center mt-3 border-y">
                          <p className="text-center font-semibold text-md text-green-700 py-1">
                            Note: Export all records will take time based on the
                            speed of internet and total no of records
                          </p>{" "}
                        </div>
                      )}
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            disabled={isExportClear}
                            style={
                              isExportClear
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : {
                                  cursor: "pointer",
                                  backgroundColor: "#D15E9C",
                                }
                            }
                            onClick={() => {
                              handleExport();
                              setShowFilter(false);
                            }}
                          >
                            Export
                          </button>
                          <button
                            className="btn-outline-purple"
                            disabled={isExportClear}
                            style={
                              isExportClear
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : { cursor: "pointer" }
                            }
                            onClick={() => {
                              exportClear();
                            }}
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
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };
  const columns = [
    {
      name: <p className="text-[13px] font-medium"> {translations.common.srNo} </p>,
      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations.transactions.date} </p>,
      width: "130px",
      wrap: true,
      selector: (row: any) => dateFormatter(row.date),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.farmerCode} </p>,
      width: "130px",
      wrap: true,
      selector: (row: any) => row.farmer?.code,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.farmerName} </p>,
      width: "130px",
      wrap: true,
      selector: (row: any) =>
        row.farmer?.firstName + " " + row.farmer?.lastName,
      sortable: false,
    },
    !brandId && {
      name: <p className="text-[13px] font-medium"> Brand </p>,
      width: "130px",
      wrap: true,
      selector: (row: any) => row.brand?.brand_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> Rice Variety</p>,
      width: "130px",
      wrap: true,
      selector: (row: any) =>
        row.rice_variety?.variety_name,
      sortable: false,
    },

    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.season} </p>,
      width: "100px",
      wrap: true,
      cell: (row: any) => (
        <>
          {
            hasAccess?.role?.userCategory?.category_name === "Superadmin" ?
              <button
                onClick={() =>
                  viewTransactionDetails(row?.season_id, row?.farmer_id)
                }
                className="text-blue-500 hover:text-blue-300"
              >
                {" "}
                {row?.season?.name}{" "}
              </button> :
              <span>{row?.season?.name}</span>
          }
        </>
      ),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.location.countryName} </p>,
      width: "120px",
      wrap: true,
      cell: (row: any) => row?.country?.county_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.location.stateName} </p>,
      width: "120px",
      wrap: true,
      cell: (row: any) => row?.state?.state_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.location.districtName} </p>,
      width: "120px",
      wrap: true,
      cell: (row: any) => row?.district?.district_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.location.taluk} </p>,
      width: "140px",
      wrap: true,
      cell: (row: any) => row?.block?.block_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.location.village} </p>,
      width: "120px",
      wrap: true,
      cell: (row: any) => row?.village?.village_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.transactionId} </p>,
      width: "120px",
      wrap: true,
      selector: (row: any) => row.id,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.quantityPurchased} </p>,
      width: "150px",
      wrap: true,
      selector: (row: any) => row.qty_purchased,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> Available Paddy </p>,
      width: "140px",
      wrap: true,
      selector: (row: any) => Number(row.farm?.total_estimated_paddy) - Number(row?.farm?.paddy_transacted) || 0,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.price} </p>,
      width: "190px",
      wrap: true,
      selector: (row: any) => row.rate,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.program} </p>,
      width: "100px",
      wrap: true,
      cell: (row: any) => row?.program?.program_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.vehicleNo} </p>,
      width: "100px",
      wrap: true,
      selector: (row: any) => row.vehicle,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Mandi Name</p>,
      width: "120px",
      wrap: true,
      cell: (row: any) => row?.mandi?.name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.proofDocument} </p>,
      width: "150px",
      wrap: true,
      selector: (row: any) => row.proof,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.common.status} </p>,
      cell: (row: any) => row.status,
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.common.action} </p>,
      cell: (row: any) => (
        <>
          {row.status === "Pending" && (
            <div className="flex items-center">
              {/* {hasAllAccess?.edit && (
                <button
                  onClick={() =>
                    router.push(
                      `/services/procurement/transactions/view-transactions?id=${row.id}`
                    )
                  }
                  className="bg-green-500 p-2 ml-3 rounded"
                >
                  <FaEye size={18} color="white" />
                </button>
              )} */}
              {hasAllAccess?.delete && (
                <button
                  onClick={() => handleDelete(row.id)}
                  className="bg-red-500 p-2 ml-3 rounded"
                >
                  <AiFillDelete size={18} color="white" />
                </button>
              )}
            </div>
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ].filter(Boolean);

  if (!roleLoading && !hasAllAccess.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <Link
                        href={!brandId ? "/dashboard" : "/brand/dashboard"}
                        className="active"
                      >
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>Services</li>
                    <li>Procurement</li>
                    <li>Transactions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* <div className="flex flex-wrap gap-5 ml-5">
              {transactionsCount.map((transaction: any) => (
                <div className="w-auto" key={transaction.program_id}>
                  <div className="relative w-300 h-300 mb-10 border-b border-[#00a69a]">
                    <p className="absolute top-4 left-4 mt-2 text-white text-lg font-semibold">{transaction.program_name}</p>
                    <Image
                      src="/images/cottnchip.png"
                      alt="Image Description"
                      width={300}
                      height={300}
                    />
                    <div className="text-black mt-4 mb-2">PROCURED QUANTITY: <div className='text-black text-xs font-semibold'> {transaction.total_qty_purchased} Kgs</div> </div>
                  </div>
                </div>
              ))}

              <div className="w-auto self-start ">
                <div className="relative w-300 h-300 mb-10 border-b border-[#d41b1c]">
                  <div className="absolute mt-2 left-4 text-white">
                    <p className="text-white py-1 text-sm font-semibold">Brand: { }</p>
                    <p className="text-white py-1 text-sm font-semibold">Program: { }</p>
                    <p className="text-white py-1 text-sm font-semibold">Country: { }</p>
                  </div>
                  <Image
                    src="/images/brand.png"
                    alt="Image Description"
                    width={300}
                    height={300}
                  />
                  <div className="text-black  text-sm mt-4 mb-2">PROCURED QUANTITY:  <div className='text-black text-xs font-semibold'> 0 Kgs</div></div>

                </div>
              </div>
            </div> */}

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
                      {!brandId && (
                        <div className="flex">
                          <div className="search-filter-right">
                            <button
                              className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                              onClick={() => {
                                setShowFilterExport(!showFilterExport);
                              }}
                            >
                              {translations.common.export}
                            </button>
                            <div className="relative">
                              <FilterExport
                                openFilter={showFilterExport}
                                onClose={!showFilterExport}
                              />
                            </div>
                          </div>
                          <div className="search-filter-right ml-3">
                            <button
                              className="btn btn-all btn-purple"
                              onClick={() =>
                                router.push(
                                  "/services/procurement/transactions/add-transaction"
                                )
                              }
                            >
                              {translations.common.add}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {showExportMessage && (
                      <div className="flex justify-end">
                        <p className="text-right text-sm">
                          Note: Export all records will take time based on the
                          speed of internet and total no of records
                        </p>{" "}
                      </div>
                    )}
                    <CommonDataTable
                      columns={columns}
                      count={count}
                      data={data}
                      updateData={updatePage}
                    />
                    <div>
                      <ViewDetailsPopUp
                        onCancel={handleCancel}
                        openPopup={showTransactionPopUp}
                        data={viewData}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {showDeleteConfirmation && (
              <DeleteConfirmation
                message="Are you sure you want to delete this?"
                onDelete={async () => {
                  if (deleteItemId !== null) {
                    const url = "procurement/delete-transaction";
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
                        getTransactions();
                      }
                    } catch (error) {
                      console.log(error, "error");
                      toasterError("An error occurred", 3000, deleteItemId);
                    }
                    setShowDeleteConfirmation(false);
                    setDeleteItemId(null);
                  }
                }}
                onCancel={handleCancel}
              />
            )}
          </div>
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
}

const ViewDetailsPopUp = ({ openPopup, data, onCancel }: any) => {

  const handleCancel = () => {
    onCancel();
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">Transaction Id</p>,
      width: "130px",
      wrap: true,
      cell: (row: any) => row.id,
    },
    {
      name: <p className="text-[13px] font-medium">Estimated Paddy</p>,
      width: "150px",
      wrap: true,
      cell: (row: any) => row.total_estimated_paddy,
    },
    {
      name: <p className="text-[13px] font-medium">Available Paddy</p>,
      width: "150px",
      wrap: true,
      cell: (row: any) => row?.available_paddy ? row?.available_paddy : 0,
    },
    {
      name: <p className="text-[13px] font-medium">	Quantity Purchased</p>,
      width: "150px",
      wrap: true,
      cell: (row: any) => row.qty_purchased,
    },
    {
      name: <p className="text-[13px] font-medium">	Quantity Stock</p>,
      width: "150px",
      wrap: true,
      cell: (row: any) => row.qty_stock,
    },
  ];
  return (
    <div>
      {openPopup && (
        <div className="flex h-full w-auto z-10 fixed justify-center bg-black bg-opacity-70 top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border h-fit w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3>Transaction Detail</h3>
              <button onClick={handleCancel} className="text-xl">
                &times;
              </button>
            </div>
            <div className="py-2">
              <div className="flex py-2 justify-between border-y">
                <span className="text-sm w-40 mr-8">Farmer Code</span>
                <p className="block w-60 py-1 px-3 text-sm  bg-white">
                  {data[0]?.farmer_code}
                </p>
              </div>

              <div className="flex py-2 justify-between">
                <span className="text-sm mr-8">Farmer Name</span>
                <p className="block w-60 py-1 px-3 text-sm  bg-white">
                  {data[0]?.firstName}
                </p>
              </div>

              <div className="flex py-2 justify-between border-y">
                <span className="text-sm mr-8">Season</span>
                <p className="block w-60 py-1 px-3 mb-3 text-sm  bg-white">
                  {data[0]?.season_name}
                </p>
              </div>

              <DataTable
                persistTableHead
                fixedHeader={true}
                noDataComponent={""}
                fixedHeaderScrollHeight={"500px"}
                columns={columns}
                data={data}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
