"use client";
export default function ConfirmPopup({showModal, setShowModal}:any) {
    return (
        <>
            {showModal ? (
                <>
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div
                            className="fixed inset-0 w-full h-full bg-black opacity-40"
                            onClick={() => setShowModal(false)}
                        ></div>
                        <div className="flex items-center min-h-screen px-4 py-8">
                            <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
                                <div className="mt-3">
                                    <div className="flex items-center justify-center flex-none w-24 h-24 mx-auto bg-red-100 rounded-full">
                                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                    className="w-16 h-16 text-green-600" viewBox="0 0 512.000000 512.000000"
                                    preserveAspectRatio="xMidYMid meet">

                                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                    fill="#009045" stroke="none">
                                    <path d="M4610 4399 c-623 -405 -1215 -874 -1655 -1314 -315 -315 -561 -639
                                    -800 -1058 l-68 -119 -21 26 c-12 14 -187 217 -391 451 l-370 425 -487 0
                                    c-269 0 -488 -2 -488 -5 0 -7 2020 -2190 2027 -2190 3 0 25 72 50 160 266 969
                                    765 1927 1433 2755 277 342 597 678 880 923 30 26 52 47 50 47 -3 -1 -75 -46
                                    -160 -101z"/>
                                    </g>
                                    </svg>
                                    </div>
                                    <div className="mt-2 text-center sm:ml-4">
                                        <h4 className="text-2xl font-medium text-gray-800">
                                            Update Successfully!
                                        </h4>
                                        <div className="mt-4">
                                        <button
                                            className="btn-purple px-10"
                                            onClick={() =>
                                                setShowModal(false)
                                            }
                                        >
                                            OK
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </>
    );
}