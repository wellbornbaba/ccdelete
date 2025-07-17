import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { postAPI } from '@/utils/fetch';
import { Wordstruncate, ZodChecker } from '@/utils';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardPagesHeader } from '@/components/ui/Header';
import { openURL } from 'expo-linking';


export default function SupportScreen() {
  const { companyDatas, user } = useAuthStore();
  const { colors } = useThemeStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const email = user?.email;
      const msg = `<p>Hello Admin</p> <p><strong>${user?.firstName} ${user?.lastName}</strong>, just contacted you below is the message</p> <p>${message}</p>`;
      // Mock API call
      const contactdata = await postAPI('/api/auth/contact-support', {
        subject,
        msg,
        email,
      });

      if (ZodChecker(contactdata)) {
        return;
      }

      if (contactdata.success) {
        Toast.show({
          type: 'success',
          text1: 'Thanks for contacting us.',
        });
        setSubject('');
        setMessage('');
        setSubmitted(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Oop error occured!, try again',
        });
      }
      // Show success message
    } catch (error) {
      // Show error message
      console.log(`Error: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportChannels = [
    {
      icon: <Feather name="message-circle" size={24} color={colors.primary} />,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Start Chat',
      handlePress: () =>
        openURL(`url:https://api.whatsapp.com/send/?phone=${companyDatas?.phone}&text&type=phone_number&app_absent=0`),
    },
    {
      icon: <Entypo name="mail" size={24} color={colors.primary} />,
      title: 'Email',
      description: companyDatas?.email,
      action: 'Send Email',
      handlePress: () => openURL(`mailto:${companyDatas?.email}`),
    },
    {
      icon: <Feather name="phone-call" size={24} color={colors.primary} />,
      title: 'Phone',
      description: companyDatas?.phone,
      action: 'Call Now',
      handlePress: () => openURL(`tel:${companyDatas?.phone}`),
    },
    {
      icon: <Feather name="help-circle" size={24} color={colors.primary} />,
      title: 'FAQ',
      description: 'Find quick answers',
      action: 'View FAQs',
      handlePress: () => openURL('url:https://corider.com/faq'),
    },
  ];

  return (
    <SafeAreaView
      className="px-4 flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DashboardPagesHeader onBack={true} centerElement={'Support'} />

      <ScrollView
        style={{ backgroundColor: colors.background, flexGrow: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-[28px] font-bold mb-2 font-poppins-bold"
          style={{ color: colors.text }}
        >
          How can we help?
        </Text>
        <Text
          className="text-base mb-6 font-inter"
          style={{ color: colors.text + '80' }}
        >
          Choose a support channel or send us a message
        </Text>

        <View className="flex-row flex-wrap -mx-2 mb-6">
          {supportChannels.map((channel, index) => (
            <Card key={index} classStyle="w-[45%] p-4 m-2 items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                {channel.icon}
              </View>
              <Text
                className="text-base font-semibold mb-1 text-center font-poppins-semibold"
                style={{ color: colors.text }}
              >
                {channel.title}
              </Text>
              <Text
                className="text-sm text-center mb-3 font-inter"
                style={{ color: colors.text + '80' }}
              >
                {Wordstruncate(channel.description || '', 15, '...')}
              </Text>
              <Button
                onPress={channel.handlePress}
                title={channel.action}
                variant="outline"
                size="sm"
                classStyle="w-full"
              />
            </Card>
          ))}
        </View>

        <Text
          className="text-lg font-bold mb-4 font-poppins-bold"
          style={{ color: colors.text }}
        >
          Send us a message
        </Text>
        <Card classStyle="p-4">
          {submitted ? (
            <View className="p-4 bg-green-400 rounded-xl">
              <Text
                style={{ color: colors.text }}
                className="text-md font-semibold font-poppins-semibold"
              >
                Thanks your message was received, we will get back to you
                shortly
              </Text>
            </View>
          ) : (
            <>
              <Input
                label="Subject"
                value={subject}
                onChangeText={setSubject}
                placeholder="What's your question about?"
              />

              <Input
                label="Message"
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message here..."
                multiline
                numberOfLines={4}
              />

              <Button
                title="Send Message"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                classStyle="mt-4"
              />
            </>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
