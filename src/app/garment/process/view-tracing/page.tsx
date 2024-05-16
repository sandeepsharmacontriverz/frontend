"use client";
import { useRouter } from "@lib/router-events";
import { useState, useEffect } from "react";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import { useSearchParams } from "next/navigation";
import Loader from "@components/core/Loader";
import TreeChart from '@components/ginner/charts/TreeChart';

export default function Page() {
    useTitle("View Tracing");
    const router = useRouter();
    const search = useSearchParams();
    const reel_lot_no = search.get("reel_lot_no");

    const [isClient, setIsClient] = useState(false);
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChartData();
        setIsClient(true);
    }, []);

    const fetchChartData = async () => {
        try {
            const res = await API.get(`garment-sales/tracing/chart?reel_lot_no=${reel_lot_no}`);
            if (res.success) {
                setData(res);
            }
            setLoading(false);
        } catch (err) {
            console.log(err);
        }
    };

    if (loading) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    return <div>
        <div className="breadcrumb-box">
            <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                    <ul className="breadcrum-list-wrap">
                        <li>
                            <Link href="/mandi/dashboard" className="active">
                                <span className="icon-home"></span>
                            </Link>
                        </li>
                        <li>Process</li>
                        <li>Backward Tracing</li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="align-items-center mt-16">
            <p style={{ textAlign: 'center' }} className="text-[20px] font-medium">Backward Traceability Tree from Garment </p>
            <div>
                <TreeChart data={data} />
            </div>
        </div>
    </div>
}