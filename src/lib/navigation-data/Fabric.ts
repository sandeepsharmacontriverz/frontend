import { IoArrowBackCircleOutline } from "react-icons/io5";
import { ImTree } from "react-icons/im";
import { AiFillDashboard } from "react-icons/ai";

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
      name: "Fabric Dying Transaction",
      item: "Dying Dashboard",
      id: "Fabric Dying Transaction",
      icon: AiFillDashboard,
      size: 40,
      path: "/fabric/dashboard",
      isOpen: false,
    },
    {
      name: "Fabric Printing Transaction",
      item: "Printing Dashboard",
      id: "Fabric Printing Transaction",
      icon: AiFillDashboard,
      size: 40,
      path: "/fabric/printing-dashboard",
      isOpen: false,
    },
    {
      name: "Fabric Washing Transaction",
      item: "Washing Dashboard",
      id: "Fabric Washing Transaction",
      icon: AiFillDashboard,
      size: 40,
      path: "/fabric/washing-dashboard",
      isOpen: false,
    },
    {
      name: "Fabric Compacting Transaction",
      item: "Compacting Dashboard",
      id: "Fabric Compacting Transaction",
      icon: AiFillDashboard,
      size: 25,
      path: "/fabric/compacting-dashboard",
      isOpen: false,
    },
    {
      name: "Fabric Dying Process",
      item: "Dying Process/Sale",
      id: "Fabric Dying Process",
      icon: ImTree,
      size: 20,
      path: "/fabric/dyeing-process",
      isOpen: false,
    },
    {
      name: "Fabric Printing Process",
      item: "Printing Process/Sale",
      id: "Fabric Printing Process",
      icon: ImTree,
      size: 20,
      path: "/fabric/printing-process",

      isOpen: false,
    },
    {
      name: "Fabric Washing Process",
      item: "Washing Process/Sale",
      id: "Fabric Washing Process",
      icon: ImTree,
      size: 20,
      path: "/fabric/washing-process",

      isOpen: false,
    },
    {
      name: "Fabric Compacting Process",
      item: "Compacting Process/Sale",
      id: "Fabric Compacting Process",
      icon: ImTree,
      size: 20,
      path: "/fabric/compacting-process",
      isOpen: false,
    },
  ];
}
