"use client"
import React, { useEffect, useState } from 'react';
import useTitle from '@hooks/useTitle';
import Link from '@components/core/nav-link';
import KnitterFabricSales from './knitter-fabric-sale/page';
import KnitterYarnReciept from './knitter-yarn-receipt/page';
import KnitterProcessReport from './knitter-process-report/page';
import checkAccess from '@lib/CheckAccess';
import useRole from '@hooks/useRole';
import Loader from '@components/core/Loader';
import User from '@lib/User';

const adminPermissions = {
    "create": true,
    "view": true,
    "edit": true,
    "delete": true
}
function MyComponent() {
    const [roleLoading, hasAccess] = useRole();
    const [hasKnitterAccess, setHasKnitterAccess] = useState<any>({
        hasSaleAccess: {},
        hasProcessAccess: {},
        hasReceiptAccess: {},
    })

    const [activeProcessorMain, setActiveProcessorMain] = useState('Knitter Section Data');
    const brandId = User.brandId;
    useTitle(activeProcessorMain)

    useEffect(() => {
        setActiveProcessorMain(hasKnitterAccess?.hasReceiptAccess.view && hasKnitterAccess?.hasReceiptAccess?.view ? 'Knitter Yarn Receipt Report' : hasKnitterAccess?.hasProcessAccess && hasKnitterAccess?.hasProcessAccess?.view ? 'Knitter Fabric Process Report' : hasKnitterAccess?.hasSaleAccess && hasKnitterAccess?.hasSaleAccess?.view ? "Knitter Fabric Sales Report" : '')
    }, [hasKnitterAccess])

    useEffect(() => {
        if (!roleLoading) {
            const accessaccessReceipt = checkAccess("Knitter Yarn Receipt");
            const accessProcess = checkAccess("Knitter Process Report");
            const accessSale = checkAccess("Knitter Fabric Sale");

            if (accessProcess && accessSale && accessaccessReceipt) {
                setHasKnitterAccess((prevData: any) => ({
                    ...prevData,
                    hasReceiptAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessaccessReceipt,
                    hasSaleAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessSale,
                    hasProcessAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessProcess,
                }));
            }
        }
    }, [roleLoading]);

    const switchProcessorTab = (processorType: string) => {
        setActiveProcessorMain(processorType)
    };

    let content;

    switch (activeProcessorMain) {
        case "Knitter Fabric Process Report":
            content = <KnitterProcessReport />;
            break;
        case "Knitter Fabric Sales Report":
            content = <KnitterFabricSales />;
            break;
        case "Knitter Yarn Receipt Report":
            content = <KnitterYarnReciept />;
            break;

        default:
            content = <div><Loader /></div>;
            break;
    }

    if (!roleLoading && (!hasKnitterAccess?.hasSaleAccess?.view && !hasKnitterAccess?.hasProcessAccess?.view && !hasKnitterAccess?.hasReceiptAccess?.view)) {
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
                    {hasKnitterAccess?.hasReceiptAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Knitter Yarn Receipt Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Knitter Yarn Receipt Report")}
                        >
                            Knitter Yarn Receipt Report
                        </button>
                    )}
                    {hasKnitterAccess?.hasProcessAccess?.view && (
                        <button
                            className={` w-100 ${activeProcessorMain === "Knitter Fabric Process Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Knitter Fabric Process Report")}
                        >
                            Knitter Fabric Process Report</button>
                    )}
                    {hasKnitterAccess?.hasSaleAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Knitter Fabric Sales Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Knitter Fabric Sales Report")}
                        >
                            Knitter Fabric Sales Report
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
