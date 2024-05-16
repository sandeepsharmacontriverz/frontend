"use client"
import React, { useEffect, useState } from 'react';
import useTitle from '@hooks/useTitle';
import Link from '@components/core/nav-link';
import GarmentFabricRecipt from './garment-fabric-receipt/page';
import GarmentSale from './garment-sale-report/page';
import GarmentProcessReport from './garment-process-report/page';
import useRole from '@hooks/useRole';
import checkAccess from '@lib/CheckAccess';
import Loader from '@components/core/Loader';
import Qrcode from './qr-code-track/page';
import User from '@lib/User';

const adminPermissions = {
    "create": true,
    "view": true,
    "edit": true,
    "delete": true
}
function MyComponent() {
    const [roleLoading, hasAccess] = useRole();
    const [hasGarmentAccess, setHasGarmentAccess] = useState<any>({
        hasSaleAccess: {},
        hasProcessAccess: {},
        hasPendingAccess: {},
        hasQrReport: {}
    })

    const [activeProcessorMain, setActiveProcessorMain] = useState('Garment Section Data');
    const brandId = User.brandId;
    useTitle(activeProcessorMain)

    useEffect(() => {
        setActiveProcessorMain(hasGarmentAccess?.hasPendingAccess.view && hasGarmentAccess?.hasPendingAccess?.view ? 'Garment Fabric Receipt Report' : hasGarmentAccess?.hasSummaryAccess?.view && hasGarmentAccess?.hasSummaryAccess?.view ? 'Garment Summary Report' : hasGarmentAccess?.hasProcessAccess && hasGarmentAccess?.hasProcessAccess?.view ? 'Garment Process Report' : hasGarmentAccess?.hasSaleAccess && hasGarmentAccess?.hasSaleAccess?.view ? "Garment Sales Report" : hasGarmentAccess.hasQrReport.view && hasGarmentAccess.hasQrReport?.view ? "QR Code Track" : '')
    }, [hasGarmentAccess])

    useEffect(() => {
        if (!roleLoading) {
            const accessProcess = checkAccess("Garment Process Report");
            const accessSale = checkAccess("Garment Sale Report");
            const accessPending = checkAccess("Garment Fabric Receipt");
            const accessQRReport = checkAccess("QR Code Track");


            if (accessProcess && accessSale && accessPending) {
                setHasGarmentAccess((prevData: any) => ({
                    ...prevData,
                    hasSaleAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessSale,
                    hasProcessAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessProcess,
                    hasPendingAccess: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessPending,
                    hasQrReport: hasAccess?.role?.userCategory?.category_name === "Superadmin" || hasAccess?.role?.userCategory?.category_name === "Developer" ? adminPermissions : accessQRReport,

                }));
            }
        }
    }, [roleLoading]);


    const switchProcessorTab = (processorType: string) => {
        setActiveProcessorMain(processorType)
    };

    let content;

    switch (activeProcessorMain) {
        case "Garment Process Report":
            content = <GarmentProcessReport />;
            break;
        case "Garment Sales Report":
            content = <GarmentSale />;
            break;
        case "Garment Fabric Receipt Report":
            content = <GarmentFabricRecipt />;
            break;
        case "QR Code Track":
            content = <Qrcode />;
            break;

        default:
            content = <div><Loader /></div>;
            break;
    }

    if (!roleLoading && (!hasGarmentAccess?.hasSaleAccess?.view && !hasGarmentAccess?.hasProcessAccess?.view && !hasGarmentAccess?.hasPendingAccess?.view && !hasGarmentAccess?.hasQrReport?.view)) {
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
                <section className="d-flex">
                    {hasGarmentAccess?.hasPendingAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Garment Fabric Receipt Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Garment Fabric Receipt Report")}
                        >
                            Garment Fabric Receipt Report
                        </button>
                    )}
                    {hasGarmentAccess?.hasProcessAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Garment Process Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Garment Process Report")}
                        >
                            Garment Process Report</button>
                    )}
                    {hasGarmentAccess?.hasSaleAccess?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "Garment Sales Report" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("Garment Sales Report")}
                        >
                            Garment Sales Report
                        </button>
                    )}
                    {hasGarmentAccess.hasQrReport?.view && (
                        <button
                            className={`w-100 ${activeProcessorMain === "QR Code Track" ? "activeFilter" : ""
                                }`}
                            type="button"
                            onClick={() => switchProcessorTab("QR Code Track")}
                        >
                            QR Code Tracker Report
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
