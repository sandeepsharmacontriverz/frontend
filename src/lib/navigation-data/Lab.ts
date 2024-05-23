import { AiFillCreditCard } from "react-icons/ai";
import { BsCameraVideo } from "react-icons/bs";

import { FaCheckToSlot, FaUsersGear } from "react-icons/fa6";
import { GiTicket } from "react-icons/gi";

import { ImTree } from "react-icons/im";
import { MdRecycling } from "react-icons/md";
import { TbChartHistogram } from "react-icons/tb";
import { ImSpinner4 } from "react-icons/im";

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
        {
            item: "Mill",
            id: "Mill",
            icon: ImTree,
            size: 20,
            path: "/lab/mill",
            isOpen: false,
        },
        {
            item: "CMS",
            id: "CMS",
            icon: ImTree,
            size: 20,
            path: "/lab/cms",
            isOpen: false,
        }
    ];
}
