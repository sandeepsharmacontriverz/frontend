"use client"

import { useRouter } from '@lib/router-events';
import { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from '@components/core/Table';
import useTranslations from '@hooks/useTranslation';
import useRole from '@hooks/useRole';
import DeleteConfirmation from '@components/core/DeleteConfirmation';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import API from '@lib/Api';
import useTitle from '@hooks/useTitle';
import { exportToExcel } from '@components/core/ExcelExporter';

interface TableData {
  id: number;
  name: string;
  status: boolean;
}
interface EditPopupProps {
  onClose: () => void;
  onSubmit: (formData?: any) => void;
  formData?: any;
  onFieldChange?: (name: string, value: string) => void;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Production Capacity")
  const [roleLoading] = useRole()
  const [isClient, setIsClient] = useState(false)
  const [data, setData] = useState<TableData[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [editedFormData, setEditedFormData] = useState<any>({
    name: "",
  });
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const router = useRouter();
  const [editId, setEditId] = useState<any>(null);
  const [editDefault, setEditDefault] = useState<string>('')

  useEffect(() => {
    fetchProduction();
    setIsClient(true)

  }, [searchQuery, page, limit])
  const fetchProduction = async () => {
    try {
      const res = await API.get(`production-capacity?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);
      if (res.success) {
        setData(res.data)
        setCount(res.count)

      }
    } catch (error) {
      console.log(error)
      setCount(0)
    }
  }

  const fetchUserData = async (page: number, rowsPerPage: number) => {
    //Add api here
    return { data: [], total: 5 }
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading translations...</div>;
  }
  const changeStatus = async (row: any) => {
    const newStatus = !row.status;
    const url = "production-capacity/status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        fetchProduction()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }
  const handleEdit = (row: any) => {
    setShowEditPopup(true)
    setEditId(row.id)
    setEditDefault(row.name)

  }


  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,

      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.productionCapacity?.productionCapacity}</p>,

      selector: (row: TableData) => row.name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,

      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.status ? "text-green-500" : "text-red-500"}>
          {row.status ? (
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
      name: <p className="text-[13px] font-medium">{translations?.common?.action}</p>,

      cell: (row: TableData) => (
        <>
          <button className="bg-green-500 p-2 rounded " onClick={() => handleEdit(row)}>
            <LuEdit
              size={18}
              color="white"
            />
          </button>

          <button onClick={() => handleDelete(row.id)} className="bg-red-500 p-2 ml-3 rounded">
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          productionCapacity: element.name,
          status: element.status,
        }
      });
      exportToExcel(dataToExport, "Master-Production-Capacity Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const handleCancel = () => {
    setShowEditPopup(!showEditPopup)
    // Close the delete confirmation popup and reset deleteItemId
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };
  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }

  if (!roleLoading) {
    return (
      <div>
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
                    <li>Production Capacity</li>
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
                        <button className="btn btn-all btn-purple" onClick={() => router.push("/master/production-capacity/add-production-capacity")} >{translations.common.add}</button>
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
            {showDeleteConfirmation && (
              <DeleteConfirmation
                message="Are you sure you want to delete this?"
                onDelete={async () => {
                  if (deleteItemId !== null) {
                    const url = "production-capacity"
                    try {
                      const response = await API.delete(url, {
                        id: deleteItemId
                      })
                      if (response.success) {
                        toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                        fetchProduction()
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
            <div>
              <Edit openPopup={showEditPopup} onCancel={handleCancel} editId={editId} defaultValue={editDefault} getItems={fetchProduction} />
            </div>

          </div>
        )
          : 'Loading...'}
      </div>
    );
  }
}


const Edit = ({ openPopup, onCancel, editId, defaultValue, getItems }: any) => {
  const [programs, setPrograms] = useState<any>('');
  const [errors, setErrors] = useState({
    name: ''
  })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setPrograms(value)
  };

  const alreadyExistName = async (value: string) => {
    const res = await API.post("production-capacity/check-prod-capacities", {
      id: editId,
      name: value
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
    const valid = regexAlphabets.test(value);
    const newErrors: any = {};

    if (!valid || value.trim() === "") {
      newErrors['name'] = value.trim() === "" ? "Production capacity name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _";
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
    setPrograms(defaultValue)
  };

  const handleSubmit = async () => {
    const regex: any = /^[\(\)_\-a-zA-Z0-9\/\s]+$/;
    const valid = regex.test(programs);
    if (!programs || !valid) {
      setErrors((prevError) => ({
        ...prevError,
        name: !programs ? "Production capacity name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _",
      }));
    } else {
      const url = "production-capacity"
      const hasMergeErrors = Object.values(errors).some((error: any) => error !== '');

      if (!hasMergeErrors) {
        try {
          const response = await API.put(url, {
            "id": editId,
            "name": programs
          })
          if (response.success) {
            toasterSuccess('Record has been updated successfully', response.data.id, 3000)
            setPrograms('')
            getItems()
            onCancel()
          }
          else {
            toasterError(response.error.code === 'ALREADY_EXITS' ? 'Production capacity already exist' : response.error.code, response.data.id, 3000);
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
    setPrograms(defaultValue)
  }, [defaultValue])

  return (
    <div>
      {openPopup && (
        <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3
              >Edit Production Capacity </h3>
              <button
                onClick={handleCancel}
              >
                &times;
              </button>
            </div>
            <hr />
            <div className="py-2">

              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">Production Capacity Name:</span>
                <div>
                  <input
                    type="text"
                    id="programs"
                    name="programs"
                    value={programs}
                    onChange={handleInputChange}
                    onBlur={onBlurCheck}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                    placeholder='Production Capacity Name'
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