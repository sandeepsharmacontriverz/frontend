"use client";
import Link from "@components/core/nav-link";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from "@components/core/Table";
import React, { useState, useEffect } from "react";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import { useRouter } from "@lib/router-events";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import DeleteConfirmation from "@components/core/DeleteConfirmation";

const menuEntitlement = () => {
  useTitle("Menu & Entitlement");
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();
  const router = useRouter();

  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isClient, setIsClient] = useState(false);

  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
    getUserRoles();
  }, []);

  useEffect(() => {
    getUserRoles();
  }, [searchQuery, limit, page]);

  const getUserRoles = async () => {
    const res = await API.get(
      `user/get-user-roles?search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`
    );
    if (res.success) {
      setData(res.data);
      setCount(res.count);
    }
  };
  const handleEdit = (id: number) => {
    router.push(`/role/menu-entitlement/edit-role?id=${id}`);
  };

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true);
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
      wrap: true,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: "100px",
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.menuEntitlement?.roleName}</p>,
      wrap: true,
      cell: (row: any) => (row.brand ? row.brand?.brand_name : row.user_role),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.menuEntitlement?.userCategory}</p>,
      wrap: true,
      cell: (row: any) => row?.userCategory?.category_name,
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.action}</p>,
      cell: (row: any) => (
        <>
          {row?.userCategory?.category_name === "Brand" &&
            row?.user_role === "Brand" ? (
            <></>
          ) : (
            <>
              <button
                className="bg-green-500 p-2 rounded "
                onClick={() => handleEdit(row.id)}
              >
                <LuEdit size={18} color="white" />
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                disabled={isSubmitting}
                className="bg-red-500 p-2 ml-3 rounded"
              >
                <AiFillDelete size={18} color="white" />
              </button>
            </>
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
  };

  if (roleLoading || loading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  return (
    <div>
      {showDeleteConfirmation && (
        <DeleteConfirmation
          message="Are you sure you want to delete this?"
          onDelete={async () => {
            if (deleteItemId !== null) {
              const url = "user/delete-user-role";
              try {
                const response = await API.delete(url, {
                  id: deleteItemId,
                });
                setIsSubmitting(true);
                if (response.success) {
                  toasterSuccess(
                    "Record has been deleted successfully",
                    3000,
                    deleteItemId
                  );
                  getUserRoles();
                  setIsSubmitting(false);
                } else {
                  toasterError(response.error.code, 3000, deleteItemId);
                  setIsSubmitting(false);
                }
              } catch (error) {
                console.error(error, "error");
                toasterError("An error occurred");
                setIsSubmitting(false);
              }
              setShowDeleteConfirmation(false);
              setDeleteItemId(null);
            }
          }}
          onCancel={handleCancel}
        />
      )}
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <Link href="/dashboard" className="active">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Role</li>
              <li>Menu & Entitlement</li>
            </ul>
          </div>
        </div>
      </div>
      {isClient ? (
        <div>
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
                            onChange={(e: any) =>
                              setSearchQuery(e.target.value)
                            }
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
                        onClick={() =>
                          router.push("/role/menu-entitlement/add-role")
                        }
                      >
                        {translations.common.add}
                      </button>
                    </div>
                  </div>
                  <CommonDataTable
                    columns={columns}
                    count={count}
                    data={data}
                    updateData={updatePage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        "Loading....."
      )}
    </div>
  );
};

export default menuEntitlement;
