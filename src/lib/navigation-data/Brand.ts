import { AiFillSetting } from "react-icons/ai";
import { FaChartPie, FaCheckToSlot, FaUser, FaUserPlus } from "react-icons/fa6";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaTrowelBricks } from "react-icons/fa6";
import { FaCertificate } from "react-icons/fa6";
import { FaCashRegister } from "react-icons/fa6";
import { FaQrcode } from "react-icons/fa6";
import { FaUsersGear } from "react-icons/fa6";
import { FaTornado } from "react-icons/fa6";
import { BiBarChartSquare } from "react-icons/bi";
import { RiBriefcase4Fill } from "react-icons/ri";
import { BsFillDatabaseFill, BsCameraVideo } from "react-icons/bs";
import { TbReport, TbChartHistogram } from "react-icons/tb";
import { FaArrowUpZA, FaMegaport } from "react-icons/fa6";
import { GiFarmer } from "react-icons/gi";
import { PiPlantBold } from "react-icons/pi";

interface MenuItem {
  id: string;
  name?: string;
  item: string;
  path?: string;
  icon?: any;
  childrens?: MenuItem[];
  isOpen?: boolean;
  size?: number;

}
export default class User {
  static list: MenuItem[] = [
    // {
    //   id: "chart",
    //   item: "Chart",
    //   icon: FaChartPie,
    //   size: 20,
    //   childrens: [
    //     {
    //       id: "chart-farmer",
    //       name: "Procurement",
    //       item: "Farmer",
    //       icon: GiFarmer,
    //       path: "/chart/farmer",
    //     },
    //     {
    //       id: "chart-ginner",
    //       name: "Procurement",
    //       item: "Ginner",
    //       icon: FaUser,
    //       path: "/chart/ginner",
    //     },
    //     {
    //       id: "chart-processor",
    //       name: "Procurement",
    //       item: "Processor",
    //       icon: FaUser,
    //       path: "/chart/processor",
    //     },
    //     {
    //       id: "chart-procurement",
    //       name: "Procurement",
    //       item: "Procurement",
    //       icon: PiPlantBold,
    //       path: "/chart/procurement",
    //     },
    //     {
    //       id: "chart-spinner",
    //       name: "Procurement",
    //       item: "Spinner",
    //       icon: FaUser,
    //       path: "/chart/spinner",
    //     },
    //   ],
    //   isOpen: false,
    // },
    {
      id: "services",
      item: "Services",
      name: "Services",
      icon: FaArrowUpZA,
      size: 20,
      childrens: [
        {
          id: "services-1",
          item: "Farmer Registration",
          name: "Farmer",
          path: "/services/farmer-registration",
          icon: FaUserPlus,
        },
        // {
        //   id: "services-2",
        //   item: "Traceability by Product",
        //   name: "Traceability by Product",
        //   path: "/brand/services/traceability-by-product",
        //   icon: FaCashRegister,
        // },
        // {
        //   id: "services-3",
        //   item: "Production Update",
        //   name: "Production Update",
        //   path: "/brand/services/production-update",
        //   icon: FaCashRegister,
        // },
        // {
        //   id: "services-4",
        //   item: "Transaction List",
        //   name: "Transaction List",
        //   path: "/brand/services/transaction-list",
        //   icon: FaCashRegister,
        // }
        // ,
        // {
        //   id: "services-5",
        //   item: "PSCP Procurement and Sell Live Tracker",
        //   name: "PSCP Procurement and Sell Live Tracker",
        //   path: "/brand/services/pscp-procurement-and-sell-live-tracker",
        //   icon: FaCashRegister,
        // },
        {
          item: "Procurement",
          name: "Procurement",
          id: "services-6",
          icon: FaMegaport,
          childrens: [
            {
              id: "services-6-1",
              item: "Transactions",
              name: "Transactions",
              icon: FaMoneyBillTransfer,
              path: "/services/procurement/transactions",
            }
          ],
          isOpen: false,
        },
        // {
        //   id: "services-7",
        //   item: "QR Code",
        //   name: "QR Code Track",
        //   icon: FaQrcode,
        //   path: "/brand/bar-code",
        // },
        {
          id: "services-8",
          item: "Processor Registration",
          name: "Processor Registration",
          path: "/settings/processor-registration",
          icon: FaCashRegister,
        },
        {
          id: "services-9",
          item: "Sample Collection Result",
          name: "Sample Collection Result",
          path: "/brand/services/sample-collection-result",
          icon: FaCashRegister,
        },

      ],
      isOpen: false,
    },
   
    // {
    //   item: "Reports",
    //   id: "reports",
    //   icon: BiBarChartSquare,
    //   size: 20,
    //   childrens: [
    //     {
    //       id: "report-2",
    //       item: "Procurement",
    //       path: "/reports/procurement",
    //       icon: TbReport,
    //     },
    //     {
    //       item: "Ginner Data Section",
    //       name: "Ginner Data Section",
    //       id: "report-6-2",
    //       path: "/reports/ginner-data-section",
    //       icon: TbReport,
    //     },
    //     {
    //       item: "Spinner Data Section",
    //       id: "report-6-3",
    //       path: "/reports/spinner-data-section",
    //       icon: TbReport,
    //     },
    //     {
    //       item: "Knitter Data Section",
    //       id: "report-6-4",
    //       path: "/reports/knitter-data-section",
    //       icon: TbReport,
    //     },
    //     {
    //       item: "Weaver Data Section",
    //       id: "report-6-5",
    //       path: "/reports/weaver-data-section",
    //       icon: TbReport,
    //     },
    //     {
    //       item: "Fabric processor Data",
    //       id: "report-6-6",
    //       path: "/reports/fabric-data-section",
    //       icon: TbReport,
    //     },
    //     {
    //       item: "Garment Data Section",
    //       id: "report-6-7",
    //       path: "/reports/garment-data-section",
    //       icon: TbReport,
    //     },
    //     {
    //       item: "Consolidated Traceability",
    //       id: "report-6-8",
    //       path: "/reports/consolidated-traceability",
    //       icon: TbReport,
    //     },
    //     // {
    //     //   item: "QR Code Track",
    //     //   id: "report-7",

    //     //   path: "/reports/processing-reports/qr-code-track",
    //     //   icon: TbReport,
    //     // },

    //     // {
    //     //   item: "PSCP Procurement and Sell Live Tracker",
    //     //   id: "report-9",
    //     //   path: "/reports/procurement-sell-live-tracker",
    //     //   icon: TbReport,
    //     // },
    //   ],
    //   isOpen: false,
    // },

    // {
    //   item: "Quality",
    //   id: "Qualityparameter",
    //   icon: TbChartHistogram,
    //   size: 20,
    //   childrens: [
    //     {
    //       item: "Paddy Quality Parameters",
    //       id: "Qualityparameter-1",
    //       path: "/brand/cotton-quality-parameter",
    //       icon: FaCheckToSlot,
    //       size: 20,
    //     },
    //   ],
    //   isOpen: false,
    // },
    // 9
    {
      item: "Training",
      id: "training",
      icon: BsCameraVideo,
      size: 20,
      childrens: [
        {
          id: "training-1",
          item: "Processor Training",
          path: "/training/processor-training",
          icon: FaUsersGear,
          size: 20,
        },
        {
          id: "training-2",
          name: "Video",
          item: "Training Video",
          path: "/brand/training-video",
          icon: FaUsersGear,
          size: 20,
        },
      ],
      isOpen: false,
    },
    // 10
    // {
    //   item: "Ticketing",
    //   name: "Escalation",
    //   id: "escalation-matrix",
    //   icon: FaTornado,
    //   size: 20,
    //   childrens: [
    //     {
    //       item: "Ticketing",
    //       id: "escalation-matrix-2",
    //       path: "/escalation-matrix/ticketing-list",
    //       icon: RiBriefcase4Fill,
    //       size: 20,
    //     },
    //   ],
    //   isOpen: false,
    // },
  ];
}
