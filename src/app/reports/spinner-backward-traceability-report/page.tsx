"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import moment from "moment";
import { handleDownload } from "@components/core/Download";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";
import Loader from "@components/core/Loader";
import { FaDownload } from "react-icons/fa";
import ModalLoader from "@components/core/ModalLoader";

export default function page() {
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();
  useTitle("Spinner Backward Traceability Report");

  const [isClient, setIsClient] = useState(false);

  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [fabric, setFabric] = useState([]);
  const [season, setSeason] = useState([]);

  const [checkedSeasonsForFilter, setCheckedSeasonsForFilter] =
    React.useState<any>([]);

  const [spinners, setSpinners] = useState([]);
  const [brands, setBrands] = useState([]);
  const [knitters, setKnitters] = useState<any>();
  const [weavers, setWeavers] = useState<any>();

  const [selectedOption, setSelectedOption] = useState<string>("");
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedSpinners, setCheckedSpinners] = React.useState<any>([]);
  const [checkedKnitterId, setCheckedKnitterId] = useState<any>([]);
  const [showFilter, setShowFilter] = React.useState<any>(false);

  const [checkedWeaverId, setCheckedWeaverId] = useState<any>([]);
  const [checkedWeavKnit, setCheckedWeavKnit] = useState<any>([]);

  const [isDataLoading, setIsDataLoading] = useState(false);

  const [isClear, setIsClear] = useState(false);

  const brandId = User.brandId;
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);
  const [isAPILoading, setIsAPILoading] = useState<any>(null);

  useEffect(() => {
    // fetchExportAll
    if (isAPILoading) {
      async function loadFunction() {
        const url = "reports/check-export-load";
        try {
          const response = await API.post(url, {
            file_name: "spinner-backward-traceabilty-report.xlsx",
          });
          if (response.data) {
            setIsAPILoading(null);
            handleDownload(
              response.data,
              "Cotton Connect - Spinner Backward Traceability Report",
              ".xlsx"
            );

            return setIsDataLoading(false);
          }
        } catch (error) {
          console.log("Process Report API Error : ", error);
          setIsDataLoading(false);
        }
      }

      const intervelID = setInterval(loadFunction, 10000);

      return () => clearTimeout(intervelID);
    }
  }, [isAPILoading]);

  useEffect(() => {
    getFabric();
    getSeason();
    getBrands();
    setIsClient(true);
    getSpinners();
  }, [brandId]);

  useEffect(() => {
    getReports();
  }, [brandId, searchQuery, page, limit, isClear]);

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const getReports = async () => {
    const url = `reports/get-spinner-traceability-report?spinnerId=${checkedSpinners}&knitterId=${
      selectedOption === "knitter" ? checkedKnitterId : ""
    }&weaverId=${
      selectedOption === "weaver" ? checkedWeaverId : ""
    }&type=${selectedOption}&seasonId=${checkedSeasons}&brandId=${
      brandId ? brandId : checkedBrands
    }&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
    finally {
      setIsFilterUsed(false)
    }
  };

  const getFabric = async () => {
    try {
      const [weaver, knitter] = await Promise.all([
        API.get(`weaver`),
        API.get(`knitter`),
      ]);
      if (weaver.success && knitter.success) {
        let knitterData = knitter.data;
        setKnitters(knitterData);
        let weaverData = weaver.data;
        setWeavers(weaverData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getSeason = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setSeason(res);
        const lastThree = res.slice(-3).map((item: any) => item.id);
        setCheckedSeasonsForFilter(lastThree);
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

  const getSpinners = async () => {
    const url = `spinner`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setSpinners(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleExport = async () => {
    const url = `reports/export-spinner-traceability-report?spinnerId=${checkedSpinners}&knitterId=${
      selectedOption === "knitter" ? checkedKnitterId : ""
    }&weaverId=${
      selectedOption === "weaver" ? checkedWeaverId : ""
    }&type=${selectedOption}&seasonId=${checkedSeasons}&brandId=${
      brandId ? brandId : checkedBrands
    }&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
    try {
      setIsDataLoading(true);
      const response = await API.get(url);
      if (response.success) {
        setIsAPILoading(Math.random());
      }
    } catch (error) {
      console.log(error, "error");
      setIsDataLoading(false);
    }
  };

  const fetchExportAll = async () => {
    setIsDataLoading(true);

    const url = `reports/export-spinner-traceability-report?spinnerId=${checkedSpinners}&knitterId=${
      selectedOption === "knitter" ? checkedKnitterId : ""
    }&weaverId=${
      selectedOption === "weaver" ? checkedWeaverId : ""
    }&type=${selectedOption}&seasonId=${checkedSeasonsForFilter}&brandId=${
      brandId ? brandId : checkedBrands
    }&search=${searchQuery}&page=${page}&limit=${count}&pagination=true`;
    try {
      const response = await API.get(url);
      if (response.success) {
        setIsAPILoading(Math.random());
      }
    } catch (error) {
      console.log(error, "error");
      setIsDataLoading(false);
    }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setSelectedOption(value);
  };

  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "brands") {
      if (checkedBrands?.includes(itemId)) {
        setCheckedBrands(checkedBrands?.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrands([...checkedBrands, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons?.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    } else if (name === "spinners") {
      if (checkedSpinners?.includes(itemId)) {
        setCheckedSpinners(
          checkedSpinners?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSpinners([...checkedSpinners, itemId]);
      }
    } else if (name === "knitter") {
      if (checkedKnitterId.includes(itemId)) {
        setCheckedKnitterId(
          checkedKnitterId.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedKnitterId([...checkedKnitterId, itemId]);
      }
    } else if (name === "weaver") {
      if (checkedWeaverId.includes(itemId)) {
        setCheckedWeaverId(
          checkedWeaverId.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedWeaverId([...checkedWeaverId, itemId]);
      }
    }
  };

  const clearFilter = () => {
    setIsFilterUsed(true)
    setCheckedSpinners([]);
    setCheckedBrands([]);
    setCheckedSeasons([]);
    setCheckedKnitterId([]);
    setCheckedWeaverId([]);
    setCheckedWeavKnit([]);
    setSelectedOption("");
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
                  <h3 className="text-lg pb-2">
                    {translations.common.Filters}
                  </h3>
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
                              // id="programs"
                              displayValue="brand_name"
                              selectedValues={brands?.filter((item: any) =>
                                checkedBrands?.includes(item.id)
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
                            {translations.common.SelectSpinner}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={spinners?.filter((item: any) =>
                              checkedSpinners?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "spinners",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() {}}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "spinners"
                              )
                            }
                            options={spinners}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.SelectSeason}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={season?.filter((item: any) =>
                              checkedSeasons?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
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
                            Select a Processor
                          </label>
                          <div className="w-100 d-flex flex-wrap mt-2">
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="1"
                                  type="radio"
                                  name="filterby"
                                  value="knitter"
                                  checked={selectedOption === "knitter"}
                                  onChange={handleRadioChange}
                                  className="mr-1"
                                />
                                <span></span>
                              </section>{" "}
                              Knitter
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="2"
                                  type="radio"
                                  name="filterby"
                                  value="weaver"
                                  checked={selectedOption === "weaver"}
                                  onChange={handleRadioChange}
                                  className="mr-1"
                                />
                                <span></span>
                              </section>{" "}
                              Weaver
                            </label>
                          </div>
                        </div>

                        {selectedOption === "knitter" && (
                          <div className="col-12 col-md-6 col-lg-3 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Select Knitter
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
                              displayValue="name"
                              selectedValues={knitters?.filter((item: any) =>
                                checkedKnitterId.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() {}}
                              onRemove={(
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "knitter"
                                );
                              }}
                              onSearch={function noRefCheck() {}}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "knitter"
                                )
                              }
                              options={knitters}
                              showCheckbox
                            />
                          </div>
                        )}

                        {selectedOption === "weaver" && (
                          <div className="col-12 col-md-6 col-lg-3 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Select Weaver
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
                              displayValue="name"
                              selectedValues={weavers?.filter((item: any) =>
                                checkedWeaverId.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() {}}
                              onRemove={(
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "weaver"
                                );
                              }}
                              onSearch={function noRefCheck() {}}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "weaver"
                                )
                              }
                              options={weavers}
                              showCheckbox
                            />
                          </div>
                        )}
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
                              getReports().then(()=> setShowFilter(false));
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
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        {" "}
        <Loader />{" "}
      </div>
    );
  }

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
      name: (
        <p className="text-[13px] font-medium">{translations.common.srNo}</p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: "100px",
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Fabric Mill name</p>,
      selector: (row: any) =>
        row?.knitter
          ? row?.knitter?.name
          : row?.weaver
          ? row?.weaver?.name
          : row?.processor_name,
      width: "200px",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Spinner-Fabric Invoice no</p>
      ),
      selector: (row: any) => row?.invoice_no,
      width: "200px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Spinner Name</p>,
      selector: (row: any) => row?.spinner?.name,
      width: "200px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Yarn REEL Lot Sold</p>,
      selector: (row: any) => row?.reel_lot_no,
      width: "250px",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Ginner to Spinner Invoice</p>
      ),
      selector: (row: any) =>
        row?.gnr_invoice_no && row?.gnr_invoice_no?.length > 0
          ? row?.gnr_invoice_no?.join(", ")
          : "",
      width: "200px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Ginner name</p>,
      selector: (row: any) =>
        row?.gnr_name && row?.gnr_name?.length > 0
          ? row?.gnr_name?.join(", ")
          : "",
      width: "200px",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Bale REEL lot lint consumed</p>
      ),
      selector: (row: any) =>
        row?.gnr_reel_lot_no && row?.gnr_reel_lot_no?.length > 0
          ? row?.gnr_reel_lot_no?.join(", ")
          : "",
      width: "250px",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.location.village}
        </p>
      ),
      selector: (row: any) =>
        row?.frmr_villages && row?.frmr_villages?.length > 0
          ? row?.frmr_villages?.join(", ")
          : "",
      width: "200px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Farm Group</p>,
      selector: (row: any) =>
        row?.frmr_farm_group && row?.frmr_farm_group?.length > 0
          ? row?.frmr_farm_group?.join(", ")
          : "",
      width: "200px",
      wrap: true,
    },
    {
      name: translations?.mandiInterface?.qrCode,
      center: true,
      cell: (row: any) =>
        row?.qr && (
          <div className="h-16 flex">
            <img
              className=""
              src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
            />

            <button
              className=""
              onClick={() =>
                handleDownload(
                  process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
                  "qr",
                  ".png"
                )
              }
            >
              <FaDownload size={18} color="black" />
            </button>
          </div>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li className="active">
                      <Link href="/dashboard">
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>{translations.common.reports}</li>
                    <li>Spinner Backward Traceability Report</li>
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
  }
}
