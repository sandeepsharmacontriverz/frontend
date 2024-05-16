"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "@lib/Api";
import { handleDownload } from "@components/core/Download";
import BarChart from "@components/charts/BarChart";
import Multiselect from "multiselect-react-dropdown";
import Accordian from "@components/core/Accordian";
import User from "@lib/User";
import Loader from "@components/core/Loader";

const chartData = [
  {
    name: "Seed Cotton",
    y: 63.06,
    drilldown: "Garment",
    color: "#333",
  },
  {
    name: "Spinner",
    y: 19.84,
    drilldown: "Spinner",
  },
  {
    name: "Knitter",
    y: 4.18,
    drilldown: "Knitter",
  },
  {
    name: "Weaver",
    y: 4.12,
    drilldown: "Weaver",
  },
  {
    name: "Garment",
    y: 2.33,
    drilldown: "Garment",
  },
];

const GarmentSummaryReport: any = () => {
  const [roleLoading] = useRole();
  useTitle("Garment Summary Report");

  const { translations, loading } = useTranslations();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [garments, setGarments] = useState([]);
  const [brands, setBrands] = useState([]);
  const [checkedDate, setCheckedDate] = React.useState<any>([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [checkedGarments, setCheckedGarments] = React.useState<any>([]);
  const [isClear, setIsClear] = useState(false);
  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);
  const [showFilter, setShowFilter] = useState(false);
  const brandId = User.brandId;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getReports();
  }, [brandId, searchQuery, page, limit, isClear])

  useEffect(() => {
    getCountry();
    getProgram();
    getBrands();
  }, []);

  useEffect(() => {
    getGarments();
    if (checkedCountries.length > 0) {
      getStates();
    }
    else {
      setStates([])
    }
  }, [checkedCountries])


  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleExport = async () => {
    const url = "reports/export-garment-summary-report";
    try {
      const response = await API.get(url);
      if (response.success) {
        if (response.data) {
          handleDownload(response.data, "Rice Traceability - Garment Summary Report", ".xlsx");
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getReports = async () => {
    const url = `reports/get-garment-summary-report?search=${searchQuery}&countryId=${checkedCountries}&brandId=${checkedBrands}&programId=${checkedPrograms}&stateId=${checkedStates}&garmentId=${checkedGarments}&page=${page}&limit=${limit}&pagination=true`;
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

  const getCountry = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCountries(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getStates = async () => {
    const url = `location/get-states?status=true&countryId=${checkedCountries}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setStates(res);
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
        setPrograms(res);
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

  const getGarments = async () => {
    const url = `garment?countryId=${checkedCountries.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setGarments(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "date") {
      if (checkedDate.includes(itemId)) {
        setCheckedDate(checkedDate.filter((item: any) => item !== itemId));
      } else {
        setCheckedDate([...checkedDate, itemId]);
      }
    } else if (name === "brand") {
      if (checkedBrands.includes(itemId)) {
        setCheckedBrands(checkedBrands.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrands([...checkedBrands, itemId]);
      }
    } else if (name === "program") {
      if (checkedPrograms.includes(itemId)) {
        setCheckedPrograms(
          checkedPrograms.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedPrograms([...checkedPrograms, itemId]);
      }
    } else if (name === "country") {
      setStates([]);
      setGarments([]);
      setCheckedGarments([]);
      setCheckedStates([]);
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "garment") {
      if (checkedGarments.includes(itemId)) {
        setCheckedGarments(
          checkedGarments.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGarments([...checkedGarments, itemId]);
      }
    } else if (name === "state") {
      if (checkedStates.includes(itemId)) {
        setCheckedStates(checkedStates.filter((item: any) => item !== itemId));
      } else {
        setCheckedStates([...checkedStates, itemId]);
      }
    }
  };

  const clearFilter = () => {
    setIsFilterUsed(true)
    setFrom(null);
    setTo(null);
    setCheckedCountries([]);
    setCheckedGarments([]);
    setCheckedPrograms([]);
    setCheckedBrands([]);
    setCheckedStates([]);
    setIsClear(!isClear)
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const handleFrom = (date: Date | null) => {
      if (date) {
        let d = new Date(date);
        d.setHours(d.getHours() + 5);
        d.setMinutes(d.getMinutes() + 30);
        const newDate: any = d.toISOString();
        setFrom(date);
        // setFormData((prevFormData) => ({
        //   ...prevFormData,
        //   from: newDate,
        // }));
      } else {
        setFrom(null);
        // setFormData((prevFormData) => ({
        //   ...prevFormData,
        //   from: null,
        // }));
      }
    };

    const handleEndDate = (date: Date | null) => {
      if (date) {
        let d = new Date(date);
        d.setHours(d.getHours() + 5);
        d.setMinutes(d.getMinutes() + 30);
        const newDate: any = d.toISOString();
        setTo(date);
        // setFormData((prevFormData) => ({
        //   ...prevFormData,
        //   to: newDate,
        // }));
      } else {
        setTo(null);
        // setFormData((prevFormData) => ({
        //   ...prevFormData,
        //   to: null,
        // }));
      }
    };

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
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
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.from}
                          </label>
                          <DatePicker
                            selected={from}
                            selectsStart
                            startDate={from}
                            endDate={to}
                            maxDate={to ? to : null}
                            onChange={handleFrom}
                            showYearDropdown
                            placeholderText={translations.common.from}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.to}
                          </label>
                          <DatePicker
                            selected={to}
                            selectsEnd
                            startDate={from}
                            endDate={to}
                            minDate={from}
                            onChange={handleEndDate}
                            showYearDropdown
                            placeholderText={translations.common.to}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                        </div>
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
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(selectedList, selectedItem, "brand");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "brand")
                            }
                            options={brands}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.SelectProgram}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={programs?.filter((item: any) =>
                              checkedPrograms.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "program"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "program"
                              )
                            }
                            options={programs}
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
                            selectedValues={countries?.filter((item: any) =>
                              checkedCountries.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "country"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "country"
                              )
                            }
                            options={countries}
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
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(selectedList, selectedItem, "state");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "state")
                            }
                            options={states}
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
                            selectedValues={garments?.filter((item: any) =>
                              checkedGarments.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedList, selectedItem, "garment");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "garment")
                            }
                            options={garments}
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
    return <div>  <Loader /> </div>;
  }
  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations.common.srNo}</p>,
      cell: (row: any, index: any) => index + 1,
      width: '70px'
    },
    {
      name: <p className="text-[13px] font-medium">Garment Name </p>,
      wrap: true,
      selector: (row: any) => row.garment.name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Seed cotton procured in previous seasons [kgs]
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.cottonProcuredPreKg,
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Seed cotton procured in previous seasons [MT]{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.cottonProcuredPreMt,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Seed cotton procured current season [kgs]{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.cottonProcuredCurMt,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Seed cotton procured current season [Mt]{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.cottonProcuredCurMt,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Lint Produced in previous seasons [MT]{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.lintProcuredPreMt,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total Lint Produced in current seasons [MT]s{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.lintProcuredCurMt,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total lint stock from previous seasons [MT]{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.lintStockPreMt,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total lint stock from current seasons [MT]{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.lintStockCurMt,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          % lint sold from previous season{" "}
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.lintStockPreMt,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          % lint sold from current season
        </p>
      ),
      wrap: true,
      selector: (row: any) => row.lintStockCurMt,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        width: "190px",
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
                        <div className="fliterBtn">
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
                        </div>
                      </div>
                    </div>
                    <div className="border-y-2 py-5 my-5">
                      <div className="row">
                        <div className="col-md-8 col-sm-12">
                          <Accordian
                            title={"Seed Cotton Procurement"}
                            content={
                              <BarChart
                                title={"Seed Cotton Procurement"}
                                data={chartData}
                                type="column"
                              />
                            }
                          />
                        </div>
                        <div className="col-md-4 col-sm-12">
                          <Accordian
                            title={"Garment Summary Procurement 2023-2024"}
                            content={
                              <BarChart
                                title={"Garment Summary Procurement 2023-2024"}
                                data={chartData}
                                type="column"
                              />
                            }
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-4 col-sm-12">
                          <Accordian
                            title={"Garment Summary 2022-2023"}
                            content={
                              <BarChart
                                title={"Garment Summary 2022-2023"}
                                data={chartData}
                                type="column"
                              />
                            }
                          />
                        </div>
                        <div className="col-md-4 col-sm-12">
                          <Accordian
                            title={"Garment Summary 2021-2022"}
                            content={
                              <BarChart
                                title={"Garment Summary 2021-2022"}
                                data={chartData}
                                type="column"
                              />
                            }
                          />
                        </div>
                        <div className="col-md-4 col-sm-12">
                          <Accordian
                            title={"Garment Summary 2020-2021"}
                            content={
                              <BarChart
                                title={"Garment Summary 2020-2021"}
                                data={chartData}
                                type="column"
                              />
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* search */}
                    <div className="search-filter-row gap-2">
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
                      </div>
                      <div className="search-filter-right">
                        <button
                          className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                          onClick={() => {
                            handleExport();
                          }}
                        >
                          {translations.common.export}
                        </button>
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
          </div>
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
};

export default GarmentSummaryReport;
