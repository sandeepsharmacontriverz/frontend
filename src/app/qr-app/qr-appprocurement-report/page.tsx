"use client";
import React, { useEffect, useRef } from "react";
import { useState } from "react";

import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import { handleDownload } from "@components/core/Download";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";
import useDebounce from "@hooks/useDebounce";
import Loader from "@components/core/Loader";

export default function qrProcurementReport() {
  useTitle("QR APP Procurement Report");
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [checkedDate, setCheckedDate] = useState<any>("");
  const [checkedBrand, setCheckedBrand] = useState<any>([]);
  const [checkedCountry, setCheckedCountry] = useState<any>([]);
  const [checkedMandi, setCheckedMandi] = useState<any>([]);
  const [checkedProgram, setCheckedProgram] = useState<any>([]);
  const [checkedAgent, setCheckedAgent] = useState<any>([]);
  const [checkedSeason, setCheckedSeason] = useState<any>([]);
  const [mandis, setMandis] = useState<any>([]);
  const [programs, setPrograms] = useState<any>([]);
  const [brands, setBrands] = useState([]);
  const [agents, setAgents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [seasons, setSeasons] = useState<any>([]);
  const [transactionsData, setTransactionsData] = useState<any>([]);
  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);
  const [isClear, setIsClear] = useState(false);
  const debouncedSearch = useDebounce(encodeURIComponent(searchQuery), 200);

  useEffect(() => {
    getCountries();
    getBrands();
    getPrograms();
    getMandis();
    getAgents();
    getSeasons();
  }, []);

  useEffect(() => {
    getTransactions();
  }, [limit, page, debouncedSearch, isClear]);

  const getBrands = async () => {
    try {
      const res = await API.get("brand");
      if (res.success) {
        setBrands(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAgents = async () => {
    try {
      const res = await API.get("qr-app/get-agent-list");
      if (res.success) {
        setAgents(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTransactions = async () => {
    // scope-certificate?limit=${limit}&page=${page}&search=${debouncedSearch}&pagination=true&sort=des&brandId=${checkedBrand}&countryId=${checkedCountry}&stateId=${checkedState}&farmGroupId=${checkedFarmGroup}&icsId=${checkedIcsName}
    try {
      const res = await API.get(
        `qr-app/get-qr-transactions?search=${debouncedSearch}&limit=${limit}&page=${page}&pagination=true&brandId=${checkedBrand}&countryId=${checkedCountry}&programId=${checkedProgram}&mandiId=${checkedMandi}&seasonId=${checkedSeason}&agentId=${checkedAgent}&startDate=${from ? from?.toISOString() : ""
        }&endDate=${to ? to?.toISOString() : ""}`
      );
      if (res.success) {
        setTransactionsData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };

  const getPrograms = async () => {
    try {
      const res = await API.get(`program?status=true`);
      if (res.success) {
        setPrograms(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMandis = async () => {
    try {
      const res = await API.get("mandi");
      if (res.success) {
        setMandis(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCountries = async () => {
    try {
      const res = await API.get(`location/get-countries?status=true`);
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSeasons = async () => {
    try {
      const res = await API.get("season");
      if (res.success) {
        setSeasons(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const clearFilter = () => {
    setCheckedBrand([]);
    setCheckedCountry([]);
    setCheckedMandi([]);
    setCheckedProgram([]);
    setCheckedSeason([]);
    setCheckedAgent([]);
    setFrom(null);
    setTo(null);
    setIsClear(!isClear);
  };

  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div>  <Loader /></div>;
  }

  const columns = [
    {
      name: translations?.common?.srNo,
      selector: (row: any, index: any) => index + 1,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.date}
        </p>
      ),
      selector: (row: any) => row?.date?.substring(0, 10),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.farmerCode}
        </p>
      ),
      selector: (row: any) => row?.farmer_code,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.farmerName}
        </p>
      ),
      selector: (row: any) => row?.farmer_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.season}
        </p>
      ),
      selector: (row: any) => row?.season?.name,
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
        <p className="text-[13px] font-medium">{translations?.common?.state}</p>
      ),
      selector: (row: any) => row?.state?.state_name,
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
        <p className="text-[13px] font-medium">{translations?.common?.block}</p>
      ),
      selector: (row: any) => row?.block?.block_name,
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
        <p className="text-[13px] font-medium">
          {translations?.transactions?.transactionId}
        </p>
      ),
      selector: (row: any) => row?.id,
      width: "120px",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.quantityPurchased}
        </p>
      ),
      selector: (row: any) => row?.qty_purchased,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Available Paddy (kgs)
        </p>
      ),
      selector: (row: any) => row?.available_paddy,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.transactions?.price}
        </p>
      ),
      selector: (row: any) => row?.rate,
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
          {translations?.qrProcurement?.transportVehicleNo}
        </p>
      ),
      selector: (row: any) => row?.vehicle,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.qrProcurement?.paymentMethod}
        </p>
      ),
      selector: (row: any) => row?.payment_method,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Mandi Name 
        </p>
      ),
      selector: (row: any) => row?.mandi?.name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.qrProcurement?.agent}
        </p>
      ),
      selector: (row: any) => row?.agent?.lastName ? row?.agent?.firstName + " " + row?.agent?.lastName : row?.agent?.firstName,
      wrap: true,
    },
  ];

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
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
    } else if (name === "program") {
      if (checkedProgram.includes(itemId)) {
        setCheckedProgram(
          checkedProgram.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgram([...checkedProgram, itemId]);
      }
    } else if (name === "country") {
      if (checkedCountry.includes(itemId)) {
        setCheckedCountry(
          checkedCountry.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountry([...checkedCountry, itemId]);
      }
    } else if (name === "mandi") {
      if (checkedMandi.includes(itemId)) {
        setCheckedMandi(checkedMandi.filter((item: any) => item !== itemId));
      } else {
        setCheckedMandi([...checkedMandi, itemId]);
      }
    } else if (name === "season") {
      if (checkedSeason.includes(itemId)) {
        setCheckedSeason(checkedSeason.filter((item: any) => item !== itemId));
      } else {
        setCheckedSeason([...checkedSeason, itemId]);
      }
    } else if (name === "agent") {
      if (checkedAgent.includes(itemId)) {
        setCheckedAgent(checkedAgent.filter((item: any) => item !== itemId));
      } else {
        setCheckedAgent([...checkedAgent, itemId]);
      }
    }
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
      } else {
        setFrom(null);
      }
    };

    const handleEndDate = (date: Date | null) => {
      if (date) {
        let d = new Date(date);
        d.setHours(d.getHours() + 5);
        d.setMinutes(d.getMinutes() + 30);
        const newDate: any = d.toISOString();
        setTo(date);
      } else {
        setTo(null);
      }
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
                  <h3 className="text-lg pb-2">Filters</h3>
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
                            From
                          </label>
                          <DatePicker
                            selected={from}
                            selectsStart
                            startDate={from}
                            endDate={to}
                            maxDate={to ? to : null}
                            onChange={handleFrom}
                            showYearDropdown
                            placeholderText="From"
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            To
                          </label>
                          <DatePicker
                            selected={to}
                            selectsEnd
                            startDate={from}
                            endDate={to}
                            minDate={from}
                            onChange={handleEndDate}
                            showYearDropdown
                            placeholderText="To"
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Brand
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
                            Select Program
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={programs?.filter((item: any) =>
                              checkedProgram.includes(item.id)
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
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Country
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
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Mandi
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={mandis?.filter((item: any) =>
                              checkedMandi.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "mandi"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "mandi")
                            }
                            options={mandis}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Agent
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="firstName"
                            selectedValues={agents?.filter((item: any) =>
                              checkedAgent.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(selectedList, selectedItem, "agent");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "agent")
                            }
                            options={agents}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Season
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={seasons?.filter((item: any) =>
                              checkedSeason.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "season"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "season")
                            }
                            options={seasons}
                            showCheckbox
                          />
                        </div>
                      </div>
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              getTransactions();
                              setShowFilter(false);
                            }}
                          >
                            APPLY ALL FILTERS
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={clearFilter}
                          >
                            CLEAR ALL FILTERS
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

  const fetchExportAll = async () => {
    try {
      const res = await API.get(
        `qr-app/export-qr-transactions?search=${debouncedSearch}&limit=${limit}&page=${page}&pagination=true&brandId=${checkedBrand}&countryId=${checkedCountry}&programId=${checkedProgram}&mandiId=${checkedMandi}&seasonId=${checkedSeason}&agentId=${checkedAgent}&startDate=${from ? from?.toISOString() : ""
        }&endDate=${to ? to?.toISOString() : ""}`
      );
      if (res.success) {
        handleDownload(res.data, "QR-APP Procurement", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };
  if (!roleLoading) {
    return (
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
                <li>QR APP Procurement Report</li>
              </ul>
            </div>
          </div>
        </div>
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
                          placeholder="Search "
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
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
                        FILTERS <BiFilterAlt className="m-1" />
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
                      Export
                    </button>
                  </div>
                </div>

                <CommonDataTable
                  columns={columns}
                  data={transactionsData}
                  updateData={updatePage}
                  count={count}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
