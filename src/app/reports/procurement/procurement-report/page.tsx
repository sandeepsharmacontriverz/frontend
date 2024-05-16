"use client";

import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { handleDownload,handleReportDownload } from "@components/core/Download";
import DataTable from "react-data-table-component";
import { BiFilterAlt } from "react-icons/bi";
import moment from "moment";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";
import Loader from "@components/core/Loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";

const ProcurementReport: any = () => {
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [country, setCountry] = useState([]);
  const [states, setStates] = useState([]);
  const [season, setSeason] = useState([]);
  const [program, setProgram] = useState<any>([]);

  const [ginner, setGinner] = useState([]);
  const [brands, setBrands] = useState([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedGinners, setCheckedGinners] = React.useState<any>([]);

  const [showTransactionPopUp, setShowTransactionPopUp] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [viewData, setViewData] = useState<any>({
    transactionId: null,
    farmerId: null,
    farmerName: null,
    farmerCode: null,
    season: null,
    estimatedCotton: null,
    qualityPurchased: null,
    availableCotton: null,
  });
  const [isClear, setIsClear] = useState(false);
  const code = encodeURIComponent(searchQuery);

  const brandId = User.brandId;

  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getCountry();
    getSeason();
    getBrands();
  }, [brandId]);


  useEffect(()=> {
if(brandId || checkedBrands.length > 0){
  getProgram();
}
else{
  setProgram([])
}
  },[checkedBrands, brandId])
  useEffect(() => {
    if (
      checkedCountries.length !== 0
    ) {
      getStates();
    } else {
      setCheckedStates([]);
      setCheckedGinners([]);
    }
  }, [checkedCountries]);

  useEffect(() => {
    if (checkedStates.length > 0) {
      getGinner();
    } else {
      setGinner([]);
    }
  }, [checkedStates, checkedCountries]);

  useEffect(() => {
    getTransactions();
    setIsDataLoading(false);
  }, [searchQuery, page, limit, isClear, brandId]);

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
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

  const getCountry = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        if (res) {      
          setCountry(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getStates = async () => {
    if (
      checkedCountries.length !== 0
    ) {
      const url = `location/get-states?status=true&countryId=${checkedCountries}`;
      try {
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;

          if (res) {
            setStates(res);
          }
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const getSeason = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        if (res) {
          setSeason(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getProgram = async () => {
    try {
      if (brandId || checkedBrands.length > 0) {
        const response = await API.get(
          `brand/program/get?brandId=${brandId ? brandId : checkedBrands}`
        );
        if (response.success) {
          const res = response.data;
          setProgram(res);
        }
      } 
      else{
        setProgram([])
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
        if (res) {
          setBrands(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getGinner = async () => {
    const url = `ginner?brandId=${brandId ? brandId : checkedBrands.join(",")}`;
    try {
      if (checkedStates.length > 0) {
        const response = await API.get(
          `ginner?countryId=${
            checkedCountries
          }`
        );
        if (response.success) {
          const res = response.data;
          setGinner(res);
        }
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

  const getTransactions = async () => {
    const url = `reports/get-transactions?countryId=${checkedCountries}&brandId=${
      brandId ? brandId : checkedBrands
    }&seasonId=${checkedSeasons}&programId=${checkedPrograms}&stateId=${checkedStates}&ginnerId=${checkedGinners}&search=${code}&page=${page}&limit=${limit}&status=Sold&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      setCount(0);
    }
    finally {
      setIsFilterUsed(false)
    }
  };
  const TransActionDetails = async (seasonId: any, farmerId: any) => {
    const url = `procurement/get-season-farmer-transactions?seasonId=${seasonId}&farmerId=${farmerId}`;
    try {
      const response = await API.get(url);
      setViewData(response?.data);
    } catch (error) {
      console.log(error, "error");
    }
  };
  const viewTransactionDetails = (seasonId: any, farmerId: any) => {
    setShowTransactionPopUp(true);
    TransActionDetails(seasonId, farmerId);
  };
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const handleCancel = () => {
    setShowTransactionPopUp(false);
  };

  const handleExport = async () => {
    setIsDataLoading(true);
    const url = `reports/export-procurement-report?countryId=${checkedCountries}&brandId=${
      brandId ? brandId : checkedBrands
    }&seasonId=${checkedSeasons}&programId=${checkedPrograms}&stateId=${checkedStates}&ginnerId=${checkedGinners}&search=${code}&page=${page}&limit=${limit}&status=Sold&pagination=true`;
    try {
      const response = await API.get(url);
      if (response.success) {
        handleDownload(
          response.data,
          "Rice Traceability - Procurement Report",
          ".xlsx"
        );
      }
      setIsDataLoading(false);
    } catch (error) {
      console.log(error, "error");
      setIsDataLoading(false);
    }
  };

  const fetchExportAll = async () => {
      const url = `reports/export-procurement-report?exportType=all`;

      try {
        setIsDataLoading(true);
        const response = await API.get(url);
        if (response.success) {
          handleReportDownload(
            response.data,
            "Rice Traceability - Procurement Report",
            ".xlsx"
          );
          
        }
        setIsDataLoading(false);
      } catch (error: any) {
        console.error("An error occurred during the API request:", error);
        setIsDataLoading(false);
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
    } else if (name === "states") {
      if (checkedStates.includes(itemId)) {
        setCheckedStates(checkedStates.filter((item: any) => item !== itemId));
      } else {
        setCheckedStates([...checkedStates, itemId]);
      }
    } else if (name === "brands") {
      setCheckedPrograms([]);
      if (checkedBrands.includes(itemId)) {
        setCheckedBrands(checkedBrands.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrands([...checkedBrands, itemId]);
      }
    }else if (name === "programs") {
      if (checkedPrograms.includes(itemId)) {
        setCheckedPrograms(checkedPrograms.filter((item: any) => item !== itemId));
      } else {
        setCheckedPrograms([...checkedPrograms, itemId]);
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

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">{translations.common.Filters}</h3>
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
                      {!brandId && (
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.Selectbrand}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="brand_name"
                            selectedValues={brands?.filter((item: any) =>
                              checkedBrands.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
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
                            onSearch={function noRefCheck() {}}
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
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectProgram}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={program?.filter((item: any) =>
                            checkedPrograms.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "programs",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
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
                          {translations.common.SelectSeason}
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
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectCountry}
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

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectState}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="state_name"
                          selectedValues={states?.filter((item: any) =>
                            checkedStates.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "states",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "states",
                              true
                            )
                          }
                          options={states}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectGinner}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={ginner?.filter((item: any) =>
                            checkedGinners.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "ginners",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
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
                            getTransactions().then(()=> setShowFilter(false));
                          }}
                          disabled = {isFilterUsed}
                          style={
                            isFilterUsed
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : { cursor: "pointer", backgroundColor: "#D15E9C" }
                        }
                        >
                          {translations.common.ApplyAllFilters}
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
                          {translations.common.ClearAllFilters}
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

  const clearFilter = () => {
    setIsFilterUsed(true)
    setCheckedCountries([]);
    setCheckedGinners([]);
    setCheckedBrands([]);
    setCheckedStates([]);
    setCheckedSeasons([]);
    setCheckedPrograms([]);
    setIsClear(!isClear);
  };



  if (loading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }

  const columns = [
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.srNo}</p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,
      width: "70px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.date}
        </p>
      ),
      width: "130px",
      selector: (row: any) => dateFormatter(row.date),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.farmerCode}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.farmer?.code,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.farmerName}
        </p>
      ),
      wrap: true,
      width: "160px",
      selector: (row: any) =>
        row.farmer?.lastName ? row.farmer?.firstName + " " + row.farmer?.lastName : row.farmer?.firstName,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.transactions.season}{" "}
        </p>
      ),
      width: "100px",
      wrap: true,
      cell: (row: any) => (
        <>
          {hasAccess?.role?.userCategory?.category_name === "Superadmin" ? (
            <button
              onClick={() =>
                viewTransactionDetails(row?.season_id, row?.farmer_id)
              }
              className="text-blue-500 hover:text-blue-300"
            >
              {" "}
              {row?.season?.name}{" "}
            </button>
          ) : (
            <span>{row?.season?.name}</span>
          )}
        </>
      ),
      sortable: false,
    },

    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.location.countryName}
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.country?.county_name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.location.stateName}
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.state?.state_name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.location.districtName}
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.district?.district_name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.location.taluk}</p>
      ),
      wrap: true,
      width: "120px",
      cell: (row: any) => row?.block?.block_name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.location.village}
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.village?.village_name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.transactionId}
        </p>
      ),
      wrap: true,
      width: "120px",
      selector: (row: any) => row.id,
    },
    // {
    //   name: (<p className="text-[13px] font-medium">{translations.transactions.totalEstimationProduction}</p>),
    //   wrap: true,
    //   width: "120px",
    //   selector: (row: any) => row.estimated_cotton,
    // },

    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.quantityPurchased}
        </p>
      ),
      wrap: true,
      selector: (row: any) => {
        const quantityPurchased: any = formatDecimal(row.qty_purchased);
        return Number(quantityPurchased) < 0
          ? formatDecimal(0)
          : quantityPurchased;
      },
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.availableCotton}
        </p>
      ),
      wrap: true,
      selector: (row: any) => {
        const availableCotton: any = formatDecimal(
          Number(row.farm?.total_estimated_cotton) -
            Number(row?.farm?.cotton_transacted)
        );
        return Number(availableCotton) < 0 ? 0 : availableCotton;
      },
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.price}
        </p>
      ),
      wrap: true,
      selector: (row: any) => formatDecimal(row.rate),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.program}
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.program?.program_name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.vehicleNo}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.vehicle,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.qrProcurement.paymentMethod}
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.payment_method,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.ginnerName}
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.ginner?.name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.qrProcurement.agent}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row?.agent?.firstName,
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <p className="text-sm my-2">
                  <span className="font-bold">{translations.common.note}</span>{" "}
                  {translations.common.transactionNote}
                </p>
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
                            {translations.common.Filters}{" "}
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
                      {!brandId && (
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
                            {/* <div className="relative">
                              <FilterExport
                                openFilter={showFilterExport}
                                onClose={!showFilterExport}
                              />
                            </div> */}
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

const ViewDetailsPopUp = ({ openPopup, data, onCancel }: any) => {
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
      name: <p className="text-[13px] font-medium">Estimated Cotton</p>,
      width: "150px",
      wrap: true,
      cell: (row: any) => row.total_estimated_cotton,
    },
    {
      name: <p className="text-[13px] font-medium"> Quality Purchased</p>,
      width: "150px",
      wrap: true,
      cell: (row: any) => formatDecimal(row.qty_purchased),
    },
    {
      name: <p className="text-[13px] font-medium">Available Cotton</p>,
      width: "150px",
      wrap: true,
      cell: (row: any) =>
        formatDecimal(row?.available_cotton)
          ? formatDecimal(row?.available_cotton)
          : formatDecimal(0),
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

export default ProcurementReport;
