import API from "./Api";

export default class User {
  static accessToken = "";
  static currentRole: any = null;
  static isAdmin: boolean = false;
  static email: string | "";
  static username: string | "";
  static id: Number | null;
  static type: any;
  static MandiId: Number | null;
  static MillId: Number | null;
  static ThirdPartyInspectionId: Number | null;
  static ContainerManagementId: Number | null;
  static garmentId: Number | null;
  static LabId: Number | null;
  static physicalPartnerId: Number | null;
  static brandId: Number | null;
  static fabricId: Number | null;
  static privileges: Array<any> = [];

  static async signOut(redirect = 1) {
    await API.get(["auth", "signout"]);
    this.accessToken = "";
    localStorage.clear();
    sessionStorage.removeItem("User");
    this.currentRole = null;
    if (redirect) window.location.href = "/auth/login";
  }

  static async role() {
    let res = await API.get(["user", "my-details"]);

    if (res.success) {

      this.currentRole = res.data?.user?.role;
      this.id = res.data?.user?.id;
      this.email = res.data?.user?.email;
      this.username = res.data?.user?.username;
      this.type = res.data?.role?.user_role;
      this.privileges = res.data?.privileges;
      this.MandiId = res.data?.mandi?.id;
      this.MillId = res.data?.mill?.id;
      this.ThirdPartyInspectionId = res.data?.thirdPartyInspection?.id;
      this.ContainerManagementId = res.data?.containerManagementSystem?.id;
      this.LabId = res.data?.lab?.id;
      this.physicalPartnerId = res.data?.physicalPartner?.id;
      this.brandId = res.data?.brand?.id;
      this.fabricId = res.data?.fabric?.id;
      return res.data;
    }
  }
}
