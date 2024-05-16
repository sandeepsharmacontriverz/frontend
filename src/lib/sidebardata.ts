import { FaClipboardUser } from "react-icons/fa6";
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
import { RiBriefcase4Fill } from "react-icons/ri";
import { BsFillDatabaseFill } from "react-icons/bs";
import { TbReport } from "react-icons/tb";
import { PiPottedPlantFill } from "react-icons/pi";
import { FaArrowUpZA, FaMegaport } from "react-icons/fa6";
import { FaTag } from "react-icons/fa";
import { IoShirt } from "react-icons/io5";


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
    // 1
    // {
    //   id: "dashboard",
    //   item: "Dashboard",
    //   path: "/dashboard",
    //   icon: AiFillDashboard,
    //   size: 20,
    // },
    // 2
    {
      id: "master",
      item: "Master",
      icon: FaClipboardUser,

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
              icon: FaRegBuilding,
            },
            {
              id: "master-1-5",
              item: "Village",
              path: "/master/location/village",
              icon: FaRoute,
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
              icon: FaPlantWilt,
            },
            {
              id: "master-2-2",
              item: "Crop Type",
              path: "/master/crop/crop-type",
              icon: FaPepperHot,
            },
            {
              id: "master-2-3",
              item: "Crop Variety",
              path: "/master/crop/crop-variety",
              icon: FaCanadianMapleLeaf,
            },
            {
              id: "master-2-4",
              item: "Crop Grade",
              path: "/master/crop/crop-grade",
              icon: FaEnvira,
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
              icon: FaLeaf,
            },
            {
              id: "master-3-2",
              item: "Farm Product",
              path: "/master/farm/farm-product",
              icon: FaSeedling,
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
              icon: FaTrello,
            },
            {
              id: "master-4-2",
              item: "Unit Subtype",
              path: "/master/unit/unit-sub-type",
              icon: FaDoorClosed,
            },
            {
              id: "master-4-3",
              item: "Unit Certification",
              icon: FaCheckSquare,
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
          icon: FaTeamspeak,
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
              item: "Cotton Availability",
              icon: FaListOl,
              path: "/services/procurement/cotton-availability",
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
        {
          id: "services-10",
          item: "Organic Integrity",
          icon: FaTrowelBricks,
          path: "/services/organic-integrity",
        },

        {
          id: "services-11",
          item: "Scope Certificate",
          icon: FaCertificate,
          path: "/services/scope-certification",
        },
        {
          id: "services-12",
          item: "Premium Validation",
          icon: FaChessQueen,
          path: "/services/premium-validation",
        },
        { id: "services-13", item: "Upload Database", path: "/services/upload-database", icon: BsFillDatabaseFill },
        { id: "services-14", item: "Upload Linen", path: "/services/upload-linen", icon: BsFillDatabaseFill },
        {
          id: "services-15",
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
          item: "Entity Limit",
          path: "/settings/entity-limit",
          icon: FaChartSimple,
          size: 18,
        },
        {
          id: "settings-3",
          item: "Email Management",
          path: "/settings/email-management",
          icon: AiTwotoneMail,
          size: 18,
        },
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
          icon: FaCashRegister,
          path: "/settings/processor-registration",
          // childrens: [
          //   {
          //     id: "settings-5-1",
          //     item: "Trader",
          //     path: "/settings/processor-registration/trader",
          //     icon: FaChartArea,
          //   },
          //   {
          //     id: "settings-5-2",
          //     item: "Garment",
          //     path: "/settings/processor-registration/garment",
          //     icon: FaShirt,
          //   },
          //   {
          //     id: "settings-5-3",
          //     item: "Knitter",
          //     path: "/settings/processor-registration/knitter",
          //     icon: FaSocks,
          //   },
          //   {
          //     id: "settings-5-4",
          //     item: "Weaving",
          //     path: "/settings/processor-registration/weaver",
          //     icon: FaStroopwafel,
          //   },
          //   {
          //     id: "settings-5-5",
          //     item: "Spinner",
          //     path: "/settings/processor-registration/spinner",
          //     icon: FaSpinner,
          //   },
          //   {
          //     id: "settings-5-6",
          //     item: "Ginner",
          //     path: "/settings/processor-registration/ginner",
          //     icon: FaUmbrellaBeach,
          //   },
          //   {
          //     id: "settings-5-7",
          //     item: "Fabric",
          //     path: "/settings/processor-registration/fabric",
          //     icon: FaToiletPaper,
          //   },
          // ],
          // isOpen: false,
        },
        {
          id: "settings-6",
          item: "Device Management",
          path: "/settings/device-management",
          icon: FaToiletsPortable,
        },
      ],
      isOpen: false,
    },
    // 5
    {
      item: "Role",
      id: "role",
      icon: FaDigitalOcean,
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
    // 7
    {
      item: "Quality",
      id: "Qualityparameter",
      icon: FaCheckDouble,
      size: 20,
      childrens: [
        {
          item: "Quality Parameter",
          id: "Qualityparameter1",
          path: "/quality-parameter/quality-parameter-dashboard",
          icon: FaModx,
          size: 20,
        },
        // {
        //   item: "Quality Parameter Graph",
        //   id: "Qualityparameter2",
        //   path: "/quality-parameter/quality-parameter-graph",
        //   icon: FaChartArea,
        //   size: 20,
        // },
        // {
        //   item: "Quality Parameter Analytic",
        //   id: "Qualityparameter3",
        //   path: "/quality-parameter/quality-parameter-analytics",
        //   icon: FaCheckToSlot,
        //   size: 20,
        // },
      ],
      isOpen: false,
    },
    // 8
    {
      item: "Reports",
      id: "reports",
      icon: FaSquarePollVertical,
      size: 20,
      childrens: [
        {
          item: "Farmer Report",
          id: "report-1",
          path: "/reports/farmer-report",
          icon: TbReport,
          childrens: [
            {
              id: "report-1-1",
              item: "Organic",
              path: "/reports/farmer-report/organic",
              icon: TbReport,
            },
            {
              id: "report-1-2",
              item: "Non Organic",
              path: "/reports/farmer-report/non-organic",
              icon: TbReport,
            },
          ],
        },
        {
          id: "report-2",
          item: "Procurement",
          path: "/reports/procurement-report",
          icon: TbReport,
        },
        {
          item: "Procurement Tracker",
          id: "report-3",
          path: "/reports/procurement-tracker",
          icon: TbReport,
        },
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
          item: "Processing Reports",
          id: "report-6",
          icon: TbReport,
          childrens: [
            {
              item: "Ginner Bales Report",
              id: "report-6-1",
              path: "/reports/processing-reports/ginner-bales-report",
              icon: TbReport,
            },
            {
              item: "Ginner Pending Sales",
              id: "report-6-2",
              path: "/reports/processing-reports/ginner-pending-sales",
              icon: TbReport,
            },
            {
              item: "Mandi Sales",
              id: "report-6-3",

              path: "/reports/processing-reports/ginner-sales",
              icon: TbReport,
            },
            {
              item: "Spinner Bales Receipt",
              id: "report-6-4",
              path: "/reports/processing-reports/spinner-bales-receipt",
              icon: TbReport,
            },
            {
              item: "Spinner Pending Bales Receipt",
              id: "report-6-5",
              path: "/reports/processing-reports/spinner-pending-bales-receipt",
              icon: TbReport,
            },
            {
              item: "Spinner Yarn Process",
              id: "report-6-6",
              path: "/reports/processing-reports/spinner-yarn-process",
              icon: TbReport,
            },
            {
              item: "Spinner Yarn Sale",
              id: "report-6-7",
              path: "/reports/processing-reports/spinner-yarn-sale",
              icon: TbReport,
            },
            {
              item: "Knitter Fabric Sale",
              id: "report-6-8",
              path: "/reports/processing-reports/knitter-fabric-sale",
              icon: TbReport,
            },
            {
              item: "Knitter Yarn Receipt",
              id: "report-6-9",
              path: "/reports/processing-reports/knitter-yarn-receipt",
              icon: TbReport,
            },
            {
              item: "Weaver Yarn Receipt",
              id: "report-6-10",
              path: "/reports/processing-reports/weaver-yarn-receipt",
              icon: TbReport,
            },
            {
              item: "Weaver Fabric Sale",
              id: "report-6-11",
              path: "/reports/processing-reports/weaver-fabric-sale",
              icon: TbReport,
            },
            {
              item: "Garment Fabric Receipt",
              id: "report-6-12",

              path: "/reports/processing-reports/garment-fabric-receipt",
              icon: TbReport,
            },
            {
              item: "Garment  Sale",
              id: "report-6-13",
              path: "/reports/processing-reports/garment-sale",
              icon: TbReport,
            },
            {
              item: "Consolidated Traceability",
              id: "report-6-14",
              path: "/reports/processing-reports/consolidated-traceability",
              icon: TbReport,
            },
            {
              item: "QR Code Track",
              id: "report-6-15",

              path: "/reports/processing-reports/qr-code-track",
              icon: TbReport,
            },
          ],
          isOpen: false,
        },
        {
          item: "Ginner Summary Report",
          id: "report-7",
          path: "/reports/ginner-summary-report",
          icon: TbReport,
        },
        {
          item: "Spinner Summary Report",
          id: "report-8",
          path: "/reports/spinner-summary-report",
          icon: TbReport,
        },
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
    // 9
    {
      item: "Training",
      id: "training",
      icon: FaUsersLine,
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
    // 10
    {
      item: "Escalation",
      id: "escalation-matrix",
      icon: FaTornado,

      size: 20,
      childrens: [
        {
          item: "Escalation Matrix Dashboard",
          id: "escalation-matrix-1",
          path: "/escalation-matrix/escalation-matrix-dashboard",
          icon: AiFillDashboard,
        },
        {
          item: "Ticketing Tracker",
          id: "escalation-matrix-2",
          path: "/escalation-matrix/ticketing-tracker",
          icon: RiBriefcase4Fill,
          size: 20,
        },
      ],
      isOpen: false,
    },
  ];
}
