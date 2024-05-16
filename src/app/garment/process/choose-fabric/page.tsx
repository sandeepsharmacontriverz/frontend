"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import { BiFilterAlt } from "react-icons/bi";
import { useSearchParams } from "next/navigation";
import User from "@lib/User";
import DataTable from "react-data-table-component";
import Multiselect from "multiselect-react-dropdown";
import useTranslations from "@hooks/useTranslation";
import { DecimalFormat } from "@components/core/DecimalFormat";

import { useRouter } from "@lib/router-events";
import NavLink from "@components/core/nav-link";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";

export default function page() {
    const [roleLoading, hasAccesss] = useRole();
    const { translations, loading } = useTranslations();
    useTitle(translations?.knitterInterface?.chooseFabric);

    const router = useRouter();
    const garmentId = User.garmentId;
    const search = useSearchParams();
    const programId = search.get("id");
    const typeChoosed = search.get("type");
    const [Access, setAccess] = useState<any>({});
    const [data, setData] = useState<any>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [showFilterList, setShowFilterList] = useState(false);
    const [isDisable, setIsDisable] = useState<any>(true);
    const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);
    const [quantityUsedErrors, setQuantityUsedErrors] = useState<string[]>(
        new Array(data.length).fill("")
    );

    const [checkedLotNo, setCheckedLotNo] = useState<any>("");
    const [lotNo, setLotno] = useState<any>([]);
    const [checkedbrandOrderRef, setCheckedBrandOrderRef] = useState<any>([]);
    const [checkedGarmentOrderRef, setCheckedGarmentOrderRef] = useState<any>([]);
    const [isClear, setIsClear] = useState(false);
    const [totalyarn, setTotalQtyYarn] = useState<any>([]);
    const [orderRefernce, setOrderRef] = useState<any>([]);
    const [garmentOrderref, setgarmentorderref] = useState<any>([]);
    const [WeavKnitlist, setWeavKnitList] = useState<any>([]);
    const [seasons, setSeasons] = useState<any>();
    const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
    const [CheckedWeavKnitList, setCheckedWeavKnitList] = useState<any>([]);
    const [checkedWeaverIdList, setCheckedWeaverIdList] = useState<any>([]);
    const [checkedDyingId, setCheckedDyingId] = useState<any>([]);
    const [checkedWashingId, setCheckedWashingId] = useState<any>([]);
    const [checkedPrintingId, setCheckedPrintingId] = useState<any>([]);
    const [checkedCompactingId, setCheckedCompactingId] = useState<any>([]);

    const [checkedknitIdList, setcheckedknitIdList] = useState<any>([]);

    useEffect(() => {
        if (!roleLoading && hasAccesss?.processor?.includes("Garment")) {
            const access = checkAccess("Garment Process");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccesss]);
    useEffect(() => {
        if (garmentId) {
            fetchFabric();
        }
    }, [garmentId, isClear]);

    useEffect(() => {
        const isAllChecked = data.length > 0 && data.every((item: any) => item.selected === true);
        setSelectAllChecked(isAllChecked);
    }, [data])
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
    const updateSelectedRows = () => {
        const selectedData = data.filter((item: any) => item.selected);
        setSelectedRows(selectedData);
    };
    useEffect(() => {
        if (garmentId) {
            fetchProcessorData();
            getBatchLotNo();
            getSeason();
        }
    }, [garmentId, isClear]);

    const getSeason = async () => {
        const url = "Season";
        try {
            const response = await API.get(url);
            if (response.success) {
                const res = response.data;
                setSeasons(res);
            }
        } catch (error) {
            console.log(error, "error");
        }
    };

    const fetchProcessorData = async () => {
        const url = `garment-sales/get-processor?garmentId=${garmentId}&status=Sold`;
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
            const dyingNames = data
                .filter((item: any) => item.dying_fabric)
                .map((item: any) => {
                    return {
                        ...item.dying_fabric,
                        key: item.dying_fabric?.name + "-Dying",
                    };
                });

            const printingNames = data
                .filter((item: any) => item.printing)
                .map((item: any) => {
                    return {
                        ...item.printing,
                        key: item.printing?.name + "-Printing",
                    };
                });

            const washingNames = data
                .filter((item: any) => item.washing)
                .map((item: any) => {
                    return {
                        ...item.washing,
                        key: item.washing?.name + "-Washing",
                    };
                });

            const compactingNames = data
                .filter((item: any) => item.compacting)
                .map((item: any) => {
                    return {
                        ...item.compacting,
                        key: item.compacting?.name + "-Compacting",
                    };
                });

            const allNames = weaverNames.concat(knitterNames).concat(dyingNames).concat(printingNames).concat(washingNames).concat(compactingNames);
            setWeavKnitList(allNames);
        } catch (error) {
            console.log(error);
        }
    };
    const getBatchLotNo = async () => {
        try {
            const res = await API.get(
                `garment-sales/get-batch-lot?garmentId=${garmentId}&status=Sold`
            );
            if (res.success) {
                setLotno(res.data.batchLot);
                const orders = res.data?.order_ref || [];

                const uniqueBrandRefs = new Set();
                const uniqueOrders = orders.reduce((acc: any, order: any) => {
                    const isBrandValid = order.brand_order_ref !== null && order.brand_order_ref !== "";

                    if (isBrandValid && !uniqueBrandRefs.has(order.brand_order_ref)) {
                        uniqueBrandRefs.add(order.brand_order_ref);
                        acc.push(order);
                    }
                    return acc;
                }, []);

                const uniqueOrdersGarment = orders.reduce((acc: any, order: any) => {
                    const isGarmentValid = order.garment_order_ref !== null && order.garment_order_ref !== "";

                    if (isGarmentValid && !uniqueBrandRefs.has(order.garment_order_ref)) {
                        uniqueBrandRefs.add(order.garment_order_ref);
                        acc.push(order);
                    }
                    return acc;
                }, []);

                setOrderRef(uniqueOrders)
                setgarmentorderref(uniqueOrdersGarment)
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchFabric = async () => {
        try {
            const response = await API.get(
                `garment-sales/choose-fabric?garmentId=${garmentId}&programId=${programId}&seasonId=${checkedSeasons}&lotNo=${checkedLotNo}&brandOrderRef=${checkedbrandOrderRef}&garmentOrderRef=${checkedGarmentOrderRef}&knitterId=${checkedknitIdList}&weaverId=${checkedWeaverIdList}&dyingId=${checkedDyingId}&washingId=${checkedWashingId}&printingId=${checkedPrintingId}&compactingId=${checkedCompactingId}&filter=Quantity`
            );
            if (response.success) {
                let total: number = 0;

                let data = response.data?.map((obj: any) => ({ ...obj, processor: obj.weaver_id ? "weaver" : obj.knitter_id ? "knitter" : obj.dying_id ? "dying" : obj.washing_id ? "washing" : obj.printing_id ? "printing" : obj.compacting_id ? "compacting" : " " }));

                const storedData: any = sessionStorage.getItem("selectedData");
                let selectedData = (JSON.parse(storedData) as any[]) || [];

                if (selectedData.length > 0) {
                    for (let obj of selectedData) {
                        const index = data?.findIndex((res: any) => res.id === obj.id && res.processor === obj.processor);

                        if (index !== undefined && index !== -1) {
                            if (obj.type === typeChoosed) {
                                data[index].qty_used = DecimalFormat(obj?.qtyUsed);
                                data[index].selected = true;
                            } else {
                                data[index].qty_stock = DecimalFormat(data[index]?.qty_stock - obj?.qtyUsed);
                                // data[index].qty_used = DecimalFormat(data[index]?.qty_stock);
                            }

                            if (Number(data[index].qty_stock) === 0) {
                                data.splice(index, 1);
                            }
                        }
                    }
                }
                data = data.map((obj: any) => {
                    total += obj.qty_stock;

                    if (obj && obj.qty_used) {
                        return obj;
                    } else {
                        return { ...obj, qty_used: DecimalFormat(obj.qty_stock), selected: false };
                    }
                });
                const newData = data?.map((item: any, index: number) => ({
                    ...item,
                    id: index + 1,
                    processId: item.id,
                }));
                setData(newData);
                setTotalQtyYarn(DecimalFormat(total));
            }
        } catch (error) {
            console.error(error);
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
    const handleCheckboxChange = (event: any, index: any) => {
        const isChecked = event.target.checked;
        const updatedData = [...data];
        updatedData[index].selected = !!isChecked;
        setData(updatedData);

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
                type: typeChoosed,
                processor: item.processor,
                salesType: item.knitter_id ? "knitter" : item.sales_type ? item.sales_type : 'weaver'
            };
        });

        const storedData: any = sessionStorage.getItem("selectedData");
        let selectedDatas = (JSON.parse(storedData) as any[]) || [];
        const selected: any = selectedDatas.filter(
            (item: any) => item.type !== typeChoosed
        );

        sessionStorage.setItem(
            "selectedData",
            JSON.stringify([...selectedData, ...selected])
        );

        router.push("/garment/process/new-process");
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
            error = "Please enter a valid numeric value greater than zero.";
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

    const columns = [
        {
            name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
            cell: (row: any, index: any) => (
                <div className="p-1">{row.id !== 0 && <>{index + 1}</>}</div>
            ),
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Season</p>,
            selector: (row: any) => row?.season?.name,
            sortable: false,
        },
        {
            name: <p className="text-[13px] font-medium">{translations?.common?.fabricProcessor}</p>,
            selector: (row: any) =>
                row.knitter?.name
                    ? row.knitter.name
                    : (row.weaver?.name
                        ? row.weaver.name
                        : (row.dying_fabric?.name
                            ? row.dying_fabric.name
                            : (row.printing?.name
                                ? row.printing.name
                                : (row.washing?.name
                                    ? row.washing?.name
                                    : (row.compacting?.name
                                        ? row.compacting?.name
                                        : "")
                                )))),
            wrap: true,
        },
        {
            name: (
                <p className="text-[13px] font-medium">{translations?.knitterInterface?.GarmentOrderReference}</p>
            ),
            selector: (row: any) => row.garment_order_ref,
            wrap: true,
        },
        {
            name: (
                <p className="text-[13px] font-medium">{translations?.knitterInterface?.BrandOrderReference}</p>
            ),
            selector: (row: any) => row.brand_order_ref,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">{translations?.comberNoil?.batchLotNo}</p>,
            selector: (row: any) => row.batch_lot_no,
            wrap: true,
        },

        {
            name: <p className="text-[13px] font-medium">{translations?.common?.totalquantityrec}</p>,
            selector: (row: any) => row?.total_yarn_qty ? DecimalFormat(row?.total_yarn_qty) : DecimalFormat(row.total_fabric_quantity),
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">{translations?.common?.qtystock}</p>,
            selector: (row: any) => DecimalFormat(row.qty_stock),
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">{translations?.common?.qtyCons}</p>,
            selector: (row: any) =>
                row.total_yarn_qty ? DecimalFormat(Number(row.total_yarn_qty) - Number(row.qty_stock)) : DecimalFormat(Number(row.total_fabric_quantity) - Number(row.qty_stock)),
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">{translations?.common?.qtyUsed}</p>,

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
                    {translations?.common?.SelectAll}
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

    const clearFilterList = () => {
        setCheckedLotNo([]);
        setCheckedGarmentOrderRef([]);
        setCheckedBrandOrderRef([]);
        setCheckedSeasons([]);
        setCheckedWeavKnitList([]);
        setcheckedknitIdList([]);
        setCheckedWeaverIdList([]);
        setCheckedDyingId([]);
        setCheckedPrintingId([]);
        setCheckedWashingId([]);
        setCheckedCompactingId([]);
        setIsClear(!isClear);
    };
    const handleChangeList = (
        selectedList: any,
        selectedItem: any,
        name: string
    ) => {
        if (name === "season") {
            if (checkedSeasons.includes(selectedItem?.id)) {
                setCheckedSeasons(
                    checkedSeasons.filter((item: any) => item !== selectedItem?.id)
                );
            } else {
                setCheckedSeasons([...checkedSeasons, selectedItem?.id]);
            }
        } else if (name === "garment") {
            let itemName = selectedItem?.garment_order_ref;

            if (checkedGarmentOrderRef.includes(itemName)) {
                setCheckedGarmentOrderRef(
                    checkedGarmentOrderRef.filter((item: any) => item !== itemName)
                );
            } else {
                setCheckedGarmentOrderRef([...checkedGarmentOrderRef, itemName]);
            }
        } else if (name === "lotNo") {
            let itemName = selectedItem?.batch_lot_no;
            if (checkedLotNo.includes(itemName)) {
                setCheckedLotNo(checkedLotNo.filter((item: any) => item !== itemName));
            } else {
                setCheckedLotNo([...checkedLotNo, itemName]);
            }
        } else if (name === "brand") {
            let itemName = selectedItem?.brand_order_ref;
            if (checkedbrandOrderRef.includes(itemName)) {
                setCheckedBrandOrderRef(
                    checkedbrandOrderRef.filter((item: any) => item !== itemName)
                );
            } else {
                setCheckedBrandOrderRef([...checkedbrandOrderRef, itemName]);
            }
        } else if (name === "wevknit") {
            const selectedType = selectedItem.key?.split("-")[1];
            if (CheckedWeavKnitList.includes(selectedItem.key)) {
                setCheckedWeavKnitList((prevList: any) =>
                    prevList.filter((item: any) => item !== selectedItem.key)
                );
                if (selectedType === "Weaver") {
                    setCheckedWeaverIdList((prevList: any) =>
                        prevList.filter((id: any) => id !== selectedItem.id)
                    );
                } else if (selectedType === "Knitter") {
                    setcheckedknitIdList((prevList: any) =>
                        prevList.filter((id: any) => id !== selectedItem.id)
                    );
                }
                else if (selectedType === "Dying") {
                    setCheckedDyingId((prevList: any) =>
                        prevList.filter((id: any) => id !== selectedItem.id)
                    );
                }
                else if (selectedType === "Washing") {
                    setCheckedWashingId((prevList: any) =>
                        prevList.filter((id: any) => id !== selectedItem.id)
                    );
                }
                else if (selectedType === "Printing") {
                    setCheckedPrintingId((prevList: any) =>
                        prevList.filter((id: any) => id !== selectedItem.id)
                    );
                }
                else if (selectedType === "Compacting") {
                    setCheckedCompactingId((prevList: any) =>
                        prevList.filter((id: any) => id !== selectedItem.id)
                    );
                }
            } else {
                setCheckedWeavKnitList((prevList: any) => {
                    if (!prevList.includes(selectedItem.key)) {
                        return [...prevList, selectedItem.key];
                    }
                    return prevList;
                });
                if (selectedType === "Weaver") {
                    setCheckedWeaverIdList((prevList: any) => {
                        if (!prevList.includes(selectedItem.id)) {
                            return [...prevList, selectedItem.id];
                        }
                        return prevList;
                    });
                } else if (selectedType === "Knitter") {
                    setcheckedknitIdList((prevList: any) => {
                        if (!prevList.includes(selectedItem.id)) {
                            return [...prevList, selectedItem.id];
                        }
                        return prevList;
                    });
                }
                else if (selectedType === "Dying") {
                    setCheckedDyingId((prevList: any) => {
                        if (!prevList.includes(selectedItem.id)) {
                            return [...prevList, selectedItem.id];
                        }
                        return prevList;
                    });
                }
                else if (selectedType === "Washing") {
                    setCheckedWashingId((prevList: any) => {
                        if (!prevList.includes(selectedItem.id)) {
                            return [...prevList, selectedItem.id];
                        }
                        return prevList;
                    });
                }
                else if (selectedType === "Printing") {
                    setCheckedPrintingId((prevList: any) => {
                        if (!prevList.includes(selectedItem.id)) {
                            return [...prevList, selectedItem.id];
                        }
                        return prevList;
                    });
                }
                else if (selectedType === "Compacting") {
                    setCheckedCompactingId((prevList: any) => {
                        if (!prevList.includes(selectedItem.id)) {
                            return [...prevList, selectedItem.id];
                        }
                        return prevList;
                    });
                }
            }
        }
    };
    const FilterPopup = ({ openFilter, onClose }: any) => {
        const popupRef = useRef<HTMLDivElement>(null);

        return (
            <div>
                {openFilter && (
                    <>
                        <div
                            ref={popupRef}
                            className="fixPopupFilters  flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-2 "
                        >
                            <div className="bg-white border w-auto py-4  px-4 border-gray-300 shadow-lg rounded-md">
                                <div className="flex justify-between align-items-center">
                                    <h3 className="text-lg pb-2">{translations?.common?.Filters}</h3>
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
                                                        Seasons
                                                    </label>
                                                    <Multiselect
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        displayValue="name"
                                                        selectedValues={seasons?.filter((item: any) =>
                                                            checkedSeasons.includes(item.id)
                                                        )}
                                                        onKeyPressFn={function noRefCheck() { }}
                                                        onRemove={(selectedList: any, selectedItem: any) => {
                                                            handleChangeList(selectedList, selectedItem, "season");
                                                        }}
                                                        onSearch={function noRefCheck() { }}
                                                        onSelect={(selectedList: any, selectedItem: any) => {
                                                            handleChangeList(selectedList, selectedItem, "season");
                                                        }}
                                                        options={seasons}
                                                        showCheckbox
                                                    />
                                                </div>
                                                <div className="col-12 col-md-6 mt-2">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.common?.SelectKnitWeav}
                                                    </label>
                                                    <Multiselect
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        displayValue="key"
                                                        selectedValues={WeavKnitlist?.filter((item: any) =>
                                                            CheckedWeavKnitList.includes(item.key)
                                                        )}
                                                        onRemove={(selectedList: any, selectedItem: any) =>
                                                            handleChangeList(
                                                                selectedList,
                                                                selectedItem,
                                                                "wevknit"
                                                            )
                                                        }
                                                        onSelect={(selectedList: any, selectedItem: any) =>
                                                            handleChangeList(
                                                                selectedList,
                                                                selectedItem,
                                                                "wevknit"
                                                            )
                                                        }
                                                        options={WeavKnitlist}
                                                        showCheckbox
                                                    />
                                                </div>

                                                <div className="col-12 col-md-6 mt-2">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.comberNoil?.batchLotNo}
                                                    </label>
                                                    <Multiselect
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        displayValue="batch_lot_no"
                                                        selectedValues={lotNo?.filter((item: any) =>
                                                            checkedLotNo.includes(item.batch_lot_no)
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
                                                        options={lotNo}
                                                        showCheckbox
                                                    />
                                                </div>

                                                <div className="col-12 col-md-6 mt-2">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.knitterInterface?.GarmentOrderReference}
                                                    </label>
                                                    <Multiselect
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        displayValue="garment_order_ref"
                                                        selectedValues={garmentOrderref?.filter(
                                                            (item: any) =>
                                                                checkedGarmentOrderRef.includes(
                                                                    item.garment_order_ref
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
                                                        options={garmentOrderref?.filter(
                                                            (item: any) =>
                                                                item.garment_order_ref !== "" || !item.garment_order_ref

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
                                                        selectedValues={orderRefernce?.filter((item: any) =>
                                                            checkedbrandOrderRef.includes(
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

                                                                "brand"
                                                            );
                                                        }}
                                                        onSearch={function noRefCheck() { }}
                                                        onSelect={(selectedList: any, selectedItem: any) =>
                                                            handleChangeList(
                                                                selectedList,
                                                                selectedItem,
                                                                "brand"
                                                            )
                                                        }
                                                        options={orderRefernce?.filter(
                                                            (item: any) =>
                                                                item.brand_order_ref !== "" || !item.brand_order_ref

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
                                                            sessionStorage.removeItem("selectedData");

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
                                    <NavLink href="/garment/dashboard" className="active">
                                        <span className="icon-home"></span>
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink href="/garment/process">{translations?.knitterInterface?.Process}</NavLink>
                                </li>
                                <li>
                                    <NavLink href="/garment/process/new-process">{translations?.millInterface?.newProcess}</NavLink>{" "}
                                </li>
                                <li>{translations?.knitterInterface?.chooseFabric} </li>
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
                            <DataTable
                                columns={columns}
                                data={data}
                                persistTableHead
                                fixedHeader={true}
                                noDataComponent={
                                    <p className="py-3 font-bold text-lg">
                                        {translations?.common?.Nodata}
                                    </p>
                                }
                                fixedHeaderScrollHeight="auto"
                            />
                        </div>
                        <div className="flex justify-end gap-5 mt-5">
                            <p className="text-sm font-semibold">
                                {translations?.knitterInterface?.totalAvailLint}:{totalyarn}{" "}
                            </p>
                            <p className="text-sm font-semibold">
                                {translations?.knitterInterface?.qtyUsed} : {totalQuantityUsed}
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
                                        router.back();
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
