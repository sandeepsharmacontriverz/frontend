import User from "./User";

export default function checkAccess(name: string) {
  const access: any = User?.privileges.filter((access: any) => {
    if (name === "Farmer Registration") {
      return "Farmer Enrollment" === access?.menu?.menu_name;
    }
    if (name === "Farmer Reports") {
      return (
        "Organic Farmer Report" === access?.menu?.menu_name || "Non Organic Farmer Report" === access?.menu?.menu_name
      );
    }

    if (name === "Procurement Report") {
      return (
        "Procurement Report" === access?.menu?.menu_name || "Procurement Tracker" === access?.menu?.menu_name || "PSCP Procurement and Sell Live Tracker" === access?.menu?.menu_name
      );
    }

    if (name === "Ginner Data Section") {
      return (
        "Ginner Summary Report" === access?.menu?.menu_name || "Ginner Bales Report" === access?.menu?.menu_name || "Ginner Sales Pending" === access?.menu?.menu_name || "Ginner Sales Report" === access?.menu?.menu_name || "Ginner Seed Cotton Stock Report" === access?.menu?.menu_name
      );
    }

    if (name === "Spinner Data Section") {
      return (
        "Spinner Bale Receipt" === access?.menu?.menu_name || "Spinner Pending Bales Receipt Report" === access?.menu?.menu_name || "Spinner Yarn Process" === access?.menu?.menu_name || "Spinner Yarn Sale" === access?.menu?.menu_name || "Spinner Summary Report" === access?.menu?.menu_name || "Spinner Lint Cotton Stock Report" === access?.menu?.menu_name
      );
    }

    if (name === "Knitter Data Section") {
      return (
        "Knitter Summary Report" === access?.menu?.menu_name || "Knitter Process Report" === access?.menu?.menu_name || "Knitter Yarn Receipt" === access?.menu?.menu_name || "Knitter Fabric Sale" === access?.menu?.menu_name
      );
    }

    if (name === "Weaver Data Section") {
      return (
        "Weaver Summary Report" === access?.menu?.menu_name || "Weaver Process Report" === access?.menu?.menu_name || "Weaver Yarn Receipt" === access?.menu?.menu_name || "Weaver Fabric Sale" === access?.menu?.menu_name
      );
    }

    if (name === "Garment Data Section") {
      return (
        "Garment Summary Report" === access?.menu?.menu_name || "Garment Process Report" === access?.menu?.menu_name || "Garment Fabric Receipt" === access?.menu?.menu_name || "Garment Sale Report" === access?.menu?.menu_name || "QR Code Track" === access?.menu?.menu_name
      );
    }

    // if (name === "Fabric Data Section") {
    //   return (
    //     "Spinner Bale Receipt" === access?.menu?.menu_name || "Spinner Pending Bales Receipt" === access?.menu?.menu_name 
    //   );
    // }
    // return child.item === access?.menu?.menu_name;
    return name === access?.menu?.menu_name;
  });
  if (access) {
    return {
      // create: access[0]?.create_privilege,
      // view: access[0]?.view_privilege,
      // edit: access[0]?.edit_privilege,
      // delete: access[0]?.delete_privilege,
      create: true,
      view: true,
      edit: true,
      delete: true,
    }
  }
}