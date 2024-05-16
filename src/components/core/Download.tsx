"use client";
import React from "react";
import XLSX from "xlsx";

export type FileDownloadProps = {
  fileLink: string;
  fileName: string;
  fileType: string;
};

export const handleDownload = async (
  fileLink: string,
  fileName: string,
  fileType: string
) => {
  try {
    if (fileType === ".zip") {
      setTimeout(() => {
        window.open(fileLink);
      }, 700);
    } else {
      const response = await fetch(fileLink, {
        method: 'GET',
        headers: new Headers({
          'Authorization': 'Bearer ' + localStorage.getItem("accessToken"),
          'Content-Type': 'application/json'
        }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `${fileName}.${fileType}`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Error downloading the file:", error);
  }
};

export const handleReportDownload = async (
  fileLink: string,
  fileName: string,
  fileType: string
) => {
  try {
      const a = document.createElement("a");

      a.href = fileLink;
      a.download = `${fileName}.${fileType}`;
      a.click();
      window.URL.revokeObjectURL(fileLink);
  } catch (error) {
    console.error("Error downloading the file:", error);
  }
};
