import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/app/styles /colors';



export const avatarIcons = [
    'account', 'robot', 'dog', 'cat', 'alien', 'ninja', 'emoticon',
    'emoticon-happy', 'emoticon-cool', 'ghost', 'face-man', 'face-woman',
    'account-cowboy-hat', 'account-voice', 'baby', 'penguin', 'owl',
    'unicorn', 'face-mask', 'alien-outline',
  ] as const;
  
  export type AvatarIcon = typeof avatarIcons[number];

type IconSelectorProps = {
  selectedIcon: AvatarIcon;
  onSelect: (icon: AvatarIcon) => void;
};

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelect }) => {
  return (
    <View style={{ marginVertical: 10 }}>
  <FlatList
    horizontal
    data={avatarIcons}
    keyExtractor={(item) => item}
    showsHorizontalScrollIndicator={false}
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => onSelect(item)}
        style={{
          padding: 10,
          borderRadius: 10,
          backgroundColor: selectedIcon === item ? '#ddd' : 'transparent',
          marginRight: 8,
        }}
      >
        <MaterialCommunityIcons name={item} size={36} color={Colors.accent} />
      </TouchableOpacity>
    )}
    contentContainerStyle={{ paddingVertical: 10 }}
  />
</View>
  );
};


