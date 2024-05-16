"use client";
import React, { useState, useEffect, useRef } from "react";
import { BiFilterAlt } from "react-icons/bi";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CommonDataTable from "@components/core/Table";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";

const TicketingTracker = () => {
  const [roleLoading] = useRole();
  const { translations } = useTranslations();
  useTitle("Ticketing List");
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDates, setStartDates] = useState<any>(null);
  const [endDates, setEndDates] = useState<any>(null);
  const [brands, setBrands] = useState<any>();
  const [countries, setCountries] = useState<any>();
  const [checkedCountries, setCheckedCountries] = useState<any>([]);
  const [checkedBrand, setCheckedBrand] = useState<any>([]);
  const [checkedProcessor, setCheckedProcessor] = useState<any>([]);
  const [checkedStatus, setCheckedStatus] = useState<any>([]);
  const [documents, setDocuments] = useState([]);
  const [isClear, setIsClear] = useState(false);
  const brandId = User.brandId;

  const statusOptions = [
    { id: 1, name: "Pending" },
    { id: 2, name: "In Progress" },
    { id: 3, name: "Approved" },
    { id: 4, name: "Resolved" },
    { id: 5, name: "Rejected" },
  ];
  const processorOptions = !brandId
    ? [
      { id: 1, name: "Ginner" },
      { id: 2, name: "Spinner" },
      { id: 3, name: "Knitter" },
      { id: 4, name: "Weaver" },
      { id: 5, name: "Garment" },
    ]
    : [{ id: 1, name: "Spinner" }];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchTicketing();
  }, [searchQuery, page, limit, isClear, brandId]);

  useEffect(() => {
    fetchBrand();
  }, []);

  useEffect(() => {
    fetchCountries();
  }, []);

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

  const fetchTicketing = async () => {
    try {
      const res = await API.get(
        `ticketing?search=${searchQuery}&pagination=true&brandId=${brandId ? brandId : checkedBrand
        }&countryId=${checkedCountries}&status=${checkedStatus}&processor=${brandId ? "Spinner" : checkedProcessor
        }&page=${page}&limit=${limit}&from=${startDates ? startDates?.toISOString() : ""
        }&to=${endDates ? endDates?.toISOString() : ""}`
      );
      if (res.success) {
        setData(res.data);
        setDocuments(res.documents);
        setCount(res.count);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };

  const clearFilter = () => {
    setCheckedBrand([]);
    setEndDates(null);
    setCheckedCountries([]);
    setStartDates(null);
    setCheckedProcessor([]);
    setCheckedStatus([]);
    setIsClear(!isClear);
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    const itemId = selectedItem?.id;
    if (name === "brand") {
      if (checkedBrand.includes(itemId)) {
        setCheckedBrand(checkedBrand.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrand([...checkedBrand, itemId]);
      }
    } else if (name === "country") {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "processor") {
      if (checkedProcessor.includes(selectedItem?.name)) {
        setCheckedProcessor(
          checkedProcessor.filter((item: any) => item !== selectedItem?.name)
        );
      } else {
        setCheckedProcessor([...checkedProcessor, selectedItem?.name]);
      }
    } else if (name === "status") {
      if (checkedStatus.includes(selectedItem?.name)) {
        setCheckedStatus(
          checkedStatus.filter((item: any) => item !== selectedItem?.name)
        );
      } else {
        setCheckedStatus([...checkedStatus, selectedItem?.name]);
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
        setStartDates(date);
      } else {
        setStartDates(null);
      }
    };

    const handleTo = (date: Date | null) => {
      if (date) {
        let d = new Date(date);
        d.setHours(d.getHours() + 5);
        d.setMinutes(d.getMinutes() + 30);
        const newDate: any = d.toISOString();
        setEndDates(date);
      } else {
        setEndDates(null);
      }
    };
    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
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
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          From Date
                        </label>
                        <DatePicker
                          selected={startDates}
                          selectsStart
                          startDate={startDates}
                          endDate={endDates}
                          maxDate={endDates ? endDates : null}
                          onChange={handleFrom}
                          showYearDropdown
                          placeholderText={translations.common.from + "*"}
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          To Date
                        </label>
                        <DatePicker
                          selected={endDates}
                          selectsEnd
                          startDate={startDates}
                          endDate={endDates}
                          minDate={startDates}
                          dateFormat={"dd-MM-yyyy"}
                          onChange={handleTo}
                          showYearDropdown
                          placeholderText={translations.common.to + "*"}
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                      </div>

                      {!brandId && (
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
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
                            onSelect={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(selectedList, selectedItem, "brand");
                            }}
                            options={brands}
                            showCheckbox
                          />
                        </div>
                      )}

                      {/* <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Country
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="county_name"
                          selectedValues={countries?.filter((item: any) =>
                            checkedCountries.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "country");
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "country");
                          }}
                          options={countries}
                          showCheckbox
                        />
                      </div> */}

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Processor
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={processorOptions?.filter(
                            (item: any) => checkedProcessor.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "processor"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "processor"
                            );
                          }}
                          options={processorOptions}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Status
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={statusOptions?.filter((item: any) =>
                            checkedStatus.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "status");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "status");
                          }}
                          options={statusOptions}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchTicketing();
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
        )}
      </div>
    );
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">Ticket No</p>,
      selector: (row: any) => row.ticket_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Ticket Date</p>,
      selector: (row: any) => row.date.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Processor Name</p>,
      selector: (row: any) => row.processor_name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Processor Type</p>,
      selector: (row: any) => row.processor_type,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Type of Ticket</p>,
      selector: (row: any) => row.ticket_type,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Process/ Sale</p>,
      selector: (row: any) => row.process_or_sales,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Lot No/ Style Mark No</p>,
      selector: (row: any) => row.style_mark_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Comments</p>,
      selector: (row: any) => row.comments,
      width: '200px',
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Documents</p>,
      selector: (row: any) => row.documents,
      cell: (row: any) => (
        <>
          {row.documents && (
            <a
              href={row.documents}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              attachment
            </a>
          )}
        </>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">Ticket Status</p>,
      selector: (row: any) => (
        <span
          style={{
            color:
              row.status === "Rejected"
                ? "red"
                : row.status === "Pending"
                  ? "orange"
                  : row.status === "Resolved"
                    ? "green"
                    : row.status === "Approved"
                      ? "blue"
                      : row.status === "In Progress"
                        ? "orange"
                        : "black",
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: <p className="text-[13px] font-medium"> Ticket Resolved Date </p>,
      cell: (row: any) => (
        <span>
          {row.status === "Resolved" && row.resolved_date
            ? row.resolved_date?.substring(0, 10)
            : row.status === "Approved"
              ? "Reviewing"
              : row.status === "In Progress"
                ? "Ticket Reverted"
                : "-"}
        </span>
      ),

      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Action</p>,
      cell: (row: any) => (
        <Link
          legacyBehavior
          href={`/escalation-matrix/ticketing-list/view-page?id=${row.id}`}
          passHref
        >
          <span className="text-blue-500 hover:text-blue-700" rel="noopener noreferrer">
            view details
          </span>
        </Link>
      ),
    },
  ];
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  if (!roleLoading) {
    return (
      <>
        {isClient ? (
          <>
            {brandId && (
              <div className="breadcrumb-box">
                <div className="breadcrumb-inner light-bg">
                  <div className="breadcrumb-left">
                    <ul className="breadcrum-list-wrap">
                      <li className="active">
                        <Link href="/brand/dashboard">
                          <span className="icon-home"></span>
                        </Link>
                      </li>
                      <li>Escalation Matrix</li>
                      <li>Ticketing List</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

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
          </>
        ) : (
          "Loading"
        )}
      </>
    );
  }
};
export default TicketingTracker;
