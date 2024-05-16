"use client";
import React, { useEffect, useState } from "react";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import Organic from "./organic/page";
import NonOrganic from "./non-organic/page";
import FailedReports from "./failed-farmer-report/page";

const adminPermissions = {
  create: true,
  view: true,
  edit: true,
  delete: true,
};

function FarmerReports() {
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();

  const [hasFarmerAccess, setHasFarmerAccess] = useState<any>({
    hasOrganicAccess: {},
    hasNonOrganicAccess: {},
    hasFailedReportsAccess: {},
  });

  const [activeProcessorMain, setActiveProcessorMain] =
    useState("Organic Reports");
  useTitle(activeProcessorMain);

  useEffect(() => {
    setActiveProcessorMain(
      hasFarmerAccess?.hasOrganicAccess?.view &&
        hasFarmerAccess?.hasOrganicAccess?.view
        ? "Organic Reports"
        : hasFarmerAccess?.hasNonOrganicAccess &&
          hasFarmerAccess?.hasNonOrganicAccess?.view
        ? "Non Organic Reports"
        : hasFarmerAccess?.hasFailedReportsAccess &&
          hasFarmerAccess?.hasFailedReportsAccess?.view
        ? "Failed Farmer Reports"
        : ""
    );
  }, [hasFarmerAccess]);

  useEffect(() => {
    if (!roleLoading) {
      const accessOrganic = checkAccess("Organic Farmer Report");
      const accessNonOrganic = checkAccess("Non Organic Farmer Report");
      const accessFailedReports = checkAccess("Failed Farmer Reports");

      setHasFarmerAccess((prevData: any) => ({
        ...prevData,
        hasOrganicAccess:
          hasAccess?.role?.userCategory?.category_name === "Superadmin" ||
          hasAccess?.role?.userCategory?.category_name === "Developer"
            ? adminPermissions
            : accessOrganic,
        hasFailedReportsAccess:
          hasAccess?.role?.userCategory?.category_name === "Superadmin" ||
          hasAccess?.role?.userCategory?.category_name === "Developer"
            ? adminPermissions
            : accessFailedReports,
        hasNonOrganicAccess:
          hasAccess?.role?.userCategory?.category_name === "Superadmin" ||
          hasAccess?.role?.userCategory?.category_name === "Developer"
            ? adminPermissions
            : accessNonOrganic,
      }));
    }
  }, [roleLoading]);

  const switchProcessorTab = (processorType: string) => {
    setActiveProcessorMain(processorType);
  };

  let content;
  switch (activeProcessorMain) {
    case "Organic Reports":
      content = <Organic />;
      break;
    case "Non Organic Reports":
      content = <NonOrganic />;
      break;
    case "Failed Farmer Reports":
      content = <FailedReports />;
      break;
    default:
      content = (
        <div>
          {" "}
          <Loader />
        </div>
      );
      break;
  }

  if (
    !roleLoading &&
    !hasFarmerAccess.hasOrganicAccess?.view &&
    !hasFarmerAccess.hasFailedReportsAccess?.view &&
    !hasFarmerAccess.hasNonOrganicAccess?.view
  ) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (loading || roleLoading) {
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
                <Link href="/dashboard">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>{translations.common.reports}</li>
              <li>
                <Link href="/reports/farmer-report">
                  {translations.reports.farmerReports}
                </Link>
              </li>
              <li>{activeProcessorMain}</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="topTrader d-block">
        <section className="">
          {hasFarmerAccess.hasOrganicAccess?.view && (
            <button
              className={`w-100 ${
                activeProcessorMain === "Organic Reports" ? "activeFilter" : ""
              }`}
              type="button"
              onClick={() => switchProcessorTab("Organic Reports")}
            >
              {translations.reports.organicFarmerReports}
            </button>
          )}
          {hasFarmerAccess.hasNonOrganicAccess?.view && (
            <button
              className={` w-100 ${
                activeProcessorMain === "Non Organic Reports"
                  ? "activeFilter"
                  : ""
              }`}
              type="button"
              onClick={() => switchProcessorTab("Non Organic Reports")}
            >
              {translations.reports.nonOrganicFarmerReports}
            </button>
          )}

          {hasFarmerAccess.hasFailedReportsAccess?.view && (
            <button
              className={`w-100 ${
                activeProcessorMain === "Failed Farmer Reports"
                  ? "activeFilter"
                  : ""
              }`}
              type="button"
              onClick={() => switchProcessorTab("Failed Farmer Reports")}
            >
              Failed Farmer Reports
            </button>
          )}
        </section>
        <section className="buttonTab"></section>
      </div>
      {content}
    </div>
  );
}

export default FarmerReports;
