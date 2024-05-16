import { FaClipboardUser, FaUser } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { FaCircle } from "react-icons/fa6";
import { FaRoute } from "react-icons/fa6";
import { FaRegBuilding } from "react-icons/fa6";
import { PiPlantBold } from "react-icons/pi";
import { FaPlantWilt } from "react-icons/fa6";
import { FaPepperHot } from "react-icons/fa6";
import { FaCanadianMapleLeaf } from "react-icons/fa";
import { FaEnvira } from "react-icons/fa";
import { FaLeaf } from "react-icons/fa";
import { FaSeedling } from "react-icons/fa";
import { FaUnsplash } from "react-icons/fa";
import { FaTrello } from "react-icons/fa";
import { FaDoorClosed } from "react-icons/fa";
import { FaCheckSquare } from "react-icons/fa";
import { FaLayerGroup } from "react-icons/fa6";
import { FaBarsProgress } from "react-icons/fa6";
import { FaBriefcase } from "react-icons/fa6";
import { FaCloudSun } from "react-icons/fa6";
import { TbBrandLoom } from "react-icons/tb";
import { FaFlipboard } from "react-icons/fa6";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FaArrowUpRightDots } from "react-icons/fa6";
import { FaCreativeCommonsSampling } from "react-icons/fa6";
import { FaQuinscape } from "react-icons/fa6";
import { FaSquarePiedPiper } from "react-icons/fa6";
import { FaTeamspeak } from "react-icons/fa6";
import { AiFillSetting } from "react-icons/ai";
import { FaUserPlus } from "react-icons/fa6";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaListOl } from "react-icons/fa6";
import { FaUserXmark } from "react-icons/fa6";
import { FaTrowelBricks } from "react-icons/fa6";
import { FaCertificate } from "react-icons/fa6";
import { FaChessQueen } from "react-icons/fa6";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaUserGear } from "react-icons/fa6";
import { FaChartSimple } from "react-icons/fa6";
import { AiTwotoneMail } from "react-icons/ai";
import { FaBasketShopping } from "react-icons/fa6";
import { FaCashRegister } from "react-icons/fa6";
import { FaChartArea } from "react-icons/fa6";
import { FaShirt } from "react-icons/fa6";
import { FaSocks } from "react-icons/fa6";
import { FaStroopwafel } from "react-icons/fa6";
import { FaSpinner } from "react-icons/fa6";
import { FaUmbrellaBeach } from "react-icons/fa6";
import { FaToiletPaper } from "react-icons/fa6";
import { FaToiletsPortable } from "react-icons/fa6";
import { FaDigitalOcean } from "react-icons/fa6";
import { FaElementor } from "react-icons/fa6";
import { FaQrcode } from "react-icons/fa6";
import { FaBarcode } from "react-icons/fa6";
import { FaBuildingUser } from "react-icons/fa6";
import { FaWpforms } from "react-icons/fa6";
import { FaCheckDouble } from "react-icons/fa6";
import { FaModx } from "react-icons/fa6";
import { FaCheckToSlot } from "react-icons/fa6";
import { FaSquarePollVertical } from "react-icons/fa6";
import { FaUsersLine } from "react-icons/fa6";
import { FaUsersGear } from "react-icons/fa6";
import { FaTornado } from "react-icons/fa6";
import { AiFillDashboard } from "react-icons/ai";
import { BiBarChartSquare } from "react-icons/bi";
import { HiOutlineDatabase, HiOutlineUsers } from "react-icons/hi";
import { RiBriefcase4Fill } from "react-icons/ri";
import { BsFillDatabaseFill, BsCameraVideo, BsBox2Fill } from "react-icons/bs";
import { TbReport, TbChartHistogram } from "react-icons/tb";
import { PiPottedPlantFill } from "react-icons/pi";
import { FaBowlRice } from "react-icons/fa6";
import { FaArrowUpZA, FaMegaport, FaMitten, FaMendeley, FaHollyBerry, FaAudible } from "react-icons/fa6";
import { FaTag } from "react-icons/fa";
import { IoShirt } from "react-icons/io5";
import { FaChartPie } from "react-icons/fa6";
import { GiFarmer } from "react-icons/gi";

