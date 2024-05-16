"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import { BiFilterAlt, BiUpload } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { FaDownload, FaEye } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import Multiselect from "multiselect-react-dropdown";
import DataTable from "react-data-table-component";
import User from "@lib/User";
import ConfirmPopup from "@components/core/ConfirmPopup";

export default function page() {
  useTitle("Dashboard");
  const thirdPartyId = User.ThirdPartyInspectionId;

  const [roleLoading, hasAccess] = useRole();
  const { translations } = useTranslations();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dataList, setDataList] = useState<any>([]);

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilterList, setShowFilterList] = useState(false);
  const [mill, setMill] = useState<any>([]);
  const [lab, setLab] = useState<any>([]);

  const [checkedLabList, setCheckedLabList] = useState<any>([]);
  const [checkedMandiList, setCheckedMandiList] = useState<any>([]);

  const [isClear, setIsClear] = useState(false);
  const code = encodeURIComponent(searchQuery);
  const [dataInvoiceList, setDataInvoiceList] = useState<Array<string>>([]);
  const [showInvoiceList, setShowInvoiceList] = useState(false);

  useEffect(() => {
    if (thirdPartyId) {
      fetchTransActionList();
      getMillData();
    }
  }, [isClear,searchQuery, page, limit, thirdPartyId]);

  const fetchTransActionList = async () => {
    try {
      const response = await API.get(
        `third-party-sample?thirdPartyId=${thirdPartyId}&search=${code}&limit=${limit}&page=${page}&type=dashboard&pagination=true`
      );
      if (response?.data) {
        setDataList(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.log(error, "error");
    }
  }

  const getMillData = async () => {
    const url = `third-party-inspection/get-third-party-inspection?id=${thirdPartyId}`;
    try {
      const response = await API.get(url);
      if (response?.data?.brand?.length > 0) {
        getMill(response?.data?.brand);
        getLabData(response?.data?.brand)
        
      }
    } catch (error) {
      console.log(error, "error");
    }
  }

  const getMill = async (id: any) => {
    try {
      const res = await API.get(`mill?brandId=${id}`);
      if (res.success) {
        setMill(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLabData = async (id: any) => {
    try {
      const res = await API.get(`lab?brandId=${id}`);
      if (res.success) {
        setLab(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataInvoiceList(rowData);
    setShowInvoiceList(!showInvoiceList);
  };

  const handleView = (url: string) => {
        window.open(url, "_blank");
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

  const DocumentPopup = ({ openFilter, dataInvoice, dataInvList, onClose, type }: any) => {
        const popupRef = useRef<HTMLDivElement>(null);
        const fileName = (item: any) => {
          let file = item.split("file/");
          return file ? file[1] : "";
        };
    
        const columnsArr: any = [
          {
            name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
            width: "70px",
            cell: (row: any, index: any) => index + 1,
          },
          {
            name: <p className="text-[13px] font-medium">{translations?.knitterInterface?.File}</p>,
            cell: (row: any, index: any) => fileName(row),
          },
          {
            name: <p className="text-[13px] font-medium">{translations?.common?.Action}</p>,
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
                    onClick={() => handleDownloadData(row, "Cotton-connect|Invoice File")}
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
                      <h3 className="text-lg pb-2">{translations?.common?.InVoiceFiles}</h3>
                      <button
                        className="text-[20px]"
                        onClick={() =>  setShowInvoiceList(!showInvoiceList)}
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
                              data={type === "List" ? dataInvList : dataInvoice}
                              persistTableHead
                              fixedHeader={true}
                              noDataComponent={"No data available in table"}
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

  const columnList = [
    {
      name: (<p className="text-[13px] font-medium">{translations?.common?.srNo}</p>),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: '100px'
    },
    {
      name: (<p className="text-[13px] font-medium">Sampling Date</p>),
      selector: (row: any) => row.sample_date?.substring(0, 10),
      wrap: true,
      width: "120px"
    },
    {
      name: (<p className="text-[13px] font-medium">Lab Name</p>),
      selector: (row: any) => row.lab?.name,
    },
    {
      name: (<p className="text-[13px] font-medium">Mill Name</p>),
      selector: (row: any) => row.mill?.name,
    },
    {
      name: (<p className="text-[13px] font-medium">Batch/Lot No</p>),
      selector: (row: any) => row?.lot_no,
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">Sample collection Details</p>),
      selector: (row: any) => row.sample_collector,
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">Total number of samples collected</p>),
      selector: (row: any) => row.no_of_samples,
      wrap: true
    },
 
    {
      name: (<p className="text-[13px] font-medium">{translations?.program} </p>),
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: (<p className="text-[13px] font-medium">Code </p>),
      selector: (row: any) => row.code,
      wrap:true
    },
    {
      name: (<p className="text-[13px] font-medium">Lab Reports</p>),
      center: true,
      cell: (row: any) =>
        row?.sample_reports && row?.sample_reports.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row?.sample_reports)}
              title="Click to View All Files"
            />
          </>
        ),
      width: "120px"

    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.common?.status}</p>),
      cell: (row: any) => row.status,
      wrap: true

    },
    
  ]

  const searchDataList = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePageList = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleChangeList = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    if (name === "lab") {
      if (checkedLabList.includes(itemId)) {
        setCheckedLabList(
          checkedLabList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedLabList([...checkedLabList, itemId]);
      }
    } else if (name === "mill") {
      if (checkedMandiList.includes(itemId)) {
        setCheckedMandiList(
          checkedMandiList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedMandiList([...checkedMandiList, itemId]);
      }
    }
  };

  const clearFilterList = () => {
    setCheckedLabList([]);
    setCheckedMandiList([]);
    setSearchQuery("");
    setIsClear(!isClear);
  };

  const FilterPopupList = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (
          popupRef.current &&
          !(popupRef.current as any).contains(event.target)
        ) {
          setShowFilterList(false);
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
            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3  "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">Filters</h3>
                <button
                  className="text-[20px]"
                  onClick={() => setShowFilterList(!showFilterList)}
                >
                  &times;
                </button>
              </div>
              <div className="w-100 mt-0">
                <div className="customFormSet">
                  <div className="w-100">
                    <div className="row">
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                        Mill
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={mill?.filter((item: any) =>
                            checkedMandiList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "mill"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "mill"
                            )
                          }
                          options={mill}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Lab
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={lab?.filter((item: any) =>
                            checkedLabList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "lab"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "lab"
                            );
                          }}
                          options={lab}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchTransActionList();
                            setShowFilterList(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={() => {
                            clearFilterList();
                          }}
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

  if (!roleLoading && !hasAccess?.processor?.includes("Third_Party_Inspection")) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.processor?.includes("Third_Party_Inspection")) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/third-party-inspection/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6" />
        <div>
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form">
                  <div className="py-6">
                    <h4 className="text-xl font-semibold">SAMPLE LIST</h4>
                  </div>
                  {/* search */}
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="search-bars">
                        <form className="form-group mb-0 search-bar-inner">
                          <input
                            type="text"
                            className="form-control form-control-new jsSearchBar "
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={searchDataList}
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
                          onClick={() => setShowFilterList(!showFilterList)}
                        >
                          FILTERS <BiFilterAlt className="m-1" />
                        </button>

                        <div className="relative">
                          <FilterPopupList
                            openFilter={showFilterList}
                            onClose={!showFilterList}
                          />
                        </div>
                      </div> 
                    </div>
                  </div>
                  <DocumentPopup
                    openFilter={showInvoiceList}
                    dataInvList={dataInvoiceList}
                    type="List"
                    onClose={() => setShowInvoiceList(false)}
                  />

                  <CommonDataTable
                    columns={columnList}
                    count={count}
                    data={dataList}
                    updateData={updatePageList}
                  />
                </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
