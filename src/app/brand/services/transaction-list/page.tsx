"use client";
import React, { useState, useEffect, useRef } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { FaDownload, FaEye } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import DashboardButtons from "@components/brand/core/DashboardButtons";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";
import Loader from "@components/core/Loader";
import DataTable from "react-data-table-component";

export default function page() {
  const router = useRouter();
  useTitle("Transaction List");
  const [roleLoading] = useRole();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { translations, loading } = useTranslations();

  const [program, setProgram] = useState<any>([]);
  const [product, setProduct] = useState<any>([]);
  const [styleMark, setStyleMark] = useState<any>([]);
  const [inVoice, setInvoice] = useState<any>([]);
  const [isClear, setIsClear] = useState(false);

  const [checkedProduct, setCheckedProduct] = useState<any>([]);
  const [checkedStyle, setCheckedStyle] = useState<any>([]);
  const [checkedInvoice, setcheckedInvoice] = useState<any>([]);

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);

  const [showFilter, setShowFilter] = useState(false);
  const [showFilterImg, setShowFilterImg] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);

  const code = encodeURIComponent(searchQuery);
  const brandId = User.brandId;

  useEffect(() => {
    if (brandId) {
      fetchSales();
    }
  }, [brandId, searchQuery, page, limit, isClear]);

  useEffect(() => {
    if (brandId) {
      getFilterData();
    }
  }, [brandId]);

  const fetchSales = async () => {
    try {
      const response = await API.get(
        `brand-interface/transactions?brandId=${brandId}&limit=${limit}&page=${page}&search=${code}&invoiceNo=${checkedInvoice}&styleMarkNo=${checkedStyle}&product=${checkedProduct}&pagination=true`
      );
      if (response.success) {
        setData(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.error(error);
      setCount(0)
    }
  };

  const getFilterData = async () => {
    const url = `brand-interface/style-mark?brandId=${brandId}`;
    try {
      const response = await API.get(url);
      const garProd = response.data?.garmentTypes?.map((item: any) => {
        return { name: item };
      });
      setProduct(garProd);

      const styleMark = response.data?.styleMarkNo?.map((item: any) => {
        return { name: item };
      });
      const uniqueStyle = styleMark?.filter((obj: any, index: any) => {
        return index == styleMark.findIndex((o: any) => obj.name === o.name);
      });
      setStyleMark(uniqueStyle);

      const invoice = response.data?.invoices.map((item: any) => {
        return { name: item.invoice_no };
      });
      setInvoice(invoice);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };
  const handleDownloadData = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const blobURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobURL);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  useEffect(() => {
    if (brandId) {
      getProgram();
      // getProduct();
    }
  }, [brandId]);

  const getProgram = async () => {
    const url = "program";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setProgram(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.name;
    if (name === "product") {
      if (checkedProduct.includes(itemId)) {
        setCheckedProduct(checkedProduct.filter((item: any) => item != itemId));
      } else {
        setCheckedProduct([...checkedProduct, itemId]);
      }
    } else if (name === "styleNo") {
      if (checkedStyle.includes(itemId)) {
        setCheckedStyle(checkedStyle.filter((item: any) => item !== itemId));
      } else {
        setCheckedStyle([...checkedStyle, itemId]);
      }
    } else if (name === "invoiceNo") {
      if (checkedInvoice.includes(itemId)) {
        setcheckedInvoice(
          checkedInvoice.filter((item: any) => item !== itemId)
        );
      } else {
        setcheckedInvoice([...checkedInvoice, itemId]);
      }
    }
  };

  const clearFilterList = () => {
    setCheckedProduct([]);
    setCheckedStyle([]);
    setcheckedInvoice([]);
    setIsClear(!isClear);
  };

  const FilterPopupList = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
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
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Product
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={product?.filter((item: any) =>
                            checkedProduct.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "product",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "product",
                              true
                            )
                          }
                          options={product?.filter((item: any) => {
                            return item.name != "" && item.name != null;
                          })}
                          showCheckbox
                        />
                      </div>

                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Style/Mark No
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={styleMark?.filter((item: any) =>
                            checkedStyle.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "styleNo",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "styleNo",
                              true
                            )
                          }
                          options={styleMark?.filter((item: any) => {
                            return item.name != "" && item.name != null;
                          })}
                          showCheckbox
                        />
                      </div>

                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Invoice
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={inVoice?.filter((item: any) =>
                            checkedInvoice.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "invoiceNo",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "invoiceNo"
                            )
                          }
                          options={inVoice}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchSales();
                            setShowFilter(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={clearFilterList}
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

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilterImg(!showFilterImg);
  };

  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    const fileName = (item: any) => {
      let file = item.split("file/");
      return file ? file[1] : "";
    };
    const columnsArr: any = [
      {
        name: <p className="text-[13px] font-medium">S. No</p>,
        width: "70px",
        cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      },
      {
        name: <p className="text-[13px] font-medium">File</p>,
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: <p className="text-[13px] font-medium">Action</p>,
        selector: (row: any) => (
          <>
            <div className="flex items-center">
              <FaEye
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer mr-2"
                onClick={() => handleView(row)}
              />
              <FaDownload
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer"
                onClick={() => handleDownloadData(row, "Invoice File")}
              />
            </div>
          </>
        ),
        center: true,
        wrap: true,
      },
    ];

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">Invoice Files</h3>
                  <button
                    className="text-[20px]"
                    onClick={() => setShowFilterImg(!showFilterImg)}
                  >
                    &times;
                  </button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">
                        <DataTable
                          columns={columnsArr}
                          data={dataArray}
                          persistTableHead
                          fixedHeader={true}
                          noDataComponent={
                            <p className="py-3 font-bold text-lg">
                              No data available in table
                            </p>
                          }
                          fixedHeaderScrollHeight="600px"
                        />
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
    return (
      <div>
        <Loader />
      </div>
    );
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No. </p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Date </p>,

      selector: (row: any) => row.date?.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Order Reference No </p>,

      selector: (row: any) => row.brand_order_ref,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Processor Name </p>,

      selector: (row: any) => row.garment?.name,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Invoice No </p>,

      selector: (row: any) => row.invoice_no,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Garment/ Product Type </p>,

      selector: (row: any) =>
        row.garment_type?.map((item: any) => item).join(", "),
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Style/ Mark No </p>,

      selector: (row: any) =>
        row.style_mark_no?.map((item: any) => item).join(", "),
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Garment Size </p>,

      selector: (row: any) =>
        row.garment_size?.map((item: any) => item).join(", "),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Colour </p>,

      wrap: true,
      selector: (row: any) => row.color?.map((item: any) => item).join(", "),
    },
    {
      name: <p className="text-[13px] font-medium"> Total No of pieces </p>,

      wrap: true,
      selector: (row: any) => row?.total_no_of_pieces,
    },
    {
      name: <p className="text-[13px] font-medium"> No of Boxes </p>,

      wrap: true,
      selector: (row: any) => row?.total_no_of_boxes
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations?.mandiInterface?.qrCode}{" "}
        </p>
      ),
      cell: (row: any) => (
        <div className="flex">
          <img
            className=""
            src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
          />

          <button
            className="text-black hover:text-blue-600 cursor-pointer"
            onClick={() =>
              handleDownloadData(
                process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
                "qr"
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
      name: <p className="text-[13px] font-medium"> Program </p>,
      wrap: true,
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium"> TC File </p>,

      cell: (row: any) =>
        row.tc_file && (
          <div className="flex gap-2">
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.tc_file)}
            />
            <FaDownload
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleDownloadData(row.tc_file, "tcFile")}
            />
          </div>
        ),
    },
    {
      name: <p className="text-[13px] font-medium"> Contract Files </p>,

      cell: (row: any) =>
        row.contract_file && (
          <div className="flex gap-2">
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.contract_file)}
            />
            <FaDownload
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.contract_file, "contractFile")
              }
            />
          </div>
        ),
    },

    {
      name: <p className="text-[13px] font-medium"> Invoice Files </p>,

      cell: (row: any) =>
        row.invoice_files &&
        row.invoice_files.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row.invoice_files)}
              title="Click to view all files"
            />
          </>
        ),
    },

    {
      name: <p className="text-[13px] font-medium"> Delivery Notes </p>,

      cell: (row: any) =>
        row.delivery_notes && (
          <div className="flex gap-2">
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.delivery_notes)}
            />
            <FaDownload
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.delivery_notes, "delivery_notes")
              }
            />
          </div>
        ),
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
                  <Link href="/brand/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Services</li>
                <li>Transaction List</li>
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
                        FILTERS <BiFilterAlt className="m-1" />
                      </button>

                      <div className="relative">
                        <FilterPopupList
                          openFilter={showFilter}
                          onClose={!showFilter}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DocumentPopup
                  openFilter={showFilterImg}
                  dataArray={dataArray}
                  onClose={() => setShowFilterImg(false)}
                />
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
