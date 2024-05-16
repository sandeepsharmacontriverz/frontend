import Header from "@lib/Header";
import { useEffect } from "react";

export default function useTitle(title: string, ignore: boolean = false) {
  useEffect(() => {
    if (ignore) document.title = title;
    else document.title = "Rice Traceability | " + title;

    Header.setHeader(title)
  }, [title]);

  return <></>;
}