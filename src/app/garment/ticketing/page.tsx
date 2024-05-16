"use client";
import React, { useState, useEffect, useRef } from "react";
import { BiFilterAlt } from "react-icons/bi";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CommonDataTable from "@components/core/Table";
import "react-datepicker/dist/react-datepicker.css";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";
import { Form } from "react-bootstrap";
import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";

export default function page() {
  const { translations, loading } = useTranslations();
  useTitle(translations?.ticketing?.ticketingList);
  const router = useRouter();
  const [roleLoading, hasAccess] = useRole();
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [startDates, setStartDates] = useState<any>(null);
  const [endDates, setEndDates] = useState<any>(null);
  const [checkedType, setCheckedType] = React.useState<any>("");
  const [Access, setAccess] = useState<any>({});

  const [checkedStatus, setCheckedStatus] = useState<any>([]);
  const [isClear, setIsClear] = useState(false);

  const DataCorrectionOptions = [
    { id: 1, name: "Process", data: "Process" },
    { id: 2, name: "Sale", data: "Sale" },
  ];
  const garmentId = User.garmentId;

  const statusOptions = [
    { id: 1, name: "Pending" },
    { id: 2, name: "In Progress" },
    { id: 3, name: "Approved" },
    { id: 4, name: "Resolved" },
    { id: 5, name: "Rejected" },
  ];
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (garmentId) {
      fetchTicketing();
    }
  }, [searchQuery, page, limit, garmentId]);

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Garment")) {
      const access = checkAccess("Ticketing");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  const clearFilter = () => {
    setEndDates(null)
    setStartDates(null);
    setCheckedType("")
    setCheckedStatus([]);
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
                <h3 className="text-lg pb-2">{translations?.common?.Filters}</h3>
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
                          {translations?.ticketing?.FromDate}
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
                          placeholderText={translations?.ticketing?.FromDate}
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.ticketing?.ToDate}
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
                          placeholderText={translations?.ticketing?.ToDate}
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations?.ticketing?.correctType}
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
                          {translations?.common?.status}
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
        )}
      </div>
    );
  };

  const fetchTicketing = async () => {
    try {
      const res = await API.get(
        `ticketing?search=${searchQuery}&processor=Garment&processorId=${garmentId}&processSale=${checkedType}&from=${startDates ? startDates?.toISOString() : ""
        }&to=${endDates ? endDates?.toISOString() : ""
        }&status=${checkedStatus}&limit=${limit}&page=${page}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };
  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.ticketing?.number}</p>,
      selector: (row: any) => row.ticket_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.ticketing?.date}</p>,
      selector: (row: any) => row.date.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.ticketing?.type}</p>,
      selector: (row: any) => row.ticket_type,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.ticketing?.processSale}</p>,
      selector: (row: any) => row.process_or_sales,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.ticketing?.styleMark}</p>,
      selector: (row: any) => row.style_mark_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.ticketing?.comments}</p>,
      selector: (row: any) => row.comments,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.ticketing?.doc}</p>,
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
      name: <p className="text-[13px] font-medium">{translations?.ticketing?.status}</p>,
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
      name: <p className="text-[13px] font-medium"> {translations?.ticketing?.resDate} </p>,
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
      name: <p className="text-[13px] font-medium">{translations?.common?.action} </p>,
      wrap: true,
      selector: (row: any) => row.actions,
      cell: (row: any) => (
        <NavLink
          href={`/garment/ticketing/view-details?id=${row.id}`}
        >
          <span className="hover:text-blue-500" rel="noopener noreferrer">
            view details
          </span>
        </NavLink>
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

  if (loading) {
    return <Loader />;
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
                          <NavLink href="/garment/dashboard">
                            <span className="icon-home"></span>
                          </NavLink>
                        </li>
                        <li>{translations?.ticketing?.ticketing} </li>
                      </ul>
                    </div>
                  </div>
                </div>

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
                          {Access.create &&
                            <div className="search-filter-right">
                              <button
                                className="btn btn-all btn-purple"
                                onClick={() =>
                                  router.push("/garment/ticketing/add-ticket")
                                }
                              >
                                {" "}
                                {translations?.ticketing?.create}
                              </button>
                            </div>
                          }
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
