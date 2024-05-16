"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa";
import User from "@lib/User";
import API from "@lib/Api";
import DataTable from "react-data-table-component";
import useDebounce from "@hooks/useDebounce";
import Multiselect from "multiselect-react-dropdown";
import { BiFilterAlt } from "react-icons/bi";
import Loader from "@components/core/Loader";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";

const GarmentSale: any = () => {
  useTitle("Garment Sales Report");
  const [roleLoading] = useRole();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [dataArray, setDataArray] = useState<Array<string>>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [showGarmentFilter, setShowGarmentFilter] = useState(false);
  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);

  const [checkedSeasonsForFilter, setCheckedSeasonsForFilter] =
    React.useState<any>([]);

  const [program, setProgram] = useState([]);
  const [garment, setGarment] = useState([]);
  const [brands, setBrands] = useState([]);
  const [customerBrandName, setCustomerBrand] = useState([]);
  const [garmentType, setGarmentType] = useState([]);
  const [styleMarkNo, setStyleMarkNo] = useState([]);
  const [department, setDepartment] = useState([]);

  const [defaultSeason, setDefaultSeason] = useState<any>(null);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedGarments, setCheckedGarments] = React.useState<any>([]);
  const [checkedGarmentType, setCheckedGarmentType] = React.useState<any>([]);
  const [checkedCustomer, setCheckedCustomer] = React.useState<any>([]);
  const [checkedStyleMarkNo, setCheckedStyleMarkNo] = React.useState<any>([]);
  const [checkedDepartments, setCheckedDepartments] = React.useState<any>([]);

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);
  const [isClear, setIsClear] = useState(false);

  const brandId = User.brandId;
  const code = encodeURIComponent(searchQuery);
  const debouncedSearch = useDebounce(code, 200);

  const [isAPILoading, setIsAPILoading] = useState<any>(null);

  const [exportAllCountVeryFirstTime, setExportAllCountVeryFirstTime] =
    useState(0);

  const [fullDataCount, setFullDataCount] = useState<any>(null);

  useEffect(() => {
    const getReportsCount = async () => {
      try {
        const response = await API.get(
          `reports/get-garment-sales-report?page=${page}&limit=${limit}&pagination=true`
        );
        console.log(
          "Get garment-sales Reports Count Response : ",
          response?.count
        );
        setFullDataCount(response?.count);
      } catch (error) {
        console.log("Get garment-sales Reports Count Error : ", error);
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
            file_name: "garment-fabric-sale-report.xlsx",
          });
          if (response.data) {
            setIsAPILoading(null);
            handleDownload(
              response.data,
              "Rice Traceability - Garment Fabric Sales Report",
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
    getStyleandGarmentType();
    getDepartment();
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
  }, [debouncedSearch, brandId, isClear, page, limit, defaultSeason]);

  const fetchSales = async () => {
    try {
      const response = await API.get(
        `reports/get-garment-sales-report?garmentId=${checkedGarments}&search=${debouncedSearch}&seasonId=${checkedSeasons}&brandId=${
          brandId ? brandId : checkedBrands
        }&countryId=${checkedCountries}&programId=${checkedPrograms}&departmentId=${checkedDepartments}&buyerId=${checkedCustomer}&garmentType=${checkedGarmentType}&styleMarkNo=${checkedStyleMarkNo}&limit=${limit}&page=${page}&pagination=true`
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
  const getStyleandGarmentType = async () => {
    const url = "reports/get-garment-sales-filters";
    try {
      const response = await API.get(url);
      if (response.success) {
        const uniqueGarmentTypes = response.data?.garmentTypes.filter(
          (value: any, index: any, self: any) => self.indexOf(value) === index
        );
        const uniqueStyleMarkNo = response?.data?.styleMarkNo.filter(
          (value: any, index: any, self: any) => self.indexOf(value) === index
        );
        setGarmentType(uniqueGarmentTypes);
        setStyleMarkNo(uniqueStyleMarkNo);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getDepartment = async () => {
    const url = "department?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        setDepartment(response.data);
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
        setCustomerBrand(res);
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
    const isCountrySelected = checkedCountries.includes(itemId);

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
    } else if (name === "styelmarkNo") {
      if (checkedStyleMarkNo.includes(selectedItem)) {
        setCheckedStyleMarkNo(
          checkedStyleMarkNo.filter((item: any) => item !== selectedItem)
        );
      } else {
        setCheckedStyleMarkNo([...checkedStyleMarkNo, selectedItem]);
      }
    } else if (name === "garmentType") {
      if (checkedGarmentType.includes(selectedItem)) {
        setCheckedGarmentType(
          checkedGarmentType.filter((item: any) => item !== selectedItem)
        );
      } else {
        setCheckedGarmentType([...checkedGarmentType, selectedItem]);
      }
    } else if (name === "department") {
      if (checkedDepartments.includes(itemId)) {
        setCheckedDepartments(
          checkedDepartments.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedDepartments([...checkedDepartments, itemId]);
      }
    } else if (name === "customerBrandName") {
      if (checkedCustomer.includes(itemId)) {
        setCheckedCustomer(
          checkedCustomer.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCustomer([...checkedCustomer, itemId]);
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
    setCheckedDepartments([]);
    setCheckedSeasons([]);
    setCheckedCustomer([]);
    setCheckedStyleMarkNo([]);
    setCheckedGarmentType([]);
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
                            Customer (Brand) name
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="brand_name"
                            selectedValues={customerBrandName?.filter(
                              (item: any) => checkedCustomer.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "customerBrandName",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() {}}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "customerBrandName"
                              )
                            }
                            options={customerBrandName}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Garment Type
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            isObject={false}
                            selectedValues={checkedGarmentType}
                            onKeyPressFn={function noRefCheck() {}}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "garmentType",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() {}}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "garmentType"
                              )
                            }
                            options={garmentType}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Style Mark No
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            isObject={false}
                            selectedValues={checkedStyleMarkNo}
                            onKeyPressFn={function noRefCheck() {}}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "styelmarkNo",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() {}}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "styelmarkNo"
                              )
                            }
                            options={styleMarkNo}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Department
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="dept_name"
                            selectedValues={department?.filter((item: any) =>
                              checkedDepartments.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "department",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() {}}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "department"
                              )
                            }
                            options={department}
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
                              fetchSales().then(()=> setShowGarmentFilter(false));
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

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
  };

  const fetchExport = async () => {
    try {
      setIsDataLoading(true);
      const response = await API.get(
        `reports/export-garment-sales-report?garmentId=${checkedGarments}&search=${debouncedSearch}&seasonId=${checkedSeasons}&brandId=${
          brandId ? brandId : checkedBrands
        }&countryId=${checkedCountries}&programId=${checkedPrograms}&departmentId=${checkedDepartments}&buyerId=${checkedCustomer}&garmentType=${checkedGarmentType}&styleMarkNo=${checkedStyleMarkNo}&limit=${limit}&page=${page}&pagination=true`
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
          `reports/export-garment-sales-report?garmentId=${checkedGarments}&search=${debouncedSearch}&seasonId=${
            exportAllCountVeryFirstTime === 1
              ? checkedSeasonsForFilter
              : checkedSeasons
          }&brandId=${
            brandId ? brandId : checkedBrands
          }&countryId=${checkedCountries}&programId=${checkedPrograms}&departmentId=${checkedDepartments}&buyerId=${checkedCustomer}&garmentType=${checkedGarmentType}&styleMarkNo=${checkedStyleMarkNo}&limit=${
            exportAllCountVeryFirstTime === 1 ? fullDataCount : count
          }&page=${page}&pagination=true`
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

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };
  const { translations, loading } = useTranslations();
  if (loading) {
    return (
      <div>
        {" "}
        <Loader />{" "}
      </div>
    );
  }

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

  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const fileName = (item: any) => {
      let file = item.split("file/");
      return file ? file[1] : "";
    };
    const columnsArr: any = [
      {
        name: (
          <p className="text-[13px] font-medium">{translations.common.srNo}</p>
        ),
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: <p className="text-[13px] font-medium">File</p>,
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: <p className="text-[13px] font-medium">Action</p>,
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
                  <h3 className="text-lg pb-2">Invoice Files</h3>
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
      name: (
        <p className="text-[13px] font-medium">{translations.common.srNo}</p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: "70px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Date of Sale</p>,
      selector: (row: any) => row?.date?.substring(0, 10),
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
      name: <p className="text-[13px] font-medium"> Garment Unit Name</p>,
      selector: (row: any) => row?.garment?.name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Customer (R&B) Name</p>,
      selector: (row: any) => row?.buyer?.brand_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice no.</p>,
      selector: (row: any) => row?.invoice_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Fabric Order Reference</p>,
      selector: (row: any) => row?.fabric_order_ref,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Brand Order Reference</p>,
      selector: (row: any) => row?.brand_order_ref,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Garment Type</p>,
      selector: (row: any) => row?.garmentType,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Mark/Style No</p>,
      selector: (row: any) => row?.styleMarkNo,
      wrap: true,
      width: "130px",
    },
    {
      name: <p className="text-[13px] font-medium"> No. of Boxes/ Cartons</p>,
      selector: (row: any) => row?.total_no_of_boxes,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> No. of Pieces</p>,
      selector: (row: any) => row?.total_no_of_pieces,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.agentDetails}
        </p>
      ),
      selector: (row: any) => row?.transaction_agent || "NA",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.mandiInterface.qrCode}
        </p>
      ),
      cell: (row: any) => (
        <>
          <img
            className=""
            src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
          />

          <button
            className=""
            onClick={() =>
              handleDownload(
                process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr,
                "qr",
                ".png"
              )
            }
          >
            <FaDownload size={18} color="black" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.tcFiles}</p>
      ),
      center: true,
      cell: (row: any) =>
        row?.tc_file && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row?.tc_file)}
            />
            <FaDownload
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={() => handleDownloadData(row?.tc_file, "tcFile")}
            />
          </>
        ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.ContractFiles}
        </p>
      ),
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
              className="text-black hover:text-blue-600 cursor-pointer ml-2"
              onClick={() =>
                handleDownloadData(row?.contract_file, "contractFile")
              }
            />
          </>
        ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.InVoiceFiles}
        </p>
      ),
      cell: (row: any) =>
        row?.invoice_files &&
        row?.invoice_files.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row?.invoice_files)}
              title="Click to View All Files"
            />
          </>
        ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.DeliveryNotes}
        </p>
      ),
      selector: (row: any) => row?.delivery_notes,
      cell: (row: any) => {
        return (
          <>
            {row?.delivery_notes ? (
              <>
                <FaEye
                  size={18}
                  className="text-black hover:text-blue-600 cursor-pointer"
                  onClick={() => handleView(row?.delivery_notes)}
                />
                <FaDownload
                  size={18}
                  className="text-black hover:text-blue-600 cursor-pointer ml-2"
                  onClick={() =>
                    handleDownloadData(row?.delivery_notes, ".png")
                  }
                />
              </>
            ) : (
              ""
            )}
          </>
        );
      },
    },
  ];
  if (!roleLoading) {
    return (
      <>
        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form ">
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

export default GarmentSale;
