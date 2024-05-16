"use client";
import Link from "@components/core/nav-link";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <div className="bg-zinc-100 rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-2xl font-bold text-center rounded-t text-white bg-blue-950 py-1">
          Sign in to your account
        </h1>
        <div className="p-6">
          <form className="mt-2">
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-800"
              >
                Username
              </label>
              <input
                type="username"
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-800"
              >
                Password
              </label>
              <input
                type="password"
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
              />
            </div>
            <div>
              <label>
                <input type="checkbox" value="remember-me" /> Remember me
              </label>
            </div>
            <div className="mt-2">
              <Link
                href={"/dashboard"}
                className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-950 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600 mb-3"
              >
                Sign In
              </Link>
              <div className="flex justify-center mt-3">
                <Link
                  href="/auth/forgotpassword"
                  className="text-xs text-blue-600 hover:underline justify-self-center"
                >
                  Forget Password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
