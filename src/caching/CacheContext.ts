import React from 'react';

export interface CacheContextInterface {
  totalCapacity: number;
  cacheDirectoryName: string;
  scrapCache(): any;
}

const defaultCacheContext: CacheContextInterface = {
  totalCapacity: 200,
  cacheDirectoryName: 'imageCache',
  scrapCache: () => {}
};

const cacheContext = React.createContext<CacheContextInterface>(
  defaultCacheContext
);

export const CacheContextProvider = cacheContext.Provider;
export const CacheContextConsumer = cacheContext.Consumer;
