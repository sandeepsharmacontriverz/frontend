"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "context/languageContext";

const useTranslations = (): any => {
  const [translations, setTranslations] = useState<any>({});
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);

  const fetchTranslations = async (lang: string): Promise<void> => {
    try {
      const langNew = lang || "en";
      const data = await import(`../locales/${langNew}/common.json`);
      setTranslations(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading translations:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations(language);
  }, [language]);

  return {
    translations: loading ? {} : translations,
    loading,
    setLoading,
    fetchTranslations,
  };
};

export default useTranslations;
