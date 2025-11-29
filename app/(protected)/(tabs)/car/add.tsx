import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSupabase } from "@/hooks/useSupabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { WILAYAS_CITIES } from "@/consts/wilayas-cities";
import {
  BRAND,
  fuel_type,
  transmission,
  seats,
  doors,
  category,
} from "@/consts/filters";
import * as ImagePicker from "expo-image-picker";

interface CarFormData {
  title: string;
  description: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  fuel_type: string;
  transmission: string;
  seats: string;
  doors: string;
  daily_price: string;
  wilaya: string;
  city: string;
  features: string[];
  license_plate: string;
  mileage: string;
  category: string;
}

type ModalType =
  | "brand"
  | "model"
  | "wilaya"
  | "city"
  | "fuel_type"
  | "transmission"
  | "seats"
  | "doors"
  | "category"
  | "features";

export default function AddCarPage() {
  const { supabase, session } = useSupabase();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<CarFormData>({
    title: "",
    description: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    fuel_type: "",
    transmission: "",
    seats: "",
    doors: "",
    daily_price: "",
    wilaya: "",
    city: "",
    features: [],
    license_plate: "",
    mileage: "",
    category: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  const availableFeatures = [
    "Air Conditioning",
    "Bluetooth",
    "Navigation System",
    "Backup Camera",
    "Parking Sensors",
    "Sunroof/Moonroof",
    "Leather Seats",
    "Heated Seats",
    "Apple CarPlay/Android Auto",
    "Keyless Entry",
    "Push Button Start",
    "Cruise Control",
    "Alloy Wheels",
    "Roof Rack",
    "Towing Package",
    "4WD/AWD",
    "Child Seat",
    "Pet Friendly",
  ];

  const getModelsForBrand = () => {
    const brand = BRAND.find((b) => b.label === formData.brand);
    return brand ? brand.models : [];
  };

  const getCitiesForWilaya = () => {
    const wilaya = WILAYAS_CITIES.find(
      (w) => w.wilaya.name === formData.wilaya
    );
    return wilaya ? wilaya.wilaya.cities : [];
  };

  const getModalData = () => {
    switch (activeModal) {
      case "brand":
        return BRAND.map((b) => b.label);
      case "model":
        return getModelsForBrand();
      case "wilaya":
        return WILAYAS_CITIES.map((w) => w.wilaya.name);
      case "city":
        return getCitiesForWilaya();
      case "fuel_type":
        return fuel_type;
      case "transmission":
        return transmission;
      case "seats":
        return seats;
      case "doors":
        return doors;
      case "category":
        return category;
      case "features":
        return availableFeatures;
      default:
        return [];
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case "brand":
        return "Select Brand";
      case "model":
        return "Select Model";
      case "wilaya":
        return "Select Wilaya";
      case "city":
        return "Select City";
      case "fuel_type":
        return "Select Fuel Type";
      case "transmission":
        return "Select Transmission";
      case "seats":
        return "Select Seats";
      case "doors":
        return "Select Doors";
      case "category":
        return "Select Category";
      case "features":
        return "Select Features";
      default:
        return "Select";
    }
  };

  const getSelectedValue = () => {
    switch (activeModal) {
      case "brand":
        return formData.brand;
      case "model":
        return formData.model;
      case "wilaya":
        return formData.wilaya;
      case "city":
        return formData.city;
      case "fuel_type":
        return formData.fuel_type;
      case "transmission":
        return formData.transmission;
      case "seats":
        return formData.seats;
      case "doors":
        return formData.doors;
      case "category":
        return formData.category;
      default:
        return "";
    }
  };

  const handleInputChange = (field: keyof CarFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset dependent fields
    if (field === "brand") {
      setFormData((prev) => ({ ...prev, model: "" }));
    }
    if (field === "wilaya") {
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleModalSelect = (value: string) => {
    switch (activeModal) {
      case "brand":
        handleInputChange("brand", value);
        break;
      case "model":
        handleInputChange("model", value);
        break;
      case "wilaya":
        handleInputChange("wilaya", value);
        break;
      case "city":
        handleInputChange("city", value);
        break;
      case "fuel_type":
        handleInputChange("fuel_type", value);
        break;
      case "transmission":
        handleInputChange("transmission", value);
        break;
      case "seats":
        handleInputChange("seats", value);
        break;
      case "doors":
        handleInputChange("doors", value);
        break;
      case "category":
        handleInputChange("category", value);
        break;
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera roll permissions to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImages((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      // Get the file name and type from the URI
      const fileName = `car-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      // Convert image to base64
      const response = await fetch(uri);
      const blob = await response.blob();

      // Alternative approach if blob doesn't work
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        type: "image/jpeg",
        name: fileName,
      } as any);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("car-images")
        .upload(fileName, formData, {
          contentType: "image/jpeg",
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("car-images").getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (
      !formData.title ||
      !formData.brand ||
      !formData.model ||
      !formData.daily_price ||
      !formData.wilaya ||
      !formData.city ||
      !formData.license_plate
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one image of the car");
      return;
    }

    setLoading(true);
    try {
      // Upload images
      const uploadedImageUrls: string[] = [];
      for (const imageUri of images) {
        const url = await uploadImage(imageUri);
        uploadedImageUrls.push(url);
      }

      // Create car record
      const { data, error } = await supabase
        .from("cars")
        .insert([
          {
            ...formData,
            images: uploadedImageUrls,
            owner_id: session?.user?.id,
            is_available: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      Alert.alert("Success!", "Your car has been listed successfully", [
        {
          text: "View My Cars",
          onPress: () => router.push("/(protected)/(tabs)/my-cars"),
        },
        {
          text: "Add Another",
          onPress: () => {
            setFormData({
              title: "",
              description: "",
              brand: "",
              model: "",
              year: "",
              color: "",
              fuel_type: "",
              transmission: "",
              seats: "",
              doors: "",
              daily_price: "",
              wilaya: "",
              city: "",
              features: [],
              license_plate: "",
              mileage: "",
              category: "",
            });
            setImages([]);
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error adding car:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to add car. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSelectModal = () => (
    <Modal
      visible={!!activeModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{getModalTitle()}</Text>
          <TouchableOpacity onPress={() => setActiveModal(null)}>
            <Ionicons name="close" size={24} color="#406264" />
          </TouchableOpacity>
        </View>

        {activeModal === "features" ? (
          <ScrollView style={styles.modalContent}>
            <View style={styles.featuresGrid}>
              {getModalData().map((feature) => (
                <TouchableOpacity
                  key={feature}
                  style={[
                    styles.featureOption,
                    formData.features.includes(feature) &&
                      styles.featureOptionSelected,
                  ]}
                  onPress={() => handleFeatureToggle(feature)}
                >
                  <Text
                    style={[
                      styles.featureOptionText,
                      formData.features.includes(feature) &&
                        styles.featureOptionTextSelected,
                    ]}
                  >
                    {feature}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView style={styles.modalContent}>
            {getModalData().map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.modalOption,
                  getSelectedValue() === item && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  handleModalSelect(item);
                  setActiveModal(null);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    getSelectedValue() === item &&
                      styles.modalOptionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#406264" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Car</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Car Images *</Text>
          <Text style={styles.sectionSubtitle}>
            Add clear photos of your car
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesContainer}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Ionicons name="camera" size={32} color="#406264" />
              <Text style={styles.addImageText}>Add Image</Text>
              <Text style={styles.imageCount}>{images.length}/10</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Car Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Comfortable Family Car"
              value={formData.title}
              onChangeText={(value) => handleInputChange("title", value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your car's features and condition..."
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Brand *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setActiveModal("brand")}
              >
                <Text
                  style={
                    formData.brand
                      ? styles.selectButtonText
                      : styles.selectButtonPlaceholder
                  }
                >
                  {formData.brand || "Select Brand"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Model *</Text>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  !formData.brand && styles.selectButtonDisabled,
                ]}
                onPress={() => formData.brand && setActiveModal("model")}
                disabled={!formData.brand}
              >
                <Text
                  style={
                    formData.model
                      ? styles.selectButtonText
                      : styles.selectButtonPlaceholder
                  }
                >
                  {formData.model || "Select Model"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 2020"
                value={formData.year}
                onChangeText={(value) => handleInputChange("year", value)}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., White"
                value={formData.color}
                onChangeText={(value) => handleInputChange("color", value)}
              />
            </View>
          </View>
        </View>

        {/* Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Fuel Type</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setActiveModal("fuel_type")}
              >
                <Text
                  style={
                    formData.fuel_type
                      ? styles.selectButtonText
                      : styles.selectButtonPlaceholder
                  }
                >
                  {formData.fuel_type || "Select Fuel Type"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Transmission</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setActiveModal("transmission")}
              >
                <Text
                  style={
                    formData.transmission
                      ? styles.selectButtonText
                      : styles.selectButtonPlaceholder
                  }
                >
                  {formData.transmission || "Select Transmission"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Seats</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setActiveModal("seats")}
              >
                <Text
                  style={
                    formData.seats
                      ? styles.selectButtonText
                      : styles.selectButtonPlaceholder
                  }
                >
                  {formData.seats || "Select Seats"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Doors</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setActiveModal("doors")}
              >
                <Text
                  style={
                    formData.doors
                      ? styles.selectButtonText
                      : styles.selectButtonPlaceholder
                  }
                >
                  {formData.doors || "Select Doors"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setActiveModal("category")}
              >
                <Text
                  style={
                    formData.category
                      ? styles.selectButtonText
                      : styles.selectButtonPlaceholder
                  }
                >
                  {formData.category || "Select Category"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Mileage (km)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 50000"
                value={formData.mileage}
                onChangeText={(value) => handleInputChange("mileage", value)}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Location & Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Pricing</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Wilaya *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setActiveModal("wilaya")}
              >
                <Text
                  style={
                    formData.wilaya
                      ? styles.selectButtonText
                      : styles.selectButtonPlaceholder
                  }
                >
                  {formData.wilaya || "Select Wilaya"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>City *</Text>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  !formData.wilaya && styles.selectButtonDisabled,
                ]}
                onPress={() => formData.wilaya && setActiveModal("city")}
                disabled={!formData.wilaya}
              >
                <Text
                  style={
                    formData.city
                      ? styles.selectButtonText
                      : styles.selectButtonPlaceholder
                  }
                >
                  {formData.city || "Select City"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Daily Price (DZD) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 2500"
                value={formData.daily_price}
                onChangeText={(value) =>
                  handleInputChange("daily_price", value)
                }
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>License Plate *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 1234567"
                value={formData.license_plate}
                onChangeText={(value) =>
                  handleInputChange("license_plate", value)
                }
                maxLength={10}
              />
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Features</Text>
            <TouchableOpacity
              style={styles.featuresButton}
              onPress={() => setActiveModal("features")}
            >
              <Text style={styles.featuresButtonText}>
                {formData.features.length > 0
                  ? `Selected (${formData.features.length})`
                  : "Select Features"}
              </Text>
            </TouchableOpacity>
          </View>

          {formData.features.length > 0 && (
            <View style={styles.selectedFeatures}>
              {formData.features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureTagText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>List My Car</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Single Modal for all selections */}
      {renderSelectModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1a1a1a",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectButtonText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  selectButtonPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  imagesContainer: {
    flexDirection: "row",
  },
  imageItem: {
    position: "relative",
    marginRight: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  addImageButton: {
    width: 120,
    height: 120,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  imageCount: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },
  featuresButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#406264",
    borderRadius: 6,
  },
  featuresButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  selectedFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  featureTag: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featureTagText: {
    fontSize: 12,
    color: "#406264",
  },
  submitButton: {
    backgroundColor: "#406264",
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalOptionSelected: {
    backgroundColor: "#406264",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  modalOptionTextSelected: {
    color: "#FFFFFF",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  featureOptionSelected: {
    backgroundColor: "#406264",
    borderColor: "#406264",
  },
  featureOptionText: {
    fontSize: 14,
    color: "#666",
  },
  featureOptionTextSelected: {
    color: "#FFFFFF",
  },
  doneButton: {
    backgroundColor: "#406264",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
