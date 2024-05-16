"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { handleDownload,handleReportDownload } from "@components/core/Download";
import moment from "moment";
import { FaDownload, FaEye } from "react-icons/fa";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";
import Loader from "@components/core/Loader";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";

const GinnerBalesReport: any = () => {
  useTitle("Ginner PAddy Process Report");
  const [roleLoading] = useRole();

  const { translations, loading } = useTranslations();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);

  const [program, setProgram] = useState([]);
  const [ginner, setGinner] = useState([]);
  const [brands, setBrands] = useState([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedGinners, setCheckedGinners] = React.useState<any>([]);
  const [defaultSeason, setDefaultSeason] = useState<any>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [isClear, setIsClear] = useState(false);

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);

  const brandId = User.brandId;

  useEffect(() => {
    getCountry();
    getSeason();
    getProgram();
    getBrands();
    setIsClient(true);
  }, [brandId]);

  useEffect(() => {
    getGinner();
  }, [checkedCountries]);

  useEffect(() => {
    if (defaultSeason) {
      getReports();
    }
  }, [brandId, searchQuery, page, limit, isClear, defaultSeason]);

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const getReports = async () => {
    const url = `reports/get-bale-process-report?countryId=${checkedCountries}&ginnerId=${checkedGinners}&programId=${checkedPrograms}&seasonId=${checkedSeasons}&brandId=${
      brandId ? brandId : checkedBrands
    }&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const newData = response?.data?.map((item: any, index: number) => ({
          ...item,
          id: index,
          processId: item.id,
        }));
        setData(newData);
        setCount(response.count);
      }
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
    finally {
      setIsFilterUsed(false)
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

  const getSeason = async () => {
    const currentDate = new Date();
    const url = "season";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setSeason(res);

        const currentSeason = response.data.find((season: any) => {
          const fromDate = new Date(season.from);
          const toDate = new Date(season.to);
          return currentDate >= fromDate && currentDate <= toDate;
        });
        if (currentSeason) {
          setCheckedSeasons([currentSeason.id]);
          setDefaultSeason(currentSeason);
        } else {
          setCheckedSeasons([res[0].id]);
          setDefaultSeason(res[0]);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getProgram = async () => {
    const url = brandId
      ? `brand-interface/get-program?brandId=${brandId}`
      : "program?status=true";
    try {
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
        setBrands(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getGinner = async () => {
    const url = `ginner?countryId=${checkedCountries.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setGinner(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleExport = async () => {
    const url = `reports/export-bale-process-report?countryId=${checkedCountries}&ginnerId=${checkedGinners}&programId=${checkedPrograms}&seasonId=${checkedSeasons}&brandId=${
      brandId ? brandId : checkedBrands
    }&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
    try {
      setIsDataLoading(true);
      const response = await API.get(url);
      if (response.success) {
        handleDownload(
          response.data,
          "Rice Traceability - Ginner Lint/Bale Process Report",
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
      setIsDataLoading(true);
      const url = `reports/export-bale-process-report?exportType=all`;
      try {
        const response = await API.get(url);
        if (response.success) {
          handleReportDownload(
            response.data,
            "Rice Traceability - Ginner Lint/Bale Process Report",
            ".xlsx"
          );
        }
        setIsDataLoading(false);
      } catch (error) {
        console.log(error, "error");
        setIsDataLoading(false);
      }
  };

  const handleDownloadData = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const blobURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobURL);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };

  const clearFilter = () => {
    setIsFilterUsed(true)
    setCheckedCountries([]);
    setCheckedGinners([]);
    setCheckedPrograms([]);
    setCheckedBrands([]);
    setCheckedSeasons([]);
    setIsClear(!isClear);
  };

  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "countries") {
      setGinner([]);
      setCheckedGinners([]);
      if (checkedCountries?.includes(itemId)) {
        setCheckedCountries(
          checkedCountries?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "brands") {
      if (checkedBrands?.includes(itemId)) {
        setCheckedBrands(checkedBrands?.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrands([...checkedBrands, itemId]);
      }
    } else if (name === "programs") {
      if (checkedPrograms?.includes(itemId)) {
        setCheckedPrograms(
          checkedPrograms?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedPrograms([...checkedPrograms, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons?.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    } else if (name === "ginners") {
      if (checkedGinners?.includes(itemId)) {
        setCheckedGinners(
          checkedGinners?.filter((item: any) => item !== itemId)
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
                            {translations.common.SelectProgram}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={program?.filter((item: any) =>
                              checkedPrograms?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
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
                            onSearch={function noRefCheck() {}}
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
                            {translations.common.SelectCountry}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="county_name"
                            selectedValues={country?.filter((item: any) =>
                              checkedCountries?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
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
                            {translations.common.SelectGinner}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={ginner?.filter((item: any) =>
                              checkedGinners?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
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

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.SelectSeason}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
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
        <Loader />
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
        <p className="text-[13px] font-medium">{translations.common.srNo} </p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: "70px",
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Process Date</p>,
      width: "130px",
      wrap: true,
      selector: (row: any) => dateFormatter(row?.date),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Data Entry Date</p>,
      width: "130px",
      wrap: true,
      selector: (row: any) => dateFormatter(row?.createdAt),
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.season}
        </p>
      ),
      selector: (row: any) => row?.season?.name,
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.ginnerName}
        </p>
      ),
      width: "180px",
      selector: (row: any) => row?.ginner?.name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Heap Number</p>,
      wrap: true,
      selector: (row: any) => row?.heap_number,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.mandiInterface.ginlotNo}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row?.lot_no,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.mandiInterface.ginPressNo}{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row?.gin_press_no,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.mandiInterface.reelLotNo}{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => (
        <Link
          href={`/mandi/mandi-process/view-tracing?reelLotNo=${row?.reel_lot_no}`}
          className="hover:text-blue-600 text-blue-500"
        >
          {row?.reel_lot_no}
        </Link>
      ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.mandiInterface.reelPressNo}{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row?.reel_press_no,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.mandiInterface.noOfBales}{" "}
        </p>
      ),
      selector: (row: any) => row?.no_of_bales,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.mandiInterface.lintQuantity}
        </p>
      ),
      selector: (row: any) => formatDecimal(row?.lint_quantity),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.mandiInterface?.totalSeedCottonConsumed}{" "}
        </p>
      ),
      selector: (row: any) => formatDecimal(row?.total_qty),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.mandiInterface?.got}{" "}
        </p>
      ),
      selector: (row: any) => formatDecimal(row?.gin_out_turn),
    },
    {
      name: (
        <p className="text-[13px] font-medium">Total Lint Cotton Sold (Kgs) </p>
      ),
      selector: (row: any) => formatDecimal(row?.lint_quantity_sold),
    },
    {
      name: <p className="text-[13px] font-medium">Total Bales Sold</p>,
      selector: (row: any) => row?.sold_bales,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total lint cotton in stock (Kgs)
        </p>
      ),
      selector: (row: any) => formatDecimal(row?.lint_stock),
    },
    {
      name: <p className="text-[13px] font-medium"> Total bales in stock</p>,
      selector: (row: any) => formatDecimal(row?.bale_stock),
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.program} </p>,
      wrap: true,
      selector: (row: any) => row?.program?.program_name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.common.village}{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) =>
        row?.village
          ?.map((item: any) => item?.village?.village_name)
          .join(", "),
    },
    {
      name: <p className="text-[13px] font-medium">Heap Register</p>,
      cell: (row: any) =>
        row.heap_register && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.heap_register)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.heap_register, "Heap Number")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Weigh Bridge Receipt</p>,
      cell: (row: any) =>
        row.weigh_bridge && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.weigh_bridge)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.weigh_bridge, "Weigh Bridge")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Delivery Challan</p>,
      cell: (row: any) =>
        row.delivery_challan && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.delivery_challan)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.delivery_challan, "Delivery Challan")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Paddy Process</p>,
      cell: (row: any) =>
        row.bale_process && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.bale_process)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.bale_process, "Paddy Process")
              }
            />
          </>
        ),
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

  const customStyles = {
    headCells: {
      style: {
        width: "140px",
      },
    },
  };

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>

            <div className="farm-group-box">
              <div className="farm-group-inner">
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
                    customStyles={customStyles}
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
  } else {
    return (
      <>
        <Loading />
      </>
    );
  }
};

export default GinnerBalesReport;
