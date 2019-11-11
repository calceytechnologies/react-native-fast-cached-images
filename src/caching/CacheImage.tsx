import {ImageServiceInstance} from '../services/ImageService';
import React from 'react';
import {
  Image,
  ImageBackground,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {Fade, Placeholder, PlaceholderMedia} from 'rn-placeholder';
import {CacheContextConsumer, CacheContextInterface} from './CacheContext';

const RETRY_LIMIT = 1;

export interface CacheImageProps {
  imageUrl: string;
  fromCache: boolean;
  id?: string;
  coverMode?: boolean;
  isLoading?: boolean;
  renderChildrenOnLoad?: boolean;
  name?: string;
  activeOpacity?: number;
  blurRadius?: number;
  offline?: boolean;
  cacheFolder?: string;
  placeholderStyles?: StyleProp<ViewStyle>;
  imageStyles?: StyleProp<ViewStyle>;
  containerStyles?: StyleProp<ViewStyle>;
  imageBackgroundStyle?: any;
  onPress?: (event: Event) => void;
  isOnlineGallery?: boolean;
}

export interface CacheImageState {
  imagePath: string | null;
  isLoading: boolean;
  error: boolean;
  tempLoading: boolean;
}

const cacheTresHold = 50;

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

  private appContext;

  private retryCount = 0;

  constructor(props: CacheImageProps) {
    super(props);

    this.state = {
      imagePath: null,
      isLoading: true,
      error: false,
      tempLoading: true
    };
  }

  public componentDidMount() {
    this.setState({isLoading: true});
    this.cacheImage(this.appContext);

    if (this.retryCount !== 0) {
      this.retryCount = 0;
    }
  }

  public componentDidUpdate(newProps) {
    const {imageUrl} = this.props;
    if (imageUrl !== newProps.imageUrl) {
      this.setState({isLoading: true});
      this.cacheImage(this.appContext);
    }
  }

  public cacheImage = async (context: CacheContextInterface) => {
    const {
      id,
      imageUrl,
      offline = false,
      fromCache = true,
      cacheFolder = ''
    } = this.props;
    let downloadProgress = 0;
    if (imageUrl) {
      const cacheDirectoryName = 'imageCache';
      const fileName: string = offline
        ? imageUrl
        : ImageServiceInstance.generateFileName(imageUrl);
      const cacheDirectory: string = `${RNFetchBlob.fs.dirs.CacheDir}/${cacheDirectoryName}/${cacheFolder}`;
      const filePath = cacheDirectory + fileName;

      if (fromCache) {
        try {
          await ImageServiceInstance.checkFileExist(filePath);
          this.setState({
            imagePath: filePath,
            isLoading: false
          });
        } catch (err) {
          // if from cache then download and add to file path
          context.scrapCache();
          RNFetchBlob.config({
            fileCache: true,
            path: filePath
          })
            .fetch('GET', imageUrl)
            .progress({interval: 20}, (received, total) => {
              const percentage = Math.floor((received / total) * 100);
              downloadProgress = percentage;
            })
            .then(res => {
              if (downloadProgress < cacheTresHold) {
                ImageServiceInstance.deleteFileByPath(filePath, cacheFolder);
                this.retryMechanism();
              } else if (
                res.path() &&
                ImageServiceInstance.checkFileExist(res.path())
              ) {
                this.setState({
                  imagePath: res.path(),
                  isLoading: false
                });
              }
            })
            .catch(err => {
              ImageServiceInstance.deleteFileByPath(filePath, cacheFolder);
              this.retryMechanism();
            });
        }
      } else {
        this.setState({
          imagePath: filePath,
          isLoading: false,
          tempLoading: true
        });
      }
    } else {
      //
    }
  };

  public renderLoader = () => {
    const {placeholderStyles = null, imageStyles} = this.props;
    return (
      <View style={imageStyles || styles.image}>
        <Placeholder Animation={Fade} style={styles.placeholderContainer}>
          <PlaceholderMedia
            style={[styles.placeholderMedia, placeholderStyles]}
          />
        </Placeholder>
        <View style={[styles.placeholderOverlay, imageStyles || styles.image]}>
          {this.props.children}
        </View>
      </View>
    );
  };

  public filterSource = name => {
    const {imageUrl, fromCache = true} = this.props;
    const {imagePath} = this.state;
    return fromCache ? 'file://' + `${imagePath}` : imageUrl;
  };

  public retryMechanism = () => {
    const {fromCache = true} = this.props;
    if (this.retryCount < RETRY_LIMIT && fromCache) {
      this.retryCount++;
      this.cacheImage(this.appContext);
    } else {
      this.setState({
        tempLoading: true,
        isLoading: false
      });
    }
  };

  public handleOnLoad = () => {
    this.setState({
      tempLoading: false
    });
  };

  public renderImage = () => {
    const {tempLoading, isLoading} = this.state;
    const {
      imageUrl,
      coverMode = true,
      name,
      imageStyles,
      imageBackgroundStyle
    } = this.props;

    if (coverMode) {
      // check for resize mode
      return (
        <ImageBackground
          {...this.props}
          fadeDuration={0}
          resizeMethod='resize'
          resizeMode={'cover'}
          onLoad={this.handleOnLoad}
          style={imageStyles || styles.image}
          source={{uri: this.filterSource(name)}}
          imageStyle={imageBackgroundStyle}
          key={imageUrl}
        >
          {!isLoading && tempLoading
            ? this.renderLoader()
            : this.props.children}
          {/* //if basic loading is over and temp loading is happening show the loader again */}
        </ImageBackground>
      );
    } else {
      return (
        <Image
          {...this.props}
          key={imageUrl}
          resizeMode={'contain'}
          resizeMethod='resize'
          fadeDuration={0}
          source={{uri: this.filterSource(name)}}
          style={imageStyles || styles.image}
        />
      );
    }
  };

  public renderContent = (context: CacheContextInterface) => {
    let content: Element;
    if (this.state.isLoading) {
      // get from cache
      content = (
        <View style={this.props.containerStyles || styles.container}>
          {this.renderLoader()}
        </View>
      );
    } else {
      content = (
        <TouchableOpacity
          style={this.props.containerStyles || styles.container}
          {...this.props}
        >
          {this.renderImage()}
        </TouchableOpacity>
      );
    }
    return content || null;
  };

  public checkLoadingWrapper(context: any, isLoading: boolean) {
    this.appContext = context;
    // brute force loading
    if (isLoading) {
      return this.renderLoader();
    } else {
      return this.renderContent(context);
    }
  }

  public render() {
    const {isLoading = false} = this.props;
    return (
      <CacheContextConsumer>
        {context => this.checkLoadingWrapper(context, isLoading)}
      </CacheContextConsumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  placeholderMedia: {
    minWidth: '100%',
    minHeight: '100%'
  },

  placeholderContainer: {
    minWidth: '100%',
    minHeight: '100%',
    position: 'relative',
    zIndex: -1
  },
  placeholderOverlay: {
    minWidth: '100%',
    minHeight: '100%',
    position: 'absolute',
    zIndex: 1
  }
});
