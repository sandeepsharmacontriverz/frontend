"use client"
import React, { useEffect, useState } from 'react'
import useTitle from '@hooks/useTitle'
import { useRouter } from '@lib/router-events';
import useRole from '@hooks/useRole';
import Link from '@components/core/nav-link';
import BarChart from '@components/charts/BarChart';

const chartdata = [
    { name: 'AveragePurchasePrice', y: 300 },
    { name: 'AverageMarketPrice', y: 350 },
];
const data = [
    ['Norway', 16],
    ['Germany', 12],
    ['USA', 8],
    ['Sweden', 8],
    ['Netherlands', 8],
    ['ROC', 6],
    ['Austria', 7],
    ['Canada', 4],
    ['Japan', 3],
];


export default function page() {
    useTitle("Premium Project/Ginner")
    const router = useRouter()
    const [roleLoading] = useRole();
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    const handleBack = () => {
        router.back()
    }
    const handlePrint = () => {
        const contentToPrint = document.getElementById('contentToPrint');

        if (contentToPrint) {
            const originalDisplay = contentToPrint.style.display;
            contentToPrint.style.display = 'block';

            window.print();

            contentToPrint.style.display = originalDisplay;
        }
    };
    if (!roleLoading) {
        return (
            <>
                {isClient ? (
                    <>
                        <section className="right-content">
                            <div className="right-content-inner">
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
                                                <li>Premium Project/Ginner</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <hr className='my-2' />
                                <div className="farm-group-box">
                                    <div className="farm-group-inner">
                                        <div className="table-form ">
                                            <div className="table-minwidth w-100">
                                                <div className="search-filter-row">
                                                    <div className="search-filter-left ">
                                                    </div>
                                                    <div className="space-x-4">
                                                        <button
                                                            className="bg-[#2d3c5d] border-[#367fa9] border text-white px-4 py-2 rounded"
                                                            onClick={handlePrint}
                                                        >
                                                            Print
                                                        </button>
                                                        <button
                                                            className="bg-white bg-[#2d3c5d] text-[#2d3c5d] rounded px-4 py-2 border-2 border-[#2d3c5d]"
                                                            onClick={() => router.push("/reports/premium-validation-report")}
                                                        >
                                                            Back
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className='row'>
                                                    <div className="col-md-2">&nbsp;
                                                    </div>
                                                    <div className='col-md-8 mt-auto text-center' >
                                                        <h1 className='text-lg font-bold mb-4'>Premium Validation Report of Farm Groups</h1>
                                                        <div className=" p-4">
                                                            <h1 className='text-lg font-bold'>Test FG</h1>
                                                            <h1 className='text-lg font-bold'>2017-2018</h1>
                                                        </div>
                                                        <h1 className="flex justify-center">Summary of Premium Transfer</h1>
                                                        <div className="mt-5 ">

                                                            <table className="table-auto border-collapse border border-slate-300 text-left w-100">
                                                                <thead>
                                                                    <tr className="bg-white-400 text-black">
                                                                        <td className="p-2 font-bold text-sm mr-80">Parameter</td>
                                                                        <td className="p-2 font-bold text-sm">Value</td>
                                                                    </tr>
                                                                </thead>
                                                                <tbody >
                                                                    <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                        <td className=" text-sm pl-3 pr-96">Total Number of Farmers in the Project</td>
                                                                        <td className="p-2 text-sm">1</td>
                                                                    </tr>
                                                                    <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                        <td className=" text-sm pl-3">Total seed cotton purchased by Test FG (MT)</td>
                                                                        <td className="p-2 text-sm">8</td>
                                                                    </tr>
                                                                    <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                        <td className="p-2 text-sm">Total quantity of lint cotton sold to spinner (MT)</td>
                                                                        <td className="p-2 text-sm">5</td>
                                                                    </tr>
                                                                    <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                        <td className="p-2 font-bold text-sm">Lint cost received from spinner (INR)</td>
                                                                        <td className="p-2 text-sm">20000</td>
                                                                    </tr>
                                                                    <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                        <td className="p-2 text-sm font-bold">Premium Transferred to Farmers (INR)</td>
                                                                        <td className="p-2 text-sm"></td>

                                                                    </tr>
                                                                    <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                        <td className="p-2 text-sm">In Cash</td>
                                                                        <td className="p-2 text-sm">1000</td>
                                                                    </tr>
                                                                    <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                        <td className="p-2 text-sm">In Kind (Seed)</td>
                                                                        <td className="p-2 text-sm">2000</td>
                                                                    </tr>  <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                        <td className="p-2 text-sm">In Cash</td>
                                                                        <td className="p-2 text-sm">4000</td>
                                                                    </tr>  <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                        <td className="p-2 font-bold text-sm">Total</td>
                                                                        <td className="p-2 text-sm">23500</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <div className='text-left'>
                                                            <h1 className="mt-5 mb-2">Findings from the Field Validation</h1>
                                                            <div className="mt-5 mb-2 text-sm font-bold">
                                                                <p className=" mb-5">
                                                                    Some of the quick findings post the survey are:<br />
                                                                    <br />
                                                                    100% of full premium has been well received by the Farm group Test FG<br />
                                                                    The premium was shared with farmers by Test FG in following different modes:<br />
                                                                    Cash paid during procurement by ginner<br />
                                                                    By buying the cotton at a higher price Vs. the Market Price<br />
                                                                    Kind<br />
                                                                    Free cotton seeds and Farm Equipment’s, which saves significant amount of money for the farmers.<br />
                                                                    Other Charges<br />
                                                                    In the form of cost that has been incurred for Farmer Training and Activities on Field, Organic certification and verification, ICS management and storage, handling and transportation of organic cotton from the field to ginning unit.<br />
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <BarChart data={data} type="pie" seriestype="pie" />
                                                        </div>
                                                        <div>
                                                            <h1 className=" flex justify-center mt-5">Summary of Premium Transfer</h1>
                                                            <div className=" mt-5 mb-8">
                                                                <table className="table-auto border-collapse border border-slate-300 w-100 text-left">
                                                                    <thead>
                                                                        <tr className="bg-white-400 text-black">
                                                                            <td className="p-2 font-bold text-sm mr-80">Parameter</td>
                                                                            <td className="p-2 font-bold text-sm">Value</td>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody >
                                                                        <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                            <td className=" text-sm pl-3 pr-96">Average Seed cotton Purchase Price (INR/Kg)</td>
                                                                            <td className="p-2 text-sm">300</td>
                                                                        </tr>
                                                                        <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                            <td className=" text-sm pl-3">TAverage Conventional Cotton Price (INR/Kg)<br />
                                                                                (Based on the scanned images of invoices in the market)</td>
                                                                            <td className="p-2 text-sm">800</td>
                                                                        </tr>
                                                                        <tr className="odd:bg-slate-100 even:bg-white-100">
                                                                            <td className="p-2 text-sm">% Premium Transferred per KG of Seed Cotton Procured</td>
                                                                            <td className="p-2 text-sm">500</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <BarChart data={chartdata} type="column" seriestype="column" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                ) : ("Loading")
                }
            </>

        )
    }

}