interface MenuItem {
  id: string;
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
    //       item: "Farmer",
    //       icon: GiFarmer,
    //       path: "/chart/farmer",
    //     },
    //     {
    //       id: "chart-ginner",
    //       item: "Ginner",
    //       icon: FaUser,
    //       path: "/chart/ginner",
    //     },
    //     {
    //       id: "chart-processor",
    //       item: "Processor",
    //       icon: FaUser,
    //       path: "/chart/processor",
    //     },
    //     {
    //       id: "chart-procurement",
    //       item: "Procurement",
    //       icon: PiPlantBold,
    //       path: "/chart/procurement",
    //     },
    //     {
    //       id: "chart-spinner",
    //       item: "Spinner",
    //       icon: FaUser,
    //       path: "/chart/spinner",
    //     },
    //   ],
    //   isOpen: false,
    // },
    // 2
    {
      id: "master",
      item: "Master",
      icon: HiOutlineDatabase,

      size: 20,
      childrens: [
        {
          id: "location",
          item: "Location",
          icon: FaLocationDot,
          childrens: [
            {
              id: "master-1-1",
              item: "Country",
              path: "/master/location/country",
              icon: FaCircle,
            },
            {
              id: "master-1-2",
              item: "State",
              path: "/master/location/state",
              icon: FaCircle,
            },
            {
              id: "master-1-3",
              item: "District",
              path: "/master/location/district",
              icon: FaCircle,
            },
            {
              id: "master-1-4",
              item: "Taluk/Block",
              path: "/master/location/block",
              icon: FaCircle,
            },
            {
              id: "master-1-5",
              item: "Village",
              path: "/master/location/village",
              icon: FaCircle,
            },
          ],
          isOpen: false,
        },
        {
          id: "master-2",
          item: "Crop",
          icon: PiPlantBold,
          childrens: [
            {
              id: "master-2-1",
              item: "Crop Name",
              path: "/master/crop/crop-name",
              icon: FaCircle,
            },
            {
              id: "master-2-2",
              item: "Crop Type",
              path: "/master/crop/crop-type",
              icon: FaCircle,
            },
            {
              id: "master-2-3",
              item: "Crop Variety",
              path: "/master/crop/crop-variety",
              icon: FaCircle,
            },
            {
              id: "master-2-4",
              item: "Crop Grade",
              path: "/master/crop/crop-grade",
              icon: FaCircle,
            },
          ],
          isOpen: false,
        },
        {
          id: "master-3",
          item: "Farm",
          icon: PiPottedPlantFill,
          childrens: [
            {
              item: "Farm Item",
              id: "master-3-1",
              path: "/master/farm/farm-item",
              icon: FaCircle,
            },
            {
              id: "master-3-2",
              item: "Farm Product",
              path: "/master/farm/farm-product",
              icon: FaCircle,
            },
          ],
          isOpen: false,
        },
        {
          item: "Unit",
          id: "master-4",
          icon: FaUnsplash,
          childrens: [
            {
              id: "master-4-1",
              item: "Unit Type",
              path: "/master/unit/unit-type",
              icon: FaCircle,
            },
            {
              id: "master-4-2",
              item: "Unit Subtype",
              path: "/master/unit/unit-sub-type",
              icon: FaCircle,
            },
            {
              id: "master-4-3",
              item: "Unit Certification",
              icon: FaCircle,
              path: "/master/unit/unit-certification",
            },
          ],
          isOpen: false,
        },
        {
          id: "master-5",
          item: "Department",
          icon: FaLayerGroup,
          path: "/master/department",
        },
        {
          id: "master-6",
          item: "Program",
          icon: FaBarsProgress,
          path: "/master/program",
        },
        // {
        //   id: "master-7",
        //   item: "Fabric Type",
        //   icon: FaBriefcase,
        //   path: "/master/fabric-type",
        // },
        {
          id: "master-8",
          item: "Season",
          icon: FaCloudSun,
          path: "/master/season",
        },
        // {
        //   id: "master-9",
        //   item: "Loom Type",
        //   icon: TbBrandLoom,
        //   path: "/master/loom-type",
        // },
        {
          id: "master-10",
          item: "Production Capacity",
          icon: FaFlipboard,
          path: "/master/production-capacity",
        },
        {
          id: "master-11",
          item: "Farm Group",
          icon: FaPeopleGroup,
          path: "/master/farm-group",
        },
        {
          id: "master-12",
          item: "ICS Name",
          icon: FaWandMagicSparkles,
          path: "/master/ics-name",
        },
        // {
        //   id: "master-13",
        //   item: "Yarn Count Range",
        //   icon: FaArrowUpRightDots,
        //   path: "/master/yarn-count-range",
        // },
        // {
        //   id: "master-14",
        //   item: "Cotton Blend Types",
        //   icon: FaCreativeCommonsSampling,
        //   path: "/master/cotton-mix",
        // },
        // {
        //   id: "master-15",
        //   item: "Cooperative",
        //   icon: FaQuinscape,
        //   path: "/master/cooperative-list",
        // },
        // {
        //   id: "master-16",
        //   item: "Linen Variety",
        //   icon: FaSquarePiedPiper,
        //   path: "/master/linen-variety-list",
        // },
        
        {
          id: "master-17",
          item: "Video",
          icon: BsCameraVideo,
          path: "/master/video-list",
        },
        // {
        //   id: "master-18",
        //   item: "Garment Type",
        //   icon: IoShirt,
        //   path: "/master/garment-Type",
        // },
        // {
        //   id: "master-19",
        //   item: "Style Mark No",
        //   icon: FaTag,
        //   path: "/master/style-mark-no"
        // },
        // {
        //   id: "master-20",
        //   item: "Lab Master",
        //   icon: FaMendeley,
        //   path: "/master/lab-master",
        // },
        // {
        //   id: "master-21",
        //   item: "Seed Company",
        //   icon: FaHollyBerry,
        //   path: "/master/seed-company",
        // },
        // {
        //   id: "master-22",
        //   item: "Crop Current Season",
        //   icon: FaAudible,
        //   path: "/master/crop-current-season",
        // },
        {
          id: "master-22",
          item: "Rice",
          icon: FaBowlRice,
          childrens: [
            {
              item: "Rice Pack Type",
              id: "master-3-1",
              path: "/master/rice/rice-type",
              icon: FaCircle,
            },
            {
              id: "master-3-2",
              item: "Rice Variety",
              path: "/master/rice/rice-variety",
              icon: FaCircle,
            },
          ],
          isOpen: false,
        },
      ],
      isOpen: false,
    },
    // 3
    {
      id: "services",
      item: "Services",
      icon: FaArrowUpZA,
      size: 20,
      childrens: [
        {
          id: "services-1",
          item: "Mandi",
          icon: FaUser,
        },
        {
          id: "services-2",
          item: "Mill",
          icon: FaUser,
        },
        {
          id: "services-3",
          item: "Third Party Inspection",
          icon: FaUser,
        },
        {
          id: "services-4",
          item: "Lab",
          icon: FaUser,
        },
        {
          id: "services-5",
          item: "Container Management System",
          icon: FaUser,
        },
        // {
        //   id: "services-4",
        //   item: "Weaver",
        //   icon: FaUser,
        // },
        // {
        //   id: "services-5",
        //   item: "Garment",
        //   icon: FaUser,
        // },
        // {
        //   id: "services-6",
        //   item: "Fabric",
        //   icon: FaUser,
        // },
        {
          id: "services-7",
          item: "Brand",
          icon: FaUser,
        },
        // {
        //   id: "services-17",
        //   item: "Physical Partner",
        //   icon: FaUser,
        // },
        {
          id: "services-8",
          item: "Farmer Registration",
          path: "/services/farmer-registration",
          icon: FaUserPlus,
        },
        {
          item: "Procurement",
          id: "services-9",
          icon: FaMegaport,
          childrens: [
            {
              id: "services-9-1",
              item: "Transactions",
              icon: FaMoneyBillTransfer,
              path: "/services/procurement/transactions",
            },

            {
              id: "services-9-2",
              item: "Paddy Availability",
              icon: FaListOl,
              path: "/services/procurement/paddy-availability",
            },
            {
              id: "services-9-3",
              item: "Delete Procurements",
              path: "/services/procurement/delete-procurements",
              icon: FaUserXmark,
            },
          ],
          isOpen: false,
        },
        // {
        //   id: "services-10",
        //   item: "Organic Integrity",
        //   icon: FaTrowelBricks,
        //   path: "/services/organic-integrity",
        // },
        {
          id: "services-11",
          item: "Scope Certificate",
          icon: FaCertificate,
          path: "/services/scope-certification",
        },
        // {
        //   id: "services-12",
        //   item: "Premium Validation",
        //   icon: FaChessQueen,
        //   path: "/services/premium-validation",
        // },
        // {
        //   id: "services-13",
        //   item: "Upload Database",
        //   path: "/services/upload-database",
        //   icon: BsFillDatabaseFill
        // },
        // {
        //   id: "services-14",
        //   item: "Upload Linen",
        //   path: "/services/upload-linen",
        //   icon: BsFillDatabaseFill
        // },
        // {
        //   id: "services-15",
        //   item: "Linen Transactions",
        //   icon: FaMoneyBillTrendUp,
        //   path: "/services/linen-transactions",
        // // },
        // {
        //   id: "services-16",
        //   item: "Organic Program Data Digitization",
        //   icon: FaMegaport,
        //   childrens: [
        //     {
        //       id: "services-16-1",
        //       item: "Farm Group/ICS Evaluation Data",
        //       icon: FaMoneyBillTransfer,
        //       path: "/services/organic-program-data-digitization/farm-group-evaluation-data",
        //     },
        //     {
        //       id: "services-16-2",
        //       item: "ICS Quantity Estimation",
        //       icon: FaMoneyBillTransfer,
        //       path: "/services/organic-program-data-digitization/ics-quantity-estimation",
        //     },
        //     {
        //       id: "services-16-3",
        //       item: "Seed Testing and Linkage",
        //       icon: FaMoneyBillTransfer,
        //       path: "/services/organic-program-data-digitization/seed-testing-linkage",
        //     },
        //     {
        //       id: "services-16-4",
        //       item: "Seed Demand",
        //       icon: FaMoneyBillTransfer,
        //       path: "/services/organic-program-data-digitization/seed-demand",
        //     },
        //     {
        //       id: "services-16-5",
        //       item: "Seed Availability",
        //       icon: FaMoneyBillTransfer,
        //       path: "/services/organic-program-data-digitization/seed-availability",
        //     },
        //   ],
        //   isOpen: false,
        // },
      ],
      isOpen: false,
    },
    // 4
    {
      id: "settings",
      item: "Settings",
      icon: AiFillSetting,
      size: 20,
      childrens: [
        {
          id: "settings-1",
          item: "User Management",
          path: "/settings/user-management",
          icon: FaUserGear,
          size: 20,
        },
        {
          id: "settings-2",
          item: "Entity Limit",
          path: "/settings/entity-limit",
          icon: FaChartSimple,
          size: 18,
        },
        // {
        //   id: "settings-3",
        //   item: "Email Management",
        //   path: "/settings/email-management",
        //   icon: AiTwotoneMail,
        //   size: 18,
        // },
        {
          id: "settings-4",
          item: "Retailer & Brand Registration",
          path: "/settings/retailer-brand-registration",
          icon: FaBasketShopping,
          size: 18,
        },
        {
          id: "settings-5",
          item: "Processor Registration",
          path: "/settings/processor-registration",
          icon: FaCashRegister,
        },
        // {
        //   id: "settings-6",
        //   item: "Device Management",
        //   path: "/settings/device-management",
        //   icon: FaToiletsPortable,
        // },
      ],
      isOpen: false,
    },
    // 5
    {
      item: "Role",
      id: "role",
      icon: HiOutlineUsers,
      size: 20,
      childrens: [
        {
          id: "role-1",
          item: "Menu & Entitlement",
          path: "/role/menu-entitlement",
          icon: FaElementor,
        },
      ],
      isOpen: false,
    },
    // 6
    {
      item: "QR App",
      id: "QRApp",
      icon: FaQrcode,
      size: 20,
      childrens: [
        {
          id: "QRApp1",
          item: "QR Procurement Dashboard",
          path: "/qr-app/qr-procurement-dashboard",
          icon: FaBarcode,
          size: 20,
        },
        {
          id: "QRApp2",
          item: "Agent User Management",
          path: "/qr-app/agent-user-management",
          icon: FaBuildingUser,
          size: 20,
        },
        {
          id: "QRApp3",
          item: "QR APP Procurement Report",
          path: "/qr-app/qr-appprocurement-report",
          icon: FaWpforms,
          size: 20,
        },
      ],
      isOpen: false,
    },
    // // 7
    // {
    //   item: "Quality",
    //   id: "Qualityparameter",
    //   icon: TbChartHistogram,
    //   size: 20,
    //   childrens: [
    //     {
    //       item: "Quality Parameter",
    //       id: "Qualityparameter1",
    //       path: "/quality-parameter",
    //       icon: FaModx,
    //       size: 20,
    //     },
    //   ],
    //   isOpen: false,
    // },
    // // 8
    // {
    //   item: "Reports",
    //   id: "reports",
    //   icon: BiBarChartSquare,
    //   size: 20,
    //   childrens: [
    //     {
    //       item: "Farmer Reports",
    //       id: "report-6-2",
    //       path: "/reports/farmer-report",
    //       icon: TbReport,
    //     },
    //     {
    //       id: "report-2",
    //       item: "Procurement",
    //       path: "/reports/procurement",
    //       icon: TbReport,
    //     },

