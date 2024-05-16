"use client";
import { useEffect, useState } from "react";
import Link from "@components/core/nav-link";
import useTranslations from '@hooks/useTranslation';
import Form from "react-bootstrap/Form";
import { useLanguage } from "context/languageContext";
import useNewContext from "context/ContextProvider";
import { useRouter } from "@lib/router-events";

export default function Header() {
  const router = useRouter();

  const { fetchTranslations, loading, setLoading } = useTranslations();
  const { changeLanguage } = useLanguage();
  const { savedData } = useNewContext();

  const [header, setHeader] = useState("Dashboard");
  const [locale, setLocale] = useState('');

  useEffect(() => {
    const title = document.title.split("| ");
    if (title && title.length > 1) {
      setHeader(title[1]);
    }
  }, []);

  useEffect(() => {
    const loc = localStorage.getItem("locale");
    if (loc) {
      setLocale(loc);
    } else {
      setLocale('en');
    }
  }, []);

  function handleMenuToggle() {
    const isMenu = document.getElementById('menu-section');
    if (isMenu) {
      isMenu.classList.add('active');
    }
  }

  const handleChange = async (e: any) => {
    const newLanguage = e.target.value;
    changeLanguage(newLanguage);
    setLocale(newLanguage);
    localStorage.setItem('locale', newLanguage);
    await fetchTranslations(newLanguage);
    sessionStorage.removeItem("activetab");
  };

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div id="header-title" className="title d-none d-lg-block">
              {header}
            </div>
            <div className="logo d-block d-lg-none">
              <Link href="/dashboard">
                <img src="/images/logo.svg" />
              </Link>
            </div>
          </div>
          <div className="header-right">
            <ul className="right-ul-list">
              <li>
                <div className="profile">
                  <p className="d-none d-lg-block">
                    Welcome <span>{savedData ? savedData : ''} !</span>
                  </p>
                  <div
                    className="profile-img cursor-pointer"
                    onClick={() => router.push("/user/user-profile")}
                  >
                    {/* <img src="https://www.pngitem.com/pimgs/m/78-786293_1240-x-1240-0-avatar-profile-icon-png.png" /> */}
                    <img src="/images/avatar-profile-icon-png.png" />
                  </div>
                </div>
              </li>
              <li>
                <button type="button" />{" "}
                <i className="btn btn-link icon-bell"></i>
              </li>
              <li className="d-block d-lg-none">
                <button />
                <i
                  className="btn btn-link icon-menu"
                  onClick={handleMenuToggle}
                ></i>
              </li>
              <li className="d-none d-md-block langDrop">
                <Form.Select
                  aria-label="Default select example"
                  className="dropDownFixes rounded-md formDropDown text-sm"
                  name="lang"
                  onChange={handleChange}
                  value={locale}
                >
                  <option value="en">English</option>
                  <option value="cn">Chinese</option>
                  <option value="tr">Turkish</option>
                </Form.Select>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </div>
  );
}
