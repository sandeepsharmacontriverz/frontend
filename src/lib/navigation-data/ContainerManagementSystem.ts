import { AiFillCreditCard } from "react-icons/ai";
import { BsCameraVideo } from "react-icons/bs";

import { FaChartPie, FaCheckToSlot, FaUsersGear } from "react-icons/fa6";
import { GiTicket } from "react-icons/gi";

import { ImTree } from "react-icons/im";
import { MdRecycling } from "react-icons/md";
import { TbChartHistogram } from "react-icons/tb";
interface MenuItem {
    id: string;
    item: string;
    path?: string;
    icon?: any;
    childrens?: MenuItem[];
    isOpen?: boolean;
    size?: number;
    name?: string

}
export default class User {
    static list: MenuItem[] = [
        {
            item: "Container Process",
            id: "container-process",
            icon: ImTree,
            size: 20,
            path: "/mill/mill-process",
            isOpen: false,
        },
     
        // {
        //     item: "Quality",
        //     id: "Qualityparameter",
        //     icon: TbChartHistogram,
        //     size: 20,
        //     childrens: [
        //         {
        //             item: "Paddy Quality Parameters",
        //             id: "Qualityparameter-1",
        //             path: "/mill/quality-parameter/cotton-quality-parameter",
        //             icon: FaCheckToSlot,
        //             size: 20,
        //         },
        //     ],
        //     isOpen: false,
        // },
        // {
        //     item: "Training",
        //     id: "training",
        //     icon: BsCameraVideo,
        //     size: 20,
        //     childrens: [
        //         {
        //             id: "training-1",
        //             item: "Training Video",
        //             path: "/mill/training/training-video",
        //             icon: BsCameraVideo,
        //             size: 20,
        //         },
        //         {
        //             id: "training-2",
        //             item: "Tracebale Training",
        //             path: "/mill/training/tracebale-training",
        //             icon: FaUsersGear,
        //             size: 20,
        //         },
        //     ],
        //     isOpen: false,
        // },
        // {
        //     item: "Ticketing",
        //     id: "ticketing",
        //     icon: GiTicket,
        //     size: 20,
        //     childrens: [
        //         {
        //             item: "Ticketing",
        //             id: "ticketing",
        //             path: "/mill/ticketing",
        //             icon: GiTicket,
        //             size: 20,
        //         },
        //     ],
        //     isOpen: false,
        // },
    ];
}
