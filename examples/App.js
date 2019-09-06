/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  FlatList,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {CachedImage} from 'react-native-fast-cached-images';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      dataSource: [],
    };
  }
  componentDidMount() {
    var that = this;
    let items = Array.apply(null, Array(20)).map((v, i) => {
      return {id: i, src: 'https://picsum.photos/id/' + (i + 50) + '/400/400'};
    });
    that.setState({
      dataSource: [...items],
    });
  }

  render() {
    return (
      <Fragment>
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style={styles.body}>
              <Text style={styles.header}>react-native-fast-cached-images</Text>
              <FlatList
                data={this.state.dataSource}
                renderItem={({item}) => (
                  <CachedImage
                    onPress={() => alert('click')}
                    imageUrl={item.src}
                  />
                )}
                numColumns={2}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  image: {
    height: 120,
    width: 120,
  },
  body: {
    backgroundColor: Colors.white,
  },

  header: {
    fontWeight: '700',
    fontSize: 22,
    margin: 10,
    textAlign: 'center',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
