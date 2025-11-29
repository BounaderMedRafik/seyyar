import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSupabase } from "@/hooks/useSupabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

interface Car {
  uuid: string;
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
  images: string[];
  is_available: boolean;
  owner_id: string;
  license_plate: string;
  mileage: string;
  category: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  firstname: string;
  email: string;
  phone: string;
  pfp: string;
  typeUser: string;
  created_at: string;
}

export default function MyCarsPage() {
  const { supabase, session, isLoaded } = useSupabase();
  const insets = useSafeAreaInsets();

  const [cars, setCars] = useState<Car[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [algeriaId, setAlgeriaId] = useState("");

  // Add state
  const [refreshing, setRefreshing] = useState(false);

  // Add refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserAndCars();
    setRefreshing(false);
  };

  const userId = session?.user?.id;

  useEffect(() => {
    if (isLoaded && userId) {
      loadUserAndCars();
    }
  }, [isLoaded, userId]);

  const loadUserAndCars = async () => {
    try {
      setLoading(true);

      // Load current user details
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      if (userData) {
        setCurrentUser(userData);

        // If user is renter, load their cars
        if (userData.typeUser === "renter") {
          //@ts-ignore
          await loadUserCars(userId);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const loadUserCars = async (userId: string) => {
    try {
      const { data: carsData, error: carsError } = await supabase
        .from("cars")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (carsError) throw carsError;
      setCars(carsData || []);
    } catch (error) {
      console.error("Error loading cars:", error);
      Alert.alert("Error", "Failed to load your cars");
    }
  };

  const handleBecomeRenter = async () => {
    if (!algeriaId.trim()) {
      Alert.alert("Error", "Please enter your Algeria ID");
      return;
    }

    if (algeriaId.length < 8) {
      Alert.alert("Error", "Please enter a valid Algeria ID");
      return;
    }

    setVerificationLoading(true);
    try {
      // Update user type to renter
      const { error } = await supabase
        .from("users")
        .update({ typeUser: "renter" })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setCurrentUser((prev) => (prev ? { ...prev, typeUser: "renter" } : null));
      setShowVerificationModal(false);
      setAlgeriaId("");

      Alert.alert(
        "Success!",
        "You are now a renter. You can start adding your cars.",
        [{ text: "OK", onPress: () => setShowAddCarModal(true) }]
      );
    } catch (error: any) {
      console.error("Error updating user type:", error);
      Alert.alert("Error", "Failed to update user type. Please try again.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleToggleAvailability = async (
    carId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("cars")
        .update({ is_available: !currentStatus })
        .eq("uuid", carId);

      if (error) throw error;

      // Update local state
      setCars((prev) =>
        prev.map((car) =>
          car.uuid === carId ? { ...car, is_available: !currentStatus } : car
        )
      );

      Alert.alert(
        "Success",
        `Car marked as ${!currentStatus ? "available" : "unavailable"}`
      );
    } catch (error: any) {
      console.error("Error updating car availability:", error);
      Alert.alert("Error", "Failed to update car availability");
    }
  };

  const handleDeleteCar = async (carId: string) => {
    Alert.alert(
      "Delete Car",
      "Are you sure you want to delete this car? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("cars")
                .delete()
                .eq("uuid", carId);

              if (error) throw error;

              // Update local state
              setCars((prev) => prev.filter((car) => car.uuid !== carId));
              Alert.alert("Success", "Car deleted successfully");
            } catch (error: any) {
              console.error("Error deleting car:", error);
              Alert.alert("Error", "Failed to delete car");
            }
          },
        },
      ]
    );
  };

  const renderCarCard = ({ item }: { item: Car }) => (
    <TouchableOpacity
      style={styles.carCard}
      onPress={() => router.push(`/car/${item.uuid}`)}
    >
      {/* Car Image */}
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.carImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.carImagePlaceholder}>
            <Ionicons name="car-sport" size={32} color="#406264" />
          </View>
        )}

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            item.is_available
              ? styles.statusAvailable
              : styles.statusUnavailable,
          ]}
        >
          <Text style={styles.statusText}>
            {item.is_available ? "Available" : "Not Available"}
          </Text>
        </View>
      </View>

      {/* Car Info */}
      <View style={styles.carInfo}>
        <Text style={styles.carTitle}>
          {item.brand} {item.model} {item.year && `(${item.year})`}
        </Text>

        {item.title && <Text style={styles.carSubtitle}>{item.title}</Text>}

        <View style={styles.carDetails}>
          <Text style={styles.carDetail}>
            <Ionicons name="location" size={12} color="#666" />
            {item.city}, {item.wilaya}
          </Text>
          <Text style={styles.carDetail}>
            <Ionicons name="speedometer" size={12} color="#666" />
            {item.mileage} km
          </Text>
        </View>

        <View style={styles.carSpecs}>
          <Text style={styles.carSpec}>{item.fuel_type}</Text>
          <Text style={styles.carSpec}>{item.transmission}</Text>
          <Text style={styles.carSpec}>{item.seats} seats</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.dailyPrice}>DZD {item.daily_price}/day</Text>
          <Text style={styles.createdDate}>
            Added {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              item.is_available
                ? styles.makeUnavailableButton
                : styles.makeAvailableButton,
            ]}
            onPress={() =>
              handleToggleAvailability(item.uuid, item.is_available)
            }
          >
            <Ionicons
              name={item.is_available ? "eye-off-outline" : "eye-outline"}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.actionButtonText}>
              {item.is_available ? "Make Unavailable" : "Make Available"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            // onPress={() => router.push(`/edit-car/${item.uuid}`)}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCar(item.uuid)}
          >
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!userId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cars</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="log-in-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>Sign In Required</Text>
          <Text style={styles.emptyStateSubtext}>
            Please sign in to manage your cars
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push("/sign-in")}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cars</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#406264" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Show verification modal for clients
  if (currentUser?.typeUser === "client") {
    return (
      <View style={[styles.container]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cars</Text>
        </View>

        <View style={styles.verificationPrompt}>
          <Ionicons name="car-sport" size={80} color="#406264" />
          <Text style={styles.verificationTitle}>Become a Renter</Text>
          <Text style={styles.verificationText}>
            To list your cars for rent, you need to verify your identity and
            become a renter.
          </Text>
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => setShowVerificationModal(true)}
          >
            <Text style={styles.verifyButtonText}>Verify Identity</Text>
          </TouchableOpacity>
        </View>

        {/* Verification Modal */}
        <Modal
          visible={showVerificationModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowVerificationModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Identity Verification</Text>
              <TouchableOpacity onPress={() => setShowVerificationModal(false)}>
                <Ionicons name="close" size={24} color="#406264" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.verificationInfo}>
                <Ionicons name="shield-checkmark" size={48} color="#406264" />
                <Text style={styles.verificationInfoTitle}>
                  Secure Verification
                </Text>
                <Text style={styles.verificationInfoText}>
                  To ensure the safety of our community, we require identity
                  verification for all renters.
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Algeria National ID Number
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your Algeria ID number"
                  value={algeriaId}
                  onChangeText={setAlgeriaId}
                  keyboardType="numeric"
                  maxLength={20}
                />
                <Text style={styles.inputHelp}>
                  Your ID will be verified securely and your information will be
                  protected.
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!algeriaId.trim() || verificationLoading) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleBecomeRenter}
                disabled={!algeriaId.trim() || verificationLoading}
              >
                {verificationLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Verify & Become Renter
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.securityNotice}>
                <Ionicons name="lock-closed" size={16} color="#666" />
                <Text style={styles.securityText}>
                  Your information is encrypted and secure. We never share your
                  personal details.
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  // Show cars for renters
  return (
    <View style={[styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cars</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(protected)/(tabs)/car/add")}
        >
          <Ionicons name="add" size={24} color="#406264" />
        </TouchableOpacity>
      </View>

      {/* Cars List */}
      {cars.length > 0 ? (
        <FlatList
          data={cars}
          renderItem={renderCarCard}
          keyExtractor={(item) => item.uuid}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.carsGrid}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#406264"]}
              tintColor="#406264"
            />
          }
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {cars.length} car{cars.length !== 1 ? "s" : ""} listed
            </Text>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No Cars Listed</Text>
          <Text style={styles.emptyStateSubtext}>
            Start earning by listing your first car for rent
          </Text>
          <TouchableOpacity
            style={styles.addCarButton}
            onPress={() => router.push("/(protected)/(tabs)/car/add")}
          >
            <Text style={styles.addCarButtonText}>Add Your First Car</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  verificationPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: "#406264",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
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
  verificationInfo: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 24,
  },
  verificationInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 12,
    marginBottom: 8,
  },
  verificationInfoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
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
  inputHelp: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#406264",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    gap: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 16,
  },
  carsGrid: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontWeight: "500",
  },
  carCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  carImage: {
    width: "100%",
    height: 200,
  },
  carImagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusAvailable: {
    backgroundColor: "#E8F5E8",
  },
  statusUnavailable: {
    backgroundColor: "#FFE6E6",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  carInfo: {
    padding: 16,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  carSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  carDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  carDetail: {
    fontSize: 12,
    color: "#666",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  carSpecs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  carSpec: {
    fontSize: 11,
    color: "#666",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dailyPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#406264",
  },
  createdDate: {
    fontSize: 12,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  makeAvailableButton: {
    backgroundColor: "#10B981",
  },
  makeUnavailableButton: {
    backgroundColor: "#6B7280",
  },
  editButton: {
    backgroundColor: "#406264",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  signInButton: {
    backgroundColor: "#406264",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  addCarButton: {
    backgroundColor: "#406264",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addCarButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
