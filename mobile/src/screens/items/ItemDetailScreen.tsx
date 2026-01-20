import React, { useState, useEffect } from 'react';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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

type NavigationProp = NativeStackNavigationProp<ItemsStackParamList, 'ItemDetail'>;
type ItemDetailRouteProp = RouteProp<ItemsStackParamList, 'ItemDetail'>;

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
  { label: 'Refrigerator', value: 'REFRIGERATOR' },
  { label: 'Freezer', value: 'FREEZER' },
  { label: 'Pantry', value: 'PANTRY' },
  { label: 'Counter', value: 'COUNTER' },
];

const DOCUMENT_TYPES = [
  { label: 'Passport', value: 'PASSPORT' },
  { label: 'Visa', value: 'VISA' },
  { label: "Driver's License", value: 'DRIVERS_LICENSE' },
  { label: 'ID Card', value: 'ID_CARD' },
  { label: 'Insurance Policy', value: 'INSURANCE_POLICY' },
  { label: 'Membership', value: 'MEMBERSHIP' },
  { label: 'Custom', value: 'CUSTOM' },
];

const ItemDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ItemDetailRouteProp>();
  const { itemId, itemType } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Item data
  const [item, setItem] = useState<any>(null);
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadItem();
  }, []);

  const loadItem = async () => {
    try {
      const response = await api.getItems({ type: itemType });
      const foundItem = response.items.find((i) => i.id === itemId);

      if (!foundItem) {
        Alert.alert('Error', 'Item not found');
        navigation.goBack();
        return;
      }

      setItem(foundItem);
      setName(foundItem.name);
      setExpiryDate(new Date(foundItem.expiryDate));
      setNotes(foundItem.notes || '');
      setPhotoUrl(foundItem.photoUrl || null);

      if (itemType === 'FOOD') {
        setCategory((foundItem as any).category);
        setStorageType((foundItem as any).storageType);
        setQuantity((foundItem as any).quantity || '');
      } else {
        setDocumentType((foundItem as any).type);
        setCustomType((foundItem as any).customType || '');
        setDocumentNumber((foundItem as any).documentNumber || '');
        if ((foundItem as any).issuedDate) {
          setIssuedDate(new Date((foundItem as any).issuedDate));
        }
      }
    } catch (error) {
      console.error('Failed to load item:', error);
      Alert.alert('Error', 'Failed to load item');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
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
      'Change Photo',
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

  const handleRemovePhoto = async () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deletePhoto(itemId, itemType);
              setPhotoUrl(null);
              setPhoto(null);
              Alert.alert('Success', 'Photo removed successfully');
            } catch (error) {
              console.error('Failed to remove photo:', error);
              Alert.alert('Error', 'Failed to remove photo');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    if (itemType === 'FOOD' && (!category || !storageType)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (itemType === 'DOCUMENT' && !documentType) {
      Alert.alert('Error', 'Please select document type');
      return;
    }

    setIsSaving(true);
    try {
      if (itemType === 'FOOD') {
        await api.updateFoodItem(itemId, {
          name: name.trim(),
          category,
          storageType,
          expiryDate: expiryDate.toISOString(),
          quantity: quantity.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await api.updateDocument(itemId, {
          name: name.trim(),
          type: documentType,
          customType: documentType === 'CUSTOM' ? customType.trim() : undefined,
          expiryDate: expiryDate.toISOString(),
          documentNumber: documentNumber.trim() || undefined,
          issuedDate: issuedDate?.toISOString() || undefined,
          notes: notes.trim() || undefined,
        });
      }

      // Upload new photo if selected
      if (photo) {
        try {
          await api.uploadPhoto(itemId, itemType, photo);
        } catch (photoError) {
          console.error('Failed to upload photo:', photoError);
        }
      }

      Alert.alert('Success', 'Item updated successfully');
      setIsEditing(false);
      setPhoto(null);
      await loadItem();
    } catch (error: any) {
      console.error('Failed to update item:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update item'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteItem(itemId, itemType);
              Alert.alert('Success', 'Item deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: any) {
              console.error('Failed to delete item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXPIRED':
        return '#FF3B30';
      case 'EXPIRING_SOON':
        return '#FF9500';
      case 'SAFE':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getDaysUntilExpiry = (expiryDateStr: string) => {
    const now = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  const daysUntil = getDaysUntilExpiry(item.expiryDate);
  const statusColor = getStatusColor(item.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Status Banner */}
        {!isEditing && (
          <View style={[styles.statusBanner, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {daysUntil > 0
                ? `Expires in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
                : daysUntil === 0
                ? 'Expires today'
                : `Expired ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {!isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              editable={!isSaving}
            />
          ) : (
            <Text style={styles.value}>{item.name}</Text>
          )}
        </View>

        {/* Type Badge */}
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{itemType}</Text>
          </View>
        </View>

        {/* Food-specific fields */}
        {itemType === 'FOOD' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Category</Text>
              {isEditing ? (
                <View style={styles.pickerContainer}>
                  <WebCompatiblePicker
                    selectedValue={category}
                    onValueChange={setCategory}
                    enabled={!isSaving}
                    items={FOOD_CATEGORIES}
                  />
                </View>
              ) : (
                <Text style={styles.value}>{category}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Storage Type</Text>
              {isEditing ? (
                <View style={styles.pickerContainer}>
                  <WebCompatiblePicker
                    selectedValue={storageType}
                    onValueChange={setStorageType}
                    enabled={!isSaving}
                    items={STORAGE_TYPES}
                  />
                </View>
              ) : (
                <Text style={styles.value}>{storageType}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Quantity</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="e.g., 1 liter"
                  editable={!isSaving}
                />
              ) : (
                <Text style={styles.value}>{quantity || 'Not specified'}</Text>
              )}
            </View>
          </>
        )}

        {/* Document-specific fields */}
        {itemType === 'DOCUMENT' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Document Type</Text>
              {isEditing ? (
                <View style={styles.pickerContainer}>
                  <WebCompatiblePicker
                    selectedValue={documentType}
                    onValueChange={setDocumentType}
                    enabled={!isSaving}
                    items={DOCUMENT_TYPES}
                  />
                </View>
              ) : (
                <Text style={styles.value}>{documentType}</Text>
              )}
            </View>

            {(isEditing ? documentType === 'CUSTOM' : customType) && (
              <View style={styles.section}>
                <Text style={styles.label}>Custom Type</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={customType}
                    onChangeText={setCustomType}
                    placeholder="e.g., Library Card"
                    editable={!isSaving}
                  />
                ) : (
                  <Text style={styles.value}>{customType}</Text>
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Document Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                  placeholder="e.g., A12345678"
                  editable={!isSaving}
                />
              ) : (
                <Text style={styles.value}>{documentNumber || 'Not specified'}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Issued Date</Text>
              {isEditing ? (
                Platform.OS === 'web' ? (
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
                      disabled={isSaving}
                    >
                      <Text style={styles.dateButtonText}>
                        {issuedDate ? formatDate(issuedDate) : 'Not specified'}
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
                )
              ) : (
                <Text style={styles.value}>
                  {issuedDate ? formatDate(issuedDate) : 'Not specified'}
                </Text>
              )}
            </View>
          </>
        )}

        {/* Expiry Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Expiry Date</Text>
          {isEditing ? (
            Platform.OS === 'web' ? (
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
                  disabled={isSaving}
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
            )
          ) : (
            <Text style={styles.value}>{formatDate(expiryDate)}</Text>
          )}
        </View>

        {/* Photo */}
        <View style={styles.section}>
          <Text style={styles.label}>Photo</Text>
          {isEditing ? (
            <>
              {(photo || photoUrl) ? (
                <View style={styles.photoContainer}>
                  <Image
                    source={{ uri: photo ? photo.uri : photoUrl }}
                    style={styles.photoPreview}
                  />
                  <View style={styles.photoActions}>
                    <TouchableOpacity
                      style={styles.changePhotoButton}
                      onPress={handlePhotoSelect}
                      disabled={isSaving}
                    >
                      <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={handleRemovePhoto}
                      disabled={isSaving}
                    >
                      <Text style={styles.removePhotoText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handlePhotoSelect}
                  disabled={isSaving}
                >
                  <Text style={styles.addPhotoText}>+ Add Photo</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.photoPreview} />
              ) : (
                <Text style={styles.value}>No photo</Text>
              )}
            </>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isSaving}
            />
          ) : (
            <Text style={styles.value}>{notes || 'No notes'}</Text>
          )}
        </View>

        {/* Created/Updated timestamps */}
        {!isEditing && (
          <View style={styles.metadataSection}>
            <Text style={styles.metadataText}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.metadataText}>
              Updated: {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Edit Mode Buttons */}
        {isEditing && (
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setIsEditing(false);
                loadItem();
              }}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  statusBanner: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  metadataSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
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
  photoActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
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
  changePhotoButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removePhotoButton: {
    padding: 10,
  },
  removePhotoText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ItemDetailScreen;
