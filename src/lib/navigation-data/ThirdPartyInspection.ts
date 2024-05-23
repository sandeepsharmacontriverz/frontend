import { AiFillCreditCard } from "react-icons/ai";
import { BsCameraVideo } from "react-icons/bs";
import { GiTicket } from "react-icons/gi";
import { ImTree } from "react-icons/im";
import { ImSpinner4 } from "react-icons/im";


interface MenuItem {
    id: string;
    item: string;
    name?: string;
    path?: string;
    icon?: any;
    childrens?: MenuItem[];
    isOpen?: boolean;
    size?: number;
}
export default class User {
    static list: MenuItem[] = [
        {
            item: "Mill Samples",
            name: "Mill Samples",
            id: "Mill Samples",
            icon: ImTree,
            size: 20,
            path: "/third-party-inspection/mill-samples",
            isOpen: false,
        },
        {
            item: "CMS Samples",
            name: "CMS Samples",
            id: "CMS Samples",
            icon: ImTree,
            size: 20,
            path: "/third-party-inspection/cms-samples",
            isOpen: false,
        },
    ];
}
