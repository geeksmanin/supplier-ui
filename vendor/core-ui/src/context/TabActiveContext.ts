import React, { createContext, useContext } from 'react';

export const TabActiveContext = createContext<boolean>(true);
export const useIsTabActive = () => useContext(TabActiveContext);
