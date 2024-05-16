"use client"
import React, { useEffect, useState } from 'react';
import useTitle from '@hooks/useTitle';
import Ginner from './ginner-summary-report/page';
import PendingSales from './ginner-pending-sales/page';
import GinnerBalesReport from './ginner-bales-report/page';
import GinnerSales from './ginner-sales/page';
import Link from '@components/core/nav-link';
import Loader from '@components/core/Loader';
import checkAccess from '@lib/CheckAccess';
import useRole from '@hooks/useRole';
import StockReport from './ginner-seed-cotton-stock-report/page';
import useTranslations from '@hooks/useTranslation';
import User from '@lib/User';

const adminPermissions = {
    "create": true,
    "view": true,
    "edit": true,
    "delete": true
}

function MyComponent() {
    const [roleLoading, hasAccess] = useRole();
    const { translations, loading } = useTranslations();
    const [hasGinnerAccess, setHasGinnerAccess] = useState<any>({
        hasSummaryAccess: {},
        hasSaleAccess: {},
        hasProcessAccess: {},
        hasPendingAccess: {},
        hasStockReportAccess: {}
    })

    const [activeProcessorMain, setActiveProcessorMain] = useState('Ginner Section Data');
    const brandId = User.brandId;
    useTitle(activeProcessorMain)

    useEffect(() => {
        setActiveProcessorMain(hasGinnerAccess.hasSummaryAccess.view && hasGinnerAccess.hasSummaryAccess?.view ? 'Ginner Summary Report' : hasGinnerAccess.hasProcessAccess && hasGinnerAccess.hasProcessAccess?.view ? 'Ginner Lint/Bale Process Report' : hasGinnerAccess.hasSaleAccess && hasGinnerAccess.hasSaleAccess?.view ? "Ginner Lint/Bale Sale Report" : hasGinnerAccess.hasPendingAccess.view && hasGinnerAccess.hasPendingAccess?.view ? 'Ginner Pending Sales Report' : hasGinnerAccess?.hasStockReportAccess && hasGinnerAccess.hasStockReportAccess?.view ? 'Ginner Seed Cotton Stock Report' : '')
    }, [hasGinnerAccess])

    useEffect(() => {
        if (!roleLoading) {
            const accessSummary = checkAccess("Ginner Summary Report");
            const accessProcess = checkAccess("Ginner Bales Report");
            const accessSale = checkAccess("Ginner Sales Report");
            const accessPending = checkAccess("Ginner Sales Pending");
            const accessStockReport = checkAccess("Ginner Seed Cotton Stock Report");

            setHasGinnerAccess((prevData: any) => ({
                ...prevData,
                hasSummaryAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessSummary,
                hasSaleAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessSale,
                hasProcessAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessProcess,
                hasPendingAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessPending,
                hasStockReportAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessStockReport
            }));
        }
    }, [roleLoading]);

    const switchProcessorTab = (processorType: string) => {
        setActiveProcessorMain(processorType)
    };

    let content;

    switch (activeProcessorMain) {
        case "Ginner Summary Report":
            content = <Ginner />;
            break;
        case "Ginner Lint/Bale Process Report":
            content = <GinnerBalesReport />;
            break;
        case "Ginner Lint/Bale Sale Report":
            content = <GinnerSales />;
            break;
        case "Ginner Pending Sales Report":
            content = <PendingSales />;
            break;
        case "Ginner Seed Cotton Stock Report":
            content = <StockReport />;
            break;
        default:
            content = <div><Loader /></div>;
            break;
    }

    if (!roleLoading && (!hasGinnerAccess.hasSummaryAccess?.view && !hasGinnerAccess.hasSaleAccess?.view && !hasGinnerAccess.hasProcessAccess?.view && !hasGinnerAccess.hasPendingAccess?.view && !hasGinnerAccess?.hasStockReportAccess?.view)) {
        return (
            <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
                <h3>You doesn't have Access of this Page.</h3>
            </div>
        );
    }

    if (loading) {
        return <div> <Loader /></div>;
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
                            {!brandId && <li>Processing Reports</li>}
                            <li>{activeProcessorMain}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="topTrader d-block">
                <section className="">
                    {hasGinnerAccess.hasSummaryAccess?.view && (
                        <button
                            className={` w-100 ${activeProcessorMain === "Ginner Summary Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Ginner Summary Report")}
                        >
                            Ginner Summary Report
                        </button>
                    )}
                    {hasGinnerAccess.hasProcessAccess?.view && (
                        <button
                            className={` w-100 ${activeProcessorMain === "Ginner Lint/Bale Process Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Ginner Lint/Bale Process Report")}
                        >
                            Ginner Lint/Bale Process Report
                        </button>
                    )}

                    {hasGinnerAccess.hasSaleAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Ginner Lint/Bale Sale Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Ginner Lint/Bale Sale Report")}
                        >
                            Ginner Lint/Bale Sale Report
                        </button>
                    )}
                    {hasGinnerAccess.hasPendingAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Ginner Pending Sales Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Ginner Pending Sales Report")}
                        >
                            Ginner Pending Sales Report
                        </button>
                    )}
                    {hasGinnerAccess.hasStockReportAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Ginner Seed Cotton Stock Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Ginner Seed Cotton Stock Report")}
                        >
                            Ginner Seed Cotton Stock Report
                        </button>
                    )}
                </section >
                <section className="buttonTab">
                </section>
            </div >
            {content}
        </div>
    );
}

export default MyComponent;
