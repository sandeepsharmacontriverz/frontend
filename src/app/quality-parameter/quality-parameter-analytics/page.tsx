"use client";
import React, { useEffect, useState, useRef } from "react";

import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaDownload, FaEye } from "react-icons/fa";
import useRole from "@hooks/useRole";
import "react-datepicker/dist/react-datepicker.css";
import { BiFilterAlt } from "react-icons/bi";
import API from "@lib/Api";
import { handleDownload } from "@components/core/Download";
import Multiselect from "multiselect-react-dropdown";
import { useRouter } from "@lib/router-events";
const Analtyics: any = () => {
  const router = useRouter()
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [brands, setBrands] = useState([]);
  const [countries, setCountries] = useState([]);
  const [checkedDate, setCheckedDate] = useState<any>("");
  const [checkedBrand, setCheckedBrand] = useState<any>([]);
  const [checkedCountry, setCheckedCountry] = useState<any>([]);

  const [data, setData] = useState<any>([]);
  const [startDates, setStartDates] = useState<any>("");
  const [isClear, setIsClear] = useState(false);
  const [ginners, setGinners] = useState<any>([]);
  const [spinners, setSpinners] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [checkedginnerId, setCheckedGinnerId] = useState<any>([]);
  const [checkedSpinnerId, setCheckedSpinnerId] = useState<any>([]);

  useEffect(() => {
    getData();
  }, [isClear, limit, page, searchQuery]);

  useEffect(() => {
    fetchBrand();
    fetchCountries();
    fetchGinner();
    fetchSpinners();
  }, []);

  const getData = async () => {
    try {
      const res = await API.get(
        `quality-parameter?pagination=true&page=${page}&count=${count}&limit=${limit}&brandId=${checkedBrand}&countryId=${checkedCountry}&ginnerId=${selectedOption === "ginner" ? checkedginnerId : ""
        }&spinnerId=${selectedOption === "spinner" ? checkedSpinnerId : ""}&type=${selectedOption}&date=${startDates}&search=${searchQuery}`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      setCount(0);
    }
  };
  const fetchGinner = async () => {
    try {
      const res = await API.get("ginner");
      if (res.success) {
        setGinners(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchSpinners = async () => {
    try {
      const res = await API.get("spinner");
      if (res.success) {
        setSpinners(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchBrand = async () => {
    try {
      const res = await API.get("brand");
      if (res.success) {
        setBrands(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };
  const clearFilter = () => {
    setCheckedBrand([]);
    setCheckedCountry([]);
    setCheckedGinnerId([])
    setCheckedSpinnerId([])
    setSelectedOption("");
    setStartDates("")
    setIsClear(!isClear);
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
      if (checkedBrand.includes(itemId)) {
        setCheckedBrand(checkedBrand.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrand([...checkedBrand, itemId]);
      }
    } else if (name === "country") {
      if (checkedCountry.includes(itemId)) {
        setCheckedCountry(
          checkedCountry.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountry([...checkedCountry, itemId]);
      }
    } else if (name === "ginner") {
      if (checkedginnerId.includes(itemId)) {
        setCheckedGinnerId(
          checkedginnerId.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGinnerId([...checkedginnerId, itemId]);
      }
    } else if (name === "spinner") {
      if (checkedSpinnerId.includes(itemId)) {
        setCheckedSpinnerId(
          checkedSpinnerId.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSpinnerId([...checkedSpinnerId, itemId]);
      }
    }
  };
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSelectedOption(value);
  };
  const FilterPopup = ({ openFilter }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const handleFrom = (date: any) => {
      let d = new Date(date)
      setStartDates(d);
    };

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters fixWidth flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2"> {translations?.common?.Filters}</h3>
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
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectDate}
                          </label>
                          <DatePicker
                            selected={startDates}
                            onChange={handleFrom}
                            showYearDropdown
                            placeholderText={translations?.common?.SelectDate}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.Selectbrand}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="brand_name"
                            selectedValues={brands?.filter((item: any) =>
                              checkedBrand.includes(item.id)
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
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectCountry}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="county_name"
                            selectedValues={countries?.filter((item: any) =>
                              checkedCountry.includes(item.id)
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
                            {translations?.common?.SelectType}
                          </label>
                          <div className="w-100 d-flex flex-wrap mt-2">
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="1"
                                  type="radio"
                                  name="filterby"
                                  value="ginner"
                                  checked={selectedOption === "ginner"}
                                  onChange={handleRadioChange}
                                  className="mr-1"
                                />
                                <span></span>
                              </section>{" "}
                              {translations?.common?.ginner}
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="2"
                                  type="radio"
                                  name="filterby"
                                  value="spinner"
                                  checked={selectedOption === "spinner"}
                                  onChange={handleRadioChange}
                                  className="mr-1"
                                />
                                <span></span>
                              </section>{" "}
                              {translations?.common?.spinner}
                            </label>
                          </div>
                        </div>

                        {selectedOption === "ginner" && (
                          <div className="col-12 col-md-6 col-lg-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectGinner}
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="name"
                              selectedValues={ginners?.filter((item: any) =>
                                checkedginnerId.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "ginner"
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "ginner"
                                )
                              }
                              options={ginners}
                              showCheckbox
                            />
                          </div>
                        )}

                        {selectedOption === "spinner" && (
                          <div className="col-12 col-md-6 col-lg-6 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations?.common?.SelectSpinner}
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="name"
                              selectedValues={spinners?.filter((item: any) =>
                                checkedSpinnerId.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "spinner"
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "spinner"
                                )
                              }
                              options={spinners}
                              showCheckbox
                            />
                          </div>
                        )}
                      </div>
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              getData();
                              setShowFilter(false);
                            }}
                          >
                            {translations?.common?.ApplyAllFilters}

                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={clearFilter}
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
          </>
        )}
      </div>
    );
  };
  const fetchExport = async (id: any) => {
    try {
      const res = await API.get(
        `quality-parameter/export-single?qualityId=${id}`
      );
      if (res.success) {
        handleDownload(res.data, "Quality Parameter", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const columns = [
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common?.srNo}</p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.qualityParameter?.typeName}
        </p>
      ),
      selector: (row: any) =>
        row.ginner?.name ? row.ginner?.name : row.spinner?.name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.qualityParameter?.dateProcess}</p>
      ),
      selector: (row: any) =>
        row.sales ? row.sales?.date?.substring(0, 10) : row.process?.date?.substring(0, 10),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.qualityParameter?.dateReport}</p>
      ),
      cell: (row: any) => row.test_report?.substring(0, 10),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.qualityParameter?.ginLotNumber}</p>
      ),
      selector: (row: any) => row?.lot_no,
      wrap: true,
    },

    {
      name: (
        <p className="text-[13px] font-medium">{translations.qualityParameter?.reelLotNumber}</p>
      ),
      selector: (row: any) => row.process ? row.process?.reel_lot_no : row.sales?.reel_lot_no,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.qualityParameter?.SoldTo}</p>
      ),
      selector: (row: any) => row.sold?.name || "-",
      wrap: true,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.common?.action}</p>),
      width: "200px",
      cell: (row: any) => (
        <>
          <button
            className="bg-green-500 rounded p-2.5 mr-3 "
            onClick={() => {
              router.push(`/quality-parameter/quality-parameter-analytics/detail-report?id=${row.id}`)
              sessionStorage.setItem("activetab", translations?.common?.QualityParameterAnalytic)
            }}
          >
            <FaEye size={18} color="white" />
          </button>

          <button
            className="bg-yellow-500 px-2.5 py-2.5 rounded"
            onClick={() => fetchExport(row.id)}
          >
            <FaDownload size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];
  const fetchExportAll = async () => {
    try {
      const res = await API.get(`quality-parameter/export`);
      if (res.success) {
        handleDownload(res.data, "Quality Parameter", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };
  if (loading) {
    return <div> Loading...</div>;
  }
  if (!roleLoading) {
    return (
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
                        {translations?.common?.Filters} <BiFilterAlt className="m-1" />
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
                      className="bg-yellow-500 p-2 rounded text-white"
                      onClick={fetchExportAll}
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
        </div>
      </div>
    );
  }
}
export default Analtyics
