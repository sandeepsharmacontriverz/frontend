"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import Multiselect from "multiselect-react-dropdown";

import API from "@lib/Api";
import { useRouter, useSearchParams } from "next/navigation";
import User from "@lib/User";
import DataTable from "react-data-table-component";
import { DecimalFormat } from "@components/core/DecimalFormat";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";
type CheckboxStatus = {
  [key: string]: boolean;
};

interface CheckedValues {
  [key: string]: boolean;
}
export default function page() {
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();
  const router = useRouter();
  useTitle("Choose Fabric");
  const search = useSearchParams();
  const programId = search.get("id");
  const [Access, setAccess] = useState<any>({});

  const [data, setData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [checkedBatchLotNo, setCheckedBatchLotNo] = useState<any>("");
  const [checkedReelLotNo, setCheckedReelLotNo] = useState<any>("");
  const [checkedNoOfRolls, setCheckedNoOfRolls] = useState<any>("");
  const [checkedFabricType, setCheckedFabricType] = useState<any>("");
  const [showFilterList, setShowFilterList] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);

  const [batchLotNo, setBatchLotNo] = useState([]);
  const [reelLotNo, setReelLotNo] = useState([]);
  const [noOfRolls, setNoOfRolls] = useState([]);
  const [fabricTypes, setFabricTypes] = useState([]);
  const [isDisable, setIsDisable] = useState<any>(true);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [quantityUsedErrors, setQuantityUsedErrors] = useState<string[]>(
    new Array(data.length).fill("")
  );
  const [checkboxStatus, setCheckboxStatus] = useState<CheckboxStatus>({});
  const [totalQtyYarn, setTotalQtyYarn] = useState<any>(0);
  const [checkedValues, setCheckedValues] = useState<CheckedValues>({});

  const [error, setError] = useState<any>()

  let weaverId = User.LabId;


  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
      const access = checkAccess("Weaver Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (weaverId) {
      getFilterData();
      getFabricTypes();
    }
  }, [weaverId]);

  useEffect(() => {
    if (weaverId) {
      getData();
    }
  }, [weaverId, isClear]);

  useEffect(() => {
    updateSelectedRows();
  }, [data]);
  useEffect(() => {
    calculateTotalQuantityUsed();
  }, [selectedRows]);

  useEffect(() => {
    if (totalQuantityUsed > 0) {
      setIsDisable(false);
    } else {
      setIsDisable(true);
    }
  }, [totalQuantityUsed, selectedRows]);

  useEffect(() => {
    const isAllChecked =
      data && data.every((item: any) => item.select === true);
    setSelectAllChecked(isAllChecked);
  }, [data]);

  const getFabricTypes = async () => {
    const url = `fabric-type`;
    try {
      const response = await API.get(url);
      setFabricTypes(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  useEffect(()=>{
    const updatedRowErrors:any = {};
    data.forEach((item:any) =>
      item.fabrics.forEach((row:any) => {
       if(row.select === true){
          if (row.qtyUsed <= 0 || row.qtyUsed == null) {
            updatedRowErrors[row.id] = `Fabric Used cannot be less than zero`;
          } else if (Number(row.qtyUsed) > Number(row.fabric_length_stock)) {
            updatedRowErrors[row.id] = `Value should not be greater than ${row.fabric_length_stock}`;
          }
        }
      })
    );
      setError(updatedRowErrors);
  },[data])

  const getData = async () => {
    try {
      const res = await API.get(
        `weaver-process/choose-fabric?weaverId=${weaverId}&programId=${programId}&lotNo=${checkedBatchLotNo}&reelLotNo=${checkedReelLotNo}&noOfRolls=${checkedNoOfRolls}&fabricType=${checkedFabricType}`
      );

      if (res.success) {
        let total: number = 0;

        let data = res.data;
        const storedData: any = sessionStorage.getItem("chooseFabric");
        let selectedData = (JSON.parse(storedData) as any[]) || [];

        if (selectedData.length > 0) {
          for (let obj of selectedData) {
            let mainObj = data.find((res: any) => res.id === obj.process_id);
            let childObj = mainObj?.fabrics?.find((item: any) => item.id === obj.id)
            if (mainObj) {
              childObj.select = true;
              childObj.qtyUsed = Number(obj.qtyUsed || childObj.fabric_length_stock)
            } else {
              mainObj.qty_stock = mainObj.qty_stock - obj.qtyUsed;
            }

            if (mainObj.qty_stock === 0) {
              data = data.filter(
                (dataValue: any) => dataValue.id !== mainObj.id
              );
            }
            if (mainObj && mainObj.fabrics.every((fabric: any) => fabric.select === true)) {
              mainObj.select = true;
            }
          }

          data = data?.map((obj: any) => {
            total += obj.qty_stock;
            const nData = obj.fabrics?.map((dataItem: any) => {
              if(dataItem.select){
                return { ...dataItem}
              }
              else{
                return { ...dataItem, qtyUsed: DecimalFormat(dataItem.fabric_length_stock) };
              }
            });
            
            return { ...obj,  select: false, fabrics: nData || [] };
          
          });
        } else {
          data = data?.map((obj: any) => {
            total += obj.qty_stock;
            const nData = obj.fabrics?.map((dataItem: any) => {
              return { ...dataItem, qtyUsed: DecimalFormat(dataItem.fabric_length_stock) };
            });
            
            return { ...obj,  select: false, fabrics: nData || [] };

          });
        }
        setData(data);
        setTotalQtyYarn(DecimalFormat(total));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterData = async () => {
    const url = `weaver-process/get-fabric-filters?weaverId=${weaverId}&programId=${programId}`;
    try {
      const response = await API.get(url);
      setBatchLotNo(response.data?.batchLotNo);

      setReelLotNo(response.data?.reelLot);

      setNoOfRolls(response.data?.noOfRolls);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleSelectAllChange = (e: any) => {
    const isChecked = e.target.checked;
    const newdata = data.map((el: any) => ({
      ...el,
      fabrics: el.fabrics.map((fab: any) => ({
        ...fab,
        select: isChecked,
      })),
      select: isChecked,
    }));
    setData(newdata);
    const updatedCheckedValues: CheckedValues = {};

    updatedCheckedValues["selectAll"] = isChecked;
    data.forEach((row: any) => {
      updatedCheckedValues[row.id] = isChecked;
    });

    setCheckedValues(updatedCheckedValues);
  };


  const updateSelectedRows = () => {
    const selectedFabRows: any[] = [];
    data
      .map((row: any) => {
        const selectedFab = row.fabrics
          .filter((fab: any) => fab.select)
          .map((fab: any) => (
            {
              id: fab?.id,
              process_id: fab?.process_id,
              garmentOrderRef: row?.garment_order_ref,
              brandOrderRef: row?.brand_order_ref,
              qtyUsed: DecimalFormat(Number(fab.qtyUsed)),
              total_qty_used: DecimalFormat(totalQuantityUsed),
              totalQty: DecimalFormat(row.qty_stock),
              batch_lot_no: row.batch_lot_no,
              noOfRolls: row.no_of_rolls,
              fabricType: fab?.fabric_type,
              totalYarnQty: row?.total_yarn_qty,
              fabricTypeName: fab?.fabric
            }));
        selectedFabRows.push(...selectedFab);
      })
      .filter(Boolean);
    setSelectedRows(selectedFabRows);
  };

  const handleCheckboxChange = (event: any, id: any) => {
    const isChecked = event.target.checked;
    const newdata = data.map((el: any) => {
      return el.id === id
        ? {
          ...el,
          select: isChecked,
          fabrics: el.fabrics.map((e: any) => ({
            ...e,
            select: isChecked,
          })),
        }
        : el;
    });

    setData(newdata);
    const isSelectAllChecked = newdata.every((el: any) => el.select);
    setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });
  };

  const calculateTotalQuantityUsed = () => {
    const totalQuantityUsed = selectedRows.reduce(
      (total: any, item: any) => total + Number(item.qtyUsed),
      0
    );

    setTotalQuantityUsed(DecimalFormat(totalQuantityUsed));
  };


  const handleSubmit = (event: any) => {
    if(Object.entries(error).length !== 0){
      return ;
    }
    const selectedFabRows: any[] = [];
    data
      .map((row: any) => {
        const selectedFab = row.fabrics
          .filter((fab: any) => fab.select)
          .map((fab: any) => (
            {
              id: fab?.id,
              process_id: fab?.process_id,
              garmentOrderRef: row?.garment_order_ref,
              brandOrderRef: row?.brand_order_ref,
              qtyUsed: Number(fab.qtyUsed),
              total_qty_used: Number(totalQuantityUsed),
              totalQty: Number(row.qty_stock),
              batch_lot_no: row.batch_lot_no,
              noOfRolls: row.no_of_rolls,
              fabricType: fab?.fabric_type,
              totalYarnQty: row?.total_yarn_qty,
              fabricTypeName: fab?.fabric
            }));
        selectedFabRows.push(...selectedFab);
      })

    if (selectedFabRows.length > 0) {
      sessionStorage.setItem("chooseFabric", JSON.stringify(selectedFabRows));
      router.push("/weaver/weaver-sales/add-weaver-sales");
    }
  };

  const handleChildCheckboxChange = (
    id: any,
    isChecked: boolean,
    index: any
  ) => {
    const newdata = data.map((el: any) => {
      if (el.id === index) {
        const updatedFabrics = el.fabrics.map((fab: any) => {
          if (fab.id === id.id) {
            return {
              ...fab,
              select: isChecked,
            };
          }
          return fab;
        });
        const areAllChildRowsChecked = updatedFabrics.every(
          (fab: any) => fab.select
        );

        return {
          ...el,
          select: areAllChildRowsChecked ? isChecked : false,
          fabrics: updatedFabrics,
        };
      }
      return el;
    });

    setData(newdata);
    const isSelectAllChecked = newdata.every((el: any) => el.select);
    setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">Sr No. </p>,
      cell: (row: any, index: any) => (
        <div className="p-1">{row.id !== 0 && <>{index + 1}</>}</div>
      ),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Weaver Name </p>,
      selector: (row: any) => row.weaver?.name,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Fabric Reel Lot No</p>,
      selector: (row: any) => row.batch_lot_no,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Garment Order Reference Number
        </p>
      ),
      selector: (row: any) => row.garment_order_ref,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Brand Order Reference Number
        </p>
      ),
      selector: (row: any) => row.brand_order_ref,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Batch Lot No </p>,
      selector: (row: any) => row.batch_lot_no,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">No. of Rolls</p>,
      selector: (row: any) => row.no_of_rolls,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Total Quantity Received</p>,
      selector: (row: any) => DecimalFormat(row.total_fabric_length),
    },
    {
      name: <p className="text-[13px] font-medium">Quanitity in Stock </p>,
      selector: (row: any) => DecimalFormat(row.qty_stock),
    },
    {
      name: <p className="text-[13px] font-medium">Total Quantity Sold</p>,
      selector: (row: any) =>
        DecimalFormat(Number(row.total_fabric_length) - Number(row.qty_stock)),
    },
    {
      name: (
        <div className="flex justify-between ">
          <input
            name="check"
            type="checkbox"
            checked={selectAllChecked}
            onChange={handleSelectAllChange}
            className="mr-3"
          />
          Select All
        </div>
      ),
      cell: (row: any, index: any) => (
        <>
          <input
            type="checkbox"
            checked={!!row.select}
            onChange={(event) => handleCheckboxChange(event, row.id)}
          />
        </>
      ),
    },
  ];

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };
  const handleChangeList = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    if (name === "batchLotNo") {
      let itemName = selectedItem?.batch_lot_no;
      if (checkedBatchLotNo.includes(itemName)) {
        setCheckedBatchLotNo(
          checkedBatchLotNo.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedBatchLotNo([...checkedBatchLotNo, itemName]);
      }
    } else if (name === "reelLotNo") {
      let itemName = selectedItem?.reel_lot_no;

      if (checkedReelLotNo.includes(itemName)) {
        setCheckedReelLotNo(
          checkedReelLotNo.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedReelLotNo([...checkedReelLotNo, itemName]);
      }
    } else if (name === "noOfRolls") {
      let itemName = selectedItem?.no_of_rolls;

      if (checkedNoOfRolls.includes(itemName)) {
        setCheckedNoOfRolls(
          checkedNoOfRolls.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedNoOfRolls([...checkedNoOfRolls, itemName]);
      }
    } else if (name === "fabricTypes") {
      if (checkedFabricType.includes(itemId)) {
        setCheckedFabricType(
          checkedFabricType.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedFabricType([...checkedFabricType, itemId]);
      }
    }
  };

  const clearFilterList = () => {
    setCheckedBatchLotNo([]);
    setCheckedNoOfRolls([]);
    setCheckedFabricType([]);
    setCheckedReelLotNo([]);
    setIsClear(!isClear);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3"
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-lg rounded-md">
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
                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Fabric Reel Lot No.
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="reel_lot_no"
                          selectedValues={reelLotNo?.filter((item: any) =>
                            checkedReelLotNo.includes(item.reel_lot_no)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "reelLotNo"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "reelLotNo"
                            )
                          }
                          options={reelLotNo}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Batch Lot No.
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="batch_lot_no"
                          selectedValues={batchLotNo?.filter((item: any) =>
                            checkedBatchLotNo.includes(item.batch_lot_no)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "batchLotNo"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "batchLotNo"
                            )
                          }
                          options={batchLotNo}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Fabric Type
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="fabricType_name"
                          selectedValues={fabricTypes?.filter((item: any) =>
                            checkedFabricType.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "fabricTypes"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "fabricTypes"
                            )
                          }
                          options={fabricTypes}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          No. of Rolls
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="no_of_rolls"
                          selectedValues={noOfRolls?.filter((item: any) =>
                            checkedNoOfRolls.includes(item.no_of_rolls)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "noOfRolls"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "noOfRolls"
                            )
                          }
                          options={noOfRolls}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getData();
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

  if (roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access?.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.create) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href="/weaver/dashboard" className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/weaver/weaver-sales" className="active">
                    Sale
                  </Link>
                </li>
                <li>
                  <Link
                    href="/weaver/weaver-sales/add-weaver-sales"
                    className="active"
                  >
                    New Sale
                  </Link>
                </li>
                <li>Choose Fabric </li>
              </ul>
            </div>
          </div>
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form ">
                <div className="table-minwidth w-100">
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="fliterBtn">
                        <button
                          className="flex"
                          type="button"
                          onClick={() => setShowFilterList(!showFilterList)}
                        >
                          FILTERS <BiFilterAlt className="m-1" />
                        </button>
                        <div className="relative">
                          <FilterPopup
                            openFilter={showFilterList}
                            onClose={!showFilterList}
                          />
                        </div>
                      </div>
                      <div className="flex items-center ml-4">
                        <label className="text-sm">Program: </label>
                        <span className="text-sm">
                          {" "}
                          {data ? data[0]?.program?.program_name : ""}{" "}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <hr className="my-6" />
              <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                <DataTable
                  columns={columns}
                  data={data}
                  noDataComponent={
                    <p className="py-3 font-bold text-lg">
                      {translations?.common?.Nodata}
                    </p>
                  }
                  expandableRows={true}
                  expandableRowExpanded={(row) =>
                    row?.fabrics?.some((data: any) => data.select === true)
                  }
                  expandableRowsComponent={({
                    data: tableData,
                  }: {
                    data: any;
                  }) => {
                    return (
                      <ExpandedComponent
                      data={data}
                      id={tableData?.id}
                      setData={setData}
                      error={error}
                      setError={setError}
                      checkedValues={checkedValues}
                      onChildCheckboxChange={handleChildCheckboxChange}
                    />
                    );
                  }}
                />
              </div>
              <hr className="my-6" />
              <div className="flex justify-end gap-5">
                <p className="text-sm font-semibold">
                  Total Available Fabric: {totalQtyYarn}
                </p>
                <p className="text-sm font-semibold">
                  Total Fabric Used: {totalQuantityUsed}
                </p>
              </div>

              <div className="pt-12 w-100 d-flex justify-end customButtonGroup">
                <section>
                  <button
                    className="btn-purple mr-2"
                    disabled={isDisable}
                    style={
                      isDisable
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                    }
                    onClick={handleSubmit}
                  >
                    SUBMIT
                  </button>
                  <button
                    className="btn-outline-purple"
                    onClick={() => {
                      // sessionStorage.removeItem("chooseFabric");
                      router.push("/weaver/weaver-sales/add-weaver-sales");
                    }}
                  >
                    CANCEL
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const ExpandedComponent: React.FC<{
  data: any;
  id: number;
  setData: any;
  error:any,
  setError:any,
  checkedValues: CheckedValues;
  onChildCheckboxChange: (id: string, checked: boolean, index: any) => void;
}> = ({ data, id, checkedValues, onChildCheckboxChange, error, setError, setData }) => {
  const [editingFabricId, setEditingFabricId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const handleChildCheckboxChange = (
    item: any,
    isChecked: boolean,
    index: any
  ) => {
    onChildCheckboxChange(item, isChecked, index);
  };

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  // Function to handle editing start
  const startEditing = (fabricId: any, initialValue: any) => {
    setInputValue(initialValue);
    setEditingFabricId(fabricId);
  };

  const handleInput = useCallback(
    (fabricId: any, fieldValue: any) => {
      const updatedData = data.map((obj: any) => {
        const updatedFabrics = obj.fabrics.map((item: any) => {
          if (item.id === fabricId) {
            return { ...item, qtyUsed: fieldValue };
          }
          return item;
        });
        return { ...obj, fabrics: updatedFabrics };
      });

      setData(updatedData);
      setEditingFabricId(null);
    },
    [data, setData]
  );


  return (
    <div className="flex" style={{ padding: "20px" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Fabric Type
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Fabric GSM
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Fabric Length
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Fabric in Stock
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Fabric Used
            </th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((e: any) => e.id === id)
            .map((item: any, index: any) => {
              return (
                <React.Fragment key={index}>
                  {item.fabrics.map((fabData: any, baleIndex: any) => (
                    <tr key={baleIndex}>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {fabData?.fabric?.fabricType_name}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {fabData?.fabric_gsm}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {fabData?.fabric_length}
                      </td>
                      <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                      }}
                    >
                      {fabData?.fabric_length_stock}
                    </td>

                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                      }}
                    >
                      <input
                              type="number"
                              value={editingFabricId === fabData.id ? inputValue : fabData.qtyUsed}
                              className="border h-7 w-36"
                              onChange={handleInputChange}
                              onBlur={() => handleInput(fabData.id, inputValue)}
                              onFocus={() => startEditing(fabData.id, fabData.qtyUsed)}
                            />
                          
                      {error[fabData.id] && (
                        <p className="text-sm w-36 text-red-500">{error[fabData.id]}</p>
                      )}
                    </td>

                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        <input
                          type="checkbox"
                          name={fabData.id}
                          checked={fabData.select || false}
                          onChange={(e) =>
                            handleChildCheckboxChange(
                              fabData,
                              e.target.checked,
                              id
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
