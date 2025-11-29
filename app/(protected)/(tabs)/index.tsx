import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSupabase } from "@/hooks/useSupabase";
import { Ionicons } from "@expo/vector-icons";
import { WILAYAS_CITIES } from "@/consts/wilayas-cities";
import {
  BRAND,
  fuel_type,
  transmission,
  seats,
  doors,
  category,
  yearRange,
  priceRange,
  features,
} from "@/consts/filters";
import { router } from "expo-router";
import { RefreshControl } from "react-native";

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

export default function Page() {
  const { supabase, signOut } = useSupabase();
  const insets = useSafeAreaInsets();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);

  // New filter states
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [selectedTransmission, setSelectedTransmission] = useState("");
  const [selectedSeats, setSelectedSeats] = useState("");
  const [selectedDoors, setSelectedDoors] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYearRange, setSelectedYearRange] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Add this state
  const [refreshing, setRefreshing] = useState(false);

  // Add this function
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCars();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCars();
  }, []);

  useEffect(() => {
    filterCars();
  }, [
    cars,
    searchQuery,
    selectedWilaya,
    selectedCity,
    selectedBrand,
    selectedModel,
    selectedFuelType,
    selectedTransmission,
    selectedSeats,
    selectedDoors,
    selectedCategory,
    selectedYearRange,
    selectedPriceRange,
    selectedFeatures,
  ]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      console.error("Error loading cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCars = () => {
    let filtered = cars;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (car) =>
          car.title?.toLowerCase().includes(query) ||
          car.brand?.toLowerCase().includes(query) ||
          car.model?.toLowerCase().includes(query) ||
          car.description?.toLowerCase().includes(query)
      );
    }

    // Location filters
    if (selectedWilaya)
      filtered = filtered.filter((car) => car.wilaya === selectedWilaya);
    if (selectedCity)
      filtered = filtered.filter((car) => car.city === selectedCity);

    // Car specification filters
    if (selectedBrand)
      filtered = filtered.filter((car) => car.brand === selectedBrand);
    if (selectedModel)
      filtered = filtered.filter((car) => car.model === selectedModel);
    if (selectedFuelType)
      filtered = filtered.filter((car) => car.fuel_type === selectedFuelType);
    if (selectedTransmission)
      filtered = filtered.filter(
        (car) => car.transmission === selectedTransmission
      );
    if (selectedSeats)
      filtered = filtered.filter((car) => car.seats === selectedSeats);
    if (selectedDoors)
      filtered = filtered.filter((car) => car.doors === selectedDoors);
    if (selectedCategory)
      filtered = filtered.filter((car) => car.category === selectedCategory);

    // Year range filter
    if (selectedYearRange) {
      if (selectedYearRange === "Before 2000") {
        filtered = filtered.filter((car) => parseInt(car.year) < 2000);
      } else {
        const [start, end] = selectedYearRange
          .split("-")
          .map((y) => parseInt(y));
        filtered = filtered.filter((car) => {
          const carYear = parseInt(car.year);
          return carYear >= start && carYear <= end;
        });
      }
    }

    // Price range filter
    if (selectedPriceRange) {
      filtered = filtered.filter((car) => {
        const price = parseInt(car.daily_price);
        switch (selectedPriceRange) {
          case "Under 1000 DZD":
            return price < 1000;
          case "1000 - 2000 DZD":
            return price >= 1000 && price <= 2000;
          case "2000 - 3000 DZD":
            return price >= 2000 && price <= 3000;
          case "3000 - 5000 DZD":
            return price >= 3000 && price <= 5000;
          case "5000 - 7000 DZD":
            return price >= 5000 && price <= 7000;
          case "7000+ DZD":
            return price > 7000;
          default:
            return true;
        }
      });
    }

    // Features filter
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter((car) =>
        selectedFeatures.every((feature) => car.features?.includes(feature))
      );
    }

    setFilteredCars(filtered);
  };

  const clearFilters = () => {
    setSelectedWilaya("");
    setSelectedCity("");
    setSearchQuery("");
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedFuelType("");
    setSelectedTransmission("");
    setSelectedSeats("");
    setSelectedDoors("");
    setSelectedCategory("");
    setSelectedYearRange("");
    setSelectedPriceRange("");
    setSelectedFeatures([]);
  };

  const getCitiesForWilaya = () => {
    const wilaya = WILAYAS_CITIES.find((w) => w.wilaya.name === selectedWilaya);
    return wilaya ? wilaya.wilaya.cities : [];
  };

  const getModelsForBrand = () => {
    const brand = BRAND.find((b) => b.label === selectedBrand);
    return brand ? brand.models : [];
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const renderCarItem = ({ item }: { item: Car }) => (
    <TouchableOpacity
      onPress={() => router.push(`/car/${item.uuid}`)}
      style={styles.carCard}
    >
      {item.images && item.images.length > 0 ? (
        <Image
          source={{ uri: item.images[0] }}
          style={styles.carImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.carImagePlaceholder}>
          <Ionicons name="car-sport" size={40} color="#406264" />
        </View>
      )}

      <View style={styles.carInfo}>
        <Text style={styles.carTitle}>
          {item.brand} {item.model} ({item.year})
        </Text>

        <View style={styles.carDetails}>
          <Text style={styles.carDetail}>
            <Ionicons name="location" size={14} color="#666" />
            {item.wilaya}, {item.city}
          </Text>
          <Text style={styles.carDetail}>
            <Ionicons name="speedometer" size={14} color="#666" />
            {item.mileage} km
          </Text>
        </View>

        <View style={styles.carSpecs}>
          <Text style={styles.carSpec}>{item.fuel_type}</Text>
          <Text style={styles.carSpec}>{item.transmission}</Text>
          <Text style={styles.carSpec}>{item.seats} seats</Text>
          <Text style={styles.carSpec}>{item.doors} doors</Text>
        </View>

        {item.features && item.features.length > 0 && (
          <View style={styles.features}>
            {item.features.slice(0, 3).map((feature, index) => (
              <Text key={index} style={styles.feature}>
                {feature}
              </Text>
            ))}
            {item.features.length > 3 && (
              <Text style={styles.feature}>+{item.features.length - 3}</Text>
            )}
          </View>
        )}

        <View style={styles.priceContainer}>
          <Text style={styles.dailyPrice}>DZD {item.daily_price}/day</Text>
          <TouchableOpacity
            onPress={() => router.push(`/car/${item.uuid}`)}
            style={styles.rentButton}
          >
            <Text style={styles.rentButtonText}>Rent Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterSection = (
    title: string,
    data: string[],
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterOptions}>
          {data.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterOption,
                selected === item && styles.filterOptionSelected,
              ]}
              onPress={() => onSelect(selected === item ? "" : item)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selected === item && styles.filterOptionTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#406264" />
        <Text style={styles.loadingText}>Loading cars...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cars by brand, model, or description..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#406264" />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {(selectedWilaya ||
        selectedCity ||
        searchQuery ||
        selectedBrand ||
        selectedModel ||
        selectedFuelType ||
        selectedTransmission ||
        selectedSeats ||
        selectedDoors ||
        selectedCategory ||
        selectedYearRange ||
        selectedPriceRange ||
        selectedFeatures.length > 0) && (
        <View style={styles.activeFilters}>
          <View style={styles.activeFiltersHeader}>
            <Text style={styles.activeFiltersText}>Active filters:</Text>
            <TouchableOpacity
              onPress={clearFilters}
              style={styles.clearAllButton}
            >
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterTags}>
            {selectedWilaya && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  📍 {selectedWilaya}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedWilaya("")}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {selectedCity && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  🏙️ {selectedCity}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedCity("")}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {selectedBrand && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  🚗 {selectedBrand}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedBrand("")}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {selectedModel && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  🚙 {selectedModel}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedModel("")}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {selectedFuelType && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  ⛽ {selectedFuelType}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedFuelType("")}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {selectedTransmission && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  ⚙️ {selectedTransmission}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedTransmission("")}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {selectedFeatures.map((feature) => (
              <View key={feature} style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  ⚡ {feature}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleFeature(feature)}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}

            {searchQuery && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText} numberOfLines={1}>
                  🔍 {searchQuery}
                </Text>
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredCars.length} car{filteredCars.length !== 1 ? "s" : ""}{" "}
          available
        </Text>
      </View>

      {/* Cars List */}
      <FlatList
        data={filteredCars}
        renderItem={renderCarItem}
        keyExtractor={(item) => item.uuid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.carsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#406264"]}
            tintColor="#406264"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No cars found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
      {/* Enhanced Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#406264" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Location Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>📍 Location</Text>
              <Text style={styles.filterSubLabel}>Wilaya</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterOptions}>
                  {WILAYAS_CITIES.map((wilayaData) => (
                    <TouchableOpacity
                      key={wilayaData.wilaya.name}
                      style={[
                        styles.filterOption,
                        selectedWilaya === wilayaData.wilaya.name &&
                          styles.filterOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedWilaya(wilayaData.wilaya.name);
                        setSelectedCity("");
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedWilaya === wilayaData.wilaya.name &&
                            styles.filterOptionTextSelected,
                        ]}
                      >
                        {wilayaData.wilaya.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {selectedWilaya && (
                <>
                  <Text style={styles.filterSubLabel}>
                    City in {selectedWilaya}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterOptions}>
                      {getCitiesForWilaya().map((city) => (
                        <TouchableOpacity
                          key={city}
                          style={[
                            styles.filterOption,
                            selectedCity === city &&
                              styles.filterOptionSelected,
                          ]}
                          onPress={() => setSelectedCity(city)}
                        >
                          <Text
                            style={[
                              styles.filterOptionText,
                              selectedCity === city &&
                                styles.filterOptionTextSelected,
                            ]}
                          >
                            {city}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}
            </View>

            {/* Brand and Model */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>🚗 Brand & Model</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterOptions}>
                  {BRAND.map((brand) => (
                    <TouchableOpacity
                      key={brand.label}
                      style={[
                        styles.filterOption,
                        selectedBrand === brand.label &&
                          styles.filterOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedBrand(brand.label);
                        setSelectedModel("");
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedBrand === brand.label &&
                            styles.filterOptionTextSelected,
                        ]}
                      >
                        {brand.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {selectedBrand && (
                <>
                  <Text style={styles.filterSubLabel}>Model</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterOptions}>
                      {getModelsForBrand().map((model) => (
                        <TouchableOpacity
                          key={model}
                          style={[
                            styles.filterOption,
                            selectedModel === model &&
                              styles.filterOptionSelected,
                          ]}
                          onPress={() => setSelectedModel(model)}
                        >
                          <Text
                            style={[
                              styles.filterOptionText,
                              selectedModel === model &&
                                styles.filterOptionTextSelected,
                            ]}
                          >
                            {model}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}
            </View>

            {/* Car Specifications */}
            {renderFilterSection(
              "⛽ Fuel Type",
              fuel_type,
              selectedFuelType,
              setSelectedFuelType
            )}
            {renderFilterSection(
              "⚙️ Transmission",
              transmission,
              selectedTransmission,
              setSelectedTransmission
            )}
            {renderFilterSection(
              "💺 Seats",
              seats,
              selectedSeats,
              setSelectedSeats
            )}
            {renderFilterSection(
              "🚪 Doors",
              doors,
              selectedDoors,
              setSelectedDoors
            )}
            {renderFilterSection(
              "📋 Category",
              category,
              selectedCategory,
              setSelectedCategory
            )}

            {/* Year Range */}
            {renderFilterSection(
              "📅 Year",
              yearRange,
              selectedYearRange,
              setSelectedYearRange
            )}

            {/* Price Range */}
            {renderFilterSection(
              "💰 Price Range",
              priceRange,
              selectedPriceRange,
              setSelectedPriceRange
            )}

            {/* Features */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>⚡ Features</Text>
              <View style={styles.featuresGrid}>
                {features.map((feature) => (
                  <TouchableOpacity
                    key={feature}
                    style={[
                      styles.featureOption,
                      selectedFeatures.includes(feature) &&
                        styles.featureOptionSelected,
                    ]}
                    onPress={() => toggleFeature(feature)}
                  >
                    <Text
                      style={[
                        styles.featureOptionText,
                        selectedFeatures.includes(feature) &&
                          styles.featureOptionTextSelected,
                      ]}
                    >
                      {feature}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  signOutButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
  },
  filterButton: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  activeFilters: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  activeFiltersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activeFiltersText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
  },
  clearAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 14,
    color: "#dc3545",
    fontWeight: "500",
  },
  filterTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dee2e6",
    maxWidth: "45%",
  },
  filterTagText: {
    fontSize: 12,
    color: "#495057",
    marginRight: 6,
    flexShrink: 1,
  },
  closeButton: {
    padding: 2,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  carsList: {
    padding: 16,
    paddingBottom: 32,
  },
  carCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
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
    fontSize: 14,
    color: "#666",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  carSpecs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  carSpec: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  feature: {
    fontSize: 11,
    color: "#406264",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dailyPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#406264",
  },
  rentButton: {
    backgroundColor: "#406264",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rentButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
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
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  filterSubLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
    marginTop: 12,
  },
  filterOptions: {
    flexDirection: "row",
    gap: 8,
  },
  filterOption: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterOptionSelected: {
    backgroundColor: "#406264",
    borderColor: "#406264",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#666",
  },
  filterOptionTextSelected: {
    color: "#FFFFFF",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureOption: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  featureOptionSelected: {
    backgroundColor: "#406264",
    borderColor: "#406264",
  },
  featureOptionText: {
    fontSize: 12,
    color: "#666",
  },
  featureOptionTextSelected: {
    color: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  clearButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#406264",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
