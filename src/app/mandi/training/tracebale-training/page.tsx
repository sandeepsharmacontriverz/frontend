"use client";
import { useState, useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "next/link";
import { BiFilterAlt } from "react-icons/bi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Form } from "react-bootstrap";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";

const trainingMode = [
    {
        id: 1,
        name: 'Offline'
    },
    {
        id: 2,
        name: 'Online'
    }
]
const tracebaleTraining: any = () => {
    useTitle("Tracebale Training");
    const [roleLoading, hasAccess] = useRole();
    const router = useRouter();
    const mandiId = User.MandiId;
    const [Access, setAccess] = useState<any>({});

    const [isClient, setIsClient] = useState(false);
    const [data, setData] = useState([])
    const [count, setCount] = useState<any>()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackId, setFeedbackId] = useState<any>(null);
    const [prevSubject, setPrevSubject] = useState<string>('')
    const [prevFeedback, setPrevFeedback] = useState<string>('')

    const [showFilter, setShowFilter] = useState(false);
    const [from, setFrom] = useState<any>('');
    const [checkedTrainingMode, setCheckedTrainingMode] = React.useState<any>([]);
    const [isClear, setIsClear] = useState(false);
    const [searchFilter, setSearchFilter] = useState('')


    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Mandi")) {
            const access = checkAccess("Tracebale Training");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccess]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (mandiId) {
            getTrainingList()
        }
    }, [searchQuery, page, limit, isClear, mandiId]);

    const getTrainingList = async () => {
        const code = encodeURIComponent(searchQuery);
        const url = `training/training-process-status?mandiId=${mandiId}&limit=${limit}&page=${page}&search=${code}&mode=${checkedTrainingMode}&date=${from}&pagination=true`
        try {
            const response = await API.get(url)
            setData(response.data)
            setCount(response.count)
        }
        catch (error) {
            console.log(error, "error")
            setCount(0)
        }
    };

    const feedbackHandle = (row: any) => {
        setFeedbackId(row.id)
        setPrevSubject(row.subject)
        setPrevFeedback(row.feedback)
        setFeedbackVisible(true)
    }
    const handleCancel = () => {
        setFeedbackVisible(false)
    }

    const searchData = (e: any) => {
        setSearchQuery(e.target.value)

    }
    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page)
        setLimit(limitData)
    }

    const changeStatus = async (id: any, status: string) => {
        const url = `training/update-training-process-status`
        try {
            const response = await API.put(url, {
                "id": id,
                "status": status
            })
            if (response.success) {
                getTrainingList()
            }
        }
        catch (error) {
            console.log(error, "error")
        }
    }

    const handleChange = (selectedList: any, selectedItem: any, name: string) => {
        let itemId = selectedItem?.name;
        if (name === 'trainingMode') {
            if (checkedTrainingMode.includes(itemId)) {
                setCheckedTrainingMode(checkedTrainingMode.filter((item: any) => item !== itemId));
            } else {
                setCheckedTrainingMode([...checkedTrainingMode, itemId]);
            }
        }
    }

    const handleFrom = (date: any) => {
        let d = new Date(date)
        setFrom(d);
    };

    const clearFilter = () => {
        setFrom('')
        setCheckedTrainingMode([])
        setSearchFilter('')
        setIsClear(!isClear)
    }

    const FilterPopup = ({ openFilter, onClose }: any) => {
        const popupRef = React.useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: any) => {
                if (popupRef.current && !(popupRef.current as any).contains(event.target)) {
                    setShowFilter(false)
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [popupRef, onClose]);
        const search = searchFilter
        const filterSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault()
            setSearchFilter(e.target.value)
        }

        return (
            <div>
                {openFilter && (
                    <div ref={popupRef} className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
                        <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                            <div className="flex justify-between align-items-center">
                                <h3 className="text-lg pb-2">Filters</h3>
                                <button className="text-[20px]" onClick={() => setShowFilter(!showFilter)}>&times;</button>
                            </div>
                            <div className="w-100 mt-0">
                                <div className="customFormSet">
                                    <div className="w-100">
                                        <div className="row">
                                            <div className="col-12 col-md-6 mt-2">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Mode of Training
                                                </label>
                                                <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    displayValue="name"
                                                    selectedValues={trainingMode?.filter((item: any) => checkedTrainingMode.includes(item.name))}
                                                    onKeyPressFn={function noRefCheck() { }}
                                                    onRemove={(selectedList: any, selectedItem: any) => {
                                                        handleChange(selectedList, selectedItem, "trainingMode")
                                                    }}
                                                    onSearch={function noRefCheck() { }}
                                                    onSelect={(selectedList: any, selectedItem: any) => {
                                                        handleChange(selectedList, selectedItem, "trainingMode")
                                                    }}
                                                    options={trainingMode}
                                                    showCheckbox
                                                />
                                            </div>

                                            <div className="col-12 col-md-6 mt-2">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Date
                                                </label>
                                                <DatePicker
                                                    selected={from}
                                                    dateFormat={'dd-MM-yyyy'}
                                                    onChange={handleFrom}
                                                    showYearDropdown
                                                    placeholderText={translations?.transactions?.date + "*"}
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                                            <section>
                                                <button
                                                    className="btn-purple mr-2"
                                                    onClick={() => {
                                                        getTrainingList()
                                                        setShowFilter(false);
                                                    }}
                                                >
                                                    APPLY ALL FILTERS
                                                </button>
                                                <button className="btn-outline-purple"
                                                    onClick={clearFilter}
                                                >CLEAR ALL FILTERS</button>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const dateFormatter = (date: any) => {
        const formatted = new Date(date)?.toJSON().slice(0, 10).split('-').reverse().join('/')
        return formatted
    }

    function formatTime(timeString: any) {
        if (timeString) {
            const [hourString, minute] = timeString?.split(":");
            const hour = +hourString % 24;
            return (hour % 12 || 12) + ":" + minute + (hour < 12 ? "AM" : "PM");
        }
        else {
            return ''
        }
    }
    const { translations, loading } = useTranslations();

    const columns = [
        {
            name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
            width: '70px',
            cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
            wrap: true
        },
        {
            name: <p className="text-[13px] font-medium">Date</p>,
            cell: (row: any) => dateFormatter(row['process-training']['date']),
            wrap: true
        },
        {
            name: <p className="text-[13px] font-medium">Time</p>,
            cell: (row: any) => formatTime(row['process-training']['start_time']) + (row['process-training']['end_time'] ? "-" : '') + formatTime(row['process-training']['end_time']),
            wrap: true
        },
        {
            name: <p className="text-[13px] font-medium">Training Type</p>,
            cell: (row: any) => row['process-training']['training_mode'],
            wrap: true

        }, {
            name: <p className="text-[13px] font-medium">Venue</p>,
            cell: (row: any) => row['process-training']['venue'],
            wrap: true
        },
        {
            name: <p className="text-[13px] font-medium">{translations?.common?.action}</p>,

            width: '200px',
            cell: (row: any) => (
                <>
                    {row.status === "Pending" &&
                        (
                            <>
                                <button
                                    onClick={() => changeStatus(row.id, "Accepted")}
                                    className="bg-green-500 text-white p-2 rounded mr-3"
                                >
                                    Accept
                                </button>

                                <button
                                    onClick={() => changeStatus(row.id, "Rejected")}
                                    className="bg-red-500 text-white p-2 rounded "
                                >
                                    Reject
                                </button>
                            </>
                        )
                    }

                    {row.status !== "Pending" &&
                        (
                            <>
                                {
                                    row.status === "Accepted" ?
                                        <button
                                            className="bg-green-500 text-white p-2 rounded hover:cursor-default"
                                        >
                                            Accepted
                                        </button>
                                        :
                                        <button
                                            className="bg-red-500 text-white p-2 rounded hover:cursor-default"
                                        >
                                            Rejected
                                        </button>
                                }

                                <button
                                    onClick={() => feedbackHandle(row)}
                                    className=" p-1.5 ml-2 bg-yellow-500 text-white rounded text-sm"
                                >
                                    Feedback
                                </button>
                            </>
                        )
                    }

                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
        },
    ];

    if (loading || roleLoading) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    if (!roleLoading && !Access.view) {
        return (
            <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
                <h3>You doesn't have Access of this Page.</h3>
            </div>
        );
    }

    if (!roleLoading && Access?.view) {
        return (
            <div >
                {isClient ? (

                    <>

                        <section className="right-content">
                            <div className="right-content-inner">
                                {/* breadcrumb */}
                                <div className="breadcrumb-box">
                                    <div className="breadcrumb-inner light-bg">
                                        <div className="breadcrumb-left">
                                            <ul className="breadcrum-list-wrap">
                                                <li className="active">
                                                    <Link href="/mandi/dashboard">
                                                        <span className="icon-home"></span>
                                                    </Link>
                                                </li>
                                                <li>Training</li>
                                                <li>Processor Training</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* farmgroup start */}
                                <div className="farm-group-box">
                                    <div className="farm-group-inner">
                                        <div className="table-form">
                                            <div className="table-minwidth w-100">
                                                {/* search */}
                                                <div className="search-filter-row">
                                                    <div className="search-filter-left ">
                                                        <div className="search-bars">
                                                            <form className="form-group mb-0 search-bar-inner">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-new jsSearchBar "
                                                                    placeholder="Search"
                                                                    value={searchQuery}
                                                                    onChange={searchData}
                                                                />
                                                                <button type="submit" className="search-btn">
                                                                    <span className="icon-search"></span>
                                                                </button>
                                                            </form>
                                                        </div>

                                                        <div className="fliterBtn">
                                                            <button className="flex" type="button" onClick={() => setShowFilter(!showFilter)} >
                                                                FILTERS <BiFilterAlt className="m-1" />
                                                            </button>

                                                            <div className="relative">
                                                                <FilterPopup
                                                                    openFilter={showFilter}
                                                                    onClose={!showFilter}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>


                                                </div>
                                                <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />
                                                <div>
                                                    <Feedback openPopup={feedbackVisible} onCancel={handleCancel} feedbackId={feedbackId} prevSubject={prevSubject} getItems={getTrainingList} prevFeedback={prevFeedback} />
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="w-full min-h-screen flex justify-center items-center">
                        <span>Processing...</span>
                    </div>
                )}
            </div>
        )
    }
};

export default tracebaleTraining;


const Feedback = ({ openPopup, onCancel, feedbackId, prevSubject, prevFeedback, getItems }: any) => {
    const [feedback, setFeedback] = useState<any>('');
    const [subject, setSubject] = useState("")
    const [disabled, setDisabled] = useState(false)

    useEffect(() => {
        setSubject(prevSubject ? prevSubject : "Satisfied")
        setFeedback(prevFeedback)
    }, [feedbackId, prevSubject, prevFeedback])

    const handleCancel = () => {
        onCancel()
        setSubject('')
        setFeedback('')
        setErrors({
            subject: '',
            feedback: ''
        });

    };

    const handleChange = (event: any, index: number = 0) => {
        const { name, value } = event.target;
        if (name === "subject") {
            setSubject(value)
        }
        if (name === "feedback") {
            setFeedback(value)
        }

    }

    const [errors, setErrors] = useState({
        subject: '',
        feedback: ''

    })

    const handleSubmit = async () => {
        if (!feedback) {
            setErrors((prevError) => ({
                ...prevError,
                feedback: "remark and subject is required",
            }));
        }
        else {
            if (subject && feedback) {
                setDisabled(true)
                const url = `training/update-training-process-status`
                try {
                    const response = await API.put(url, {
                        "id": feedbackId,
                        "feedback": feedback,
                        "subject": subject
                    })
                    if (response.success) {
                        handleCancel()
                        getItems()
                        setDisabled(false)
                    }
                }
                catch (error) {
                    console.log(error, "error")
                    setDisabled(false)
                }
            }
        }
    };


    return (
        <div>
            {openPopup && (
                <div className="flex h-full w-auto z-10 fixed justify-center bg-black bg-opacity-70 top-3 left-0 right-0 bottom-0 p-3">
                    <div className="bg-white border h-fit w-[600px] py-3 px-5 border-gray-300 shadow-lg rounded-md">

                        <div className="flex justify-between">
                            <h3
                            >Feedback</h3>
                            <button
                                onClick={handleCancel}
                            >
                                &times;
                            </button>
                        </div>
                        <hr />
                        <div className="py-2 ">
                            <div className="col-12  mt-4">
                                <label className="text-gray-500 text-[12px] font-medium">
                                    Select
                                </label>
                                <Form.Select
                                    aria-label="Default select example"
                                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                                    value={subject}
                                    onChange={(event) => handleChange(event)}
                                    name="subject"
                                >
                                    <option value="Satisfied" className="text-sm">
                                        Satisfied
                                    </option>
                                    <option value='Unsatisfied'>
                                        Unsatisfied
                                    </option>
                                </Form.Select>
                                {errors.subject && <p className="text-red-500 ml-4 text-sm mt-1">{errors.subject}</p>}
                            </div>

                            <div className="col-12  mt-4">
                                <textarea
                                    className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                    name="feedback"
                                    rows={5}
                                    value={feedback || ''}
                                    onChange={handleChange}
                                    placeholder='Feedback'

                                />
                                {errors.feedback && <p className="text-red-500 ml-4 text-sm mt-1">{errors.feedback}</p>}
                            </div>
                        </div>


                        {/* <div className="pt-3 mt-5 flex justify-end border-t">
                            <button
                                onClick={handleSubmit}
                                className="bg-green-500 mr-2 text-sm text-white font-bold py-2 px-4 rounded border"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={handleCancel}
                                className="mr-2 bg-gray-200 text-sm font-bold py-2 px-4 rounded border"
                            >
                                Cancel
                            </button>
                        </div> */}

                        <div className="pt-12 w-100 d-flex justify-end customButtonGroup">
                            <section>
                                <button className="btn-purple mr-2"
                                    style={
                                        disabled
                                            ? { cursor: "not-allowed", opacity: 0.8 }
                                            : { cursor: "pointer", backgroundColor: "#D15E9C" }

                                    }
                                    disabled={disabled}
                                    onClick={handleSubmit}>
                                    SAVE CHANGES
                                </button>
                                <button
                                    className="btn-outline-purple"
                                    onClick={handleCancel}
                                >
                                    CANCEL
                                </button>
                            </section>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}