"use client";
import React, { useState, useRef, useEffect } from "react";
import DashboardButtons from "../../../../components/brand/core/DashboardButtons";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import CommonDataTable from "@components/core/Table";
import User from "@lib/User";
import Multiselect from "multiselect-react-dropdown";

export default function page() {
  const { translations, loading } = useTranslations();
  const [roleLoading] = useRole();

  useTitle("Production Update");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [checkedCountry, setCheckedCountry] = useState<any>([]);
  const [checkedDepartment, setCheckedDepartment] = useState<any>([]);
  const [checkedProduct, setCheckedProduct] = useState<any>([]);
  const [checkedFabric, setCheckedFabric] = useState<any>([]);
  const [checkedKnitId, setCheckedKnitId] = useState([]);
  const [checkedWeaverId, setCheckedWeaverId] = useState([]);
  const [checkedYarn, setCheckedYarn] = useState<any>([]);
  const [checkedDate, setCheckedDate] = useState<any>([]);
  const [checkedGinner, setCheckedGinner] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [isClear, setIsClear] = useState(false);

  const brandId = User.brandId;
  const code = encodeURIComponent(searchQuery);

  const [filterRec, setFilterRec] = useState<any>({
    country: [],
    season: [],
    department: [],
    productSupplier: [],
    fabricSupplier: [],
    yarnSupplier: [],
    ginner: [],
  });

  useEffect(() => {
    if (brandId) {
      getProductionUpdate();
    }
  }, [page, limit, searchQuery, brandId, isClear]);

  useEffect(() => {
    if (brandId) {
      getSeasons(),
        getCountries(),
        getDepartments(),
        getFabricSupplier(),
        getProductSupplier(),
        getYarnSupplier(),
        getGinner();
    }
  }, [brandId]);

  const getProductionUpdate = async () => {
    try {
      const res = await API.get(
        `brand-interface/production-update?brandId=${brandId}&search=${code}&countryId=${checkedCountry}&departmentId=${checkedDepartment}&garmentId=${checkedProduct}&weaverId=${checkedWeaverId}&knitterId=${checkedKnitId}&spinnerId=${checkedYarn}&ginnerId=${checkedGinner}&seasonId=${checkedDate}&limit=${limit}&page=${page}&pagination=true`
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
  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries?status=true");
      if (res.success) {
        setFilterRec((prev: any) => ({
          ...prev,
          country: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getSeasons = async () => {
    try {
      const res = await API.get("season?status=true");
      if (res.success) {
        setFilterRec((prev: any) => ({
          ...prev,
          season: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDepartments = async () => {
    try {
      const res = await API.get("department?status=true");
      if (res.success) {
        setFilterRec((prev: any) => ({
          ...prev,
          department: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProductSupplier = async () => {
    try {
      const res = await API.get(`garment?brandId=${brandId}&status=true`);
      if (res.success) {
        setFilterRec((prev: any) => ({
          ...prev,
          productSupplier: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getYarnSupplier = async () => {
    try {
      const res = await API.get(`spinner?brandId=${brandId}&status=true`);
      if (res.success) {
        setFilterRec((prev: any) => ({
          ...prev,
          yarnSupplier: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFabricSupplier = async () => {
    try {
      const [weaver, knitter] = await Promise.all([
        API.get(`weaver?brandId=${brandId}&status=true`),
        API.get(`knitter?brandId=${brandId}&status=true`),
      ]);
      if (weaver.success && knitter.success) {
        const finalData = [
          weaver.data.map((obj: any) => {
            return { ...obj, type: "weaver", key: `${obj.name} - Weaver` };
          }),
          knitter.data.map((obj: any) => {
            return { ...obj, type: "knitter", key: `${obj.name} - Knitter` };
          }),
        ].flat();

        setFilterRec((prev: any) => ({
          ...prev,
          fabricSupplier: finalData,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getGinner = async () => {
    try {
      const res = await API.get(`ginner?brandId=${brandId}&status=true`);
      if (res.success) {
        setFilterRec((prev: any) => ({
          ...prev,
          ginner: res.data,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const clearFilter = () => {
    setCheckedDate([]);
    setCheckedCountry([]);
    setCheckedDepartment([]);
    setCheckedProduct([]);
    setCheckedFabric([]);
    setCheckedGinner([]);
    setCheckedYarn([]);
    setCheckedKnitId([]);
    setCheckedWeaverId([]);
    setIsClear(!isClear);
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };
  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "year") {
      if (checkedDate.includes(itemId)) {
        setCheckedDate(checkedDate.filter((item: any) => item !== itemId));
      } else {
        setCheckedDate([...checkedDate, itemId]);
      }
    } else if (name === "country") {
      if (checkedCountry.includes(itemId)) {
        setCheckedCountry(
          checkedCountry.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountry([...checkedCountry, itemId]);
      }
    } else if (name === "department") {
      if (checkedDepartment.includes(itemId)) {
        setCheckedDepartment(
          checkedDepartment.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedDepartment([...checkedDepartment, itemId]);
      }
    } else if (name === "product") {
      if (checkedProduct.includes(itemId)) {
        setCheckedProduct(
          checkedProduct.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProduct([...checkedProduct, itemId]);
      }
    } else if (name === "fabric") {
      const selectedType = selectedItem.type;
      if (checkedFabric.includes(selectedItem.id)) {
        setCheckedFabric((prevList: any) =>
          prevList.filter((item: any) => item !== selectedItem.id)
        );
        if (selectedType === "weaver") {
          setCheckedWeaverId((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        } else if (selectedType === "knitter") {
          setCheckedKnitId((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        }
      } else {
        setCheckedFabric((prevList: any) => {
          if (!prevList.includes(selectedItem.id)) {
            return [...prevList, selectedItem.id];
          }
          return prevList;
        });
        if (selectedType === "weaver") {
          setCheckedWeaverId((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        } else if (selectedType === "knitter") {
          setCheckedKnitId((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        }
      }
    } else if (name === "yarn") {
      if (checkedYarn.includes(itemId)) {
        setCheckedYarn(checkedYarn.filter((item: any) => item !== itemId));
      } else {
        setCheckedYarn([...checkedYarn, itemId]);
      }
    } else if (name === "ginner") {
      if (checkedGinner.includes(itemId)) {
        setCheckedGinner(checkedGinner.filter((item: any) => item !== itemId));
      } else {
        setCheckedGinner([...checkedGinner, itemId]);
      }
    }
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
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
                          Year
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={filterRec.season?.filter(
                            (item: any) => checkedDate.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "year",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "year",
                              true
                            )
                          }
                          options={filterRec.season}
                          showCheckbox
                        />
                      </div>
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Country
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="county_name"
                          selectedValues={filterRec.country?.filter(
                            (item: any) => checkedCountry.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "country",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "country",
                              true
                            )
                          }
                          options={filterRec.country}
                          showCheckbox
                        />
                      </div>

                      {/* <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Department
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="dept_name"
                          selectedValues={filterRec.department?.filter(
                            (item: any) => checkedDepartment.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "department",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "department",
                              true
                            )
                          }
                          options={filterRec.department}
                          showCheckbox
                        />
                      </div> */}

                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Product Supplier
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={filterRec.productSupplier?.filter(
                            (item: any) => checkedProduct.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "product",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "product"
                            )
                          }
                          options={filterRec.productSupplier}
                          showCheckbox
                        />
                      </div>

                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Fabric Supplier
                        </label>

                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="key"
                          selectedValues={filterRec.fabricSupplier?.filter(
                            (item: any) => checkedFabric.includes(item.id)
                          )}
                          // Other props...
                          onRemove={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "fabric"
                            )
                          }
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "fabric"
                            )
                          }
                          options={filterRec.fabricSupplier}
                          showCheckbox
                        />
                      </div>

                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Yarn Supplier
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={filterRec.yarnSupplier?.filter(
                            (item: any) => checkedYarn.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "yarn",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "yarn"
                            )
                          }
                          options={filterRec.yarnSupplier}
                          showCheckbox
                        />
                      </div>

                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Ginner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={filterRec.ginner?.filter(
                            (item: any) => checkedGinner.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "ginner",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "ginner"
                            )
                          }
                          options={filterRec.ginner}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getProductionUpdate();
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
      name: <p className="text-[13px] font-medium">Year</p>,
      cell: (row: any) => row.season?.name,
    },
    // {
    // name: <p className="text-[13px] font-medium">Department</p>,
    //   selector: (row: any) => row?.farmGroup?.name,
    // },
    {
      name: <p className="text-[13px] font-medium">Processor Name</p>,
      cell: (row: any) => row?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Category</p>,
      cell: (row: any) => row.type,
    },
    {
      name: <p className="text-[13px] font-medium">Organic Cotton</p>,
      cell: (row: any) => row.cotton_qty,
    },
    {
      name: <p className="text-[13px] font-medium">Yarn</p>,
      cell: (row: any) => row.spin_qty,
    },
    {
      name: <p className="text-[13px] font-medium">(Kgs)</p>,
      cell: (row: any) => row.knitter_qty,
    },
    {
      name: <p className="text-[13px] font-medium">Woven Fabric(mtrs)</p>,
      cell: (row: any) => row.weaver_qty,
    },
    {
      name: <p className="text-[13px] font-medium">Product Pcs(No)</p>,
      cell: (row: any) => row.garment_qty,
    },
  ];
  if (!roleLoading) {
    return (
      <>
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
                <li>Prduction Update</li>
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
                          placeholder="Search"
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
    );
  }
}
