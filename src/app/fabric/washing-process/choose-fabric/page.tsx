"use client";
import React, { useState, useEffect, useRef } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import NavLink from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import Multiselect from "multiselect-react-dropdown";

import API from "@lib/Api";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";

import User from "@lib/User";
import DataTable from "react-data-table-component";
import { DecimalFormat } from "@components/core/DecimalFormat";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";
import { toasterError } from "@components/core/Toaster";
type CheckboxStatus = {
  [key: string]: boolean;
};

export default function page() {
  const [roleLoading, hasAccesss] = useRole();
  const { translations, loading } = useTranslations();
  const router = useRouter();
  useTitle("Choose Fabric");
  const search = useSearchParams();
  const programId = search.get("id");

  const [data, setData] = useState<any>([]);
  const [Access, setAccess] = useState<any>({});

  const [checkedBatchLotNo, setCheckedBatchLotNo] = useState<any>("");
  const [checkedProcessorName, setCheckedProcessorName] = useState<any>("");
  const [checkedBrandOrderRef, setCheckedBrandOrderRef] = useState<any>("");
  const [checkedGarmentOrderRef, setCheckedGarmentOrderRef] = useState<any>("");
  const [showFilterList, setShowFilterList] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);
  const [processorName, setProcessorName] = useState([]);
  const [checkedKnitIdAlert, setCheckedKnitIdAlert] = useState([]);
  const [checkedWeaverIdAlert, setCheckedWeaverIdAlert] = useState([]);
  const [checkedDyingIdAlert, setCheckedDyingdAlert] = useState([]);
  const [dataFilter, setDataFilter] = useState<any>();
  const [isDisable, setIsDisable] = useState<any>(true);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [quantityUsedErrors, setQuantityUsedErrors] = useState<string[]>(
    new Array(data.length).fill("")
  );
  const [checkboxStatus, setCheckboxStatus] = useState<CheckboxStatus>({});
  const [totalQtyYarn, setTotalQtyYarn] = useState<any>(0);

  let fabricId = User.fabricId;

  useEffect(() => {
    if (fabricId) {
      getData();
      getProcessors();
      getLotNo();
    }
  }, [fabricId, isClear]);

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
      data?.length > 0 && data.every((item: any) => item.selected === true);

    setSelectAllChecked(isAllChecked);
  }, [data]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Fabric")) {
      const access = checkAccess("Fabric Washing Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  const getData = async () => {
    try {
      const res = await API.get(
        `fabric-process/choose-washing-fabric?fabricId=${fabricId}&dyingId=${checkedDyingIdAlert}&weaverId=${checkedWeaverIdAlert}&knitterId=${checkedKnitIdAlert}&garmentOrderRef=${checkedGarmentOrderRef}&brandOrderRef=${checkedBrandOrderRef}&lotNo=${checkedBatchLotNo}&programId=${programId}`
      );

      if (res.success) {
        let total: number = 0;
        let data = res.data?.map((obj:any) => ({ ...obj, processor: obj.weaver_id ? "weaver" : obj.knitter_id ? "knitter" : obj.dying_id ? "dying":" ",  salesType : obj.sales_type ? obj.sales_type :  obj.knitter_id ? "knitter" : 'weaver'}));
        const storedData: any = sessionStorage.getItem(
          "choose-washing-process"
        );
        let selectedData = (JSON.parse(storedData) as any[]) || [];

        if (selectedData.length > 0) {
          for (let obj of selectedData) {
            let mainObj = data.find((res: any) => res.id === obj.id && res.processor === obj.processor);
            if (mainObj) {
              mainObj.qty_used = DecimalFormat(obj?.qtyUsed);
              mainObj.selected = true;
            } else {
              mainObj.qty_stock = mainObj?.qty_stock - obj?.qtyUsed;
              mainObj.qty_used = DecimalFormat(mainObj?.qty_stock);
            }

            if (mainObj.qty_stock === 0) {
              data = data.filter(
                (dataValue: any) => dataValue.id !== mainObj.id
              );
            }
          }
        }
        data = data.map((obj: any) => {
          total += obj.qty_stock;
          if (obj.qty_used) {
            return obj;
          } else {
            return { ...obj, qty_used: DecimalFormat(obj.qty_stock), selected: false };
          }
        });
        const newData = data.map((item: any, index: number) => ({
          ...item,
          id: index,
          processId: item.id,
        }));
        setTotalQtyYarn(DecimalFormat(total));
        setData(newData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProcessors = async () => {
    const url = `fabric-process/get-processors?fabricId=${fabricId}&buyerType=Washing`;
    try {
      const response = await API.get(url);
      const data = response.data;

      const weaverNames = data
        .filter((item: any) => item.weaver)
        .map((item: any) => {
          return {
            ...item.weaver,
            key: item.weaver?.name + "-Weaver",
          };
        });

      const knitterNames = data
        .filter((item: any) => item.knitter)
        .map((item: any) => {
          return {
            ...item.knitter,
            key: item.knitter?.name + "-Knitter",
          };
        });

      const DyingNames = data
        .filter((item: any) => item.dying_fabric)
        .map((item: any) => {
          return {
            ...item.dying_fabric,
            key: item.dying_fabric?.name + "-Dying",
          };
        });

      const knitWeav = weaverNames.concat(knitterNames);
      const allNames = knitWeav.concat(DyingNames);
      setProcessorName(allNames);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getLotNo = async () => {
    const url = `fabric-process/get-batch-lot?fabricId=${fabricId}&buyerType=Washing`;
    try {
      const response = await API.get(url);
      const data = response.data;
      setDataFilter(data);
    } catch (error) {
      console.log(error, "error");
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
    const QtyStock: any = DecimalFormat(data[index].qty_stock)

    let error = "";

    if (!isValidValue) {
      error = "Quantity Used should be greater than zero.";
    } else if (+numericValue > data[index].qty_stock) {
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
    setTotalQuantityUsed(total);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
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
    
    const selectedData = selectedRows.map((item: any) => {
      return {
        id: item.processId,
        qtyUsed: DecimalFormat(Number(item.qty_used)),
        total_qty_used: DecimalFormat(totalQuantityUsed),
        totalQty: DecimalFormat(item.qty_stock),
        processor: item.processor,
        salesType: item.salesType
      };
    });

    const processors = selectedData.map((item: any) => item.salesType);
    const uniqueProcessors = [...new Set(processors)];

    if (uniqueProcessors.length > 1) {
      toasterError("Selected fabrics have different processors. Please select fabrics with same processor.", 5000, fabricId);
      return;
    }


    sessionStorage.setItem(
      "choose-washing-process",
      JSON.stringify([...selectedData])
    );

    router.push("/fabric/washing-process/new-process");
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">Sr No. </p>,
      cell: (row: any, index: any) => <div className="p-1">{index + 1}</div>,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Processor Type</p>,
      selector: (row: any) =>
        row.processor,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Fabric From</p>,
      selector: (row: any) =>
        row.salesType,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Processor Name </p>,
      selector: (row: any) =>
        row.knitter
          ? row.knitter?.name
          : row.weaver
            ? row.weaver?.name
            : row.dying_fabric?.name,
      wrap: true,
      sortable: false,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Garment Order Referance No</p>
      ),
      selector: (row: any) => row.garment_order_ref,
      wrap: true,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Brand Order Referance No</p>,
      selector: (row: any) => row.brand_order_ref,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      selector: (row: any) => row.invoice_no,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Finished Batch/Lot No</p>,
      selector: (row: any) => row.batch_lot_no,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Total Quantity Received</p>,
      selector: (row: any) =>
        row?.total_yarn_qty ? DecimalFormat(row?.total_yarn_qty) : DecimalFormat(row?.total_fabric_quantity),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Quanitity in Stock </p>,
      selector: (row: any) => DecimalFormat(row.qty_stock),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Total Quantity Sold</p>,
      selector: (row: any) =>
        row.total_yarn_qty
          ? DecimalFormat(Number(row.total_yarn_qty) - Number(row.qty_stock))
          : DecimalFormat(Number(row.total_fabric_quantity) - Number(row.qty_stock)),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Quantity Used </p>,
      cell: (row: any, index: any) => (
        <>
          <div>
            <input
              type="text"
              value={row.qty_used}
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
            checked={!!row.selected}
            onChange={(event) => handleCheckboxChange(event, index)}
          />
        </>
      ),
    },
  ];

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
    } else if (name === "processorName") {
      const selectedType = selectedItem.key?.split("-")[1];
      if (checkedProcessorName.includes(selectedItem.id)) {
        setCheckedProcessorName((prevList: any) =>
          prevList.filter((item: any) => item !== selectedItem.id)
        );
        if (selectedType === "Weaver") {
          setCheckedWeaverIdAlert((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        } else if (selectedType === "Knitter") {
          setCheckedKnitIdAlert((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        } else if (selectedType === "Dying") {
          setCheckedDyingdAlert((prevList: any) =>
            prevList.filter((id: any) => id !== selectedItem.id)
          );
        }
      } else {
        setCheckedProcessorName((prevList: any) => {
          if (!prevList.includes(selectedItem.id)) {
            return [...prevList, selectedItem.id];
          }
          return prevList;
        });
        if (selectedType === "Weaver") {
          setCheckedWeaverIdAlert((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        } else if (selectedType === "Knitter") {
          setCheckedKnitIdAlert((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        } else if (selectedType === "Dying") {
          setCheckedDyingdAlert((prevList: any) => {
            if (!prevList.includes(selectedItem.id)) {
              return [...prevList, selectedItem.id];
            }
            return prevList;
          });
        }
      }
    } else if (name === "brandOrderRef") {
      let itemName = selectedItem?.brand_order_ref;

      if (checkedBrandOrderRef.includes(itemName)) {
        setCheckedBrandOrderRef(
          checkedBrandOrderRef.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedBrandOrderRef([...checkedBrandOrderRef, itemName]);
      }
    } else if (name === "garmentOrderRef") {
      if (checkedGarmentOrderRef.includes(selectedItem?.garment_order_ref)) {
        setCheckedGarmentOrderRef(
          checkedGarmentOrderRef.filter(
            (item: any) => item !== selectedItem?.garment_order_ref
          )
        );
      } else {
        setCheckedGarmentOrderRef([
          ...checkedGarmentOrderRef,
          selectedItem?.garment_order_ref,
        ]);
      }
    }
  };

  const clearFilterList = () => {
    setCheckedBatchLotNo([]);
    setCheckedBrandOrderRef([]);
    setCheckedGarmentOrderRef([]);
    setCheckedProcessorName([]);
    setCheckedKnitIdAlert([]);
    setCheckedWeaverIdAlert([]);
    setCheckedDyingdAlert([]);
    setIsClear(!isClear);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters fixWidth flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3"
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
                          Select Weaver/Knitter and Dying Processor
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="key"
                          selectedValues={processorName?.filter((item: any) =>
                            checkedProcessorName.includes(item.id)
                          )}
                          // Other props...
                          onRemove={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "processorName"
                            )
                          }
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "processorName"
                            )
                          }
                          options={processorName}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Garment Order Reference No
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="garment_order_ref"
                          selectedValues={dataFilter?.order_ref
                            ?.reduce((uniqueList: any, item: any) => {
                              if (
                                !uniqueList.find(
                                  (uniqueItem: any) =>
                                    uniqueItem.garment_order_ref ===
                                    item.garment_order_ref
                                )
                              ) {
                                uniqueList.push(item);
                              }
                              return uniqueList;
                            }, [])
                            .filter((item: any) =>
                              checkedGarmentOrderRef.includes(
                                item.garment_order_ref
                              )
                            )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "garmentOrderRef"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "garmentOrderRef"
                            )
                          }
                          options={dataFilter?.order_ref
                            ?.reduce((uniqueList: any, item: any) => {
                              if (
                                !uniqueList.find(
                                  (uniqueItem: any) =>
                                    uniqueItem.garment_order_ref ===
                                    item.garment_order_ref
                                )
                              ) {
                                uniqueList.push(item);
                              }
                              return uniqueList;
                            }, [])
                            .filter(
                              (item: any) => item.garment_order_ref != null
                            )}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Brand Order Reference No
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="brand_order_ref"
                          selectedValues={dataFilter?.order_ref
                            ?.reduce((uniqueList: any, item: any) => {
                              if (
                                !uniqueList.find(
                                  (uniqueItem: any) =>
                                    uniqueItem.brand_order_ref ===
                                    item.brand_order_ref
                                )
                              ) {
                                uniqueList.push(item);
                              }
                              return uniqueList;
                            }, [])
                            .filter((item: any) =>
                              checkedBrandOrderRef.includes(
                                item.brand_order_ref
                              )
                            )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "brandOrderRef"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "brandOrderRef"
                            )
                          }
                          options={dataFilter?.order_ref
                            ?.reduce((uniqueList: any, item: any) => {
                              if (
                                !uniqueList.find(
                                  (uniqueItem: any) =>
                                    uniqueItem.brand_order_ref ===
                                    item.brand_order_ref
                                )
                              ) {
                                uniqueList.push(item);
                              }
                              return uniqueList;
                            }, [])
                            .filter(
                              (item: any) => item.brand_order_ref != null
                            )}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Finished Batch/Lot No
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="batch_lot_no"
                          selectedValues={dataFilter?.batchLot
                            ?.reduce((uniqueList: any, item: any) => {
                              if (
                                !uniqueList.find(
                                  (uniqueItem: any) =>
                                    uniqueItem.batch_lot_no ===
                                    item.batch_lot_no
                                )
                              ) {
                                uniqueList.push(item);
                              }
                              return uniqueList;
                            }, [])
                            .filter((item: any) =>
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
                          options={dataFilter?.batchLot.reduce(
                            (uniqueList: any, item: any) => {
                              if (
                                !uniqueList.find(
                                  (uniqueItem: any) =>
                                    uniqueItem.batch_lot_no ===
                                    item.batch_lot_no
                                )
                              ) {
                                uniqueList.push(item);
                              }
                              return uniqueList;
                            },
                            []
                          )}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            sessionStorage.removeItem("choose-washing-process");
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

  if (loading || roleLoading) {
    return <Loader />;
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
                  <NavLink href="/fabric/dashboard" className="active">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/fabric/washing-process" className="active">
                    Process
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    href="/fabric/washing-process/new-process"
                    className="active"
                  >
                    New Process
                  </NavLink>
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
                  Total Available Fabric: {totalQtyYarn}
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
                      // sessionStorage.removeItem("chooseFabric");
                      router.push("/fabric/washing-process/new-process");
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
