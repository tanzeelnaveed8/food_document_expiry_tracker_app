import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../api/client';
import { ItemsStackParamList } from '../../navigation/RootNavigator';

// Conditionally import native-only components
let DateTimePicker: any = null;
let Picker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
  Picker = require('@react-native-picker/picker').Picker;
}

type NavigationProp = NativeStackNavigationProp<ItemsStackParamList, 'AddItem'>;

// Web-compatible Picker component
const WebCompatiblePicker = ({ selectedValue, onValueChange, enabled, items }: any) => {
  if (Platform.OS === 'web') {
    return (
      <select
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={!enabled}
        style={{
          width: '100%',
          height: 50,
          fontSize: 16,
          padding: '0 10px',
          border: 'none',
          backgroundColor: 'transparent',
        }}
      >
        {items.map((item: any) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Picker
      selectedValue={selectedValue}
      onValueChange={onValueChange}
      enabled={enabled}
      style={{ height: 50 }}
    >
      {items.map((item: any) => (
        <Picker.Item key={item.value} label={item.label} value={item.value} />
      ))}
    </Picker>
  );
};

// Web-compatible DatePicker component
const WebCompatibleDatePicker = ({ value, onChange, minimumDate }: any) => {
  if (Platform.OS === 'web') {
    const formatDateForInput = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return (
      <input
        type="date"
        value={formatDateForInput(value)}
        onChange={(e) => {
          const newDate = new Date(e.target.value);
          if (!isNaN(newDate.getTime())) {
            onChange(null, newDate);
          }
        }}
        min={minimumDate ? formatDateForInput(minimumDate) : undefined}
        style={{
          width: '100%',
          height: 50,
          fontSize: 16,
          padding: '0 15px',
          border: '1px solid #ddd',
          borderRadius: 8,
          backgroundColor: '#fff',
        }}
      />
    );
  }

  return null; // Native DateTimePicker is handled separately
};

const FOOD_CATEGORIES = [
  { label: 'Select Category', value: '' },
  { label: 'Dairy', value: 'DAIRY' },
  { label: 'Meat', value: 'MEAT' },
  { label: 'Seafood', value: 'SEAFOOD' },
  { label: 'Vegetables', value: 'VEGETABLES' },
  { label: 'Fruits', value: 'FRUITS' },
  { label: 'Grains', value: 'GRAINS' },
  { label: 'Beverages', value: 'BEVERAGES' },
  { label: 'Condiments', value: 'CONDIMENTS' },
  { label: 'Frozen', value: 'FROZEN' },
  { label: 'Other', value: 'OTHER' },
];

const STORAGE_TYPES = [
  { label: 'Select Storage', value: '' },
  { label: 'Refrigerator', value: 'REFRIGERATOR' },
  { label: 'Freezer', value: 'FREEZER' },
  { label: 'Pantry', value: 'PANTRY' },
  { label: 'Counter', value: 'COUNTER' },
];

const DOCUMENT_TYPES = [
  { label: 'Select Type', value: '' },
  { label: 'Passport', value: 'PASSPORT' },
  { label: 'Visa', value: 'VISA' },
  { label: 'Driver\'s License', value: 'DRIVERS_LICENSE' },
  { label: 'ID Card', value: 'ID_CARD' },
  { label: 'Insurance Policy', value: 'INSURANCE_POLICY' },
  { label: 'Membership', value: 'MEMBERSHIP' },
  { label: 'Custom', value: 'CUSTOM' },
];

const AddItemScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // Form state
  const [itemType, setItemType] = useState<'FOOD' | 'DOCUMENT'>('FOOD');
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Food-specific fields
  const [category, setCategory] = useState('');
  const [storageType, setStorageType] = useState('');
  const [quantity, setQuantity] = useState('');

  // Document-specific fields
  const [documentType, setDocumentType] = useState('');
  const [customType, setCustomType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issuedDate, setIssuedDate] = useState<Date | null>(null);
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);

  // Common fields
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return false;
    }

    if (itemType === 'FOOD') {
      if (!category) {
        Alert.alert('Error', 'Please select a category');
        return false;
      }
      if (!storageType) {
        Alert.alert('Error', 'Please select storage type');
        return false;
      }
    } else {
      if (!documentType) {
        Alert.alert('Error', 'Please select document type');
        return false;
      }
      if (documentType === 'CUSTOM' && !customType.trim()) {
        Alert.alert('Error', 'Please enter custom document type');
        return false;
      }
    }

    return true;
  };

  const handlePhotoSelect = async () => {
    // On web, only show library option
    if (Platform.OS === 'web') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0]);
      }
      return;
    }

    // On native, show both camera and library options
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Camera permission is required to take photos');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
              aspect: [4, 3],
            });

            if (!result.canceled && result.assets[0]) {
              setPhoto(result.assets[0]);
            }
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Media library permission is required to select photos');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
              aspect: [4, 3],
            });

            if (!result.canceled && result.assets[0]) {
              setPhoto(result.assets[0]);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let createdItem;

      if (itemType === 'FOOD') {
        createdItem = await api.createFoodItem({
          name: name.trim(),
          category,
          storageType,
          expiryDate: expiryDate.toISOString(),
          quantity: quantity.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        createdItem = await api.createDocument({
          name: name.trim(),
          type: documentType,
          customType: documentType === 'CUSTOM' ? customType.trim() : undefined,
          expiryDate: expiryDate.toISOString(),
          documentNumber: documentNumber.trim() || undefined,
          issuedDate: issuedDate?.toISOString() || undefined,
          notes: notes.trim() || undefined,
        });
      }

      // Upload photo if selected
      if (photo && createdItem.id) {
        try {
          await api.uploadPhoto(createdItem.id, itemType, photo);
        } catch (photoError) {
          console.error('Failed to upload photo:', photoError);
          // Don't fail the whole operation if photo upload fails
        }
      }

      Alert.alert('Success', 'Item added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to create item:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create item'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Item Type Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Item Type *</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                itemType === 'FOOD' && styles.typeButtonActive,
              ]}
              onPress={() => setItemType('FOOD')}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  itemType === 'FOOD' && styles.typeButtonTextActive,
                ]}
              >
                Food
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                itemType === 'DOCUMENT' && styles.typeButtonActive,
              ]}
              onPress={() => setItemType('DOCUMENT')}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  itemType === 'DOCUMENT' && styles.typeButtonTextActive,
                ]}
              >
                Document
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder={itemType === 'FOOD' ? 'e.g., Milk' : 'e.g., Passport'}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>

        {/* Food-specific fields */}
        {itemType === 'FOOD' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.pickerContainer}>
                <WebCompatiblePicker
                  selectedValue={category}
                  onValueChange={setCategory}
                  enabled={!isLoading}
                  items={FOOD_CATEGORIES}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Storage Type *</Text>
              <View style={styles.pickerContainer}>
                <WebCompatiblePicker
                  selectedValue={storageType}
                  onValueChange={setStorageType}
                  enabled={!isLoading}
                  items={STORAGE_TYPES}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1 liter, 500g, 3 pieces"
                value={quantity}
                onChangeText={setQuantity}
                editable={!isLoading}
              />
            </View>
          </>
        )}

        {/* Document-specific fields */}
        {itemType === 'DOCUMENT' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Document Type *</Text>
              <View style={styles.pickerContainer}>
                <WebCompatiblePicker
                  selectedValue={documentType}
                  onValueChange={setDocumentType}
                  enabled={!isLoading}
                  items={DOCUMENT_TYPES}
                />
              </View>
            </View>

            {documentType === 'CUSTOM' && (
              <View style={styles.section}>
                <Text style={styles.label}>Custom Type *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Library Card"
                  value={customType}
                  onChangeText={setCustomType}
                  editable={!isLoading}
                />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Document Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., A12345678"
                value={documentNumber}
                onChangeText={setDocumentNumber}
                editable={!isLoading}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Issued Date</Text>
              {Platform.OS === 'web' ? (
                <WebCompatibleDatePicker
                  value={issuedDate || new Date()}
                  onChange={(event: any, selectedDate: Date | undefined) => {
                    if (selectedDate) {
                      setIssuedDate(selectedDate);
                    }
                  }}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowIssuedDatePicker(true)}
                    disabled={isLoading}
                  >
                    <Text style={styles.dateButtonText}>
                      {issuedDate ? formatDate(issuedDate) : 'Select Date'}
                    </Text>
                  </TouchableOpacity>
                  {showIssuedDatePicker && DateTimePicker && (
                    <DateTimePicker
                      value={issuedDate || new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event: any, selectedDate?: Date) => {
                        setShowIssuedDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setIssuedDate(selectedDate);
                        }
                      }}
                    />
                  )}
                </>
              )}
            </View>
          </>
        )}

        {/* Expiry Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Expiry Date *</Text>
          {Platform.OS === 'web' ? (
            <WebCompatibleDatePicker
              value={expiryDate}
              onChange={(event: any, selectedDate: Date | undefined) => {
                if (selectedDate) {
                  setExpiryDate(selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                disabled={isLoading}
              >
                <Text style={styles.dateButtonText}>{formatDate(expiryDate)}</Text>
              </TouchableOpacity>
              {showDatePicker && DateTimePicker && (
                <DateTimePicker
                  value={expiryDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: any, selectedDate?: Date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setExpiryDate(selectedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
            </>
          )}
        </View>

        {/* Photo */}
        <View style={styles.section}>
          <Text style={styles.label}>Photo (Optional)</Text>
          {photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={handleRemovePhoto}
                disabled={isLoading}
              >
                <Text style={styles.removePhotoText}>Remove Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handlePhotoSelect}
              disabled={isLoading}
            >
              <Text style={styles.addPhotoText}>+ Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Item</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  addPhotoButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
  },
  addPhotoText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  removePhotoButton: {
    marginTop: 10,
    padding: 10,
  },
  removePhotoText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AddItemScreen;
