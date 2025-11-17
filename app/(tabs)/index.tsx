import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { mockVehicles, mockBookings, bookings } from '@/data/mockData';
import {
  Plus,
  Car,
  DollarSign,
  Calendar,
  TrendingUp,
  Search,
} from 'lucide-react-native';

export default function HomeTab() {
  const { user } = useAuth();
  const router = useRouter();
  const isOwner = user?.type === 'owner';

  const userVehicles = mockVehicles.filter((v) => v.ownerId === user?.id);
  const userBookings = mockBookings.filter((b) =>
    isOwner ? b.ownerId === user?.id : b.renterId === user?.id
  );

  const pendingBookings = userBookings.filter((b) => b.status === 'pending');
  const activeBookings = userBookings.filter(
    (b) => b.status === 'active' || b.status === 'approved'
  );

  const totalEarnings = userBookings
    .filter((b) => b.status === 'completed' && isOwner)
    .reduce((sum, b) => sum + b.totalPrice - b.serviceFee, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Bonjour, {user?.name?.split(' ')[0]}
          </Text>
          <Text style={styles.subtitle}>
            {isOwner
              ? 'Gérer vos véhicules'
              : 'Trouver votre prochaine voiture'}
          </Text>
        </View>
      </View>

      {isOwner ? (
        <>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Car size={24} color="#007AFF" />
              <Text style={styles.statValue}>{userVehicles.length}</Text>
              <Text style={styles.statLabel}>Vehicles</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={24} color="#34C759" />
              <Text style={styles.statValue}>{activeBookings.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <DollarSign size={24} color="#FF9500" />
              <Text style={styles.statValue}>
                {totalEarnings.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>DZD Earned</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#FF3B30" />
              <Text style={styles.statValue}>{pendingBookings.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Vehicles</Text>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Vehicle</Text>
              </TouchableOpacity>
            </View>

            {userVehicles.length === 0 ? (
              <View style={styles.emptyState}>
                <Car size={48} color="#C7C7CC" />
                <Text style={styles.emptyText}>No vehicles yet</Text>
                <Text style={styles.emptySubtext}>
                  Add your first vehicle to start earning
                </Text>
              </View>
            ) : (
              userVehicles.map((vehicle) => (
                <View key={vehicle.id} style={styles.vehicleCard}>
                  <Image
                    source={{ uri: vehicle.images[0] }}
                    style={styles.vehicleImage}
                  />
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>
                      {vehicle.make} {vehicle.model}
                    </Text>
                    <Text style={styles.vehiclePrice}>
                      {vehicle.pricePerDay.toLocaleString()} DZD/day
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        vehicle.available
                          ? styles.statusAvailable
                          : styles.statusBusy,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {vehicle.available ? 'Available' : 'Rented'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {pendingBookings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              {pendingBookings.map((booking) => {
                const vehicle = mockVehicles.find(
                  (v) => v.id === booking.vehicleId
                );
                return (
                  <View key={booking.id} style={styles.bookingCard}>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingVehicle}>
                        {vehicle?.make} {vehicle?.model}
                      </Text>
                      <Text style={styles.bookingDates}>
                        {new Date(booking.startDate).toLocaleDateString()} -{' '}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </Text>
                      <Text style={styles.bookingPrice}>
                        {booking.totalPrice.toLocaleString()} DZD
                      </Text>
                    </View>
                    <View style={styles.bookingActions}>
                      <TouchableOpacity style={styles.approveButton}>
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectButton}>
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </>
      ) : (
        <>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Search size={32} color="#007AFF" />
              <Text style={styles.actionTitle}>Find a Car</Text>
              <Text style={styles.actionSubtitle}>Browse nearby vehicles</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/my-booking')} // Navigate to my-booking page
            >
              <Calendar size={32} color="#34C759" />
              <Text style={styles.actionTitle}>My Bookings</Text>
              <Text style={styles.actionSubtitle}>
                {bookings.length} rentals
              </Text>
            </TouchableOpacity>
          </View>

          {activeBookings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Rentals</Text>
              {activeBookings.map((booking) => {
                const vehicle = mockVehicles.find(
                  (v) => v.id === booking.vehicleId
                );
                return (
                  <View key={booking.id} style={styles.rentalCard}>
                    <Image
                      source={{ uri: vehicle?.images[0] }}
                      style={styles.rentalImage}
                    />
                    <View style={styles.rentalInfo}>
                      <Text style={styles.rentalVehicle}>
                        {vehicle?.make} {vehicle?.model}
                      </Text>
                      <Text style={styles.rentalDates}>
                        Until {new Date(booking.endDate).toLocaleDateString()}
                      </Text>
                      <TouchableOpacity style={styles.chatButton}>
                        <Text style={styles.chatButtonText}>Contact Owner</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Vehicles</Text>
            {mockVehicles
              .filter((v) => v.available)
              .slice(0, 3)
              .map((vehicle) => (
                <View key={vehicle.id} style={styles.vehicleCard}>
                  <Image
                    source={{ uri: vehicle.images[0] }}
                    style={styles.vehicleImage}
                  />
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>
                      {vehicle.make} {vehicle.model}
                    </Text>
                    <Text style={styles.vehicleLocation}>
                      {vehicle.location}
                    </Text>
                    <Text style={styles.vehiclePrice}>
                      {vehicle.pricePerDay.toLocaleString()} DZD/day
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleImage: {
    width: 120,
    height: 120,
  },
  vehicleInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  vehicleLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  vehiclePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusAvailable: {
    backgroundColor: '#E8F8F0',
  },
  statusBusy: {
    backgroundColor: '#FFE8E8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingInfo: {
    marginBottom: 12,
  },
  bookingVehicle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  bookingDates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookingPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  rentalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rentalImage: {
    width: 100,
    height: 100,
  },
  rentalInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  rentalVehicle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  rentalDates: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  chatButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
