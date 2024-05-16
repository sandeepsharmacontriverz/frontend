"use client";
import React, { useEffect, useState } from "react";
import useTitle from "@hooks/useTitle";

import Link from "@components/core/nav-link";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import ProcurementReport from "./procurement-report/page";
import FailedRecord from "./failed-records/page";
import ProcurementTracker from "./procurement-tracker/page";
import Procurementtracker from "./procurement-sell-live-tracker/page";
import QrProcurementReport from "./qr-app-procurement-report/page";

import User from "@lib/User";

const adminPermissions = {
  create: true,
  view: true,
  edit: true,
  delete: true,
};

function MyComponent() {
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();
  const [hasProcurementAccess, setHasProcurementAccess] = useState<any>({
    hasProcurementReport: {},
    hasProcurementTracker: {},
    hasFailedReport: {},
    hasAppProcurementReport: {},
    hasliveTracker: {},
  });

  const [activeProcessorMain, setActiveProcessorMain] =
    useState("Procurement Report");
  const brandId = User.brandId;
  useTitle(activeProcessorMain);

  useEffect(() => {
    const activeTab: any = sessionStorage.getItem("Tab");
    if (activeTab) {
      setActiveProcessorMain(activeTab);
    } else {
      setActiveProcessorMain(
        hasProcurementAccess.hasProcurementReport.view &&
          hasProcurementAccess.hasProcurementReport?.view
          ? "Procurement Report"
          : hasProcurementAccess.hasFailedReport &&
            hasProcurementAccess.hasFailedReport?.view
          ? "Failed Procurement Report"
          : hasProcurementAccess.hasProcurementTracker &&
            hasProcurementAccess.hasProcurementTracker?.view
          ? "Procurement Tracker"
          : hasProcurementAccess.hasAppProcurementReport.view &&
            hasProcurementAccess.hasAppProcurementReport?.view
          ? "QR App Procurement Report"
          : hasProcurementAccess?.hasliveTracker &&
            hasProcurementAccess.hasliveTracker?.view
          ? "Procurement Sell & Live Tracker"
          : ""
      );
    }
  }, [hasProcurementAccess]);

  useEffect(() => {
    if (!roleLoading) {
      const accessProcurementReport = checkAccess("Procurement Report");
      const accessProcurementTracker = checkAccess("Procurement Tracker");
      const accessLiveTracker = checkAccess(
        "PSCP Procurement and Sell Live Tracker"
      );
      const accessAppProcurementReport = checkAccess("APP Procurement Report");
      const accessFailedReport = checkAccess("Failed procurement Report");

      setHasProcurementAccess((prevData: any) => ({
        ...prevData,
        hasProcurementReport:
          hasAccess?.role?.userCategory?.category_name === "Superadmin" ||
          hasAccess?.role?.userCategory?.category_name === "Developer"
            ? adminPermissions
            : accessProcurementReport,
        hasProcurementTracker:
          hasAccess?.role?.userCategory?.category_name === "Superadmin" ||
          hasAccess?.role?.userCategory?.category_name === "Developer"
            ? adminPermissions
            : accessProcurementTracker,
        hasFailedReport:
          hasAccess?.role?.userCategory?.category_name === "Superadmin" ||
          hasAccess?.role?.userCategory?.category_name === "Developer"
            ? adminPermissions
            : accessFailedReport,
        hasAppProcurementReport:
          hasAccess?.role?.userCategory?.category_name === "Superadmin" ||
          hasAccess?.role?.userCategory?.category_name === "Developer"
            ? adminPermissions
            : accessAppProcurementReport,
        hasliveTracker:
          hasAccess?.role?.userCategory?.category_name === "Superadmin" ||
          hasAccess?.role?.userCategory?.category_name === "Developer"
            ? adminPermissions
            : accessLiveTracker,
      }));
    }
  }, [roleLoading]);

  const switchProcessorTab = (processorType: string) => {
    setActiveProcessorMain(processorType);
    sessionStorage.removeItem("Tab");
  };

  let content;

  switch (activeProcessorMain) {
    case "Procurement Report":
      content = <ProcurementReport />;
      break;
    case "Failed Procurement Report":
      content = <FailedRecord />;
      break;
    case "Procurement Tracker":
      content = <ProcurementTracker />;
      break;
    case "Procurement Sell & live Tracker":
      content = <Procurementtracker />;
      break;
    case "QR App Procurement Report":
      content = <QrProcurementReport />;
      break;

    default:
      content = (
        <div>
          <Loader />
        </div>
      );
      break;
  }

  if (
    !roleLoading &&
    !hasProcurementAccess.hasProcurementReport?.view &&
    !hasProcurementAccess.hasProcurementTracker?.view &&
    !hasProcurementAccess.hasFailedReport?.view &&
    !hasProcurementAccess.hasAppProcurementReport?.view &&
    !hasProcurementAccess?.hasliveTracker?.view
  ) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li className="active">
                <Link href={brandId ? "/brand/dashboard" : "/dashboard"}>
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Reports</li>
              <li>Procurement</li>
              <li>{activeProcessorMain}</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="topTrader d-block">
        <section className="">
          {hasProcurementAccess.hasProcurementReport?.view && (
            <button
              className={` w-100 ${
                activeProcessorMain === "Procurement Report"
                  ? "activeFilter"
                  : ""
              }`}
              type="button"
              onClick={() => switchProcessorTab("Procurement Report")}
            >
              Procurement Report
            </button>
          )}
          {hasProcurementAccess.hasFailedReport?.view && (
            <button
              className={` w-100 ${
                activeProcessorMain === "Failed Procurement Report"
                  ? "activeFilter"
                  : ""
              }`}
              type="button"
              onClick={() => switchProcessorTab("Failed Procurement Report")}
            >
              Failed Procurement Report
            </button>
          )}

          {hasProcurementAccess.hasProcurementTracker?.view && (
            <button
              className={`w-100 ${
                activeProcessorMain === "Procurement Tracker"
                  ? "activeFilter"
                  : ""
              }`}
              type="button"
              onClick={() => switchProcessorTab("Procurement Tracker")}
            >
              Procurement Tracker
            </button>
          )}

          {hasProcurementAccess.hasliveTracker?.view && (
            <button
              className={`w-100 ${
                activeProcessorMain === "Procurement Sell & live Tracker"
                  ? "activeFilter"
                  : ""
              }`}
              type="button"
              onClick={() =>
                switchProcessorTab("Procurement Sell & live Tracker")
              }
            >
              Procurement Sell & Live Tracker
            </button>
          )}

          {hasProcurementAccess.hasAppProcurementReport?.view && (
            <button
              className={`w-100 ${
                activeProcessorMain === "QR App Procurement Report"
                  ? "activeFilter"
                  : ""
              }`}
              type="button"
              onClick={() => switchProcessorTab("QR App Procurement Report")}
            >
              QR App Procurement Report
            </button>
          )}
        </section>
        <section className="buttonTab"></section>
      </div>
      {content}
    </div>
  );
}

export default MyComponent;
