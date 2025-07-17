import { View, Text, TouchableOpacity } from 'react-native';
import { TypeOfRide } from '@/types';
import { Card } from './Card';
import { useThemeStore } from '@/store/useThemeStore';
import { FontAwesome } from '@expo/vector-icons';
import { NAIRA } from '@/utils/fetch';
import { formatCurrency } from '@/utils';


const RideCateCard =
 ({
  cate,
  selected,
  setSelected,
}: {
  cate: TypeOfRide;
  selected: string;
  setSelected: () => void;
}) => {
  const colors = useThemeStore((state) => state.colors);

  return (
    <Card
      classStyle="mt-2 p-2"
      style={{
        backgroundColor: selected === cate.name ? colors.primary : 'white',
      }}
      elevation={0}
    >
      <TouchableOpacity
        onPress={() => setSelected()}
        className="flex-row items-start  justify-between py-0 px-1"
      >
        <View className="items-start flex-row flex-1">
          <View
            className="rounded-full bg-slate-100 p-3 justify-center items-center mr-2"
            style={{ backgroundColor: '#cbd5e190' }}
          >
            <FontAwesome
              name="road"
              size={24}
              color={selected === cate.name ? '#ffffff' : colors.primary}
            />
          </View>
          <View className="ml-1">
            <Text
              style={{
                color: selected === cate.name ? '#ffffff' : colors.text,
              }}
              className="text-lg font-semibold capitalize "
            >
              {cate.title}
            </Text>
            <Text
              style={{
                color: selected === cate.name ? '#ffffff97' : colors.text,
              }}
              className="text-xs text-wrap "
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {cate.description}
            </Text>
          </View>
        </View>
        <Text
          style={{ color: selected === cate.name ? '#ffffff' : colors.text }}
          className="text-sm font-bold "
        >
          {NAIRA}
          {formatCurrency(cate.min_amount || 0)}
        </Text>
      </TouchableOpacity>
    </Card>
  );
};

export default RideCateCard;
