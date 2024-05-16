"use client"
import React, { useEffect, useState } from 'react'
import useTitle from '@hooks/useTitle'
import useRole from '@hooks/useRole'
import Link from '@components/core/nav-link';
import { useRouter } from '@lib/router-events';
import { useSearchParams } from 'next/navigation';
import DataTable from 'react-data-table-component'
import moment from 'moment'
import API from '@lib/Api'
import Loader from '@components/core/Loader'
import checkAccess from '@lib/CheckAccess'

export default function page() {
  const router = useRouter()
  const [roleLoading,hasAccess] = useRole()
  const search = useSearchParams()
  const id = search.get('id');
  useTitle("Dyeing/Other Process Information")
  const [Access, setAccess] = useState<any>({});

  const [data, setData] = useState<any[]>([]);


  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
      const access = checkAccess("Weaver Process");
      if (access) setAccess(access);
    }
  }, [roleLoading,hasAccess]);

  useEffect(() => {
    if (id) {
      getDyingProcessData()
    }
  }, [])

  const getDyingProcessData = async () => {
    const url = `weaver-process/get-dyeing?id=${id}`
    try {
      const response = await API.get(url)
      setData([response.data])
    }
    catch (error) {
      console.log(error, "error")
    }
  };

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted
  }

  const columns = [
    {
      name: "Date",
      selector: (row: any) => dateFormatter(row.date),
    },
    {
      name: "Processor Name",
      selector: (row: any) => row.processor_name,
    },
    {
      name: "Process Type",
      selector: (row: any) => row.process_name,
    },
    {
      name: "Received Fabric Weight",
      selector: (row: any) => row.net_yarn,
    },
    {
      name: "Delivered fabric weight",
      selector: (row: any) => row.yarn_delivered,
    },
  ];

  if (roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access?.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  
  if (!roleLoading && Access?.view) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href="/weaver/dashboard" className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>
                  <Link href="/weaver/weaver-process" className="active">
                    Process
                  </Link>
                </li>
                <li>Dyeing/Other Process Information</li>

              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6" />

        <div>
          <DataTable
            persistTableHead
            fixedHeader={true}
            fixedHeaderScrollHeight='auto'
            columns={columns}
            data={data}
          />
        </div>

        <div className="flex justify-end mt-3 customButtonGroup">
          <button
            className="btn-purple"
            onClick={() => router.push("/weaver/weaver-process")}
          >
            Go Back
          </button>
        </div>
      </>
    )
  }
}

