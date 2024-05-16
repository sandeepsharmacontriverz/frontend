"use client"
import React, { useEffect, useState } from 'react';
import useTitle from '@hooks/useTitle';
import Dashboard from "../quality-parameter/quality-parameter-dashboard/page"
import Analtyics from "../quality-parameter/quality-parameter-analytics/page"
import Graph from "../quality-parameter/quality-parameter-graph/page"
import Link from '@components/core/nav-link';
import useTranslations from "@hooks/useTranslation";

function MyComponent() {
    const { translations } = useTranslations();

    const [activeProcessorMain, setActiveProcessorMain] = useState(translations?.common?.GlobalParameterDashboard);
    useTitle(activeProcessorMain)
    useEffect(() => {
        let activeTab = sessionStorage.getItem("activetab");
        if (translations) {
            if (translations?.common?.GlobalParameterDashboard === activeTab) {
                setActiveProcessorMain(translations?.common?.GlobalParameterDashboard);
            } else if (translations?.common?.QualityParameterGrap === activeTab) {
                setActiveProcessorMain(translations?.common?.QualityParameterGrap);
            } else if (translations?.common?.QualityParameterAnalytic === activeTab) {
                setActiveProcessorMain(translations?.common?.QualityParameterAnalytic);
            } else {
                setActiveProcessorMain(translations?.common?.GlobalParameterDashboard);
            }
        }
    }, [translations]);
    const switchProcessorTab = (processorType: string) => {
        setActiveProcessorMain(processorType)
        sessionStorage.removeItem("activetab")
    };

    let content;

    switch (activeProcessorMain) {
        case translations?.common?.GlobalParameterDashboard:
            content = <Dashboard />;
            break;
        case translations?.common?.QualityParameterGraph:
            content = <Graph />;
            break;
        case translations?.common?.QualityParameterAnalytic:
            content = <Analtyics />;
            break;
        default:
            content = <div>Invalid processor type</div>;
            break;
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
                            <li>{translations?.common?.QualityParameter}</li>
                            <li>{activeProcessorMain}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="topTrader d-block">
                <section className="d-flex">
                    <button
                        className={` w-100 ${activeProcessorMain === translations?.common?.GlobalParameterDashboard ? "activeFilter" : ""
                            }`}
                        type="button"
                        onClick={() => switchProcessorTab(translations?.common?.GlobalParameterDashboard)}
                    >
                        {translations?.common?.GlobalParameterDashboard}
                    </button>
                    <button
                        className={` w-100 ${activeProcessorMain === translations?.common?.QualityParameterGraph ? "activeFilter" : ""
                            }`}
                        type="button"
                        onClick={() => switchProcessorTab(translations?.common?.QualityParameterGraph)}
                    >
                        {translations?.common?.QualityParameterGraph}
                    </button>
                    <button
                        className={`w-100 ${activeProcessorMain === translations?.common?.QualityParameterAnalytic ? "activeFilter" : ""
                            }`}
                        type="button"
                        onClick={() => switchProcessorTab(translations?.common?.QualityParameterAnalytic)}
                    >
                        {translations?.common?.QualityParameterAnalytic}
                    </button>
                </section >
                <section className="buttonTab">
                </section>
            </div >
            {content}
        </div>
    );
}

export default MyComponent;
