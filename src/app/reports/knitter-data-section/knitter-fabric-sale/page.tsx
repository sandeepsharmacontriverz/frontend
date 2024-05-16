"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "next/link";
import { BiFilterAlt } from "react-icons/bi";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa";
import moment from "moment";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";

const KnitterFabricSales: any = () => {
  const [isClient, setIsClient] = useState(false);
  useTitle("Knitter Fabric Sale Report");
  const [roleLoading] = useRole();

  const { translations, loading } = useTranslations();

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<any>([]);
  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);

  const [checkedSeasonsForFilter, setCheckedSeasonsForFilter] =
    React.useState<any>([]);

  const [program, setProgram] = useState([]);
  const [knitter, setKnitter] = useState([]);
  const [buyer, setBuyer] = useState([]);
  const [brands, setBrands] = useState([]);
  const [fabric, setFabric] = useState([]);

  const [checkedFabric, setCheckedFabric] = React.useState<any>([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedKnitters, setCheckedKnitters] = React.useState<any>([]);
  const [checkedBuyers, setCheckedBuyers] = React.useState<any>([]);
  const [isClear, setIsClear] = useState(false);
  const [defaultSeason, setDefaultSeason] = useState<any>(null);

  const brandId = User.brandId;

  const [isDataLoading, setIsDataLoading] = useState(false);

  const [showMainFilters, setShowMainFilters] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);
  const [isAPILoading, setIsAPILoading] = useState<any>(null);

  const [exportAllCountVeryFirstTime, setExportAllCountVeryFirstTime] =
    useState(0);

  const [fullDataCount, setFullDataCount] = useState<any>(null);

  useEffect(() => {
    const getReportsCount = async () => {
      try {
        const response = await API.get(
          `reports/get-knitter-sales-report?page=${page}&limit=${limit}&pagination=true`
        );
        console.log(
          "Get knitter-sales-report Reports Count Response : ",
          response?.count
        );
        setFullDataCount(response?.count);
      } catch (error) {
        console.log("Get knitter-sales-report Reports Count Error : ", error);
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
            file_name: "knitter-fabric-sale-report.xlsx",
          });
     
          if (response.data) {
            setIsAPILoading(null);
            handleDownload(
              response.data,
              "Rice Traceability - Knitter Fabric Sale Report",
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
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (defaultSeason) {
      getReports();
    }
  }, [searchQuery, brandId, isClear, page, limit, defaultSeason]);

  useEffect(() => {
    getCountry();
    getSeason();
    getProgram();
    getKnitFabric();
    getBrands();
  }, [brandId]);

  useEffect(() => {
    getKnitter();
    getBuyer();
  }, [checkedCountries]);

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
  };

  const handleExport = async () => {
    const url = `reports/export-knitter-sales-report?countryId=${checkedCountries}&brandId=${
      brandId ? brandId : checkedBrands
    }&seasonId=${checkedSeasons}&programId=${checkedPrograms}&knitterId=${checkedKnitters}&fabricType=${checkedFabric}&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
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
    if (fullDataCount) {
      setIsDataLoading(true);

      const url = `reports/export-knitter-sales-report?countryId=${checkedCountries}&brandId=${
        brandId ? brandId : checkedBrands
      }&seasonId=${
        exportAllCountVeryFirstTime === 1
          ? checkedSeasonsForFilter
          : checkedSeasons
      }&programId=${checkedPrograms}&knitterId=${checkedKnitters}&fabricType=${checkedFabric}&search=${searchQuery}&page=${page}&limit=${
        exportAllCountVeryFirstTime === 1 ? fullDataCount : count
      }&pagination=true`;

      try {
        const response = await API.get(url);
        if (response.success) {
          setIsAPILoading(Math.random());
        }
      } catch (error) {
        console.log(error, "error");
        setIsDataLoading(false);
      }
    } else {
      alert("Pleaase wait a minutes");
    }
  };

  const getReports = async () => {
    const url = `reports/get-knitter-sales-report?countryId=${checkedCountries}&brandId=${
      brandId ? brandId : checkedBrands
    }&seasonId=${checkedSeasons}&programId=${checkedPrograms}&knitterId=${checkedKnitters}&fabricType=${checkedFabric}&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
      setExportAllCountVeryFirstTime(exportAllCountVeryFirstTime + 1);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
    finally {
      setIsFilterUsed(false)
    }
  };

  const getKnitFabric = async () => {
    try {
      const res = await API.get("fabric-type?status=true");
      if (res.success) {
        setFabric(res.data);
      }
    } catch (error) {
      console.log(error);
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

  const getKnitter = async () => {
    const url = `knitter?countryId=${checkedCountries?.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setKnitter(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getBuyer = async () => {
    const url = `garment?countryId=${checkedCountries?.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setBuyer(res);
      }
    } catch (error) {
      console.log(error, "error");
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
      setKnitter([]);
      setBuyer([]);
      setCheckedKnitters([]);
      setCheckedBuyers([]);
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
    } else if (name === "knitters") {
      if (checkedKnitters?.includes(itemId)) {
        setCheckedKnitters(
          checkedKnitters?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedKnitters([...checkedKnitters, itemId]);
      }
    } else if (name === "buyers") {
      if (checkedBuyers?.includes(itemId)) {
        setCheckedBuyers(checkedBuyers?.filter((item: any) => item !== itemId));
      } else {
        setCheckedBuyers([...checkedBuyers, itemId]);
      }
    } else if (name === "fabrics") {
      if (checkedFabric?.includes(itemId)) {
        setCheckedFabric(checkedFabric?.filter((item: any) => item !== itemId));
      } else {
        setCheckedFabric([...checkedFabric, itemId]);
      }
    }
  };

  const clearFilter = () => {
    setIsFilterUsed(true)
    setCheckedCountries([]);
    setCheckedKnitters([]);
    setCheckedPrograms([]);
    setCheckedBrands([]);
    setCheckedSeasons([]);
    setCheckedBuyers([]);
    setCheckedFabric([]);
    setExportAllCountVeryFirstTime(0);
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
                  onClick={() => setShowMainFilters(!showMainFilters)}
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
                          Select a Knitter
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={knitter?.filter((item: any) =>
                            checkedKnitters?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "knitters",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "knitters"
                            )
                          }
                          options={knitter}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Sold to
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={buyer?.filter((item: any) =>
                            checkedBuyers?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "buyers",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "buyers"
                            )
                          }
                          options={buyer}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Fabric
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="fabricType_name"
                          selectedValues={fabric?.filter((item: any) =>
                            checkedFabric?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "fabrics",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "fabrics"
                            )
                          }
                          options={fabric}
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
                            getReports().then(()=> setShowMainFilters(false));
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
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
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

  if (loading) {
    return (
      <div>
        {" "}
        <Loader />{" "}
      </div>
    );
  }

  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const fileName = (item: any) => {
      let file = item.split("file/");
      return file ? file[1] : "";
    };
    const columnsArr: any = [
      {
        name: (
          <p className="text-[13px] font-medium">
            {translations?.common?.srNo}
          </p>
        ),
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: (
          <p className="text-[13px] font-medium">
            {translations?.knitterInterface?.File}
          </p>
        ),
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: (
          <p className="text-[13px] font-medium">
            {translations?.common?.Action}
          </p>
        ),
        selector: (row: any) => (
          <>
            <div className="flex items-center">
              <FaEye
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer mr-2"
                onClick={() => handleView(row)}
              />
              <FaDownload
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer"
                onClick={() => handleDownloadData(row, "Blend Document")}
              />
            </div>
          </>
        ),
        center: true,
        wrap: true,
      },
    ];

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">
                    {translations?.common?.InVoiceFiles}
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
                        <DataTable
                          columns={columnsArr}
                          data={dataArray}
                          persistTableHead
                          fixedHeader={true}
                          noDataComponent={"No data available in table"}
                          fixedHeaderScrollHeight="600px"
                        />
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

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: "70px",
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> Date of Sale </p>,
      width: "130px",
      wrap: true,
      selector: (row: any) =>
        row?.createdAt ? dateFormatter(row?.createdAt) : "",
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.transactions.date}{" "}
        </p>
      ),
      width: "130px",
      wrap: true,
      selector: (row: any) => (row?.date ? dateFormatter(row?.date) : ""),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> Knitter Name </p>,
      selector: (row: any) => row?.knitter,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Sold To </p>,
      selector: (row: any) =>
        row?.garment
          ? row?.garment
          : row?.fabric
          ? row?.fabric
          : row?.processor_name,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Invoice Number </p>,
      selector: (row: any) => row?.invoice_no,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.InVoiceFiles}
        </p>
      ),
      cell: (row: any) =>
        row?.invoice_file &&
        row?.invoice_file.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row?.invoice_file)}
              title="Click to View All Files"
            />
          </>
        ),
    },
    // {
    //   name: <p className="text-[13px] font-medium"> Fabric Lot No </p>,
    //   selector: (row: any) => row?.fabric_lot_no,
    //   wrap: true,
    // },
    {
      name: <p className="text-[13px] font-medium"> Finished Batch/Lot No </p>,
      selector: (row: any) => row?.batch_lot_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Fabric Type </p>,
      selector: (row: any) => row?.fabricType,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Agent Details </p>,
      selector: (row: any) => row?.transaction_agent,
      wrap: true,
    },

    {
      name: <p className="text-[13px] font-medium"> Finished Fabric Weight</p>,
      selector: (row: any) => row?.net_weight,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium"> Total Fabric Net weight </p>
      ),
      selector: (row: any) => row?.total_qty,
      wrap: true,
    },
    {
      name: <p className="text-[12px] font-medium">TC File</p>,
      center: true,
      cell: (row: any) =>
        row?.tc_files && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row?.tc_files)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleDownloadData(row?.tc_files, "tcFile")}
            />
          </>
        ),
    },
    {
      name: <p className="text-[12px] font-medium">Contract Files</p>,
      center: true,
      cell: (row: any) =>
        row?.contract_file && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row?.contract_file)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row?.contract_file, "contractFile")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[12px] font-medium">Delivery Notes</p>,
      center: true,
      cell: (row: any) =>
        row?.delivery_notes && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row?.delivery_notes)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row?.delivery_notes, "delivery_notes")
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

  // const customStyles = {
  //   headCells: {
  //     style: {
  //       width: '140px',
  //     },
  //   },
  // };

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
                            onClick={() => setShowMainFilters(!showMainFilters)}
                          >
                            {translations.common.Filters}{" "}
                            <BiFilterAlt className="m-1" />
                          </button>

                          <div className="relative">
                            <FilterPopup
                              openFilter={showMainFilters}
                              onClose={!showMainFilters}
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
                  <DocumentPopup
                    openFilter={showFilter}
                    dataArray={dataArray}
                    onClose={() => setShowFilter(false)}
                  />
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

export default KnitterFabricSales;
