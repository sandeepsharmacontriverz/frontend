"use client";
import React, { useState, useEffect, useRef } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import CommonDataTable from "@components/core/Table";
import User from "@lib/User";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa";
import useTranslations from "@hooks/useTranslation";
import moment from "moment";
import Loader from "@components/core/Loader";
import useDebounce from "@hooks/useDebounce";
import Multiselect from "multiselect-react-dropdown";
import { BiFilterAlt } from "react-icons/bi";
import DataTable from "react-data-table-component";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";

const GarmentFabricRecipt: any = () => {
  const [roleLoading] = useRole();
  useTitle("Garment Fabric Receipt Report");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showGarmentFilter, setShowGarmentFilter] = useState(false);

  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);

  const [checkedSeasonsForFilter, setCheckedSeasonsForFilter] =
    React.useState<any>([]);

  const [program, setProgram] = useState([]);
  const [garment, setGarment] = useState([]);
  const [knitWeav, setKnitWeav] = useState<any>([]);
  const [brands, setBrands] = useState([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedGarments, setCheckedGarments] = React.useState<any>([]);
  const [checkedKnitId, setCheckedKnitId] = useState([]);
  const [checkedWeaverId, setCheckedWeaverId] = useState([]);
  const [checkedWeavKnit, setCheckedWeavKnit] = useState<any>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);
  const [defaultSeason, setDefaultSeason] = useState<any>(null);

  const [isDataLoading, setIsDataLoading] = useState(false);

  const [isClear, setIsClear] = useState(false);
  const brandId = User.brandId;
  const code = encodeURIComponent(searchQuery);
  const debouncedSearch = useDebounce(code, 200);

  const { translations, loading } = useTranslations();
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);
  const [isAPILoading, setIsAPILoading] = useState<any>(null);

  const [exportAllCountVeryFirstTime, setExportAllCountVeryFirstTime] =
    useState(0);

  const [fullDataCount, setFullDataCount] = useState<any>(null);

  useEffect(() => {
    const getReportsCount = async () => {
      try {
        const response = await API.get(
          `reports/get-garment-fabric-receipt-report?page=${page}&limit=${limit}&pagination=true`
        );
        console.log(
          "Get garment-fabric Reports Count Response : ",
          response?.count
        );
        setFullDataCount(response?.count);
      } catch (error) {
        console.log("Get garment-fabric Reports Count Error : ", error);
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
            file_name: "garment-fabric-receipt-report.xlsx",
          });
          if (response.data) {
            setIsAPILoading(null);
            handleDownload(
              response.data,
              "Rice Traceability - Garment Fabric Receipt Report",
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
      getKnitWeav();
    } else {
      setCheckedGarments([]);
      setGarment([]);
      setCheckedKnitId([]);
      setCheckedWeavKnit([]);
      setCheckedWeaverId([]);
      setKnitWeav([]);
    }
  }, [checkedCountries]);

  useEffect(() => {
    if (defaultSeason) {
      getReports();
    }
  }, [debouncedSearch, brandId, isClear, page, limit, defaultSeason]);

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

  const getKnitWeav = async () => {
    if (checkedCountries.length !== 0) {
      try {
        const [weaver, knitter] = await Promise.all([
          API.get(`weaver?countryId=${checkedCountries.join(",")}`),
          API.get(`knitter?countryId=${checkedCountries.join(",")}`),
        ]);
        if (weaver.success && knitter.success) {
          const finalData = [
            weaver.data.map((obj: any) => {
              return {
                ...obj,
                key: obj?.name + "-Weaver",
              };
            }),
            knitter.data.map((obj: any) => {
              return { ...obj, key: obj?.name + "-Knitter" };
            }),
          ].flat();
          let abc = finalData.map((obj) => {
            return { ...obj, processId: obj.id, id: undefined };
          });
          setKnitWeav(abc);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getReports = async () => {
    try {
      const response = await API.get(
        `reports/get-garment-fabric-receipt-report?countryId=${checkedCountries}&garmentId=${checkedGarments}&programId=${checkedPrograms}&seasonId=${checkedSeasons}&brandId=${
          brandId ? brandId : checkedBrands
        }&weaverId=${checkedWeaverId}&knitterId=${checkedKnitId}&search=${debouncedSearch}&page=${page}&limit=${limit}&pagination=true`
      );

      if (response.success) {
        setData(response.data);
        setCount(response.count);
        setExportAllCountVeryFirstTime(exportAllCountVeryFirstTime + 1);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setCount(0);
    } 
    finally {
      setIsFilterUsed(false)
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const fetchExport = async () => {
    try {
      setIsDataLoading(true);
      const response = await API.get(
        `reports/export-garment-fabric-receipt-report?countryId=${checkedCountries}&garmentId=${checkedGarments}&programId=${checkedPrograms}&seasonId=${checkedSeasons}&brandId=${
          brandId ? brandId : checkedBrands
        }&weaverId=${checkedWeaverId}&knitterId=${checkedKnitId}&search=${debouncedSearch}&page=${page}&limit=${limit}&pagination=true`
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
          `reports/export-garment-fabric-receipt-report?countryId=${checkedCountries}&garmentId=${checkedGarments}&programId=${checkedPrograms}&seasonId=${
            exportAllCountVeryFirstTime === 1
              ? checkedSeasonsForFilter
              : checkedSeasons
          }&brandId=${
            brandId ? brandId : checkedBrands
          }&weaverId=${checkedWeaverId}&knitterId=${checkedKnitId}&search=${debouncedSearch}&page=${page}&limit=${
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

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
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
  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
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
    } else if (name === "weavKnit") {
      const selectedType = selectedItem.key?.split("-")[1];
      if (checkedWeavKnit.includes(selectedItem.key)) {
        setCheckedWeavKnit((prevList: any) =>
          prevList.filter((item: any) => item !== selectedItem.key)
        );
        if (selectedType === "Weaver") {
          setCheckedWeaverId((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.processId)
          );
        } else if (selectedType === "Knitter") {
          setCheckedKnitId((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.processId)
          );
        }
      } else {
        setCheckedWeavKnit((prevList: any) => {
          if (!prevList.includes(selectedItem.key)) {
            return [...prevList, selectedItem.key];
          }
          return prevList;
        });

        if (selectedType === "Weaver") {
          setCheckedWeaverId((prevList: any) => {
            if (!prevList.includes(selectedItem.processId)) {
              return [...prevList, selectedItem.processId];
            }
            return prevList;
          });
        } else if (selectedType === "Knitter") {
          setCheckedKnitId((prevList: any) => {
            if (!prevList.includes(selectedItem.processId)) {
              return [...prevList, selectedItem.processId];
            }
            return prevList;
          });
        }
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
    setCheckedKnitId([]);
    setCheckedWeaverId([]);
    setCheckedWeavKnit([]);
    setExportAllCountVeryFirstTime(0);
    setIsClear(!isClear);
  };

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
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
                    onClick={() => setShowGarmentFilter(!showGarmentFilter)}   
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
                            {translations?.common?.SelectKnitWeav}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="key"
                            selectedValues={knitWeav?.filter((item: any) =>
                              checkedWeavKnit?.includes(item.key)
                            )}
                            onRemove={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "weavKnit"
                              )
                            }
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "weavKnit"
                              )
                            }
                            options={knitWeav}
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
                              getReports().then(()=> setShowGarmentFilter(false));
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
                onClick={() => handleDownloadData(row, "Invoice File")}
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

  if (loading) {
    return (
      <div>
        {" "}
        <Loader />{" "}
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
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Date of accept Transaction </p>
      ),
      width: "130px",
      wrap: true,
      selector: (row: any) =>
        row?.accept_date ? dateFormatter(row?.accept_date) : "",
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
      name: <p className="text-[13px] font-medium"> Weave/ Knit Unit</p>,
      selector: (row: any) => (row?.weaver ? row?.weaver : row?.knitter),
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Garment Processor Unit </p>,
      selector: (row: any) => row?.garment,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.invoiceNumber}
        </p>
      ),
      selector: (row: any) => row?.invoice_no,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.InVoiceFiles}
        </p>
      ),
      center: true,
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
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.comberNoil.batchLotNo}{" "}
        </p>
      ),
      selector: (row: any) => row?.batch_lot_no,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium"> {translations.fabricType} </p>
      ),
      selector: (row: any) => row?.fabricType,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Finished Fabric Length </p>,
      selector: (row: any) => row?.net_length,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          Total Fabric Net Length (Mts){" "}
        </p>
      ),
      selector: (row: any) => row?.total_length_qty,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Finished Fabric Weight </p>,
      selector: (row: any) => row?.net_weight,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          Total Fabric Net Weight (Kgs){" "}
        </p>
      ),
      selector: (row: any) => row?.total_weight_qty,
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
                        onClick={() => setShowGarmentFilter(!showGarmentFilter)}
                      >
                        {translations.common.Filters}{" "}
                        <BiFilterAlt className="m-1" />
                      </button>

                      <div className="relative">
                        <FilterPopup
                          openFilter={showGarmentFilter}
                          onClose={!showGarmentFilter}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-x-4">
                    <button
                      className="py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
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
export default GarmentFabricRecipt;
