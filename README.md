# react-native-fast-cached-images

[![N|Solid](https://cldup.com/dTxpPi9lDf.thumb.png)](https://nodesource.com/products/nsolid)

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

A simple yet powerful image caching component with offline image support built for react native

# Features

TODO

# Table of Content

TODO

# About

# Installation

Install package from npm

`yarn add react-native-fast-cached-images`

then

`yarn add rn-fetch-blob`

#### Manually Link Native Modules

If automatically linking doesn't work for you, see instructions on manually linking.

#### Automatically Link Native Modules

For 0.29.2+ projects, simply link native packages via the following command (note: rnpm has been merged into react-native)

`react-native link`

As for projects < 0.29 you need rnpm to link native packages

`rnpm link`

Optionally, use the following command to add Android permissions to AndroidManifest.xml automatically

`RNFB_ANDROID_PERMISSIONS=true react-native link`

pre 0.29 projects

`RNFB_ANDROID_PERMISSIONS=true rnpm link`

The link script might not take effect if you have non-default project structure, please visit the wiki to link the package manually.

#### Grant Permission to External storage for Android 5.0 or lower

The mechanism for granting Android permissions has slightly different since Android 6.0 released, please refer to Official Document.

If you're going to access external storage (say, SD card storage) for Android 5.0 (or lower) devices, you might have to add the following line to AndroidManifest.xml.

      `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
            package="com.rnfetchblobtest"
            android:versionCode="1"
            android:versionName="1.0">
         <uses-permission android:name="android.permission.INTERNET" />
         <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
     +   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
     +   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
     +   <uses-permission android:name="android.permission.DOWNLOAD_WITHOUT_NOTIFICATION" />
     `

Also, if you're going to use Android Download Manager you have to add this to AndroidManifest.xml

     `<intent-filter>
              <action android:name="android.intent.action.MAIN" />
              <category android:name="android.intent.category.LAUNCHER" />
         +    <action android:name="android.intent.action.DOWNLOAD_COMPLETE"/>
      </intent-filter>
     `

#### Grant Access Permission for Android 6.0

Beginning in Android 6.0 (API level 23), users grant permissions to apps while the app is running, not when they install the app. So adding permissions in AndroidManifest.xml won't work for Android 6.0+ devices. To grant permissions in runtime, you might use PermissionAndroid API.

#### Manually Granting Access Permission

If you don't receive permission update the app permissions from app settings in the mobile
