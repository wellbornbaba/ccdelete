import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressIndicator } from '@/components/driver/ProgressIndicator';
import { VehiclePhotoUpload } from '@/components/driver/VehiclePhotoUpload';
import { DocumentUpload } from '@/components/driver/DocumentUpload';
import { postAPI } from '@/utils/fetch';

// Validation schema
const vehicleRegistrationSchema = z.object({
  // Vehicle Information
  make: z.string().min(1, 'Vehicle make is required'),
  model: z.string().min(1, 'Vehicle model is required'),
  year: z.string().min(4, 'Year must be 4 digits').max(4, 'Year must be 4 digits'),
  plateNumber: z.string().min(1, 'Plate number is required'),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17, 'VIN must be 17 characters'),
  chasisNumber: z.string().min(1, 'Chassis number is required'),
  exteriorColor: z.string().min(1, 'Exterior color is required'),
  interiorColor: z.string().min(1, 'Interior color is required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  numberOfSeats: z.string().min(1, 'Number of seats is required'),
  mileage: z.string().min(1, 'Mileage is required'),
  insurancePolicyNumber: z.string().min(1, 'Insurance policy number is required'),
  ownerFullName: z.string().min(1, 'Owner full name is required'),
  isRegistered: z.boolean(),
});

type VehicleRegistrationData = z.infer<typeof vehicleRegistrationSchema>;

interface UploadedFile {
  uri: string;
  type: string;
  name: string;
  size: number;
}

interface VehiclePhotos {
  frontView: UploadedFile | null;
  rearView: UploadedFile | null;
}

interface Documents {
  driversLicenseFront: UploadedFile | null;
  driversLicenseBack: UploadedFile | null;
  vehicleRegistration: UploadedFile | null;
  insuranceDocument: UploadedFile | null;
  inspectionReport: UploadedFile | null;
}

const vehicleTypes = [
  'Sedan',
  'SUV',
  'Hatchback',
  'Coupe',
  'Convertible',
  'Wagon',
  'Pickup Truck',
  'Van',
  'Minivan',
  'Other',
];

const seatOptions = ['2', '4', '5', '6', '7', '8', '9+'];

