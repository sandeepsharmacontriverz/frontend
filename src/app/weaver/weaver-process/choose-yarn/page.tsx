"use client";
import React, { useState, useEffect, useRef } from "react";
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

export default function page() {
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();
  const search = useSearchParams();
  const programId = search.get("id");
  const typeChoosed = search.get("type");
  const router = useRouter();
  useTitle("Choose Yarn");
  const [Access, setAccess] = useState<any>({});

  const [data, setData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [checkedSpinner, setCheckedSpinner] = useState<any>("");
  const [checkedinvoice, setCheckedinvoice] = useState<any>("");
  const [checkedSpinLot, setCheckedSpinLot] = useState<any>("");
  const [checkedYarnCount, setCheckedYarnCount] = useState<any>("");
  const [checkedYarnType, setCheckedYarnType] = useState<any>("");
  const [checkedReelLotNo, setCheckedReelLotNo] = useState<any>("");

  const [showFilterList, setShowFilterList] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);
  const [totalQtyYarn, setTotalQtyYarn] = useState<any>(0);

  const [invoiceNo, setInvoiceno] = useState([]);
  const [reelLotNo, setReelLotNo] = useState([]);
  const [yarnCount, setYarnCount] = useState([]);
  const [yarnType, setYarnType] = useState([]);
  const [spinners, setSpinners] = useState([]);
  const [isDisable, setIsDisable] = useState<any>(true);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [quantityUsedErrors, setQuantityUsedErrors] = useState<string[]>(
    new Array(data.length).fill("")
  );
  const [checkboxStatus, setCheckboxStatus] = useState<CheckboxStatus>({});

  let weaverId = User.LabId;

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
      const access = checkAccess("Weaver Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (checkedSpinner.length > 0 && weaverId) {
      getFilterData();
    } else {
      setInvoiceno([]);
      setYarnCount([]);
      setYarnType([]);
      setReelLotNo([]);
      setCheckedinvoice([]);
      setCheckedSpinLot([]);
      setCheckedYarnCount([]);
      setCheckedYarnType([]);
      setCheckedReelLotNo([]);
    }
  }, [checkedSpinner, weaverId]);

  useEffect(() => {
    if (weaverId) {
      getSpinnerDataList();
      getData();
    }
  }, [weaverId, searchQuery, isClear]);

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
      data && data.every((item: any) => item.selected === true);
    setSelectAllChecked(isAllChecked);
  }, [data]);

  const getSpinnerDataList = async () => {
    const url = `weaver-process/get-spinner-trans?weaverId=${weaverId}&status=Sold`;
    try {
      const response = await API.get(url);
      const data = response?.data?.map((item: any) => {
        return item.spinner;
      });
      setSpinners(data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getData = async () => {
    try {
      const res = await API.get(
        `weaver-process/transaction?weaverId=${weaverId}&status=Sold&programId=${programId}&spinnerId=${checkedSpinner}&yarnType=${checkedYarnType}&yarnCount=${checkedYarnCount}&lotNo=${checkedSpinLot}&invoice=${checkedinvoice}&reelLotNo=${checkedReelLotNo}&filter=Quantity`
      );

      if (res.success) {
        let total: number = 0;
        let data = res.data;
        const storedData: any = sessionStorage.getItem("savedWeaver");
        let selectedData = (JSON.parse(storedData) as any[]) || [];

        if (selectedData.length > 0) {
          for (let obj of selectedData) {
            let mainObj = data.find((res: any) => res.id === obj.id);

            if (mainObj) {
              if (obj.type === typeChoosed) {
                mainObj.qty_used = DecimalFormat(obj.qtyUsed);
                mainObj.selected = true;
              } else {
                mainObj.qty_stock -= obj.qtyUsed;

                if (mainObj.qty_stock === 0) {
                  data = data.filter(
                    (dataValue: any) => dataValue.id !== mainObj.id
                  );
                }
              }
            }
          }
        }

        data = data.map((obj: any) => {
          total += obj.qty_stock;
          return {
            ...obj,
            qty_used: DecimalFormat(obj.qty_used || obj.qty_stock),
            selected: obj.qty_used !== undefined ? true : false,
          };
        });

        setData(data);
        setTotalQtyYarn(DecimalFormat(total));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFilterData = async () => {
    if (checkedSpinner.length > 0) {
      const url = `weaver-process/get-invoice-trans?weaverId=${weaverId}&status=Sold&spinnerId=${checkedSpinner}`;
      try {
        const response = await API.get(url);
        setInvoiceno(response.data.invoice);
        setYarnCount(
          response.data?.yarncount?.filter((count: any) => count !== null)
        );
        setReelLotNo(
          response.data?.reelLot?.filter((item: any) => item?.reel_lot_no !== null)
        );
        setYarnType(
          response?.data?.yarn_type?.filter((item: any) => item?.yarn_type !== null && item?.yarn_type !== "" && item?.yarn_type?.length != 0)
        );
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const handleSelectAllChange = (event: any) => {
    const isChecked = event.target.checked;
    setSelectAllChecked(isChecked);
    const updatedData = data.map((item: any, index: number) => ({
      ...item,
      selected: isChecked,
    }));
    setCheckboxStatus(() => {
      const newCheckboxStatus: { [index: number]: boolean } = {};
      updatedData.forEach((item: any, index: any) => {
        newCheckboxStatus[index] = isChecked;
      });
      return newCheckboxStatus;
    });
    setData(updatedData);
  };

  const handleChangerow = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newValue = event.target.value;
    const numericValue = newValue.replace(/[^\d.]/g, "");
    const isValidValue = /^(0*[1-9]\d*(\.\d+)?|0*\.\d+)$/.test(numericValue);
    const QtyStock: any = DecimalFormat(data[index].qty_stock);

    let error = "";

    if (!isValidValue) {
      error = "Quantity Used should be greater than zero.";
    } else if (+numericValue > QtyStock) {
      error = `Value should be less than or equal to ${QtyStock}`;
    }

    const newErrors = [...quantityUsedErrors];
    newErrors[index] = error;
    setQuantityUsedErrors(newErrors);

    const newData = [...data];
    newData[index].qty_used = numericValue;
    setData(newData);
  };

  const updateSelectedRows = () => {
    const selectedData = data.filter((item: any) => item.selected);
    setSelectedRows(selectedData);
  };

  const handleCheckboxChange = (event: any, index: any) => {
    const isChecked = event.target.checked;
    const updatedData = [...data];
    updatedData[index].selected = !!isChecked;
    setData(updatedData);
    setCheckboxStatus((prevStatus) => ({
      ...prevStatus,
      [index]: isChecked,
    }));
    const isAllChecked = updatedData.every((item) => item.selected);
    setSelectAllChecked(isAllChecked);
  };

  const calculateTotalQuantityUsed = () => {
    const total = selectedRows.reduce(
      (total: any, item: any) => total + Number(item.qty_used),
      0
    );
    setTotalQuantityUsed(DecimalFormat(total));
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (selectedRows.length === 0) {
      console.error("Please select at least one row?.");
      return;
    }
    const rowErrors: string[] = [];
    let totalQuantityUsed = 0;

    selectedRows.forEach((row: any, index: number) => {
      const newValue = row?.qty_used;
      const QtyStock: any = DecimalFormat(row?.qty_stock);

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
    const selectedData = selectedRows.map((item: any) => ({
      id: item.id,
      qtyUsed: DecimalFormat(Number(item.qty_used)),
      total_qty_used: DecimalFormat(totalQuantityUsed),
      totalQty: DecimalFormat(item.qty_stock),
      type: typeChoosed,
    }));

    const storedData: any = sessionStorage.getItem("savedWeaver");
    let selectedDatas = (JSON.parse(storedData) as any[]) || [];
    const selected: any = selectedDatas.filter(
      (item: any) => item.type !== typeChoosed
    );
    sessionStorage.setItem(
      "savedWeaver",
      JSON.stringify([...selectedData, ...selected])
    );

    router.push("/weaver/weaver-process/add-weaver-process");
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">Sr No. </p>,
      cell: (row: any, index: any) => (
        <div className="p-1">{row?.id !== 0 && <>{index + 1}</>}</div>
      ),
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Spinner Name </p>,
      selector: (row: any) => row?.spinner?.name,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Yarn Reel Lot No</p>,
      selector: (row: any) => row?.reel_lot_no,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Spin LotNo </p>,
      selector: (row: any) => row?.batch_lot_no,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.yarnType}</p>,
      cell: (row: any) => row?.yarn_type?.map((item:any)=> item)?.join(','),
      width: '120px',
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.millInterface?.yarnCount}</p>,
      cell: (row: any) => row?.yarncount?.map((item:any)=> item.yarnCount_name)?.join(','),
    },
    {
      name: <p className="text-[13px] font-medium">Total Quantity Received </p>,
      selector: (row: any) => row?.total_qty,
    },
    {
      name: <p className="text-[13px] font-medium">Quanitity in Stock </p>,
      selector: (row: any) => DecimalFormat(row?.qty_stock),
    },
    {
      name: <p className="text-[13px] font-medium">Total Quantity Sold </p>,
      selector: (row: any) => DecimalFormat(row?.total_qty - row?.qty_stock),
    },
    {
      name: <p className="text-[13px] font-medium">Quantity Used </p>,
      cell: (row: any, index: any) => (
        <>
          <div>
            <input
              type="text"
              value={row?.qty_used}
              onChange={(event) => handleChangerow(event, index)}
              className="mt-1 p-2 border border-black rounded w-full"
            />
            {quantityUsedErrors[index] && (
              <p className="text-sm text-red-500">
                {quantityUsedErrors[index]}
              </p>
            )}
          </div>
        </>
      ),
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
            checked={!!row?.selected}
            onChange={(event) => handleCheckboxChange(event, index)}
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
    if (name === "spinner") {
      if (checkedSpinner.includes(itemId)) {
        setCheckedSpinner(
          checkedSpinner.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSpinner([...checkedSpinner, itemId]);
      }
    } else if (name === "invoiceno") {
      let itemName = selectedItem?.invoice_no;
      if (checkedinvoice.includes(itemName)) {
        setCheckedinvoice(
          checkedinvoice.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedinvoice([...checkedinvoice, itemName]);
      }
    } else if (name === "spinlotno") {
      let itemName = selectedItem?.batch_lot_no;

      if (checkedSpinLot.includes(itemName)) {
        setCheckedSpinLot(
          checkedSpinLot.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedSpinLot([...checkedSpinLot, itemName]);
      }
    } else if (name === "yarncount") {
      if (checkedYarnCount.includes(itemId)) {
        setCheckedYarnCount(
          checkedYarnCount.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedYarnCount([...checkedYarnCount, itemId]);
      }
    } else if (name === "yarntype") {
      let itemName = selectedItem?.yarn_type;
      if (checkedYarnType.includes(itemName)) {
        setCheckedYarnType(
          checkedYarnType.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedYarnType([...checkedYarnType, itemName]);
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
    }
  };

  const clearFilterList = () => {
    setCheckedSpinner([]);
    setCheckedinvoice([]);
    setCheckedYarnCount([]);
    setCheckedYarnType([]);
    setCheckedSpinLot([]);
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
            className="fixPopupFilters  flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3"
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
                          Select Spinner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={spinners?.filter((item: any) =>
                            checkedSpinner.includes(item?.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "spinner"
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "spinner"
                            )
                          }
                          options={spinners}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Yarn Reel Lot No.
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="reel_lot_no"
                          selectedValues={reelLotNo?.filter((item: any) =>
                            checkedReelLotNo.includes(item.reel_lot_no)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "reelLotNo"
                            );
                          }}
                          onSearch={function noRefCheck() {}}
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
                          Select Invoice no
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="invoice_no"
                          selectedValues={invoiceNo?.filter((item: any) =>
                            checkedinvoice.includes(item.invoice_no)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "invoiceno"
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "invoiceno"
                            )
                          }
                          options={invoiceNo}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Spin LotNo
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="batch_lot_no"
                          selectedValues={invoiceNo?.filter((item: any) =>
                            checkedSpinLot.includes(item.batch_lot_no)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "spinlotno"
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "spinlotno"
                            )
                          }
                          options={invoiceNo}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Yarn Count
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="yarnCount_name"
                          selectedValues={yarnCount?.filter((item: any) =>
                            checkedYarnCount.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "yarncount"
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "yarncount"
                            )
                          }
                          options={yarnCount}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select Yarn Type
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="yarn_type"
                          selectedValues={yarnType?.filter((item: any) =>
                            checkedYarnType.includes(item?.yarn_type)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "yarntype"
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "yarntype"
                            )
                          }
                          options={yarnType}
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

  if (!roleLoading && !Access.create) {
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
                  <Link href="/weaver/weaver-process" className="active">
                    Process
                  </Link>
                </li>

                <li>
                  <Link
                    href="/weaver/weaver-process/add-weaver-process"
                    className="active"
                  >
                    New Process
                  </Link>
                </li>
                <li> Choose Yarn </li>
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
                  persistTableHead
                  fixedHeader={true}
                  noDataComponent={
                    <p className="py-3 font-bold text-lg">
                      No data available in table
                    </p>
                  }
                  fixedHeaderScrollHeight="auto"
                />
              </div>
              <hr className="my-6" />
              <div className="flex justify-end gap-5">
                <p className="text-sm font-semibold">
                  Total Available Yarn: {totalQtyYarn}
                </p>
                <p className="text-sm font-semibold">
                  Total Quantity Used: {totalQuantityUsed}
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
                      router.push("/weaver/weaver-process/add-weaver-process");
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
