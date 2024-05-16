"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import { useRouter } from "@lib/router-events";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { handleDownload } from "@components/core/Download";
import User from "@lib/User";
import API from "@lib/Api";
import Loader from "@components/core/Loader";
import Multiselect from "multiselect-react-dropdown";
import { BiFilterAlt } from "react-icons/bi";
import { FaDownload } from "react-icons/fa";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";

const GarmentProcessReport: any = () => {
  useTitle("Garment Process Report");
  const router = useRouter();
  const [roleLoading] = useRole();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const code = encodeURIComponent(searchQuery);
  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);

  const [checkedSeasonsForFilter, setCheckedSeasonsForFilter] =
    React.useState<any>([]);

  const [program, setProgram] = useState([]);
  const [garment, setGarment] = useState([]);
  const [brands, setBrands] = useState([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedGarments, setCheckedGarments] = React.useState<any>([]);
  const [defaultSeason, setDefaultSeason] = useState<any>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [isClear, setIsClear] = useState(false);

  const [isDataLoading, setIsDataLoading] = useState(false);

  const brandId = User.brandId;
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);
  const [isAPILoading, setIsAPILoading] = useState<any>(null);

  const [exportAllCountVeryFirstTime, setExportAllCountVeryFirstTime] =
    useState(0);

  const [fullDataCount, setFullDataCount] = useState<any>(null);

  useEffect(() => {
    const getReportsCount = async () => {
      try {
        const response = await API.get(
          `reports/get-garment-fabric-process-report?page=${page}&limit=${limit}&pagination=true`
        );
        console.log(
          "Get garment-fabric-process Reports Count Response : ",
          response?.count
        );
        setFullDataCount(response?.count);
      } catch (error) {
        console.log("Get garment-fabric-process Reports Count Error : ", error);
      }
    };
    getReportsCount();
  }, []);

  useEffect(() => {
    // fetchExportAll
    if (isAPILoading) {
      async function loadFunction() {
        const url = "reports/check-export-load";
        try {
          const response = await API.post(url, {
            file_name: "garment-fabric-process-report.xlsx",
          });
          if (response.data) {
            setIsAPILoading(null);
            handleDownload(
              response.data,
              "Rice Traceability - Garment Fabric Process Report",
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
    getCountry();
    getSeason();
    getProgram();
    getBrands();
  }, []);

  useEffect(() => {
    if (checkedCountries.length !== 0) {
      getGarment();
    } else {
      setCheckedGarments([]);
      setGarment([]);
    }
  }, [checkedCountries]);

  useEffect(() => {
    if (defaultSeason) {
      fetchSales();
    }
  }, [searchQuery, brandId, isClear, page, limit, defaultSeason]);

  const fetchSales = async () => {
    try {
      const response = await API.get(
        `reports/get-garment-fabric-process-report?countryId=${checkedCountries}&garmentId=${checkedGarments}&programId=${checkedPrograms}&seasonId=${checkedSeasons}&brandId=${
          brandId ? brandId : checkedBrands
        }&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`
      );
      if (response.success) {
        const newData = response?.data?.map((item: any, index: number) => ({
          ...item,
          id: index,
          processId: item.id,
        }));
        setData(newData);
        setCount(response.count);
        setExportAllCountVeryFirstTime(exportAllCountVeryFirstTime + 1);
      }
    } catch (error) {
      console.error(error);
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
        const lastThree = res.slice(-3).map((item: any) => item.id);
        setCheckedSeasonsForFilter(lastThree);

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
    const url = "program?status=true";
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

  const getGarment = async () => {
    if (checkedCountries.length !== 0) {
      const url = `garment?countryId=${checkedCountries.join(",")}`;
      try {
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;
          setGarment(res);
        }
      } catch (error) {
        console.log(error, "error");
      }
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
    } else if (name === "garments") {
      if (checkedGarments.includes(itemId)) {
        setCheckedGarments(
          checkedGarments.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGarments([...checkedGarments, itemId]);
      }
    }
  };

  const clearFilter = () => {
    setIsFilterUsed(true)
    setCheckedCountries([]);
    setCheckedGarments([]);
    setCheckedPrograms([]);
    setCheckedBrands([]);
    setCheckedSeasons([]);
    setExportAllCountVeryFirstTime(0);
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
                              checkedPrograms.includes(item.id)
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
                            // id="programs"
                            displayValue="county_name"
                            selectedValues={country?.filter((item: any) =>
                              checkedCountries.includes(item.id)
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
                            {translations.common.SelectGarment}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={garment?.filter((item: any) =>
                              checkedGarments.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "garments",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() {}}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "garments"
                              )
                            }
                            options={garment}
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
                              fetchSales().then(()=> setShowFilter(false));
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
                            {" "}
                            {translations.common.ClearAllFilters}{" "}
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

  const fetchExport = async () => {
    try {
      setIsDataLoading(true);
      const response = await API.get(
        `reports/export-garment-fabric-process-report?countryId=${checkedCountries}&garmentId=${checkedGarments}&programId=${checkedPrograms}&seasonId=${checkedSeasons}&brandId=${
          brandId ? brandId : checkedBrands
        }&status=&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`
      );
      if (response.success) {
        setIsAPILoading(Math.random());
      }
    } catch (error) {
      console.log(error);
      setIsDataLoading(false);
    }
  };

  const fetchExportAll = async () => {
    if (fullDataCount) {
      setIsDataLoading(true);

      try {
        const response = await API.get(
          `reports/export-garment-fabric-process-report?countryId=${checkedCountries}&garmentId=${checkedGarments}&programId=${checkedPrograms}&seasonId=${
            exportAllCountVeryFirstTime === 1
              ? checkedSeasonsForFilter
              : checkedSeasons
          }&brandId=${
            brandId ? brandId : checkedBrands
          }&status=&search=${searchQuery}&page=${page}&limit=${
            exportAllCountVeryFirstTime === 1 ? fullDataCount : count
          }&pagination=true`
        );
        if (response.success) {
          setIsAPILoading(Math.random());
        }
      } catch (error) {
        console.log(error);
        setIsDataLoading(false);
      }
    } else {
      alert("Pleaase wait a minutes");
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const { translations, loading } = useTranslations();
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
      width: "70px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Process Date </p>,
      selector: (row: any) =>
        row?.createdAt ? row?.createdAt?.substring(0, 10) : "",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.transactions.date}{" "}
        </p>
      ),
      selector: (row: any) => row?.date?.substring(0, 10),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.season}
        </p>
      ),
      selector: (row: any) => row?.season?.name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Garment Name</p>,
      cell: (row: any) => row?.garment?.name,
      wrap: true,
    },

    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.FabricOrderRef}
        </p>
      ),
      selector: (row: any) => row?.fabric_order_ref || "-",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.knitterInterface.BrandOrderReference}
        </p>
      ),
      selector: (row: any) => row?.brand_order_ref || "-",
      wrap: true,
    },
    // {
    //   name: <p className="text-[13px] font-medium">Garment Lot No</p>,
    //   selector: (row: any) => row?.garment_lot_no,
    //   wrap: true,
    // },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.FactoryLotNo}
        </p>
      ),
      selector: (row: any) => row?.factory_lot_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Garment Type</p>,
      selector: (row: any) => row?.garmentType,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Style Mark No</p>,
      selector: (row: any) => row?.styleMarkNo,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.totPices}
        </p>
      ),
      selector: (row: any) => row?.noOfPieces,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.millInterface.noOfBoxes}{" "}
        </p>
      ),
      selector: (row: any) => row?.noOfBoxes,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Fabric Weight (Kgs) - Knitted Fabric
        </p>
      ),
      selector: (row: any) => row?.total_fabric_weight,
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Fabric Length (Mts) - Woven Fabric
        </p>
      ),
      selector: (row: any) => row?.total_fabric_length,
      wrap: true,
      width: "120px",
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
      <>
        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="table-minwidth min-w-[650px]">
                <div className="search-filter-row">
                  <div className="search-filter-left ">
                    <div className="search-bars">
                      <form className="form-group mb-0 search-bar-inner">
                        <input
                          type="text"
                          className="form-control form-control-new jsSearchBar "
                          placeholder="Search "
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
                  <div className="space-x-4">
                    <button
                      className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                      onClick={fetchExport}
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
      </>
    );
  } else {
    return (
      <>
        <Loading />
      </>
    );
  }
};

export default GarmentProcessReport;
