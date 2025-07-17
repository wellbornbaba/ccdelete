import { carModelGrouped } from "@/constants/carOptions";
import React, { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";

type Props = {
  value?: string;
  onChange: (val: string) => void;
  label?: string;
};

export const GroupedCarModelPicker = ({ value, onChange, label }: Props) => {
  const [visible, setVisible] = useState(false);

  return (
    <View className="w-full mb-4">
      {label && <Text className="text-sm mb-1 text-gray-600">{label}</Text>}

      <Pressable
        className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
        onPress={() => setVisible(true)}
      >
        <Text className="text-base text-black">
          {value || "Select car model"}
        </Text>
      </Pressable>

      <Modal visible={visible} animationType="slide">
        <View className="flex-1 bg-white p-4">
          <Text className="text-lg font-bold mb-4">Select Car Model</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.entries(carModelGrouped).map(([brand, models]) => (
              <View key={brand} className="mb-6">
                <Text className="text-xl font-['Inter-Bold'] text-gray-700 mb-2">
                  {brand}
                </Text>
                <View className="flex-1 w-2/3 gap-2">
                  {models.map((model) => (
                    <Pressable
                      key={model}
                      onPress={() => {
                        onChange(model);
                        setVisible(false);
                      }}
                      className="bg-gray-100 px-3 py-2 rounded-lg ml-6"
                    >
                      <Text className="text-black">{model}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={() => setVisible(false)}
            className="mt-6 bg-red-100 px-4 py-3 rounded-lg"
          >
            <Text className="text-center text-red-600 font-medium">Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};