export function VehicleRegistrationForm() {
  const { colors } = useThemeStore();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehiclePhotos, setVehiclePhotos] = useState<VehiclePhotos>({
    frontView: null,
    rearView: null,
  });
  const [documents, setDocuments] = useState<Documents>({
    driversLicenseFront: null,
    driversLicenseBack: null,
    vehicleRegistration: null,
    insuranceDocument: null,
    inspectionReport: null,
  });

  const totalSteps = 4;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
  } = useForm<VehicleRegistrationData>({
    resolver: zodResolver(vehicleRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      isRegistered: true,
    },
  });

  const watchedFields = watch();

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof VehicleRegistrationData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['make', 'model', 'year', 'plateNumber', 'vin'];
        break;
      case 2:
        fieldsToValidate = [
          'chasisNumber',
          'exteriorColor',
          'interiorColor',
          'vehicleType',
          'numberOfSeats',
          'mileage',
        ];
        break;
      case 3:
        fieldsToValidate = ['insurancePolicyNumber', 'ownerFullName'];
        break;
      case 4:
        // Validate file uploads
        return validateFileUploads();
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const validateFileUploads = () => {
    // Check required vehicle photos
    if (!vehiclePhotos.frontView) {
      Toast.show({
        type: 'error',
        text1: 'Front view photo is required',
      });
      return false;
    }

    if (!vehiclePhotos.rearView) {
      Toast.show({
        type: 'error',
        text1: 'Rear view photo is required',
      });
      return false;
    }

    // Check required documents
    if (!documents.driversLicenseFront) {
      Toast.show({
        type: 'error',
        text1: 'Driver\'s license front is required',
      });
      return false;
    }

    if (!documents.driversLicenseBack) {
      Toast.show({
        type: 'error',
        text1: 'Driver\'s license back is required',
      });
      return false;
    }

    if (!documents.vehicleRegistration) {
      Toast.show({
        type: 'error',
        text1: 'Vehicle registration document is required',
      });
      return false;
    }

    if (!documents.insuranceDocument) {
      Toast.show({
        type: 'error',
        text1: 'Insurance document is required',
      });
      return false;
    }

    return true;
  };

  const nextStep = async () => {
    const isStepValid = await validateCurrentStep();
    if (isStepValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: VehicleRegistrationData) => {
    if (!validateFileUploads()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for submission
      const formData = new FormData();

      // Add vehicle data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Add user ID
      formData.append('userId', user?.id || '');

      // Add vehicle photos
      if (vehiclePhotos.frontView) {
        formData.append('vehicleFrontPhoto', {
          uri: vehiclePhotos.frontView.uri,
          type: vehiclePhotos.frontView.type,
          name: vehiclePhotos.frontView.name,
        } as any);
      }

      if (vehiclePhotos.rearView) {
        formData.append('vehicleRearPhoto', {
          uri: vehiclePhotos.rearView.uri,
          type: vehiclePhotos.rearView.type,
          name: vehiclePhotos.rearView.name,
        } as any);
      }

      // Add documents
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, {
            uri: file.uri,
            type: file.type,
            name: file.name,
          } as any);
        }
      });

      const response = await postAPI('/api/vehicle-registration', formData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Vehicle Registration Submitted',
          text2: 'Your application is being reviewed',
        });

        // Navigate to success page or back to profile
        router.replace('/(root)/profile');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Submission Failed',
          text2: response.message || 'Please try again',
        });
      }
    } catch (error) {
      console.error('Vehicle registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: 'Please check your connection and try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return !!(
          watchedFields.make &&
          watchedFields.model &&
          watchedFields.year &&
          watchedFields.plateNumber &&
          watchedFields.vin
        );
      case 2:
        return !!(
          watchedFields.chasisNumber &&
          watchedFields.exteriorColor &&
          watchedFields.interiorColor &&
          watchedFields.vehicleType &&
          watchedFields.numberOfSeats &&
          watchedFields.mileage
        );
      case 3:
        return !!(
          watchedFields.insurancePolicyNumber &&
          watchedFields.ownerFullName
        );
      case 4:
        return !!(
          vehiclePhotos.frontView &&
          vehiclePhotos.rearView &&
          documents.driversLicenseFront &&
          documents.driversLicenseBack &&
          documents.vehicleRegistration &&
          documents.insuranceDocument
        );
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Basic Vehicle Information
            </Text>
            <Text style={[styles.stepDescription, { color: colors.gray }]}>
              Enter your vehicle's basic details
            </Text>

            <Controller
              control={control}
              name="make"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Vehicle Make"
                  placeholder="e.g., Toyota, Honda, Ford"
                  value={value}
                  onChangeText={onChange}
                  error={errors.make?.message}
                  icon="car"
                />
              )}
            />

            <Controller
              control={control}
              name="model"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Vehicle Model"
                  placeholder="e.g., Camry, Civic, Focus"
                  value={value}
                  onChangeText={onChange}
                  error={errors.model?.message}
                  icon="car-sport"
                />
              )}
            />

            <Controller
              control={control}
              name="year"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Year of Manufacture"
                  placeholder="e.g., 2020"
                  value={value}
                  onChangeText={onChange}
                  error={errors.year?.message}
                  keyboardType="numeric"
                  maxLength={4}
                  icon="calendar"
                />
              )}
            />

            <Controller
              control={control}
              name="plateNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="License Plate Number"
                  placeholder="e.g., ABC-123"
                  value={value}
                  onChangeText={onChange}
                  error={errors.plateNumber?.message}
                  autoCapitalize="characters"
                  icon="card"
                />
              )}
            />

            <Controller
              control={control}
              name="vin"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="VIN (Vehicle Identification Number)"
                  placeholder="17-character VIN"
                  value={value}
                  onChangeText={onChange}
                  error={errors.vin?.message}
                  autoCapitalize="characters"
                  maxLength={17}
                  icon="barcode"
                />
              )}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Vehicle Details
            </Text>
            <Text style={[styles.stepDescription, { color: colors.gray }]}>
              Additional vehicle specifications
            </Text>

            <Controller
              control={control}
              name="chasisNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Chassis Number"
                  placeholder="Enter chassis number"
                  value={value}
                  onChangeText={onChange}
                  error={errors.chasisNumber?.message}
                  autoCapitalize="characters"
                  icon="construct"
                />
              )}
            />

            <Controller
              control={control}
              name="exteriorColor"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Exterior Color"
                  placeholder="e.g., White, Black, Silver"
                  value={value}
                  onChangeText={onChange}
                  error={errors.exteriorColor?.message}
                  icon="color-palette"
                />
              )}
            />

            <Controller
              control={control}
              name="interiorColor"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Interior Color"
                  placeholder="e.g., Black, Beige, Gray"
                  value={value}
                  onChangeText={onChange}
                  error={errors.interiorColor?.message}
                  icon="color-fill"
                />
              )}
            />

            <Controller
              control={control}
              name="vehicleType"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Vehicle Type
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.typeSelector}
                  >
                    {vehicleTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeOption,
                          {
                            backgroundColor:
                              value === type ? colors.primary : colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => onChange(type)}
                      >
                        <Text
                          style={[
                            styles.typeText,
                            {
                              color: value === type ? 'white' : colors.text,
                            },
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {errors.vehicleType && (
                    <Text style={styles.errorText}>
                      {errors.vehicleType.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="numberOfSeats"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Number of Seats
                  </Text>
                  <View style={styles.seatSelector}>
                    {seatOptions.map((seats) => (
                      <TouchableOpacity
                        key={seats}
                        style={[
                          styles.seatOption,
                          {
                            backgroundColor:
                              value === seats ? colors.primary : colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => onChange(seats)}
                      >
                        <Text
                          style={[
                            styles.seatText,
                            {
                              color: value === seats ? 'white' : colors.text,
                            },
                          ]}
                        >
                          {seats}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.numberOfSeats && (
                    <Text style={styles.errorText}>
                      {errors.numberOfSeats.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="mileage"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Current Mileage"
                  placeholder="e.g., 50000"
                  value={value}
                  onChangeText={onChange}
                  error={errors.mileage?.message}
                  keyboardType="numeric"
                  icon="speedometer"
                />
              )}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Insurance & Ownership
            </Text>
            <Text style={[styles.stepDescription, { color: colors.gray }]}>
              Insurance and ownership information
            </Text>

            <Controller
              control={control}
              name="insurancePolicyNumber"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Insurance Policy Number"
                  placeholder="Enter policy number"
                  value={value}
                  onChangeText={onChange}
                  error={errors.insurancePolicyNumber?.message}
                  icon="shield-checkmark"
                />
              )}
            />

            <Controller
              control={control}
              name="ownerFullName"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Owner Full Name"
                  placeholder="Full name as on registration"
                  value={value}
                  onChangeText={onChange}
                  error={errors.ownerFullName?.message}
                  icon="person"
                />
              )}
            />

            <Controller
              control={control}
              name="isRegistered"
              render={({ field: { onChange, value } }) => (
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => onChange(!value)}
                  >
                    <Ionicons
                      name={value ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={value ? colors.primary : colors.gray}
                    />
                    <Text style={[styles.checkboxText, { color: colors.text }]}>
                      Vehicle is currently registered
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Photos & Documents
            </Text>
            <Text style={[styles.stepDescription, { color: colors.gray }]}>
              Upload required photos and documents
            </Text>

            <VehiclePhotoUpload
              photos={vehiclePhotos}
              onPhotosChange={setVehiclePhotos}
            />

            <DocumentUpload
              documents={documents}
              onDocumentsChange={setDocuments}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Vehicle Registration
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabels={['Basic Info', 'Details', 'Insurance', 'Documents']}
        completedSteps={Array.from({ length: totalSteps }, (_, i) =>
          isStepComplete(i + 1)
        )}
      />

      {/* Form Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          {renderStepContent()}
        </Card>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={[styles.navigationContainer, { backgroundColor: colors.card }]}>
        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <Button
              title="Previous"
              onPress={prevStep}
              variant="outline"
              style={styles.navButton}
            />
          )}
          
          {currentStep < totalSteps ? (
            <Button
              title="Next"
              onPress={nextStep}
              disabled={!isStepComplete(currentStep)}
              style={[
                styles.navButton,
                currentStep === 1 && styles.fullWidthButton,
              ]}
            />
          ) : (
            <Button
              title={isSubmitting ? 'Submitting...' : 'Submit Application'}
              onPress={handleSubmit(onSubmit)}
              disabled={!isStepComplete(currentStep) || isSubmitting}
              isLoading={isSubmitting}
              style={styles.navButton}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: 16,
    padding: 20,
  },
  stepContent: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeSelector: {
    marginTop: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  seatSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  seatOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  seatText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxContainer: {
    marginTop: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxText: {
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  navigationContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
});