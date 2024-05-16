export default class Role {
  static roleToPath: any = {
    "Superadmin": "/dashboard",
    "Admin": "/dashboard",
    "Brand": "/brand/dashboard",
    "Mandi": "/mandi/dashboard",
    "Mill": "/mill/dashboard",
    "Third_Party_Inspection": "/third-party-inspection/dashboard",
    "lab": "/lab/dashboard",
    "Container_Management_System": "/container-management-system/dashboard",
    // "Fabric": "/fabric/dashboard",
    // "Physical_Partner": "/physical-partner/dashboard",
    // "Developer": "/dashboard",
  };

  static exists(role: any) {
    if (!role) return false
    if (typeof role == "string") {
      if (this.roleToPath[role] !== undefined) return true;
      return false;
    } else {
      return false;
    }
  }

  static dashboardPath(role: any) {
    if (!role) return null;
    if (!this.exists(role)) return null;

    return this.roleToPath[role];
  }
}