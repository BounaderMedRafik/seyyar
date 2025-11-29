import { useLocalSearchParams, useRouter } from "expo-router";
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
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSupabase } from "@/hooks/useSupabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  created_at: string;
}

interface Reservation {
  uuid: string;
  created_at: string;
  renterid: string;
  clientid: string;
  carid: string;
}

export default function CarDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { supabase, session, isLoaded } = useSupabase();
  const insets = useSafeAreaInsets();

  const [car, setCar] = useState<Car | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [renting, setRenting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [userReservation, setUserReservation] = useState<Reservation | null>(
    null
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get current user ID from session
  const userId = session?.user?.id;

  useEffect(() => {
    if (id && isLoaded) {
      loadCarDetails();
    }
  }, [id, isLoaded, userId]);

  const loadCarDetails = async () => {
    try {
      setLoading(true);

      // Load car details
      const { data: carData, error: carError } = await supabase
        .from("cars")
        .select("*")
        .eq("uuid", id)
        .single();

      if (carError) throw carError;

      if (carData) {
        setCar(carData);

        // Load owner details from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", carData.owner_id)
          .single();

        if (userError) {
          console.error("Error loading owner:", userError);
        } else {
          setOwner(userData);
        }

        // Load current user details if logged in
        if (userId) {
          await loadCurrentUser(userId);
          await checkUserReservation(carData.uuid, userId);
        }
      }
    } catch (error) {
      console.error("Error loading car details:", error);
      Alert.alert("Error", "Failed to load car details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading current user:", error);
      } else {
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const checkUserReservation = async (carId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from("reservation")
        .select("*")
        .eq("carid", carId)
        .eq("clientid", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error
        console.error("Error checking reservation:", error);
      } else {
        setUserReservation(data || null);
      }
    } catch (error) {
      console.error("Error checking reservation:", error);
    }
  };

  const handleRentCar = async () => {
    if (!userId) {
      Alert.alert("Sign In Required", "Please sign in to rent this car", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/sign-in") },
      ]);
      return;
    }

    if (!car) return;

    // Prevent renting your own car
    if (userId === car.owner_id) {
      Alert.alert("Not Available", "You cannot rent your own car.");
      return;
    }

    // Check if already reserved
    if (userReservation) {
      Alert.alert("Already Reserved", "You have already reserved this car.");
      return;
    }

    setRenting(true);
    try {
      // Create reservation
      const { data, error } = await supabase
        .from("reservation")
        .insert([
          {
            renterid: car.owner_id, // Car owner
            clientid: userId, // Current user ID
            carid: car.uuid, // Car ID
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setUserReservation(data);
        Alert.alert(
          "Reservation Created!",
          "Your reservation has been created successfully. Please contact the owner to arrange pickup.",
          [
            {
              text: "Contact Owner",
              onPress: handleContactOwner,
            },
            {
              text: "OK",
              style: "default",
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      Alert.alert(
        "Reservation Failed",
        error.message || "Failed to create reservation. Please try again."
      );
    } finally {
      setRenting(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!userReservation) return;

    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("reservation")
                .delete()
                .eq("uuid", userReservation.uuid);

              if (error) throw error;

              setUserReservation(null);
              Alert.alert(
                "Reservation Cancelled",
                "Your reservation has been cancelled."
              );
            } catch (error: any) {
              console.error("Error cancelling reservation:", error);
              Alert.alert(
                "Error",
                "Failed to cancel reservation. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleContactOwner = () => {
    if (owner?.phone) {
      Linking.openURL(`tel:${owner.phone}`);
    } else {
      Alert.alert("Contact", "Phone number not available");
    }
  };

  const handleWhatsApp = () => {
    if (owner?.phone) {
      const message = `Hello! I'm interested in renting your ${car?.brand} ${car?.model} from Seyyar.`;
      Linking.openURL(
        `https://wa.me/${owner.phone}?text=${encodeURIComponent(message)}`
      );
    } else {
      Alert.alert("WhatsApp", "Phone number not available");
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#406264" />
        <Text style={styles.loadingText}>Loading car details...</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={[styles.container]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#406264" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Car Not Found</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="car-outline" size={64} color="#ccc" />
          <Text style={styles.errorText}>Car not found</Text>
          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.push("/(protected)/(tabs)")}
          >
            <Text style={styles.backHomeText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const userInitial =
    owner?.firstname?.charAt(0).toUpperCase() ||
    owner?.name?.charAt(0).toUpperCase() ||
    "U";

  // Check if user is the owner
  const isOwner = userId === car.owner_id;
  const canRent = car.is_available && !isOwner && !userReservation;

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
        <Text style={styles.headerTitle}>Car Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          {car.images && car.images.length > 0 ? (
            <>
              <Image
                source={{ uri: car.images[activeImageIndex] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              {car.images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageThumbnails}
                >
                  {car.images.map((image, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setActiveImageIndex(index)}
                      style={[
                        styles.thumbnailContainer,
                        activeImageIndex === index &&
                          styles.thumbnailContainerActive,
                      ]}
                    >
                      <Image
                        source={{ uri: image }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="car-sport" size={80} color="#406264" />
              <Text style={styles.noImagesText}>No images available</Text>
            </View>
          )}
        </View>

        {/* Reservation Status */}
        {userReservation && (
          <View style={styles.reservationBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <View style={styles.reservationTextContainer}>
              <Text style={styles.reservationTitle}>Reservation Confirmed</Text>
              <Text style={styles.reservationSubtitle}>
                Reserved on{" "}
                {new Date(userReservation.created_at).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCancelReservation}
              style={styles.cancelReservationButton}
            >
              <Text style={styles.cancelReservationText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Car Basic Info */}
        <View style={styles.section}>
          <Text style={styles.carTitle}>
            {car.brand} {car.model} {car.year && `(${car.year})`}
          </Text>
          {car.title && <Text style={styles.carSubtitle}>{car.title}</Text>}

          <View style={styles.priceContainer}>
            <Text style={styles.dailyPrice}>DZD • {car.daily_price}/day</Text>
            <View
              style={[
                styles.availabilityBadge,
                car.is_available ? styles.available : styles.unavailable,
                userReservation && styles.reserved,
              ]}
            >
              <Text style={styles.availabilityText}>
                {userReservation
                  ? "Reserved"
                  : car.is_available
                    ? "Available"
                    : "Not Available"}
              </Text>
            </View>
          </View>

          {/* Owner Notice */}
          {isOwner && (
            <View style={styles.ownerNotice}>
              <Ionicons name="information-circle" size={16} color="#406264" />
              <Text style={styles.ownerNoticeText}>
                This is your car. You cannot rent it.
              </Text>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#406264" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.locationText}>
            {car.city}, {car.wilaya}
          </Text>
        </View>

        {/* Description */}
        {car.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#406264" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{car.description}</Text>
          </View>
        )}

        {/* Specifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cog" size={20} color="#406264" />
            <Text style={styles.sectionTitle}>Specifications</Text>
          </View>
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Brand</Text>
              <Text style={styles.specValue}>{car.brand}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Model</Text>
              <Text style={styles.specValue}>{car.model}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Year</Text>
              <Text style={styles.specValue}>{car.year}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Color</Text>
              <Text style={styles.specValue}>{car.color}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Fuel Type</Text>
              <Text style={styles.specValue}>{car.fuel_type}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Transmission</Text>
              <Text style={styles.specValue}>{car.transmission}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Seats</Text>
              <Text style={styles.specValue}>{car.seats}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Doors</Text>
              <Text style={styles.specValue}>{car.doors}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Mileage</Text>
              <Text style={styles.specValue}>{car.mileage} km</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Category</Text>
              <Text style={styles.specValue}>{car.category}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>License Plate</Text>
              <Text style={styles.specValue}>{car.license_plate}</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        {car.features && car.features.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={20} color="#406264" />
              <Text style={styles.sectionTitle}>Features</Text>
            </View>
            <View style={styles.featuresGrid}>
              {car.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#406264" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Owner Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#406264" />
            <Text style={styles.sectionTitle}>Owner</Text>
          </View>
          <View style={styles.ownerCard}>
            <View style={styles.ownerInfo}>
              {owner?.pfp ? (
                <Image
                  source={{ uri: owner.pfp }}
                  style={styles.ownerAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.ownerAvatarPlaceholder}>
                  <Text style={styles.ownerAvatarInitial}>{userInitial}</Text>
                </View>
              )}
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>
                  {owner?.firstname && owner?.name
                    ? `${owner.firstname} ${owner.name}`
                    : "Seyyar User"}
                </Text>
                <Text style={styles.ownerMemberSince}>
                  Member since{" "}
                  {owner?.created_at
                    ? new Date(owner.created_at).getFullYear()
                    : "N/A"}
                </Text>
              </View>
            </View>

            {owner?.phone && (
              <View style={styles.contactButtons}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleContactOwner}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.contactButton, styles.whatsappButton]}
                  onPress={handleWhatsApp}
                >
                  <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                  <Text style={styles.contactButtonText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Safety Notice */}
        <View style={styles.safetyNotice}>
          <Ionicons name="shield-checkmark" size={20} color="#666" />
          <Text style={styles.safetyText}>
            Always meet in public places and verify the car's condition before
            renting.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Action Button */}
      <View style={styles.fixedButtonContainer}>
        {canRent ? (
          <TouchableOpacity
            style={styles.rentButton}
            onPress={handleRentCar}
            disabled={renting}
          >
            {renting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.rentButtonText}>
                Rent This Car - DZD • {car.daily_price}/day
              </Text>
            )}
          </TouchableOpacity>
        ) : userReservation ? (
          <View style={styles.reservationActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.contactOwnerButton]}
              onPress={handleContactOwner}
            >
              <Ionicons name="call" size={20} color="#406264" />
              <Text style={styles.contactOwnerText}>Contact Owner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelReservation}
            >
              <Ionicons name="close-circle" size={20} color="#DC2626" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : isOwner ? (
          <TouchableOpacity
            style={[styles.rentButton, styles.ownerButton]}
            disabled
          >
            <Text style={styles.rentButtonText}>This is Your Car</Text>
          </TouchableOpacity>
        ) : !car.is_available ? (
          <TouchableOpacity
            style={[styles.rentButton, styles.unavailableButton]}
            disabled
          >
            <Text style={styles.rentButtonText}>Not Available</Text>
          </TouchableOpacity>
        ) : !userId ? (
          <TouchableOpacity
            style={styles.rentButton}
            onPress={() => router.push("/sign-in")}
          >
            <Text style={styles.rentButtonText}>Sign In to Rent</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  backHomeButton: {
    backgroundColor: "#406264",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backHomeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    marginBottom: 16,
  },
  mainImage: {
    width: "100%",
    height: 300,
  },
  imageThumbnails: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reserved: {
    backgroundColor: "#DBEAFE", // Light blue background
  },
  thumbnailContainer: {
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnailContainerActive: {
    borderColor: "#406264",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  imagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  noImagesText: {
    marginTop: 8,
    color: "#666",
    fontSize: 16,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  carTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  carSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dailyPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#406264",
  },
  availabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  available: {
    backgroundColor: "#E8F5E8",
  },
  unavailable: {
    backgroundColor: "#FFE6E6",
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  locationText: {
    fontSize: 16,
    color: "#666",
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  specItem: {
    width: "48%",
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  specValue: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  featuresGrid: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 16,
    color: "#666",
  },
  ownerCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  ownerAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#406264",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ownerAvatarInitial: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  ownerMemberSince: {
    fontSize: 14,
    color: "#666",
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#406264",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  safetyNotice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF3CD",
    margin: 16,
    borderRadius: 8,
    gap: 12,
  },
  safetyText: {
    flex: 1,
    fontSize: 14,
    color: "#856404",
    lineHeight: 18,
  },
  fixedButtonContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  rentButton: {
    backgroundColor: "#406264",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  rentButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Reservation Banner
  reservationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    gap: 12,
  },
  reservationTextContainer: {
    flex: 1,
  },
  reservationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  reservationSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  cancelReservationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 6,
  },
  cancelReservationText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },

  ownerNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    gap: 8,
  },
  ownerNoticeText: {
    fontSize: 14,
    color: "#406264",
    fontWeight: "500",
  },

  ownerButton: {
    backgroundColor: "#6B7280",
  },
  unavailableButton: {
    backgroundColor: "#9CA3AF",
  },

  reservationActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
  },
  contactOwnerButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#406264",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DC2626",
  },
  contactOwnerText: {
    color: "#406264",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },
});