    //     // {
    //     //   item: "Procurement Tracker",
    //     //   id: "report-3",
    //     //   path: "/reports/procurement-tracker",
    //     //   icon: TbReport,
    //     // },
    //     // {
    //     //   item: "Organic Integrity Report",
    //     //   id: "report-4",
    //     //   path: "/reports/organic-integrity-report",
    //     //   icon: TbReport,
    //     // },
    //     {
    //       item: "Premium Validation Report",
    //       id: "report-5",
    //       path: "/reports/premium-validation-report",
    //       icon: TbReport,
    //     },
    //     {
    //       item: "Village Seed Cotton Report",
    //       id: "report-7",
    //       path: "/reports/village-seed-cotton-report",
    //       icon: TbReport,
    //     },
    //     {
    //       item: "Processing Reports",
    //       id: "report-6",
    //       icon: TbReport,
    //       childrens: [
    //         // {
    //         //   item: "Seed Cotton Data Section",
    //         //   id: "report-6-1",
    //         //   path: "/reports/processing-reports/ginner-bales-report",
    //         //   icon: TbReport,
    //         // },
    //         {
    //           item: "Ginner Data Section",
    //           id: "report-6-2",
    //           path: "/reports/ginner-data-section",
    //           icon: TbReport,
    //         },
    //         {
    //           item: "Spinner Data Section",
    //           id: "report-6-3",
    //           path: "/reports/spinner-data-section",
    //           icon: TbReport,
    //         },
    //         {
    //           item: "Knitter Data Section",
    //           id: "report-6-4",
    //           path: "/reports/knitter-data-section",
    //           icon: TbReport,
    //         },
    //         {
    //           item: "Weaver Data Section",
    //           id: "report-6-5",
    //           path: "/reports/weaver-data-section",
    //           icon: TbReport,
    //         },
    //         // {
    //         //   item: "Fabric processor Data",
    //         //   id: "report-6-6",
    //         //   path: "/reports/fabric-data-section",
    //         //   icon: TbReport,
    //         // },
    //         {
    //           item: "Garment Data Section",
    //           id: "report-6-7",
    //           path: "/reports/garment-data-section",
    //           icon: TbReport,
    //         },
    //         // {
    //         //   item: "Consolidated Traceability Report",
    //         //   id: "report-6-8",
    //         //   path: "/reports/processing-reports/ginner-bales-report",
    //         //   icon: TbReport,
    //         // },
    //         {
    //           item: "Consolidated Traceability",
    //           id: "report-6-21",
    //           path: "/reports/consolidated-traceability",
    //           icon: TbReport,
    //         },
    //         {
    //           item: "Spinner Backward Traceability Report",
    //           id: "report-6-22",
    //           path: "/reports/spinner-backward-traceability-report",
    //           icon: TbReport,
    //         },
    //       ],
    //       isOpen: false,
    //     },
    //     {
    //       item: "Physical Traceability Reports",
    //       id: "report-8",
    //       icon: TbReport,
    //       childrens: [
    //         {
    //           item: "Ginner Report",
    //           id: "report-8-1",
    //           path: "/reports/physical-traceability/ginner-report",
    //           icon: TbReport,
    //         },
    //         {
    //           item: "Spinner Report",
    //           id: "report-8-2",
    //           path: "/reports/physical-traceability/spinner-report",
    //           icon: TbReport,
    //         },
    //         {
    //           item: "Knitter Report",
    //           id: "report-8-3",
    //           path: "/reports/physical-traceability/knitter-report",
    //           icon: TbReport,
    //         },
    //         {
    //           item: "Weaver Report",
    //           id: "report-8-4",
    //           path: "/reports/physical-traceability/weaver-report",
    //           icon: TbReport,
    //         },
    //         {
    //           item: "Garment Report",
    //           id: "report-8-5",
    //           path: "/reports/physical-traceability/garment-report",
    //           icon: TbReport,
    //         }
    //       ]
    //     }
    //     // {
    //     //   item: "QR Code Track",
    //     //   id: "report-7",

