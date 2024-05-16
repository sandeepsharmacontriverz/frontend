import { Res } from "./Api";
import { toasterError } from "@components/core/Toaster";
import User from "./User";

export interface IErrorHandler {
  refresh?: boolean;
  toast?: string;
  validation?: boolean;
  signOut?: boolean;
}

function refresh() {
  return { refresh: true };
}

function signOut() {
  return { signOut: true };
}

function snackBar(message: string) {
  return { snackBar: message };
}

function toast(message: string) {
  return { toast: message };
}

export const errorCodes: { [key: string]: IErrorHandler } = {
  ERR_INVALID_TOKEN: signOut(),
  ERR_AUTH_TOKEN_MISSING: signOut(),
  ERR_ACCESS_TOKEN_MISSING: signOut(),
  ERR_ACCESS_TOKEN_EXPIRED: signOut(),
  ERR_AUTH_TOKEN_EXPIRED: signOut(),
  ERR_INVALID_ACCESS_TOKEN: signOut(),
  ERR_AUTH_WRONG_REFRESH_TOKEN: signOut(),
  ERR_NOT_AUTHORIZED: toast("Not authorized"),
  ERR_PAYMENT_FAILED: toast("Payment failed!"),
  ERR_AUTH_WRONG_OLD_PASSWORD: toast("Old Password is incorrect"),
  ERR_AUTH_WRONG_USERNAME_OR_PASSWORD: toast("Wrong email or password"),
  ERR_AUTH_WRONG_PASSWORD_RESET_TOKEN: toast("Reset Token expired"),
  // ERR_AUTH_USERNAME_OR_EMAIL_ALREADY_EXIST: toast("Email already exists"),
  ERR_AUTH_PASSWORD_RESET_WRONG_EMAIL: toast("Email does not exist"),
  ERR_AUTH_REFRESH_EXPIRED: signOut(),
  ERR_VALIDATION: { validation: true },
};

async function handle(res: Res, route: string | string[]) {
  if (res.status == 200) return res;

  if (!res.error.code) {
    console.log("Error", res.error.code);
    toasterError(`An Error occurred | Code: ${res.status}`);
    return res;
  }

  let error: IErrorHandler | undefined =
    errorCodes[res.error.code] ||
    res.error.code == "ERR_AUTH_WRONG_USERNAME" ||
    res.error.code == "ERR_AUTH_WRONG_PASSWORD" ||
    res.error.code == "ERR_AUTH_WRONG_USERNAME_OR_PASSWORD"; // Error not defined

  if (!error) {
    console.log("Error-----", res.error.code);
    return res;
  }

  if (error.toast) {
    toasterError(error.toast, 3000, res.error.code);
    return res;
  }

  if (error.signOut) {
    await User.signOut();
    return res;
  }

  if (error.validation) {
    if (Array.isArray(res.data.body) && res.data.body.length > 0) {
      toasterError(res.data.body[0].message);
    } else toasterError("Validation error!");
    return res;
  }
  return res;
}

export default { handle };
