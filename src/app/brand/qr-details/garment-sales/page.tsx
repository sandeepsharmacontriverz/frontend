"use client";
import React, { useState, useEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import { useSearchParams } from "next/navigation";

import useTitle from "@hooks/useTitle";

import { ImLocation2 } from "react-icons/im";

import { FaHouseFlag } from "react-icons/fa6";

import { FaArrowDown } from "react-icons/fa";

import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";
import DataTable from "react-data-table-component";
import API from "@lib/Api";
import moment from "moment";
import { Polyline } from "react-leaflet";


const L = typeof window !== 'undefined' ? require("leaflet") : null;

let Icon = null;
if (typeof window !== 'undefined') {
    Icon = require("leaflet").Icon;
}

const MapContainer = dynamic(() => import("react-leaflet").then((module) => module.MapContainer), {
    ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((module) => module.TileLayer), {
    ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((module) => module.Marker), {
    ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((module) => module.Popup), {
    ssr: false,
});
const FeatureGroup = dynamic(() => import("react-leaflet").then((module) => module.FeatureGroup), {
    ssr: false,
});

const ginnerIcon = Icon ? new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(
        renderToString(<ImLocation2 color="#67DDDD" />)
    )}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
}) : null;

const spinnerIcon = Icon ? new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(
        renderToString(<ImLocation2 color="#EC530F" />)
    )}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
}) : null;

const fabricIcon = Icon ? new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(
        renderToString(<ImLocation2 color="#8E67FD" />)
    )}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
}) : null;

const garmentIcon = Icon ? new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(
        renderToString(<ImLocation2 color="#E661AC" />)
    )}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
}) : null;

const homeIcon = Icon ? new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(
        renderToString(<FaHouseFlag color="#5EC45E" />)
    )}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
}) : null;

