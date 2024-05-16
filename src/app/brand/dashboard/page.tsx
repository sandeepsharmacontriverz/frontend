// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import Slider from "react-slick";
// import NavLink from "@components/core/nav-link";
// import DataTable from "react-data-table-component";
// import { FaDownload, FaEye } from "react-icons/fa";

// import Loader from "@components/core/Loader";
// import CommonDataTable from "@components/core/Table";
// import ConfirmPopup from "@components/core/ConfirmPopup";
// import { handleDownload } from "@components/core/Download";

// import useRole from "@hooks/useRole";
// import useTitle from "@hooks/useTitle";
// import useTranslations from "@hooks/useTranslation";
// import Chart from "@components/charts/Chart";
// import API from "@lib/Api";
// import User from "@lib/User";
// import Select, { GroupBase } from "react-select";

// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// var settings = {
//   dots: false,
//   infinite: true,
//   speed: 500,
//   slidesToShow: 7,
//   slidesToScroll: 1,
//   arrows: false,
//   responsive: [
//     {
//       breakpoint: 1200,
//       settings: {
//         slidesToShow: 4,
//         slidesToScroll: 1,
//         infinite: true,
//         dots: true,
//       },
//     },
//     {
//       breakpoint: 1024,
//       settings: {
//         slidesToShow: 3,
//         slidesToScroll: 1,
//         infinite: true,
//         dots: true,
//       },
//     },
//     {
//       breakpoint: 768,
//       settings: {
//         slidesToShow: 2,
//         slidesToScroll: 1,
//         dots: true,
//         autoplay: true,
//         autoplaySpeed: 4000,
//       },
//     },
//     {
//       breakpoint: 480,
//       settings: {
//         slidesToShow: 1,
//         slidesToScroll: 1,
//         dots: true,
//         autoplay: true,
//         autoplaySpeed: 4000,
//       },
//     },
//   ],
// };

// export default function dashboard() {
//   const [roleLoading, hasAccess] = useRole();
//   const { translations, loading } = useTranslations();

//   const [value, setValue] = useState<any>("");
//   const [count, setCount] = useState<any>();
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [data, setData] = useState<any>([]);
//   const [graphData, setGraphData] = useState<any>([]);
//   const [seasons, setSeasons] = useState<any>([]);
//   const [isProcessed, setIsProcessed] = useState(false);
//   const [isClear, setIsClear] = useState(false);
//   const [isConfirm, setIsConfirm] = useState<any>(false);
//   const [showInvoiceList, setShowInvoiceList] = useState(false);
//   const [showConfirmPopup, setShowConfirmPopup] = useState(false);
//   const [dataInvoiceList, setDataInvoiceList] = useState<Array<string>>([]);
//   const [showInvoiceAlert, setShowInvoiceAlert] = useState(false);
//   const [dataInvoiceAlert, setDataInvoiceAlert] = useState<Array<string>>([]);
//   const [totalQuantity, setTotalQuantity] = useState(0);
//   const [dataList, setDataList] = useState<any>([]);
//   const [dataAlert, setDataAlert] = useState([]);
//   const [selectAllChecked, setSelectAllChecked] = useState(false);
//   const [selectedRows, setSelectedRows] = useState<any>({});

//   const code = encodeURIComponent(searchQuery);

//   const brandId = User.brandId;

//   useTitle(translations?.sidebar?.dashboard ? translations?.sidebar?.dashboard : '');

//   useEffect(() => {
//     getSeasons();
//   }, []);

