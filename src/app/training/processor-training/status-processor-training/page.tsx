"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "next/link";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import { useRouter, useSearchParams } from "next/navigation";
import useRole from "@hooks/useRole";
import { handleDownload } from "@components/core/Download";
import moment from "moment";
import User from "@lib/User";
import Loader from "@components/core/Loader";

export default function page() {
  useTitle("Training Processor Report");
  const [roleLoading] = useRole();
  const search = useSearchParams();
  const statusId = search.get("id");

  const router = useRouter();

  const { translations, loading } = useTranslations();

  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const code = encodeURIComponent(searchQuery);
  const brandId = User.brandId;

  useEffect(() => {
    getTrainingList();
  }, [searchQuery, page, limit, statusId, brandId]);

  const getTrainingList = async () => {
    const url = `training/get-training-process-status?id=${statusId}&search=${code}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setIsLoaded(true);
      setCount(response.count);
    } catch (error) {
      console.error(error, "error");
      setCount(0);
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const fetchExport = async () => {
    try {
      const res = await API.get(
        `training/export-training-process-status?id=${statusId}&search=${code}&limit=${limit}&page=${page}&pagination=true`
      );
      if (res.success) {
        handleDownload(res.data, "Rice Traceability - Training Report", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };

  if (loading) {
    return <div>  <Loader /></div>;
  }

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S No.</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      cell: (row: any) => dateFormatter(row["process-training"]?.date),
      wrap: true

    },
    {
      name: <p className="text-[13px] font-medium">Name</p>,
      cell: (row: any) =>
        row.mandi
          ? row.mandi.name
          : row.mill
            ? row.mill.name
              : "",
      sortable: false,
    },
    !brandId && {
      name: <p className="text-[13px] font-medium">Brand</p>,
      cell: (row: any) => row["process-training"].brand.brand_name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Processor</p>,
      cell: (row: any) => row["process-training"].processor,
    },
    {
      name: <p className="text-[13px] font-medium">Country</p>,
      cell: (row: any) => row["process-training"].country.county_name,
    },
    {
      name: <p className="text-[13px] font-medium">State</p>,
      cell: (row: any) => row["process-training"].state.state_name,
    },
    {
      name: <p className="text-[13px] font-medium">Training Type</p>,
      cell: (row: any) => row["process-training"].training_type,
    },
    {
      name: <p className="text-[13px] font-medium">Venue</p>,
      cell: (row: any) => row["process-training"].venue,
    },
    {
      name: <p className="text-[13px] font-medium">Status</p>,
      cell: (row: any) => row.status,
    },
    {
      name: <p className="text-[13px] font-medium">FeedBack </p>,
      cell: (row: any) => row.feedback,
    },
  ].filter(Boolean);

  if (!roleLoading && isLoaded) {
    return (
      <div>
        <div>
          <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
              <div className="breadcrumb-left">
                <ul className="breadcrum-list-wrap">
                  <li>
                    <Link href={!brandId ? "/dashboard" : "/brand/dashboard"} className="active">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li>Training</li>
                  <li>
                    <Link href="/training/processor-training">
                      Processor Training
                    </Link>
                  </li>
                  <li>Training Processor Report</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form ">
                <div className="table-minwidth w-100">
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

                    <div className="flex">
                      <div className="customButtonGroup">
                        <button
                          className="btn-outline-purple"
                          onClick={() => router.back()}
                        >
                          {translations.common.back}

                        </button>
                      </div>
                      <div className="search-filter-right ml-3">
                        <button
                          className="py-2.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                          onClick={fetchExport}
                        >
                          {translations.common.export}
                        </button>
                      </div>
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
      </div>
    );
  }
}
