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
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSupabase } from "@/hooks/useSupabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

interface Reservation {
  uuid: string;
  created_at: string;
  renterid: string;
  clientid: string;
  carid: string;
}

interface Car {
  uuid: string;
  title: string;
  brand: string;
  model: string;
  year: string;
  daily_price: string;
  wilaya: string;
  city: string;
  images: string[];
  is_available: boolean;
  fuel_type: string;
  transmission: string;
  seats: string;
}

interface User {
  id: string;
  name: string;
  firstname: string;
  phone: string;
  pfp: string;
}

export default function BookingsPage() {
  const [refreshing, setRefreshing] = useState(false);
  // Add refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };
  const { supabase, session, isLoaded } = useSupabase();
  const insets = useSafeAreaInsets();

  const [reservations, setReservations] = useState<
    (Reservation & { car: Car; owner: User })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  const userId = session?.user?.id;

  useEffect(() => {
    if (isLoaded && userId) {
      loadReservations();
    }
  }, [isLoaded, userId, activeTab]);

  const loadReservations = async () => {
    try {
      setLoading(true);

      // Get user's reservations
      const { data: reservationsData, error: reservationsError } =
        await supabase
          .from("reservation")
          .select("*")
          .eq("clientid", userId)
          .order("created_at", { ascending: false });

      if (reservationsError) throw reservationsError;

      if (reservationsData) {
        // Get detailed information for each reservation
        const reservationsWithDetails = await Promise.all(
          reservationsData.map(async (reservation) => {
            // Get car details
            const { data: carData, error: carError } = await supabase
              .from("cars")
              .select("*")
              .eq("uuid", reservation.carid)
              .single();

            // Get owner details
            const { data: ownerData, error: ownerError } = await supabase
              .from("users")
              .select("id, name, firstname, phone, pfp")
              .eq("id", reservation.renterid)
              .single();

            return {
              ...reservation,
              car: carData,
              owner: ownerData,
            };
          })
        );

        // Filter based on active tab
        const filteredReservations = reservationsWithDetails.filter(
          (reservation) => {
            if (activeTab === "active") {
              return reservation.car?.is_available !== false;
            } else {
              return reservation.car?.is_available === false;
            }
          }
        );

        setReservations(filteredReservations);
      }
    } catch (error) {
      console.error("Error loading reservations:", error);
      Alert.alert("Error", "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
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
                .eq("uuid", reservationId);

              if (error) throw error;

              // Refresh reservations
              loadReservations();
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

  const handleContactOwner = (ownerPhone: string) => {
    if (ownerPhone) {
      // This would typically use Linking.openURL(`tel:${ownerPhone}`)
      Alert.alert("Contact Owner", `Call owner at: ${ownerPhone}`);
    } else {
      Alert.alert("Contact", "Phone number not available");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderReservationCard = ({
    item,
  }: {
    item: Reservation & { car: Car; owner: User };
  }) => (
    <TouchableOpacity
      style={styles.reservationCard}
      onPress={() => router.push(`/car/${item.carid}`)}
    >
      {/* Car Image */}
      <View style={styles.imageContainer}>
        {item.car?.images && item.car.images.length > 0 ? (
          <Image
            source={{ uri: item.car.images[0] }}
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
            item.car?.is_available ? styles.statusActive : styles.statusPast,
          ]}
        >
          <Text style={styles.statusText}>
            {item.car?.is_available ? "Active" : "Completed"}
          </Text>
        </View>
      </View>

      {/* Car Info */}
      <View style={styles.carInfo}>
        <Text style={styles.carTitle}>
          {item.car?.brand} {item.car?.model}{" "}
          {item.car?.year && `(${item.car.year})`}
        </Text>

        <View style={styles.carDetails}>
          <Text style={styles.carDetail}>
            <Ionicons name="location" size={12} color="#666" />
            {item.car?.city}, {item.car?.wilaya}
          </Text>
          <Text style={styles.carDetail}>
            <Ionicons name="calendar" size={12} color="#666" />
            Reserved {formatDate(item.created_at)}
          </Text>
        </View>

        <View style={styles.carSpecs}>
          <Text style={styles.carSpec}>{item.car?.fuel_type}</Text>
          <Text style={styles.carSpec}>{item.car?.transmission}</Text>
          <Text style={styles.carSpec}>{item.car?.seats} seats</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.dailyPrice}>DZD {item.car?.daily_price}/day</Text>
        </View>

        {/* Owner Info */}
        <View style={styles.ownerInfo}>
          <View style={styles.ownerAvatarContainer}>
            {item.owner?.pfp ? (
              <Image
                source={{ uri: item.owner.pfp }}
                style={styles.ownerAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.ownerAvatarPlaceholder}>
                <Text style={styles.ownerAvatarInitial}>
                  {item.owner?.firstname?.charAt(0)?.toUpperCase() ||
                    item.owner?.name?.charAt(0)?.toUpperCase() ||
                    "U"}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.ownerDetails}>
            <Text style={styles.ownerName}>
              {item.owner?.firstname && item.owner?.name
                ? `${item.owner.firstname} ${item.owner.name}`
                : "Seyyar User"}
            </Text>
            <Text style={styles.ownerLabel}>Car Owner</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleContactOwner(item.owner?.phone)}
          >
            <Ionicons name="call" size={16} color="#406264" />
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>

          {item.car?.is_available && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelReservation(item.uuid)}
            >
              <Ionicons name="close-circle" size={16} color="#DC2626" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!userId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="log-in-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>Sign In Required</Text>
          <Text style={styles.emptyStateSubtext}>
            Please sign in to view your bookings
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
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#406264" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.tabActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.tabTextActive,
            ]}
          >
            Active Reservations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.tabActive]}
          onPress={() => setActiveTab("past")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "past" && styles.tabTextActive,
            ]}
          >
            Past Reservations
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reservations Grid */}
      {reservations.length > 0 ? (
        <FlatList
          data={reservations}
          renderItem={renderReservationCard}
          keyExtractor={(item) => item.uuid}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.reservationsGrid}
          numColumns={1}
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
              {reservations.length} {activeTab === "active" ? "active" : "past"}{" "}
              reservation{reservations.length !== 1 ? "s" : ""}
            </Text>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name={activeTab === "active" ? "calendar-outline" : "time-outline"}
            size={64}
            color="#ccc"
          />
          <Text style={styles.emptyStateText}>
            {activeTab === "active"
              ? "No Active Reservations"
              : "No Past Reservations"}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {activeTab === "active"
              ? "You don't have any active car reservations"
              : "Your completed reservations will appear here"}
          </Text>
          {activeTab === "active" && (
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/(protected)/(tabs)")}
            >
              <Text style={styles.exploreButtonText}>Explore Cars</Text>
            </TouchableOpacity>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#406264",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#FFFFFF",
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
  reservationsGrid: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontWeight: "500",
  },
  reservationCard: {
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
  statusActive: {
    backgroundColor: "#E8F5E8",
  },
  statusPast: {
    backgroundColor: "#E5E7EB",
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
    marginBottom: 12,
  },
  dailyPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#406264",
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  ownerAvatarContainer: {
    marginRight: 12,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  ownerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#406264",
    justifyContent: "center",
    alignItems: "center",
  },
  ownerAvatarInitial: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  ownerLabel: {
    fontSize: 12,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#406264",
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    color: "#406264",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DC2626",
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  cancelButtonText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
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
  exploreButton: {
    backgroundColor: "#406264",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  exploreButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
