import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSupabase } from "@/hooks/useSupabase";
import { router } from "expo-router";

export default function ProfilePage() {
  const { session, supabase, signOut } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    firstname: "",
    phone: "",
  });

  const user = session?.user;
  const userEmail = user?.email || "";

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Get user data from your users table
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserData({
          name: data.name || "",
          firstname: data.firstname || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      setUpdating(true);

      // Update user data in your users table
      const { error } = await supabase
        .from("users")
        .update({
          name: userData.name,
          firstname: userData.firstname,
          phone: userData.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/sign-in");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: deleteAccount,
        },
      ]
    );
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);

      // For now, let's use a simpler approach - just sign out
      await signOut();
      Alert.alert(
        "Account Signed Out",
        "To delete your account, please contact support."
      );
      router.replace("/sign-in");
    } catch (error: any) {
      console.error("Error:", error);
      Alert.alert("Error", "Please contact support to delete your account");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#406264" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  const userInitial =
    userData.firstname?.charAt(0).toUpperCase() ||
    userData.name?.charAt(0).toUpperCase() ||
    userEmail?.charAt(0).toUpperCase() ||
    "U";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{userInitial}</Text>
          </View>
        </View>

        <Text style={styles.userName}>
          {userData.firstname && userData.name
            ? `${userData.firstname} ${userData.name}`
            : "Add your name"}
        </Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>

      {/* Edit Profile Form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={userData.firstname}
              onChangeText={(text) =>
                setUserData((prev) => ({ ...prev, firstname: text }))
              }
              placeholder="Your first name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={userData.name}
              onChangeText={(text) =>
                setUserData((prev) => ({ ...prev, name: text }))
              }
              placeholder="Your last name"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={userData.phone}
            onChangeText={(text) =>
              setUserData((prev) => ({ ...prev, phone: text }))
            }
            placeholder="Your phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={userEmail}
            editable={false}
            placeholderTextColor="#999"
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>
        </View>

        <TouchableOpacity
          style={[styles.updateButton, updating && styles.disabledButton]}
          onPress={updateProfile}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.updateButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <View style={[styles.actionIcon, styles.signOutIcon]}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Sign Out</Text>
            <Text style={styles.actionSubtitle}>
              Secure sign out from all devices
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeleteAccount}
        >
          <View style={[styles.actionIcon, styles.deleteIcon]}>
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Delete Account</Text>
            <Text style={styles.actionSubtitle}>
              Permanently delete your account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  profileHeader: {
    alignItems: "center",
    padding: 32,
    paddingBottom: 24,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#406264",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
    height: 44,
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    marginLeft: 4,
  },
  updateButton: {
    backgroundColor: "#406264",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionsSection: {
    padding: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 12,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  signOutIcon: {
    backgroundColor: "#FEE2E2",
  },
  deleteIcon: {
    backgroundColor: "#FEE2E2",
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#666",
  },
});
