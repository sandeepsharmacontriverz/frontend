import { useState, useCallback, useRef, useEffect } from "react";

const usePreventDuplicateSubmit = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleFormSubmit = useCallback(
    async (callback: any) => {
      if (!isSubmitting) {
        try {
          setSubmitting(true);
          await callback();
        } catch (error) {
          // Handle the error as needed
          console.error("API call error:", error);
        } finally {
          if (mountedRef.current) {
            setSubmitting(false);
          }
        }
      }
    },
    [isSubmitting]
  );

  return { isSubmitting, handleFormSubmit };
};

export default usePreventDuplicateSubmit;
