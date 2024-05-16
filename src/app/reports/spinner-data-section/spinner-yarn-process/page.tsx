"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "next/link";
import { BiFilterAlt } from "react-icons/bi";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { handleDownload,handleReportDownload } from "@components/core/Download";
import User from "@lib/User";
import { FaDownload } from "react-icons/fa";
import Multiselect from "multiselect-react-dropdown";
import Loader from "@components/core/Loader";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";

const SpinnerYarnProcess: any = () => {
  const [isClient, setIsClient] = useState(false);
  useTitle("Spinner Yarn Process Report");
  const [roleLoading] = useRole();

  const brandId = User.brandId;

  const { translations, loading } = useTranslations();

  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClear, setIsClear] = useState(false);

  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);

  const [checkedSeasonsForFilter, setCheckedSeasonsForFilter] =
    React.useState<any>([]);

  const [program, setProgram] = useState([]);
  const [spinner, setSpinner] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedSpinners, setCheckedSpinners] = React.useState<any>([]);

  const [isDataLoading, setIsDataLoading] = useState(false);

  const [defaultSeason, setDefaultSeason] = useState<any>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [cottonMix, setCottonMix] = useState<any>([]);
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);

  const [isActive, setIsActive] = useState<any>({
    country: false,
    brand: false,
    season: false,
    spinner: false,
    program: false,
  });


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getCottonMix(), getCountry();
    getSeason();
    getProgram();
    getBrands();
  }, [brandId]);

  useEffect(() => {
    if (defaultSeason) {
      getReports();
    }
  }, [brandId, searchQuery, page, limit, isClear, defaultSeason]);

  useEffect(() => {
    getSpinner();
  }, [checkedCountries]);

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleExport = async () => {
    const url = `reports/export-spinner-yarn-report?brandId=${
      brandId ? brandId : checkedBrands
    }&programId=${checkedPrograms}&countryId=${checkedCountries}&spinnerId=${checkedSpinners}&seasonId=${checkedSeasons}&page=${page}&limit=${limit}&search=${searchQuery}&pagination=true`;
    try {
      setIsDataLoading(true);
      const response = await API.get(url);
      if (response.success) {
        handleDownload(
          response.data,
          "Rice Traceability - Spinner Yarn Process Report",
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
    const url = `reports/export-spinner-yarn-report?exportType=all`;
    try {
      const response = await API.get(url);
      if (response.success) {
        handleReportDownload(
          response.data,
          "Rice Traceability - Spinner Yarn Process Report",
          ".xlsx"
        );
      }
      setIsDataLoading(false);
    } catch (error) {
      console.log(error, "error");
      setIsDataLoading(false);
    }
};

  const getReports = async () => {
    const url = `reports/get-spinner-yarn-report?brandId=${
      brandId ? brandId : checkedBrands
    }&countryId=${checkedCountries}&spinnerId=${checkedSpinners}&programId=${checkedPrograms}&seasonId=${checkedSeasons}&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
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
        const currentSeason = response?.data?.find((season: any) => {
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
      : "program";
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

  const getSpinner = async () => {
    const url = `spinner?countryId=${checkedCountries.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setSpinner(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getCottonMix = async () => {
    const url = "cottonmix";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCottonMix(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getBlendNames = (ids: any) => {
    const matchId = cottonMix
      ?.filter((cottonMix: any) => ids?.includes(cottonMix.id))
      .map((item: any) => item.cottonMix_name);
    const getId = matchId?.map((cottonMix: any) => cottonMix);
    return getId?.join(", ");
  };

  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "countries") {
      setSpinner([]);
      setCheckedSpinners([]);
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
    } else if (name === "programs") {
      if (checkedPrograms.includes(itemId)) {
        setCheckedPrograms(
          checkedPrograms.filter((item: any) => item !== itemId)
        );
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
    } else if (name === "spinners") {
      if (checkedSpinners.includes(itemId)) {
        setCheckedSpinners(
          checkedSpinners.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSpinners([...checkedSpinners, itemId]);
      }
    }
  };

  const clearFilter = () => {
    setIsFilterUsed(true)
    setCheckedCountries([]);
    setCheckedSpinners([]);
    setCheckedPrograms([]);
    setCheckedBrands([]);
    setCheckedSeasons([]);
    setIsClear(!isClear);
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
                            checkedPrograms?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "programs",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
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
                          {translations.common.SelectCountry}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="county_name"
                          selectedValues={country?.filter((item: any) =>
                            checkedCountries?.includes(item.id)
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
                          {translations.common.SelectSpinner}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={spinner?.filter((item: any) =>
                            checkedSpinners?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
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
                          options={spinner}
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
        )}
      </div>
    );
  };

  const dateFormatter = (date: any) => {
    const formatted = new Date(date)
      .toJSON()
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("/");
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
      sortable: false,
      width: "70px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.transactions.date}{" "}
        </p>
      ),
      width: "120px",
      cell: (row: any) => dateFormatter(row?.date),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.season}
        </p>
      ),
      cell: (row: any) => row?.season?.name,
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.millInterface.spinnerName}
        </p>
      ),
      cell: (row: any) => row?.spinner?.name,
      width: "150px",
      wrap: true,
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.millInterface.spinlotNo}{" "}
        </p>
      ),
      cell: (row: any) => row?.batch_lot_no,
      width: "150px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Yarn Reel Lot No </p>,
      cell: (row: any) => row?.reel_lot_no,
      wrap: true,
      width: "190px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.millInterface.yarnType}{" "}
        </p>
      ),
      cell: (row: any) => row?.yarn_type,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.millInterface.yarnCount}
        </p>
      ),
      cell: (row: any) =>
        row.yarncount?.map((item: any) => item.yarnCount_name)?.join(", "),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.millInterface.yarnRealistation}{" "}
        </p>
      ),
      cell: (row: any) => formatDecimal(row?.yarn_realisation),
    },
    // {
    //   name: <p className="text-[13px] font-medium">{translations.millInterface.noOfBoxes}</p>,
    //   cell: (row: any) => row?.no_of_boxes
    // },
    // {
    //   name: <p className="text-[13px] font-medium"> {translations.millInterface.boxId} </p>,
    //   cell: (row: any) => row?.box_id
    // },
    {
      name: <p className="text-[13px] font-medium"> Comber Noil (Kgs)</p>,
      cell: (row: any) => formatDecimal(row?.comber_noil),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.millInterface.blend}{" "}
        </p>
      ),
      cell: (row: any) => getBlendNames(row?.cottonmix_type),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.millInterface.blendQuantity}{" "}
        </p>
      ),
      cell: (row: any) => row?.cottonmix_qty?.join(","),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          Total Seed cotton consumed (Kgs){" "}
        </p>
      ),
      cell: (row: any) => formatDecimal(row?.net_yarn_qty),
    },
    {
      name: <p className="text-[13px] font-medium">{translations.program}</p>,
      cell: (row: any) => row?.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">Total Yarn weight (KGs)</p>,
      cell: (row: any) => formatDecimal(row?.net_yarn_qty),
    },
    {
      name: <p className="text-[13px] font-medium">Total Yarn Sold (KGs)</p>,
      cell: (row: any) => formatDecimal(row?.yarn_sold),
    },
    {
      name: (
        <p className="text-[13px] font-medium">Total Yarn in Stock (KGs)</p>
      ),
      cell: (row: any) => formatDecimal(row?.qty_stock),
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
  } else {
    return (
      <>
        <Loading />
      </>
    );
  }
};

export default SpinnerYarnProcess;
