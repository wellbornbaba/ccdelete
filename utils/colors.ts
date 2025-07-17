import { Colors, Gradients } from '@/types';

const textGrayColor = '#6B7280'; //9ca3af
const bgPrimarColor = '#076572';
const lightPrimaryColor = "#0f766e"

const lightColors: Colors = {
  primary: bgPrimarColor,
  secondary: '#027F8B',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#6B7280',
  gray: '#9ca3af',
  border: '#E5E7EB',
  notification: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#16A34A',
  default: bgPrimarColor,
};

const darkColors: Colors = {
  primary: bgPrimarColor,
  secondary: '#027F8B',
  background: '#111827',
  card: '#C6FFF6',
  text: '#F9FAFB',
  gray: '#9ca3af',
  border: '#E5E7EB',
  notification: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#16A34A70',
  default: bgPrimarColor,
};

const statusColor = {
  initiated: lightColors ? lightColors.info : darkColors.info,
  waiting: lightColors ? lightColors.warning : darkColors.warning,
  scheduled: lightColors ? lightColors.primary : darkColors.primary,
  active: lightColors ? lightColors.success : darkColors.success,
  inprogress: lightColors ? lightColors.info : darkColors.info,
  completed: lightColors ? lightColors.success : darkColors.success,
  cancelled: lightColors ? lightColors.error : darkColors.error,
  boarded: lightColors ? lightColors.info : darkColors.info,
  arrived: lightColors ? lightColors.secondary : darkColors.secondary,
};

const paymentStatusColor = {
  pending: lightColors ? lightColors.warning : darkColors.warning,
  completed: lightColors ? lightColors.success : darkColors.success,
  failed: lightColors ? lightColors.error : darkColors.error,
  refunded: lightColors ? lightColors.error : darkColors.error,
};
const lightGradients: Gradients = {
  primary: [lightColors.primary, lightColors.secondary],
  secondary: [lightColors.secondary, lightColors.card],
  card: [lightColors.card, '#F9FAFB'],
};

const darkGradients: Gradients = {
  primary: ['#3B82F6', '#2563EB'],
  secondary: ['#6366F1', '#4F46E5'],
  card: ['#1F2937', '#111827'],
};

export {
  lightColors,
  darkColors,
  lightGradients,
  darkGradients,
  textGrayColor,
  bgPrimarColor,
  statusColor,
  paymentStatusColor,
  lightPrimaryColor,
};
