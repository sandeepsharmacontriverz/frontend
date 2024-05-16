"use client";

import { DecimalFormat } from "@components/core/DecimalFormat";
import Loader from "@components/core/Loader";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import checkAccess from "@lib/CheckAccess";
import User from "@lib/User";
import NavLink from "@components/core/nav-link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";

export default function page() {
  useTitle("Choose Comber Noil");
  const router = useRouter();
  const spinnerId = User.MillId;
  const search = useSearchParams();
  const programId = search.get("id");

  const { translations, loading } = useTranslations();
  const [Access, setAccess] = useState<any>({});

  const [roleLoading,hasAccesss] = useRole();
  const [data, setData] = useState<any>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [isDisable, setIsDisable] = useState<any>(true);
  const [error, setError] = useState<any>([]);

  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);
  const [totalyarn, setTotalyarn] = useState<any>(0); 


  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Mill")) {
      const access = checkAccess("Mill Process");
      if (access) setAccess(access);
    }
  }, [roleLoading,hasAccesss]);

  useEffect(() => {
    if (spinnerId) {
      getLint();
    }
  }, [spinnerId, programId])

  useEffect(() => {
    const isAllChecked =
      data.length > 0 && data.every((item: any) => item.selected === true);
    setSelectAllChecked(isAllChecked);
  }, [data]);

  useEffect(() => {
    const updatedRowErrors: any = [];
    selectedRows.forEach((row: any, index: any) => {
      if (row.comber_noil_stock < 0) {
        updatedRowErrors[row.id] = `Quanity Used cannot be less than zero`;
      } else if (Number(row.comber_noil_stock) > Number(DecimalFormat(row.comber_noil))) {
        updatedRowErrors[
          row.id
        ] = `Value should be less than or equal to ${DecimalFormat(row.comber_noil)}`;
      }
    });

    calculateTotalQuantityUsed();
    setError(updatedRowErrors);
  }, [selectedRows, data]);
  
  useEffect(() => {
    updateSelectedRows();
    calculateTotalQuantityUsed();
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

  const getLint = async () => {
    try {
      const res = await API.get(
        `mill-process/comber-noil?spinnerId=${spinnerId}&programId=${programId}`
      );
      if (res.success) {
        let total: number = 0;
        let data = res.data;
        const storedData: any = sessionStorage.getItem("comberNoil");
        let selectedData:any = (JSON.parse(storedData) as any[]) || [];

        if (selectedData && selectedData?.chooseComberNoil) {
          for (let obj of selectedData?.chooseComberNoil) {
            let mainObj = data.find((res: any) => res.id === obj.id);
            if (mainObj) {
              mainObj.comber_noil_stock = DecimalFormat(obj.qtyUsed);
              mainObj.selected = true;
            } else {
              mainObj.comber_noil_stock = mainObj.comber_noil_stock - obj.qtyUsed;
              mainObj.comber_noil_stock = DecimalFormat(mainObj.comber_noil_stock);
            }

            if (mainObj.comber_noil_stock === 0) {
              data = data.filter(
                (dataValue: any) => dataValue.id !== mainObj.id
              );
            }
          }
        }
        data = data.map((obj: any) => {
          total += +obj.comber_noil;
          if (obj.selected) {
            return obj;
          } else {
            return {
              ...obj,
              comber_noil_stock: DecimalFormat(obj.comber_noil_stock),
              selected: false,
            };
          }
        });
        setData(data);
        setTotalyarn(DecimalFormat(total))
      }
    } catch (error) {
      console.log(error);
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
  
  const handleRowCheckboxChange = (event: any, index: any) => {
    const isChecked = event.target.checked;
    const updatedData = [...data];
    updatedData[index].selected = !!isChecked;
    setData(updatedData);

    const isAllChecked = updatedData.every((item) => item.selected);
    setSelectAllChecked(isAllChecked);
  };

  const updateSelectedRows = () => {
    const selectedData = data.filter((item: any) => item.selected);
    setSelectedRows(selectedData);
  };

  const calculateTotalQuantityUsed = () => {
    const total = selectedRows.reduce(
      (total: any, item: any) => total + Number(item.comber_noil_stock),
      0
    );
    setTotalQuantityUsed(DecimalFormat(total));
  };

  const handleInput = (id: number, fieldValue: any) => {
    const newData = [...data];
    newData[id].comber_noil_stock = fieldValue;
    setData(newData);
  };

  const handleSubmit = () => {
    const updatedRowErrors: any = [];
    selectedRows.forEach((row: any, index: any) => {
      if (row.comber_noil_stock <= 0) {
        updatedRowErrors[
          row.id
        ] = `Quanity Used cannot be empty or less than zero`;
      } else if (Number(row.comber_noil_stock) > Number(DecimalFormat(row.comber_noil))) {
        updatedRowErrors[
          row.id
        ] = `Value should be less than or equal to ${DecimalFormat(row.comber_noil)}`;
      }
    });

    setError(updatedRowErrors);
    const hasErrors = Object.values(updatedRowErrors).some(
      (error) => error !== ""
    );
    const chooseComberNoil = selectedRows.map((row: any, index: number) => {
      return {
        id: row.id,
        totalQty: DecimalFormat(row.comber_noil),
        qtyUsed: DecimalFormat(row.comber_noil_stock),
      }
    })
    if (!hasErrors) {
      const savedQuantity: any = {
        totalQuantityUsed: DecimalFormat(totalQuantityUsed),
        chooseComberNoil: chooseComberNoil,
      };
      sessionStorage.setItem("comberNoil", JSON.stringify(savedQuantity));
      router.push("/mill/mill-process/add-mill-process");
    }
  };

  if (loading && roleLoading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }

  const columns = [
    {
      name: <p className="text-[12px] font-medium">{translations?.common?.srNo} </p>,
      cell: (row: any, index: any) => index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[12px] font-medium">Batch/Lot No</p>,
      selector: (row: any) => row?.batch_lot_no,
      sortable: false,
    },
    {
      name: <p className="text-[12px] font-medium">Quantity in Stock</p>,
      selector: (row: any) => DecimalFormat(row?.comber_noil),
      sortable: false,
    },
    {
      name: <p className="text-[12px] font-medium">Quantity Used</p>,
      cell: (row: any, index: any) => (
        <div>
          <input
            type="number"
            name="comber_noil"
            className="border h-5 w-28"
            value={row.comber_noil_stock || ""}
            onChange={(e) =>
              handleInput(index, e.target.value)
            }
          />
          {error[row.id] && (
            <p className="text-sm text-red-500">{error[row.id]}</p>
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
            onChange={handleSelectAllChange}
            checked={selectAllChecked}
          />
          Select All{" "}
        </div>
      ),
      cell: (row: any,index:any) => (
        <div>
          <input
            type="checkbox"
            name="selectedId"
            checked={!!row.selected}
            onChange={(e) => handleRowCheckboxChange(e,index)}
          />
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (!roleLoading && !Access?.create) {
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
              <NavLink href="/mill/dashboard" className="active">
                <span className="icon-home"></span>
              </NavLink>
            </li>
            <li>
              <NavLink href="/mill/mill-process">Process</NavLink>
            </li>
            <li>
              <NavLink href="/mill/mill-process/add-mill-process">
                {" "}
                New Process
              </NavLink>
            </li>
            <li>Choose Comber Noil</li>
          </ul>
        </div>
      </div>
      <div className="farm-group-box">
        <div className="farm-group-inner">
          <div className="table-form">
            <div className="table-minwidth ">
              <div className="search-filter-row">
                <div className="search-filter-left items-center">
                  <div className="ml-5">
                    <label className="text-sm">Program: </label>
                    <span className="text-sm">
                      {" "}
                      {data ? data[0]?.program?.program_name : ""}
                    </span>
                  </div>
                </div>
              </div>
              <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                <DataTable
                  persistTableHead
                  fixedHeader={true}
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
                  {translations?.knitterInterface?.totalAvailLint}:{totalyarn}
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
                    onClick={() => {
                      router.push(
                        "/mill/mill-process/add-mill-process"
                      );
                    }}
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
