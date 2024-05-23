"use client";
import type { NextPage } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import API from "@lib/Api";
import { useEffect, useState } from "react";
import Link from "next/link";
import InputCode from "@components/core/InputCode";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useLoading } from "context/LoadingContext";
import Loader from "@components/core/Loader";

const TwoStepVerification: NextPage = () => {
  const searchParams = useSearchParams()
 
  const uname:any = searchParams.get('uname')
  const router = useRouter();
  const [formData, setFormData] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false)

  const [reset, setReset] = useState<any>();
  const [isInputLoading, setIsInputLoading] = useState(false);
  const storedCountdown = localStorage.getItem("countdown");
  const initialCountdown = storedCountdown ? parseInt(storedCountdown, 10) : 119;
  const [countdown, setCountdown] = useState(initialCountdown);
  const [countdownActive, setCountdownActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginProcessor, setShowLoginProcessor] = useState<any>(false);
  const [data, setData] = useState<any>([]);
  const [submitLoader, setSubmitLoader] = useState(false);

  useEffect(() => {
    if (countdownActive && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdownActive(false);
    }
  }, [countdownActive, countdown]);

  useEffect(() => {
    localStorage.setItem("countdown", countdown.toString());
  }, [countdown]);

  const handleResendCode = async() => {
    setReset(true);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setCountdown(119);
      setCountdownActive(true);
    }, 2000);

    try {
      const result:any = await API.post(
        ["auth", "resent-otp"],
        {username: uname}
      );

      if (result.success) {
        toasterSuccess(result.data?.message, 3000, 1)  
      }
    } catch (error) {
      console.log(error);
    }
  };


  const handleCodeSubmit = async (code: any) => {
    setFormData(code)
  }

  const handleFormSubmit = async () => {
    setSubmitLoader(true);
    if(formData.length > 0){
      try {
        const result = await API.post(
          ["auth", "verify-otp"],
          {otp: formData, username:uname}
        );
        
        if (result.success) {
          toasterSuccess('Verified Successfully!', 3000, 1)
          localStorage.setItem("accessToken", result.data.accessToken)
          setData(result?.data);
          if (result.data.processor.length > 1) {
            setIsLoading(false);
            setShowLoginProcessor(true)
          } 
          else {
            if (result.data.isAgreementAgreed) {
              router.push(`/`);
            } else {
              router.push(`/auth/user-agreement?id=${result.data.user.id}`);
            }
            
          }    
        }
        else {
          toasterError('Invalid or expired OTP!', 3000, 1)
          setSubmitLoader(false);
        }
      } catch (error) {
        console.log(error)
        setSubmitLoader(false);
      }
    }
  };

  return (
    <div className="login-box">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="logo-wrap">
            <img src="/images/logo-with-text.svg" className="d-none d-lg-block" alt="..." />
            <img src="/images/logo-with-text-white.svg" className="d-lg-none" alt="..." />
            <h3 className="heading18 d-lg-none">The Traceability Platform Revolutionizing Paddy Supply Chains</h3>
          </div>
          <div className="mx-login-left">
            <div className="login-form-box">
              <div className="login-form-wrapper">
                <div className="top-headings">
                  <h3 className="heading24 main-heading"><span className="heading36">Two Step</span> Authentication</h3>
                  <p className="heading14">Please enter the 6 digit Code you have received on your email account</p>
                </div>
                <form >
                  <div className="flex flex-col gap-6">
                    <InputCode isLoading={isInputLoading} callback={handleCodeSubmit} reset={reset} />
                  </div>
                  <div className="flex justify-center pt-5">
                    <div>
                      <span className="text-sm">Haven't received it? <button onClick={() => handleResendCode()} disabled={isLoading || countdown > 0} style={{
                        cursor: countdown > 0 ? "not-allowed" : "pointer",
                        color: countdown > 0 ? "black" : "blue",
                      }}>Resend code</button></span> {countdown > 0 && <span className="text-xs">({Math.floor(countdown / 60)}m:{countdown % 60 < 10 ? "0" : ""}{countdown % 60}s)</span>}
                    </div>
                  </div>


                  <div className="btn-controls">
                    {submitLoader ?
                      <button
                      className="btn btn-purple w-100 flex items-center"
                      type="button"
                      disabled={isSubmitDisabled}
                      onClick={handleFormSubmit}
                    >
                      <Loader height={8}/>
                    </button>
                    :
                    <button
                    className="btn btn-purple w-100"
                    type="button"
                    disabled={isSubmitDisabled}
                    onClick={handleFormSubmit}
                    >
                      Verify
                    </button>
                    }
                  </div>

                  <div className="back-link">
                    <Link className="left-arrow-link" href={'/auth/login'}><span className="icon-double-arrow-left icon"></span>Back</Link>
                  </div>

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
              <h2 className="heading32">The Traceability Platform Revolutionizing Paddy Supply Chains</h2>
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
        {showLoginProcessor && 
            <LoginAs
            data={data}
            id={data?.user?.id}
            />
      }
      </div>
    </div>
  );
};

export default TwoStepVerification;


const LoginAs: React.FC<{
  data: any;
  id: number;
}> = ({ data, id }) => {

  const ProcessorCard: React.FC<{
    processor: any;
    type: string;
    path: string;
    name: string;
  }> = ({ processor, type, path , name}) => {
    const router = useRouter();
    const { setLoading }: any = useLoading();

    const handleProcessorLogin = async (processorname:string, processorId: number) => {
      try {
        setLoading(true);
        const res = await API.get(
          `user/processor-admin?type=${processorname}&${processorname}Id=${processorId}`
        );
        if (res.success) {
          localStorage.setItem("accessToken", res.data.accessToken)
          if (res.data.user.isAgreementAgreed) {
            router.push(path);
          } else {
            router.push(`/auth/user-agreement?id=${res.data.user.id}`);
          }
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
    return (
      <div className="sm:w-100 lg:w-1/2 md:w-1/2 p-4 ">
        <div className="border border-gray-300 rounded-lg shadow-md p-6 hover:cursor-pointer hover:shadow-lg transition duration-300" onClick={() => handleProcessorLogin(name, processor.id)}>
          <p className="font-bold text-lg mt-4 mb-2">Processor Type:</p>
          <p>{type}</p>
          <p className="font-bold text-lg mb-2">Processor Name:</p>
          <p>{processor.name}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="fixPopupFilters fixWidth flex w-full align-items-center z-10 fixed justify-center top-0 left-0 right-0 bottom-0 p-3">
    <div className="bg-gray-100 rounded-lg shadow-md p-8">
      <h1 className="text-center text-3xl font-bold mb-8">Login As</h1>

      <div className="flex flex-wrap justify-center overflow-y-scroll h-[500px]">
        {data.mandi && <ProcessorCard processor={data.mandi} type="Mandi" path="/mandi/dashboard" name="mandi"/>}
        {data.mill && <ProcessorCard processor={data.mill} type="Mill" path="/mill/dashboard" name="mill"/>}
        {/* {data.knitter && <ProcessorCard processor={data.knitter} type="Knitter" path="/knitter/dashboard" name="knitter"/>}
        {data.weaver && <ProcessorCard processor={data.weaver} type="Weaver" path="/weaver/dashboard" name="weaver"/>}
        {data.garment && <ProcessorCard processor={data.garment} type="Garment" path="/garment/dashboard" name="garment"/>}
        {data.fabric && <ProcessorCard processor={data.fabric} type="Fabric" path="/fabric/dashboard"  name="fabric" />} */}
      </div>
    </div>
  </div>
  );
}