    //     //   path: "/reports/processing-reports/qr-code-track",
    //     //   icon: TbReport,
    //     // },

    //     // {
    //     //   item: "Procurement and Sell & Live Tracker",
    //     //   id: "report-9",
    //     //   path: "/reports/procurement-sell-live-tracker",
    //     //   icon: TbReport,
    //     // },
    //     // {
    //     //   item: "QR APP Procurement Report",
    //     //   id: "report-6-10",
    //     //   path: "/reports/qr-app-procurement-report",
    //     //   icon: TbReport,
    //     // },
    //   ],
    //   isOpen: false,
    // },
    // // 9
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
      ],
      isOpen: false,
    },
    // // 10
    // {
    //   item: "Escalation",
    //   id: "escalation-matrix",
    //   icon: FaTornado,
    //   size: 20,
    //   childrens: [
    //     {
    //       item: "Escalation Matrix",
    //       id: "escalation-matrix-1",
    //       path: "/escalation-matrix/escalation-matrix",
    //       icon: RiBriefcase4Fill,
    //       size: 20,
    //     },
    //   ],
    //   isOpen: false,
    // },
    // // 11
    // {
    //   item: "Oldsales",
    //   id: "oldsales",
    //   icon: BsBox2Fill,
    //   size: 20,
    //   childrens: [
    //     {
    //       item: "Knitter",
    //       id: "knitter-oldsales",
    //       path: "/oldsales/knitter",
    //       icon: FaMitten,
    //       size: 20,
    //     },
    //     {
    //       item: "Weaver",
    //       id: "weaver-oldsales",
    //       path: "/oldsales/weaver",
    //       icon: FaMitten,
    //       size: 20,
    //     },
    //     {
    //       item: "Garment",
    //       id: "garment-oldsales",
    //       path: "/oldsales/garment",
    //       icon: FaMitten,
    //       size: 20,
    //     },
    //     {
    //       item: "Fabric",
    //       id: "fabric-oldsales",
    //       icon: FaMitten,
    //       childrens: [
    //         {
    //           item: "Dyeing",
    //           id: "dyeing-oldsales",
    //           path: "/oldsales/fabric/dyeing",
    //           icon: FaCircle,
    //         },
    //         {
    //           item: "Printing",
    //           id: "printing-oldsales",
    //           path: "/oldsales/fabric/printing",
    //           icon: FaCircle,
    //         },
    //         {
    //           item: "Washing",
    //           id: "washing-oldsales",
    //           path: "/oldsales/fabric/washing",
    //           icon: FaCircle,
    //         },
    //         {
    //           item: "Compacting",
    //           id: "compacting-oldsales",
    //           path: "/oldsales/fabric/compacting",
    //           icon: FaCircle,
    //         }
    //       ],
    //       isOpen: false,
    //     },
    //   ],
    //   isOpen: false,
    // },
  ];
}
