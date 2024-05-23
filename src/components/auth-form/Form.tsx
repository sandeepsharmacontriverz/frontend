"use client";
import Loader from "@components/core/Loader";
import Link from "@components/core/nav-link";
import React, { useState, useEffect } from "react";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { AiOutlineEye } from "react-icons/ai";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { AiOutlineCloseCircle } from "react-icons/ai";


interface FieldProps {
  placeholder: string;
  title: string;
  name: string;
  type: string;
  // Add more props as needed
}

interface FormProps {
  fields: FieldProps[];
  titleBold: string;
  titleNormal: string;
  description?: string;
  rememberMe?: boolean;
  buttonText: string;
  linkText?: any;
  linkUrl?: any;
  submitLoader?: boolean;
  error?: { [key: string]: string | null };
  onSubmit: (formData: { [key: string]: any }) => void;
}

const Form: React.FC<FormProps> = ({
  fields,
  titleBold,
  titleNormal,
  description,
  rememberMe,
  buttonText,
  linkText,
  linkUrl,
  submitLoader,
  error,
  onSubmit,
}) => {
  const initialFormData: { [key: string]: any } = {};
  fields.forEach((field) => {
    initialFormData[field.name] = "";
  });
  const [formData, setFormData] = useState(initialFormData);

  const isSubmitDisabled = Object.values(formData).some(value => !value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

  };

  const handleSubmit = () => {
    onSubmit(formData);
  };
  const [passwordVisibility, setPasswordVisibility] = useState<{ [key: string]: boolean }>({});

  const toggleChange = (fieldName: string) => {
    setPasswordVisibility((prevVisibility) => ({
      ...prevVisibility,
      [fieldName]: !prevVisibility[fieldName],
    }));
  };

  return (
    <div className="login-box">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="logo-wrap">
            <img src="/images/logo-with-text.svg" className="d-none d-lg-block" alt="..." />
            <img src="/images/logo-with-text-white.svg" className="d-lg-none" alt="..." />
            <h3 className="heading18 d-lg-none">The TraceRice Platform <br/> From Farm to Spoon</h3>
          </div>
          <div className="mx-login-left">
            <div className="login-form-box">
              <div className="login-form-wrapper">
                <div className="top-headings">
                  <h3 className="heading24 main-heading"><span className="heading36">{titleBold}</span> {titleNormal}</h3>
                  {description &&
                    <p className="heading14">{description}</p>
                  }
                </div>
                <form >
                  {fields.map((field) => (
                    <div className="form-group input-error" key={field.name}>
                      <label className="form-label">{field.title}</label>
                      <input className="form-control gray-placeholder"
                        id={field.name}
                        autoComplete="off"
                        type={field.type === 'password' ? (passwordVisibility[field.name] ? 'text' : 'password') : field.type}
                        name={field.name}
                        onKeyDown={(e) => {if (!isSubmitDisabled &&e.key === 'Enter') {
                          handleSubmit();
                        }}}
                        placeholder={field.placeholder}
                        value={formData[field.name]}
                        onChange={handleChange}
                      />

                      {
                        field.type === "password" &&
                        <button type="button" className={`${error && error[field.name] ? 'absolute right-10 bottom-11' : 'absolute right-10 bottom-4'}`} onClick={() => toggleChange(field.name)} >
                          {passwordVisibility[field.name] ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}  </button>
                      }

                      {error && error[field.name] && (
                        <span className="inline-error-msg text-sm text-red-600">{error[field.name]}</span>
                      )}

                      {error && error[field.name] && (
                        <AiOutlineCloseCircle color="red" className='form-group input-state error' />
                      )
                      }

                    </div>
                  ))}

                  {rememberMe && (
                    <div className="forget-password-wrap">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" value="" id="rememberMe" />
                        <label className="form-check-label" >
                          Remember me
                        </label>
                      </div>
                      <div>
                        <Link href={linkUrl} className="links-btn heading16">{linkText}</Link>
                      </div>
                    </div>
                  )}
                  <div className="btn-controls">
                  {submitLoader ? 
                    <button
                    className="btn btn-purple w-100 flex items-center"
                    type="button"
                    disabled={isSubmitDisabled}
                    onClick={handleSubmit}
                  >
                    <Loader height={8}/>
                  </button>
                  :
                    <button
                      className="btn btn-purple w-100"
                      type="button"
                      disabled={isSubmitDisabled}
                      onClick={handleSubmit}
                    >
                      {buttonText}
                    </button>
                  }
                  </div>
                  {linkText === "Back" &&
                    <div className="back-link">
                      <Link className="left-arrow-link" href={linkUrl}><span className="icon-double-arrow-left icon"></span>{linkText}</Link>
                    </div>
                  }
                </form>
              </div>
            </div>
            <ul className="social-links">
              <li><Link href=""><span className="icon-facebook"></span></Link></li>
              <li><Link href=""><span className="icon-twitter"></span></Link></li>
              <li><Link href=""><span className="icon-instagram"></span></Link></li>
              <li><Link href=""><span className="icon-linkedin"></span></Link></li>
              <li><Link href=""><span className="icon-youtube"></span></Link></li>
            </ul>
          </div>
        </div>
        <div className="login-right">
          <div className="login-right-wrap">
            <div className="login-right-top">
              <h2 className="heading32">The TraceRice Platform <br/> From Farm to Spoon</h2>
              <div className="radial-bg">
                <img src="/images/login-bg.svg" className="img-bg" alt="..." />
              </div>
            </div>
            <ul className="social-icons">
              <li><img src="/images/Google.svg" alt="..." /></li>
              <li><img src="/images/facebook.svg" alt="..." /></li>
              <li><img src="/images/YouTube.svg" alt="..." /></li>
              <li><img src="/images/Pinterest.svg" alt="..." /></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
