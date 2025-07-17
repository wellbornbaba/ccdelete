import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { postAPI, getAPI } from '@/utils/fetch';
import Toast from 'react-native-toast-message';

interface NotificationPreferences {
  push: {
    enabled: boolean;
    trip_updates: boolean;
    payment_updates: boolean;
    chat_messages: boolean;
    kyc_updates: boolean;
    marketing: boolean;
  };
  sms: {
    enabled: boolean;
    trip_updates: boolean;
    payment_updates: boolean;
    security_alerts: boolean;
    emergency_only: boolean;
  };
  email: {
    enabled: boolean;
    trip_summaries: boolean;
    payment_receipts: boolean;
    kyc_updates: boolean;
    newsletters: boolean;
    marketing: boolean;
  };
}

interface NotificationHistory {
  id: string;
  type: 'push' | 'sms' | 'email';
  category: string;
  title: string;
  message: string;
  status: string;
  sentAt: string;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
  failureRate: number;
}

export default function NotificationsScreen() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'preferences' | 'history' | 'stats'>('preferences');
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'preferences') {
        await loadPreferences();
      } else if (activeTab === 'history') {
        await loadHistory();
      } else if (activeTab === 'stats') {
        await loadStats();
      }
    } catch (error) {
      console.error('Load data error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load notification data',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    const response = await getAPI('/api/notifications/preferences');
    if (response.success) {
      setPreferences(response.data);
    }
  };

  const loadHistory = async () => {
    const response = await getAPI('/api/notifications/history?limit=50');
    if (response.success) {
      setHistory(response.data);
    }
  };

  const loadStats = async () => {
    const response = await getAPI('/api/notifications/stats');
    if (response.success) {
      setStats(response.data);
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      const response = await postAPI('/api/notifications/preferences', newPreferences, 'PUT');
      
      if (response.success) {
        setPreferences(newPreferences);
        Toast.show({
          type: 'success',
          text1: 'Preferences updated successfully',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update preferences',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update preferences',
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderTabButton = (tab: 'preferences' | 'history' | 'stats', title: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { borderBottomColor: colors.border },
        activeTab === tab && { borderBottomColor: colors.primary }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? colors.primary : colors.gray} 
      />
      <Text style={[
        styles.tabText,
        { color: activeTab === tab ? colors.primary : colors.gray }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderPreferenceSection = (
    title: string,
    type: 'push' | 'sms' | 'email',
    prefs: any
  ) => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <View style={styles.sectionHeader}>
        <Ionicons 
          name={type === 'push' ? 'notifications' : type === 'sms' ? 'chatbubble' : 'mail'} 
          size={24} 
          color={colors.primary} 
        />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Switch
          value={prefs.enabled}
          onValueChange={(value) => {
            const newPreferences = {
              ...preferences!,
              [type]: { ...prefs, enabled: value }
            };
            updatePreferences(newPreferences);
          }}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={prefs.enabled ? 'white' : colors.gray}
        />
      </View>

      {prefs.enabled && (
        <View style={styles.preferencesList}>
          {Object.entries(prefs).map(([key, value]) => {
            if (key === 'enabled') return null;
            
            const labels: Record<string, string> = {
              trip_updates: 'Trip Updates',
              payment_updates: 'Payment Updates',
              chat_messages: 'Chat Messages',
              kyc_updates: 'KYC Updates',
              marketing: 'Marketing',
              security_alerts: 'Security Alerts',
              emergency_only: 'Emergency Only',
              trip_summaries: 'Trip Summaries',
              payment_receipts: 'Payment Receipts',
              newsletters: 'Newsletters',
            };

            return (
              <View key={key} style={styles.preferenceItem}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  {labels[key] || key}
                </Text>
                <Switch
                  value={value as boolean}
                  onValueChange={(newValue) => {
                    const newPreferences = {
                      ...preferences!,
                      [type]: { ...prefs, [key]: newValue }
                    };
                    updatePreferences(newPreferences);
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={value ? 'white' : colors.gray}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderHistoryItem = (item: NotificationHistory) => (
    <View key={item.id} style={[styles.historyItem, { backgroundColor: colors.card }]}>
      <View style={styles.historyHeader}>
        <View style={styles.historyTypeContainer}>
          <Ionicons 
            name={
              item.type === 'push' ? 'notifications' : 
              item.type === 'sms' ? 'chatbubble' : 'mail'
            } 
            size={16} 
            color={colors.primary} 
          />
          <Text style={[styles.historyType, { color: colors.primary }]}>
            {item.type.toUpperCase()}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={[styles.historyTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.historyMessage, { color: colors.gray }]} numberOfLines={2}>
        {item.message}
      </Text>
      
      <Text style={[styles.historyDate, { color: colors.gray }]}>
        {new Date(item.createdAt).toLocaleDateString()} at 
        {new Date(item.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderStatsCard = (title: string, value: number, subtitle?: string, color?: string) => (
    <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.statsValue, { color: color || colors.primary }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text style={[styles.statsTitle, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statsSubtitle, { color: colors.gray }]}>{subtitle}</Text>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return colors.success;
      case 'failed':
        return colors.error;
      case 'pending':
        return colors.warning;
      default:
        return colors.gray;
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        {renderTabButton('preferences', 'Preferences', 'settings')}
        {renderTabButton('history', 'History', 'time')}
        {renderTabButton('stats', 'Statistics', 'analytics')}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'preferences' && preferences && (
          <View style={styles.preferencesContainer}>
            {renderPreferenceSection('Push Notifications', 'push', preferences.push)}
            {renderPreferenceSection('SMS Notifications', 'sms', preferences.sms)}
            {renderPreferenceSection('Email Notifications', 'email', preferences.email)}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.historyContainer}>
            {history.length > 0 ? (
              history.map(renderHistoryItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off" size={64} color={colors.gray} />
                <Text style={[styles.emptyText, { color: colors.gray }]}>
                  No notification history
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'stats' && stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              {renderStatsCard('Total Sent', stats.total)}
              {renderStatsCard('Delivered', stats.delivered, undefined, colors.success)}
              {renderStatsCard('Failed', stats.failed, undefined, colors.error)}
              {renderStatsCard('Pending', stats.pending, undefined, colors.warning)}
            </View>
            
            <View style={styles.statsGrid}>
              {renderStatsCard('Delivery Rate', stats.deliveryRate, '%', colors.success)}
              {renderStatsCard('Failure Rate', stats.failureRate, '%', colors.error)}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  preferencesContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  preferencesList: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  preferenceLabel: {
    fontSize: 16,
  },
  historyContainer: {
    padding: 16,
    gap: 12,
  },
  historyItem: {
    borderRadius: 12,
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyType: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
  },
  statsContainer: {
    padding: 16,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});