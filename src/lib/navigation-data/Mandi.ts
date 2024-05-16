import { AiFillCreditCard } from "react-icons/ai";
import { BsCameraVideo } from "react-icons/bs";
import { FaChartPie, FaCheckToSlot, FaUsersGear } from "react-icons/fa6";
import { GiTicket } from "react-icons/gi";
import { ImTree } from "react-icons/im";
import { TbChartHistogram } from "react-icons/tb";

interface MenuItem {
    id: string;
    item: string;
    path?: string;
    icon?: any;
    childrens?: MenuItem[];
    isOpen?: boolean;
    size?: number;
    name?: string;
}
export default class User {
    static list: MenuItem[] = [
        // {
        //     id: "chart",
        //     item: "Chart",
        //     icon: FaChartPie,
        //     size: 20,
        //     name: 'Ginner Sale',
        //     path: "/ginner/chart",
        //     isOpen: false,
        // },
        {
            item: "Mandi Process",
            id: "mandi-process",
            icon: ImTree,
            size: 20,
            path: "/mandi/mandi-process",
            isOpen: false,
        },
        {
            item: "Mandi Sale",
            id: "mandi-sale",
            icon: AiFillCreditCard,
            size: 20,
            path: "/mandi/sales",
            isOpen: false,
        },
        // {
        //     item: "Physical Traceability",
        //     id: "physical-traceability",
        //     icon: ImTree,
        //     size: 20,
        //     path: "/ginner/physical-traceability",
        //     isOpen: false,
        // },
        {
            item: "Quality",
            id: "Qualityparameter",
            icon: TbChartHistogram,
            size: 20,
            childrens: [
                {
                    item: "Paddy Quality Parameters",
                    id: "Qualityparameter-1",
                    path: "/mandi/quality-parameter/paddy-quality-parameter",
                    icon: FaCheckToSlot,
                    size: 20,
                },
            ],
            isOpen: false,
        },
        {
            item: "Training",
            id: "training",
            icon: BsCameraVideo,
            size: 20,
            childrens: [
                {
                    id: "training-1",
                    item: "Training Video",
                    path: "/mandi/training/training-video",
                    icon: BsCameraVideo,
                    size: 20,
                }, {
                    id: "training-2",
                    item: "Tracebale Training",
                    path: "/mandi/training/tracebale-training",
                    icon: FaUsersGear,
                    size: 20,
                },
            ],
            isOpen: false,
        },
        // {
        //     item: "Ticketing",
        //     id: "ticketing",
        //     icon: GiTicket,
        //     size: 20,
        //     childrens: [
        //         {
        //             item: "Ticketing",
        //             id: "ticketing",
        //             path: "/ginner/ticketing",
        //             icon: GiTicket,
        //             size: 20,
        //         },
        //     ],
        //     isOpen: false,
        // },
    ];
}
