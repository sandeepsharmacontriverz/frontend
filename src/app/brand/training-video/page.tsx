"use client";
import { useState, useEffect } from "react";
import React from "react";
import { useRouter } from "@lib/router-events";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "next/link";
import DataTable from "react-data-table-component";
import User from "@lib/User";
import Loader from "@components/core/Loader";

const videoGinnerList: React.FC = () => {
  useTitle("TraceBale Training Videos");
  const [roleLoading] = useRole();
  const router = useRouter();
  const brandId = User.brandId;

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getVideoList = async () => {
    const url = `video?brandId=${brandId}`;
    try {
      const response = await API.get(url);
      setData(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  useEffect(() => {
    if (brandId) {
      getVideoList();
    }
  }, [brandId]);

  const { translations, loading } = useTranslations();
  if (loading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }

  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => index + 1,
      width: '100px'
    },
    {
      name: "Title",
      cell: (row: any) => row.title,
    },
    {
      name: "Description",
      cell: (row: any) => row.description,
      wrap: true
    },
    {
      cell: (row: any) => (
        <Link
          className="btn-purple text-sm h-auto p-2"
          href={row.video}
          rel="noopener noreferrer"
          target="_blank"
        >
          View Video
        </Link>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <Link href="/brand/dashboard" className="active">
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>Training Video</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* farmgroup start */}
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form">
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
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full min-h-screen flex justify-center items-center">
            <span>
              <Loader />
            </span>
          </div>
        )}
      </div>
    );
  }
};

export default videoGinnerList;
