"use client";
import { useState, useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "next/link";
import DataTable from "react-data-table-component";
import User from "@lib/User";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";

const videoMandiList: React.FC = () => {
    useTitle("TraceBale Training Videos");
    const [roleLoading, hasAccess] = useRole();
    const router = useRouter();
    const mandiId = User.MandiId;
    const [Access, setAccess] = useState<any>({});


    const [isClient, setIsClient] = useState(false);
    const [data, setData] = useState([])


    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Mandi")) {
          const access = checkAccess("Training Video");
          if (access) setAccess(access);
        }
      }, [roleLoading,hasAccess]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getVideoList = async () => {
        const url = `video?processor=Mandi&mandiId=${mandiId}`
        try {
            const response = await API.get(url)
            setData(response.data)
        }
        catch (error) {
            console.log(error, "error")
        }
    };

    useEffect(() => {
        if (mandiId) {
            getVideoList()
        }
    }, [mandiId]);


    const { translations, loading } = useTranslations();

    const columns = [
        {
            name: translations?.common?.srNo,
            cell: (row: any, index: any) => index + 1,
        },
        {
            name: "Title",
            cell: (row: any) => row?.title,

        },
        {
            name: "Description",
            cell: (row: any) => row?.description,
        },
        {
            cell: (row: any) => (
                <Link className="btn-purple text-sm h-auto p-2" href={row?.video} rel="noopener noreferrer" target="_blank">
                    View Video
                </Link>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
        },
    ];

    if (loading || roleLoading) {
        return (
          <div>
            <Loader />
          </div>
        );
      }

    if (!roleLoading && !Access.view) {
        return (
          <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
            <h3>You doesn't have Access of this Page.</h3>
          </div>
        );
      }
      
      if (!roleLoading && Access?.view) {
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
                                        <li>Video</li>
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
                                            noDataComponent={<p className="py-3 font-bold text-lg">
                                                No data available in table
                                            </p>}
                                            fixedHeaderScrollHeight='auto'
                                            columns={columns}
                                            data={data} />
                                    </div>
                                </div>
                            </div>
                        </div>

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

export default videoMandiList;

