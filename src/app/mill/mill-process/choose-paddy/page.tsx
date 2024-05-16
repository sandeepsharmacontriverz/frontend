"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import Multiselect from "multiselect-react-dropdown";

import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import { useSearchParams } from "next/navigation";
import User from "@lib/User";
import DataTable from "react-data-table-component";
import { DecimalFormat } from "@components/core/DecimalFormat";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";
import Select from "@components/filters/Select";

interface CheckedValues {
  [key: string]: boolean;
}

export default function page() {
  const { translations, loading } = useTranslations();
  useTitle("Choose Paddy");
  const router = useRouter();
  const [roleLoading, hasAccess] = useRole();

  const search = useSearchParams();
  const programId = search.get("id");
  const [Access, setAccess] = useState<any>({});

  const [data, setData] = useState<any>([]);
  const [totalyarn, setTotalQtyYarn] = useState<any>([]);
  const [mandi, setMandi] = useState<any>();
  const [seasons, setSeasons] = useState<any>();
  const [programs, setPrograms] = useState<any>();

  const [checkedMandis, setCheckedMandis] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = useState<any>([]);

  const [showFilter, setShowFilter] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);

  const [isDisable, setIsDisable] = useState<any>(true);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [quantityUsedErrors, setQuantityUsedErrors] = useState<string[]>(
    new Array(data.length).fill("")
  );

  const [checkedValues, setCheckedValues] = useState<CheckedValues>({});
  const [error, setError] = useState<any>()

  let MillId = User.MillId;

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Mill")) {
      const access = checkAccess("Mill Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (MillId) {
      getData();
    }
  }, [MillId, isClear]);

  useEffect(()=>{
    if(MillId){
      getMandis();
      getPrograms();
    }
    getSeasons();
  },[MillId])

  useEffect(() => {
    updateSelectedRows();
  }, [data]);
  useEffect(() => {
    calculateTotalQuantityUsed();
  }, [selectedRows]);

  useEffect(() => {
    const isAllChecked = data.length > 0 && data.every((item: any) => item?.select === true);
    setSelectAllChecked(isAllChecked);
  }, [data]);

  useEffect(() => {
    if (totalQuantityUsed > 0) {
      setIsDisable(false);
    } else {
      setIsDisable(true);
    }
  }, [totalQuantityUsed, selectedRows]);



  useEffect(() => {
    const updatedRowErrors: any = {};
    data.forEach((item: any) =>
      item.bags.forEach((row: any) => {
        if (row.select === true) {
          if (row.qtyUsed <= 0 || row.qtyUsed == null) {
            updatedRowErrors[row.id] = `Fabric Used cannot be less than zero`;
          } else if (Number(row.qtyUsed) > Number(row.fabric_weight_stock)) {
            updatedRowErrors[row.id] = `Value should not be greater than ${row.fabric_weight_stock}`;
          }
        }
      })
    );
    setError(updatedRowErrors);
  }, [data])


    const getSeasons = async () => {
    try {
      const res = await API.get("season?status=true");
      if (res.success) {
        setSeasons(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPrograms = async () => {
    const url = `mill-process/get-program?millId=${MillId}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setPrograms(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getMandis = async () => {
    try {
      const res = await API.get(
        `mill-process/get-filter-mill?millId=${MillId}`
      );
      if (res.success) {
        setMandi(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getData = async () => {
    try {
      const res = await API.get(
        `mill-process/choose-lint?millId=${MillId}&programId=${checkedPrograms?.length ? checkedPrograms : programId}&mandiId=${checkedMandis}&seasonId=${checkedSeasons}`
      );
      if (res.success) {
        let total: number = 0;

        let data = res.data;
        const storedData: any = sessionStorage.getItem("millChoosePaddy");
        let selectedData = (JSON.parse(storedData) as any[]) || [];

        if (selectedData.length > 0) {
          for (let obj of selectedData) {
            let mainObj = data.find((res: any) => res.id === obj.id);
            let childObj = mainObj?.bags?.find((item: any) => item.id === obj.id)

            if (childObj) {
              childObj.select = true;
            }

            if (mainObj.available_lint === 0) {
              data = data.filter(
                (dataValue: any) => dataValue.id !== mainObj.id
              );
            }

            if (mainObj && mainObj.bags.every((bag: any) => bag.select === true)) {
              mainObj.select = true;
            }

          }
          data = data?.map((obj: any) => {
            total += obj.available_lint;
            const nData = obj.bags?.map((dataItem: any) => {
              if (dataItem.select) {
                return { ...dataItem }
              }
              else {
                return { ...dataItem, qtyUsed: DecimalFormat(dataItem.fabric_weight_stock) };
              }
            });

            return { ...obj, select: false, bags: nData || [] };

          });
        } else {
          data = data?.map((obj: any) => {
            total += obj.available_lint;
            const nData = obj.bags?.map((dataItem: any) => {
              return { ...dataItem, qtyUsed: DecimalFormat(dataItem.fabric_weight_stock) };
            });

            return { ...obj, select: false, bags: nData || [] };

          });
        }

        setData(data);
        setTotalQtyYarn(DecimalFormat(total));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectAllChange = (e: any) => {
    const isChecked = e.target.checked;
    const newdata = data.map((el: any) => ({
      ...el,
      bags: el.bags.map((fab: any) => ({
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
    const selectedBagRows: any[] = [];
    data
      .map((row: any) => {
        const selectedFab = row.bags
          .filter((fab: any) => fab.select)
          .map((fab: any) => (
            {
              id: row?.id,
              mandi_id: row.mandi_id,
              bags: row.bags,
              weight: Number(fab.weight),
              totalQuantityUsed: totalQuantityUsed,
            }));
        selectedBagRows.push(...selectedFab);
      })
      .filter(Boolean);
    setSelectedRows(selectedBagRows);
  };

  const handleCheckboxChange = (event: any, id: any) => {
    const isChecked = event.target.checked;
    const newdata = data.map((el: any) => {
      return el.id === id
        ? {
          ...el,
          select: isChecked,
          bags: el.bags.map((e: any) => ({
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
      (total: any, item: any) => total + Number(item.weight),
      0
    );

    setTotalQuantityUsed(totalQuantityUsed);
  };

  const handleSubmit = (event: any) => {
    if(Object.entries(error).length !== 0){
      return ;
    }

    const selectedBagRows: any[] = [];
    data
      .map((row: any) => {
        const selectedFab = row.bags
          .filter((fab: any) => fab.select)
          .map((fab: any) => (
            {
              id: row?.id,
              mandi_id: row.mandi_id,
              rice_variety: row.riceVariety,
              bags: row.bags,
              weight: Number(fab.weight),
            }));
        selectedBagRows.push(...selectedFab);
      })

      const uniqueBagIds = new Set();

      selectedBagRows.forEach(item => {
        item.bags.forEach((bag: any) => {
          if (bag.select) { 
            uniqueBagIds.add(bag.id);
          }
        });
      });
      
      const totalUniqueBags = uniqueBagIds.size;
     const newAddedData = {
      ...selectedBagRows,
      totalQuantityUsed: totalQuantityUsed,
      noOfBags: totalUniqueBags
     }

    if (selectedBagRows.length > 0) {
      sessionStorage.setItem("millChoosePaddy", JSON.stringify(newAddedData));
      router.push("/mill/mill-process/add-mill-process");
    }
  };

  const columns = [
    {
      name: (
        <p className="text-[13px] font-medium">{translations?.common?.srNo} </p>
      ),
      cell: (row: any, index: any) => (
        <div className="p-1">{row.id !== 0 && <>{index + 1}</>}</div>
      ),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Mandi Name
        </p>
      ),
      selector: (row: any) => row?.mandi?.name,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Season
        </p>
      ),
      selector: (row: any) => row?.season?.name,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Bag Lot No 
        </p>
      ),
      selector: (row: any) => row?.lot_no,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Available Quantity
        </p>
      ),
      selector: (row: any) => row?.available_lint,
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
            checked={!!row.select}
            onChange={(event) => handleCheckboxChange(event, row.id)}
          />
        </>
      ),
    },
  ];


  const handleChildCheckboxChange = (
    id: any,
    isChecked: boolean,
    index: any
  ) => {
    const newdata = data.map((el: any) => {
      if (el.id === index) {
        const updatedFabrics = el.bags.map((bag: any) => {
          if (bag.id === id.id) {
            return {
              ...bag,
              select: isChecked,
            };
          }
          return bag;
        });
        const areAllChildRowsChecked = updatedFabrics.every(
          (bag: any) => bag.select
        );

        return {
          ...el,
          select: areAllChildRowsChecked ? isChecked : false,
          bags: updatedFabrics,
        };
      }
      return el;
    });

    setData(newdata);
    const isSelectAllChecked = newdata.every((el: any) => el.select);
    setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });
  };

    const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "mandi") {
      if (checkedMandis.includes(itemId)) {
        setCheckedMandis(
          checkedMandis.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedMandis([...checkedMandis, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    }
    else if (name === "programs") {
      if (checkedPrograms?.includes(itemId)) {
        setCheckedPrograms(
          checkedPrograms?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedPrograms([...checkedPrograms, itemId]);
      }
    }
  };

    const clearFilter = () => {
    setCheckedMandis([]);
    setCheckedSeasons([]);
    setCheckedPrograms([]);
    setIsClear(!isClear);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

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
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Season
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={seasons?.filter((item: any) =>
                            checkedSeasons.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "seasons");
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "seasons")
                          }
                          options={seasons}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Mandi
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={mandi?.filter((item: any) =>
                            checkedMandis.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "mandi");
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "mandi")
                          }
                          options={mandi}
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
                          selectedValues={programs?.filter((item: any) =>
                            checkedPrograms.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "programs");
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "programs")
                          }
                          options={programs}
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
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href="/mill/dashboard" className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/mill/sale">
                    Mill Sale
                  </Link>
                </li>
                <li>
                  <Link href="/mill/sale/new-sale">
                    New Sale
                  </Link>
                </li>
                Choose Paddy
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

                      <div className="flex items-center ml-4">
                        <label className="text-sm">
                          {translations?.program}:{" "}
                        </label>
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
                  fixedHeaderScrollHeight="auto"
                  noDataComponent={
                    <p className="py-3 font-bold text-lg">
                      {translations?.common?.Nodata}
                    </p>
                  }
                  expandableRows={true}
                  expandableRowExpanded={(row) =>
                    row?.bags?.some((data: any) => data.select === true)
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
              <div className="flex justify-end gap-5 mt-5">
                <p className="text-sm font-semibold">
                  Total Available Quantity:{totalyarn?.length > 0 ? totalyarn : 0}{" "}
                </p>
                <p className="text-sm font-semibold">
                  Total Quantity Used:  {totalQuantityUsed}
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
                      router.push("/mill/mill-process/add-mill-process");
                    }}
                  >
                    {translations?.common?.cancel}
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
  error: any,
  setError: any,
  checkedValues: CheckedValues;
  onChildCheckboxChange: (id: string, checked: boolean, index: any) => void;
}> = ({ data, id, checkedValues, onChildCheckboxChange, error, setError, setData }) => {

  const [editingFabricId, setEditingFabricId] = useState(null); // State to track the fabric ID being edited
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
  const startEditing = (bagId: any, initialValue: any) => {
    setInputValue(initialValue);
    setEditingFabricId(bagId);
  };

  const handleInput = useCallback(
    (bagId: any, fieldValue: any) => {
      const updatedData = data.map((obj: any) => {
        const updatedFabrics = obj.bags.map((item: any) => {
          if (item.id === bagId) {
            return { ...item, qtyUsed: fieldValue };
          }
          return item;
        });
        return { ...obj, bags: updatedFabrics };
      });

      setData(updatedData);
      setEditingFabricId(null); // Reset editing state after input blur
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
              SR NO
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              BAG NO
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              BAG WEIGHT
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Q1
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Q2
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Q3
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
             Q4
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Q5
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Q6
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Q7
            </th>
            {/* <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Fabric in Stock
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Fabric Used
            </th> */}
          </tr>
        </thead>
        <tbody>
          {data
            .filter((e: any) => e.id === id)
            .map((item: any, index: any) => {
              return (
                <React.Fragment key={index}>
                  {item.bags.map((bagData: any, baleIndex: any) => (
                    <tr key={baleIndex}>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {baleIndex+1}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.bag_no}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.weight}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.Q1}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.Q2}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.Q3}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.Q4}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.Q5}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.Q6}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.Q7}
                      </td>

                      {/* <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bagData?.fabric_weight_stock}
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
                              value={editingFabricId === bagData.id ? inputValue : bagData.qtyUsed}
                              className="border h-7 w-36"
                              onChange={handleInputChange}
                              onBlur={() => handleInput(bagData.id, inputValue)}
                              onFocus={() => startEditing(bagData.id, bagData.qtyUsed)}
                            />
                          
                      
                        {error[bagData.id] && (
                          <p className="text-sm w-36 text-red-500">{error[bagData.id]}</p>
                        )}
                      </td> */}

                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        <input
                          type="checkbox"
                          name={bagData.id}
                          checked={bagData.select || false}
                          onChange={(e) =>
                            handleChildCheckboxChange(
                              bagData,
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
