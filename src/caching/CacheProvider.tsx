import React, { ReactNode } from "react";
import RNFetchBlob, { FS, RNFetchBlobStat } from "rn-fetch-blob";
import { CacheContextProvider, CacheContextInterface } from "./CacheContext";

export interface CacheProviderProps {
  children: ReactNode;
}

const customCacheContext: CacheContextInterface = {
  totalCapacity: 200,
  cacheDirectoryName: "imageCache",
  scrapCache: () => {}
};

export class CacheProvider extends React.Component<CacheProviderProps> {
  constructor(props: CacheProviderProps) {
    super(props);
  }

  componentDidMount = (): void => {
    this.scrapOutExcessCache();
  };

  scrapOutExcessCache = async () => {
    console.log("scrapOutExcessCache");
    const { cacheDirectoryName, totalCapacity } = customCacheContext;
    const fileSystem: FS = RNFetchBlob.fs;
    const cacheDirectory: string = `${
      RNFetchBlob.fs.dirs.CacheDir
    }/${cacheDirectoryName}/`;

    try {
      //Fetch All Files
      let cachedFiles: RNFetchBlobStat[] = await fileSystem.lstat(
        cacheDirectory
      );

      if (cachedFiles.length === 0) {
        return; //No Files Exist
      }

      cachedFiles = cachedFiles.sort(
        (a: any, b: any) => a.lastModified - b.lastModified
      );

      let totalCachedSize: number = cachedFiles.reduce(
        (cacheSize: number, cacheFile: RNFetchBlobStat) =>
          cacheSize + parseInt(cacheFile.size),
        0
      );

      const cacheLimit: number = totalCapacity * 1024 * 1024; //MB to Bytes
      let overflowCacheSize: number = totalCachedSize - cacheLimit;

      let fileIndex: number = 0;
      while (overflowCacheSize > 0) {
        let cacheFile: RNFetchBlobStat = cachedFiles[fileIndex];
        overflowCacheSize = overflowCacheSize - parseInt(cacheFile.size);
        fileSystem.unlink(cacheDirectory + cacheFile.filename);
        fileIndex++;
      }
    } catch (err) {
      console.error("Image Cache Provider -->", err);
    }
  };

  render() {
    return (
      <CacheContextProvider
        value={{
          ...customCacheContext,
          scrapCache: this.scrapOutExcessCache
        }}
      >
        {this.props.children}
      </CacheContextProvider>
    );
  }
}
