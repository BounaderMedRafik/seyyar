import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { mockMessages, mockBookings, mockVehicles, mockUsers } from '@/data/mockData';
import { Send, ArrowLeft } from 'lucide-react-native';

export default function MessagesTab() {
  const { user } = useAuth();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const userBookings = mockBookings.filter((b) =>
    user?.type === 'owner' ? b.ownerId === user?.id : b.renterId === user?.id
  );

  const getConversationMessages = (bookingId: string) => {
    return mockMessages.filter((m) => m.bookingId === bookingId);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedBookingId) {
      setNewMessage('');
    }
  };

  if (selectedBookingId) {
    const booking = mockBookings.find((b) => b.id === selectedBookingId);
    const vehicle = mockVehicles.find((v) => v.id === booking?.vehicleId);
    const otherUserId = user?.type === 'owner' ? booking?.renterId : booking?.ownerId;
    const otherUser = mockUsers.find((u) => u.id === otherUserId);
    const messages = getConversationMessages(selectedBookingId);

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedBookingId(null)} style={styles.backButton}>
            <ArrowLeft size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{otherUser?.name}</Text>
            <Text style={styles.chatHeaderVehicle}>
              {vehicle?.make} {vehicle?.model}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.map((message) => {
            const isMine = message.senderId === user?.id;
            return (
              <View
                key={message.id}
                style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}
              >
                <Text style={[styles.messageText, isMine && styles.myMessageText]}>
                  {message.text}
                </Text>
                <Text style={[styles.messageTime, isMine && styles.myMessageTime]}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <ScrollView style={styles.conversationList}>
        {userBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              {user?.type === 'owner'
                ? 'Messages will appear when you receive booking requests'
                : 'Messages will appear when you book a vehicle'}
            </Text>
          </View>
        ) : (
          userBookings.map((booking) => {
            const vehicle = mockVehicles.find((v) => v.id === booking.vehicleId);
            const otherUserId = user?.type === 'owner' ? booking.renterId : booking.ownerId;
            const otherUser = mockUsers.find((u) => u.id === otherUserId);
            const messages = getConversationMessages(booking.id);
            const lastMessage = messages[messages.length - 1];
            const unreadCount = messages.filter((m) => !m.read && m.senderId !== user?.id).length;

            return (
              <TouchableOpacity
                key={booking.id}
                style={styles.conversationItem}
                onPress={() => setSelectedBookingId(booking.id)}
              >
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{otherUser?.name.charAt(0)}</Text>
                </View>
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{otherUser?.name}</Text>
                    {lastMessage && (
                      <Text style={styles.conversationTime}>
                        {new Date(lastMessage.timestamp).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.conversationVehicle}>
                    {vehicle?.make} {vehicle?.model}
                  </Text>
                  {lastMessage && (
                    <Text style={styles.conversationPreview} numberOfLines={1}>
                      {lastMessage.text}
                    </Text>
                  )}
                </View>
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
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
  },
  conversationList: {
    flex: 1,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  conversationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  conversationVehicle: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chatHeaderVehicle: {
    fontSize: 14,
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9E9EB',
  },
  messageText: {
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#8E8E93',
  },
  myMessageTime: {
    color: '#E8F4FF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
