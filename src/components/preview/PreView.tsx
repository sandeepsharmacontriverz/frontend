import useTranslations from "@hooks/useTranslation";
import moment from "moment";
import React, { useEffect, useState } from "react";
import photo_Image from "../../../public/images/photo.png";
import pdf_Image from "../../../public/images/pdf.png";
import zip_Image from "../../../public/images/zip.png";

export const PreView = ({
  isLoading = false,
  openFilter,
  onClose,
  setShowPreview,
  showPreview,
  data,
  season,
  fileName,
  onClick,
  //
  data1_label,
  data1,
  data2_label,
  data2,
  data3_label,
  data3,
  data4_label,
  data4,
  data5_label,
  data5,
  data6_label,
  data6,
  data7_label,
  data7,
  data8_label,
  data8,
  data9_file_label,
  data9,
  data1_file_OR_txt_label = null,
  data1_single_file,
  data1_txt,
  data2_file_OR_txt_label,
  data2_single_file,
  data2_txt,
  data3_file_OR_txt_label,
  data3_single_file,
  data3_txt,
  data4_file_OR_txt_label,
  data4_single_file = "",
  data4_txt = null,
  array_img_label,
  array_img,
  array2_img_label,
  array2_img,
  array3_img_label,
  array3_img,
  array4_img_label,
  array4_img,
  array5_img_label,
  array5_img,
  array6_img_label,
  array6_img,
  array7_img_label,
  array7_img,
  array8_img_label,
  array8_img,
  array9_img_label,
  array9_img,
  array10_img_label,
  array10_img,
  array11_img_label,
  array11_img,
  array12_img_label,
  array12_img,
  array13_img_label,
  array13_img,
  array14_img_label,
  array14_img,
  array15_img_label,
  array15_img,
  array16_img_label,
  array16_img,
  array17_img_label,
  array17_img,
  //
  //
  file_label1,
  file_data1,
  file_data1_type,
  file_data1_name,
  file_label2,
  file_data2,
  file_data2_type,
  file_data2_name,
  //
  //
  data1_array_label,
  data1_array,
  data1_array_total_list,
  dynamicPropertyName_data1_array = "yarnCount_name",
  data2_array_label,
  data2_array,
  data2_array_total_list,
  data2_array_single_map_label,
  data2_array_single_map,
  dynamicPropertyName_data2_array_single_map = "",
  data3_array_label,
  data3_array,
  data3_array_total_list,

  data4_array_label,
  data4_array,
  data4_array_total_list,
  data4_item_name,
  data5_array_single_map_label,
  data5_array_single_map,

  data6_array_single_map_label,
  data6_array_single_map,

  data7_array_single_table_show = false,
  data7_array_single_map_label,
  data7_array_single_map,
  data7_array_dynamicPropertyName1_label,
  data7_array_dynamicPropertyName1,
  data7_array_dynamicPropertyName2_label,
  data7_array_dynamicPropertyName2,
  data7_array_dynamicPropertyName3_label,
  data7_array_dynamicPropertyName3,

  data7_txt_label,
  data7_txt,
  data8_txt_label,
  data8_txt,
  data9_txt_label,
  data9_txt,
  data10_txt_label,
  data10_txt,
  data11_txt_label,
  data11_txt,
  data12_txt_label,
  data12_txt,
  data13_txt_label,
  data13_txt,
  data14_txt_label,
  data14_txt,

  //
  //
  data10_label,
  data10_data,
  data11_label,
  data11_data,
  data12_label,
  data12_data,
  data13_label,
  data13_data,
  data14_label,
  data14_data,
  data15_label,
  data15_data,
  data16_label,
  data16_data,
  data17_label,
  data17_data,
  data18_label,
  data18_data,
  data19_label,
  data19_data,
  data20_label,
  data20_data,
  data21_label,
  data21_data,
  data22_label,
  data22_data,
  data23_label,
  data23_data,
  data24_label,
  data24_data,
  data25_label,
  data25_data,
  data26_label,
  data26_data,

  //
  //
  //table 1
  show_big_table = false,
  big_table1_title,
  big_table1_option1_label,
  big_table1_option1_lists,
  big_table1_option1_lists_map,
  big_table1_option1_dynamicProperty_name,
  big_table1_option2_label,
  big_table1_option2_lists,
  big_table1_option3_label,
  big_table1_option3_lists,
  big_table1_option4_label,
  big_table1_option4_lists,
  big_table1_option5_label,
  big_table1_option5_lists,
  big_table1_option6_label,
  big_table1_option6_lists,
  big_table1_option7_label,

  //
  //tabl 2
  table_2_show = false,
  table2_title = "",
  table2_option1_label,
  table2_option1_match_id,
  table2_option1_full_list,
  table2_option1_dynamic_filed_name,
  table2_option2_label,
  table2_option2_show_arr_values,

  //
  //tabl 3
  table_3_show = false,
  table3_title = "",
  table3_option1_label,
  table3_option1_match_id,
  table3_option1_full_list,
  table3_option1_dynamic_filed_name,
  table3_option2_label,
  table3_option2_show_arr_values,
}: any) => {
  interface Props {
    file_data1: Blob | File;
    array_img?: ImageData[]; // Define props with optional array_img\
    data1_array?: [];
  }

  // console.log("data2_array", data2_array);

  const popupRef = React.useRef<HTMLDivElement>(null);
  const { translations, loading } = useTranslations();

  // const extension_data10 =
  //   typeof data1_single_file === "string" && data1_single_file?.trim() !== ""
  //     ? data1_single_file?.substring(data1_single_file?.lastIndexOf(".") + 1)
  //     : null;

  // const extension_data11 =
  //   typeof data2_single_file === "string" && data2_single_file?.trim() !== ""
  //     ? data2_single_file?.substring(data2_single_file?.lastIndexOf(".") + 1)
  //     : null;

  // const extension_data12 =
  //   typeof data3_single_file === "string" && data3_single_file?.trim() !== ""
  //     ? data3_single_file?.substring(data3_single_file?.lastIndexOf(".") + 1)
  //     : null;

  // const extension_data13 =
  //   typeof data4_single_file === "string" && data4_single_file?.trim() !== ""
  //     ? data4_single_file?.substring(data4_single_file?.lastIndexOf(".") + 1)
  //     : null;

  // console.log("array_img", array_img);
  // console.log("data3_array_label", data3_array_label);
  // console.log("data3_array,", data3_array);
  // console.log("data17_data", data17_data ? "true" : "false");

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        popupRef.current &&
        !(popupRef.current as any).contains(event.target)
      ) {
        setShowPreview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef, onClose]);

  return (
    <div>
      {showPreview && (
        <div
          ref={popupRef}
          className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 overflow-auto"
        >
          <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md ">
            <div className="flex justify-between align-items-center">
              <h3 className="text-lg pb-2 font-bold">
                {/* {translations.common.Filters}*/}
                Preview Form
              </h3>
              <button
                className="text-[20px]"
                onClick={() => setShowPreview(!showPreview)}
              >
                &times;
              </button>
            </div>
            <div className="w-100 mt-0 ">
              <div className="customFormSet">
                <div className="w-100 ">
                  <div className="row">
                    {data1 ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data1_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {` ${data1}`}
                        </label>
                      </div>
                    ) : null}

                    {data2 ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data2_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data2}
                        </label>
                      </div>
                    ) : null}

                    {data3 ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data3_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data3}
                        </label>
                      </div>
                    ) : null}

                    {data4 ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data4_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data4}
                        </label>
                      </div>
                    ) : null}

                    {data5 ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data5_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data5}
                        </label>
                      </div>
                    ) : null}

                    {data6 ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data6_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data6}
                        </label>
                      </div>
                    ) : null}

                    {data7 ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data7_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data7}
                        </label>
                      </div>
                    ) : null}

                    {data8 ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data8_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data8}
                        </label>
                      </div>
                    ) : null}

                    {data9 ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data9_file_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data9}
                        </label>
                      </div>
                    ) : null}

                    {data10_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data10_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data10_data}
                        </label>
                      </div>
                    ) : null}

                    {data11_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data11_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data11_data}
                        </label>
                      </div>
                    ) : null}

                    {data12_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data12_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data12_data}
                        </label>
                      </div>
                    ) : null}

                    {data13_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data13_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data13_data}
                        </label>
                      </div>
                    ) : null}

                    {data14_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data14_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data14_data}
                        </label>
                      </div>
                    ) : null}

                    {data15_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data15_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data15_data}
                        </label>
                      </div>
                    ) : null}

                    {data16_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data16_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data16_data}
                        </label>
                      </div>
                    ) : null}

                    {data17_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data17_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data17_data}
                        </label>
                      </div>
                    ) : null}

                    {data18_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data18_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data18_data}
                        </label>
                      </div>
                    ) : null}

                    {data19_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data19_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data19_data}
                        </label>
                      </div>
                    ) : null}

                    {data20_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data20_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data20_data}
                        </label>
                      </div>
                    ) : null}

                    {data21_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data21_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data21_data}
                        </label>
                      </div>
                    ) : null}

                    {data22_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data22_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data22_data}
                        </label>
                      </div>
                    ) : null}

                    {data23_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data23_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data23_data}
                        </label>
                      </div>
                    ) : null}

                    {data24_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data24_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data24_data}
                        </label>
                      </div>
                    ) : null}

                    {data25_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data25_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data25_data}
                        </label>
                      </div>
                    ) : null}

                    {data26_data ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data26_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data26_data}
                        </label>
                      </div>
                    ) : null}

                    {data1_single_file || data1_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data1_file_OR_txt_label}
                        </label>
                        {data1_txt ? (
                          <label className="text-gray-500 text-[10px] font-medium">
                            {data1_txt}
                          </label>
                        ) : (
                          data1_single_file?.map(
                            (data: string, index: number) => {
                              const dotIndex = data?.lastIndexOf(".");
                              const valueAfterDot =
                                dotIndex !== -1
                                  ? data?.substring(dotIndex + 1)
                                  : "";
                              const urlParts = data?.split("/");
                              const variable_name =
                                urlParts[urlParts.length - 1]?.split(".")[0]; // Extracting without extension_data10
                              return (
                                <div
                                  key={index}
                                  style={{
                                    flexDirection: "row",
                                    display: "flex",
                                    alignItems: "center",
                                    marginTop: 10,
                                    marginBottom: 10,
                                  }}
                                >
                                  <img
                                    src={
                                      valueAfterDot === "pdf"
                                        ? pdf_Image.src
                                        : valueAfterDot === "zip"
                                        ? zip_Image.src
                                        : valueAfterDot === "jpeg"
                                        ? data
                                        : data
                                    }
                                    className="w-[50px] h-[50px]"
                                    alt="Image"
                                  />
                                  <span
                                    className="text-gray-500 text-[12px] font-medium"
                                    style={{ marginLeft: 10 }}
                                  >
                                    {variable_name}
                                  </span>
                                </div>
                              );
                            }
                          )
                        )}
                      </div>
                    ) : null}

                    {data2_single_file || data2_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data2_file_OR_txt_label}
                        </label>
                        {data2_txt ? (
                          <label className="text-gray-500 text-[10px] font-medium">
                            {data2_txt}
                          </label>
                        ) : (
                          data2_single_file?.map(
                            (data: string, index: number) => {
                              const dotIndex = data?.lastIndexOf(".");
                              const valueAfterDot =
                                dotIndex !== -1
                                  ? data?.substring(dotIndex + 1)
                                  : "";
                              const urlParts = data?.split("/");
                              const variable_name =
                                urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10
                              return (
                                <div
                                  key={index}
                                  style={{
                                    flexDirection: "row",
                                    display: "flex",
                                    alignItems: "center",
                                    marginTop: 10,
                                    marginBottom: 10,
                                  }}
                                >
                                  <img
                                    src={
                                      valueAfterDot === "pdf"
                                        ? pdf_Image.src
                                        : valueAfterDot === "zip"
                                        ? zip_Image.src
                                        : valueAfterDot === "jpeg"
                                        ? data
                                        : data
                                    }
                                    className="w-[50px] h-[50px]"
                                    alt="Image"
                                  />
                                  <span
                                    className="text-gray-500 text-[12px] font-medium"
                                    style={{ marginLeft: 10 }}
                                  >
                                    {variable_name}
                                  </span>
                                </div>
                              );
                            }
                          )
                        )}
                      </div>
                    ) : null}

                    {data3_single_file || data3_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data3_file_OR_txt_label}
                        </label>
                        {data3_txt ? (
                          <label className="text-gray-500 text-[10px] font-medium">
                            {data3_txt}
                          </label>
                        ) : (
                          data3_single_file?.map(
                            (data: string, index: number) => {
                              const dotIndex = data?.lastIndexOf(".");
                              const valueAfterDot =
                                dotIndex !== -1
                                  ? data?.substring(dotIndex + 1)
                                  : "";
                              const urlParts = data?.split("/");
                              const variable_name =
                                urlParts[urlParts.length - 1]?.split(".")[0]; // Extracting without extension_data10
                              return (
                                <div
                                  key={index}
                                  style={{
                                    flexDirection: "row",
                                    display: "flex",
                                    alignItems: "center",
                                    marginTop: 10,
                                    marginBottom: 10,
                                  }}
                                >
                                  <img
                                    src={
                                      valueAfterDot === "pdf"
                                        ? pdf_Image.src
                                        : valueAfterDot === "zip"
                                        ? zip_Image.src
                                        : valueAfterDot === "jpeg"
                                        ? data
                                        : data
                                    }
                                    className="w-[50px] h-[50px]"
                                    alt="Image"
                                  />
                                  <span
                                    className="text-gray-500 text-[12px] font-medium"
                                    style={{ marginLeft: 10 }}
                                  >
                                    {variable_name}
                                  </span>
                                </div>
                              );
                            }
                          )
                        )}
                      </div>
                    ) : null}

                    {data4_single_file || data4_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data4_file_OR_txt_label}
                        </label>
                        {data4_txt ? (
                          <label className="text-gray-500 text-[10px] font-medium">
                            {data4_txt}
                          </label>
                        ) : (
                          data4_single_file?.map(
                            (data: string, index: number) => {
                              const dotIndex = data?.lastIndexOf(".");
                              const valueAfterDot =
                                dotIndex !== -1
                                  ? data?.substring(dotIndex + 1)
                                  : "";
                              const urlParts = data?.split("/");
                              const variable_name =
                                urlParts[urlParts.length - 1]?.split(".")[0]; // Extracting without extension_data10
                              return (
                                <div
                                  key={index}
                                  style={{
                                    flexDirection: "row",
                                    display: "flex",
                                    alignItems: "center",
                                    marginTop: 10,
                                    marginBottom: 10,
                                  }}
                                >
                                  <img
                                    src={
                                      valueAfterDot === "pdf"
                                        ? pdf_Image.src
                                        : valueAfterDot === "zip"
                                        ? zip_Image.src
                                        : valueAfterDot === "jpeg"
                                        ? data
                                        : data
                                    }
                                    className="w-[50px] h-[50px]"
                                    alt="Image"
                                  />
                                  <span
                                    className="text-gray-500 text-[12px] font-medium"
                                    style={{ marginLeft: 10 }}
                                  >
                                    {variable_name}
                                  </span>
                                </div>
                              );
                            }
                          )
                        )}
                      </div>
                    ) : null}

                    {file_data1_type ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {file_label1}
                        </label>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={
                              file_data1_type === "application/pdf"
                                ? pdf_Image.src
                                : file_data1_type === "application/zip"
                                ? zip_Image.src
                                : file_data1_type === "image/jpeg" && file_data1
                                ? photo_Image?.src
                                : photo_Image?.src
                            }
                            className="w-[50px] h-[50px]"
                            alt="Image"
                          />
                          <label
                            className="text-gray-500 text-[10px] font-medium"
                            style={{ marginLeft: 10 }}
                          >
                            {file_data1_name}
                          </label>
                        </div>
                      </div>
                    ) : null}

                    {file_data2_type ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {file_label2}
                        </label>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={
                              file_data2_type === "application/pdf"
                                ? pdf_Image.src
                                : file_data2_type === "application/zip"
                                ? zip_Image.src
                                : file_data2_type === "image/jpeg" && file_data2
                                ? photo_Image?.src
                                : // URL.createObjectURL(file_data2)
                                  photo_Image?.src
                            }
                            className="w-[50px] h-[50px]"
                            alt="Image"
                          />
                          <label
                            className="text-gray-500 text-[10px] font-medium"
                            style={{ marginLeft: 10 }}
                          >
                            {file_data2_name}
                          </label>
                        </div>
                      </div>
                    ) : null}

                    {array_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array_img_label}
                        </label>
                        <div>
                          {array_img?.map((data: string, index: number) => {
                            const dotIndex = data?.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {array2_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array2_img_label}
                        </label>
                        <div>
                          {array2_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
{array3_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array3_img_label}
                        </label>
                        <div>
                          {array3_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array4_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array4_img_label}
                        </label>
                        <div>
                          {array4_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array5_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array5_img_label}
                        </label>
                        <div>
                          {array5_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array6_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array6_img_label}
                        </label>
                        <div>
                          {array6_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array7_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array7_img_label}
                        </label>
                        <div>
                          {array7_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array8_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array8_img_label}
                        </label>
                        <div>
                          {array8_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array9_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array9_img_label}
                        </label>
                        <div>
                          {array9_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array10_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array10_img_label}
                        </label>
                        <div>
                          {array10_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array11_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array11_img_label}
                        </label>
                        <div>
                          {array11_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array12_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array12_img_label}
                        </label>
                        <div>
                          {array12_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array13_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array13_img_label}
                        </label>
                        <div>
                          {array13_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array14_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array14_img_label}
                        </label>
                        <div>
                          {array14_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array15_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array15_img_label}
                        </label>
                        <div>
                          {array15_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array16_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array16_img_label}
                        </label>
                        <div>
                          {array16_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {array17_img?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {array17_img_label}
                        </label>
                        <div>
                          {array17_img?.map((data: string, index: number) => {
                            const dotIndex = data.lastIndexOf(".");
                            const valueAfterDot =
                              dotIndex !== -1
                                ? data.substring(dotIndex + 1)
                                : "";
                            const urlParts = data.split("/");
                            const variable_name =
                              urlParts[urlParts.length - 1].split(".")[0]; // Extracting without extension_data10

                            return (
                              <div
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: 10,
                                  marginBottom: 10,
                                }}
                              >
                                <img
                                  src={
                                    valueAfterDot === "pdf"
                                      ? pdf_Image.src
                                      : valueAfterDot === "zip"
                                      ? zip_Image.src
                                      : valueAfterDot === "jpeg"
                                      ? data
                                      : data
                                  }
                                  className="w-[50px] h-[50px]"
                                  alt="Image"
                                />
                                <span
                                  className="text-gray-500 text-[12px] font-medium"
                                  style={{ marginLeft: 10 }}
                                >
                                  {variable_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}



                    {data1_array?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data1_array_label}
                        </label>
                        {data1_array_total_list?.map(
                          (item: any, index: number) => {
                            return data1_array?.map(
                              (selected_item: any, index: number) => {
                                if (selected_item === item?.id) {
                                  return (
                                    <label
                                      key={index}
                                      className="text-gray-500 text-[12px] font-medium"
                                    >
                                      {index == 0
                                        ? item?.[
                                            dynamicPropertyName_data1_array
                                          ]
                                        : "," +
                                          item?.[
                                            dynamicPropertyName_data1_array
                                          ]}
                                    </label>
                                  );
                                }
                              }
                            );
                          }
                        )}
                      </div>
                    ) : null}

                    {data2_array?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data2_array_label}
                        </label>

                        {data2_array?.map((item: any, index: number) => {
                          return (
                            <label
                              key={index}
                              className="text-gray-500 text-[12px] font-medium"
                            >
                              {index == 0 ? item : "," + item}
                            </label>
                          );
                        })}
                      </div>
                    ) : null}

                    {data2_array_single_map?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data2_array_single_map_label}
                        </label>

                        {data2_array_single_map?.map(
                          (item: any, index: number) => {
                            console.log("item", item);

                            return (
                              <>
                                {dynamicPropertyName_data2_array_single_map ? (
                                  <label className="text-gray-500 text-[10px] font-medium">
                                    {index == 0
                                      ? item?.[
                                          dynamicPropertyName_data2_array_single_map
                                        ]
                                      : ", " +
                                        item?.[
                                          dynamicPropertyName_data2_array_single_map
                                        ]}
                                  </label>
                                ) : (
                                  <label className="text-gray-500 text-[10px] font-medium">
                                    {index == 0 ? item : "," + item}
                                  </label>
                                )}
                              </>
                            );
                          }
                        )}
                      </div>
                    ) : null}

                    {data3_array?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data3_array_label}
                        </label>
                        {data3_array_total_list?.map(
                          (item: any, index: number) => {
                            // console.log("item", item);
                            return data3_array?.map(
                              (selected_item: any, index: number) => {
                                if (selected_item === item?.id) {
                                  // console.log("selected_item", item);

                                  return (
                                    <label
                                      key={index}
                                      className="text-gray-500 text-[10px] font-medium"
                                    >
                                      {item?.cottonMix_name + ","}
                                    </label>
                                  );
                                }
                              }
                            );
                          }
                        )}
                      </div>
                    ) : null}

                    {data4_array?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data4_array_label}
                        </label>
                        {data4_array_total_list?.map(
                          (item: any, index: number) => {
                            return data4_array?.map(
                              (selected_item: any, index: number) => {
                                if (selected_item === item?.id) {
                                  return (
                                    <label
                                      key={index}
                                      className="text-gray-500 text-[10px] font-medium"
                                    >
                                      {index == 0
                                        ? item?.[data4_item_name]
                                        : "," + item?.[data4_item_name]}
                                    </label>
                                  );
                                }
                              }
                            );
                          }
                        )}
                      </div>
                    ) : null}

                    {data5_array_single_map?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data5_array_single_map_label}
                        </label>

                        {data5_array_single_map?.map(
                          (item: any, index: number) => {
                            return (
                              <label
                                key={index}
                                className="text-gray-500 text-[10px] font-medium"
                              >
                                {index == 0 ? item : "," + item}
                              </label>
                            );
                          }
                        )}
                      </div>
                    ) : null}

                    {data6_array_single_map?.length ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data6_array_single_map_label}
                        </label>

                        {data6_array_single_map?.map(
                          (item: any, index: number) => {
                            return (
                              <label
                                key={index}
                                className="text-gray-500 text-[12px] font-medium"
                              >
                                {index == 0 ? item : "," + item}
                              </label>
                            );
                          }
                        )}
                      </div>
                    ) : null}

                    {data7_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data7_txt_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data7_txt}
                        </label>
                      </div>
                    ) : null}

                    {data8_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data8_txt_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data8_txt}
                        </label>
                      </div>
                    ) : null}

                    {data9_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data9_txt_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data9_txt}
                        </label>
                      </div>
                    ) : null}

                    {data10_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data10_txt_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data10_txt}
                        </label>
                      </div>
                    ) : null}

                    {data11_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data11_txt_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data11_txt}
                        </label>
                      </div>
                    ) : null}

                    {data12_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data12_txt_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data12_txt}
                        </label>
                      </div>
                    ) : null}

                    {data13_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data13_txt_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data13_txt}
                        </label>
                      </div>
                    ) : null}

                    {data14_txt ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data14_txt_label}
                        </label>
                        <label className="text-gray-500 text-[10px] font-medium">
                          {data14_txt}
                        </label>
                      </div>
                    ) : null}

                    {data7_array_single_table_show ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <label className="text-gray-700 text-[12px] font-medium">
                          {data7_array_single_map_label}
                        </label>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "space-around",
                            borderStyle: "solid",
                            borderColor: "black",
                            borderWidth: 1,
                          }}
                        >
                          <div>
                            <label className="text-gray-600 text-[11px] font-medium">
                              {data7_array_dynamicPropertyName1_label}{" "}
                            </label>

                            {data7_array_single_map?.map(
                              (item: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    {data7_array_dynamicPropertyName1_label ? (
                                      <div>
                                        <label className="text-gray-500 text-[10px] font-medium">
                                          {
                                            item?.[
                                              data7_array_dynamicPropertyName1
                                            ]
                                          }
                                        </label>
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              }
                            )}
                          </div>
                          <div>
                            <label className="text-gray-600 text-[11px] font-medium">
                              {data7_array_dynamicPropertyName2_label}{" "}
                            </label>

                            {data7_array_single_map?.map(
                              (item: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    {data7_array_dynamicPropertyName2_label ? (
                                      <div>
                                        <label className="text-gray-500 text-[10px] font-medium">
                                          {
                                            item?.[
                                              data7_array_dynamicPropertyName2
                                            ]
                                          }
                                        </label>
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              }
                            )}
                          </div>
                          <div>
                            <label className="text-gray-600 text-[11px] font-medium">
                              {data7_array_dynamicPropertyName3_label}{" "}
                            </label>

                            {data7_array_single_map?.map(
                              (item: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    {data7_array_dynamicPropertyName3_label ? (
                                      <div>
                                        <label className="text-gray-500 text-[10px] font-medium">
                                          {
                                            item?.[
                                              data7_array_dynamicPropertyName3
                                            ]
                                          }
                                        </label>
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="row">
                    {table_2_show ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <div className="row">
                          {table2_title ? (
                            <label className="text-gray-700 text-[12px] font-medium">
                              {table2_title}
                            </label>
                          ) : null}
                          <div className="col">
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                justifyContent: "space-around",
                                borderStyle: "solid",
                                borderColor: "black",
                                borderWidth: 1,
                              }}
                            >
                              <div>
                                <label className="text-gray-600 text-[9px] font-medium">
                                  {table2_option1_label}{" "}
                                </label>

                                {table2_option1_full_list?.map(
                                  (item: any, index: number) => {
                                    return (
                                      <>
                                        {table2_option1_match_id?.map(
                                          (
                                            math_id_item: any,
                                            math_id_index: number
                                          ) => {
                                            if (item?.id === math_id_item) {
                                              return (
                                                <div
                                                  key={index}
                                                  style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                  }}
                                                >
                                                  <div>
                                                    <label className="text-gray-500 text-[7px] font-medium">
                                                      {
                                                        item?.[
                                                          table2_option1_dynamic_filed_name
                                                        ]
                                                      }
                                                    </label>
                                                  </div>
                                                </div>
                                              );
                                            }
                                          }
                                        )}
                                      </>
                                    );
                                  }
                                )}
                              </div>

                              <div>
                                <label className="text-gray-600 text-[9px] font-medium">
                                  {table2_option2_label}{" "}
                                </label>

                                {table2_option2_show_arr_values?.map(
                                  (item: any, index: number) => {
                                    return (
                                      <>
                                        <div
                                          key={index}
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                          }}
                                        >
                                          <div>
                                            <label className="text-gray-500 text-[7px] font-medium">
                                              {index === 0 ? item : ` ${item}`}
                                            </label>
                                          </div>
                                        </div>
                                      </>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {table_3_show ? (
                      <div className="col-md-6 col-sm-12 mt-2">
                        <div className="row">
                          {table3_title ? (
                            <label className="text-gray-700 text-[12px] font-medium">
                              {table3_title}
                            </label>
                          ) : null}
                          <div className="col">
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                width: "100%",
                                justifyContent: "space-around",
                                borderStyle: "solid",
                                borderColor: "black",
                                borderWidth: 1,
                              }}
                            >
                              <div>
                                <label className="text-gray-600 text-[9px] font-medium">
                                  {table3_option1_label}{" "}
                                </label>

                                {table3_option1_full_list?.map(
                                  (item: any, index: number) => {
                                    return (
                                      <>
                                        {table3_option1_match_id?.map(
                                          (
                                            math_id_item: any,
                                            math_id_index: number
                                          ) => {
                                            if (item?.id === math_id_item) {
                                              return (
                                                <div
                                                  key={index}
                                                  style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                  }}
                                                >
                                                  <div>
                                                    <label className="text-gray-500 text-[7px] font-medium">
                                                      {
                                                        item?.[
                                                          table3_option1_dynamic_filed_name
                                                        ]
                                                      }
                                                    </label>
                                                  </div>
                                                </div>
                                              );
                                            }
                                          }
                                        )}
                                      </>
                                    );
                                  }
                                )}
                              </div>

                              <div>
                                <label className="text-gray-600 text-[9px] font-medium">
                                  {table3_option2_label}{" "}
                                </label>

                                {table3_option2_show_arr_values?.map(
                                  (item: any, index: number) => {
                                    return (
                                      <>
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                          }}
                                        >
                                          <div>
                                            <label className="text-gray-500 text-[7px] font-medium">
                                              {index === 0 ? item : ` ${item}`}
                                            </label>
                                          </div>
                                        </div>
                                      </>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {show_big_table ? (
                    <div className="flex row mt-[3%]">
                      <label className="text-gray-700 text-[12px] font-medium">
                        {big_table1_title}
                      </label>
                      <div className="col">
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "space-around",
                            borderStyle: "solid",
                            borderColor: "black",
                            borderWidth: 1,
                          }}
                        >
                          <div>
                            <label className="text-gray-600 text-[8px] font-medium">
                              {big_table1_option1_label}{" "}
                            </label>
                            {big_table1_option1_lists_map?.length > 0 ? (
                              <>
                                {big_table1_option1_lists_map?.map(
                                  (outer_item: any, outer_index: number) => {
                                    return (
                                      <>
                                        {big_table1_option1_lists?.map(
                                          (item: any, index: number) => {
                                            if (outer_item?.id === item) {
                                              return (
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                  }}
                                                >
                                                  <div>
                                                    <label className="text-gray-500 text-[7px] font-medium">
                                                      {
                                                        outer_item?.[
                                                          big_table1_option1_dynamicProperty_name
                                                        ]
                                                      }
                                                    </label>
                                                  </div>
                                                </div>
                                              );
                                            }
                                          }
                                        )}
                                      </>
                                    );
                                  }
                                )}
                              </>
                            ) : (
                              <>
                                {big_table1_option1_lists?.map(
                                  (item: any, index: number) => {
                                    return (
                                      <div
                                        key={index}
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                        }}
                                      >
                                        <div>
                                          <label className="text-gray-500 text-[7px] font-medium">
                                            {item}
                                          </label>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </>
                            )}
                          </div>

                          <div>
                            <label className="text-gray-600 text-[8px] font-medium">
                              {big_table1_option2_label}{" "}
                            </label>

                            {big_table1_option2_lists?.map(
                              (item: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <div>
                                      <label className="text-gray-500 text-[7px] font-medium">
                                        {item}
                                      </label>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>

                          <div>
                            <label className="text-gray-600 text-[8px] font-medium">
                              {big_table1_option3_label}{" "}
                            </label>

                            {big_table1_option3_lists?.map(
                              (item: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <div>
                                      <label className="text-gray-500 text-[7px] font-medium">
                                        {item}
                                      </label>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>

                          <div>
                            <label className="text-gray-600 text-[8px] font-medium">
                              {big_table1_option4_label}{" "}
                            </label>

                            {big_table1_option4_lists?.map(
                              (item: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <div>
                                      <label className="text-gray-500 text-[7px] font-medium">
                                        {item}
                                      </label>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>

                          <div>
                            <label className="text-gray-600 text-[8px] font-medium">
                              {big_table1_option5_label}{" "}
                            </label>

                            {big_table1_option5_lists?.map(
                              (item: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <div>
                                      <label className="text-gray-500 text-[7px] font-medium">
                                        {item}
                                      </label>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>

                          <div>
                            <label className="text-gray-600 text-[8px] font-medium">
                              {big_table1_option6_label}{" "}
                            </label>

                            {big_table1_option6_lists?.map(
                              (item: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <div>
                                      <label className="text-gray-500 text-[7px] font-medium">
                                        {item}
                                      </label>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                    <section>
                      <button
                        className="btn-purple mr-2"
                        onClick={onClick}
                        disabled={isLoading}
                      >
                        {"SUBMIT"}
                      </button>
                      <button
                        className="btn-outline-purple"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {"CANCEL"}
                      </button>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
