"use client";
import React, { useState, useEffect, useRef } from "react";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import CommonDataTable from "@components/core/Table";
import User from "@lib/User";
import { handleDownload } from "@components/core/Download";
import { FaDownload } from "react-icons/fa";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import Multiselect from "multiselect-react-dropdown";
import { BiFilterAlt } from "react-icons/bi";
import ModalLoader from "@components/core/ModalLoader";
import Loading from "app/loading";

const Qrcode: any = () => {
  const [roleLoading] = useRole();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);

  const [styleMark, setStyleMark] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [garments, setGarments] = useState([]);
  const [brands, setBrands] = useState([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedStyleMark, setCheckedStyleMark] = React.useState<any>([]);
  const [checkedGarments, setCheckedGarments] = React.useState<any>([]);
  const [isClear, setIsClear] = useState(false);
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);
  const [showFilter, setShowFilter] = useState(false);
  const brandId = User.brandId;

  const [isDataLoading, setIsDataLoading] = useState(false);

  const code = encodeURIComponent(searchQuery);

  const { translations, loading } = useTranslations();

  const [isAPILoading, setIsAPILoading] = useState<any>(null);

  const [exportAllCountVeryFirstTime, setExportAllCountVeryFirstTime] =
    useState(0);

  const [fullDataCount, setFullDataCount] = useState<any>(null);

  useEffect(() => {
    const getReportsCount = async () => {
      try {
        const response = await API.get(
          `reports/get-Qr-track-report?page=${page}&limit=${limit}&pagination=true`
        );
        console.log("Get Qr-track Reports Count Response : ", response?.count);
        setFullDataCount(response?.count);
      } catch (error) {
        console.log("Get Qr-track Reports Count Error : ", error);
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
            file_name: "barcode-report.xlsx",
          });
          if (response.data) {
            setIsAPILoading(null);
            handleDownload(
              response.data,
              "Rice Traceability - QR Code Track Report",
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
    getProgram();
    getBrands();
    getStyleMarkNo();
  }, []);

  useEffect(() => {
    getTransaction();
  }, [brandId, searchQuery, page, limit, isClear]);

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
  const getStyleMarkNo = async () => {
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
        setGarments(uniqueGarmentTypes);
        setStyleMark(uniqueStyleMarkNo);
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

  const getTransaction = async () => {
    try {
      const response = await API.get(
        `reports/get-Qr-track-report?brandId=${
          brandId ? brandId : checkedBrands
        }&search=${code}&limit=${limit}&page=${page}&pagination=true&programId=${checkedPrograms}&garmentType=${checkedGarments}&styleMarkNo=${checkedStyleMark}`
      );
      if (response.success) {
        setData(response.data);
        setCount(response.count);
        setExportAllCountVeryFirstTime(exportAllCountVeryFirstTime + 1);
      }
    } catch (error) {
      setCount(0);
    } 
    finally {
      setIsFilterUsed(false)
    }
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "brand") {
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
    } else if (name === "garments") {
      if (checkedGarments.includes(selectedItem)) {
        setCheckedGarments(
          checkedGarments.filter((item: any) => item !== selectedItem)
        );
      } else {
        setCheckedGarments([...checkedGarments, selectedItem]);
      }
    } else if (name === "styleMark") {
      if (checkedStyleMark.includes(selectedItem)) {
        setCheckedStyleMark(
          checkedStyleMark.filter((item: any) => item !== selectedItem)
        );
      } else {
        setCheckedStyleMark([...checkedStyleMark, selectedItem]);
      }
    }
  };

  const clearFilter = () => {
    setIsFilterUsed(true)
    setCheckedGarments([]);
    setCheckedPrograms([]);
    setCheckedBrands([]);
    setCheckedStyleMark([]);
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
              className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">
                    {translations.common.Filters}{" "}
                  </h3>
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
                      <div
                        className={
                          !brandId
                            ? "grid grid-cols-4 space-x-3"
                            : "grid grid-cols-3 space-x-3"
                        }
                      >
                        {!brandId && (
                          <div className=" mt-2">
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
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "brand"
                                );
                              }}
                              onSearch={function noRefCheck() {}}
                              onSelect={(
                                selectedList: any,
                                selectedItem: any
                              ) =>
                                handleChange(
                                  selectedList,
                                  selectedItem,
                                  "brand"
                                )
                              }
                              options={brands}
                              showCheckbox
                            />
                          </div>
                        )}
                        <div className=" mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.productType}
                          </label>
                          <Multiselect
                            isObject={false}
                            selectedValues={checkedGarments}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onKeyPressFn={function noRefCheck() {}}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "garments"
                              );
                            }}
                            onSearch={function noRefCheck() {}}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "garments"
                              )
                            }
                            options={garments}
                            showCheckbox
                          />
                        </div>
                        <div className=" mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Style/ Mark No
                          </label>
                          <Multiselect
                            isObject={false}
                            selectedValues={checkedStyleMark}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            onKeyPressFn={function noRefCheck() {}}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "styleMark"
                              );
                            }}
                            onSearch={function noRefCheck() {}}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "styleMark"
                              )
                            }
                            options={styleMark}
                            showCheckbox
                          />
                        </div>
                        <div className=" mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.SelectProgram}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={programs?.filter((item: any) =>
                              checkedPrograms.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() {}}
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
                            onSearch={function noRefCheck() {}}
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
                              getTransaction().then(()=> setShowFilter(false));
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

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const fetchExport = async () => {
    try {
      setIsDataLoading(true);
      const response = await API.get(
        `reports/export-Qr-trackreport?brandId=${
          brandId ? brandId : checkedBrands
        }&programId=${checkedPrograms}&garmentType=${checkedGarments}&styleMarkNo=${checkedStyleMark}&search=${code}&limit=${limit}&page=${page}&pagination=true`
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
          `reports/export-Qr-trackreport?brandId=${
            brandId ? brandId : checkedBrands
          }&programId=${checkedPrograms}&garmentType=${checkedGarments}&styleMarkNo=${checkedStyleMark}&search=${code}&limit=${limit}&page=${
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
      sortable: false,
      width: "70px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.mandiInterface.qrCode}{" "}
        </p>
      ),
      center: true,
      cell: (row: any) => (
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
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.brand}</p>
      ),
      selector: (row: any) => row.buyer?.brand_name,
      width: "120px",
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Garment Unit Name</p>,
      selector: (row: any) => row.garment?.name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.invoiceNumber}
        </p>
      ),
      selector: (row: any) => row.invoice_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Garment Type</p>,
      selector: (row: any) =>
        row.garment_type?.map((item: any) => item).join(", "),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.ticketing.styleMark}
        </p>
      ),
      selector: (row: any) =>
        row.style_mark_no?.map((item: any) => item).join(", "),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.totPices}
        </p>
      ),
      selector: (row: any) => row.total_no_of_pieces,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations.program}</p>,
      selector: (row: any) => row.program?.program_name,
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
                        {translations.common.Filters}{" "}
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
        {isDataLoading ? (
          <div>
            <ModalLoader />
          </div>
        ) : null}
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
export default Qrcode;
