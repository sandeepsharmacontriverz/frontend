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
            item: "Garment Process",
            id: "Garment Process",
            icon: ImTree,
            size: 20,
            path: "/garment/process",
            isOpen: false,
        },
        {
            item: "Garment Sale",
            id: "Garment Sale",
            icon: AiFillCreditCard,
            size: 20,
            path: "/garment/sales",
            isOpen: false,
        },
        {
            item: "Physical Traceability",
            id: "physical-traceability",
            icon: ImTree,
            size: 20,
            path: "/garment/physical-traceability",
            isOpen: false,
        },
        {
            item: "Garment Supply Chain",
            id: "Garment Supply Chain",
            icon: ImSpinner4,
            size: 20,
            path: "/garment/supply-chain",
            isOpen: false,
        },

        {
            item: "Tracebale Training",
            id: "Tracebale Training",
            icon: BsCameraVideo,
            size: 20,
            path: "/garment/tracebale-training",

            isOpen: false,
        },
        {
            item: "Ticketing",
            id: "ticketing",
            icon: GiTicket,
            size: 20,
            childrens: [
                {
                    item: "Ticketing",
                    id: "Ticketing",
                    path: "/garment/ticketing",
                    icon: GiTicket,
                    size: 20,
                },
            ],
            isOpen: false,
        },
    ];
}