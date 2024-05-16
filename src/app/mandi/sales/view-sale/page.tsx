"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import { TiTick } from "react-icons/ti";

import { FaDownload } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
export default function page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  useTitle("View Bags");
  const [roleLoading] = useRole();
  const [data, setData] = useState<any[]>([]);
  const [hasAccess, setHasAccess] = useState<any>({});

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { translations, loading } = useTranslations();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!roleLoading) {
      const access = checkAccess("Mandi Sale");
      if (access) setHasAccess(access);
    }
  }, [roleLoading]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, searchQuery, page, limit]);

  useEffect(() => {
    const isAdminData: any =
      sessionStorage.getItem("User") && localStorage.getItem("orgToken");
    if (isAdminData?.length > 0) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const response = await API.get(
        `mandi-process/sales/bag?saleId=${id}&search=${searchQuery}`
      );
      if (response.success) {
        setData(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const htmlPrint = (data: any) => {
    let html = "";
    for (let row of data) {
      const primarkBrand = row?.brands?.find(
        (item: any) => item.brand_name === "Primark"
      );

      html += ` 
      <div class="print-content">
        <div style="display:flex ;">
        <div>
                      <img src="/images/cottonconnect.png" alt="PADDY Connect Logo" style="width: 100px; height: auto; margin-right: 10px; margin-top: 60px; ">
                   </div>
                   <div class="image-container" style="display: flex; flex-direction: column; align-items: center;">
             <h2 class="h1-inline" style="font-weight: bold; font-size: 25px;">${primarkBrand ? primarkBrand.brand_name : ""
        } Sustainable PADDY Programme</h2>
        
            <table style="text-align: left ;  margin-top:20px; ">
          <tr>
            <td style="font-weight: bold;">DATE OF MANDI:</td>
            <td><span style="border-bottom: 1px solid black;">${row.sales?.date?.substring(
          0,
          10
        )}</span></td>
          </tr>
          <tr>
            <td style="font-weight: bold;">LOT NO:</td>
            <td><span style="border-bottom: 1px solid black;">${row.sales?.reel_lot_no ? row.sales?.reel_lot_no + "/" + row.sales?.sale_value : row.sales?.sale_value
        }</span></td>
          </tr>
          <tr>
            <td style="font-weight: bold;">MANDI  LOT NO/FACTORY LOT NO:</td>
            <td><span style="border-bottom: 1px solid black;">${row.sales?.lot_no
        }</span></td>
          </tr>
        </table>
        <h4 style="font-weight: bold; font-size: 20px">IMPLEMENTING PARTNER<br>RICETRACABILITY SOUTH ASIA PVT. LTD.</h4>
        <span style="font-weight: bold; font-size: 20px;">${data[0]?.sales?.mandi?.name
        }</span>
        </br>
        <span style="font-weight: 500; font-size: 18px">${data[0]?.sales?.mandi?.address
        }</span>
<table style="text-align: left;">
        <tr >
        <td style="font-weight: bold;">BAG ID:</td>
        <td><span style="border-bottom: 1px solid black;">${row.sales?.reel_lot_no ?
          row.sales?.reel_lot_no +
          "/" +
          row.sales?.sale_value +
          "/" +
          "00" +
          row?.bag_id
          :
          row.sales?.sale_value +
          "/" +
          "00" +
          row?.bag_id
        }</span></td>
      </tr> 
      </table>
        <div class="">
        <div class="qr-code style="text-align: left; ">
          <h6 style="font-size: 20px">Bag QR Code</h6>
          <img src="${process.env.NEXT_PUBLIC_API_URL + "file/" + row?.sales?.qr
        }">
        </div>
        <div class="qr-code">
          <h6 style="font-size: 20px">Sale QR Code</h6>
          <img src="${process.env.NEXT_PUBLIC_API_URL + "file/" + row.bag?.qr
        }">
        </div>
      </div>
      </div>
      </div>
      </div>`;
    }
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Print Page</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center; /* Center align all content */
        }
  
        .container {
          width: 100%; /* Print full width */
        }
  
        .print-content {
          page-break-after: always; /* Always start a new page after each item */
          padding: 5px; /* Add padding for spacing */
          border: 1px solid #ccc; /* Add border for visual separation */
          border-radius: 10px; /* Add rounded corners for visual appeal */
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Add shadow for depth */
          margin-bottom: 20px; /* Add spacing between printed items */
        }
  
        .image-container {
          display: flex;
          align-items: center;
          margin-top: 2px;
        }
  
        img {
          width: 100px;
          height: auto;
          margin-right: 10px;
          vertical-align: middle;
        }
  
          .qr-codes-container {
            display: flex;
            justify-content: space-between;
            margin-left: 40px;
            }

           .qr-code {
            text-align: center; /* Center the content horizontally */
             }

  
        .h4-inline {
          display: inline;
          margin-right: 10px;
        }
  
        @media print {
          body {
            margin: 0; /* Reset margin */
            padding: 0; /* Reset padding */
          }
  
          .container {
            margin: 0; /* Reset margin */
          }
  
          .print-content {
            border: none; /* Remove border for printing */
            box-shadow: none; /* Remove shadow for printing */
            margin-bottom: 0; /* Remove margin for printing */
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Your content here -->
        ${html}
      </div>
    </body>
    </html>`;
  };
  const htmlPrintAlla = (data: any) => {
    const primarkBrand = data?.brands?.find(
      (item: any) => item.brand_name === "Primark"
    );
    let html = "";

    // Print common details only once
    html += `
    <div style="display:flex ;">
    <div>
                  <img src="/images/cottonconnect.png" alt="Cotton Paddy Logo" style="width: 100px; height: auto; margin-right: 10px; margin-top: 60px; ">
               </div>
               <div class="image-container" style="display: flex; flex-direction: column; align-items: center;">
         <h2 class="h1-inline" style="font-weight: bold; font-size: 25px;">${primarkBrand ? primarkBrand.brand_name : ""
      } Sustainable Paddy Programme</h2>
 
        <table style="text-align: left ;  margin-top:20px; ">
          <tr>
            <td style="font-weight: bold;">DATE OF GINNING:</td>
            <td><span style="border-bottom: 1px solid black;">${data[0].sales?.date?.substring(
        0,
        10
      )}</span></td>
          </tr>
          <tr>
            <td style="font-weight: bold;">LOT NO:</td>
            <td><span style="border-bottom: 1px solid black;">${data[0].sales?.reel_lot_no ? data[0].sales?.reel_lot_no + "/" + data[0].sales?.sale_value : data[0].sales?.sale_value
      }</span></td>
          </tr>
          <tr>
            <td style="font-weight: bold;">MANDI LOT NO/FACTORY LOT NO:</td>
            <td><span style="border-bottom: 1px solid black;">${data[0].sales?.lot_no
      }</span></td>
          </tr>
        </table>
        <h4 style="font-weight: bold; font-size: 20px">IMPLEMENTING PARTNER<br>RiceTraceability SOUTH ASIA PVT. LTD.</h4>
        <span style="font-weight: bold; font-size: 20px;">${data[0]?.sales?.ginner?.name
      }</span>
        </br>
        <span style="font-weight: 500; font-size: 18px">${data[0]?.sales?.ginner?.address
      }</span>
        </div>
   </div>
        `;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      html += `
      <div style="display:flex ;">
      <div style="width: 110px;">
      </div>
          <div style="${i % 2 === 1 && i !== data.length - 1
          ? "page-break-after: always;"
          : ""
        }">
              <table style="text-align: left;">
                  <tr >
                      <td style="font-weight: bold;">BAG ID :</td>
                      <td><span style="border-bottom: 1px solid black;">${row.sales?.reel_lot_no
          ? row.sales?.reel_lot_no +
          "/" +
          row.sales?.sale_value +
          "/" +
          "00" +
          row?.bag_id
          : row.sales?.sale_value + "/" + "00" + row?.bag_id
        }</span></td>
                  </tr> 
              </table>
              <div class="qr-codes-container" >
                  <div class="qr-code" style="text-align: left;">
                      <h6 style="font-size: 20px">Bag QR Code </h6>
                      <img src="${process.env.NEXT_PUBLIC_API_URL + "file/" + row?.sales?.qr}">
                  </div>
                  <div class="qr-code">
                      <h6 style="font-size: 20px">Sale QR Code</h6>
                      <img src="${process.env.NEXT_PUBLIC_API_URL + "file/" + row.bag?.qr }">
                  </div>
              </div>
          </div>

          </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Print Page</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center; /* Center align all content */
            }
  
            .container {
              width: 100%; /* Print full width */
            }
  
            .print-content {
              page-break-after: always; /* Always start a new page after each item */
              padding: 5px; /* Add padding for spacing */
              border: 1px solid #ccc; /* Add border for visual separation */
              border-radius: 10px; /* Add rounded corners for visual appeal */
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Add shadow for depth */
              margin-bottom: 20px; /* Add spacing between printed items */
            }
  
            .image-container {
              display: flex;
              align-items: center;
              margin-top: 2px;
            }
  
            img {
              width: 100px;
              height: auto;
              margin-right: 10px;
              vertical-align: middle;
            }
  
            .qr-codes-container {
              display: flex;
              justify-content: space-between;
              // margin-left: 40px;
            }
  
            .qr-code {
              text-align: center; /* Center the content horizontally */
            }
  
            .h4-inline {
              display: inline;
              margin-right: 10px;
            }
  
            @media print {
              body {
                margin: 0; /* Reset margin */
                padding: 0; /* Reset padding */
              }
  
              .container {
                margin: 0; /* Reset margin */
              }
  
              .print-content {
                border: none; /* Remove border for printing */
                box-shadow: none; /* Remove shadow for printing */
                margin-bottom: 0; /* Remove margin for printing */
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
          <div class="print-content">

            <!-- Your content here -->
            ${html}
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintAll = async (data: any[]) => {
    const printWindow = window.open("", "", "width=600,height=600");
    if (printWindow) {
      printWindow.document.open();
      const formData = {
        printData: data.map((row) => ({
          id: row.id,
          print: true,
        })),
      };
      const url = "mandi-process/sales/update-bag";
      try {
        const response = await API.put(url, formData);
        if (response.success) {
          fetchData();
        }
      } catch (error) {
        console.log(error, "error");
      }
      let html = htmlPrintAlla(data);
      printWindow.document.write(html);

      setTimeout(function () {
        printWindow.print();
        printWindow.close();
      }, 2000);
    } else {
      alert(
        "Pop-up blocker prevented the print window from opening. Please disable the pop-up blocker and try again."
      );
    }
  };

  const handlePrint = async (row: any) => {
    const printWindow = window.open("", "", "width=600,height=600");
    if (printWindow) {
      printWindow.document.open();
      const formData = {
        printData: [
          {
            id: row.id,
            print: true,
          },
        ],
      };
      const url = "mandi-process/sales/update-bag";
      try {
        const response = await API.put(url, formData);
        if (response.success) {
          fetchData();
        }
      } catch (error) {
        console.log(error, "error");
      }
      let ltml = htmlPrint([row]);
      printWindow.document.write(ltml);

      setTimeout(function () {
        printWindow.print();
        printWindow.close();
      }, 2000);
    } else {
      alert(
        "Pop-up blocker prevented the print window from opening. Please disable the pop-up blocker and try again."
      );
    }
  };

  const handleReEnabled = async (data: any[]) => {
    const formData = {
      printData: data.map((row) => ({
        id: row.id,
        print: false,
      })),
    };
    const url = "mandi-process/sales/update-bag";
    try {
      const response = await API.put(url, formData);
      if (response.success) {
        fetchData();
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleSingleReEnabled = async (row: any) => {
    const formData = {
      printData: [
        {
          id: row.id,
          print: false,
        },
      ],
    };
    const url = "mandi-process/sales/update-bag";
    try {
      const response = await API.put(url, formData);
      if (response.success) {
        fetchData();
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">S. No</p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Bag No</p>,
      selector: (row: any) => row?.bag?.bag_no,
    },
    {
      name: <p className="text-[13px] font-medium">Weight</p>,
      selector: (row: any) => row?.bag?.weight,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations?.mandiInterface?.qrCode}
        </p>
      ),
      cell: (row: any) => (
        <>
          <div className="h-16 flex">
            <img
              className=""
              src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.bag?.qr}
            />

            <button
              className=""
              onClick={() =>
                handleDownload(
                  process.env.NEXT_PUBLIC_API_URL + "file/" + row?.bag?.qr,
                  "qr",
                  ".png"
                )
              }
            >
              <FaDownload size={18} color="black" />
            </button>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: <p className="text-[13px] font-medium">Action</p>,
      width: "200px",
      cell: (row: any) => (
        <>
          {row.print ? (
            <div className="flex items-center">
              <div className="flex items-center mr-1">
                <TiTick className="text-green-600 text-xl" />
                <span>Printed</span>
              </div>
              {isAdmin && (
                <button
                  className=" py-1.5 px-2 rounded bg-yellow-500 text-white font-bold text-sm"
                  onClick={() => handleSingleReEnabled(row)}
                >
                  Re-enable
                </button>
              )}
            </div>
          ) : (
            <button
              className="btn btn-all btn-purple"
              onClick={() => handlePrint(row)}
            >
              Print
            </button>
          )}
        </>
      ),
    },
  ].filter(Boolean);

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const printValues = data?.map((item) => item?.print);

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !hasAccess?.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.view) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <NavLink href="/mandi/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/mandi/sales">Sale</NavLink>
                </li>
                <li>View Bags</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form ">
              <div className="table-minwidth w-100">
                {/* search */}
                <div className="search-filter-row">
                  <div className="search-filter-left ">
                    <div className="search-bars">
                      <h6>
                        <span className="mr-2">Bag Lot No.</span>{" "}
                        {data[0]?.sales?.lot_no}
                      </h6>
                      <form className="form-group mb-0 search-bar-inner mt-3">
                        <input
                          type="text"
                          className="form-control form-control-new jsSearchBar "
                          placeholder="Search "
                          value={searchQuery}
                          onChange={searchData}
                        />
                        <button type="submit" className="search-btn">
                          <span className="icon-search"></span>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* <div className="customButtonGroup flex justify-end space-x-4">
                    <button
                      className="btn btn-all btn-purple"
                      onClick={() => handlePrintAll(data)}
                    >
                      Print All
                    </button>
                    <button
                      className="btn-outline-purple"
                      onClick={() => router.back()}
                    >
                      Go Back
                    </button>
                  </div> */}

                  <div className="flex items-center">
                    <div className="flex">
                      {data.some((item) => item?.print === false) ? (
                        <button
                          className="py-1.5 px-4 rounded bg-[#d15e9c] text-white font-bold text-sm"
                          onClick={() => handlePrintAll(data)}
                        >
                          Print All
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          {
                            isAdmin && (
                              <div className="flex items-center">
                                <TiTick className="text-green-600 text-xl" />
                                <span className="text-sm">Printed</span>
                              </div>
                            )
                            // :
                            // <button
                            //   className="py-1.5 px-4 rounded bg-[#d15e9c] text-white font-bold text-sm"
                            //   onClick={() => handlePrintAll(data)}
                            // >
                            //   Print All
                            // </button>
                          }

                          {isAdmin && (
                            <button
                              className="py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                              onClick={() => handleReEnabled(data)}
                            >
                              Re-enable
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      className="py-1.5 px-4 rounded border-[1px] border-[#d15e9c] text-[#d15e9c] font-medium text-sm ml-2"
                      onClick={() => router.push("/mandi/sales")}
                    >
                      Go Back
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
      </>
    );
  }
}
