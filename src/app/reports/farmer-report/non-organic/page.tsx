"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import API from "@lib/Api";
import { BiFilterAlt } from "react-icons/bi";
import { handleDownload,handleReportDownload } from "@components/core/Download";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Multiselect from "multiselect-react-dropdown";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import Loading from "app/loading";

const NonOrganic: any = () => {
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();

  useTitle(translations?.reports?.nonOrganicFarmerReports);
  const [isClient, setIsClient] = useState(false);
  const [count, setCount] = useState<any>();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [brands, setBrands] = useState<any>();

  const [showFilter, setShowFilter] = useState(false);
  const [checkedBrand, setCheckBrand] = useState<any>([]);
  const [checkedFarmGroup, setCheckFarmGroup] = useState<any>([]);
  const [checkedIcsName, setCheckedIcsName] = useState<any>([]);
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [district, setDistricts] = useState<any>();
  const [block, setBlocks] = useState<any>();
  const [villages, setVillages] = useState<any>();
  const [checkedVillages, setCheckedVillages] = React.useState<any>([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [checkedDistricts, setCheckedDistricts] = React.useState<any>([]);
  const [checkedBlocks, setCheckedBlocks] = React.useState<any>([]);
  const [isClear, setIsClear] = useState(false);
  const [limit, setLimit] = useState(10);
  const [showExportMessage, setShowExportMessage] = useState(false);

  const [countryExport, setCountryExport] = useState([]);
  const [statesExport, setStatesExport] = useState([]);
  const [districtExport, setDistrictExport] = useState([]);
  const [blockExport, setBlockExport] = useState([]);
  const [villageExport, setVillageExport] = useState([]);
  const [brandsExport, setBrandsExport] = useState([]);
  const [isAPILoading, setIsAPILoading] = useState<any>(false);

  const [checkedExportCountries, setCheckedExportCountries] =
    React.useState<any>([]);
  const [checkedExportStates, setCheckedExportStates] = React.useState<any>([]);
  const [checkedExportDistricts, setCheckedExportDistricts] =
    React.useState<any>([]);
  const [checkedExportBlocks, setCheckedExportBlocks] = useState<any>([]);
  const [checkedExportVillages, setCheckedExportVillages] = useState<any>([]);
  const [checkedExportBrands, setCheckedExportBrands] = React.useState<any>([]);
  const [isExportClear, setIsExportClear] = useState(false);
  const [showFilterExport, setShowFilterExport] = useState(false);

  const code = encodeURIComponent(searchQuery);

  useEffect(() => {
    if (checkedBrand.length !== 0) {
      setCheckFarmGroup([]);
      setCheckedIcsName([]);
    } else {
      fetchBrand();
    }
  }, [checkedBrand, showFilterExport]);

  useEffect(() => {
    getCountries();
  }, [showFilterExport]);

  useEffect(() => {
    if (
      checkedCountries.length !== 0 ||
      (checkedExportCountries.length > 0 && showFilterExport)
    ) {
      getStates();
    } else {
      setCheckedBlocks([]);
      setBlockExport([]);
      setCheckedExportBlocks([]);
      setBlocks([]);
      setCheckedExportDistricts([]);
      setDistrictExport([]);
      setDistricts([]);
      setCheckedDistricts([]);
      setCheckedStates([]);
      setStatesExport([]);
      setCheckedExportStates([]);
      setStates([]);
      setVillages([]);
      setCheckedVillages([]);
      setVillageExport([]);
      setCheckedExportVillages([]);
    }
  }, [checkedCountries, checkedExportCountries, showFilterExport]);

  useEffect(() => {
    if (
      checkedStates.length !== 0 ||
      (checkedExportStates.length > 0 && showFilterExport)
    ) {
      getDistricts();
    } else {
      setDistricts([]);
      setCheckedExportDistricts([]);
      setDistrictExport([]);
      setCheckedDistricts([]);
      setBlocks([]);
      setBlockExport([]);
      setCheckedBlocks([]);
      setCheckedExportBlocks([]);
      setVillages([]);
      setCheckedVillages([]);
      setVillageExport([]);
      setCheckedExportVillages([]);
    }
  }, [checkedStates, checkedExportStates, showFilterExport]);

  useEffect(() => {
    if (
      checkedDistricts.length !== 0 ||
      (checkedExportDistricts.length > 0 && showFilterExport)
    ) {
      getBlocks();
    } else {
      setBlocks([]);
      setBlockExport([]);
      setCheckedBlocks([]);
      setCheckedExportBlocks([]);
      setVillages([]);
      setCheckedVillages([]);
      setVillageExport([]);
      setCheckedExportVillages([]);
    }
  }, [checkedDistricts, checkedExportDistricts, showFilterExport]);

  useEffect(() => {
    if (
      checkedBlocks.length !== 0 ||
      (checkedExportBlocks.length > 0 && showFilterExport)
    ) {
      getVillages();
    } else {
      setVillages([]);
      setCheckedVillages([]);
      setVillageExport([]);
      setCheckedExportVillages([]);
    }
  }, [checkedBlocks, checkedExportBlocks, showFilterExport]);

  useEffect(() => {
    setIsClient(true);
    fetchNonOrganic();
  }, [code, page, limit, isClear]);

  const fetchNonOrganic = async () => {
    try {
      const res = await API.get(
        `reports/get-farmer-report?type=non-Organic&search=${code}&brandId=${checkedBrand}&farmGroupId=${checkedFarmGroup}&icsId=${checkedIcsName}&limit=${limit}&countryId=${checkedCountries}&stateId=${checkedStates}&districtId=${checkedDistricts}&blockId=${checkedBlocks}&villageId=${checkedVillages}&page=${page}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      setCount(0);
    }
    finally {
      setIsAPILoading(false)
    }
  };

  const getCountries = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        if (showFilterExport === true) {
          setCountryExport(res);
        } else {
          setCountries(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getStates = async () => {
    if (
      checkedCountries.length !== 0 ||
      (checkedExportCountries.length > 0 && showFilterExport)
    ) {
      const url = `location/get-states?status=true&countryId=${
        showFilterExport ? checkedExportCountries : checkedCountries
      }`;
      try {
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;

          if (showFilterExport) {
            setStatesExport(res);
          } else {
            setStates(res);
          }
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  };
  const getDistricts = async () => {
    if (
      checkedStates.length !== 0 ||
      (checkedExportStates.length > 0 && showFilterExport)
    ) {
      const url = `location/get-districts?stateId=${
        showFilterExport ? checkedExportStates : checkedStates
      }`;
      try {
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;

          if (showFilterExport) {
            setDistrictExport(res);
          } else {
            setDistricts(res);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const getBlocks = async () => {
    if (
      checkedDistricts.length !== 0 ||
      (checkedExportDistricts.length > 0 && showFilterExport)
    ) {
      const url = `location/get-blocks?districtId=${
        showFilterExport ? checkedExportDistricts : checkedDistricts
      }`;

      try {
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;

          if (showFilterExport) {
            setBlockExport(res);
          } else {
            setBlocks(res);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const getVillages = async () => {
    if (
      checkedBlocks.length !== 0 ||
      (checkedExportBlocks.length > 0 && showFilterExport)
    ) {
      const url = `location/get-villages?blockId=${
        showFilterExport ? checkedExportBlocks : checkedBlocks
      }`;
      try {
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;

          if (showFilterExport) {
            setVillageExport(res);
          } else {
            setVillages(res);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const fetchBrand = async () => {
    const url = `brand`;
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
      console.log(error);
    }
  };
  const fetchExport = async () => {
    try {
      const res = await API.get(
        `reports/export-non-farmer-report?search=${code}&brandId=${checkedBrand}&farmGroupId=${checkedFarmGroup}&icsId=${checkedIcsName}&limit=${limit}&countryId=${checkedCountries}&stateId=${checkedStates}&districtId=${checkedDistricts}&blockId=${checkedBlocks}&villageId=${checkedVillages}&page=${page}&pagination=true`
      );
      if (res.success) {
        handleDownload(res.data, "RiceTraceability - Non Organic Report", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchExportAll = async () => {
    const url = `reports/export-non-farmer-report?exportType=all`;

    try {
      setShowExportMessage(true);
      setIsExportClear(true);
      const response = await API.get(url);
      if (response.success) {
        if (response.data) {
          handleReportDownload(
            response.data,
            "RiceTraceability - Non Organic Report",
            ".xlsx"
          );
          exportClear();
          setShowFilterExport(!showFilterExport);
          setIsExportClear(false);
          setShowExportMessage(false);
        } else {
          setShowExportMessage(false);
          setIsExportClear(false);
        }
      }
    } catch (error) {
      setShowExportMessage(false);
      setIsExportClear(false);
    }
  };
  const clearFilter = () => {
    setIsAPILoading(true)
    setCheckBrand([]);
    setCheckedCountries([]);
    setCheckedBlocks([]);
    setCheckedDistricts([]);
    setCheckedStates([]);
    setCheckedVillages([]);
    setIsClear(!isClear);
  };
  const exportClear = () => {
    setCheckedExportBlocks([]);
    setCheckedExportVillages([]);
    setCheckedExportBrands([]);
    setCheckedExportCountries([]);
    setCheckedExportStates([]);
    setCheckedExportDistricts([]);
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };
  const handleChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "brands") {
      if (checkedBrand?.includes(itemId)) {
        setCheckBrand(checkedBrand?.filter((item: any) => item !== itemId));
      } else {
        setCheckBrand([...checkedBrand, itemId]);
      }
    } else if (name === "countries") {
      if (checkedCountries?.includes(itemId)) {
        setCheckedCountries(
          checkedCountries?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "states") {
      if (checkedStates?.includes(itemId)) {
        setCheckedStates(checkedStates?.filter((item: any) => item !== itemId));
      } else {
        setCheckedStates([...checkedStates, itemId]);
      }
    } else if (name === "districts") {
      if (checkedDistricts?.includes(itemId)) {
        setCheckedDistricts(
          checkedDistricts?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedDistricts([...checkedDistricts, itemId]);
      }
    } else if (name === "blocks") {
      if (checkedBlocks?.includes(itemId)) {
        setCheckedBlocks(checkedBlocks?.filter((item: any) => item !== itemId));
      } else {
        setCheckedBlocks([...checkedBlocks, itemId]);
      }
    } else if (name === "villages") {
      if (checkedVillages?.includes(itemId)) {
        setCheckedVillages(
          checkedVillages?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedVillages([...checkedVillages, itemId]);
      }
    }
  };
  const handleChangeExport = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "brands") {
      if (checkedExportBrands?.includes(itemId)) {
        setCheckedExportBrands(
          checkedExportBrands?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportBrands([...checkedExportBrands, itemId]);
      }
    }

    if (name === "countries") {
      if (checkedExportCountries?.includes(itemId)) {
        setCheckedExportCountries(
          checkedExportCountries?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportCountries([...checkedExportCountries, itemId]);
      }
    } else if (name === "states") {
      if (checkedExportStates?.includes(itemId)) {
        setCheckedExportStates(
          checkedExportStates?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportStates([...checkedExportStates, itemId]);
      }
    } else if (name === "districts") {
      if (checkedExportDistricts?.includes(itemId)) {
        setCheckedExportDistricts(
          checkedExportDistricts?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportDistricts([...checkedExportDistricts, itemId]);
      }
    } else if (name === "blocks") {
      if (checkedExportBlocks?.includes(itemId)) {
        setCheckedExportBlocks(
          checkedExportBlocks?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportBlocks([...checkedExportBlocks, itemId]);
      }
    } else if (name === "villages") {
      if (checkedExportVillages?.includes(itemId)) {
        setCheckedExportVillages(
          checkedExportVillages?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportVillages([...checkedExportVillages, itemId]);
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
                <h3 className="text-lg pb-2">
                  {translations?.common?.Filters}
                </h3>
                <button
                  className="text-[20px]"
                  onClick={() => setShowFilter(!showFilter)}
                  disabled = {isAPILoading}
                  style={
                    isAPILoading
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
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.Selectbrand}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="brand_name"
                          selectedValues={brands?.filter((item: any) =>
                            checkedBrand?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "brands",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "brands");
                          }}
                          options={brands}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.SelectCountry}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="county_name"
                          selectedValues={countries?.filter((item: any) =>
                            checkedCountries?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "countries",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(
                              selectedList,
                              selectedItem,
                              "countries",
                              true
                            )
                          }
                          options={countries}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.SelectState}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="state_name"
                          selectedValues={states?.filter((item: any) =>
                            checkedStates?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "states",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "states")
                          }
                          options={states}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.SelectDistrict}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="district_name"
                          selectedValues={district?.filter((item: any) =>
                            checkedDistricts?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "districts",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(
                              selectedList,
                              selectedItem,
                              "districts"
                            )
                          }
                          options={district}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.SelectBlock}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="block_name"
                          selectedValues={block?.filter((item: any) =>
                            checkedBlocks?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "blocks",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "blocks")
                          }
                          options={block}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.common?.SelectVillage}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="village_name"
                          selectedValues={villages?.filter((item: any) =>
                            checkedVillages?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "villages",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "villages")
                          }
                          options={villages}
                          showCheckbox
                        />
                      </div>
                    </div>
                    {
                      isAPILoading && (
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
                            setIsAPILoading(true)
                            fetchNonOrganic().then(()=> setShowFilter(false))
                          }}
                          disabled = {isAPILoading}
                          style={
                            isAPILoading
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : { cursor: "pointer", backgroundColor: "#D15E9C" }
                        }
                        >
                          {translations?.common?.ApplyAllFilters}
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={clearFilter}
                          disabled = {isAPILoading}
                          style={
                            isAPILoading
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : { cursor: "pointer"}
                        }
                        >
                          {translations?.common?.ClearAllFilters}
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
        <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.farmerName}
        </p>
      ),
      selector: (row: any) => row?.lastName ? row?.firstName + " " + row?.lastName : row?.firstName,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.farmerCode}
        </p>
      ),
      selector: (row: any) => row?.code,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.village}
        </p>
      ),
      selector: (row: any) => row?.village?.village_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.common?.block}</p>
      ),
      selector: (row: any) => row?.block?.block_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.district}
        </p>
      ),
      selector: (row: any) => row?.district?.district_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.common?.state}</p>
      ),
      selector: (row: any) => row?.state?.state_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.country}
        </p>
      ),
      selector: (row: any) => row?.country?.county_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.common?.brand}</p>
      ),
      selector: (row: any) => row?.brand?.brand_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.program}
        </p>
      ),
      selector: (row: any) => row?.program?.program_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.totalArea}
        </p>
      ),
      selector: (row: any) => formatDecimal(row?.agri_total_area),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.totalEstimatedCotton}
        </p>
      ),
      selector: (row: any) => formatDecimal(row?.total_estimated_cotton),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations?.common?.cottonArea}
        </p>
      ),
      selector: (row: any) => formatDecimal(row?.cotton_total_area),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.totalEstimatedProduction}{" "}
        </p>
      ),
      selector: (row: any) => formatDecimal(row?.agri_estimated_prod),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.common?.EstimatedYieldperAcre}
        </p>
      ),
      selector: (row: any) => formatDecimal(row?.agri_estimated_yeld),
      wrap: true,
    },
  ];

  if (!roleLoading) {
    return (
      <>
        {isClient ? (
          <>
            <section>
              <div className="right-content-inner">
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
                                  placeholder={translations?.common?.search}
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
                                {translations?.common?.Filters}{" "}
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

                          <div className="search-filter-right">
                            <button
                              className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                              onClick={fetchExport}
                            >
                              {translations?.common?.export}
                            </button>

                            <button
                              className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm ml-3"
                              onClick={() => {
                                fetchExportAll()
                              }}
                            >
                              {translations?.common?.exportAll}
                            </button>
                         
                          </div>
                        </div>
                        {showExportMessage && (
                          <div className="flex justify-end my-3">
                            <p className="text-center font-semibold text-md text-green-700 py-1">
                              Note: Export all records will take time based on
                              the speed of internet and total no of records
                            </p>{" "}
                          </div>
                        )}

                        <CommonDataTable
                          columns={columns}
                          count={count}
                          data={data}
                          updateData={updatePage}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          "Loading"
        )}
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

export default NonOrganic;
