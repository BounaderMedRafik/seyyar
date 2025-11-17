import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { mockVehicles } from '@/data/mockData';
import { Search, MapPin, Star, Filter } from 'lucide-react-native';

export default function SearchTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Compact', 'SUV', 'Hatchback', 'Sedan'];

  const filteredVehicles = mockVehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || vehicle.category === selectedCategory;

    return matchesSearch && matchesCategory && vehicle.available;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Cars</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by make, model, or location"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.resultsText}>
          {filteredVehicles.length} vehicles available
        </Text>

        <View style={styles.vehicleList}>
          {filteredVehicles.map((vehicle) => (
            <TouchableOpacity key={vehicle.id} style={styles.vehicleCard}>
              <Image source={{ uri: vehicle.images[0] }} style={styles.vehicleImage} />
              <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleName}>
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </Text>
                <View style={styles.locationRow}>
                  <MapPin size={14} color="#8E8E93" />
                  <Text style={styles.locationText}>{vehicle.location}</Text>
                </View>
                <View style={styles.ratingRow}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>
                    {vehicle.rating.toFixed(1)} ({vehicle.reviewCount})
                  </Text>
                </View>
                <View style={styles.features}>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>{vehicle.transmission}</Text>
                  </View>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>{vehicle.seats} seats</Text>
                  </View>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureText}>{vehicle.fuelType}</Text>
                  </View>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{vehicle.pricePerDay.toLocaleString()} DZD</Text>
                  <Text style={styles.priceLabel}>/day</Text>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingLeft: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  categories: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  filterButton: {
    padding: 8,
    marginRight: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    padding: 16,
    paddingBottom: 8,
  },
  vehicleList: {
    padding: 16,
    paddingTop: 8,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  vehicleImage: {
    width: '100%',
    height: 200,
  },
  vehicleDetails: {
    padding: 16,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  features: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  featureTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
