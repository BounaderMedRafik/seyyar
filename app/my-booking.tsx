import { bookings } from '@/data/mockData';
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MyBooking() {
  const renderBooking = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.carName}>{item.carName}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Dates:</Text>
          <Text style={styles.info}>
            {item.fromDate} → {item.toDate}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.price}>{item.price.toLocaleString()} DZD</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text
            style={[
              styles.status,
              item.status === 'upcoming' ? styles.upcoming : styles.completed,
            ]}
          >
            {item.status || 'Upcoming'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 16,
    paddingTop: SCREEN_HEIGHT * 0.1, // 30% of screen height
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
  },
  details: {
    padding: 16,
  },
  carName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  info: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
    minWidth: 80,
  },
  upcoming: {
    backgroundColor: '#E6F9F0',
    color: '#34C759',
  },
  completed: {
    backgroundColor: '#F0F0F0',
    color: '#555',
  },
});
