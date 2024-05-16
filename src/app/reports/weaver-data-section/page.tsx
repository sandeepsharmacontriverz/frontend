"use client"
import React, { useEffect, useState } from 'react';
import useTitle from '@hooks/useTitle';
import Link from '@components/core/nav-link';
import WeaverFabricSale from './weaver-fabric-sale/page';
import WeaverYarnReciept from './weaver-yarn-receipt/page';
import WeaverProcessReport from './weaver-process-report/page';
import Loader from '@components/core/Loader';
import checkAccess from '@lib/CheckAccess';
import useRole from '@hooks/useRole';
import User from '@lib/User';

const adminPermissions = {
    "create": true,
    "view": true,
    "edit": true,
    "delete": true
}
function MyComponent() {
    const [roleLoading, hasAccess] = useRole();
    const [hasWeaverAccess, setHasWeaverAccess] = useState<any>({
        hasSaleAccess: {},
        hasProcessAccess: {},
        hasPendingAccess: {},
    })

    const [activeProcessorMain, setActiveProcessorMain] = useState('Weaver Section Data');
    const brandId = User.brandId;
    useTitle(activeProcessorMain)

    useEffect(() => {
        setActiveProcessorMain(hasWeaverAccess?.hasPendingAccess?.view && hasWeaverAccess?.hasPendingAccess?.view ? 'Weaver Yarn Receipt Report' : hasWeaverAccess?.hasProcessAccess?.view && hasWeaverAccess?.hasProcessAccess?.view ? 'Weaver Yarn Process Report' : hasWeaverAccess?.hasSaleAccess?.view && hasWeaverAccess.hasSaleAccess?.view ? "Weaver Fabric Sales Report" : '')
    }, [hasWeaverAccess])

    useEffect(() => {
        if (!roleLoading) {
            const accessProcess = checkAccess("Weaver Process Report");
            const accessSale = checkAccess("Weaver Fabric Sale");
            const accessPending = checkAccess("Weaver Yarn Receipt");

            if (accessProcess && accessSale && accessPending) {
                setHasWeaverAccess((prevData: any) => ({
                    ...prevData,
                    hasSaleAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessSale,
                    hasProcessAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessProcess,
                    hasPendingAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessPending,
                }));
            }
        }
    }, [roleLoading]);

    const switchProcessorTab = (processorType: string) => {
        setActiveProcessorMain(processorType)
    };

    let content;

    switch (activeProcessorMain) {
        case "Weaver Yarn Process Report":
            content = <WeaverProcessReport />;
            break;
        case "Weaver Fabric Sales Report":
            content = <WeaverFabricSale />;
            break;
        case "Weaver Yarn Receipt Report":
            content = <WeaverYarnReciept />;
            break;

        default:
            content = <div><Loader /></div>;
            break;
    }

    if (!roleLoading && (!hasWeaverAccess.hasSaleAccess?.view && !hasWeaverAccess?.hasProcessAccess?.view && !hasWeaverAccess?.hasPendingAccess?.view)) {
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
                    {hasWeaverAccess?.hasPendingAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Weaver Yarn Receipt Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Weaver Yarn Receipt Report")}
                        >
                            Weaver Yarn Receipt Report
                        </button>
                    )}
                    {hasWeaverAccess?.hasProcessAccess?.view && (
                        <button
                            className={` w-100 ${activeProcessorMain === "Weaver Yarn Process Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Weaver Yarn Process Report")}
                        >
                            Weaver Yarn Process Report</button>
                    )}

                    {hasWeaverAccess?.hasSaleAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Weaver Fabric Sales Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Weaver Fabric Sales Report")}
                        >
                            Weaver Fabric Sales Report
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
