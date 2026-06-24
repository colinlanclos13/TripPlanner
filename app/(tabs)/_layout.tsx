import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '../styles /colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import CheckForLoginComp from '@/components/checkForLoginComp';
import { Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <CheckForLoginComp>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.accent,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={Colors.accent} />,
          }}
        />
        <Tabs.Screen
          name="createtrip"
          options={{
            title: 'CreateTrip',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={Colors.accent} />,
          }}
        />
        <Tabs.Screen name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={Colors.accent} />,
          }}/>

          <Tabs.Screen name='trippage'
          options={{
            tabBarItemStyle: {display: 'none'}
          }} />
      </Tabs>
    </CheckForLoginComp>
  );
}
