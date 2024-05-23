"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa";
import User from "@lib/User";
import API from "@lib/Api";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import { LuEdit } from "react-icons/lu";
import Multiselect from "multiselect-react-dropdown";
import { BiFilterAlt } from "react-icons/bi";

export default function page() {
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();

  useTitle("Mill Samples");
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);
  const [showFilterList, setShowFilterList] = useState(false);
  const [mill, setMill] = useState<any>([]);
  const [lab, setLab] = useState<any>([]);
  const [program, setProgram] = useState<any>([]);

  const [checkedLabList, setCheckedLabList] = useState<any>([]);
  const [checkedMillList, setCheckedMillList] = useState<any>([]);
  const [checkedProgramList, setCheckedProgramList] = useState<any>([]);

  const [isClear, setIsClear] = useState(false);

  const code = encodeURIComponent(searchQuery);
  const thirdPartyId = User.ThirdPartyInspectionId;

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Third_Party_Inspection")) {
      const access = checkAccess("Mill Samples");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (thirdPartyId) {
      fetchSales();
      getCmsData();
    }
  }, [searchQuery, page, limit, thirdPartyId, isClear]);


  const getPrograms = async (id:any) => {
    const url = `brand/program/get?brandId=${id}`;
    try {
      const response = await API.get(url);
      if (response?.data) {
        setProgram(response?.data);
      }
    } catch (error) {
      console.log(error, "error");
    }
  }
  const getCmsData = async () => {
    const url = `third-party-inspection/get-third-party-inspection?id=${thirdPartyId}`;
    try {
      const response = await API.get(url);
      if (response?.data?.brand?.length > 0) {
        getMill(response?.data?.brand);
        getLabData(response?.data?.brand)
        getPrograms(response?.data?.brand);
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
    setDataArray(rowData);
    setShowFilter(!showFilter);
  };
  const fetchSales = async () => {
    try {
      const response = await API.get(
        `third-party-sample?thirdPartyId=${thirdPartyId}&labId=${checkedLabList}&programId=${checkedProgramList}&millId=${checkedMillList}&search=${code}&limit=${limit}&page=${page}&pagination=true`
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
  const fetchExport = async () => {
    try {
      const res = await API.get(`knitter-process/export-process?thirdPartyId=${thirdPartyId}&search=${searchQuery}`);
      if (res.success) {
        handleDownload(res.data, "Mill Samples Report", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  if (loading) {
    return <div> <Loader /> </div>;
  }

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

  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const fileName = (item: any) => {
      let file = item.split("file/")
      return file ? file[1] : ""
    }
    const columnsArr: any = [
      {
        name: (<p className="text-[13px] font-medium">{translations?.common?.srNo}</p>),
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.File}</p>),
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: (<p className="text-[13px] font-medium">{translations?.common?.Action}</p>),
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
                onClick={() => handleDownloadData(row, "Blend Material Other Document")}
              />
            </div>

          </>
        ),
        center: true,
        wrap: true,
      }
    ]

    return (
      <div>
        {openFilter && (
          <>
            <div ref={popupRef} className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">Mill Samples</h3>
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
                        <DataTable
                          columns={columnsArr}
                          data={dataArray}
                          persistTableHead
                          fixedHeader={true}
                          noDataComponent={<p className="py-3 font-bold text-lg">No data available in table</p>}
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
    )
  }

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
      if (checkedMillList.includes(itemId)) {
        setCheckedMillList(
          checkedMillList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedMillList([...checkedMillList, itemId]);
      }
    } else if (name === "program") {
      if (checkedProgramList.includes(itemId)) {
        setCheckedProgramList(
          checkedProgramList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramList([...checkedProgramList, itemId]);
      }
    }
  };

  const clearFilterList = () => {
    setCheckedLabList([]);
    setCheckedMillList([]);
    setCheckedProgramList([]);
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
                            checkedMillList.includes(item.id)
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

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={program?.filter((item: any) =>
                            checkedProgramList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          }}
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

  const columns = [
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
      name: (<p className="text-[13px] font-medium">Samples</p>),
      cell: (row: any) =>
          <>
                <Link
                    href={`/third-party-inspection/mill-samples/view-samples?id=${row.id}`}
                    className="hover:text-blue-600 text-blue-500"
                >
                    View Samples
                </Link>
          </>,
      width: "120px"

    },
    {
      name: (<p className="text-[13px] font-medium">Lab Report</p>),
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
      name: (<p className="text-[13px] font-medium">Sample Status</p>),
      cell: (row: any) => row.status,
      wrap: true

    },
    
  ]

  if (roleLoading || loading) {
    return <Loader />;
  }

  if (!roleLoading && !Access.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  if (!roleLoading && Access?.view) {
    return (
      <>
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li className="active">
                    <Link href="/third-party-inspection/dashboard">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li> Mill Samples </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6" />

          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form ">
                <div className="table-minwidth w-100">
                  {/* search */}
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

                    <div className="space-x-4">
                      {/* <button
                        className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                        onClick={fetchExport}
                      >
                        Sample Export
                      </button> */}
                      {Access?.create && (
                        <button
                          className="btn btn-all btn-purple"
                          onClick={() => router.push("/third-party-inspection/mill-samples/add-new-sample")}
                        >
                          Add New Sample
                        </button>
                      )}
                    </div>
                  </div>
                  <DocumentPopup openFilter={showFilter} dataArray={dataArray} onClose={() => setShowFilter(false)} />

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
      </>
    );
  }
}



