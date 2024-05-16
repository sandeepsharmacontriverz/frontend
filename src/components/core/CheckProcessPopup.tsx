"use client";

import { useRouter } from "@lib/router-events";

export default function CheckProcessPopup({ showModal, setShowModal }: any) {
    const router = useRouter();

    const handleClose = () => {
        setShowModal((pre: any) => ({
            ...pre,
            open: false
        }))
    }
    return (
        <>
            {showModal ? (
                <>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div
                            className="fixed inset-0 w-full h-full bg-black opacity-40"
                            onClick={handleClose}
                        ></div>
                        <div className="flex items-center min-h-30 px-4 py-8">
                            <div className="relative w-full max-w-2xl p-4 mx-auto bg-white rounded-md shadow-lg">
                                <div className="mb-2">
                                    <span
                                        onClick={handleClose}
                                        className="absolute top-1 right-5 cursor-pointer text-xl text-gray-500"
                                    >
                                        &times;
                                    </span>
                                </div>
                                <div className="text-center sm:ml-4">
                                    <h4 className="mt-2 text-2xl font-normal text-gray-800">
                                        Alert
                                    </h4>
                                    <p className=" mt-3 text-gray-800">
                                        You have reacted the limit, Click Upload Test Report to add New Process
                                    </p>
                                    <div className="mt-4">
                                        <button
                                            className="py-2 rounded bg-yellow-500 text-white font-bold text-sm px-10"
                                            onClick={() => {
                                                setShowModal(false),
                                                    router.push("/ginner/quality-parameter/upload-test-ginner")
                                            }
                                            }
                                        >
                                            Upload Test Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : null
            }
        </>
    );
}