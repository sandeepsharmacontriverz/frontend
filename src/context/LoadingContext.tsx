import React, { createContext, useState } from 'react';

const LoadingContext:any = createContext({});

export const LoadingProvider = ({ children }:any) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => React.useContext(LoadingContext);
