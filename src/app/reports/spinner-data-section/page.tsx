"use client"
import React, { useEffect, useState } from 'react';
import useTitle from '@hooks/useTitle';
import Link from '@components/core/nav-link';

import SpinnerSummaryReport from './spinner-summary-report/page';
import SpinnerYarnProcess from './spinner-yarn-process/page';
import SpinnerYarnSales from './spinner-yarn-sale/page';
import SpinnerBalesRecipt from './spinner-bales-receipt/page';
import SpinnerPendingBales from './spinner-pending-bales-receipt/page';
import Loader from '@components/core/Loader';
import checkAccess from '@lib/CheckAccess';
import useRole from '@hooks/useRole';
import SpinnerStockReport from './spinner-lint-cotton-stock-report/page';
import User from '@lib/User';

const adminPermissions = {
    "create": true,
    "view": true,
    "edit": true,
    "delete": true
}

function MyComponent() {
    const [roleLoading, hasAccess] = useRole();
    const [hasSpinnerAccess, setHasSpinnerAccess] = useState<any>({
        hasSummaryAccess: {},
        hasBaleReceipt: {},
        hasSaleAccess: {},
        hasProcessAccess: {},
        hasPendingAccess: {},
        hasStockReportAccess: {}
    })

    const [activeProcessorMain, setActiveProcessorMain] = useState('Spinner Section Data');
    const brandId = User.brandId;
    useTitle(activeProcessorMain)

    useEffect(() => {
        setActiveProcessorMain(hasSpinnerAccess?.hasSummaryAccess?.view && hasSpinnerAccess?.hasSummaryAccess?.view ? 'Spinner Summary Report' : hasSpinnerAccess?.hasBaleReceipt?.view && hasSpinnerAccess?.hasBaleReceipt?.view ? 'Spinner Bale Receipt Report' : hasSpinnerAccess?.hasProcessAccess?.view && hasSpinnerAccess?.hasProcessAccess?.view ? 'Spinner Yarn Process Report' : hasSpinnerAccess?.hasSaleAccess?.view && hasSpinnerAccess?.hasSaleAccess?.view ? "Spinner Yarn Sales Report" : hasSpinnerAccess?.hasPendingAccess?.view && hasSpinnerAccess?.hasPendingAccess?.view ? 'Spinner Pending Bales Report' : hasSpinnerAccess?.hasStockReportAccess && hasSpinnerAccess.hasStockReportAccess?.view ? 'Spinner Lint Cotton Stock Report' : '')
    }, [hasSpinnerAccess])

    useEffect(() => {
        if (!roleLoading) {
            const accessSummary = checkAccess("Spinner Summary Report");
            const accessReceipt = checkAccess("Spinner Bale Receipt")
            const accessProcess = checkAccess("Spinner Yarn Process");
            const accessSale = checkAccess("Spinner Yarn Sale");
            const accessPending = checkAccess("Spinner Pending Bales Receipt Report");
            const accessStockReport = checkAccess("Spinner Lint Cotton Stock Report");

            if (accessProcess && accessSale && accessPending) {
                setHasSpinnerAccess((prevData: any) => ({
                    ...prevData,
                    hasSummaryAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessSummary,
                    hasBaleReceipt: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessReceipt,
                    hasSaleAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessSale,
                    hasProcessAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessProcess,
                    hasPendingAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessPending,
                    hasStockReportAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessStockReport
                }));
            }
        }
    }, [roleLoading]);

    const switchProcessorTab = (processorType: string) => {
        setActiveProcessorMain(processorType)
    };

    let content;

    switch (activeProcessorMain) {
        case "Spinner Summary Report":
            content = <SpinnerSummaryReport />;
            break;
        case "Spinner Bale Receipt Report":
            content = <SpinnerBalesRecipt />;
            break;
        case "Spinner Yarn Process Report":
            content = <SpinnerYarnProcess />;
            break;
        case "Spinner Yarn Sales Report":
            content = <SpinnerYarnSales />;
            break;
        case "Spinner Pending Bales Report":
            content = <SpinnerPendingBales />;
            break;
        case "Spinner Lint Cotton Stock Report":
            content = <SpinnerStockReport />;
            break;
        default:
            content = <div><Loader /></div>;
            break;
    }

    if (!roleLoading && (!hasSpinnerAccess?.hasSummaryAccess?.view && !hasSpinnerAccess?.hasSaleAccess?.view && !hasSpinnerAccess?.hasProcessAccess?.view && !hasSpinnerAccess?.hasPendingAccess?.view && !hasSpinnerAccess?.hasStockReportAccess?.view)) {
        return (
            <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
                <h3>You doesn't have Access of this Page.</h3>
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
                            {!brandId && <li>Processing Reports</li>}
                            <li>{activeProcessorMain}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="topTrader d-block">
                <section className="">
                    {hasSpinnerAccess?.hasSummaryAccess?.view && (
                        <button
                            className={` w-100 ${activeProcessorMain === "Spinner Summary Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Spinner Summary Report")}
                        >
                            Spinner Summary Report
                        </button>
                    )}

                    {hasSpinnerAccess?.hasBaleReceipt?.view && (
                        <button
                            className={` w-100 ${activeProcessorMain === "Spinner Bale Receipt Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Spinner Bale Receipt Report")}
                        >
                            Spinner Bale Receipt Report</button>
                    )}

                    {hasSpinnerAccess?.hasProcessAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Spinner Yarn Process Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Spinner Yarn Process Report")}
                        >
                            Spinner Yarn Process Report
                        </button>
                    )}

                    {hasSpinnerAccess?.hasSaleAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Spinner Yarn Sales Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Spinner Yarn Sales Report")}
                        >
                            Spinner Yarn Sales Report
                        </button>
                    )}
                    {hasSpinnerAccess?.hasPendingAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Spinner Pending Bales Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Spinner Pending Bales Report")}
                        >
                            Spinner Pending Bales Report
                        </button>
                    )}
                    {hasSpinnerAccess?.hasStockReportAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Spinner Lint Cotton Stock Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Spinner Lint Cotton Stock Report")}
                        >
                            Spinner Lint Cotton Stock Report
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
