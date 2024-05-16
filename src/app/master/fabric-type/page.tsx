"use client";
import { useState, useEffect } from "react";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "next/navigation";
import CommonDataTable from "@components/core/Table";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import Link from "@components/core/nav-link";
import { exportToExcel } from "@components/core/ExcelExporter";

const fabricType: React.FC = () => {
  useTitle("Fabric Type");
  const [roleLoading] = useRole();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [data, setData] = useState([])
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState<any>(null);
  const [editDefault, setEditDefault] = useState<string>('')
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);


  useEffect(() => {
    setIsClient(true);
  }, []);



  const getFabricType = async () => {
    const url = `fabric-type?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
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
    setEditDefault(row.fabricType_name)
    setEditVisible(true)


  }
  const handleCancel = () => {
    setEditVisible(false)
    setShowDeleteConfirmation(false)
  }

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
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
          fabricType_name: element.fabricType_name,
          fabricType_status: element.fabricType_status
        }
      });
      exportToExcel(dataToExport, "Master-Fabric-Type Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }
  const changeStatus = async (row: any) => {
    const newStatus = !row.fabricType_status;
    const url = "fabric-type/status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        getFabricType()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  useEffect(() => {
    getFabricType()
  }, [searchQuery, page, limit]);

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading translations...</div>;
  }

  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
    },
    {
      name: translations.fabricType,
      cell: (row: any) => row.fabricType_name,
    },
    {
      name: translations.common.status,
      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.fabricType_status ? "text-green-500" : "text-red-500"}>
          {row.fabricType_status ? (
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
      name: translations.common.action,
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

  if (!roleLoading) {
    return (
      <div >
        {isClient ? (
          <div >
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <Link href="/dashboard" className="active">
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>Master</li>
                    <li>Fabric Type</li>
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
                          <form className="form-group mb-0 search-bar-inner">
                            <input
                              type="text"
                              className="form-control form-control-new jsSearchBar "
                              placeholder={translations.common.search}
                              value={searchQuery}
                              onChange={searchData} />
                            <button type="submit" className="search-btn">
                              <span className="icon-search"></span>
                            </button>
                          </form>
                        </div>

                      </div>
                      <div className="search-filter-right">
                        <button className="btn btn-all btn-purple" onClick={() => router.push("/master/fabric-type/add-fabric-type")} >{translations.common.add}</button>
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

                    <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />

                  </div>
                </div>
              </div>
            </div>
            <div>
              <Edit openPopup={editVisible} onCancel={handleCancel} editId={editId} defaultValue={editDefault} getItems={getFabricType} />
            </div>
            {showDeleteConfirmation && (
              <DeleteConfirmation
                message="Are you sure you want to delete this?"
                onDelete={async () => {
                  if (deleteItemId !== null) {
                    const url = "fabric-type"
                    try {
                      const response = await API.delete(url, {
                        id: deleteItemId
                      })
                      if (response.success) {
                        toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                        getFabricType()
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
        ) : (
          <div className="w-full min-h-screen flex justify-center items-center">
            <span>Processing...</span>
          </div>
        )}
      </div>
    )
  }
};

export default fabricType;

const Edit = ({ openPopup, onCancel, editId, defaultValue, getItems }: any) => {
  const [fabricTypeName, setFabricTypeName] = useState<any>('');
  const [errors, setErrors] = useState({
    name: ''
  })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFabricTypeName(value)
  };

  const alreadyExistName = async (value: string) => {
    const res = await API.post("fabric-type/check-fabric-types", {
      id: editId,
      fabricTypeName: value
    });

    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
  }

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const regexAlphabets = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regexAlphabets.test(value); // Use 'value' instead of 'countryName' here
    const newErrors: any = {};

    if (!valid || value.trim() === "") {
      newErrors['name'] = value.trim() === "" ? "Fabric Type name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _";
    } else {
      const onBlurError = await alreadyExistName(value);
      newErrors['name'] = onBlurError;
    }

    setErrors(newErrors);
  };


  const handleCancel = () => {
    onCancel()
    setErrors({
      name: ''
    });
    setFabricTypeName(defaultValue)
  };

  const handleSubmit = async () => {
    // setErrors({ name: '' });
    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(fabricTypeName);
    if (!fabricTypeName || !valid) {
      setErrors((prevError) => ({
        ...prevError,
        name: !fabricTypeName ? "Fabric Type name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _",
      }));
    } else {
      const url = "fabric-type"
      const hasMergeErrors = Object.values(errors).some((error: any) => error !== '');

      if (!hasMergeErrors) {
        try {
          const response = await API.put(url, {
            "id": editId,
            "fabricTypeName": fabricTypeName
          })
          if (response.success) {
            toasterSuccess('Record has been updated successfully', response?.data?.id, 3000)
            getItems()
            onCancel()
          }
          else {
            toasterError(response.error.code === 'ALREADY_EXITS' ? 'Fabric Type already exist' : response.error.code, response?.data?.id, 3000);
            onCancel()
          }
        }
        catch (error) {
          console.log(error, "error")
        }
      }
    }
  };

  useEffect(() => {
    setFabricTypeName(defaultValue)
  }, [defaultValue])

  return (
    <div>
      {openPopup && (
        <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3
              >Edit Fabric Type</h3>
              <button
                onClick={handleCancel}
              >
                &times;
              </button>
            </div>
            <hr />
            <div className="py-2">

              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">Fabric Type*</span>
                <div>
                  <input
                    type="text"
                    id="fabricType"
                    name="fabricType"
                    value={fabricTypeName}
                    onChange={handleInputChange}
                    onBlur={onBlurCheck}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                    placeholder='Fabric Type Name'
                  />
                  {errors.name && <p className="text-red-500 ml-4 text-sm mt-1">{errors.name}</p>}
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

