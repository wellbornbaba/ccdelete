import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '@/store/useThemeStore';
import tw from "twrnc"


interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  classStyle?: string;
  gradient?: boolean;
  gradientColors?: string[];
  elevation?: number;
}

export function Card({
  children,
  style,
  classStyle,
  gradient = false,
  gradientColors,
  elevation = 1,
}: CardProps) {
  const { colors, gradients } = useThemeStore();
  
  // Calculate shadow based on elevation
  const getShadow = () => {
    const shadow = {
      // shadowColor: '#000',
      // shadowOffset: { width: 0, height: 0 },
      // shadowOpacity: 0,
      // shadowRadius: 0,
      elevation: 0,
    };
    
    if (elevation === 0) return shadow;
    
    return {
      // shadowColor: '#000',
      // shadowOffset: {
      //   width: 0,
      //   height: elevation === 1 ? 1 : elevation * 1.5,
      // },
      // shadowOpacity: elevation * 0.05 + 0.05,
      // shadowRadius: elevation * 1.5,
      elevation: elevation * 2,
    };
  };
  
  const shadowStyle = getShadow();
  
  if (gradient) {
    const colors = (gradientColors || gradients.card) as [string, string, ...string[]];
    
    return (
      <View style={[styles.cardWrapper, shadowStyle, style]} className={`${classStyle}`}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientCard}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }
  
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        shadowStyle,
        style,
      ]}

      className={classStyle}
    >
      {children}
    </View>
  );
}


// export const CardContent = React.forwardRef<
//   HTMLDivElement,
//   React.HTMLAttributes<HTMLDivElement>
// >(({ className, ...props }, ref) => (
//   <View ref={ref} className={tw("p-6 pt-0", classStyle)} {...props} />
// ));
// CardContent.displayName = "CardContent";



const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
  },
  gradientCard: {
    padding: 16,
    borderRadius: 16,
  },
});