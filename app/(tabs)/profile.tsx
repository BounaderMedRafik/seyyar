import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { mockSubscriptions } from '@/data/mockData';
import {
  User,
  Mail,
  Phone,
  Star,
  LogOut,
  Crown,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react-native';

export default function ProfileTab() {
  const { user, logout } = useAuth();

  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const handleSubscribe = (subscription: (typeof mockSubscriptions)[0]) => {
    Alert.alert(
      'Subscribe',
      `Subscribe to ${
        subscription.name
      } for ${subscription.price.toLocaleString()} DZD?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            Alert.alert('Success', 'Subscription activated successfully!');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={48} color="#007AFF" />
          </View>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FFD700" fill="#FFD700" />
          <Text style={styles.rating}>{user?.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({user?.reviewCount} reviews)</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {user?.type === 'owner' ? 'Vehicle Owner' : 'Renter'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Mail size={20} color="#666" />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Phone size={20} color="#666" />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user?.phone}</Text>
          </View>
        </View>
      </View>

      {user?.type === 'owner' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upgrade Your Account</Text>
          <Text style={styles.sectionSubtitle}>
            Reduce fees and unlock premium features
          </Text>

          {mockSubscriptions.map((subscription) => (
            <View key={subscription.id} style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionTitleRow}>
                  <Crown size={24} color="#FFD700" />
                  <Text style={styles.subscriptionName}>
                    {subscription.name}
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.subscriptionPrice}>
                    {subscription.price.toLocaleString()} DZD
                  </Text>
                  <Text style={styles.subscriptionPeriod}>
                    /{subscription.type === 'monthly' ? 'month' : 'year'}
                  </Text>
                </View>
              </View>

              <View style={styles.serviceFeeHighlight}>
                <TrendingUp size={18} color="#34C759" />
                <Text style={styles.serviceFeeText}>
                  Only {(subscription.serviceFee * 100).toFixed(0)}% service fee
                </Text>
              </View>

              <View style={styles.featuresList}>
                {subscription.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => handleSubscribe(subscription)}
              >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.infoBox}>
            <Shield size={20} color="#007AFF" />
            <Text style={styles.infoBoxText}>
              Standard service fee is 12% per rental. Upgrade to save more on
              every booking!
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Zap size={20} color="#666" />
          <Text style={styles.actionButtonText}>Highlight My Vehicles</Text>
          <Text style={styles.actionButtonPrice}>500 DZD/vehicle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Seyyar v1.0.0</Text>
        <Text style={styles.footerText}>
          Peer-to-Peer Car Rentals in Algeria
        </Text>
      </View>
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
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  badge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  subscriptionHeader: {
    marginBottom: 16,
  },
  subscriptionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subscriptionName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  subscriptionPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
  },
  subscriptionPeriod: {
    fontSize: 16,
    color: '#666',
  },
  serviceFeeHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F8F0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  serviceFeeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34C759',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 15,
    color: '#1a1a1a',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E8F4FF',
    padding: 16,
    borderRadius: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionButtonPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
});
