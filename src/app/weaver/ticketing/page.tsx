"use client";
import React, { useState, useEffect, useRef } from "react";
import { BiFilterAlt } from "react-icons/bi";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CommonDataTable from "@components/core/Table";
import "react-datepicker/dist/react-datepicker.css";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import { useRouter } from "@lib/router-events";
import Link from "@components/core/nav-link";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import User from "@lib/User";
import Multiselect from "multiselect-react-dropdown";
import { Form } from "react-bootstrap";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";

export default function page() {
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();
  useTitle("Ticketing List");
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDates, setStartDates] = useState<any>(null);
  const [endDates, setEndDates] = useState<any>(null);

  const [checkedStatus, setCheckedStatus] = useState<any>([]);
  const [isClear, setIsClear] = useState(false);
  const [checkedType, setCheckedType] = React.useState<any>("");


  const DataCorrectionOptions = [
    { id: 1, name: "Process", data: "Process" },
    { id: 2, name: "Sale", data: "Sale" },
  ];

  let weaverId = User.LabId;

  const statusOptions = [
    { id: 1, name: "Pending" },
    { id: 2, name: "In Progress" },
    { id: 3, name: "Approved" },
    { id: 4, name: "Resolved" },
    { id: 5, name: "Rejected" },
  ];


  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
      const access = checkAccess("Ticketing");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (weaverId) {
      fetchTicketing();
    }
  }, [searchQuery, page, limit, weaverId, isClear]);

  const clearFilter = () => {
    setEndDates(null);
    setStartDates(null);
    setCheckedStatus([]);
    setCheckedType("")
    setIsClear(!isClear);
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    if (name === "status") {
      setCheckedStatus(selectedList.map((item: any) => item.name));
    }
  };
  const handleChangeData = (event: any) => {
    const { value } = event.target;
    setCheckedType(value);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (
          popupRef.current &&
          !(popupRef.current as any).contains(event.target)
        ) {
          setShowFilter(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [popupRef, onClose]);

    const handleFrom = (date: any) => {
      setStartDates(date);
    };
    const handleTo = (date: any) => {
      setEndDates(date);
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
                          dateFormat={"dd-MM-yyyy"}
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
                          selectsEnd
                          startDate={startDates}
                          endDate={endDates}
                          minDate={startDates}
                          onChange={handleTo}
                          showYearDropdown
                          selected={endDates}
                          dateFormat={"dd-MM-yyyy"}
                          placeholderText={translations.common.to + "*"}
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Data Correction Type
                        </label>
                        <Form.Select
                          aria-label="Default select example"
                          className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                          value={checkedType || ""}
                          name="type"
                          onChange={handleChangeData}
                        >
                          <option value="">Select Data Correction Type</option>
                          {DataCorrectionOptions?.map((processType: any) => (
                            <option
                              key={processType.name}
                              value={processType.name}
                            >
                              {processType.name}
                            </option>
                          ))}
                        </Form.Select>
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

  const fetchTicketing = async () => {
    try {
      const res = await API.get(
        `ticketing?search=${searchQuery}&processor=Weaver&processorId=${weaverId}&processSale=${checkedType}&from=${startDates ? startDates?.toISOString() : ""
        }&to=${endDates ? endDates?.toISOString() : ""
        }&status=${checkedStatus}&limit=${limit}&page=${page}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      setCount(0);
      console.log(error);
    }
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
      name: <p className="text-[13px] font-medium">Batch/ Lot No</p>,
      selector: (row: any) => row.style_mark_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Comments</p>,
      selector: (row: any) => row.comments,
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
      selector: (row: any) => row.actions,
      cell: (row: any) => (
        <Link
          href={`/weaver/ticketing/view-ticket?id=${row.id}`}
        >
          <span className="hover:text-blue-500" rel="noopener noreferrer">
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

  if (roleLoading || loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access?.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.view) {
    return (
      <>
        {isClient ? (
          <>
            <section className="right-content">
              <div className="right-content-inner">
                <div className="breadcrumb-box">
                  <div className="breadcrumb-inner light-bg">
                    <div className="breadcrumb-left">
                      <ul className="breadcrum-list-wrap">
                        <li className="active">
                          <Link href="/weaver/dashboard">
                            <span className="icon-home"></span>
                          </Link>
                        </li>
                        <li>Ticketing </li>
                      </ul>
                    </div>
                  </div>
                </div>

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
                          {Access?.create && (
                            <div className="search-filter-right">
                              <button
                                className="btn btn-all btn-purple"
                                onClick={() =>
                                  router.push("/weaver/ticketing/add-ticket")
                                }
                              >
                                {" "}
                                Create Ticket
                              </button>
                            </div>
                          )}
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
            </section>
          </>
        ) : (
          "Loading"
        )}
      </>
    );
  }
}
