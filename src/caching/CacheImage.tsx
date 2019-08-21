import React from 'react';
import {ActivityIndicator, Image, StyleSheet, View} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import {CacheContextConsumer, CacheContextInterface} from './CacheContext';

export interface CacheImageProps {
  imageUrl: string;
}

export interface CacheImageState {
  imagePath: string | null;
  isLoading: boolean;
}

export default class CacheImage extends React.PureComponent<
  CacheImageProps,
  CacheImageState
> {
  public static getDerivedStateFromProps(
    props: CacheImageProps,
    state: CacheImageState
  ) {
    return {
      imageUrl: props.imageUrl
    };
  }
  constructor(props: CacheImageProps) {
    super(props);

    this.state = {
      imagePath: null,
      isLoading: true
    };
  }

  public checkFileExist = (filePath: string) => {
    return new Promise(async (resolve, reject) => {
      RNFetchBlob.fs
        .exists(filePath)
        .then(exist => (exist ? resolve() : reject()))
        .catch(err => reject(err));
    });
  };

  public getFileExtentension = (url: string) => {
    const pathParts: string[] = url.split('/');
    const fileName: string | undefined = pathParts.pop();

    if (fileName) {
      const parts: string[] = fileName.split('.');
      const extension: string | undefined = parts.pop();

      return extension ? extension : '';
    }

    return '';
  };

  public generateFileName = (url: string) => {
    return url.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  };

  public cacheImage = async (context: CacheContextInterface) => {
    const {imageUrl} = this.props;
    const {cacheDirectoryName} = context;
    const fileName: string = this.generateFileName(imageUrl);
    const fileType: string = this.getFileExtentension(imageUrl);
    const cacheDirectory: string = `${
      RNFetchBlob.fs.dirs.CacheDir
    }/${cacheDirectoryName}/`;
    const filePath = cacheDirectory + fileName + fileType;

    try {
      await this.checkFileExist(filePath);
      this.setState({
        imagePath: filePath,
        isLoading: false
      });
    } catch (err) {
      context.scrapCache();
      RNFetchBlob.config({
        fileCache: true,
        path: filePath
      })
        .fetch('GET', imageUrl)
        .then(res =>
          this.setState({
            imagePath: res.path(),
            isLoading: false
          })
        )
        .catch(err => console.log(err));
    }
  };

  public renderLoader = () => {
    return (
      <ActivityIndicator
        color='white'
        size='small'
        style={this.props.imageStyles || styles.image}
      />
    );
  };

  public renderImage = () => {
    const {imagePath} = this.state;
    return (
      <Image
        source={{uri: 'file://' + imagePath}}
        style={this.props.imageStyles || styles.image}
      />
    );
  };

  public renderContent = (context: CacheContextInterface) => {
    let content = null;
    if (this.state.isLoading) {
      this.cacheImage(context);
      content = this.renderLoader();
    } else {
      content = this.renderImage();
    }

    return content;
  };

  public render() {
    return (
      <CacheContextConsumer>
        {context => (
          <View style={this.props.containerStyles || styles.container}>
            {this.renderContent(context)}
          </View>
        )}
      </CacheContextConsumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#78909C',
    width: 200,
    height: 200
  },
  image: {
    width: 200,
    height: 200
  }
});