//   const loadScript = (src: any) => {
//     return new Promise((resolve, reject) => {
//       const script = document.createElement('script');
//       script.src = src;
//       script.onload = resolve;
//       script.onerror = reject;
//       document.head.appendChild(script);
//     });
//   }
//   async function loadScriptsSequentially() {
//     try {
//       const gsapScript = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js');
//       if (gsapScript) {
//         await loadScript('/js/MotionPathPlugin.min.js');
//         await loadScript('/js/Animate.js');
//       } else {
//         throw new Error('Failed to load GSAP.');
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   useEffect(() => {
//     loadScriptsSequentially();
//   }, [isProcessed])

//   useEffect(() => {
//     if (brandId) {
//       getDashboardData();
//     }
//   }, [value, brandId]);


//   useEffect(() => {
//     const atLeastOneSelected =
//       Object.values(selectedRows).some(
//         (value) => value === "accept" || value === "reject"
//       ) || selectAllChecked;

//     setIsConfirm(atLeastOneSelected);
//   }, [selectedRows, selectAllChecked]);

//   useEffect(() => {
//     if (brandId) {
//       fetchAlertData();
//     }
//   }, [isClear, brandId]);

//   useEffect(() => {
//     if (brandId) {
//       fetchTransActionList();
//     }
//   }, [searchQuery, page, limit, isClear, brandId]);


//   const getSeasons = async () => {
//     const url = "season?limit=10&page=1&pagination=true&search=&sort=desc";
//     try {
//       const result = await API.get(url);
//       setSeasons(result.data);
//     } catch (error) {
//       console.log(error, "error");
//     }
//   };

//   const getDashboardData = async () => {
//     if (brandId) {
//       const url = value !== undefined ? `brand-interface/organic-cotton-overview?brandId=${brandId}&seasonId=${value}` : `brand-interface/organic-cotton-overview?brandId=${brandId}&seasonId=`;
//       // const url = `brand-interface/organic-cotton-overview?brandId=${brandId}&seasonId=${value}`;
//       try {
//         const result = await API.get(url);
//         if (result.success) {
//           setIsProcessed(true);
//           setData(result.data);
//           setGraphData(result.data?.graph);
//         } else {
//           setIsProcessed(true);
//         }
//       } catch (error) {
//         setIsProcessed(true);
//         console.log(error, "error");
//       }
//     }
//   };

//   const fetchAlertData = async () => {
//     const url = `brand-interface/transactions?brandId=${brandId}&status=Pending`;
//     try {
//       const response = await API.get(url);
//       setDataAlert(response.data);
//       const quantity = response?.data?.map((qty: any) => {
//         return Number(qty.total_no_of_pieces ? qty.total_no_of_pieces : qty.total_no_of_pieces)
//       });
//       const sum = quantity?.reduce(
//         (accumulator: any, currentValue: any) => accumulator + currentValue,
//         0
//       );
//       setTotalQuantity(sum)
//     } catch (error) {
//       console.log(error, "error");
//     }
//   };

//   const fetchTransActionList = async () => {
//     const url = `brand-interface/transactions?brandId=${brandId}&status=Sold&search=${code}&page=${page}&limit=${limit}&pagination=true`;

//     try {
//       const response = await API.get(url);
//       const newData = response.data.map((item: any, index: number) => ({
//         ...item,
//         id: index,
//         processId: item.id,
//       }));
//       setDataList(newData);
//       setCount(response.count);
//     } catch (error) {
//       console.log(error, "error");
//       setCount(0);
//     }
//   };

//   if (loading || !isProcessed) {
//     return (
//       <div>
//         <Loader />
//       </div>
//     );
//   }

//   const handleSelectAllChange = () => {
//     setSelectAllChecked(!selectAllChecked);
//     const updatedSelectedRows: any = {};
//     if (!selectAllChecked) {
//       dataAlert?.forEach((dataAlert: any) => {
//         updatedSelectedRows[dataAlert.id] = "accept";
//       });
//     }
//     setSelectedRows(updatedSelectedRows);
//   };

//   const handleAcceptRejectChange = (rowId: any, value: any) => {
//     const updatedSelectedRows = { ...selectedRows, [rowId]: value };
//     setSelectedRows(updatedSelectedRows);
//     setSelectAllChecked(false);
//   };

//   const handleToggleFilter = (rowData: Array<string>) => {
//     setDataInvoiceList(rowData);
//     setShowInvoiceList(!showInvoiceList);
//   };

//   const handleToggleAlertFilter = (rowData: Array<string>) => {
//     setDataInvoiceAlert(rowData);
//     setShowInvoiceAlert(!showInvoiceAlert);
//   };

//   const handleView = (url: string) => {
//     window.open(url, "_blank");
//   };

//   const handleDownloadData = async (url: string, fileName: string) => {
//     try {
//       const response = await fetch(url);
//       const blob = await response.blob();

//       const blobURL = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = blobURL;
//       link.download = fileName;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       URL.revokeObjectURL(blobURL);
//     } catch (error) {
//       console.error("Error downloading document:", error);
//     }
//   };

//   const DocumentPopup = ({ openFilter, dataInvoice, dataInvList, onClose, type }: any) => {
//     const popupRef = useRef<HTMLDivElement>(null);
//     const fileName = (item: any) => {
//       let file = item.split("file/");
//       return file ? file[1] : "";
//     };

//     const columnsArr: any = [
//       {
//         name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
//         width: "70px",
//         cell: (row: any, index: any) => index + 1,
//       },
//       {
//         name: <p className="text-[13px] font-medium">{translations?.knitterInterface?.File}</p>,
//         cell: (row: any, index: any) => fileName(row),
//       },
//       {
//         name: <p className="text-[13px] font-medium">{translations?.common?.Action}</p>,
//         selector: (row: any) => (
//           <>
//             <div className="flex items-center">
//               <FaEye
//                 size={18}
//                 className="text-black  hover:text-blue-600 cursor-pointer mr-2"
//                 onClick={() => handleView(row)}
//               />
//               <FaDownload
//                 size={18}
//                 className="text-black  hover:text-blue-600 cursor-pointer"
//                 onClick={() => handleDownloadData(row, "Cotton-connect|Invoice File")}
//               />
//             </div>
//           </>
//         ),
//         center: true,
//         wrap: true,
//       },
//     ];

//     return (
//       <div>
//         {openFilter && (
//           <>
//             <div
//               ref={popupRef}
//               className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
//             >
//               <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
//                 <div className="flex justify-between align-items-center">
//                   <h3 className="text-lg pb-2">{translations?.common?.InVoiceFiles}</h3>
//                   <button
//                     className="text-[20px]"
//                     onClick={() => type === "List" ? setShowInvoiceList(!showInvoiceList) : setShowInvoiceAlert(!showInvoiceAlert)}
//                   >
//                     &times;
//                   </button>
//                 </div>
//                 <div className="w-100 mt-0">
//                   <div className="customFormSet">
//                     <div className="w-100">
//                       <div className="row">
//                         <DataTable
//                           columns={columnsArr}
//                           data={type === "List" ? dataInvList : dataInvoice}
//                           persistTableHead
//                           fixedHeader={true}
//                           noDataComponent={"No data available in table"}
//                           fixedHeaderScrollHeight="600px"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     );
//   };

//   const columnList = [
//     {
//       name: <p className="text-[13px] font-medium">S. No </p>,
//       width: '70px',
//       cell: (row: any, index: any) => index + 1,
//       wrap: true,
//       sortable: false,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Date </p>,
//       selector: (row: any) => row.date.substring(0, 10),
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Season </p>,
//       selector: (row: any) => row.season?.name,
//       wrap: true,
//       sortable: false,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Garment Name </p>,
//       selector: (row: any) => row.garment.name,
//       wrap: true,
//       sortable: false,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Fabric Order Reference No </p>,
//       selector: (row: any) => row.fabric_order_ref,
//       sortable: false,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Brand Reference No </p>,
//       selector: (row: any) => row.brand_order_ref,
//       sortable: false,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Total No of pieces </p>,
//       selector: (row: any) => row.total_no_of_pieces,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Total No of Boxes </p>,
//       selector: (row: any) => row.total_no_of_boxes,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Program </p>,
//       selector: (row: any) => row.program?.program_name,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Invoice No </p>,
//       selector: (row: any) => row.invoice_no,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">{translations?.common?.tcFiles}</p>,
//       center: true,
//       cell: (row: any) =>
//         row.tc_file && (
//           <>
//             <FaEye
//               size={18}
//               className="text-black hover:text-blue-600 cursor-pointer"
//               onClick={() => handleView(row.tc_file)}
//             />
//             <FaDownload
//               size={18}
//               className="text-black hover:text-blue-600 cursor-pointer ml-2"
//               onClick={() => handleDownloadData(row.tc_file, "Tc File")}
//             />
//           </>
//         ),
//     },
//     {
//       name: <p className="text-[13px] font-medium">{translations?.common?.ContractFiles} </p>,
//       center: true,
//       cell: (row: any) =>
//         row.contract_file && (
//           <>
//             <FaEye
//               size={18}
//               className="text-black hover:text-blue-600 cursor-pointer"
//               onClick={() => handleView(row.contract_file)}
//             />
//             <FaDownload
//               size={18}
//               className="text-black hover:text-blue-600 cursor-pointer ml-2"
//               onClick={() =>
//                 handleDownloadData(row.contract_file, "Contract File")
//               }
//             />
//           </>
//         ),
//     },
//     {
//       name: <p className="text-[13px] font-medium">{translations?.common?.InVoiceFiles}</p>,
//       center: true,
//       cell: (row: any) =>
//         row.invoice_files &&
//         row.invoice_files.length > 0 && (
//           <>
//             <FaEye
//               size={18}
//               className="text-black hover:text-blue-600 cursor-pointer mr-2"
//               onClick={() => handleToggleFilter(row.invoice_files)}
//               title="Click to View All Files"
//             />
//           </>
//         ),
//     },
//     {
//       name: <p className="text-[13px] font-medium">{translations?.common?.DeliveryNotes}</p>,
//       center: true,
//       cell: (row: any) =>
//         row.delivery_notes && (
//           <>
//             <FaEye
//               size={18}
//               className="text-black hover:text-blue-600 cursor-pointer"
//               onClick={() => handleView(row.delivery_notes)}
//             />
//             <FaDownload
//               size={18}
//               className="text-black hover:text-blue-600 cursor-pointer ml-2"
//               onClick={() =>
//                 handleDownloadData(row.delivery_notes, "Delivery Notes")
//               }
//             />
//           </>
//         ),
//     },
//     {
//       name: translations?.mandiInterface?.qrCode,
//       center: true,
//       cell: (row: any) => (
//         <div className="h-16 flex">
//           <img
//             className=""
//             src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
//           />

//           <button
//             className=""
//             onClick={() =>
//               handleDownload(
//                 process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
//                 "qr",
//                 ".png"
//               )
//             }
//           >
//             <FaDownload size={18} color="black" />
//           </button>
//         </div>
//       ),
//       ignoreRowClick: true,
//       allowOverflow: true,
//     },

//   ];

//   const columnsAlert = [
//     {
//       name: <p className="text-[13px] font-medium">S. No </p>,
//       width: '70px',
//       cell: (row: any, index: any) => index + 1,
//       wrap: true,
//       sortable: false,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Date </p>,
//       selector: (row: any) => row.date.substring(0, 10),
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Season </p>,
//       selector: (row: any) => row.season?.name,
//       wrap: true,
//       sortable: false,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Garment Name </p>,
//       selector: (row: any) => row.garment.name,
//       wrap: true,
//       sortable: false,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Fabric Order Reference No </p>,
//       selector: (row: any) => row.fabric_order_ref,
//       sortable: false,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Brand Reference No </p>,
//       selector: (row: any) => row.brand_order_ref,
//       sortable: false,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Total No of pieces </p>,
//       selector: (row: any) => row.total_no_of_pieces,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Total No of Boxes </p>,
//       selector: (row: any) => row.total_no_of_boxes,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Program </p>,
//       selector: (row: any) => row.program?.program_name,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">Invoice No </p>,
//       selector: (row: any) => row.invoice_no,
//       wrap: true,
//     },
//     {
//       name: <p className="text-[13px] font-medium">{translations?.common?.InVoiceFiles}</p>,
//       center: true,
//       cell: (row: any) =>
//         row?.invoice_files &&
//         row?.invoice_files.length > 0 && (
//           <>
//             <FaEye
//               size={18}
//               className="text-black hover:text-blue-600 cursor-pointer mr-2"
//               onClick={() => handleToggleAlertFilter(row?.invoice_files)}
//               title="Click to View All Files"
//             />
//           </>
//         ),
//     },
//     {
//       name: translations?.mandiInterface?.qrCode,
//       center: true,
//       cell: (row: any) => (
//         <div className="h-16 flex">
//           <img
//             className=""
//             src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
//           />

//           <button
//             className=""
//             onClick={() =>
//               handleDownload(
//                 process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
//                 "qr",
//                 ".png"
//               )
//             }
//           >
//             <FaDownload size={18} color="black" />
//           </button>
//         </div>
//       ),
//       ignoreRowClick: true,
//       allowOverflow: true,
//     },

//     {
//       name: (
//         <div className="flex justify-between ">
//           {" "}
//           <input
//             name="view"
//             type="checkbox"
//             className="mr-2"
//             onChange={handleSelectAllChange}
//             checked={selectAllChecked}
//           />
//           Accept All{" "}
//         </div>
//       ),

//       cell: (row: any) => (
//         <div className="flex flex-wrap gap-2">
//           <label>
//             <input
//               type="radio"
//               name={`acceptReject_${row.id}`}
//               value="accept"
//               checked={selectedRows[row.id] === "accept"}
//               onChange={() => handleAcceptRejectChange(row.id, "accept")}
//               className="mr-2"

//             />
//             Accept
//           </label>
//           <label>
//             <input
//               type="radio"
//               name={`acceptReject_${row.id}`}
//               value="reject"
//               checked={selectedRows[row.id] === "reject"}
//               onChange={() => handleAcceptRejectChange(row.id, "reject")}
//               className="mr-2"

//             />
//             Reject
//           </label>
//         </div>
//       ),
//       sortable: false,
//       width: "180px"

//     },
//   ];

//   const updatePageList = (page: number = 1, limitData: number = 10) => {
//     setPage(page);
//     setLimit(limitData);
//   };

//   const searchData = (e: any) => {
//     setSearchQuery(e.target.value);
//   };

//   const handleYearSelect = (name?: any, value?: any, event?: any) => {
//     setValue(value);
//   };

//   const handleConfirmActions = async () => {
//     try {
//       const acceptedRowIds = Object.keys(selectedRows).filter(
//         (rowId) => selectedRows[rowId] === "accept"
//       );
//       const rejectedRowIds = Object.keys(selectedRows).filter(
//         (rowId) => selectedRows[rowId] === "reject"
//       );

//       const acceptedUpdateRequests = acceptedRowIds?.map((rowId) => {
//         const item: any = dataAlert.find((row: any) => row.id == rowId);

//         return {
//           id: Number(rowId),
//           status: "Sold"
//         };
//       });

//       const rejectedUpdateRequests = rejectedRowIds?.map((rowId) => {
//         const item: any = dataAlert.find((row: any) => row.id == rowId);

//         return {
//           id: Number(rowId),
//           status: "Rejected"
//         };
//       });

//       const updateRequests = [
//         ...acceptedUpdateRequests,
//         ...rejectedUpdateRequests,
//       ];

//       const url = "brand-interface/update-transaction";

//       const dataToSend = {
//         items: updateRequests,
//       };

//       const response = await API.put(url, dataToSend);
//       if (response.success) {
//         const updatedDataAlert = dataAlert?.filter(
//           (row: any) =>
//             !acceptedRowIds.includes(row.id) && !rejectedRowIds.includes(row.id)
//         );
//         setDataAlert(updatedDataAlert);
//         setShowConfirmPopup(!showConfirmPopup)
//         setSelectedRows({});
//         setSelectAllChecked(false);

//         const acceptedRows = dataAlert?.filter((row: any) =>
//           acceptedRowIds.includes(row.id)
//         );
//         const rejectedRows = dataAlert?.filter((row: any) =>
//           rejectedRowIds.includes(row.id)
//         );
//         const updatedDataList = [...dataList, ...acceptedRows, ...rejectedRows];
//         setDataList(updatedDataList);

//         fetchAlertData();
//         fetchTransActionList();
//       } else {
//         console.error("Failed to update statuses");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };



//   const series = graphData?.map((item: any) => {
//     return {
//       type: "column",
//       name: item.season.name,
//       data: [
//         parseFloat(item.total_farmers),
//         parseFloat(item.total_area),
//         parseFloat(item.total_expected_yield) / 1000,
//       ],
//     };
//   });


//   const formatDecimal = (value: string | number): string | number => {
//     const numericValue = typeof value === 'string' ? parseFloat(value) : value;

//     if (Number.isFinite(numericValue)) {
//       const formattedValue = numericValue % 1 === 0 ? numericValue.toFixed(0) : numericValue.toFixed(2);
//       return formattedValue.toString().replace(/\.00$/, '');
//     }

//     return numericValue;
//   };

//   if (loading || roleLoading) {
//     return (
//       <div>
//         <Loader />
//       </div>
//     );
//   }

//   if (!roleLoading && !hasAccess?.processor?.includes("Brand")) {
//     return (
//       <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
//         <h3>You doesn't have Access of this Page.</h3>
//       </div>
//     );
//   }

//   if (!roleLoading && hasAccess?.processor?.includes("Brand")) {
//     return (
//       <div>
//         <div className="breadcrumb-box">
//           <div className="breadcrumb-inner light-bg">
//             <div className="breadcrumb-left">
//               <ul className="breadcrum-list-wrap">
//                 <li className="active">
//                   <NavLink href="/brand/dashboard">
//                     <span className="icon-home"></span>
//                   </NavLink>
//                 </li>
//                 <li>{translations?.common?.brand}</li>
//                 <li> {translations?.sidebar?.dashboard}</li>
//               </ul>
//             </div>
//           </div>
//         </div>
      
//         <div className="farm-group-box">
//           <div className="farm-group-inner">
//             <div className="table-form">
//               <div className="mb-4">
//                 <div className="select-season-box">
//                   <div className="select-wrapper">
//                     <div className="custom-select2">
//                       <Select
//                         aria-label="Default select example"
//                         className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
//                         name="seasonId"
//                         value={value ? { label: seasons?.find((seasonId: any) => seasonId.id == value)?.name, value: value } : null}
//                         menuShouldScrollIntoView={false}
//                         isClearable
//                         placeholder="Select a Year"
//                         options={(seasons || []).map(({ id, name }: any) => ({
//                           label: name,
//                           value: id,
//                           key: id
//                         }))}
//                         onChange={(item: any) => {
//                           handleYearSelect("seasonId", item?.value);
//                         }}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* <div className="py-[170px] lg:pt-[80px] lg:pb-[160px] flex text-center relative flex-col bg-[#0F265C] justify-center svgSelectionCZ">
//           <svg className="absolute w-full lg:block lg:bottom-[69px] hidden lg:left-0 lg:right-0 m-auto"
//             xmlns="http://www.w3.org/2000/svg" width={1303} height={490} viewBox="0 0 1303 490" fill="none">
//             <path className="path" opacity="0.7"
//               d="M301 0.5L65.8178 123.543L155.368 167.759L2 251.679L328.294 424.932L469.311 346.427L651.5 449.5L725.611 402.373L887.214 489L1253.65 304.016L1141.46 236.339L1301 156.028L1015 6.5" stroke="#94A5CC" />
//             <image className="arrow" xlinkHref="/images/glos.svg" />
//           </svg>
//           <img alt="Ellipse" className="absolute top-0 h-full left-0 bottom-0 right-0 m-auto" src="/images/Ellipse.png" />
//           <div className="newBannerTooltip hidden absolute lg:block left-0  right-[50px] m-auto">
//             <img src="/images/new-banner-1.png" />
//             <div className="hubTooltip">
//               <div className="tool1 brand-tooltip">
//                 <div>
//                   <p>{translations?.dashboard?.farmers}</p>
//                   <p>{data?.total_farmers
//                     ? data?.total_farmers + " " + translations?.dashboard?.farmer
//                     : "0 Farmer"}</p>
//                 </div>
//               </div>
//               <div className="tool2 brand-tooltip">
//                 <div>
//                   <p>{translations?.dashboard?.expectedCotton}</p>
//                   <p>{formatDecimal(Number(data?.total_procured) / 1000) + " " + translations?.dashboard?.mt}{" "}</p>
//                 </div>
//               </div>
//               <div className="tool3 brand-tooltip">
//                 <div>
//                   <p>{translations?.dashboard?.lint}</p>
//                   <p>{formatDecimal(Number(data?.total_lint)) + " " + translations?.dashboard?.mt}</p>
//                 </div>
//               </div>

//               <div className="tool4 brand-tooltip">
//                 <div>
//                   <p>{translations?.dashboard?.yarn}</p>
//                   <p>{formatDecimal(Number(data?.total_yarn)) + " " + translations?.dashboard?.mt}</p>
//                 </div>
//               </div>
//               <div className="tool5 brand-tooltip">
//                 <div>
//                   <p>{translations?.dashboard?.product}</p>
//                   <p>{formatDecimal(Number(data?.total_garment)) + " " + "pcs"}</p>
//                 </div>

//               </div>
//               <div className="tool6 brand-tooltip">
//                 <div>
//                   <p>{translations?.dashboard?.wovenFabric}</p>
//                   <p>{formatDecimal(Number(data?.total_weave)) + " " + translations?.dashboard?.mt}</p>
//                 </div>
//               </div>
//               <div className="tool7 brand-tooltip">
//                 <div>
//                   <p>{translations?.dashboard?.knittedFabric}</p>
//                   <p>{formatDecimal(Number(data?.total_knit)) + " " + translations?.dashboard?.mt}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="text-white textANimations z-[300]">
//             <div className=" gs_reveal ipsType_center five" style={{ opacity: 1, visibility: 'inherit', transform: 'translate(0px, 0px)', translate: 'none', rotate: 'none', scale: 'none' }}>
//               <p>Trace it: From Farm to Fashion</p>
//             </div>
//             <div className="second text-center flex justify-center">
//               <p className=" font-light leading-7">
//                 TraceBale software is an innovative digital traceability platform from <span className="font-bold">RiceTraceability</span> that supports creating a robust, resilient, and transparent cotton raw material supply chain in the textile sector.
//               </p>
//             </div>
//           </div>
//         </div> */}
          
//               <div className="table-minwidth w-100">
//                 <div className="pt-6">
//                   <div className="py-6">
//                     <h4 className="text-xl font-semibold">
//                       TRANSACTION ALERT
//                     </h4>
//                   </div>

//                   <DocumentPopup
//                     openFilter={showInvoiceAlert}
//                     dataInvoice={dataInvoiceAlert}
//                     type='Alert'
//                     onClose={() => setShowInvoiceAlert(false)}
//                   />

//                   <label className="flex items-center mr-5 justify-end my-2 text-[14px] font-medium">
//                     Total No of pieces: {totalQuantity}
//                   </label>

//                   <div className="items-center rounded-lg overflow-hidden border border-grey-100">
//                     <DataTable
//                       columns={columnsAlert}
//                       data={dataAlert}
//                       persistTableHead
//                       fixedHeader={true}
//                       noDataComponent={
//                         <p className="py-3 font-bold text-lg">
//                           No data available in table
//                         </p>
//                       }
//                       fixedHeaderScrollHeight="auto"
//                     />
//                   </div>

//                   <div className="flex justify-end mt-4">
//                     <button
//                       className="btn-purple"
//                       disabled={!isConfirm}
//                       style={
//                         isConfirm
//                           ? { cursor: "pointer", backgroundColor: "#D15E9C" }
//                           : { cursor: "not-allowed", opacity: 0.8 }
//                       }
//                       onClick={handleConfirmActions}
//                     >
//                       Confirm
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="pt-6">
//                 <hr className="my-6" />

//                 <div className="py-6">
//                   <h4 className="text-xl font-semibold">TRANSACTION LIST</h4>
//                 </div>
//                 {/* search */}
//                 <div className="search-filter-row">
//                   <div className="search-filter-left ">
//                     <div className="search-bars">
//                       <form className="form-group mb-0 search-bar-inner">
//                         <input
//                           type="text"
//                           className="form-control form-control-new jsSearchBar "
//                           placeholder="Search "
//                           value={searchQuery}
//                           onChange={searchData}
//                         />
//                         <button type="submit" className="search-btn">
//                           <span className="icon-search"></span>
//                         </button>
//                       </form>
//                     </div>
//                   </div>
//                 </div>

//                 <DocumentPopup
//                   openFilter={showInvoiceList}
//                   dataInvList={dataInvoiceList}
//                   type='List'
//                   onClose={() => setShowInvoiceList(false)}
//                 />

//                 <ConfirmPopup showModal={showConfirmPopup} setShowModal={setShowConfirmPopup} />

//                 <CommonDataTable
//                   columns={columnList}
//                   count={count}
//                   data={dataList}
//                   updateData={updatePageList}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

'use client';

import React, { useEffect } from 'react';
import { useRouter } from '@lib/router-events';

const BrandDashboard = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/services/farmer-registration');
    }, []);

    return (<></>);
}

export default BrandDashboard;
