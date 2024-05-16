"use client";

import { DecimalFormat } from "@components/core/DecimalFormat";
import Loader from "@components/core/Loader";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import checkAccess from "@lib/CheckAccess";
import User from "@lib/User";
import Multiselect from "multiselect-react-dropdown";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { BiFilterAlt } from "react-icons/bi";

export default function page() {
  useTitle("Choose Rice");
  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const millId = User.MillId;
  const search = useSearchParams();
  const programId = search.get("id");
  const { translations, loading } = useTranslations();

  const [data, setData] = useState<any>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [totalyarn, setTotalQtyYarn] = useState<any>(0);
  const [isDisable, setIsDisable] = useState<any>(true);

  const [checkedBatchLotNo, setCheckedBatchLotNo] = React.useState<any>([]);
  const [checkedReelLot, setCheckedReelLot] = React.useState<any>([]);
  const [checkedRiceType, setCheckedRiceType] = React.useState<any>([]);
  const [checkedRiceVariety, setCheckedRiceVariety] = React.useState<any>([]);

  const [searchFilter, setSearchFilter] = useState("");
  const [millName, setMillName] = useState<any>();
const [filterData, setFilterData] = useState<any> ({
  batchLotNo : [],
  reelLot: [],
  riceType :[],
  riceVariety : []
});
  const [error, setError] = useState<any>([]);
  const [isClear, setIsClear] = useState(false);

  const [showFilter, setShowFilter] = useState(false);
  const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [Access, setAccess] = useState<any>({});
  const [isApiLoaded, setIsApiLoaded] = useState<any>(true);

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Mill")) {
      const access = checkAccess("Mill Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (millId) {
      getChooseRice();
      getFilterData();
    }
  }, [isClear, millId]);

  useEffect(() => {
    updateSelectedRows();
  }, [data]);

  useEffect(() => {
    const isAllChecked =
      data.length > 0 && data.every((item: any) => item.selected === true);
    setSelectAllChecked(isAllChecked);
  }, [data]);

  useEffect(() => {
    calculateTotalQuantityUsed();
  }, [selectedRows, data]);

  useEffect(() => {
    if (totalQuantityUsed > 0) {
      setIsDisable(false);
    } else {
      setIsDisable(true);
    }
  }, [totalQuantityUsed, selectedRows]);


  const getFilterData = async () => {
    try {
      const res = await API.get(`mill-process/choose-rice-filters?millId=${millId}`);
      if (res.success) {
        setFilterData({
          batchLotNo : res.data?.batchLotNo,
          reelLot: res.data?.reelLot,
          riceType : res.data?.riceType,
          riceVariety: res.data?.riceVariety
        })
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getChooseRice = async () => {
    try {
      const res = await API.get(
        `mill-process/choose-rice?millId=${millId}&programId=${programId}&riceTypeId=${checkedRiceType}&riceVarietyId=${checkedRiceVariety}&batchLotNo=${checkedBatchLotNo}&reelLotNo=${checkedReelLot}`
      );
      if (res.success) {
        let data = res.data;
        let total = 0;
        const storedData: any = sessionStorage.getItem("chooseRice");
        let selectedData = (JSON.parse(storedData) as any[]) || [];
        data = data.map((obj: any) => {
          total += obj.qty_stock;
          if (selectedData.length > 0) {
            let selected = selectedData.find(
              (item: any) => item.id === obj.id
            );
            if (selected) {
              return {
                ...obj,
                qty_used: DecimalFormat(selected.qtyUsed),
                selected: true,
              };
            } else {
              return {
                ...obj,
                qty_used: DecimalFormat(obj.qty_stock),
                selected: false,
              };
            }
          } else {
            return {
              ...obj,
              qty_used: DecimalFormat(obj.qty_stock),
              selected: false,
            };
          }
        });

        setData(data);
        setIsApiLoaded(false)
        setTotalQtyYarn(DecimalFormat(total));
      }
    } catch (error) {
      console.log(error);
      setIsApiLoaded(false)

    }
  };

  const handleSelectAllChange = (event: any) => {
    const isChecked = event.target.checked;
    setSelectAllChecked(isChecked);
    const updatedData = data.map((item: any, index: number) => ({
      ...item,
      selected: isChecked,
    }));

    setData(updatedData);
  };

  const calculateTotalQuantityUsed = () => {
    const total = selectedRows.reduce(
      (total: any, item: any) => total + Number(item.qty_used),
      0
    );
    setTotalQuantityUsed(DecimalFormat(total));
  };

  const updateSelectedRows = () => {
    const selectedData = data.filter((item: any) => item.selected);
    setSelectedRows(selectedData);
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;

     if (name === "batchLotNo") {
      if (checkedBatchLotNo.includes(selectedItem?.batch_lot_no)) {
        setCheckedBatchLotNo(
          checkedBatchLotNo.filter((item: any) => item !== selectedItem?.batch_lot_no)
        );
      } else {
        setCheckedBatchLotNo([...checkedBatchLotNo, selectedItem?.batch_lot_no]);
      }
    }
    else if (name === "reelLotNo") {
      if (checkedReelLot.includes(selectedItem?.reel_lot_no)) {
        setCheckedReelLot(
          checkedReelLot.filter((item: any) => item !== selectedItem?.reel_lot_no)
        );
      } else {
        setCheckedReelLot([...checkedReelLot, selectedItem?.reel_lot_no]);
      }
    }
    else if (name === "riceType") {
      if (checkedRiceType.includes(itemId)) {
        setCheckedRiceType(
          checkedRiceType.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedRiceType([...checkedRiceType, itemId]);
      }
    }
    else if (name === "riceVariety") {
      if (checkedRiceVariety.includes(itemId)) {
        setCheckedRiceVariety(
          checkedRiceVariety.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedRiceVariety([...checkedRiceVariety, itemId]);
      }
    }
  };

  const handleCheckboxChange = (event: any, index: any) => {
    const isChecked = event.target.checked;
    const updatedData = [...data];
    updatedData[index].selected = !!isChecked;
    setData(updatedData);

    const isAllChecked = updatedData.every((item) => item.selected);
    setSelectAllChecked(isAllChecked);
  };

  const handleInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: any
  ) => {
    const newValue = event.target.value;
    const numericValue = newValue.replace(/[^\d.]/g, "");
    const isValidValue = /^(0*[1-9]\d*(\.\d+)?|0*\.\d+)$/.test(numericValue);
    const QtyStock: any = DecimalFormat(data[index].qty_stock)

    let errors = "";

    if (!isValidValue) {
      errors = "Please enter a valid numeric value greater than zero.";
    } else if (+numericValue > QtyStock) {
      errors = `Value should be less than or equal to ${QtyStock}`;
    }

    const newErrors = [...error];
    newErrors[index] = errors;
    setError(newErrors);

    const newData = [...data];
    newData[index].qty_used = numericValue;
    setData(newData);
  };

  const handleSubmit = () => {
    if (selectedRows.length === 0) {
      console.error("Please select at least one row.");
      return;
    }
    const rowErrors: string[] = [];
    let totalQuantityUsed = 0;

    selectedRows.forEach((row: any, index: number) => {
      const newValue = row.qty_used;
      const QtyStock: any = DecimalFormat(row.qty_stock)

      let error = "";
      if (newValue === "" || isNaN(newValue) || +newValue <= 0) {
        error = "Quantity Used cannot be empty or less than zero or 0 ";
      } else if (+newValue > QtyStock) {
        error = `Value should be less than or equal to ${QtyStock}`;
      }

      rowErrors[index] = error;
      totalQuantityUsed += +newValue;
    });
    if (rowErrors.some((error) => error !== "")) {
      return;
    }

    const selectedData = selectedRows.map((item: any) =>
    ({
      id: item.id,
      qtyUsed: DecimalFormat(Number(item.qty_used)),
      total_qty_used: DecimalFormat(totalQuantityUsed),
      totalQty: DecimalFormat(item.net_rice_qty),
      riceType: item?.rice_type,
      riceVariety: item?.rice_variety,
      riceTypeName : item?.ricetype?.map((item:any)=> item.riceType_name),
      batchLotNo: item?.batch_lot_no,
      reelLotNo: item?.reel_lot_no,
      riceVarietyName : item?.ricevariety.map((item:any)=> item.variety_name)
    }));

    selectedData && selectedData?.forEach((dataItem: any) => {
      dataItem.qtyUsed = dataItem.qtyUsed ? Number(dataItem.qtyUsed) : dataItem.qtyUsed,
        dataItem.total_qty_used = dataItem.total_qty_used ? Number(dataItem.total_qty_used) : dataItem.total_qty_used,
        dataItem.totalQty = dataItem.totalQty ? Number(dataItem.totalQty) : dataItem.totalQty
    })

    sessionStorage.setItem("chooseRice", JSON.stringify(selectedData));

    router.push("/mill/sales/add-mill-sale");
  };

  const clearFilter = () => {
    setCheckedReelLot([]);
    setCheckedRiceType([]);
    setCheckedRiceVariety([]);
    setCheckedBatchLotNo([]);
    setIsClear(!isClear);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
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
            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3  "
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

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Batch Lot No
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="batch_lot_no"
                          selectedValues={filterData.batchLotNo?.filter((item: any) =>
                            checkedBatchLotNo.includes(item.batch_lot_no)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "batchLotNo");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "batchLotNo");
                          }}
                          options={filterData.batchLotNo}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Reel Lot no
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="reel_lot_no"
                          selectedValues={filterData.reelLot?.filter((item: any) =>
                            checkedReelLot.includes(item.reel_lot_no)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "reelLotNo");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "reelLotNo");
                          }}
                          options={filterData.reelLot}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Rice Type
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="riceType_name"
                          selectedValues={filterData.riceType?.filter((item: any) =>
                            checkedRiceType.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "riceType");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "riceType");
                          }}
                          options={filterData.riceType}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Rice Variety
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="variety_name"
                          selectedValues={filterData.riceVariety?.filter((item: any) =>
                            checkedRiceVariety.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "riceVariety");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "riceVariety");
                          }}
                          options={filterData.riceVariety}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getChooseRice();
                            setShowFilter(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={() => {
                            clearFilter();
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
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo} </p>,
      cell: (row: any, index: any) => index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Mill Name</p>,
      selector: (row: any) => row?.mill?.name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Rice Lot No</p>,
      selector: (row: any) => row?.batch_lot_no,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Rice REEL Lot No</p>,
      selector: (row: any) => row?.reel_lot_no,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Rice Type</p>,
      selector: (row: any) => row?.ricetype?.map((item:any)=> item.riceType_name)?.join(','),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> Total Quantity Received </p>,
      selector: (row: any) => DecimalFormat(row?.net_rice_qty),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Quantity In Stock </p>,
      selector: (row: any) => DecimalFormat(row?.qty_stock),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Total Quantity Sold </p>,
      selector: (row: any) => DecimalFormat(Number(row?.net_rice_qty) - Number(row?.qty_stock)),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> Quantity Used </p>,
      cell: (row: any, index: any) => (
        <div>
          <input
            type="text"
            value={row?.qty_used}
            onChange={(event) => handleInput(event, index)}
            className="mt-1 p-2 border border-black rounded w-full"
          />
          {error[index] && (
            <p className="text-sm text-red-500">{error[index]}</p>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      name: (
        <div className="flex justify-between ">
          {" "}
          <input
            name="view"
            type="checkbox"
            className="mr-2"
            checked={selectAllChecked}
            onChange={handleSelectAllChange}
          />
          Select All{" "}
        </div>
      ),
      cell: (row: any, index: any) => (
        <div>
          <input
            type="checkbox"
            checked={!!row?.selected}
            onChange={(event) => handleCheckboxChange(event, index)}
          />
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const totalRow: any = {
    qty_stock: "Total:",
    qty_used: "Total:" + totalQuantityUsed,
  };

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.create) {
    return (
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <Link href="/mandi/dashboard" className="active">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>
                <Link href="/mill/sales">Mill Sale</Link>
              </li>
              <li>
                <Link href="/mill/sales/add-mill-sale">
                  Add New Sale
                </Link>
              </li>
              <li>Choose Rice</li>
            </ul>
          </div>
        </div>
        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="table-minwidth w-100">
                <div className="flex gap-4 py-2">
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
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
                  <div>
                    <div>
                      <label className="text-sm">Program: </label>
                      <span className="text-sm">
                        {data ? data[0]?.program?.program_name : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                  <DataTable
                    persistTableHead
                    fixedHeader={true}
                    progressPending={isApiLoaded}
                    progressComponent={<div className="h-48 flex items-center" ><Loader height={"10px"} /></div>}
                    noDataComponent={
                      <p className="py-3 font-bold text-lg">
                        No data available in table
                      </p>
                    }
                    fixedHeaderScrollHeight="auto"
                    columns={columns}
                    data={data}
                  />
                </div>
                <div className="flex justify-end gap-5 mt-5">
                  <p className="text-sm font-semibold">
                   Total Available Rice:{totalyarn}
                  </p>
                  <p className="text-sm font-semibold">
                    {translations?.knitterInterface?.qtyUsed}: {totalQuantityUsed}
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
                      onClick={() =>
                        router.push("/mill/sales/add-mill-sale")
                      }
                    >
                      CANCEL
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
