"use client"
import PageHeader from "@components/core/PageHeader";
import React, { useEffect, useState } from 'react'

import Link from "@components/core/nav-link";
import CommonDataTable from "@components/core/Table";

import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from 'next/navigation';

interface TableData {
  id: number;
  deviceid: string;
  staffname: string;
  usermapped: string;
  status: boolean;


}


const data: TableData[] = [
  {
    id: 1,
    deviceid: "bf0f8115fe523acf",
    staffname: "vignesh",
    usermapped: "Vignesh",
    status: true

  },
  {
    id: 2,
    deviceid: "bf0f8115fe523acf",
    staffname: "vignesh",
    usermapped: "Vignesh",
    status: false
  },
  {
    id: 3,

    deviceid: "bf0f8115fe523acf",
    staffname: "vignesh",
    usermapped: "Vignesh",
    status: true,
  },
  {
    id: 4,

    deviceid: "bf0f8115fe523acf",
    staffname: "vignesh",
    usermapped: "Vignesh",
    status: false,
  },
  {
    id: 5,

    deviceid: "bf0f8115fe523acf",
    staffname: "vignesh",
    usermapped: "Vignesh",
    status: true,
  },

];
const columns = [
  {
    name: "SR. NO",
    selector: (row: TableData) => row.id,
    sortable: false,
  },
  {
    name: "Device Id",
    selector: (row: TableData) => row.deviceid,
    sortable: false,
  },
  {
    name: "Staff Name",
    selector: (row: TableData) => row.staffname,
    sortable: false,
  },
  {
    name: "User Mapped",
    selector: (row: TableData) => row.usermapped,
    sortable: false,
  }, {
    name: "Status",
    cell: (row: TableData) => (
      <span className={row.status ? "text-green-500" : "text-red-500"}>
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
    name: "Action",
    cell: (row: TableData) => (
      <>
        <Link href={`/edit/${row.id}`}>
          <LuEdit size={20} className="mr-4" />
        </Link>
        <button >
          <AiFillDelete size={20} className="mr-4" />
        </button>
      </>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
  },


];

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  const router = useRouter()
  useEffect(() => {
    setIsClient(true);

  }, []);
  const handleUnRegister = () => {
    router.push('/settings/device-management/unregister-devices');
  }
  return (
    <div className="p-5">
      <PageHeader />
      {isClient ? (
        <>
          <div className="flex justify-end mt-4 px-2 space-x-3">
            <button className="bg-green-500 rounded text-white px-2 py-2 text-sm">Registered Devices</button>
            <button className="bg-gray-300 rounded text-black px-2 py-2 text-sm" onClick={handleUnRegister}>Unregistered Devices</button>
          </div>
          {/* <CommonDataTable columns={columns} data={data} /> */}
        </>
      ) : ("loading")}
    </div>


  );
}
