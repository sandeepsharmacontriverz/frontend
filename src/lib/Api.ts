import User from "./User";
import Route from "./Route";
import Error from "./Error";

export interface Res {
  success: boolean;
  status: number;
  resent: boolean;
  resend: Function;
  [key: string]: any;
}

class Server {

  static localUrl = "https://api.newtracebale.com/";
  // static localUrl = "http://192.168.0.108:5000/";
  // static localUrl = "http://192.168.0.109:5000/";
  // static localUrl = "http://192.168.0.104:5000/";

  static devUrl = "https://api.newtracebale.com/";
  static prodUrl = "https://api.newtracebale.com/";

  // static get url() {
  //   return Process.isDev
  //     ? window.location.hostname == "localhost"
  //       ? this.localUrl
  //       : this.devUrl
  //     : this.prodUrl;
  // }
}

class API {
  static async get(
    path: string | string[],
    resent: boolean = false
  ): Promise<Res> {
    return new Promise(async (resolve) => {
      // Join path array
      if (Array.isArray(path)) path = path.join("/");

      let headers = new Headers();
      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      if (localStorage.getItem("orgToken") && localStorage.getItem("accessToken")) {
        // console.log("if", window.location.pathname.includes("/ginner" || "/spinner" || "/knitter"))
        switch (true) {
          case window.location.pathname.startsWith("/mill"):
          case window.location.pathname.startsWith("/mandi"):
          case window.location.pathname.startsWith("/third-party-inspection"):
          case window.location.pathname.startsWith("/lab"):
          case window.location.pathname.startsWith("/container-management-system"):
          case window.location.pathname.startsWith("/farm"):
          case window.location.pathname.startsWith("/garment"):
          case window.location.pathname.startsWith("/brand"):
          case window.location.pathname.startsWith("/physical-partner"):
            headers.append("Authorization", `Bearer ${localStorage.getItem("orgToken")}`)
            break;
          case localStorage.getItem("orgToken") && !window.location.pathname.startsWith("/dashboard") && sessionStorage.getItem("User") === "brand":
            headers.append("Authorization", `Bearer ${localStorage.getItem("orgToken")}`)
            break;
          default:
            headers.append("Authorization", `Bearer ${localStorage.getItem("accessToken")}`);
            break;
        }
      } else {
        if (User.accessToken) {
          headers.append("Authorization", `Bearer ${User.accessToken}`);
        } else if (localStorage.getItem("accessToken")) {
          headers.append(
            "Authorization",
            `Bearer ${localStorage.getItem("accessToken")}`
          );
        }
      }

      let options: any = {
        headers: headers,
        method: "GET",
        credentials: "include",
      };

      await fetch(process.env.NEXT_PUBLIC_API_URL + path, options)
        .then(async (res: Response) => {
          let parsed = await this.parseRes(
            res,
            () => this.get(path, true),
            resent,
            path
          );

          // if (Process.isDev) console.log("GET", path, "\n", parsed);

          resolve(parsed);
        })
        .catch((err: any) => {
          if (err.status == undefined) {
            console.log(err);

            // Route.load("/maintenance");
          }
          console.error(err);
        });
    });
  }

  static async post(
    path: string | string[],
    body: any,
    resent: boolean = false
  ): Promise<Res> {
    return new Promise(async (resolve) => {
      // Join path array
      if (Array.isArray(path)) path = path.join("/");

      let headers = new Headers();

      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      if (User.accessToken) {
        headers.append("Authorization", `Bearer ${User.accessToken}`);
      } else if (localStorage.getItem("accessToken")) {
        headers.append(
          "Authorization",
          `Bearer ${localStorage.getItem("accessToken")}`
        );
      }

      await fetch(process.env.NEXT_PUBLIC_API_URL + path, {
        method: "POST",
        credentials: "include",
        headers: headers,
        body: JSON.stringify(body),
      })
        .then(async (res: Response) => {
          let parsed = await this.parseRes(
            res,
            () => this.post(path, body, true),
            resent,
            path
          );

          // if (Process.isDev) console.log("POST", path, "\n", parsed);

          resolve(parsed);
        })
        .catch((err: any) => {
          if (err.status == undefined) {
            Route.load("/maintenance");
          }
          console.error(err);
        });
    });
  }

