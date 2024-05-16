"use client"
import React, { useEffect, useState } from 'react';
import useTitle from '@hooks/useTitle';
import Link from '@components/core/nav-link';
import Dying from './dying/page';
import Washing from './washing/page';
import Printing from './printing/page';
import Compacting from './compacting/page';
import User from '@lib/User';

function MyComponent() {
    const [activeProcessorMain, setActiveProcessorMain] = useState('Dying');
    const brandId = User.brandId;
    useTitle(activeProcessorMain)

    useEffect(() => {
        let activeTab = sessionStorage.getItem("activetab")
        setActiveProcessorMain(activeTab ? activeTab : "Dying")
    }, [])
    const switchProcessorTab = (processorType: string) => {
        setActiveProcessorMain(processorType)
        sessionStorage.removeItem("activetab")
    };

    let content;

    switch (activeProcessorMain) {
        case "Dying":
            content = <Dying />;
            break;
        case "Washing":
            content = <Washing />;
            break;
        case "Printing":
            content = <Printing />;
            break;
        case "Compacting":
            content = <Compacting />;
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
                            <li>Reports</li>
                            {!brandId && <li>Processing Reports</li>}
                            <li>{activeProcessorMain}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="topTrader d-block">
                <section className="d-flex">
                    <button
                        className={` w-100 ${activeProcessorMain === "Dying" ? "activeFilter" : ""
                            }`}
                        type="button"
                        onClick={() => switchProcessorTab("Dying")}
                    >
                        Dying
                    </button>
                    <button
                        className={` w-100 ${activeProcessorMain === "Washing" ? "activeFilter" : ""
                            }`}
                        type="button"
                        onClick={() => switchProcessorTab("Washing")}
                    >
                        Washing
                    </button>
                    <button
                        className={`w-100 ${activeProcessorMain === "Printing" ? "activeFilter" : ""
                            }`}
                        type="button"
                        onClick={() => switchProcessorTab("Printing")}
                    >
                        Printing
                    </button>

                    <button
                        className={`w-100 ${activeProcessorMain === "Compacting" ? "activeFilter" : ""
                            }`}
                        type="button"
                        onClick={() => switchProcessorTab("Compacting")}
                    >
                        Compacting
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
