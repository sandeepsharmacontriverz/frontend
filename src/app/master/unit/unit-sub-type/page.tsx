"use client";
import { useState, useEffect } from "react";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "@lib/router-events";
import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { exportToExcel } from "@components/core/ExcelExporter";


const Edit = ({ openPopup, onCancel, editId, unitPrevValue, unitPrevId, defaultValue, getItems }: any) => {
  const [unitSubTypeName, setunitSubTypeName] = useState<any>('');
  const [unitTypes, setunitTypes] = useState([]);
  const [errors, setErrors] = useState({
    unitSubTypeName: '',
    unittype: ''
  })


  const [unitType, setunitType] = useState("")
  const [unitId, setunitId] = useState("")

  const alreadyExistName = async (value: string) => {
    const res = await API.post("unit/check-sub-type", {
      id: editId,
      unitTypeId: Number(unitId),
      unitSubType: value
    });
    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
  }

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setunitSubTypeName(value)
  };

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newErrors: any = {};
    if (value.trim() !== "" && unitId) {
      const onBlurError = await alreadyExistName(value);
      newErrors['unitSubTypeName'] = onBlurError;
    } else {
      newErrors['unitSubTypeName'] = "";
    }
    setErrors(newErrors);
  };

  const handleCancel = () => {
    onCancel()
    setunitType(unitPrevValue)
    setunitSubTypeName(defaultValue)
    setErrors({
      unitSubTypeName: '',
      unittype: ''
    })
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const { name, value } = event.target;
    const selectedunitType: any = unitTypes.find((unitType: any) => unitType.unitType === value);
    setunitType(value)
    setunitId(selectedunitType ? selectedunitType.id : null)
    setErrors((prevError) => ({
      ...prevError,
      unittype: "",
    }));

  }


  const getunitTypes = async () => {
    const url = "unit/unit-type";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const unitType = response.data;
        setunitTypes(unitType);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const handleSubmit = async () => {
    if (!unitId) {
      setErrors((prevError) => ({
        ...prevError,
        unittype: "Unit Type  is required",
      }));
    }

    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(unitSubTypeName);
    if (!unitSubTypeName || !valid) {
      if (!unitSubTypeName) {
        setErrors((prevError) => ({
          ...prevError,
          unitSubTypeName: "Unit Sub Type name is required",
        }));
      } else {
        setErrors((prevError) => ({
          ...prevError,
          unitSubTypeName: "Enter Only Alphabets, Digits, Space, (, ), - and _",
        }));
      }
    } else {
      const hasMergeErrors = Object.values(errors).some((error: any) => error !== '');

      if (!hasMergeErrors) {
        if (unitId && unitSubTypeName) {
          const url = "unit/unit-sub-type"
          try {
            const response = await API.put(url, {
              "id": editId,
              "unitTypeId": unitId,
              "unitSubType": unitSubTypeName
            })
            if (response.success) {
              toasterSuccess('Record has been updated successfully', response.data.id, 3000)
              getItems()
              onCancel()
            }
            else {
              toasterError(response.error.code === 'ALREADY_EXITS' ? 'Unit Sub Type already exist' : response.error.code, response.data.id, 3000);
              onCancel()
            }
          }
          catch (error) {
            console.log(error, "error")
          }
        }
      }
    }
  };

  useEffect(() => {
    getunitTypes()
  }, [])
  useEffect(() => {
    setunitSubTypeName(defaultValue)
    setunitId(unitPrevId)
    setunitType(unitPrevValue)
  }, [defaultValue, unitPrevId, unitPrevValue])

  return (
    <div>
      {openPopup && (
        <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3
              >Edit Unit Subtype </h3>
              <button
                onClick={handleCancel}
              >
                &times;
              </button>
            </div>
            <hr />
            <div className="py-2">

              <div className="flex justify-between">
                <div>
                  <span className="text-sm mr-8">Unit Type Name* </span>
                </div>
                <div>
                  <select
                    className="w-80 border rounded px-2 py-1 text-sm"
                    value={unitType}
                    onChange={(event) => handleChange(event)}
                    name="unitType"
                  >
                    <option value="" className="text-sm">
                      Select unit Type*
                    </option>
                    {unitTypes.map((unitType: any) => (
                      <option key={unitType.id} value={unitType.unitType}>
                        {unitType.unitType}
                      </option>
                    ))}
                  </select>
                  {errors.unittype && <p className="text-red-500 ml-4 text-sm mt-1">{errors.unittype}</p>}
                </div>
                {/* {error.unitType && <div className="text-red-500 text-sm ml-5 mt-1">{error.unitType}</div>} */}
              </div>

              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">Unit Sub Type Name * </span>
                <div>
                  <input
                    type="text"
                    id="unitSubType"
                    name="unitSubType"
                    value={unitSubTypeName}
                    onChange={handleInputChange}
                    onBlur={onBlurCheck}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                    placeholder='Unit Sub Type Name'
                  />
                  {errors.unitSubTypeName && <p className="text-red-500 ml-4 text-sm mt-1">{errors.unitSubTypeName}</p>}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-5 flex justify-end border-t">
              <button
                onClick={handleSubmit}
                className="bg-green-500 mr-2 text-sm text-white font-bold py-2 px-4 rounded border"
              >
                Submit
              </button>
              <button
                onClick={handleCancel}
                className="mr-2 bg-gray-200 text-sm font-bold py-2 px-4 rounded border"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


const unitsubtype:any = () => {
  useTitle("Unit Subtype");
  const [roleLoading] = useRole();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([])
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState<any>(null);
  const [editDefault, setEditDefault] = useState<string>('')
  const [editSelectId, setEditSelectId] = useState<string>('')
  const [editSelectName, setEditSelectName] = useState<string>('')
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getUnitSubTypes = async () => {
    const url = `unit/unit-sub-type?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
    try {
      const response = await API.get(url)
      setData(response.data)
      setCount(response.count)
    }
    catch (error) {
      console.log(error, "error")
      setCount(0)
    }
  };

  const editHandle = (row: any) => {
    setEditId(row.id)
    setEditDefault(row?.unitSubType)
    setEditSelectId(row?.unitType?.id)
    setEditSelectName(row?.unitType?.unitType)
    setEditVisible(true)


  }
  const handleCancel = () => {
    setEditVisible(false)
    setShowDeleteConfirmation(false)
  }

  const handleDelete = async (id: number) => {
    setDeleteItemId(id)
    setShowDeleteConfirmation(true)

  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          unitType: element.unitType?.unitType,
          unitSubType: element.unitSubType,
          unitSubType_status: element.unitSubType_status
        }
      });
      exportToExcel(dataToExport, "Master-Unit-Sub-Type Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }

  const changeStatus = async (row: any) => {
    const newStatus = !row.unitSubType_status;
    const url = "unit/unit-sub-type-status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        getUnitSubTypes()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  useEffect(() => {
    getUnitSubTypes()
  }, [searchQuery, page, limit]);

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading translations...</div>;
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.unit?.unitTypeName}</p>,
      cell: (row: any) => row?.unitType?.unitType,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.unit.unitSubTypeName}</p>,
      selector: (row: any) => row?.unitSubType,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,
      cell: (row: any) =>
      (
        <button onClick={() => changeStatus(row)} className={row.unitSubType_status ? "text-green-500" : "text-red-500"}>
          {row.unitSubType_status ? (
            <BsCheckLg size={20} className="mr-4" />
          ) : (
            <RxCross1 size={20} className="mr-4" />
          )}
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations.common.action}</p>,

      cell: (row: any) => (
        <>
          <button className="bg-green-500 p-2 rounded" onClick={() => editHandle(row)}>
            <LuEdit size={18} color="white" />
          </button>
          <button className="bg-red-500 p-2 ml-3 rounded" onClick={() => handleDelete(row.id)}>
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];
  const handleSearchSubmit = (event: any) => {
    event.preventDefault();
  };
  if (!roleLoading) {
    return (
      <div >

        {isClient ? (

          <section className="right-content">
            <div className="right-content-inner">
              {/* breadcrumb */}
              <div className="breadcrumb-box">
                <div className="breadcrumb-inner light-bg">
                  <div className="breadcrumb-left">
                    <ul className="breadcrum-list-wrap">
                      <li className="active">
                        <Link href="/dashboard">
                          <span className="icon-home"></span>
                        </Link>
                      </li>
                      <li>Master</li>
                      <li>Unit</li>
                      <li>Unit SubType</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* farmgroup start */}
              <div className="farm-group-box">
                <div className="farm-group-inner">
                  <div className="table-form lr-mCustomScrollbar">
                    <div className="table-minwidth min-w-[650px]">
                      {/* search */}
                      <div className="search-filter-row">
                        <div className="search-filter-left ">
                          <div className="search-bars">
                            <form className="form-group mb-0 search-bar-inner" >
                              <input
                                type="text"
                                className="form-control form-control-new jsSearchBar "
                                placeholder="Search by Unit SubType"
                                value={searchQuery}
                                onChange={searchData}
                              />
                              <button type="submit" className="search-btn">
                                <span className="icon-search"></span>
                              </button>
                            </form>
                          </div>
                        </div>

                        <div className="search-filter-right">
                          <button
                            className="btn btn-all btn-purple"
                            onClick={() => router.push("/master/unit/unit-sub-type/add-unit-subtype")}
                          >
                            {translations.common.add}
                          </button>
                        </div>
                      </div>

                      <div className="flex mt-2 justify-end borderFix pt-2 pb-2">
                        <div className="search-filter-right">
                          <button
                            onClick={handleExport}
                            className="h-100 py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                          >
                            {translations.common.export}
                          </button>
                        </div>
                      </div>

                      <CommonDataTable columns={columns} data={data} count={count} updateData={updatePage} />
                      <div>
                        <Edit openPopup={editVisible} onCancel={handleCancel} editId={editId} defaultValue={editDefault} getItems={getUnitSubTypes} unitPrevId={editSelectId} unitPrevValue={editSelectName} />
                      </div>
                      {showDeleteConfirmation && (
                        <DeleteConfirmation
                          message="Are you sure you want to delete this?"
                          onDelete={async () => {
                            if (deleteItemId !== null) {
                              const url = "unit/unit-sub-type"
                              try {
                                const response = await API.delete(url, {
                                  id: deleteItemId
                                })
                                if (response.success) {
                                  toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                                  getUnitSubTypes()
                                } else {
                                  toasterError('Failed to delete record', deleteItemId, 5000);
                                }
                              }
                              catch (error) {
                                console.log(error, "error")
                                toasterError('An error occurred');
                              }
                              setShowDeleteConfirmation(false);
                              setDeleteItemId(null);
                            }
                          }}
                          onCancel={handleCancel}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          'Loading...'
        )}
      </div>
    )
  }
};

export default unitsubtype;
