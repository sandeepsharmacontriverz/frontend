import { FaUser } from "react-icons/fa6";

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
            item: "Ginner",
            id: "ginner",
            icon: FaUser,
            size: 20,
            path: "/physical-partner/ginner",
            isOpen: false
        },
        {
            item: "Spinner",
            id: "spinner",
            icon: FaUser,
            size: 20,
            path: "/physical-partner/spinner",
            isOpen: false
        },
        {
            item: "Knitter",
            id: "knitter",
            icon: FaUser,
            size: 20,
            path: "/physical-partner/knitter",
            isOpen: false
        },
        {
            item: "Weaver",
            id: "weaver",
            icon: FaUser,
            size: 20,
            path: "/physical-partner/weaver",
            isOpen: false
        },
        {
            item: "Garment",
            id: "garment",
            icon: FaUser,
            size: 20,
            path: "/physical-partner/garment",
            isOpen: false
        },
    ];
}