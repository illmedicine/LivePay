import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Linking, Platform, Pressable } from 'react-native';

export function ExternalLink(
  props: { href: string } & React.ComponentProps<typeof Pressable>
) {
  const { children, style, ...rest } = props;

  return (
    <Pressable
      style={style}
      {...rest}
      onPress={(e) => {
        if (Platform.OS === 'web') {
          (rest.onPress as any)?.(e);
          Linking.openURL(props.href);
          return;
        }
        e.preventDefault();
        (rest.onPress as any)?.(e);
        WebBrowser.openBrowserAsync(props.href as string);
      }}>
      {children}
    </Pressable>
  );
}
