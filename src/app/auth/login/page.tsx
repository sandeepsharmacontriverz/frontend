"use client";
import Form from "@components/auth-form/Form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import API from "@lib/Api";
import { useLoading } from "context/LoadingContext";
import { toasterSuccess } from "@components/core/Toaster";

const Login = () => {
  const router = useRouter();

  const { setLoading }: any = useLoading();
  const formFields = [
    { name: "username", type: "text", placeholder: "Username", title: "Username" },
    { name: "password", type: "password", placeholder: "Password", title: "Password" },
  ];
  const [showLoginProcessor, setShowLoginProcessor] = useState<any>(false);
  const [data, setData] = useState<any>([]);


// const getCookie = (name:string) => {
//   console.log(document.cookie)
//   const cookies = document.cookie
//     .split("; ")
//     .find((row) => row.startsWith(`${name}=`));
 
//   return cookies ? cookies.split("=")[1] : null;
//  };
 

//  const authUser:any = getCookie("authUser");

  const [errorMessage, setErrorMessage] = useState<{ [key: string]: string | null }>({});
  const handleFormSubmit = async (formData: { [key: string]: any }) => {
  //  if(authUser === formData.username ){
    try {
      const result = await API.post(
        "auth/signin",
        formData
      );
      if (result.data) {
        if(result?.data?.message){
          toasterSuccess(result?.data?.message)
          router.push(`/auth/two-step-verification?uname=${formData.username}`);
          return ;
        }
        setLoading(true);
        localStorage.setItem("accessToken", result.data.accessToken)
        setData(result?.data);
        if (result.data.processor.length > 1) {
          setLoading(false);
          setShowLoginProcessor(true)
        } else {
          if (result.data.isAgreementAgreed) {
            router.push(`/`);
          } else {
            router.push(`/auth/user-agreement?id=${result.data.user.id}`);
          }
          
        }         
      }
      else {
        let field;
        let res;
        if (result.error.code === "ERR_AUTH_WRONG_USERNAME") {
          field = "username"
          res = "Invalid Username"
        }
        else {
          field = "password"
          res = "Wrong Password"
        }
        setErrorMessage({
          ...errorMessage,
          [field]: res,
        });
      }

    } catch (error) {
      console.log(error);

    }
  // }
  // else{
  //   //API Call for Verification.
  //   try {
  //     const result = await API.post(
  //       "auth/sent-otp",
  //       formData
  //     );
  //     if (result.data) {
  //       setLoading(true);
  //       if(result?.data?.message){
  //         toasterSuccess(result?.data?.message)
  //         router.push(`/auth/two-step-verification?uname=${formData.username}`);
  //       }
  //       else {
  //         let field;
  //         let res;
  //         if (result?.error?.code === "ERR_AUTH_WRONG_USERNAME") {
  //           field = "username"
  //           res = "Invalid Username"
  //         }
  //         else {
  //           field = "password"
  //           res = "Wrong Password"
  //         }
  //         setErrorMessage({
  //           ...errorMessage,
  //           [field]: res,
  //         });
  //       }
  //     }
  //   else {
  //     let field;
  //     let res;
  //     if (result?.error?.code === "ERR_AUTH_WRONG_USERNAME") {
  //       field = "username"
  //       res = "Invalid Username"
  //     }
  //     else {
  //       field = "password"
  //       res = "Wrong Password"
  //     }
  //     setErrorMessage({
  //       ...errorMessage,
  //       [field]: res,
  //     });
  //   }
  //   } catch (error) {
  //     console.log(error);

  //   }
  // }
  };

  return (
    <div> 
      {showLoginProcessor && 
        <LoginAs
        data={data}
        id={data?.user?.id}
        />
      }
      
      <Form
        titleBold="Sign in"
        titleNormal="to your Account"
        fields={formFields}
        rememberMe={true}
        buttonText="Submit"
        linkText="Forgot Password?"
        linkUrl="/auth/forgot-password"
        onSubmit={handleFormSubmit}
        error={errorMessage}
      />
      
    </div>
  );
};

export default Login;

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
            setLoading(false);
          } else {
            router.push(`/auth/user-agreement?id=${res.data.user.id}`);
            setLoading(false);
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