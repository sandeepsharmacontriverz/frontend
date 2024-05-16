"use client";
import { useState, useEffect } from "react";
import React from "react";
import { useRouter } from "@lib/router-events";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import { FaDownload, FaEye } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import User from "@lib/User";
import Loader from "@components/core/Loader";
import Multiselect from "multiselect-react-dropdown";
import { Form } from "react-bootstrap";

const processType = [
  {
    id: 1,
    name: "ginner",
  },
  {
    id: 2,
    name: "spinner",
  },
];

const tracebaleTraining: any = () => {
  useTitle("Cotton Quality Parameter");
  const [roleLoading] = useRole();
  const router = useRouter();
  const brandId = User.brandId;

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClear, setIsClear] = useState(false);
  const [country, setCountry] = useState([]);
  const [ginner, setGinner] = useState([]);
  const [spinner, setSpinner] = useState([]);

  const [showFilter, setShowFilter] = useState(false);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedType, setCheckedType] = React.useState<any>([]);
  const [checkedGinners, setCheckedGinners] = React.useState<any>([]);
  const [checkedSpinners, setCheckedSpinners] = React.useState<any>([]);

  const [from, setFrom] = useState<any>("");
  const code = encodeURIComponent(searchQuery);

  useEffect(() => {
    setIsClient(true);
    if (brandId) {
      getQualityParameter();
      getCountry();
    }
  }, [searchQuery, page, limit, isClear, brandId]);

  useEffect(() => {
    if (brandId) {
      if (checkedType == "spinner") {
        getSpinner();
        setGinner([]);
        setCheckedGinners([]);
      } else if (checkedType == "ginner") {
        getGinner();
        setSpinner([]);
        setCheckedSpinners([]);
      }
    }
  }, [brandId, checkedType]);

  const getQualityParameter = async () => {
    const code = encodeURIComponent(searchQuery);
    const url = `quality-parameter?brandId=${brandId}&countryId=${checkedCountries}&ginnerId=${checkedGinners}&spinnerId=${checkedSpinners}&type=${checkedType}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

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

  const handleSingleDownload = async (id: number) => {
    try {
      const res = await API.get(
        `quality-parameter/export-single?qualityId=${id}`
      );
      if (res.success) {
        handleDownload(res.data, "Cotton_connect Quality Parameter", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (event: any) => {
    const { value, name } = event.target;
    setCheckedType([value]);
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
    } else if (name === "ginners") {
      if (checkedGinners.includes(itemId)) {
        setCheckedGinners(
          checkedGinners.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGinners([...checkedGinners, itemId]);
      }
    } else if (name === "type") {
      if (checkedType.includes(selectedItem?.name)) {
        setCheckedType(
          checkedType.filter((item: any) => item !== selectedItem?.name)
        );
      } else {
        setCheckedType([...checkedType, selectedItem?.name]);
      }
    } else if (name === "spinners") {
      if (checkedSpinners.includes(itemId)) {
        setCheckedSpinners(
          checkedSpinners.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSpinners([...checkedSpinners, itemId]);
      }
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

  const getGinner = async () => {
    const url = `ginner?brandId=${brandId}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setGinner(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getSpinner = async () => {
    const url = `spinner?brandId=${brandId}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setSpinner(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleFrom = (date: any) => {
    const formatted = new Date(date);
    setFrom(formatted);
  };

  const clearFilter = () => {
    setFrom("");
    setCheckedCountries([]);
    setCheckedGinners([]);
    setCheckedType([]);
    setCheckedSpinners([]);
    setIsClear(!isClear);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = React.useRef<HTMLDivElement>(null);

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

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">{translations.common.Filters}</h3>
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
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.qualityParameter.dateReport}
                        </label>
                        <DatePicker
                          selected={from}
                          dateFormat={"dd-MM-yyyy"}
                          onChange={handleFrom}
                          showYearDropdown
                          placeholderText={translations.transactions.date + "*"}
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                      </div>
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectCountry}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="county_name"
                          selectedValues={country?.filter((item: any) =>
                            checkedCountries.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "countries",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
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

                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.selectProcesor}
                        </label>
                        <Form.Select
                          aria-label="Default select example"
                          className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                          value={checkedType || ""}
                          name="type"
                          onChange={handleChange}
                        >
                          <option value="">{translations.common.selectProcesor}</option>
                          {processType?.map((processType: any) => (
                            <option
                              key={processType.name}
                              value={processType.name}
                            >
                              {processType.name}
                            </option>
                          ))}
                        </Form.Select>
                      </div>

                      {checkedType.includes("ginner") && (
                        <div className="col-md-6 col-sm-12 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectGinner}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={ginner?.filter((item: any) =>
                              checkedGinners.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "ginners",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "ginners"
                              )
                            }
                            options={ginner}
                            showCheckbox
                          />
                        </div>
                      )}

                      {checkedType.includes("spinner") && (
                        <div className="col-md-6 col-sm-12 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.SelectSpinner}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={spinner?.filter((item: any) =>
                              checkedSpinners.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "spinners",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "spinners"
                              )
                            }
                            options={spinner}
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
                            getQualityParameter();
                            setShowFilter(false);
                          }}
                        >
                          {translations.common.ApplyAllFilters}
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={clearFilter}
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
        )}
      </div>
    );
  };

  const dateFormatter = (date: any) => {
    const formatted = new Date(date)
      ?.toJSON()
      ?.slice(0, 10)
      ?.split("-")
      ?.reverse()
      ?.join("/");
    return formatted;
  };

  function formatTime(timeString: any) {
    if (timeString) {
      const [hourString, minute] = timeString?.split(":");
      const hour = +hourString % 24;
      return (hour % 12 || 12) + ":" + minute + (hour < 12 ? "AM" : "PM");
    } else {
      return "";
    }
  }
  const { translations, loading } = useTranslations();
  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,

    },
    {
      name: <p className="text-[13px] font-medium">Ginner/Spinner Name</p>,
      cell: (row: any) => (row.ginner ? row.ginner?.name : row.spinner?.name),
      wrap: true,

    },
    {
      name: <p className="text-[13px] font-medium">Date of Process</p>,

      cell: (row: any) =>
        row.process
          ? dateFormatter(row.process?.date)
          : dateFormatter(row.sales?.date),
      wrap: true,

    },
    {
      name: <p className="text-[13px] font-medium">Date of Report</p>,
      cell: (row: any) => dateFormatter(row.test_report),
    },
    {
      name: <p className="text-[13px] font-medium">Gin Lot Number</p>,
      cell: (row: any) => row.lot_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Reel Lot Number</p>,
      cell: (row: any) =>
        row.reel_lot_no ? row.reel_lot_no : row.process?.reel_lot_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Sold to</p>,
      cell: (row: any) => row.sold?.name,
    },
    {
      name: <p className="text-[13px] font-medium">{translations.common.action}</p>,
      width: "200px",
      cell: (row: any) => (
        <>
          <button
            className="bg-green-500 rounded p-2.5 mr-3 "
            onClick={() =>
              router.push(`/brand/detail-report-brand?id=${row.id}`)
            }
          >
            <FaEye size={18} color="white" />
          </button>

          <button
            className="bg-yellow-500 px-2.5 py-2.5 rounded"
            onClick={() => handleSingleDownload(row.id)}
          >
            <FaDownload size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <>
            <section className="right-content">
              <div className="right-content-inner">
                {/* breadcrumb */}
                <div className="breadcrumb-box">
                  <div className="breadcrumb-inner light-bg">
                    <div className="breadcrumb-left">
                      <ul className="breadcrum-list-wrap">
                        <li className="active">
                          <Link href="/brand/dashboard">
                            <span className="icon-home"></span>
                          </Link>
                        </li>
                        <li>{translations.common.CottonQuality}</li>
                        <li>{translations.common.CottonQualityParameter}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* farmgroup start */}
                <div className="farm-group-box">
                  <div className="farm-group-inner">
                    <div className="table-form">
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

                          <div className="search-filter-right">
                            <button
                              className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                              onClick={fetchExportAll}
                            >
                              {translations.common.exportAll}
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
            </section>
          </>
        ) : (
          <div className="w-full min-h-screen flex justify-center items-center">
            <span>
              <Loader />
            </span>
          </div>
        )}
      </div>
    );
  }
};

export default tracebaleTraining;
