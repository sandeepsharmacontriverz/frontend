"use client";
import { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from "@components/core/Table";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import useDebounce from "@hooks/useDebounce";
import Loader from "@components/core/Loader";

const agentUserManagement: React.FC = () => {
  useTitle("Agent User Management");
  const [isClient, setIsClient] = useState(false);
  const [active, setActive] = useState("1");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [unRegister, setUnRegister] = useState<any>([]);
  const [register, setRegister] = useState<any>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(encodeURIComponent(searchQuery), 200);
  const [count, setCount] = useState<any>();

  useEffect(() => {
    setIsClient(true);
    getUnRegister();
    getRegister();
  }, [active, debouncedSearch, limit, page]);

  const getUnRegister = async () => {
    try {
      if (active == "2") {
        const res = await API.get(
          `qr-app/unregister-devices?limit=${limit}&page=${page}&pagination=true&search=${debouncedSearch}`
        );
        if (res.success) {
          setUnRegister(res.data);
          setCount(res.count);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getRegister = async () => {
    try {
      if (active == "1") {
        const res = await API.get(
          `qr-app/register-devices?limit=${limit}&page=${page}&pagination=true&search=${debouncedSearch}`
        );
        if (res.success) {
          setRegister(res.data);
          setCount(res.count);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggle = (event: any) => {
    const activeButtonName = event.target.name;
    if (activeButtonName === "registered") {
      setActive("1");
    } else {
      setActive("2");
    }
    setSearchQuery("");
  };

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> <Loader /></div>;
  }

  const columnsRegistered = [
    {
      name: (
        <p className="text-[13px] font-medium"> {translations.common.srNo} </p>
      ),
      selector: (row: any, index: any) => index + 1,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.agentUserManagement.userId}{" "}
        </p>
      ),
      selector: (row: any) => row?.username,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.agentUserManagement.firstName}
        </p>
      ),
      selector: (row: any) => row?.firstName,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.agentUserManagement.lastName}{" "}
        </p>
      ),
      selector: (row: any) => row?.lastName,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.agentUserManagement.mobileNumber}{" "}
        </p>
      ),
      selector: (row: any) => row?.mobile_no,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.common.emailId}{" "}
        </p>
      ),
      selector: (row: any) => row?.email,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.agentUserManagement.deviceId}{" "}
        </p>
      ),
      selector: (row: any) => row?.device_id,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.agentUserManagement.accountType}{" "}
        </p>
      ),
      selector: (row: any) => row?.access_level,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.common.status}{" "}
        </p>
      ),
      cell: (row: any) => (
        <span
          className={row.status === true ? "text-green-500" : "text-red-500"}
        >
          {row.status ? (
            <BsCheckLg size={20} className="mr-4" />
          ) : (
            <RxCross1 size={20} className="mr-4" />
          )}
        </span>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.common.action}{" "}
        </p>
      ),
      cell: (row: any) => (
        <>
          <Link
            className="bg-green-500 p-2 rounded "
            href={`/qr-app/agent-user-management/edit-user?id=${row.id}`} //
          >
            <LuEdit size={18} color="white" />
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-500 p-2 ml-3 rounded"
          >
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const columnsUnregistered = [
    {
      name: (
        <p className="text-[13px] font-medium"> {translations.common.srNo} </p>
      ),
      selector: (row: any, index: any) => index + 1,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.agentUserManagement.staffName}{" "}
        </p>
      ),
      selector: (row: any) => row.firstName,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.agentUserManagement.mobileNumber}{" "}
        </p>
      ),
      selector: (row: any) => row?.mobile_no,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.agentUserManagement.deviceId}{" "}
        </p>
      ),
      selector: (row: any) => row?.device_id,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {" "}
          {translations.common.action}{" "}
        </p>
      ),
      cell: (row: any) => (
        <>
          <Link
            className="bg-green-500 p-2 rounded "
            href={`/qr-app/agent-user-management/add-user?id=${row.id}`}
          >
            <LuEdit size={18} color="white" />
          </Link>
          {active === "1" && (
            <button
              onClick={() => handleDelete(row.id)}
              className="bg-red-500 p-2 ml-3 rounded"
            >
              <AiFillDelete size={18} color="white" />
            </button>
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  return (
    <>
      {isClient ? (
        <>
          {showDeleteConfirmation && (
            <DeleteConfirmation
              message="Are you sure you want to delete this?"
              onDelete={async () => {
                if (deleteItemId !== null) {
                  const url = "qr-app/delete-user-app";
                  try {
                    const response = await API.delete(url, {
                      id: deleteItemId,
                    });
                    if (response.success) {
                      toasterSuccess(
                        "Record has been deleted successfully",
                        3000,
                        "deleteItemId"
                      );
                      getRegister();
                    } else {
                      toasterError("Failed to delete record", 3000, "deleteItemId");
                    }
                  } catch (error) {
                    toasterError("An error occurred", 3000, "deleteItemId");
                  }
                  setShowDeleteConfirmation(false);
                  setDeleteItemId(null);
                }
              }}
              onCancel={handleCancel}
            />
          )}
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
                  <li>QR-App</li>
                  <li>Agent User Management</li>
                </ul>
              </div>
            </div>
          </div>
          {/* farmgroup start */}
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form">
                <div className="table-minwidth w-100">
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
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <button type="submit" className="search-btn">
                            <span className="icon-search"></span>
                          </button>
                        </form>
                      </div>
                    </div>
                    <div className="topTrader">
                      <section>
                        <button
                          name="registered"
                          className={active === "1" ? "activeFilter" : ""}
                          type="button"
                          onClick={handleToggle}
                        >
                          Registered Devices
                        </button>
                        <button
                          name="unRegistered"
                          className={active === "2" ? "activeFilter" : ""}
                          type="button"
                          onClick={handleToggle}
                        >
                          Unregistered Devices
                        </button>
                      </section>
                      <section className="buttonTab" />
                    </div>
                  </div>
                  <CommonDataTable
                    count={count}
                    columns={
                      active === "1" ? columnsRegistered : columnsUnregistered
                    }
                    data={active === "1" ? register : unRegister}
                    updateData={updatePage}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full min-h-screen flex justify-center items-center">
          <span>Processing...</span>
        </div>
      )}
    </>
  );
};

export default agentUserManagement;
