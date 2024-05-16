"use client";
import Link from "@components/core/nav-link";
import { useRouter } from "@lib/router-events";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useState, useEffect } from "react";

import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";

interface TableData {
  id: number;
  county_name: string;
  country_status: boolean;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Email Management");
  const [roleLoading] = useRole();
  const router = useRouter();
  const { translations, loading } = useTranslations();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<TableData[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  useEffect(() => {
    fetchEmailTemp();
    setIsClient(true);
  }, [searchQuery, page, limit]);

  const fetchEmailTemp = async () => {
    try {
      const res = await API.get(
        `email/get-email-jobs?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };

  const getUserGroup = (userCat: any) => {
    const getId = userCat?.map((userName: any) => userName?.user_role);
    return getId.join(", ");
  };
  const getPrograms = (programName: any) => {
    const getId = programName?.map((program: any) => program?.program_name);
    return getId.join(", ");
  };
  const getBrands = (brandName: any) => {
    const getId = brandName?.map((brand: any) => brand?.brand_name);
    return getId.join(", ");
  };
  const getCountries = (countries: any) => {
    const getId = countries?.map((country: any) => country?.county_name);
    return getId.join(", ");
  };

  if (loading) {
    return (
      <div>
        {" "}
        <Loader />{" "}
      </div>
    );
  }
  const columns = [
    {
      name: <p className="text-[13px] font-medium">Template</p>,
      selector: (row: any) => row.template?.template_name,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Mail Type</p>,
      selector: (row: any) => row.mail_type,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">User Group</p>,
      selector: (row: any) => getUserGroup(row.userCategories),
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      selector: (row: any) => getPrograms(row.programs),
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Brand</p>,
      selector: (row: any) => getBrands(row.brands),
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.location.countryName}
        </p>
      ),
      selector: (row: any) => getCountries(row.countries),
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.action}</p>
      ),
      cell: (row: any) => (
        <>
          <button
            className="bg-green-500 p-2 rounded "
            onClick={() =>
              router.push(
                `/settings/email-management/edit-email-management?id=${row.id}`
              )
            }
          >
            <LuEdit size={18} color="white" />
          </button>

          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-500 p-2 ml-3 rounded"
          >
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      wrap: true,
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  if (!roleLoading) {
    return (
      <div className="">
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "email/delete-email-job";
                try {
                  const response = await API.delete(url, {
                    id: deleteItemId,
                  });
                  if (response.success) {
                    toasterSuccess("Record has been deleted successfully");
                    fetchEmailTemp();
                  } else {
                    toasterError(response.error.code, 3000, deleteItemId);
                  }
                } catch (error) {
                  console.log(error, "error");
                  toasterError("An error occurred");
                }
                setShowDeleteConfirmation(false);
                setDeleteItemId(null);
              }
            }}
            onCancel={handleCancel}
          />
        )}

        {isClient ? (
          <div>
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
                    <li>Settings</li>
                    <li>Email Management</li>
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
                          onClick={() =>
                            router.push(
                              "/settings/email-management/add-email-management"
                            )
                          }
                        >
                          Add New Email
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
          "Loading..."
        )}
      </div>
    );
  }
}
