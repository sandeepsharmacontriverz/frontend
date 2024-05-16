"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import { BiFilterAlt } from "react-icons/bi";
import { useSearchParams } from "next/navigation";
import User from "@lib/User";
import DataTable from "react-data-table-component";
import Multiselect from "multiselect-react-dropdown";
import useDebounce from "@hooks/useDebounce";
import useTranslations from "@hooks/useTranslation";
import { DecimalFormat } from "@components/core/DecimalFormat";
import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";


export default function page() {
  const [roleLoading, hasAccesss] = useRole();
  const { translations, loading } = useTranslations();
  useTitle(translations?.knitterInterface?.chooseGarment);
  const router = useRouter();
  const garmentId = User.garmentId;
  const search = useSearchParams();
  const programId = search.get("id");
  const typeChoosed = search.get("type");

  const [data, setData] = useState<any>([]);
  const [checkedValues, setCheckedValues] = useState<any>({});

  const [totalQtyKnit, setTotalQtyKnit] = useState<any>(0);
  const [checkedReelLotNo, setCheckedReelLotNo] = useState<any>("");
  const [reelLotNo, setReellotNo] = useState([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [showFilterList, setShowFilterList] = useState(false);
  const [isDisable, setIsDisable] = useState<any>(Boolean);
  const [totalQuantityUsedKnit, setTotalQuantityUsedKnit] = useState<any>(0);
  const [quantityUsedErrors, setQuantityUsedErrors] = useState<any>([]);

  const [checkedLotNo, setCheckedLotNo] = useState<any>([]);
  const [garmentType, setGarmentType] = useState<any>([]);
  const [checkedGarmentType, SetCheckedGarmentType] = useState<any>([]);
  const [checkedBrandOrderRef, setCheckedBrandOrderRef] = useState<any>([]);
  const [checkedFabricOrderRef, setCheckedFabricOrderRef] = useState<any>([]);
  const [lotNo, setLotno] = useState([]);
  const [brandOrderRef, setBrandOrderRef] = useState([]);
  const [fabricOrderRef, setFabricOrderRef] = useState([]);
  const [isClear, setIsClear] = useState(false);
  const NewData = useDebounce(data, 200);
  const [Access, setAccess] = useState<any>({});
  const [error, setError] = useState<any>()



  useEffect(() => {
    if (garmentId) {
      fetchFabric();
      getFilters();
    }
  }, [garmentId, isClear]);

  useEffect(() => {
    updateSelectedRows();
  }, [data]);

  useEffect(() => {
    calculateTotalQuantityUsed();
  }, [selectedRows]);

  useEffect(() => {
    const updatedRowErrors: any = {};
    data.forEach((item: any) =>
      item.garmentFabric.forEach((row: any) => {
        if (row.select === true) {
          if (row.qtyUsed <= 0 || row.qtyUsed == null) {
            updatedRowErrors[row.id] = `No of Pieces Used cannot be less than zero`;
          } else if (Number(row.qtyUsed) > Number(row.no_of_pieces_stock)) {
            updatedRowErrors[row.id] = `Value should not be greater than ${row.no_of_pieces_stock}`;
          }
        }
      })
    );
    setError(updatedRowErrors);
  }, [data])

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
      const access = checkAccess("Garment Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);
  useEffect(() => {
    if (
      Number(totalQuantityUsedKnit) > 0
    ) {
      setIsDisable(false);
    } else {
      setIsDisable(true);
    }
  }, [totalQuantityUsedKnit, selectedRows]);

  useEffect(() => {
    const isAllChecked =
      NewData && NewData.every((item: any) => item.select === true);
    setSelectAllChecked(isAllChecked);
  }, [NewData]);

  const getFilters = async () => {
    try {
      const res = await API.get(
        `garment-sales/get-choose-garment-filter?garmentId=${garmentId}`
      );
      if (res.success) {
        setLotno(res?.data.factoryLotNo);
        setGarmentType(
          res?.data.garmentTypes?.map((item: any) => {
            return { garment_type: item };
          })
        );
        setBrandOrderRef(res?.data.brandOrderRef);
        setFabricOrderRef(res?.data.fabricOrderRef);
        setReellotNo(res?.data.reelLotNo);
      }
    } catch (error) { }
  };

  // const fetchFabric = async () => {
  //   try {
  //     const response = await API.get(
  //       `garment-sales/choose-garment?garmentId=${garmentId}&programId=${programId}&reelLotNo=${checkedReelLotNo}&factoryLotNo=${checkedLotNo}&brandOrderRef=${checkedBrandOrderRef}&garmentOrderRef=${checkedFabricOrderRef}&garmentType=${checkedGarmentType}`
  //     );
  //     if (response.success) {
  //       let data = response.data;
  //       let total: number = 0;

  //       const storedData: any = sessionStorage.getItem("selectedData");
  //       let selectedData = (JSON.parse(storedData) as any[]) || [];
  //       data = data?.map((item_data: any) => {
  //         total += item_data.total_no_of_pieces_stock;
  //         if (selectedData.length > 0) {
  //           for (let obj of selectedData) {
  //             let mainObj = data.find((res: any) => res.id === obj.process_id);
  //             let childObj = mainObj?.garmentFabric?.find((item: any) => item.id === obj.id)
  //             if (childObj) {
  //               childObj.select = true;
  //               childObj.qtyUsed = Number(obj.qtyUsed);
  //             } else {
  //               mainObj.total_no_of_pieces_stock = mainObj.total_no_of_pieces_stock - obj.qtyUsed;
  //             }

  //             if (mainObj.total_no_of_pieces_stock === 0) {
  //               data = data.filter(
  //                 (dataValue: any) => dataValue.id !== mainObj.id
  //               );
  //             }
  //             if (mainObj && mainObj.garmentFabric.every((fabric: any) => fabric.select === true)) {
  //               mainObj.select = true;
  //             }
  //           }
  //           const nData = item_data.garmentFabric?.map((dataItem: any) => {
  //             if (dataItem.select) {
  //               return { ...dataItem }
  //             }
  //             else {
  //               return { ...dataItem, qtyUsed: DecimalFormat(dataItem.no_of_pieces_stock) };
  //             }

  //             return { ...item_data, select: false, garmentFabric: nData || [] };

  //           });
  //         } else {
  //           const nData = item_data.garmentFabric?.map((dataItem: any) => {
  //             return { ...dataItem, qtyUsed: DecimalFormat(dataItem.no_of_pieces_stock) };
  //           });

  //           return { ...item_data, select: false, garmentFabric: nData || [] };
  //           // return {
  //           //   ...item_data,
  //           //   qtyUsed: Number(item_data.no_of_pieces_stock),
  //           //   select: false,
  //           // };
  //         }
  //         return item_data;
  //       });
  //       //     let selected = selectedData.find((item: any) => item.id === obj.id);
  //       //     if (selected) {
  //       //       return {
  //       //         ...obj,
  //       //         qty_used_woven: DecimalFormat(selected.qtyUsedLength),
  //       //         qty_used_knit: DecimalFormat(selected.qtyUsedWeight),
  //       //         selected: true,
  //       //       };
  //       //     } else {
  //       //       return {
  //       //         ...obj,
  //       //         qty_used_woven: DecimalFormat(obj.qty_stock_length),
  //       //         qty_used_knit: DecimalFormat(obj.qty_stock_weight),
  //       //         selected: false,
  //       //       };
  //       //     }
  //       //   } else {
  //       //     return {
  //       //       ...obj,
  //       //       qty_used_woven: DecimalFormat(obj.qty_stock_length),
  //       //       qty_used_knit: DecimalFormat(obj.qty_stock_weight),
  //       //       selected: false,
  //       //     };
  //       //   }
  //       // });

  //       setData(data);
  //       setTotalQtyKnit(DecimalFormat(total));
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const fetchFabric = async () => {
    try {
      const response = await API.get(
        `garment-sales/choose-garment?garmentId=${garmentId}&programId=${programId}&reelLotNo=${checkedReelLotNo}&factoryLotNo=${checkedLotNo}&brandOrderRef=${checkedBrandOrderRef}&garmentOrderRef=${checkedFabricOrderRef}&garmentType=${checkedGarmentType}`
      );
      if (response.success) {
        let data = response.data;
        let total = 0;

        const storedData: any = sessionStorage.getItem("selectedData");
        const selectedData = JSON.parse(storedData) || [];

        data = data.map((item_data: any) => {
          let total_no_of_pieces_stock = item_data.total_no_of_pieces_stock;

          if (selectedData.length > 0) {
            selectedData.forEach((obj: any) => {
              const mainObj = data.find((res: any) => res.id === obj.process_id);
              if (!mainObj) return;

              const childObj = mainObj.garmentFabric.find((item: any) => item.id === obj.id);
              if (childObj) {
                childObj.select = true;
                childObj.qtyUsed = Number(obj.qtyUsed);
              } else {
                total_no_of_pieces_stock -= obj.qtyUsed;
              }

              if (total_no_of_pieces_stock === 0) {
                data = data.filter((dataValue: any) => dataValue.id !== mainObj.id);
              }

              if (mainObj.garmentFabric.every((fabric: any) => fabric.select === true)) {
                mainObj.select = true;
              }
            });
          }

          const nData = item_data.garmentFabric.map((dataItem: any) => ({
            ...dataItem,
            qtyUsed: dataItem.select ? dataItem.qtyUsed : DecimalFormat(dataItem.no_of_pieces_stock),
          }));

          return { ...item_data, select: false, garmentFabric: nData };
        });

        const totalQty = data.reduce((acc: any, item: any) => acc + item.total_no_of_pieces_stock, 0);

        setData(data);
        setTotalQtyKnit(DecimalFormat(totalQty));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectAllChange = (e: any) => {
    const isChecked = e.target.checked;
    const newdata = data.map((el: any) => ({
      ...el,
      garmentFabric: el.garmentFabric.map((fab: any) => ({
        ...fab,
        select: isChecked,
      })),
      select: isChecked,
    }));
    setData(newdata);
    const updatedCheckedValues: any = {};

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
        const selectedFab = row?.garmentFabric
          .filter((fab: any) => fab.select)
          .map((fab: any) => (
            {
              ...fab,
              garmentOrderRef: row?.fabric_order_ref,
              brandOrderRef: row?.brand_order_ref,
              qtyUsed: DecimalFormat(Number(fab.qtyUsed)),
              department: row?.department_id,
              total_qty_used: DecimalFormat(Number(fab.no_of_pieces)),
              totalQty: DecimalFormat(row.total_no_of_pieces),
              processor: "garment",
              // type: typeChoosed,
              // batch_lot_no: row.batch_lot_no,
              // noOfRolls: row.no_of_rolls,
              // fabricType: fab?.fabric_type,
              // totalYarnQty: row?.total_yarn_qty,
              // fabricTypeName: fab?.fabric
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
          garmentFabric: el.garmentFabric.map((e: any) => ({
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
    const total = selectedRows.reduce(
      (total: any, item: any) => total + Number(item?.qtyUsed),
      0
    );
    setTotalQuantityUsedKnit(DecimalFormat(total));
  };

  const handleChildCheckboxChange = (
    id: any,
    isChecked: boolean,
    index: any
  ) => {
    const newdata = data.map((el: any) => {
      if (el.id === index) {
        const updatedFabrics = el?.garmentFabric?.map((fab: any) => {
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
          garmentFabric: updatedFabrics,
        };
      }
      return el;
    });

    setData(newdata);
    const isSelectAllChecked = newdata.every((el: any) => el.select);
    setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });
  };

  const handleChangeList = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;

    if (name === "reelLotNo") {
      let itemName = selectedItem?.reel_lot_no;

      if (checkedReelLotNo.includes(itemName)) {
        setCheckedReelLotNo(
          checkedReelLotNo.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedReelLotNo([...checkedReelLotNo, itemName]);
      }
    } else if (name === "lotNo") {
      let itemName = selectedItem?.factory_lot_no;
      if (checkedLotNo.includes(itemName)) {
        setCheckedLotNo(checkedLotNo.filter((item: any) => item !== itemName));
      } else {
        setCheckedLotNo([...checkedLotNo, itemName]);
      }
    } else if (name === "brand_order_ref") {
      let itemName = selectedItem?.brand_order_ref;
      if (checkedBrandOrderRef.includes(itemName)) {
        setCheckedBrandOrderRef(
          checkedBrandOrderRef.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedBrandOrderRef([...checkedBrandOrderRef, itemName]);
      }
    } else if (name === "fabric_order_ref") {
      let itemName = selectedItem?.fabric_order_ref;
      if (checkedFabricOrderRef.includes(itemName)) {
        setCheckedFabricOrderRef(
          checkedFabricOrderRef.filter((item: any) => item !== itemName)
        );
      } else {
        setCheckedFabricOrderRef([...checkedFabricOrderRef, itemName]);
      }
    } else if (name === "garment") {
      let itemName = selectedItem?.garment_type;
      if (checkedGarmentType.includes(itemName)) {
        SetCheckedGarmentType(
          checkedGarmentType.filter((item: any) => item !== itemName)
        );
      } else {
        SetCheckedGarmentType([...checkedGarmentType, itemName]);
      }
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (Object.entries(error).length !== 0) {
      return;
    }

    if (selectedRows.length === 0) {
      console.error("Please select at least one row.");
      return;
    }

    let hasErrors: boolean = false;
    NewData.forEach((item: any, index: number) => {
      const newValue = item.qtyUsed;
      if (item.select) {
        if (newValue == 0) {
          hasErrors = true;
        } else {
          if (
            quantityUsedErrors[index] &&
            typeof quantityUsedErrors[index] === "object"
          ) {
            hasErrors = Object.values(quantityUsedErrors[index]).some(
              (errMsg) => !!errMsg
            );
          } else {
            hasErrors = false;
          }
        }
      }
    });

    if (hasErrors) {
      return;
    }
    // const selectedData = selectedRows.map((item: any) => ({
    //   id: item.id,
    //   department: item?.department_id,
    //   process_id: item?.process_id,
    //   qtyUsed: DecimalFormat(Number(item.qtyUsed)),
    //   // totalQty: DecimalFormat(item.total_no_of_pieces_stock),
    //   fabricOrderRef: item?.fabric_order_ref,
    //   brandOrderRef: item?.brand_order_ref,
    //   // type: typeChoosed,
    //   // processor: "garment",
    // }));

    // const selectedSaleData = selectedRows.map((item: any) => ({
    //   garmentType: item.garment_type,
    //   styleMarkNo: item.style_mark_no,
    //   color: item.color,
    //   garmentSize: item.garment_size,
    //   noOfPieces: item.no_of_pieces,
    //   noOfBoxes: item.no_of_boxes,
    // }));

    // const storedData: any = sessionStorage.getItem("selectedData");
    // let selectedDatas = (JSON.parse(storedData) as any[]) || [];
    // const selected: any = selectedDatas.filter(
    //   (item: any) => item.type !== typeChoosed
    // );
    sessionStorage.setItem(
      "selectedData",
      JSON.stringify([...selectedRows])
    );
    // sessionStorage.setItem("stylemarkno", JSON.stringify(selectedSaleData));

    router.push("/garment/sales/new-sale");
  };

  const handleChangerow = (event: any, index: any) => {
    const newValue = event.target.value;
    const name = event.target.name;
    const numericValue = newValue.replace(/[^\d.]/g, "");
    const QtyStockWoven: any = DecimalFormat(data[index].qty_stock_length)
    const QtyStockKnit: any = DecimalFormat(data[index].qty_stock_weight)

    let error: any = { ...quantityUsedErrors[index] };

    if (numericValue === "" || isNaN(numericValue)) {
      error[name] = "Quantity Used cannot be empty";
    } else if (name === "woven") {
      if (+numericValue > QtyStockWoven) {
        error[
          name
        ] = `Value should be less than or equal to ${QtyStockWoven}`;
      } else {
        error[name] = ``;
      }
    } else if (name === "knit") {
      if (+numericValue > QtyStockKnit) {
        error[
          name
        ] = `Value should be less than or equal to ${QtyStockKnit}`;
      } else {
        error[name] = ``;
      }
    }

    const newData = [...data];
    newData[index][`qty_used_${name}`] = !numericValue ? "" : numericValue;
    setData(newData);
    const newErrors = [...quantityUsedErrors];
    newErrors[index] = error;
    setQuantityUsedErrors(newErrors);
  };

  const columns: any = () => [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      cell: (row: any, index: any) => (
        <div className="p-1">{row.id !== 0 && <>{index + 1}</>}</div>
      ),
      wrap: true,
      width: "60px",
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.knitterInterface?.BrandOrderReference}</p>,
      selector: (row: any) => row.brand_order_ref,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.common?.FabricOrderRef}</p>
      ),
      selector: (row: any) => row.fabric_order_ref,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.fabricProcessor}</p>,
      selector: (row: any) => row.garment.name,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.mandiInterface?.reelLotNo}</p>,
      selector: (row: any) => row.reel_lot_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.productType}</p>,
      selector: (row: any) =>
        row?.garment_type.map((data: any) => data).join(", "),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.knitterInterface?.BrandOrderReference}</p>,
      selector: (row: any) => row.brand_order_ref,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.common?.FabricOrderRef}</p>
      ),
      selector: (row: any) => row.factory_lot_no,
      wrap: true,
    },


    {
      name: (
        <p className="text-[13px] font-medium">
          Total No of Boxes
        </p>
      ),
      selector: (row: any) => row.total_no_of_boxes,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total No of Pieces
        </p>
      ),
      selector: (row: any) => row.total_no_of_pieces,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">Total No. of pieces in Stock</p>
      ),
      selector: (row: any) => DecimalFormat(row.total_no_of_pieces_stock),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total No. of pieces Sold
        </p>
      ),
      selector: (row: any) =>
        DecimalFormat(Number(row?.total_no_of_pieces) - Number(row?.total_no_of_pieces_stock)),
      wrap: true,
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
          {translations?.common?.SelectAll}
        </div>
      ),
      cell: (row: any) => (
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

  const clearFilterList = () => {
    SetCheckedGarmentType([]);
    setCheckedLotNo([]);
    setBrandOrderRef([]);
    setFabricOrderRef([]);
    setCheckedReelLotNo([]);
    setCheckedFabricOrderRef([]);
    setCheckedBrandOrderRef([]);
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
              <div className="bg-white border w-auto py-3 px-3 border-gray-300 shadow-lg rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{translations?.common?.Filters} </h3>
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
                            {translations?.common?.FactoryLotNo}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="factory_lot_no"
                            selectedValues={lotNo?.filter((item: any) =>
                              checkedLotNo.includes(item.factory_lot_no)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "lotNo"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "lotNo"
                              )
                            }
                            options={lotNo?.filter(
                              (item: any) =>
                                item.factory_lot_no !== null &&
                                item.factory_lot_no !== undefined
                            )}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.knitterInterface?.FabricReelLotNo}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="reel_lot_no"
                            selectedValues={reelLotNo?.filter((item: any) =>
                              checkedReelLotNo.includes(item.reel_lot_no)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
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
                            options={reelLotNo?.filter(
                              (item: any) =>
                                item.reel_lot_no !== null &&
                                item.reel_lot_no !== undefined
                            )}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.knitterInterface?.BrandOrderReference}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="brand_order_ref"
                            selectedValues={brandOrderRef?.filter((item: any) =>
                              checkedBrandOrderRef.includes(
                                item.brand_order_ref
                              )
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "brand_order_ref"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "brand_order_ref"
                              )
                            }
                            options={brandOrderRef?.filter(
                              (item: any) =>
                                item.brand_order_ref !== "" &&
                                item.brand_order_ref !== undefined
                            )}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">

                            {translations?.common?.FabricOrderRef}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="fabric_order_ref"
                            selectedValues={fabricOrderRef?.filter(
                              (item: any) =>
                                checkedFabricOrderRef.includes(
                                  item.fabric_order_ref
                                )
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "fabric_order_ref"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "fabric_order_ref"
                              )
                            }
                            options={fabricOrderRef?.filter(
                              (item: any) =>
                                item.fabric_order_ref !== "" &&
                                item.fabric_order_ref !== undefined
                            )}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations?.common?.productType}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="garment_type"
                            selectedValues={garmentType?.filter((item: any) =>
                              checkedGarmentType.includes(item.garment_type)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "garment"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChangeList(
                                selectedList,
                                selectedItem,
                                "garment"
                              )
                            }
                            options={garmentType?.filter(
                              (item: any) =>
                                item.garment_type !== null &&
                                item.garment_type !== undefined
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
                              setShowFilterList(false);
                              fetchFabric();
                            }}
                          >
                            {translations?.common?.ApplyAllFilters}
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={() => {
                              clearFilterList();
                            }}
                          >
                            {translations?.common?.ClearAllFilters}
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
  if (loading) {
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
                  <NavLink href="/garment/dashboard" className="active">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/garment/sales">{translations?.knitterInterface?.sale}</NavLink>
                </li>
                <li>
                  <NavLink href="/garment/sales/new-sale">{translations?.knitterInterface?.newsale}</NavLink>{" "}
                </li>
                <li>{translations?.knitterInterface?.chooseGarment}</li>
              </ul>
            </div>
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
                        {translations?.common?.Filters} <BiFilterAlt className="m-1" />
                      </button>
                      <div className="relative">
                        <FilterPopup
                          openFilter={showFilterList}
                          onClose={!showFilterList}
                        />
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      <label className="text-sm">{translations?.program}: </label>
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
              {/* <DataTable
                columns={columns(0)}
                data={NewData}
                persistTableHead
                fixedHeader={true}
                noDataComponent={
                  <p className="py-3 font-bold text-lg">
                    {translations?.common?.Nodata}
                  </p>
                }
                fixedHeaderScrollHeight="auto"
              /> */}
              <DataTable
                columns={columns()}
                data={data}
                noDataComponent={
                  <p className="py-3 font-bold text-lg">
                    {translations?.common?.Nodata}
                  </p>
                }
                expandableRows={true}
                expandableRowExpanded={(row) =>
                  row?.garmentFabric?.some((data: any) => data.select === true)
                }
                // expandableRowExpanded={((row) => row?.select === true)}
                expandableRowsComponent={({
                  data: tableData,
                }: {
                  data: any;
                }) => {
                  return (
                    <ExpandedComponent
                      data={data}
                      id={tableData?.id}
                      error={error}
                      setError={setError}
                      setData={setData}
                      checkedValues={checkedValues}
                      onChildCheckboxChange={handleChildCheckboxChange}
                    />
                  );
                }}
              />
            </div>
            <div className="flex justify-end gap-5 mt-5">
              <p className="text-sm font-semibold">
                Total No of Pieces Available:{totalQtyKnit}
              </p>
              <p className="text-sm font-semibold">
                Total Pieces Used: {totalQuantityUsedKnit}
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
                  {translations?.common?.submit}
                </button>
                <button
                  className="btn-outline-purple"
                  onClick={() => {
                    router.push("/garment/sales/new-sale");
                  }}
                >
                  {translations?.common?.cancel}

                </button>
              </section>
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
  error: any,
  setError: any,
  setData: any;

  checkedValues: any;
  onChildCheckboxChange: (id: string, checked: boolean, index: any) => void;
}> = ({ data, id, checkedValues, onChildCheckboxChange, setData, error, setError, }) => {
  const [editingFabricId, setEditingFabricId] = useState(null); // State to track the fabric ID being edited
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  // Function to handle editing start
  const startEditing = (event: any, fabricId: any, initialValue: any) => {
    setInputValue(initialValue);
    setEditingFabricId(fabricId);
  };

  const handleInput = useCallback(
    (event: any, fabricId: any, fieldValue: any) => {
      const updatedData = data.map((obj: any) => {
        const updatedFabrics = obj.garmentFabric.map((item: any) => {
          if (item.id === fabricId) {
            return { ...item, qtyUsed: fieldValue };
          }
          return item;
        });
        return { ...obj, garmentFabric: updatedFabrics };
      });

      setData(updatedData);
      setEditingFabricId(null);
    },
    [data, setData]
  );

  const handleChildCheckboxChange = (
    item: any,
    isChecked: boolean,
    index: any
  ) => {
    onChildCheckboxChange(item, isChecked, index);
  };

  return (
    <div className="flex" style={{ padding: "20px" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Garment Type
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Garment Size
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Style Mark No
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Color
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              No Of Boxes
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              No Of Pieces
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              No Of Pieces in Stock
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              No Of Pieces Used
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Select
            </th>
          </tr>
        </thead>
        <tbody>
          {data
            .filter((e: any) => e.id === id)
            .map((item: any, index: any) => {
              return (
                <React.Fragment key={index}>
                  {item.garmentFabric.map((fabData: any, baleIndex: any) => (
                    <tr key={baleIndex}>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {fabData?.garment_type}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {fabData?.garment_size}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {fabData?.style_mark_no}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {fabData?.color}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {fabData?.no_of_boxes}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {fabData?.no_of_pieces}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {fabData?.no_of_pieces_stock}
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
                          onBlur={(event: any) => handleInput(event, fabData.id, inputValue)}
                          onFocus={(event: any) => startEditing(event, fabData.id, fabData.qtyUsed)}
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