import { FaLocationDot, FaModx, FaTag } from "react-icons/fa6";
import { FaCircle } from "react-icons/fa6";
import { PiPlantBold } from "react-icons/pi";
import { FaUnsplash } from "react-icons/fa";
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
import { AiFillSetting } from "react-icons/ai";
import { FaUserPlus } from "react-icons/fa6";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaTrowelBricks } from "react-icons/fa6";
import { FaCertificate } from "react-icons/fa6";
import { FaChessQueen } from "react-icons/fa6";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaUserGear } from "react-icons/fa6";
import { FaBasketShopping } from "react-icons/fa6";
import { FaCashRegister } from "react-icons/fa6";
import { FaToiletsPortable } from "react-icons/fa6";
import { FaElementor } from "react-icons/fa6";
import { FaQrcode } from "react-icons/fa6";
import { FaBuildingUser } from "react-icons/fa6";
import { FaCheckToSlot } from "react-icons/fa6";
import { FaUsersGear } from "react-icons/fa6";
import { FaTornado } from "react-icons/fa6";
import { BiBarChartSquare } from "react-icons/bi";
import { HiOutlineDatabase, HiOutlineUsers } from "react-icons/hi";
import { RiBriefcase4Fill } from "react-icons/ri";
import { BsFillDatabaseFill, BsCameraVideo } from "react-icons/bs";
import { TbReport, TbChartHistogram } from "react-icons/tb";
import { PiPottedPlantFill } from "react-icons/pi";
import { FaArrowUpZA, FaMegaport } from "react-icons/fa6";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { IoShirt } from "react-icons/io5";

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
        {
          id: "master-7",
          item: "Fabric Type",
          icon: FaBriefcase,
          path: "/master/fabric-type",
        },
        {
          id: "master-8",
          item: "Season",
          icon: FaCloudSun,
          path: "/master/season",
        },
        {
          id: "master-9",
          item: "Loom Type",
          icon: TbBrandLoom,
          path: "/master/loom-type",
        },
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
        {
          id: "master-13",

          item: "Yarn Count Range",
          icon: FaArrowUpRightDots,
          path: "/master/yarn-count-range",
        },
        {
          id: "master-14",

          item: "Cotton Blend Types",
          icon: FaCreativeCommonsSampling,
          path: "/master/cotton-mix",
        },
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
        {
          id: "master-18",
          item: "Garment Type",
          icon: IoShirt,
          path: "/master/garment-Type",
        },
        {
          id: "master-19",
          item: "Style Mark No",
          icon: FaTag,
          path: "/master/style-mark-no",
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
          item: "Farmer Registration",
          path: "/services/farmer-registration",
          icon: FaUserPlus,
        },
        {
          item: "Procurement",
          id: "services-1",
          icon: FaMegaport,
          childrens: [
            {
              id: "services-2-1",
              item: "Transactions",
              icon: FaMoneyBillTransfer,
              path: "/services/procurement/transactions",
            },
          ],
          isOpen: false,
        },
        {
          id: "services-3",
          item: "Organic Integrity",
          icon: FaTrowelBricks,
          path: "/services/organic-integrity",
        },

        {
          id: "services-4",
          item: "Scope Certificate",
          icon: FaCertificate,
          path: "/services/scope-certification",
        },
        {
          id: "services-5",
          item: "Premium Validation",
          icon: FaChessQueen,
          path: "/services/premium-validation",
        },
        // { id: "services-6", item: "Upload Database", path: "/services/upload-database", icon: BsFillDatabaseFill },
        // { id: "services-7", item: "Upload Linen", path: "/services/upload-linen", icon: BsFillDatabaseFill },
        {
          id: "services-8",
          item: "Linen Transactions",
          icon: FaMoneyBillTrendUp,
          path: "/services/linen-transactions",
        },
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
          item: "Retailer & Brand Registration",
          path: "/settings/retailer-brand-registration",
          icon: FaBasketShopping,
          size: 18,
        },
        {
          id: "settings-3",
          item: "Processor Registration",
          icon: FaCashRegister,
          path: "/settings/processor-registration",
          // childrens: [
          //     {
          //         id: "settings-3-1",
          //         item: "Trader",
          //         path: "/settings/processor-registration/trader",
          //         icon: 'FaUserPlus',
          //     },
          //     {
          //         id: "settings-3-2",
          //         item: "Garment",
          //         path: "/settings/processor-registration/garment",
          //         icon: 'FaUserPlus',
          //     },
          //     {
          //         id: "settings-3-3",
          //         item: "Knitter",
          //         path: "/settings/processor-registration/knitter",
          //         icon: 'FaUserPlus',
          //     },
          //     {
          //         id: "settings-3-4",
          //         item: "Weaving",
          //         path: "/settings/processor-registration/weaver",
          //         icon: "FaUserPlus",
          //     },
          //     {
          //         id: "settings-3-5",
          //         item: "Spinner",
          //         path: "/settings/processor-registration/spinner",
          //         icon: 'FaUserPlus',
          //     },
          //     {
          //         id: "settings-3-6",
          //         item: "Ginner",
          //         path: "/settings/processor-registration/ginner",
          //         icon: "FaUserPlus",
          //     },
          //     {
          //         id: "settings-3-7",
          //         item: "Fabric",
          //         path: "/settings/processor-registration/fabric",
          //         icon: "FaUserPlus",
          //     },
          // ],
          // isOpen: false,
        },
        {
          id: "settings-4",
          item: "Device Management",
          path: "/settings/device-management",
          icon: FaToiletsPortable,
        },
      ],
      isOpen: false,
    },
    // 5
    {
      id: "data-migration",
      item: "Data Migration",
      icon: BsFillDatabaseFill,
      size: 20,
      childrens: [
        {
          id: "data-migration-1",
          item: "Upload",
          path: "/data-migration/upload",
          icon: AiOutlineCloudUpload,
          size: 20,
        }
      ],
      isOpen: false,
    },
    // 6
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
    // 7
    {
      item: "QR App",
      id: "QRApp",
      icon: FaQrcode,
      size: 20,
      childrens: [
        {
          id: "QRApp-1",
          item: "Agent User Management",
          path: "/qr-app/agent-user-management",
          icon: FaBuildingUser,
          size: 20,
        },
      ],
      isOpen: false,
    },
    // 8
    {
      name: 'Quality Parameter Analytics',
      item: "Quality",
      id: "Qualityparameter",
      icon: TbChartHistogram,
      size: 20,
      childrens: [
        {
          item: "Quality Parameter",
          id: "Qualityparameter1",
          path: "/quality-parameter",
          icon: FaModx,
          size: 20,
        },
      ],
      isOpen: false,
    },
    // 9
    {
      item: "Reports",
      id: "reports",
      icon: BiBarChartSquare,
      size: 20,
      childrens: [
        {
          item: "Farmer Reports",
          id: "report-6-2",
          path: "/reports/farmer-report",
          icon: TbReport,
        },
        {
          id: "report-2",
          item: "Procurement",
          path: "/reports/procurement",
          icon: TbReport,
        },

        // {
        //   item: "Procurement Tracker",
        //   id: "report-3",
        //   path: "/reports/procurement-tracker",
        //   icon: TbReport,
        // },
        // {
        //   id: "report-8",
        //   item: "Failed Records Report",
        //   path: "/reports/failed-records",
        //   icon: TbReport,
        // },
        {
          item: "Organic Integrity Report",
          id: "report-4",
          path: "/reports/organic-integrity-report",
          icon: TbReport,
        },
        {
          item: "Premium Validation Report",
          id: "report-5",
          path: "/reports/premium-validation-report",
          icon: TbReport,
        },
        {
          item: "Village Seed Cotton Report",
          id: "report-7",
          path: "/reports/village-seed-cotton-report",
          icon: TbReport,
        },
        {
          item: "Processing Reports",
          id: "report-6",
          icon: TbReport,
          childrens: [
            // {
            //   item: "Seed Cotton Data Section",
            //   id: "report-6-1",
            //   path: "/reports/processing-reports/ginner-bales-report",
            //   icon: TbReport,
            // },
            {
              item: "Ginner Data Section",
              id: "report-6-2",
              path: "/reports/ginner-data-section",
              icon: TbReport,
            },
            {
              item: "Spinner Data Section",
              id: "report-6-3",
              path: "/reports/spinner-data-section",
              icon: TbReport,
            },
            {
              item: "Knitter Data Section",
              id: "report-6-4",
              path: "/reports/knitter-data-section",
              icon: TbReport,
            },
            {
              item: "Weaver Data Section",
              id: "report-6-5",
              path: "/reports/weaver-data-section",
              icon: TbReport,
            },
            {
              item: "Fabric processor Data",
              id: "report-6-6",
              path: "/reports/fabric-data-section",
              icon: TbReport,
            },
            {
              item: "Garment Data Section",
              id: "report-6-7",
              path: "/reports/garment-data-section",
              icon: TbReport,
            },
            // {
            //   item: "Consolidated Traceability Report",
            //   id: "report-6-8",
            //   path: "/reports/processing-reports/ginner-bales-report",
            //   icon: TbReport,
            // },
            {
              item: "Consolidated Traceability",
              id: "report-6-21",
              path: "/reports/consolidated-traceability",
              icon: TbReport,
            },

          ],
          isOpen: false,
        },
        // {
        //   item: "QR Code Track",
        //   id: "report-7",

        //   path: "/reports/processing-reports/qr-code-track",
        //   icon: TbReport,
        // },

        // {
        //   item: "Procurement and Sell & Live Tracker",
        //   id: "report-9",
        //   path: "/reports/procurement-sell-live-tracker",
        //   icon: TbReport,
        // },
        // {
        //   item: "QR APP Procurement Report",
        //   id: "report-6-10",
        //   path: "/reports/qr-app-procurement-report",
        //   icon: TbReport,
        // },
      ],
      isOpen: false,
    },
    // 10
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
    // 11
    {
      name: "Ticketing",
      item: "Escalation",
      id: "escalation-matrix",
      icon: FaTornado,
      size: 20,
      childrens: [
        {
          item: "Escalation Matrix",
          id: "escalation-matrix-1",
          path: "/escalation-matrix/escalation-matrix",
          icon: RiBriefcase4Fill,
          size: 20,
        },
      ],
      isOpen: false,
    },
  ];
}
