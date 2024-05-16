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
import ModalLoader from "@components/core/ModalLoader";

export default function page() {
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();
  useTitle(translations?.reports?.villageSeedCottonReport);

  const [isClient, setIsClient] = useState(false);

  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);
  const [villages, setVillages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedVillages, setCheckedVillages] = React.useState<any>([]);

  const [isDataLoading, setIsDataLoading] = useState(false);

  const [isClear, setIsClear] = useState(false);

  const brandId = User.brandId;

  const [isAPILoading, setIsAPILoading] = useState<any>(null);

  useEffect(() => {
    // fetchExportAll
    if (isAPILoading) {
      async function loadFunction() {
        const url = "reports/check-export-load";
        try {
          const response = await API.post(url, {
            file_name: "agent-transactions.xlsx",
          });
          if (response.data) {
            setIsAPILoading(null);
            handleDownload(
              response.data,
              "Rice Traceability - Village Seed Cotton Stock Report",
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
    getBrands();
    setIsClient(true);
  }, [brandId]);

  useEffect(() => {
    getVillages();
  }, [checkedCountries]);

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
    const url = `reports/get-village-seed-cotton-report?villageId=${checkedVillages}&countryId=${checkedCountries}&seasonId=${checkedSeasons}&brandId=${
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
    const url = "season";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setSeason(res);
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

  const getVillages = async () => {
    const url = `location/get-villages?countryId=${checkedCountries.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setVillages(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleExport = async () => {
    const url = `reports/export-village-seed-cotton-report?villageId=${checkedVillages}&countryId=${checkedCountries}&seasonId=${checkedSeasons}&brandId=${
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

  const fetchExportAllFullReport = async () => {
    setIsDataLoading(true);

    const url = `reports/export-village-seed-cotton-report?villageId=${checkedVillages}&countryId=${checkedCountries}&seasonId=${checkedSeasons}&brandId=${
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

  // const handleFilterChange = (selectedList: any, selectedItem: any, name: string, remove: boolean = false) => {
  //     let itemId = selectedItem?.id;
  //     if (name === "countries") {
  //         setVillages([]);
  //         setCheckedVillages([]);
  //         if (checkedCountries?.includes(itemId)) {
  //             setCheckedCountries(
  //                 checkedCountries?.filter((item: any) => item !== itemId)
  //             );
  //         } else {
  //             setCheckedCountries([...checkedCountries, itemId]);
  //         }
  //     } else if (name === "brands") {
  //         if (checkedBrands?.includes(itemId)) {
  //             setCheckedBrands(checkedBrands?.filter((item: any) => item !== itemId));
  //         } else {
  //             setCheckedBrands([...checkedBrands, itemId]);
  //         }
  //     } else if (name === "seasons") {
  //         if (checkedSeasons?.includes(itemId)) {
  //             setCheckedSeasons(
  //                 checkedSeasons?.filter((item: any) => item !== itemId)
  //             );
  //         } else {
  //             setCheckedSeasons([...checkedSeasons, itemId]);
  //         }
  //     } else if (name === "villages") {
  //         if (checkedVillages?.includes(itemId)) {
  //             setCheckedVillages(
  //                 checkedVillages?.filter((item: any) => item !== itemId)
  //             );
  //         } else {
  //             setCheckedVillages([...checkedVillages, itemId]);
  //         }
  //     }
  // }

  // const clearFilter = () => {
  //     setCheckedCountries([]);
  //     setCheckedVillages([]);
  //     setCheckedBrands([]);
  //     setCheckedSeasons([]);
  //     setIsClear(!isClear);
  // };

  // const FilterPopup = ({ openFilter, onClose }: any) => {
  //     const popupRef = useRef<HTMLDivElement>(null);

  //     return (
  //         <div>
  //             {openFilter && (
  //                 <>
  //                     <div ref={popupRef} className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
  //                         <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
  //                             <div className="flex justify-between align-items-center">
  //                                 <h3 className="text-lg pb-2">{translations.common.Filters}</h3>
  //                                 <button className="text-[20px]" onClick={() => setShowFilter(!showFilter)}>&times;</button>
  //                             </div>
  //                             <div className="w-100 mt-0">
  //                                 <div className="customFormSet">
  //                                     <div className="w-100">
  //                                         <div className="row">
  //                                             {!brandId && (
  //                                                 <div className="col-12 col-md-6 col-lg-3 mt-2">
  //                                                     <label className="text-gray-500 text-[12px] font-medium">
  //                                                         {translations.common.Selectbrand}
  //                                                     </label>
  //                                                     <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
  //                                                         // id="programs"
  //                                                         displayValue="brand_name"
  //                                                         selectedValues={brands?.filter((item: any) => checkedBrands?.includes(item.id))}
  //                                                         onKeyPressFn={function noRefCheck() { }}
  //                                                         onRemove={(selectedList: any, selectedItem: any) => {
  //                                                             handleFilterChange(selectedList, selectedItem, "brands", true)
  //                                                         }}
  //                                                         onSearch={function noRefCheck() { }}
  //                                                         onSelect={(selectedList: any, selectedItem: any) => handleFilterChange(selectedList, selectedItem, "brands")}
  //                                                         options={brands}
  //                                                         showCheckbox
  //                                                     />
  //                                                 </div>
  //                                             )}

  //                                             <div className="col-12 col-md-6 col-lg-3 mt-2">
  //                                                 <label className="text-gray-500 text-[12px] font-medium">
  //                                                     {translations.common.SelectCountry}
  //                                                 </label>
  //                                                 <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
  //                                                     // id="programs"
  //                                                     displayValue="county_name"
  //                                                     selectedValues={country?.filter((item: any) => checkedCountries?.includes(item.id))}
  //                                                     onKeyPressFn={function noRefCheck() { }}
  //                                                     onRemove={(selectedList: any, selectedItem: any) => {
  //                                                         handleFilterChange(selectedList, selectedItem, "countries", true)
  //                                                     }}
  //                                                     onSearch={function noRefCheck() { }}
  //                                                     onSelect={(selectedList: any, selectedItem: any) => handleFilterChange(selectedList, selectedItem, "countries", true)}
  //                                                     options={country}
  //                                                     showCheckbox
  //                                                 />
  //                                             </div>

  //                                             <div className="col-12 col-md-6 col-lg-3 mt-2">
  //                                                 <label className="text-gray-500 text-[12px] font-medium">
  //                                                     {translations.common.SelectGinner}
  //                                                 </label>
  //                                                 <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
  //                                                     // id="programs"
  //                                                     displayValue="village_name"
  //                                                     selectedValues={villages?.filter((item: any) => checkedVillages?.includes(item.id))}
  //                                                     onKeyPressFn={function noRefCheck() { }}
  //                                                     onRemove={(selectedList: any, selectedItem: any) => {
  //                                                         handleFilterChange(selectedList, selectedItem, "villages", true)
  //                                                     }}
  //                                                     onSearch={function noRefCheck() { }}
  //                                                     onSelect={(selectedList: any, selectedItem: any) => handleFilterChange(selectedList, selectedItem, "villagess")}
  //                                                     options={villages}
  //                                                     showCheckbox
  //                                                 />
  //                                             </div>

  //                                             <div className="col-12 col-md-6 col-lg-3 mt-2">
  //                                                 <label className="text-gray-500 text-[12px] font-medium">
  //                                                     {translations.common.SelectSeason}
  //                                                 </label>
  //                                                 <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
  //                                                     // id="programs"
  //                                                     displayValue="name"
  //                                                     selectedValues={season?.filter((item: any) => checkedSeasons?.includes(item.id))}
  //                                                     onKeyPressFn={function noRefCheck() { }}
  //                                                     onRemove={(selectedList: any, selectedItem: any) => {
  //                                                         handleFilterChange(selectedList, selectedItem, "seasons", true)
  //                                                     }}
  //                                                     onSearch={function noRefCheck() { }}
  //                                                     onSelect={(selectedList: any, selectedItem: any) => handleFilterChange(selectedList, selectedItem, "seasons")}
  //                                                     options={season}
  //                                                     showCheckbox
  //                                                 />
  //                                             </div>
  //                                         </div>
  //                                         <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
  //                                             <section>
  //                                                 <button
  //                                                     className="btn-purple mr-2"
  //                                                     onClick={() => {
  //                                                         getReports();
  //                                                         setShowFilter(false);
  //                                                     }}
  //                                                 >
  //                                                     {translations.common.ApplyAllFilters}
  //                                                 </button>
  //                                                 <button className="btn-outline-purple" onClick={clearFilter}>{translations.common.ClearAllFilters}</button>
  //                                             </section>
  //                                         </div>
  //                                     </div>
  //                                 </div>
  //                             </div>
  //                         </div>
  //                     </div>
  //                 </>
  //             )}
  //         </div>
  //     );
  // };

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
      name: (
        <p className="text-[13px] font-medium">
          {translations.location.village}
        </p>
      ),
      selector: (row: any) => row?.village_name,
      width: "200px",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.seedCotton.totalEstimatedSeedCottonVill}
        </p>
      ),
      selector: (row: any) => formatDecimal(row?.estimated_seed_cotton),
      wrap: true,
      center: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.seedCotton.totalSeedCottonProcuredVill}
        </p>
      ),
      wrap: true,
      selector: (row: any) => formatDecimal(row?.procured_seed_cotton),
      center: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.seedCotton.totalSeedCottonStockVill}
        </p>
      ),
      wrap: true,
      selector: (row: any) =>
        row?.avaiable_seed_cotton > 0
          ? formatDecimal(row?.avaiable_seed_cotton)
          : 0,
      center: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.seedCotton.PercentSeedCottonProcured}
        </p>
      ),
      wrap: true,
      selector: (row: any) => formatDecimal(row?.prct_procured_cotton),
      center: true,
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
                    <li>{translations.reports.villageSeedCottonReport}</li>
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
                        {/* <div className="fliterBtn">
                                                    <button
                                                        className="flex"
                                                        type="button"
                                                        onClick={() => setShowFilter(!showFilter)}
                                                    >
                                                        {translations.common.Filters} <BiFilterAlt className="m-1" />
                                                    </button>

                                                    <div className="relative">
                                                        <FilterPopup
                                                            openFilter={showFilter}
                                                            onClose={!showFilter}
                                                        />
                                                    </div>
                                                </div> */}
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
                              fetchExportAllFullReport();
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
