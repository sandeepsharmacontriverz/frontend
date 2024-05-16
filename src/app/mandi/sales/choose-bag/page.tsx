"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import API from "@lib/Api";
import DataTable from "react-data-table-component";
import User from "@lib/User";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
interface ExpandedData {
  baleNo: string;
  weight2: string;
  staple2: string;
  id: string;
  index: any;
}
interface CheckedValues {
  [key: string]: boolean;
}

export default function page() {
  const [roleLoading, hasAccess] = useRole();
  useTitle("Choose Bag");
  const { translations, loading } = useTranslations();
  const [Access, setAccess] = useState<any>({});

  const router = useRouter();
  const MandiId = User.MandiId;
  const [data, setData] = useState<any[]>([]);
  const [checkedValues, setCheckedValues] = useState<CheckedValues>({});
  const [isSelected, setIsSelected] = useState<any>(true);
  const [programName, setProgramName] = useState<any>([]);
  const [totalyarn, setTotalQtyYarn] = useState<any>(0);
  const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const search = useSearchParams();
  const programId = search.get("id");

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Mandi")) {
      const access = checkAccess("Mandi Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);
  useEffect(() => {
    getProgram();
  }, [programId]);
  useEffect(() => {
    if (MandiId) {
      getGinner();
    }
  }, [MandiId]);

  useEffect(() => {
    updateSelectedRows();
  }, [data]);

  useEffect(() => {
    calculateTotalQuantityUsed();
  }, [selectedRows, data]);

  useEffect(() => {
    if (data && data.length > 0) {
      let selectedArray: any = [];
      selectedArray = data
        .map((item: any) => {
          let isSelect = item?.bags?.filter((selected: any) => {
            return selected.select === true;
          });
          if (isSelect?.length > 0) {
            return item;
          }
          return null;
        })
        .filter((val: any) => val !== null);

      if (selectedArray.length > 0) {
        setIsSelected(false);
      } else {
        setIsSelected(true);
      }
    }
  }, [data]);

  const getGinner = async () => {
    try {
      const response = await API.get(
        `mandi-process/sales/choose-bag?mandiId=${MandiId}&programId=${programId}`
      );
      if (response.success) {
        let total: number = 0;
        const storedData: any = sessionStorage.getItem("selectedBales");
        let selectedData = (JSON.parse(storedData) as any[]) || [];

        const updatedData = response.data.map((el: any, index: any) => {
          total += Number(el?.weight);
          const selectedRow = selectedData.find((data: any) => {
            const matchingBale = data.bags.some((selectedBale: any) =>
              el.bags.some((bags: any) => selectedBale.baleId === bags.id)
            );
            return matchingBale;
          });

          return {
            ...el,
            index,
            bags: el.bags.map((e: any, innerIndex: any) => {
              const selected =
                selectedRow &&
                selectedRow.bags.some(
                  (selectedBale: any) => selectedBale.baleId === e.id
                );
              return {
                ...e,
                select: selected,
              };
            }),
          };
        });

        const newD = updatedData.map((data: any) => {
          return {
            ...data,
            select: data.bags.every((bags: any) => bags.select)
              ? true
              : checkedValues.selectAll,
          };
        });
        const isSelectAllChecked = newD.every((el: any) => el.select);
        setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });

        setData(newD);
        setLoadingData(false);
        setTotalQtyYarn(total);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoadingData(false);
    }
  };
  const getProgram = async () => {
    const url = "program?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        const matchingProgram = res.find(
          (item: any) => item.id === Number(programId)
        );
        if (matchingProgram) {
          setProgramName(matchingProgram.program_name);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleParentCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = e.target.checked;
    const newdata = data.map((el: any) => ({
      ...el,
      bags: el.bags.map((bags: any) => ({
        ...bags,
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

  const calculateTotalQuantityUsed = () => {
    const totalWeight = selectedRows.reduce(
      (total: any, item: any) =>
        total +
        item.bags.reduce(
          (baleTotal: any, bags: any) => baleTotal + Number(bags.weight),
          0
        ),
      0
    );
    setTotalQuantityUsed(totalWeight);
  };

  const updateSelectedRows = () => {
    const selectedBales: any = data
      .map((row) => {
        const selectedBales = row.bags
          .filter((bags: any) => bags.select)
          .map((bags: any) => ({
            baleId: bags.id,
            baleNo: bags.bag_no,
            reel_lot_no: row.mandiprocess?.reel_lot_no,
            lot_no: row.mandiprocess?.lot_no,
            weight: bags.weight,
            process_id: bags.process_id,
          }));

        if (selectedBales.length > 0) {
          return {
            bags: selectedBales,
          };
        }
        return null;
      })
      .filter(Boolean);
    setSelectedRows(selectedBales);
  };

  const handleChildCheckboxChange = (
    id: any,
    isChecked: boolean,
    index: any
  ) => {
    const newdata = data.map((el: any) => {
      if (el.index === index) {
        const updatedBales = el.bags.map((bags: any) => {
          if (bags.id === id.id) {
            return {
              ...bags,
              select: isChecked,
            };
          }
          return bags;
        });
        const areAllChildRowsChecked = updatedBales.every(
          (bags: any) => bags.select
        );

        return {
          ...el,
          select: areAllChildRowsChecked ? isChecked : false,
          bags: updatedBales,
        };
      }
      return el;
    });

    setData(newdata);
    const isSelectAllChecked = newdata.every((el: any) => el.select);
    setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });
  };
  const handlerow = (id: any, isChecked: boolean, index: any) => {
    const newdata = data.map((el: any) => {
      return el.index === index
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

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,

      cell: (row: any, index: any) => index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      selector: (row: any) => row.mandiprocess?.date?.substring(0, 10),
    },
    {
      name: <p className="text-[13px] font-medium">Lot No.</p>,
      selector: (row: any) => row.mandiprocess?.lot_no,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Weight</p>,
      selector: (row: any) => `${row.weight ? row.weight : 0}`,
      sortable: false,
    },
    {
      name: (
        <div className="flex justify-between ">
          <input
            name="check"
            type="checkbox"
            checked={checkedValues.selectAll || false}
            className="mr-2"
            onChange={handleParentCheckboxChange}
          />

           <p className="text-[13px] font-medium">  Select All </p>,

        </div>
      ),
      cell: (row: any, index: any) => {
        return (
          <div>
            <input
              type="checkbox"
              name={row.id}
              checked={row.select || false}
              onChange={(e) => handlerow(row.id, e.target.checked, index)}
            />
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const handleSubmit = () => {
    const selectedBales = data
      .map((row) => {
        const selectedBales = row.bags
          .filter((bags: any) => bags.select)
          .map((bags: any) => ({
            baleId: bags.id,
            baleNo: bags.bag_no,
            reel_lot_no: row.mandiprocess?.reel_lot_no,
            lot_no: row.mandiprocess?.lot_no,
            weight: bags.weight,
            process_id: bags.process_id,
          }));

        if (selectedBales.length > 0) {
          return {
            bags: selectedBales,
          };
        }
        return null;
      })
      .filter(Boolean);

    sessionStorage.setItem("selectedBales", JSON.stringify(selectedBales));
    router.push("/mandi/sales/add-paddy-sale");
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
                <li className="active">
                  <Link href="/mandi/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>

                <li>
                  <Link href="/mandi/sales">Sale</Link>
                </li>
                <li>
                  <Link href="/mandi/sales/add-paddy-sale">New Sale</Link>
                </li>
                <li>Choose Bag</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md mt-4 p-4">
          <div className="w-100 mt-4">
            <div>
              <div className="mb-3">
                <label className="text-sm">Program: </label>
                <span className="text-sm ml-1">{programName || ""}</span>
              </div>
            </div>
            <div className="items-center rounded-lg overflow-hidden border border-grey-100">
              <DataTable
                progressPending={loadingData}
                progressComponent={<div className="h-[400px] flex items-center"><Loader height={'50px'} /> </div>}
                persistTableHead
                fixedHeader={true}
                noDataComponent={
                  <p className="py-3 font-bold text-lg">
                    No data available in table
                  </p>
                }
                columns={columns}
                data={data}
                expandableRows={true}
                expandableRowExpanded={(row) =>
                  row?.bags?.some((data: any) => data.select === true)
                }
                expandableRowsComponent={({
                  data: tableData,
                }: {
                  data: ExpandedData;
                }) => {
                  return (
                    <ExpandedComponent
                      data={data}
                      id={tableData?.index}
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
              Total Available Paddy:{totalyarn}
              </p>
              <p className="text-sm font-semibold">
                {translations?.knitterInterface?.qtyUsed}:{totalQuantityUsed}
              </p>
            </div>
            <div className="pt-12 w-100 d-flex justify-end  customButtonGroup">
              <button
                className="btn-purple mr-2"
                disabled={isSelected}
                style={
                  isSelected
                    ? { cursor: "not-allowed", opacity: 0.8 }
                    : { cursor: "pointer", backgroundColor: "#D15E9C" }
                }
                onClick={handleSubmit}
              >
                Submit
              </button>
              <button
                className="btn-outline-purple mr-2"
                onClick={() => router.back()}
              >
                Cancel
              </button>
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

  checkedValues: CheckedValues;
  onChildCheckboxChange: (id: string, checked: boolean, index: any) => void;
}> = ({ data, id, checkedValues, onChildCheckboxChange, setData }) => {

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
              Bag No
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Weight
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

          </tr>
        </thead>
        <tbody>
          {data
            .filter((e: any) => e.index === id)
            .map((item: any, index: any) => {
              return (
                <React.Fragment key={index}>
                  {item.bags.map((bags: any, baleIndex: any) => (
                    <tr key={baleIndex}>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bags.bag_no}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bags.weight}
                      </td>

                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bags.Q1}
                      </td>

                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bags.Q2}
                      </td>

                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bags.Q3}
                      </td>

                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bags.Q4}
                      </td>

                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bags.Q5}
                      </td>

                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bags.Q6}
                      </td>

                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bags.Q7}
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
                          name={bags.id}
                          checked={bags.select || false}
                          onChange={(e) =>
                            handleChildCheckboxChange(
                              bags,
                              e.target.checked,
                              item.index
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