export default function page() {
    useTitle("Processor Details");
    const [data, setData] = useState<any>([]);
    const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
    const [positions, setPositions] = useState<any>([]);
    const search = useSearchParams();
    const id = search.get("id");

    const [showData, setShowData] = useState<any>({
        garment: false,
        fabric: false,
        spinner: false,
        ginner: false,
        farmerGroup: false
    });


    useEffect(() => {
        if (id) {
            getProcessorList();
        }
    }, [id]);

    const getProcessorList = async () => {
        const url = `garment-sales/get-map-tracebility?salesId=${id}`;
        try {
            const response = await API.get(url);
            setData(response.data);

            if (response.data) {
                function extractLatLng(obj: any) {
                    let lat = parseFloat(obj.latitude);
                    let lon = parseFloat(obj.longitude);

                    if (!isNaN(lat) && !isNaN(lon)) {
                        return [lat, lon];
                    }
                    return null;
                }

                function processArray(array: any) {
                    const positions: any = [];
                    array.forEach((item: any) => {
                        const latLng = extractLatLng(item);
                        if (latLng) {
                            positions.push(latLng);
                        }
                    });
                    return positions;
                }

                const garmentLatLng = extractLatLng(response.data.garment);
                const fbrcNameLatLng = processArray(response.data.fbrc_name);
                const spnrNameLatLng = processArray(response.data.spnr_name);
                const gnrNameLatLng = processArray(response.data.gnr_name);
                const frmrFarmGroup = processArray(response.data.frmr_farm_group);

                const allPositions = [];
                if (garmentLatLng) {
                    allPositions.push(garmentLatLng);
                }
                allPositions.push(...fbrcNameLatLng, ...spnrNameLatLng, ...gnrNameLatLng, ...frmrFarmGroup);
                setPositions(allPositions);
                setSelectedLocation({
                    name: response.data?.garment?.name,
                    lat: response.data?.garment?.latitude,
                    long: response.data?.garment?.longitude,
                });
            } else {
                setSelectedLocation(null);
            }
        } catch (error) {
            console.log(error, "error");
        }
    }

    const getMaps = (location: any, index: number, icon: any, type: string) => {
        return (
            (typeof window !== 'undefined' && 
            <Marker
                key={location?.id}
                position={[location?.latitude, location?.longitude]}
                icon={icon}
            >

                <Polyline positions={positions} color="blue" />
                {(typeof window !== 'undefined' &&
                <Popup>
                    <div>
                        <span className="font-bold text-lg">RiceTraceability</span> <br />
                        <span className="font-semibold text-base"> {type}: <span className="font-normal text-base">{location?.name}</span> <br />
                            <span className="font-normal text-base"> {location?.district?.district_name}, {location?.state?.state_name}</span></span>

                        <div className="flex justify-end">
                            <img
                                src={
                                    "/images/iconGarmentMap.jpg"
                                }
                                alt="Garment Logo"
                                className="w-[100px] h-[100px] "
                            />
                        </div>

                    </div>
                </Popup>
                )}
            </Marker>
            )
        )
    }

    const dateFormatter = (date: any) => {
        const formatted = moment(date).format("DD-MM-YYYY");
        return formatted;
    };


    const columns: any = [
        {
            name: (
                <div className="py-2">
                    <div className="text-md font-semibold">
                        Garment Name
                    </div>
                    <div className="flex mt-2 gap-1">
                        {data.garment?.name}<FaArrowDown onClick={() => setShowData({ ...showData, garment: !showData.garment })} className="hover:cursor-pointer" size={16} />
                    </div>
                </div>
            ),
            cell: (row: any) => (
                <>
                    {
                        showData.garment && (
                            <div className="w-full h-full">
                                <div className="border p-1 font-semibold">
                                    Date of dispatch: <span className="font-normal">{row?.date ? dateFormatter(row?.date) : ''}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Fabric Order Reference No : <span className="font-normal">{row?.fabric_order_ref}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Brand Order Reference No : <span className="font-normal">{row?.brand_order_ref}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Invoice Number : <span className="font-normal">{row?.invoice_no}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Style Mark No : <span className="font-normal">{row?.style_mark_no?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Garment/Product Type : <span className="font-normal">{row?.garment_type?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Garmet size : <span className="font-normal">{row?.garment_size?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Color : <span className="font-normal">{row?.color?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    No of Boxes : <span className="font-normal">{row?.total_no_of_boxes}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    No of pieces : <span className="font-normal">{row?.total_no_of_pieces}</span>
                                </div>
                            </div>
                        )}
                </>
            )
            ,
            sortable: false,
        },

        {
            name: (
                <div className="py-2">
                    <div className="text-md font-bold">
                        Fabric Processor Name
                    </div>
                    <div className="flex mt-2 gap-1">
                        {data.fbrc_name &&
                            Array.from(new Set(data.fbrc_name.map((item: any) => item.name))).join(', ')
                        }<FaArrowDown onClick={() => setShowData({ ...showData, fabric: !showData.fabric })} className="hover:cursor-pointer" size={16} />
                    </div>
                </div>
            ),
            cell: (row: any) => (
                <>
                    {
                        showData.fabric && (
                            <div className="w-full h-full">
                                <div className="border p-1 font-semibold">
                                    Date of fabric sale : <span className="font-normal">{row?.fbrc_sale_date?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Garment Order Ref No : <span className="font-normal">{row?.fbrc_garment_order_ref?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Brand Order Ref No : <span className="font-normal">{row?.fbrc_brand_order_ref?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Invoice Number : <span className="font-normal">{row?.fbrc_invoice_no?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Finished Batch /Lot No : <span className="font-normal">{row?.fbrc_lot_no?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Job details from garment : <span className="font-normal">{row?.fbrc_job_details?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Fabric Type : <span className="font-normal">{row?.fbrc_fabric_type?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Finished Fabric Length : <span className="font-normal">{row?.fbrc_weave_total_length}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Finished Fabric GSM : <span className="font-normal">{row?.fbrc_fabric_gsm?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Finished Fabric Net weight : <span className="font-normal">{row?.fbrc_knit_total_weight}</span>
                                </div>
                            </div>
                        )
                    }
                </>
            ),
            sortable: false,
        },
        {
            name: (
                <div className="py-2">
                    <div className="text-md font-semibold">
                        Spinner Name
                    </div>
                    <div className="flex mt-2 gap-1">
                        {data.spnr_name &&
                            Array.from(new Set(data.spnr_name.map((item: any) => item.name))).join(', ')
                        }<FaArrowDown onClick={() => setShowData({ ...showData, spinner: !showData.spinner })} className="hover:cursor-pointer" size={16} />
                    </div>
                </div>
            ),
            cell: (row: any) => (
                <>
                    {
                        showData.spinner && (
                            <div className="w-full h-full">
                                <div className="border p-1 font-semibold">
                                    Date of Yarn sale : <span className="font-normal">{row?.spnr_sale_date?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Invoice Number : <span className="font-normal">{row?.spnr_invoice_no?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Spin Lot No : <span className="font-normal">{row?.spnr_lot_no?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    REEL Lot No : <span className="font-normal">{row?.spnr_reel_lot_no?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Yarn Type : <span className="font-normal">{row?.spnr_yarn_type?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Yarn Count : <span className="font-normal">{row?.spnr_yarn_count?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    No of Boxes : <span className="font-normal">{row?.spnr_no_of_boxes}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Box ID : <span className="font-normal">{row?.spnr_box_ids?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Blend : <span className="font-normal">{row?.blendtype?.map((blend: any) => blend?.cottonMix_name).join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Blend Qty : <span className="font-normal">{row?.blendqty?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Total weight : <span className="font-normal">{row?.spnr_total_qty}</span>
                                </div>
                            </div>
                        )
                    }
                </>
            ),
            sortable: false,
        },
        {
            name: (
                <div className="py-2">
                    <div className="text-md font-semibold">
                        Ginner Name
                    </div>
                    <div className="flex mt-2 gap-1">
                        {data.gnr_name &&
                            Array.from(new Set(data.gnr_name.map((item: any) => item.name))).join(', ')
                        }
                        <FaArrowDown onClick={() => setShowData({ ...showData, ginner: !showData.ginner })} className="hover:cursor-pointer" size={16} />
                    </div>
                </div>
            ),
            cell: (row: any) => (
                <>
                    {
                        showData.ginner && (
                            <div className="w-full h-full">
                                <div className="border p-1 font-semibold">
                                    Date of Yarn sale : <span className="font-normal">{row?.gnr_sale_date?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Invoice Number : <span className="font-normal">{row?.gnr_invoice_no?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    No of Bales : <span className="font-normal">{row?.gnr_no_of_bales}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Bale Lot No : <span className="font-normal">{row?.gnr_lot_no?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Bales/Press No : <span className="font-normal">{row?.gnr_press_no?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    REEL Lot No : <span className="font-normal">{row?.gnr_reel_lot_no?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Rate/KG : <span className="font-normal">{row?.gnr_rate?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Total weight : <span className="font-normal">{row?.gnr_total_qty}</span>
                                </div>
                            </div>
                        )
                    }
                </>
            ),
            sortable: false,
        },
        {
            name: (
                <div className="py-2">
                    <div className="text-md font-semibold">
                        Farmer Group Name
                    </div>
                    <div className="flex mt-2 gap-1">
                        {data.frmr_farm_group &&
                            Array.from(new Set(data.frmr_farm_group.map((item: any) => item.name))).join(', ')
                        }<FaArrowDown onClick={() => setShowData({ ...showData, farmerGroup: !showData.farmerGroup })} className="hover:cursor-pointer" size={16} />
                    </div>
                </div>
            ),
            cell: (row: any) => (
                <>
                    {
                        showData.farmerGroup && (
                            <div className="w-full h-full">
                                <div className="border p-1 font-semibold">
                                    Date of Sale : <span className="font-normal">{row?.frmr_sale_date?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Transaction Id : <span className="font-normal">{row?.frmr_transactions_id?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold ">
                                    Village : <span className="font-normal">{row?.frmr_villages?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    State : <span className="font-normal">{row?.frmr_states?.join(', ')}</span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Program : <span className="font-normal">{row?.frmr_programs?.join(', ')}</span>
                                </div>
                            </div>
                        )
                    }
                </>
            ),
            sortable: false,
        },
    ].filter(Boolean);

    return (
        <div>
            <div className="flex bg-[#172554] items-center justify-center p-4">
                <p className="text-white text-3xl font-normal"> Processor Details </p>
            </div>
            {(typeof window !== 'undefined' && selectedLocation) &&
                <div className="w-100 bg-white rounded-lg p-4">
                    <MapContainer
                        center={[selectedLocation?.lat || 0, selectedLocation?.long || 0]}
                        zoom={4}

                        style={{ height: "600px", width: "100%" }}
                    >

                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {(data?.garment?.latitude && data?.garment?.longitude) && getMaps(data?.garment, data?.garment?.id, garmentIcon, 'Garment',)}

                        {data?.gnr_name?.map((location: any, index: any) => (
                            (location?.latitude && location?.longitude) && getMaps(location, index, ginnerIcon, 'Ginner')
                        ))}

                        {data?.spnr_name?.map((location: any, index: any) => (
                            (location?.latitude && location?.longitude) && getMaps(location, index, spinnerIcon, 'Spinner')
                        ))}

                        {data?.fbrc_name?.map((location: any, index: any) => (
                            (location?.latitude && location?.longitude) && getMaps(location, index, fabricIcon, 'Knitter/Weaver')
                        ))}

                        {data?.frmr_farm_group?.map((location: any, index: any) => (
                            (location?.latitude && location?.longitude) && getMaps(location, index, homeIcon, 'Farm Group')
                        ))}
                    </MapContainer>


                    <div className="flex items-center justify-center p-4">
                        <p className="text-2xl font-medium">{data?.buyer?.brand_name}</p>
                    </div>


                    <DataTable
                        data={[data]}
                        persistTableHead
                        noDataComponent=''
                        columns={columns}
                    />

                </div>
            }
        </div>

    );

}

