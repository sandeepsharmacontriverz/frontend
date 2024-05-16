"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import API from "@lib/Api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment, { Moment } from "moment";
import TimePicker from "rc-time-picker";
import "rc-time-picker/assets/index.css";
import { toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";
import { Form } from "react-bootstrap";
import useRole from "@hooks/useRole";

const ProcessorType = [
  {
    id: 1,
    name: "Ginner",
  },
  {
    id: 2,
    name: "Spinner",
  },
  {
    id: 3,
    name: "Knitter",
  },
  {
    id: 4,
    name: "Weaver",
  },
  {
    id: 5,
    name: "Garment",
  },
  // {
  //     id: 6,
  //     name: 'Trader'
  // }
];

const trainingMode = [
  {
    id: 1,
    name: "Online",
  },
  {
    id: 2,
    name: "Offline",
  },
];

const page = () => {
  useTitle("Edit Processor Training");
  const [roleLoading] = useRole();

  const router = useRouter();
  const search = useSearchParams();
  const id = search.get("id");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [country, setCountry] = useState([]);
  const [state, setState] = useState([]);
  const [brands, setBrands] = useState([]);
  const [date, setDate] = useState<Date | null>(null);
  const [selectedSTime, setSSelectedTime] = useState<Moment>();
  const [selectedETime, setESelectedTime] = useState<Moment>();

  const [processorName, setProcessorName] = useState([]);

  const [formData, setFormData] = useState<any>({
    id: null,
    trainingType: "",
    brandId: null,
    countryId: null,
    stateId: null,
    processor: "",
    trainingMode: "",
    processorName: "",
    trainingDescription: "",
    venue: "",
    date: "",
    startTime: "",
    endTime: null,
  });

  const [errors, setErrors] = useState<any>({
    brandId: "",
    countryId: "",
    stateId: "",
    processor: "",
    trainingMode: "",
    processorName: "",
    venue: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const requiredFields = [
    "brandId",
    "countryId",
    "stateId",
    "processor",
    "trainingMode",
    "venue",
    "date",
    "startTime",
    "endTime",
  ];

  const validateField = (name: string, value: any) => {
    if (requiredFields.includes(name)) {
      switch (name) {
        case "brandId":
          return value?.length === 0 || value === null
            ? "Brand Name is required"
            : "";
        case "countryId":
          return value?.length === 0 || value === null
            ? "country Name is required"
            : "";
        case "stateId":
          return value?.length === 0 || value === null
            ? "state Name is required"
            : "";
        case "processor":
          return value?.length === 0 || value === null
            ? "Processor is required"
            : "";
        case "trainingMode":
          return value?.length === 0 || value === null
            ? "Mode of training is required"
            : "";
        case "venue":
          return value.length === 0 ? "venue is required" : "";
        case "date":
          return value.length === 0 ? "Date is required" : "";
        case "startTime":
          return value?.length === 0 || value === null
            ? "Start Time is required"
            : "";
        case "endTime":
          if (selectedETime) {
            if (moment(selectedETime)?.isBefore(moment(selectedSTime))) {
              return "End time must be greater than or equal to start time";
            } else {
              return "";
            }
          }
        default:
          return "";
      }
    }
  };

  useEffect(() => {
    getTrainingList();
  }, []);

  useEffect(() => {
    getCountry();
    getBrands();
  }, []);

  useEffect(() => {
    if (formData.countryId) {
      getStates();
    }
  }, [formData.countryId]);

  useEffect(() => {
    if (
      formData.stateId &&
      formData.brandId &&
      formData.processor &&
      formData.trainingType === "TraceBale Customised Training"
    ) {
      getProcessorName();
    } else {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        processorName: "",
      }));
    }
  }, [
    formData.stateId,
    formData.brandId,
    formData.processor,
    formData.trainingType,
  ]);

  const getCountry = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCountry(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getStates = async () => {
    const url = `location/get-states?status=true&countryId=${formData.countryId}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setState(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getBrands = async () => {
    const url = "brand";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setBrands(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getProcessorName = async () => {
    const processorType = formData.processor?.toLowerCase();
    const url = `${processorType}?stateId=${formData.stateId}&brandId=${formData.brandId}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setProcessorName(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getTrainingList = async () => {
    const url = `training/get-training?id=${id}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const data = response.data;
        setFormData({
          id: data?.id,
          trainingType: data?.training_type,
          brandId: data?.brand_id,
          countryId: data?.country_id,
          stateId: data?.state_id,
          processor: data?.processor,
          processorName: data?.processor_name,
          trainingDescription: data?.training_description,
          trainingMode: data?.training_mode,
          venue: data?.venue,
          date: data?.date,
          startTime: data?.start_time,
          endTime: data?.end_time,
        });
        setDate(new Date(data?.date));
        setSSelectedTime(moment(data?.start_time, "HH:mm:ss"));
        setESelectedTime(
          data?.end_time ? moment(data?.end_time, "HH:mm:ss") : undefined
        );
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleTimeChange = (newTime: any, name: any) => {
    if (!moment.isMoment(newTime)) {
      if (name === "startTime") {
        setSSelectedTime(undefined);
      } else {
        setESelectedTime(undefined);
      }
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: null,
      }));
      return;
    }
    const isStartTime = name === "startTime";
    if (isStartTime) {
      setSSelectedTime(newTime);
      setESelectedTime(undefined);
    } else {
      setESelectedTime(newTime);
    }

    const formatted = newTime.format("HH:mm:ss");
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      [name]: formatted,
    }));
    setErrors((prevFormData: any) => ({
      ...prevFormData,
      [name]: "",
    }));
  };

  const getDisabledHours = () => {
    let hours = [];
    for (var i = 0; i < moment().hour(); i++) {
      hours.push(i);
    }
    return hours;
  };

  const getDisabledMinutes = (selectedHour: any) => {
    let minutes = [];
    if (selectedHour === moment().hour()) {
      for (var i = 0; i < moment().minute(); i++) {
        minutes.push(i);
      }
    }
    return minutes;
  };

  const handleCancel = () => {
    router.push("/training/processor-training");
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newErrors: any = {};
    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any]
      );
    });
    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (!hasErrors) {
      const url = "training/update-training";
      try {
        const response = await API.put(url, formData);
        setIsSubmitting(true);
        if (response.success) {
          toasterSuccess("Processor Training updated Successfully");
          router.push("/training/processor-training");
        }
      } catch (error) {
        console.log(error, "error");
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>,
    index: number = 0
  ) => {
    const { name, value } = event.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDate = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setDate(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      date: newDate,
    }));
    setErrors((prevFormData: any) => ({
      ...prevFormData,
      date: "",
    }));
  };

  if (!roleLoading) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href="/dashboard" className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Training</li>
                <li>
                  <Link href="/training/processor-training">
                    Processor Training
                  </Link>
                </li>
                <li>Edit Processor Training</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div className="w-100 mt-4">
            <div className="customFormSet">
              <div className="w-100">
                <div className="row">
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Training Type*
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      value={formData.trainingType}
                      disabled
                      onChange={(event) => handleChange(event)}
                      name="trainingType"
                    >
                      <option value="TraceBale General Training">
                        TraceBale General Training
                      </option>
                      <option value="TraceBale Customised Training">
                        TraceBale Customised Training
                      </option>
                      <option value="Other Training">Other Training</option>
                    </Form.Select>
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Brand *
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      value={formData.brandId || ""}
                      onChange={(event) => handleChange(event)}
                      disabled
                      name="brandId"
                    >
                      <option value="">Select</option>
                      {brands.map((brands: any) => (
                        <option key={brands.id} value={brands.id}>
                          {brands.brand_name}
                        </option>
                      ))}
                    </Form.Select>
                    {errors.brandId && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.brandId}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Country *
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      value={formData.countryId || ""}
                      onChange={(event) => handleChange(event)}
                      disabled
                      name="countryId"
                    >
                      <option value="">Select</option>
                      {country.map((country: any) => (
                        <option key={country.id} value={country.id}>
                          {country.county_name}
                        </option>
                      ))}
                    </Form.Select>
                    {errors.countryId && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.countryId}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      State *
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      value={formData.stateId || ""}
                      disabled
                      onChange={(event) => handleChange(event)}
                      name="stateId"
                    >
                      <option value="">Select</option>
                      {state.map((state: any) => (
                        <option key={state.id} value={state.id}>
                          {state.state_name}
                        </option>
                      ))}
                    </Form.Select>
                    {errors.stateId && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.stateId}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Processor *
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      value={formData.processor || ""}
                      onChange={(event) => handleChange(event)}
                      disabled
                      name="processor"
                    >
                      <option value="">Select</option>
                      {ProcessorType.map((ProcessorType: any) => (
                        <option
                          key={ProcessorType.id}
                          value={ProcessorType.name}
                        >
                          {ProcessorType.name}
                        </option>
                      ))}
                    </Form.Select>
                    {errors.processor && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.processor}
                      </p>
                    )}
                  </div>

                  {formData.trainingType ===
                    "TraceBale Customised Training" && (
                      <div className="col-12 col-sm-6 col-md-4 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Processor By Name
                        </label>
                        <Form.Select
                          aria-label="Default select example"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                          value={formData.processorName || ""}
                          disabled
                          onChange={(event) => handleChange(event)}
                          name="processorName"
                        >
                          <option value="">Select</option>
                          {processorName.map((processorName: any) => (
                            <option
                              key={processorName.id}
                              value={processorName.id}
                            >
                              {processorName.name}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                    )}

                  {formData.trainingType === "Other Training" && (
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Training Description
                      </label>
                      <div>
                        <textarea
                          className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          rows={3}
                          name="trainingDescription"
                          disabled
                          value={formData.trainingDescription}
                          onChange={(event: any) => handleChange(event)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Mode of Training *
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      value={formData.trainingMode}
                      disabled
                      onChange={(event) => handleChange(event)}
                      name="trainingMode"
                    >
                      <option value="">Select</option>
                      {trainingMode.map((trainingMode: any) => (
                        <option key={trainingMode.id} value={trainingMode.name}>
                          {trainingMode.name}
                        </option>
                      ))}
                    </Form.Select>
                    {errors.trainingMode && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.trainingMode}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Venue *
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      disabled
                      value={formData.venue}
                      placeholder="Enter the Venue"
                      name="venue"
                      onChange={(event) => handleChange(event)}
                    />
                    {errors.venue && (
                      <p className="text-red-500 w-full text-sm mt-1">
                        {errors.venue}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date *
                    </label>
                    <DatePicker
                      showIcon
                      selected={date}
                      minDate={new Date()}
                      onChange={handleDate}
                      showYearDropdown
                      placeholderText="dd-mm-yyyy"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.date && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Start Time *
                    </label>
                    <div className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom">
                      <TimePicker
                        className="w-100"
                        onChange={(e) => handleTimeChange(e, "startTime")}
                        value={selectedSTime}
                        placeholder="- - : - -"
                        showSecond={false}
                        use12Hours={true}
                        disabledHours={() => getDisabledHours()}
                        disabledMinutes={(hour) => getDisabledMinutes(hour)}
                      />
                    </div>
                    {errors.startTime && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      End Time
                    </label>
                    <div className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom">
                      <TimePicker
                        className="w-100"
                        onChange={(e) => handleTimeChange(e, "endTime")}
                        value={selectedETime}
                        placeholder="- - : - -"
                        showSecond={false}
                        use12Hours={true}
                        disabledHours={() => getDisabledHours()}
                        disabledMinutes={(hour) => getDisabledMinutes(hour)}
                      />
                    </div>
                    {errors.endTime && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.endTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-12 w-100 d-flex justify-start customButtonGroup">
                <section>
                  <button
                    className="btn-purple mr-2"
                    disabled={isSubmitting}
                    style={
                      isSubmitting
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                    }
                    onClick={handleSubmit}
                  >
                    SUBMIT
                  </button>
                </section>

                <section>
                  <button
                    className="btn-outline-purple mr-2"
                    onClick={handleCancel}
                  >
                    CANCEL
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default page;