  static async postFile(
    path: string | string[],
    body: any,
    resent: boolean = false
  ): Promise<Res> {
    return new Promise(async (resolve) => {
      // Join path array
      if (Array.isArray(path)) path = path.join("/");

      let headers = new Headers();

      if (User.accessToken) {
        headers.append("Authorization", `Bearer ${User.accessToken}`);
      } else if (localStorage.getItem("accessToken")) {
        headers.append(
          "Authorization",
          `Bearer ${localStorage.getItem("accessToken")}`
        );
      }

      await fetch(process.env.NEXT_PUBLIC_API_URL + path, {
        method: "POST",
        credentials: "include",
        headers: headers,
        body: body,
      })
        .then(async (res: Response) => {
          let parsed = await this.parseRes(
            res,
            () => this.post(path, body, true),
            resent,
            path
          );

          // if (Process.isDev) console.log("POST", path, "\n", parsed);

          resolve(parsed);
        })
        .catch((err: any) => {
          if (err.status == undefined) {
            Route.load("/maintenance");
          }
          console.error(err);
        });
    });
  }

  static async put(
    path: string | string[],
    body: any,
    resent: boolean = false
  ): Promise<Res> {
    return new Promise(async (resolve) => {
      if (Array.isArray(path)) path = path.join("/");

      let headers = new Headers();

      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      if (User.accessToken) {
        headers.append("Authorization", `Bearer ${User.accessToken}`);
      } else if (localStorage.getItem("accessToken")) {
        headers.append(
          "Authorization",
          `Bearer ${localStorage.getItem("accessToken")}`
        );
      }

      await fetch(process.env.NEXT_PUBLIC_API_URL + path, {
        method: "PUT",
        credentials: "include",
        headers: headers,
        body: JSON.stringify(body),
      })
        .then(async (res: Response) => {
          let parsed = await this.parseRes(
            res,
            () => this.post(path, body, true),
            resent,
            path
          );

          // if (Process.isDev) console.log("PUT", path, "\n", parsed);

          resolve(parsed);
        })
        .catch((err: any) => {
          if (err.status == undefined) {
            Route.load("/maintenance");
          }
          console.error(err);
        });
    });
  }

  static async delete(
    path: string | string[],
    body: any,
    resent: boolean = false
  ): Promise<Res> {
    return new Promise(async (resolve) => {
      // Join path array
      if (Array.isArray(path)) path = path.join("/");

      let headers = new Headers();

      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      if (User.accessToken) {
        headers.append("Authorization", `Bearer ${User.accessToken}`);
      } else if (localStorage.getItem("accessToken")) {
        headers.append(
          "Authorization",
          `Bearer ${localStorage.getItem("accessToken")}`
        );
      }

      await fetch(process.env.NEXT_PUBLIC_API_URL + path, {
        method: "DELETE",
        credentials: "include",
        headers: headers,
        body: JSON.stringify(body),
      })
        .then(async (res: Response) => {
          let parsed = await this.parseRes(
            res,
            () => this.post(path, body, true),
            resent,
            path
          );

          // if (Process.isDev) console.log("DELETE", path, "\n", parsed);

          resolve(parsed);
        })
        .catch((err: any) => {
          if (err.status == undefined) {
            Route.load("/maintenance");
          }
          console.error(err);
        });
    });
  }

  static async parseRes(
    raw: Response,
    resend: Function,
    resent: boolean,
    path: string | string[]
  ) {
    let res: Res = await raw?.json();
    res.success = raw.status >= 200 && raw.status < 300;
    res.status = raw.status;
    res.resend = resend;
    res.resent = resent;

    if (!res.success) return await Error.handle(res, path);
    return res;
  }
}

export default API;
