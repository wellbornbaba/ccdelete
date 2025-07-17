import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import React, { useState } from 'react';
import { bgPrimarColor } from '@/utils/colors';
import { Button } from './Button';

export default function DriverCarCard({
  pic,
  title,
  type = 'front',
}: {
  title?: string;
  pic: string;
  type: 'front' | 'back';
}) {
  const [previewLargeImage, setPreviewLargeImage] = useState('');
  return (
    <View className="flex-1">
      <TouchableOpacity
        onPress={() => setPreviewLargeImage(pic)}
        className="p-0 items-center justify-center "
      >
        {title && (
          <Text className="text-sm text-gray-400 font-thin">{title}</Text>
        )}

        <Image
          source={
            pic
              ? { uri: pic }
              : type === 'front'
                ? require('@/assets/images/car-front.png')
                : require('@/assets/images/car-back.png')
          }
          resizeMode="contain"
          style={{
            width: 145,
            height: 135,
            borderRadius: 14,
          }}
        />
      </TouchableOpacity>
      <Modal
        visible={previewLargeImage ? true : false}
        transparent={true}
        onRequestClose={() => setPreviewLargeImage('')}
      >
        <View className="flex-1 bg-white/75 justify-center items-center">
          <Image
            source={{ uri: previewLargeImage }}
            style={{
              width: '100%',
              height: '80%',
            }}
            resizeMode="contain"
          />

          <Button
            title="Close"
            onPress={() => setPreviewLargeImage('')}
            style={{
              backgroundColor: bgPrimarColor,
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
