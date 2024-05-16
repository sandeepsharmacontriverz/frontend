// LanguageContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

interface LanguageContextProps {
  language: string;
  changeLanguage: (newLanguage: string) => void;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: "en",
  changeLanguage: () => {},
});

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState("en");

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  useEffect(() => {
    const locale: string | null = localStorage.getItem("locale");
    const initialLanguage = locale || "en";
    setLanguage(initialLanguage);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
