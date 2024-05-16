import { AiFillCreditCard } from "react-icons/ai";
import { BsCameraVideo } from "react-icons/bs";
import { GiTicket } from "react-icons/gi";
import { ImTree } from "react-icons/im";
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
            item: "Sample Details",
            id: "Sample Details",
            icon: ImTree,
            size: 20,
            path: "/third-party-inspection/sample-details",
            isOpen: false,
        },
    ];
}
