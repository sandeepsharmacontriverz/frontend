"use client";
import React, { useState, useEffect, useRef } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import API from "@lib/Api";
import CommonDataTable from "@components/core/Table";
import User from "@lib/User";
import { handleDownload } from "@components/core/Download";
import { FaDownload } from "react-icons/fa";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";
import moment from "moment";
import ModalLoader from "@components/core/ModalLoader";
export default function page() {
  const [roleLoading] = useRole();
  useTitle("Consolidated Traceability Report");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  const [brands, setBrands] = useState([]);
  const [garments, setGarments] = useState([]);
  const [styleMark, setStyleMark] = useState([]);
  const [GarmentType, setGarmentType] = useState([]);

  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedStyleMark, setCheckedStyleMark] = React.useState<any>([]);
  const [checkedGarments, setCheckedGarments] = React.useState<any>([]);
  const [checkedGarmentType, setCheckedGarmentType] = useState<any>([]);
  const [isClear, setIsClear] = useState(false);

  const brandId = User.brandId;

  const [isDataLoading, setIsDataLoading] = useState(false);

  const code = encodeURIComponent(searchQuery);
  const { translations, loading } = useTranslations();
  const [isFilterUsed, setIsFilterUsed] = useState<any>(false);
  const [isAPILoading, setIsAPILoading] = useState<any>(null);

  useEffect(() => {
    if (isAPILoading) {
      async function loadFunction() {
        const url = "reports/check-export-load";
        try {
          const response = await API.post(url, {
            file_name: "consolidated-traceabilty-report.xlsx",
          });
          if (response.data) {
            setIsAPILoading(null);
            handleDownload(
              response.data,
              "Rice Traceability - Consolidated Traceability Report",
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
    getStyleMark();
    getBrands();
    getGarments();
  }, []);

  useEffect(() => {
    getReport();
  }, [brandId, searchQuery, page, limit, isClear]);

  const getReport = async () => {
    try {
      const response = await API.get(
        `reports/get-consolidated-report?brandId=${brandId ? brandId : checkedBrands
        }&garmentId=${checkedGarments}&garmentType=${checkedGarmentType}&styleMarkNo=${checkedStyleMark}&search=${code}&limit=${limit}&page=${page}&pagination=true`
      );

      if (response.success) {
        setData(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setCount(0);
    }    
    finally {
      setIsFilterUsed(false)
    }
  };
  const fetchExport = async () => {
    try {
      const res = await API.get(
        `reports/export-consolidated-report?brandId=${brandId ? brandId : checkedBrands
        }`
      );
      if (res.success) {
        handleDownload(
          res.data,
          "Rice Traceability- Consolidated Traceability Report",
          ".xlsx"
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchExportAll = async () => {
    setIsDataLoading(true);

    try {
      const response = await API.get(
        `reports/export-consolidated-report?brandId=${brandId ? brandId : ''
        }`
      );
      if (response.success) {
        setIsAPILoading(Math.random());
      }
    } catch (error) {
      console.log(error);
      setIsDataLoading(false);
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
    const url = `garment`;
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

  const getStyleMark = async () => {
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
        setStyleMark(uniqueStyleMarkNo);
      }
    } catch (error) {
      console.log(error, "error");
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
    } else if (name === "garments") {
      if (checkedGarments.includes(itemId)) {
        setCheckedGarments(
          checkedGarments.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGarments([...checkedGarments, itemId]);
      }
    } else if (name === "garmentType") {
      if (checkedGarmentType.includes(selectedItem)) {
        setCheckedGarmentType(
          checkedGarmentType.filter((item: any) => item !== selectedItem)
        );
      } else {
        setCheckedGarmentType([...checkedGarmentType, selectedItem]);
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
    setCheckedBrands([]);
    setCheckedStyleMark([]);
    setCheckedGarmentType([]);
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
                              onKeyPressFn={function noRefCheck() { }}
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
                              onSearch={function noRefCheck() { }}
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
                            {translations.common.SelectGarment}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={garments?.filter((item: any) =>
                              checkedGarments.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
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
                            onSearch={function noRefCheck() { }}
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
                            Select Garment Type
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            isObject={false}
                            selectedValues={checkedGarmentType}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "garmentType"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "garmentType"
                              )
                            }
                            options={GarmentType}
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
                            onKeyPressFn={function noRefCheck() { }}
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
                            onSearch={function noRefCheck() { }}
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
                              getReport().then(()=> setShowFilter(false));
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

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  if (loading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }

  const columns = [
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.srNo} </p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.brand}</p>
      ),
      selector: (row: any) => row.buyer?.brand_name,
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.mandiInterface.qrCode}{" "}
        </p>
      ),
      center: true,
      cell: (row: any) => (
        <>
          {row?.qr ? (
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
          ) : (
            ""
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium">Date of Dispatch </p>,
      selector: (row: any) => moment(row.date)?.format("DD-MM-YYYY"),
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium">Garment Unit Number </p>,
      selector: (row: any) => row.garment?.name,
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.invoiceNumber}
        </p>
      ),
      selector: (row: any) => row.invoice_no,
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.ticketing.styleMark}
        </p>
      ),
      selector: (row: any) =>
        row.style_mark_no && row.style_mark_no?.length > 0
          ? row.style_mark_no?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium">Item Description </p>,
      selector: (row: any) =>
        row.garment_type && row.garment_type?.length > 0
          ? row.garment_type?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium"> No of Boxes/Cartons </p>,
      selector: (row: any) => row.total_no_of_boxes,
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.totPices}
        </p>
      ),
      selector: (row: any) => row.total_no_of_pieces,
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium">Dyeing Processor Name</p>,
      selector: (row: any) => row.dying_processor_name && row.dying_processor_name?.length > 0
        ? row.dying_processor_name?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Invoice Number</p>,
      selector: (row: any) => row.dying_inv && row.dying_inv?.length > 0
        ? row.dying_inv?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Batch Lot Number</p>,
      selector: (row: any) => row.dying_batch_lot_no && row.dying_batch_lot_no?.length > 0
        ? row.dying_batch_lot_no?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Dyed Fabric Qty</p>,
      selector: (row: any) => row.dying_total_quantity || "",
      wrap: true,
      width: "170px"

    },
    {
      name: <p className="text-[13px] font-medium">Finished Fabric Net Weight</p>,
      selector: (row: any) => row.dying_net_weight || "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Printing Processor Name</p>,
      selector: (row: any) => row.printing_processor_name && row.printing_processor_name?.length > 0
        ? row.printing_processor_name?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Invoice Number</p>,
      selector: (row: any) => row.printing_inv && row.printing_inv?.length > 0
        ? row.printing_inv?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Batch Lot Number</p>,
      selector: (row: any) => row.printing_batch_lot_no && row.printing_batch_lot_no?.length > 0
        ? row.printing_batch_lot_no?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Printing Fabric Qty</p>,
      selector: (row: any) => row.printing_total_quantity || "",

      wrap: true,
      width: "170px"

    },
    {
      name: <p className="text-[13px] font-medium">Finished Fabric Net Weight</p>,
      selector: (row: any) => row.printing_net_weight || "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Washing Processor Name</p>,
      selector: (row: any) => row.washing_processor_name && row.washing_processor_name?.length > 0
        ? row.washing_processor_name?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Invoice Number</p>,
      selector: (row: any) => row.washing_inv && row.washing_inv?.length > 0
        ? row.washing_inv?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Batch Lot Number</p>,
      selector: (row: any) => row.washing_batch_lot_no && row.washing_batch_lot_no?.length > 0
        ? row.washing_batch_lot_no?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Washed Fabric Qty</p>,
      selector: (row: any) => row.washing_total_quantity || "",
      wrap: true,
      width: "170px"

    },
    {
      name: <p className="text-[13px] font-medium">Finished Fabric Net Weight</p>,
      selector: (row: any) => row.washing_net_weight || "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium">Compacting Processor Name</p>,
      selector: (row: any) =>
        row.compacting_processor_name && row.compacting_processor_name?.length > 0
          ? row.compacting_processor_name?.join(", ")
          : "",
      wrap: true,
      width: "170px"

    },
    {
      name: <p className="text-[13px] font-medium">Invoice Number</p>,
      selector: (row: any) => row.compacting_inv && row.compacting_inv?.length > 0
        ? row.compacting_inv?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },
    {
      name: <p className="text-[13px] font-medium">Batch Lot Number</p>,
      selector: (row: any) => row.compacting_batch_lot_no && row.compacting_batch_lot_no?.length > 0
        ? row.compacting_batch_lot_no?.join(", ")
        : "",
      wrap: true,
      width: "170px"

    },
    {
      name: <p className="text-[13px] font-medium">Compacted Fabric Qty</p>,
      selector: (row: any) => row.compacting_total_quantity || "",
      wrap: true,
      width: "170px"

    },
    {
      name: <p className="text-[13px] font-medium">Finished Fabric Net Weight</p>,
      selector: (row: any) => row.compacting_net_weight || "",
      wrap: true,
      width: "170px"

    },

    {
      name: <p className="text-[13px] font-medium"> Date of Fabric Sale </p>,
      selector: (row: any) =>
        row.fbrc_sale_date && row.fbrc_sale_date?.length > 0
          ? row.fbrc_sale_date?.map((date: any) => date)?.join(", ")
          : "",
      wrap: true,
      width: "300px",
    },
    {
      name: <p className="text-[13px] font-medium"> Fabric processor name </p>,
      selector: (row: any) =>
        row.fbrc_name && row.fbrc_name?.length > 0
          ? row.fbrc_name?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.common.invoiceNumber}{" "}
        </p>
      ),
      selector: (row: any) =>
        row.fbrc_invoice_no && row.fbrc_invoice_no?.length > 0
          ? row.fbrc_invoice_no?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium">Lot No </p>,
      selector: (row: any) =>
        row.fbrc_lot_no && row.fbrc_lot_no?.length > 0
          ? row.fbrc_lot_no?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.fabricType}</p>
      ),
      selector: (row: any) =>
        row.fbrc_fabric_type && row.fbrc_fabric_type?.length > 0
          ? row.fbrc_fabric_type?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    // {
    //   name: <p className="text-[13px] font-medium">Fabric Length(Mts)</p>,
    //   selector: (row: any) => row.total_fabric_length,
    //   wrap: true,
    //   width: "170px"

    // },
    // {
    //   name: <p className="text-[13px] font-medium">Fabric Weight(Kgs)</p>,
    //   selector: (row: any) => row.total_fabric_weight,
    //   wrap: true,
    //   width: "170px"

    // },
    {
      name: (
        <p className="text-[13px] font-medium">Total Fabric Net Length(Mts)</p>
      ),
      selector: (row: any) => row.fbrc_weave_total_length,
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">Total Fabric Net Weight(Kgs)</p>
      ),
      selector: (row: any) => row.fbrc_knit_total_weight,
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium">Date of Yarn Sale</p>,
      selector: (row: any) =>
        row.spnr_sale_date && row.spnr_sale_date?.length > 0
          ? row.spnr_sale_date?.map((date: any) => date)?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.millInterface.spinnerName}
        </p>
      ),
      selector: (row: any) =>
        row.spnr_name && row.spnr_name?.length > 0
          ? row.spnr_name?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.common.invoiceNumber}{" "}
        </p>
      ),
      selector: (row: any) =>
        row.spnr_invoice_no && row.spnr_invoice_no?.length > 0
          ? row.spnr_invoice_no?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium">Yarn REEL Lot No.</p>,
      selector: (row: any) =>
        row.spnr_reel_lot_no && row.spnr_reel_lot_no?.length > 0
          ? row.spnr_reel_lot_no?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium">Lot/Batch Number</p>,
      selector: (row: any) =>
        row.spnr_lot_no && row.spnr_lot_no?.length > 0
          ? row.spnr_lot_no?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.millInterface.yarnType}
        </p>
      ),
      selector: (row: any) =>
        row.spnr_yarn_type && row.spnr_yarn_type?.length > 0
          ? row.spnr_yarn_type?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations?.millInterface?.yarnCount}{" "}
        </p>
      ),
      selector: (row: any) =>
        row.spnr_yarn_count && row.spnr_yarn_count?.length > 0
          ? row.spnr_yarn_count?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.millInterface.noOfBoxes}
        </p>
      ),
      selector: (row: any) => row.spnr_no_of_boxes,
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.millInterface.boxId}
        </p>
      ),
      selector: (row: any) =>
        row.spnr_box_ids && row.spnr_box_ids?.length > 0
          ? row.spnr_box_ids?.join(", ")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium">Net Weight</p>,
      selector: (row: any) => row.fbrc_total_qty,
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium"> Date of Lint Sale </p>,
      selector: (row: any) =>
        row.gnr_sale_date && row.gnr_sale_date?.length > 0
          ? row.gnr_sale_date?.map((date: any) => date)?.join(", ")
          : "",
      wrap: true,
      width: "300px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.common.invoiceNumber}{" "}
        </p>
      ),
      selector: (row: any) =>
        row.gnr_invoice_no && row.gnr_invoice_no?.length > 0
          ? row.gnr_invoice_no?.join(",")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.transactions.ginnerName}{" "}
        </p>
      ),
      selector: (row: any) =>
        row.gnr_name && row.gnr_name?.length > 0 ? row.gnr_name.join(",") : "",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.mandiInterface.reelLotNo}{" "}
        </p>
      ),
      selector: (row: any) =>
        row.gnr_reel_lot_no && row.gnr_reel_lot_no?.length > 0
          ? row.gnr_reel_lot_no?.join(",")
          : "",
      wrap: true,
      width: "180px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.mandiInterface.baleLotNo}{" "}
        </p>
      ),
      selector: (row: any) =>
        row.gnr_lot_no && row.gnr_lot_no?.length > 0
          ? row.gnr_lot_no?.join(",")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.mandiInterface.noOfBales}{" "}
        </p>
      ),
      selector: (row: any) => row.gnr_no_of_bales,
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium">Press/Bale No's </p>,
      selector: (row: any) =>
        row.gnr_press_no && row.gnr_press_no?.length > 0
          ? row.gnr_press_no?.join(",")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium">Total Qty </p>,
      selector: (row: any) => row.gnr_total_qty,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Date of Sales</p>,
      selector: (row: any) =>
        row.frmr_sale_date && row.frmr_sale_date?.length > 0
          ? row.frmr_sale_date?.map((date: any) => date)?.join(", ")
          : "",
      wrap: true,
      width: "300px",
    },
    {
      name: <p className="text-[13px] font-medium">Farmer Group Name</p>,
      selector: (row: any) =>
        row.frmr_farm_group && row.frmr_farm_group?.length > 0
          ? row.frmr_farm_group?.join(",")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.transactions.transactionId}{" "}
        </p>
      ),
      selector: (row: any) =>
        row.frmr_transactions_id && row.frmr_transactions_id?.length > 0
          ? row.frmr_transactions_id?.join(",")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.common.village}{" "}
        </p>
      ),
      selector: (row: any) =>
        row.frmr_villages && row.frmr_villages?.length > 0
          ? row.frmr_villages?.join(",")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: (
        <p className="text-[13px] font-medium"> {translations.common.state} </p>
      ),
      selector: (row: any) =>
        row.frmr_states && row.frmr_states?.length > 0
          ? row.frmr_states?.join(",")
          : "",
      wrap: true,
      width: "170px",
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.program} </p>,
      selector: (row: any) =>
        row.frmr_programs && row.frmr_programs?.length > 0
          ? row.frmr_programs?.join(",")
          : "",
      wrap: true,
      width: "170px",
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href={brandId ? "/brand/dashboard" : "/dashboard"}>
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Reports</li>
                {!brandId && <li>Processing Reports</li>}
                <li>Consolidated Traceability</li>
              </ul>
            </div>
          </div>
        </div>

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
                      Export
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
          {isDataLoading ? (
            <div>
              <ModalLoader />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
