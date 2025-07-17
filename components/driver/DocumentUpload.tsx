import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useThemeStore } from '@/store/useThemeStore';

interface UploadedFile {
  uri: string;
  type: string;
  name: string;
  size: number;
}

interface Documents {
  driversLicenseFront: UploadedFile | null;
  driversLicenseBack: UploadedFile | null;
  vehicleRegistration: UploadedFile | null;
  insuranceDocument: UploadedFile | null;
  inspectionReport: UploadedFile | null;
}

interface DocumentUploadProps {
  documents: Documents;
  onDocumentsChange: (documents: Documents) => void;
}

const documentTypes = [
  {
    key: 'driversLicenseFront' as keyof Documents,
    title: "Driver's License (Front)",
    description: "Clear scan of the front of your driver's license",
    required: true,
    icon: 'card' as const,
  },
  {
    key: 'driversLicenseBack' as keyof Documents,
    title: "Driver's License (Back)",
    description: "Clear scan of the back of your driver's license",
    required: true,
    icon: 'card' as const,
  },
  {
    key: 'vehicleRegistration' as keyof Documents,
    title: 'Vehicle Registration',
    description: 'Official vehicle registration certificate',
    required: true,
    icon: 'document-text' as const,
  },
  {
    key: 'insuranceDocument' as keyof Documents,
    title: 'Insurance Documentation',
    description: 'Current vehicle insurance policy document',
    required: true,
    icon: 'shield-checkmark' as const,
  },
  {
    key: 'inspectionReport' as keyof Documents,
    title: 'Vehicle Inspection Report',
    description: 'Recent vehicle inspection report (if applicable)',
    required: false,
    icon: 'clipboard' as const,
  },
];

export function DocumentUpload({
  documents,
  onDocumentsChange,
}: DocumentUploadProps) {
  const { colors } = useThemeStore();
  const [uploading, setUploading] = useState<string | null>(null);

  const pickDocument = async (documentKey: keyof Documents) => {
    setUploading(documentKey);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size (max 10MB)
        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert(
            'File Too Large',
            'Please select a file smaller than 10MB',
          );
          return;
        }

        const file: UploadedFile = {
          uri: asset.uri,
          type: asset.mimeType || 'application/pdf',
          name: asset.name,
          size: asset.size || 0,
        };

        onDocumentsChange({
          ...documents,
          [documentKey]: file,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document');
    } finally {
      setUploading(null);
    }
  };

  const removeDocument = (documentKey: keyof Documents) => {
    onDocumentsChange({
      ...documents,
      [documentKey]: null,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderDocumentItem = ({
    item,
  }: {
    item: (typeof documentTypes)[0];
  }) => {
    const document = documents[item.key];
    const isUploading = uploading === item.key;

    return (
      <View style={styles.documentItem}>
        <View style={styles.documentHeader}>
          <View style={styles.documentTitleContainer}>
            <Ionicons
              name={item.icon}
              size={20}
              color={document ? colors.success : colors.gray}
            />
            <Text style={[styles.documentTitle, { color: colors.text }]}>
              {item.title}
              {item.required && <Text style={styles.required}> *</Text>}
            </Text>
          </View>
          {document && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.success}
            />
          )}
        </View>

        <Text style={[styles.documentDescription, { color: colors.gray }]}>
          {item.description}
        </Text>

        {document ? (
          <View
            style={[
              styles.documentPreview,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.documentInfo}>
              <Ionicons
                name={document.type.includes('pdf') ? 'document' : 'image'}
                size={24}
                color={colors.primary}
              />
              <View style={styles.documentDetails}>
                <Text
                  style={[styles.documentName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {document.name}
                </Text>
                <Text style={[styles.documentSize, { color: colors.gray }]}>
                  {formatFileSize(document.size)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeDocumentButton}
              onPress={() => removeDocument(item.key)}
            >
              <Ionicons name="trash" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.uploadButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => pickDocument(item.key)}
            disabled={isUploading}
          >
            {isUploading ? (
              <View style={styles.uploadingContainer}>
                <Ionicons name="cloud-upload" size={20} color={colors.gray} />
                <Text style={[styles.uploadingText, { color: colors.gray }]}>
                  Uploading...
                </Text>
              </View>
            ) : (
              <View style={styles.uploadContainer}>
                <Ionicons
                  name="cloud-upload"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.uploadText, { color: colors.primary }]}>
                  Upload Document
                </Text>
                <Text style={[styles.uploadSubtext, { color: colors.gray }]}>
                  PDF, JPG or PNG, max 10MB
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Required Documents
      </Text>
      <Text style={[styles.sectionDescription, { color: colors.gray }]}>
        Upload clear, legible scans of all required documents. All documents
        must be current and valid.
      </Text>

      <FlatList
        data={documentTypes}
        renderItem={renderDocumentItem}
        keyExtractor={(item) => item.key}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  documentItem: {
    marginBottom: 20,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  documentTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    color: '#ef4444',
  },
  documentDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 18,
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  documentSize: {
    fontSize: 12,
    marginTop: 2,
  },
  removeDocumentButton: {
    padding: 8,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  uploadContainer: {
    alignItems: 'center',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  uploadingText: {
    fontSize: 14,
  },
});
