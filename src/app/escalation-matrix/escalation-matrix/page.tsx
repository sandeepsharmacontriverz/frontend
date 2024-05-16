"use client";
import React, { useEffect, useState, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EscalationMatrixDashboard from "../analytical-dashboard/page";
import TicketingTracker from "../ticketing-list/page";
import Loader from "@components/core/Loader";

export default function page() {
  const [roleLoading] = useRole();
  const { translations, loading } = useTranslations();
  const [activeProcessor, setActiveProcessor] = useState(
    "Analytical Dashboard"
  );
  useTitle(activeProcessor);

  const router = useRouter();

  const switchProcessorTab = (processorType: string) => {
    setActiveProcessor(processorType);
  };

  if (loading) {
    return (
      <div>
        {" "}
        <Loader />{" "}
      </div>
    );
  }
  if (!roleLoading) {
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
                <li>Escalation Matrix</li>
                <li>{activeProcessor}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="topTrader d-block">
          <section className="d-flex">
            <button
              className={`w-100 ${
                activeProcessor === "Analytical Dashboard" ? "activeFilter" : ""
              }`}
              type="button"
              onClick={() => switchProcessorTab("Analytical Dashboard")}
            >
              Analytical Dashboard
            </button>
            <button
              className={`w-100 ${
                activeProcessor === "Ticketing List" ? "activeFilter" : ""
              }`}
              type="button"
              onClick={() => switchProcessorTab("Ticketing List")}
            >
              Ticketing List
            </button>
          </section>
          <section className="buttonTab"></section>
        </div>

        <div className="content-container">
          {activeProcessor === "Analytical Dashboard" && (
            <EscalationMatrixDashboard />
          )}
          {activeProcessor === "Ticketing List" && <TicketingTracker />}
        </div>
      </div>
    );
  }
}
