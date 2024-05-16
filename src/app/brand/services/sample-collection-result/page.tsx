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
    useTitle("Sample Collection Result");
    const [roleLoading] = useRole();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { translations, loading } = useTranslations();

    const [program, setProgram] = useState<any>([]);
    const [mill, setMill] = useState<any>([]);
    const [lab, setLab] = useState<any>([]);
    const [thirdParty, setThirdParty] = useState<any>([]);
    const [isClear, setIsClear] = useState(false);

    const [checkedMill, setCheckedMill] = useState<any>([]);
    const [checkedLab, setCheckedLab] = useState<any>([]);
    const [checkedThirdParty, setCheckedThirdParty] = useState<any>([]);
    const [checkedPrograms, setCheckedPrograms] = useState<any>([]);


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

    const fetchSales = async () => {
        try {
            const response = await API.get(
                `lab-report?brandId=${brandId}&limit=${limit}&page=${page}&search=${code}&thirdPartyId=${checkedThirdParty}&labId=${checkedLab}&millId=${checkedMill}&programId=${checkedPrograms}&pagination=true`
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
            getMill();
            getLab();
            getThirdParty();
        }
    }, [brandId]);

    const getProgram = async () => {
        const url = `program`;
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

    const getMill = async () => {
        const url = `mill?brandId=${brandId}`;
        try {
            const response = await API.get(url);
            if (response.success) {
                const res = response.data;
                setMill(res);
            }
        } catch (error) {
            console.log(error, "error");
        }
    };

    const getLab = async () => {
        const url = `lab?brandId=${brandId}`;
        try {
            const response = await API.get(url);
            if (response.success) {
                const res = response.data;
                setLab(res);
            }
        } catch (error) {
            console.log(error, "error");
        }
    };

    const getThirdParty = async () => {
        const url = `third-party-inspection?brandId=${brandId}`;
        try {
            const response = await API.get(url);
            if (response.success) {
                const res = response.data;
                setThirdParty(res);
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
        let itemId = selectedItem?.id;
        if (name === "mill") {
          if (checkedMill.includes(itemId)) {
            setCheckedMill(checkedMill.filter((item: any) => item != itemId));
          } else {
            setCheckedMill([...checkedMill, itemId]);
          }
        } else if (name === "lab") {
          if (checkedLab.includes(itemId)) {
            setCheckedLab(checkedLab.filter((item: any) => item !== itemId));
          } else {
            setCheckedLab([...checkedLab, itemId]);
          }
        } else if (name === "thirdParty") {
          if (checkedThirdParty.includes(itemId)) {
            setCheckedThirdParty(
              checkedThirdParty.filter((item: any) => item !== itemId)
            );
          } else {
            setCheckedThirdParty([...checkedThirdParty, itemId]);
          }
        }
        else if (name === "program") {
            if (checkedPrograms.includes(itemId)) {
              setCheckedPrograms(
                checkedPrograms.filter((item: any) => item !== itemId)
              );
            } else {
                setCheckedPrograms([...checkedPrograms, itemId]);
            }
          }
      };

      const clearFilterList = () => {
        setCheckedMill([]);
        setCheckedLab([]);
        setCheckedThirdParty([]);
        setCheckedPrograms([]);
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
                              Select Mill Name
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
                              displayValue="name"
                              selectedValues={mill?.filter((item: any) =>
                                checkedMill.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(selectedList: any, selectedItem: any) => {
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "mill",
                                  true
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(selectedList: any, selectedItem: any) =>
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "mill",
                                  true
                                )
                              }
                              options={mill}
                              showCheckbox
                            />
                          </div>

                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Select Lab Name
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
                              displayValue="name"
                              selectedValues={lab?.filter((item: any) =>
                                checkedLab.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(selectedList: any, selectedItem: any) => {
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "lab",
                                  true
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(selectedList: any, selectedItem: any) =>
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "lab",
                                  true
                                )
                              }
                              options={lab}
                              showCheckbox
                            />
                          </div>

                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Select Third Party
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
                              displayValue="name"
                              selectedValues={thirdParty?.filter((item: any) =>
                                checkedThirdParty.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(selectedList: any, selectedItem: any) => {
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "thirdParty",
                                  true
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(selectedList: any, selectedItem: any) =>
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "thirdParty"
                                )
                              }
                              options={thirdParty}
                              showCheckbox
                            />
                          </div>
                          <div className="col-md-6 col-sm-12 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Select Program
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              // id="programs"
                              displayValue="program_name"
                              selectedValues={program?.filter((item: any) =>
                                checkedPrograms.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(selectedList: any, selectedItem: any) => {
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "program",
                                  true
                                );
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(selectedList: any, selectedItem: any) =>
                                handleFilterChange(
                                  selectedList,
                                  selectedItem,
                                  "program"
                                )
                              }
                              options={program}
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
            name: <p className="text-[13px] font-medium">Sample Date </p>,

            selector: (row: any) => row.sample_date?.substring(0, 10),
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Mill Name</p>,
            selector: (row: any) => row.mill?.name,
            sortable: false,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium"> Lot No </p>,

            selector: (row: any) => row.lot_no,
            sortable: false,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium"> Third Party Name </p>,

            selector: (row: any) => row.thirdparty?.name,
            sortable: false,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium"> Lab Name </p>,
            selector: (row: any) =>
                row.lab?.name,
            sortable: false,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Code</p>,
            selector: (row: any) => row.code,
            sortable: false,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Sample Reports</p>,
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
            sortable: false,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium"> Status of sample </p>,

            selector: (row: any) =>
                row.status,
            sortable: false,
            wrap: true,
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
                                <li>Sample Collection Result</li>
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
