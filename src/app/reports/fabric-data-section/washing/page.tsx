"use client";
import React, { useEffect, useState, useRef } from "react";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import { BiFilterAlt } from "react-icons/bi";
import API from "@lib/Api";
import Form from "react-bootstrap/Form";
import CommonDataTable from "@components/core/Table";
const Washing: any = () => {
    const [roleLoading] = useRole();
    const { loading } = useTranslations();
    const [showFilter, setShowFilter] = useState(false);
    const [seasons, setSeasons] = useState<any>([]);
    const [states, setState] = useState([]);
    const [countries, setCountries] = useState<any>([]);
    const [checkedSeason, setCheckedSeason] = useState<any>("");
    const [activeProcessor, setActiveProcessor] = useState('Receipt Report');
    const [ginners, setGinners] = useState<any>([])
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [count, setCount] = useState<any>();
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);

    const [limit, setLimit] = useState(10);
    const [spinners, setSpinners] = useState<any>([])
    const [isClear, setIsClear] = useState(false);
    const [filters, setFilters] = useState({
        countries: "",
        states: "",
        spinners: "",
        ginners: ""
    })
    useEffect(() => {
        getSeasons();
        getCountries();
        getGinners()
        getSpinners()
        fetchSales()
    }, []);

    useEffect(() => {
        if (filters.countries) {
            getStates();
        }
    }, [filters.countries]);


    const getSeasons = async () => {
        const url = "season";
        try {
            const response = await API.get(url);
            setSeasons(response.data);
        } catch (error) {
            console.log(error, "error");
        }
    };
    const getCountries = async () => {
        try {
            const res = await API.get("location/get-countries?status=true");
            if (res.success) {
                setCountries(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const getStates = async () => {
        try {
            if (filters.countries !== "") {
                const res = await API.get(
                    `location/get-states?status=true&countryId=${filters.countries}`
                );
                if (res.success) {
                    setState(res.data);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
    const getGinners = async () => {
        try {
            const res = await API.get("ginner");
            if (res.success) {
                setGinners(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const getSpinners = async () => {
        try {
            const res = await API.get("spinner");
            if (res.success) {
                setSpinners(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSales = async () => {
        try {
            const response = await API.get(
                `fabric-process/washing-process&search=${searchQuery}&limit=${limit}&page=${page}&pagination=true`
            );
            if (response.success) {
                setData(response.data);
                setCount(response.count);
            }
        } catch (error) {
            console.error(error);
            setCount(0);
        }
    };

    const clearFilterList = () => {
        setFilters({
            ...filters,
            countries: "",
            states: "",
            spinners: "",
            ginners: ""
        });
        // setCheckedSeason(highestSeason?.id);
        setIsClear(!isClear);
    };

    if (loading) {
        return <div> Loading...</div>;
    }
    const handleChange1 = (event: any) => {
        const { value, name } = event.target;
        if (name === "season") {
            setCheckedSeason(value);
        }
        else if (name === "country") {
            setFilters({ ...filters, countries: value })
        }
        else if (name === "state") {
            setFilters({ ...filters, states: value })
        }
        else if (name === "spinner") {
            setFilters({ ...filters, spinners: value })
        }
        else if (name === "ginner") {
            setFilters({ ...filters, ginners: value })
        }
    };
    const columns = [
        {
            name: <p className="text-[13px] font-medium">S. No</p>,
            cell: (row: any, index: any) => index + 1,
            sortable: false,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Date</p>,
            selector: (row: any) => row.date?.substring(0, 10),
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Fabric Processor Type </p>,
            selector: (row: any) => row.buyer_type,
            sortable: false,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Sold To </p>,
            selector: (row: any) =>
                row.buyer?.name
                    ? row.buyer?.name
                    : row.abuyer?.name
                        ? row.abuyer?.name
                        : row.processor_name,
            wrap: true,
            sortable: false,
        },
        {
            name: <p className="text-[13px] font-medium">Invoice No </p>,
            selector: (row: any) => row.invoice_no,
            sortable: false,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Batch/Lot No</p>,
            selector: (row: any) => row.batch_lot_no,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Washed Fabric Quantity</p>,
            selector: (row: any) => row.total_fabric_quantity,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Length in Mts </p>,
            selector: (row: any) => row.fabric_length,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Finished Fabric GSM </p>,
            selector: (row: any) => row.gsm,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Fabric Net Weight (Kgs)</p>,
            selector: (row: any) => row.fabric_net_weight,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Program </p>,
            selector: (row: any) => row.program?.program_name,
            wrap: true,
        },
        {
            name: <p className="text-[13px] font-medium">Status </p>,
            selector: (row: any) => row.status,
            wrap: true,
        },
    ];
    const FilterPopup = ({ openFilter, onClose }: any) => {
        const popupRef = useRef<HTMLDivElement>(null);
        return (
            <div>
                {openFilter && (
                    <div
                        ref={popupRef}
                        className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
                    >
                        <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                            <div className="flex justify-between align-items-center">
                                <h3 className="text-lg pb-2">Filters</h3>
                                <button
                                    className="text-[20px]"
                                    onClick={() => setShowFilter(!showFilter)}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="w-100 mt-0">
                                <div className="customFormSet">
                                    <div className="w-100">
                                        <div className="row">
                                            {
                                                activeProcessor === "Receipt Report" && (
                                                    <>


                                                        <div className="col-md-6 col-sm-12 mt-2">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Select Season
                                                            </label>
                                                            <Form.Select
                                                                aria-label="Default select example"
                                                                className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                                                                value={checkedSeason || ""}
                                                                name="season"
                                                                onChange={handleChange1}
                                                            >
                                                                {seasons?.map((season: any) => (
                                                                    <option
                                                                        key={season.id}
                                                                        value={season.id}
                                                                    >
                                                                        {season.name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                        <div className="col-md-6 col-sm-12 mt-2">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Select Country
                                                            </label>
                                                            <Form.Select
                                                                aria-label="Default select example"
                                                                className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                                                                value={filters.countries || ""}
                                                                name="country"
                                                                onChange={handleChange1}
                                                            >
                                                                <option value="">Select Country</option>
                                                                {countries?.map((country: any) => (
                                                                    <option
                                                                        key={country.id}
                                                                        value={country.id}
                                                                    >
                                                                        {country.county_name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                    </>)}
                                            {
                                                activeProcessor === "Process/Sales Report" && (
                                                    <>
                                                        <div className="col-md-6 col-sm-12 mt-2">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Select Season
                                                            </label>
                                                            <Form.Select
                                                                aria-label="Default select example"
                                                                className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                                                                value={checkedSeason || ""}
                                                                name="season"
                                                                onChange={handleChange1}
                                                            >
                                                                {seasons?.map((season: any) => (
                                                                    <option
                                                                        key={season.id}
                                                                        value={season.id}
                                                                    >
                                                                        {season.name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                        <div className="col-md-6 col-sm-12 mt-2">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Select Country
                                                            </label>
                                                            <Form.Select
                                                                aria-label="Default select example"
                                                                className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                                                                value={filters.countries || ""}
                                                                name="country"
                                                                onChange={handleChange1}
                                                            >
                                                                <option value="">Select Country</option>
                                                                {countries?.map((country: any) => (
                                                                    <option
                                                                        key={country.id}
                                                                        value={country.id}
                                                                    >
                                                                        {country.county_name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                        <div className="col-md-6 col-sm-12 mt-2">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Select State
                                                            </label>
                                                            <Form.Select
                                                                aria-label="Default select example"
                                                                className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                                                                value={filters.states || ""}
                                                                name="state"
                                                                onChange={handleChange1}
                                                            >
                                                                <option value="">Select State</option>
                                                                {states?.map((state: any) => (
                                                                    <option
                                                                        key={state.id}
                                                                        value={state.id}
                                                                    >
                                                                        {state.state_name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                    </>)}
                                            {
                                                activeProcessor === "Processor Quality Parameter" && (
                                                    <>
                                                        <div className="col-md-6 col-sm-12 mt-2">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Select Season
                                                            </label>
                                                            <Form.Select
                                                                aria-label="Default select example"
                                                                className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                                                                value={checkedSeason || ""}
                                                                name="season"
                                                                onChange={handleChange1}
                                                            >
                                                                {seasons?.map((season: any) => (
                                                                    <option
                                                                        key={season.id}
                                                                        value={season.id}
                                                                    >
                                                                        {season.name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                        <div className="col-md-6 col-sm-12 mt-2">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Select Country
                                                            </label>
                                                            <Form.Select
                                                                aria-label="Default select example"
                                                                className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                                                                value={filters.countries || ""}
                                                                name="country"
                                                                onChange={handleChange1}
                                                            >
                                                                <option value="">Select Country</option>
                                                                {countries?.map((country: any) => (
                                                                    <option
                                                                        key={country.id}
                                                                        value={country.id}
                                                                    >
                                                                        {country.county_name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                        <div className="col-md-6 col-sm-12 mt-2">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Select State
                                                            </label>
                                                            <Form.Select
                                                                aria-label="Default select example"
                                                                className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                                                                value={filters.states || ""}
                                                                name="state"
                                                                onChange={handleChange1}
                                                            >
                                                                <option value="">Select State</option>
                                                                {states?.map((state: any) => (
                                                                    <option
                                                                        key={state.id}
                                                                        value={state.id}
                                                                    >
                                                                        {state.state_name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>

                                                        <div className="col-md-6 col-sm-12 mt-2">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Select Ginner
                                                            </label>
                                                            <Form.Select
                                                                aria-label="Default select example"
                                                                className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                                                                value={filters.ginners || ""}
                                                                name="ginner"
                                                                onChange={handleChange1}
                                                            >
                                                                <option value="">Select Ginner</option>
                                                                {ginners?.map((ginner: any) => (
                                                                    <option
                                                                        key={ginner.id}
                                                                        value={ginner.id}
                                                                    >
                                                                        {ginner.name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                        <div className="col-md-6 col-sm-12 mt-2">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Select Spinner
                                                            </label>
                                                            <Form.Select
                                                                aria-label="Default select example"
                                                                className="dropDownFixes rounded-md formDropDown my-1 text-sm"
                                                                value={filters.spinners || ""}
                                                                name="spinner"
                                                                onChange={handleChange1}
                                                            >
                                                                <option value="">Select Spinner</option>
                                                                {spinners?.map((spinner: any) => (
                                                                    <option
                                                                        key={spinner.id}
                                                                        value={spinner.id}
                                                                    >
                                                                        {spinner.name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </div>
                                                    </>
                                                )
                                            }
                                        </div>
                                        <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                                            <section>
                                                <button
                                                    className="btn-purple mr-2"
                                                    onClick={() => {
                                                        // getFilter()  sssss
                                                    }}
                                                >
                                                    APPLY ALL FILTERS
                                                </button>
                                                <button
                                                    className="btn-outline-purple"
                                                    onClick={clearFilterList}
                                                >
                                                    CLEAR ALL FILTERS
                                                </button>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                }
            </div >
        );
    };
    const switchProcessorTab = (processorType: string) => {
        setFilters({
            ...filters,
            countries: "",
            states: "",
            spinners: "",
            ginners: ""
        });
        // setCheckedSeason(highestSeason?.id)
        setActiveProcessor(processorType);
    }
    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page);
        setLimit(limitData);
    };

    if (!roleLoading) {
        return (
            <div>
                <div className="farm-group-box">
                    <div className="farm-group-inner">
                        <div className="table-form ">
                            <div className="table-minwidth w-100">
                                <div className="search-filter-row">
                                    <div className="search-filter-left ">
                                        <div className="topTrader">
                                            <section className="buttonTabnew">
                                                <button
                                                    className={`${activeProcessor === "Receipt Report" ? "activeView" : ""
                                                        }`}
                                                    type="button"
                                                    onClick={() => switchProcessorTab("Receipt Report")}
                                                >
                                                    Receipt Report
                                                </button>
                                                <button
                                                    className={`${activeProcessor === "Process/Sales Report" ? "activeView" : ""
                                                        } rounded-r-lg`}
                                                    type="button"
                                                    onClick={() => switchProcessorTab("Process/Sales Report")}
                                                >
                                                    Process/Sales Report
                                                </button>

                                            </section>
                                        </div>
                                        <div className="headTrader">
                                            <button
                                                className="flex"
                                                type="button"
                                                onClick={() => setShowFilter(!showFilter)}
                                            >
                                                FILTERS <BiFilterAlt className="m-1" />
                                            </button>
                                        </div>
                                        <div>
                                            <div className="relative">
                                                <FilterPopup
                                                    openFilter={showFilter}
                                                    onClose={!showFilter}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex flex-wrap">
                                    </div>
                                    {activeProcessor === "Receipt Report" ? (
                                        <div>
                                            <CommonDataTable
                                                columns={columns}
                                                count={count}
                                                data={data}
                                                updateData={updatePage}
                                            />
                                        </div>
                                    ) : activeProcessor === "Process/Sales Report" ? (
                                        <div>
                                            <CommonDataTable
                                                columns={columns}
                                                count={count}
                                                data={data}
                                                updateData={updatePage}
                                            />
                                        </div>
                                    ) : (
                                        null
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Washing
