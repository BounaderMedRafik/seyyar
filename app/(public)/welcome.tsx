import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const DotGridPattern = () => {
  return (
    <View style={styles.dotGridContainer}>
      {[...Array(15)].map((_, rowIndex) => (
        <View key={rowIndex} style={styles.dotGridRow}>
          {[...Array(10)].map((_, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.dot,
                {
                  opacity: 0.05 + colIndex * 0.01 + rowIndex * 0.005,
                  transform: [
                    { scale: 0.8 + colIndex * 0.02 + rowIndex * 0.01 },
                  ],
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

export default function Page() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Grid Pattern Background */}
      <DotGridPattern />

      {/* Gradient Overlay */}
      <View style={styles.gradientOverlay} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Seyyar</Text>
          <Text style={styles.subtitle}>
            Rent cars from local owners or earn money by sharing your vehicle.
            Affordable, flexible, and trusted peer-to-peer car sharing.
          </Text>
        </View>

        {/* Main Auth Buttons */}
        <View style={styles.authButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/sign-up")}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/sign-in")}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        {/* <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.divider} />
                </View> */}

        {/* Social Login Buttons */}
        {/* <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={20} color="#4267B2" />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View> */}

        {/* Footer Links */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{" "}
            <Text style={styles.link}>Terms of Service</Text> and acknowledge
            our <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    fontFamily: "Poppins",

    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 12, // Optional: if you want rounded corners
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    opacity: 0.75,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  authButtons: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: "#406264",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#406264",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#406264",
    shadowColor: "#406264",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    color: "#406264",
    backgroundColor: "#fff",

    fontSize: 18,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e1e1e1",
  },
  dividerText: {
    color: "#666",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 40,
  },
  socialButton: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  socialButtonText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
  link: {
    color: "#406264",
    textDecorationLine: "underline",
  },

  dotGridContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column",
    justifyContent: "space-around",
  },
  dotGridRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: "#406264",
    borderRadius: 2,
  },

  gradientOverlay: {
    position: "absolute",
    zIndex: -1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
