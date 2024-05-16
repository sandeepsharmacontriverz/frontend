"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import API from "@lib/Api";
import { useLoading } from "context/LoadingContext";

const AgreementForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id')
  const { setLoading }: any = useLoading();

  const [isAgreed, setIsAgreed] = useState(false);
  const [warning, setWarning] = useState(false)

  const handleAgreementForm = async () => {
    try {
      const res = await API.post("auth/update-agreement", {
        id: id,
        isAgreed
      })
      if (res.success) {
        setLoading(true);
        router.push("/")
      }
    } catch (error) {
      console.log(error)
    }
  };
  const handleCheckbox = () => {
    setIsAgreed(!isAgreed);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-slate-300">
      <div className="relative w-1/2 h-3/4 bg-gray-100 rounded-lg shadow-md p-4">
        <div className="h-1/12 absolute top-0 left-0 right-0 py-2 px-4 border-b border-gray-300">
          <h1>License Agreement</h1>
        </div>
        <div className="mt-10 mb-10 pt-12 pb-16 px-4 overflow-y-scroll h-5/6">
          <p>
            Licensee agrees to defend, indemnify, and hold harmless
            RiceTraceability, its officers, members, employees, contractors,
            affiliates and its licensors from and against any damages, costs,
            liabilities, settlement amounts and/or expenses (including
            attorney's fees) incurred in connection with any claim, lawsuit or
            action by any party or third party that arises or results from the
            use or distribution of the solution or any portion thereof, or any
            breach of licensees representations, warranties and covenants set
            forth in this agreement.
          </p>
          <br />
          <br />

          <span className="pt-10 text-lg">
            Disclaimer of warranties and limitation of liability.
          </span>
          <br />
          <br />
          <p>
            {" "}
            <span className="font-bold">Disclaimer of warranties.</span>{" "}
            Licensee agrees that to the maximum extent permitted by applicable
            law, RiceTraceability and its suppliers provide the solution and
            support services (if any) as is and with all faults, and hereby
            disclaim all other warranties and conditions, either express,
            implied or statutory, including, but not limited to, any (if any)
            implied warranties, duties or conditions of merchantability, of
            fitness for a particular purpose, of accuracy or completeness of
            responses, of results, of workmanlike effort, of lack of viruses,
            and of lack of negligence, all with regard to the solution, and the
            provision of or failure to provide support services. Also, there is
            no warranty or condition of title, quiet enjoyment, quiet
            possession, correspondence to description or non-infringement
            regarding the solution. The entire risk as to the quality or arising
            out of use or performance of the solution and support services, if
            any, remains with licensee.{" "}
          </p>
          <br />
          <p>
            {" "}
            <span className="font-bold">
              Exclusion of incidental, consequential and certain other damages.
            </span>{" "}
            To the maximum extent permitted by applicable law, in no event shall
            RiceTraceability or its suppliers be liable for any special,
            incidental, indirect, punitive or consequential damages whatsoever
            (including, but not limited to, damages for loss of profits or
            confidential or other information, for business interruption, for
            personal injury, for loss of privacy, for failure to meet any duty
            including of good faith or of reasonable care, for negligence, and
            for any other pecuniary or other loss whatsoever) arising out of or
            in any way related to the use of or inability to use the solution,
            the provision of or failure to provide support services, or
            otherwise under or in connection with any provision of this
            agreement, even in the event of the fault, tort (including
            negligence), strict liability, breach of contract or breach of
            warranty of RiceTraceability or any supplier, and even if RiceTraceability
            or any supplier has been advised of the possibility of such damages.{" "}
          </p>
          <br />
          <br />
          <p>
            Licensee warrants that it shall hold in the strictest confidence
            this computer program and any related materials or information
            including, but not limited to, any technical data, research, product
            plans or know-how provided by RiceTraceability to Licensee, either
            directly or indirectly in writing, orally or by inspection of
            materials, including the Software, Related Licensed Materials, and
            other application software, systems, or materials, provided by
            RiceTraceability (RiceTraceability's Confidential Information). Licensee
            warrants that it shall not disclose any of RiceTraceability's
            Confidential Information to third parties and Licensee warrants that
            it shall take reasonable measures to protect the secrecy of and
            avoid disclosure and unauthorized use of RiceTraceability's
            Confidential Information. Licensee shall immediately notify
            RiceTraceability in the event of any unauthorized or suspected use or
            disclosure of RiceTraceability's Confidential Information.{" "}
          </p>

          <span className="flex justify-end mt-4 font-bold">
            <input
              type="checkbox"
              className="mr-2"
              onChange={handleCheckbox}
              checked={isAgreed}
            />
            I agree to the above License Agreement.
          </span>
        </div>

        <div className="h-1/12 absolute bottom-0 left-0 right-0 border-t border-gray-300">
          <div className="flex items-center justify-between">
            <div className="w-2/3 p-4">
              {warning && (<p className="text-red-500 font-semibold">Please check the License Agreement checkbox to proceed further.</p>)}
            </div>
            <div className=" w-1/3 flex justify-end pr-4">
              <button className="bg-green-500 rounded p-2  mr-3 mt-3 mb-3 text-white text-sm" onClick={() => {
                isAgreed ? handleAgreementForm() : setWarning(true);
              }}>
                Submit
              </button>
              <button className="bg-grey-500 rounded p-2 mr-3 mt-3 mb-3  border-2 border-gray-500" onClick={() => router.push("/auth/login")}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementForm;
