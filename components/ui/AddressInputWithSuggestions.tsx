import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Keyboard,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import debounce from 'lodash.debounce';
import { Input } from './Input';
import { LocationProps } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchAddressLngLat } from '@/utils/auth';

type Props = {
  title?: string;
  labelElement?: ReactElement;
  value: string;
  placeholder: string;
  handleInputChange: (text: string) => void;
  onSelect: (selected: LocationProps) => void;
  icon?: ReactElement;
  debounceDelay?: number;
};

export const AddressInputWithSuggestions = ({
  title,
  labelElement,
  value,
  placeholder,
  handleInputChange,
  onSelect,
  icon,
  debounceDelay = 500,
}: Props) => {
  const companyDatas = useAuthStore((state) => state.companyDatas);
  const [suggestions, setSuggestions] = useState<LocationProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const flatListRef = useRef<FlatList>(null);

  const GEOAPI_KEY =
    companyDatas?.geoapi_key || '0d2310b2c69149c3a4b1be11fcb0c2b6';

  const debouncedFetchRef = useRef<((text: string) => void) | null>(null);

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (text.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const result = await fetchAddressLngLat(text, GEOAPI_KEY);
        setSuggestions(result);
        setActiveIndex(-1);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      } finally {
        setLoading(false);
      }
    },
    [GEOAPI_KEY],
  );

  useEffect(() => {
    const debounced = debounce(fetchSuggestions, debounceDelay);
    debouncedFetchRef.current = debounced;

    return () => {
      debounced.cancel();
    };
  }, [fetchSuggestions, debounceDelay]);

  useEffect(() => {
    if (focused && value.length >= 3 && debouncedFetchRef.current) {
      debouncedFetchRef.current(value);
    } else {
      setSuggestions([]);
    }
  }, [value, focused]);

  const handleSelect = (item: LocationProps) => {
    onSelect(item);
    setSuggestions([]);
    setFocused(false);
    setActiveIndex(-1);
    Keyboard.dismiss();
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (!focused || suggestions.length === 0) return;

    if (e.nativeEvent.key === 'ArrowDown') {
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    }

    if (e.nativeEvent.key === 'ArrowUp') {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    }

    if (e.nativeEvent.key === 'Enter' && activeIndex >= 0) {
      handleSelect(suggestions[activeIndex]);
    }
  };

  useEffect(() => {
    if (flatListRef.current && activeIndex >= 0) {
      flatListRef.current.scrollToIndex({ index: activeIndex, animated: true });
    }
  }, [activeIndex]);

  return (
    <View className="relative">
      <Input
        label={title}
        labelElement={labelElement}
        placeholder={placeholder}
        value={value}
        onChangeText={handleInputChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        classStyle="text-sm"
        icon={icon}
        // @ts-ignore
        onKeyPress={handleKeyPress}
      />

      {loading && (
        <View className="absolute right-2 top-4">
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}

      {focused && (
        <View className="z-50 w-full bg-white rounded-lg border border-gray-200 mt-2 shadow-md max-h-60">
          {suggestions.length > 0
            ? suggestions.map((item, _index) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className={`px-4 py-3 border-b border-gray-100 ${
                    _index === activeIndex ? 'bg-gray-100' : ''
                  }`}
                  key={_index}
                >
                  <Text className="text-gray-800 text-sm">{item.address}</Text>
                </TouchableOpacity>
              ))
            : // <FlatList
              //   ref={flatListRef}
              //   data={suggestions}
              //   keyExtractor={(_, i) => i.toString()}
              //   renderItem={({ item, index }) => (
              //     <TouchableOpacity
              //       onPress={() => handleSelect(item)}
              //       className={`px-4 py-3 border-b border-gray-100 ${
              //         index === activeIndex ? 'bg-gray-100' : ''
              //       }`}
              //     >
              //       <Text className="text-gray-800 text-sm">{item.address}</Text>
              //     </TouchableOpacity>
              //   )}
              //   keyboardShouldPersistTaps="handled"
              // />
              !loading &&
              value.length >= 3 && (
                <View className="px-4 py-3">
                  <Text className="text-sm text-gray-500 italic">
                    No results found
                  </Text>
                </View>
              )}
        </View>
      )}
    </View>
  );
};
