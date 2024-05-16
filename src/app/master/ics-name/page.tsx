"use client";
import { useState, useEffect } from "react";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "@lib/router-events";
import CommonDataTable from "@components/core/Table";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { exportToExcel } from "@components/core/ExcelExporter";

const icsName:any= () => {
  useTitle("Ics Name");
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
  const [editIcs, setEditIcs] = useState<string>('')
  const [editSelectFarmGroupId, setEditSelectFarmGroupId] = useState<string>('')
  const [editLatitude, setEditLatitude] = useState<string>('')
  const [editLongitude, setEditLongitude] = useState<string>('')
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  const getIcsName = async () => {
    const url = `ics?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
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
    setEditIcs(row.ics_name)
    setEditSelectFarmGroupId(row.farmGroup_id)
    setEditLatitude(row.ics_latitude)
    setEditLongitude(row.ics_longitude)
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
          ics_name: element.ics_name,
          farmGroup: element.farmGroup.name,
          ics_status: element.ics_status,
        }
      });
      exportToExcel(dataToExport, "Master-Ics-Name Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }

  const changeStatus = async (row: any) => {
    const newStatus = !row.ics_status;
    const url = "ics/status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        getIcsName()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  useEffect(() => {
    getIcsName()
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
      name: <p className="text-[13px] font-medium">{translations?.icsName}</p>,

      cell: (row: any) => row.ics_name,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.farmGroup}</p>,

      cell: (row: any) => row?.farmGroup?.name,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.status}</p>,

      cell: (row: any) => (
        <button onClick={() => changeStatus(row)}
          className={row.ics_status ? "text-green-500" : "text-red-500"}>
          {row.ics_status ? (
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

          <>
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
                        <li>ICS</li>
                        <li>ICS Name</li>
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
                                  placeholder="Search by ICS Name"
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
                              onClick={() => router.push("/master/ics-name/add-ics-name")}
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

                        <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />
                        <div>
                          <Edit openPopup={editVisible} onCancel={handleCancel} editId={editId} defaultIcsName={editIcs} getItems={getIcsName} farmGroupId={editSelectFarmGroupId} defaultLatitude={editLatitude} defaultLongitude={editLongitude} />
                        </div>

                        {showDeleteConfirmation && (
                          <DeleteConfirmation
                            message="Are you sure you want to delete this?"
                            onDelete={async () => {
                              if (deleteItemId !== null) {
                                const url = "ics"
                                try {
                                  const response = await API.delete(url, {
                                    id: deleteItemId
                                  })
                                  if (response.success) {
                                    toasterSuccess('Record has been deleted successfully', deleteItemId, 5000)
                                    getIcsName()
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
          </>
        ) : (
          <div className="w-full min-h-screen flex justify-center items-center">
            <span>Processing...</span>
          </div>
        )}
      </div>
    )
  }
};

export default icsName;

const Edit = ({ openPopup, onCancel, editId, farmGroupId, defaultIcsName, defaultLatitude, defaultLongitude, getItems }: any) => {

  const [farmGroups, setFarmGroups] = useState([]);
  const [icsName, setIcsName] = useState<any>('');
  const [farmGroup, setFarmGroup] = useState("")
  const [longitude, setLongitude] = useState("")
  const [latitude, setLatitude] = useState("")
  const [error, setError] = useState({
    farmGroup: "",
    icsName: "",
  });

  useEffect(() => {
    getFarmGroups()
  }, [])
  useEffect(() => {
    setIcsName(defaultIcsName)
    setFarmGroup(farmGroupId)
    setLatitude(defaultLatitude)
    setLongitude(defaultLongitude)
  }, [editId, defaultIcsName, farmGroupId, defaultLatitude, defaultLongitude])

  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value } = event.target;
  //   setIcsName(value)
  // };

  const handleCancel = () => {
    onCancel()
    setIcsName(defaultIcsName)
    setFarmGroup(farmGroupId)
    setLatitude(defaultLatitude)
    setLongitude(defaultLongitude)
    setError((prevData) => ({
      ...prevData,
      icsName: "",
      farmGroup: "",
    }));
  };

  const alreadyExistName = async (value: string) => {
    const res = await API.post("ics/check-ics-names", {
      id: editId,
      formGroupId: Number(farmGroup),
      icsName: value
    });
    if (res?.data?.exist === true) {
      return `Name Already Exists for "${value}". Please Try Another`;
    } else {
      return '';
    }
  }

  const handleInputChange = async (e: any) => {
    const { value } = e.target;
    setIcsName(value)
  };

  const onBlurCheck = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newErrors: any = {};
    if (value.trim() !== "" && farmGroup) {
      const onBlurError = await alreadyExistName(value);
      newErrors['icsName'] = onBlurError;
    } else {
      newErrors['icsName'] = "";
    }
    setError(newErrors);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const { name, value } = event.target;
    if (name === "farmGroup") {
      setFarmGroup(value)
    }
    else if (name === "icsName") {
      setIcsName(value)
    }
    else if (name === "latitude") {
      setLatitude(value)
    }
    else if (name === "longitude") {
      setLongitude(value)
    }

  }

  const getFarmGroups = async () => {
    const url = "farm-group?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const farmGroup = response.data;
        setFarmGroups(farmGroup);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleSubmit = async () => {
    const url = "ics"

    let isError = false;
    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(icsName);
    if (icsName === "" || !valid) {
      setError((prevError: any) => ({
        ...prevError,
        icsName: !icsName ? "ICS Name is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _",
      }));
      isError = true;
    }

    if (farmGroup === "") {
      setError((prevError: any) => ({
        ...prevError,
        farmGroup: "Farm Group is required",
      }));
      isError = true;
    }

    if (!isError) {
      const hasMergeErrors = Object.values(error).some((error: any) => error !== '');
      if (!hasMergeErrors) {
        if (icsName && farmGroup) {
          try {
            const response = await API.put(url, {
              "id": editId,
              "formGroupId": farmGroup,
              "icsName": icsName,
              "longitude": longitude,
              "latitude": latitude
            })
            if (response.success) {
              toasterSuccess('Record has been submitted successfully', response.data.id, 3000)
              getItems()
              handleCancel()
            }
            else {
              toasterError(response.error.code === 'ALREADY_EXITS' ? 'ICS name already exist' : response.error.code, response.data.id, 3000);
              handleCancel()
            }
          }
          catch (error) {
            console.log(error, "error")
          }
        }
      }
    }
  };

  return (
    <div>
      {openPopup && (
        <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3
              >Edit ICS Name </h3>
              <button
                onClick={handleCancel}
              >
                &times;
              </button>
            </div>
            <hr />
            <div className="py-2">

              <div className="flex py-3 justify-between">
                <div>
                  <span className="text-sm mr-8">Farm Group Name *</span>
                </div>
                <div className="flex-col">
                  <select
                    className="w-80 border rounded px-2 py-1 text-sm"
                    value={farmGroup}
                    onChange={(event) => handleChange(event)}
                    name="farmGroup"
                  >
                    <option value="" className="text-sm">
                      Select Farm Group*
                    </option>
                    {farmGroups.map((farmGroup: any) => (
                      <option key={farmGroup.id} value={farmGroup.id}>
                        {farmGroup.name}
                      </option>
                    ))}
                  </select>
                  {error.farmGroup && <div className="text-red-500 text-sm  mt-1">{error.farmGroup}</div>}
                </div>
              </div>

              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">ICS Name *</span>
                <div>
                  <input
                    type="text"
                    id="icsName"
                    name="icsName"
                    value={icsName}
                    onChange={handleInputChange}
                    onBlur={onBlurCheck}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                    placeholder='Ics Name'
                  />
                  {error.icsName && <div className="text-red-500 text-sm  mt-1">{error.icsName}</div>}
                </div>
              </div>

              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">Latitude</span>
                <input
                  id={`latitude`}
                  name="latitude"
                  type="number"
                  className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                  placeholder="Latitude"
                  value={latitude}
                  onChange={(event) => handleChange(event)}
                />
              </div>

              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">Longitude</span>
                <input
                  id={`longitude`}
                  name="longitude"
                  type="number"
                  className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                  placeholder="Longitude"
                  value={longitude}
                  onChange={(event) => handleChange(event)}
                />
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