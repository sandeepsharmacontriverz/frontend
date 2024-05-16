import Select from '@components/filters/Select';
import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"

interface Option {
    value: string;
    label: string;
}

interface TextField {
    textName: string;
    initialValue: string;
}

interface CustomComponentProps {
    fields?: TextField[];
    onSubmit: (data: { [name: string]: string }) => void;
    popupText?: string;
    openPopup: boolean;
    onCancel: () => void;
    options?: Option[];
    showTextFields?: boolean;
    showSelect?: boolean;
    showCalendar?: boolean;
    showImageUpload?: boolean;
    onEdit?: number;
    stateData?: any;
    initialValues?: any
}


const CustomComponent: React.FC<CustomComponentProps> = ({
    openPopup,
    fields,
    popupText,
    onCancel,
    onSubmit,
    stateData,
    onEdit,
    options,
    initialValues,
    showTextFields,
    showSelect,
    showCalendar,
    showImageUpload,
}) => {
    const [formData, setFormData] = useState<{ [name: string]: string }>({});
    const [selectedOptions, setSelectedOptions] = useState<any>(options);
    const [selectErrors, setSelectErrors] = useState<{ [key: string]: string }>(
        {}
    );
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [file, setFile] = useState<any>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const handleCancel = () => {
        onCancel();
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };


    const handleStartDate = (date: any) => {
        setStartDate(date);
        setFormData((prevData) => ({ ...prevData, "from": date }));

    };

    const handleEndDate = (date: any) => {
        setEndDate(date);
        setFormData((prevData) => ({ ...prevData, "to": date }));

    };

    const handleSelectField = async (field: string, value: string) => {
        const input = selectedOptions.filter((item: any) => {
            return item.selectName === field;
        });
        input[0].value = value;
        setSelectedOptions([...selectedOptions]);

        setFormData((prevData) => ({ ...prevData, [field]: value }));

        if (!value) {
            setSelectErrors((prevErrors) => ({
                ...prevErrors,
                [field]: `${field} is required`,
            }));
        } else {
            setSelectErrors((prevErrors) => ({
                ...prevErrors,
                [field]: "",
            }));
        }
    };

    const previewImage = (event: any) => {
        const imageFiles = event.target.files;
        const imageFilesLength = imageFiles.length;
        if (imageFilesLength > 0) {
            setFile(URL.createObjectURL(event.target.files[0]));
            setFormData((prevData) => ({ ...prevData, "image": event.target.files[0] }));
        }
    };

    return (
        <div >
            {openPopup && (
                <div className="z-10 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 border border-gray-300 shadow-lg rounded-md">
                    <div className="mb-2">
                        <h6 className="absolute top-2 left-5 cursor-pointer text-gray-500"
                        >{popupText} </h6>
                        <span
                            onClick={handleCancel}
                            className="absolute top-1 right-5 cursor-pointer text-xl text-gray-500"
                        >
                            &times;
                        </span>
                    </div>
                    <hr />

                    {
                        showTextFields && (

                            <div className="py-2">
                                {fields?.map(({ textName, initialValue }) => (
                                    <div key={textName} className="flex py-3 justify-between">
                                        <span className="text-sm">{textName}: </span>
                                        <input
                                            type="text"
                                            id={textName}
                                            name={textName}
                                            defaultValue={initialValue}
                                            onChange={handleInputChange}
                                            className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                                            placeholder={textName}
                                        />
                                    </div>
                                ))}
                            </div>
                        )
                    }
                    {showSelect &&
                        options?.map((options: any, index: any) => {
                            return (
                                <div className="flex justify-between" key={options.selectName}>
                                    <span className="text-sm">{options.selectName}: </span>
                                    <div className="w-60">
                                        <Select
                                            id={options.selectName}

                                            options={options.data}
                                            value={options.value}
                                            onChange={handleSelectField}
                                            placeholder={`Select ${options.selectName}*`}
                                            isRequired={true}
                                            error={selectErrors[options.selectName]}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    {
                        showTextFields && (

                            <div className="py-1">
                                {fields?.map(({ textName, initialValue }) => (
                                    <div key={textName} className="flex py-1 justify-between">
                                        <span className="text-sm">{textName}: </span>
                                        <input
                                            type="text"
                                            id={textName}
                                            name={textName}
                                            defaultValue={initialValue}
                                            onChange={handleInputChange}
                                            className="block w-60 py-1 px-1 text-sm border border-gray-300 bg-white rounded-md"
                                            placeholder={textName}
                                        />
                                    </div>
                                ))}
                            </div>
                        )
                    }

                    {
                        showImageUpload && (
                            <div className="flex justify-between">
                                <span className="text-sm">Logo: </span>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/bmp"
                                        className="block w-full py-1 px-1 text-sm  bg-white rounded-md focus:outline-none ml-3"

                                        onChange={previewImage}
                                    />
                                    {file &&
                                        <img src={file} className="w-[200px] h-[200px] " />
                                    }
                                </div>
                            </div>
                        )
                    }

                    {
                        showCalendar && (
                            <div>
                                <div className="flex justify-between py-1" >
                                    <span className="text-sm">From *</span>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={handleStartDate}
                                        showYearDropdown
                                        placeholderText="From*"
                                        className="w-60 border rounded px-1 py-1 text-sm"
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm">To *</span>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={handleEndDate}
                                        showYearDropdown
                                        placeholderText="To*"
                                        className="w-60 border rounded px-1 py-1 text-sm"
                                    />

                                </div>
                            </div>

                        )}
                    <div className="pt-3 mt-5 flex justify-end border-t">
                        <button
                            onClick={handleSubmit}
                            className="bg-green-500 mr-2 text-sm text-white font-bold py-2 px-4 rounded border"
                        >
                            Submit
                        </button>
                        <button
                            onClick={handleCancel}
                            className="mr-2 bg-gray-200 text-sm font-bold py-2 px-4 rounded border"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomComponent;
