import RNFetchBlob, {FS} from 'rn-fetch-blob';
const commonCacheDirectory = 'imageCache';

class ImageService {
  public deleteFileByPath = async (filePath, cacheFolder) => {
    const cacheDirectory: string = `${RNFetchBlob.fs.dirs.CacheDir}/${commonCacheDirectory}/${cacheFolder}`;
    const fileSystem: FS = RNFetchBlob.fs;

    try {
      if (fileSystem.exists(cacheDirectory)) {
        if (fileSystem.exists(filePath)) {
          fileSystem
            .unlink(filePath)
            .then(() =>
              console.log('corrupt file found && deleted->Path: ', filePath)
            )
            .catch(err => console.log('couldnt delete', err));
        }
      }
    } catch (error) {
      // couldnt delete
    }
  };

  public deleteFileById = async id => {
    const fileName: string = ImageServiceInstance.generateFileName(id);
    const cacheDirectory: string = `${RNFetchBlob.fs.dirs.CacheDir}/${commonCacheDirectory}/`;
    const filePath = cacheDirectory + fileName;

    const fileSystem: FS = RNFetchBlob.fs;

    try {
      if (fileSystem.exists(cacheDirectory)) {
        if (fileSystem.exists(filePath)) {
          fileSystem
            .unlink(filePath)
            .then(() => console.log('file found && deleted->Path: ', filePath))
            .catch(err => console.log('couldnt delete', err));
        }
      }
    } catch (error) {
      // couldnt delete
    }
  };

  public generateFileName = (url: string) => {
    const queryParamsRemoved = url.includes('?') ? url.split('?')[0] : url;
    const slashesRemovedArray = queryParamsRemoved.split('/');
    const id = slashesRemovedArray[slashesRemovedArray.length - 1];
    const parts: string[] = id.split('.');
    return parts[0].toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  };

  public checkFileExist = (filePath: string) => {
    return new Promise(async (resolve, reject) => {
      RNFetchBlob.fs
        .exists(filePath)
        .then(exist => (exist ? resolve() : reject()))
        .catch(err => reject(err));
    });
  };

  public getFileExtentension = (url: string) => {
    const queryParamsRemoved = url.includes('?') ? url.split('?')[0] : url;
    const pathParts: string[] = queryParamsRemoved.split('/');
    const fileName: string | undefined = pathParts.pop();

    if (fileName) {
      const parts: string[] = fileName.split('.');
      const extension: string | undefined = parts.pop();
      return extension ? extension : '';
    }

    return '';
  };
}
export const ImageServiceInstance = new ImageService();
