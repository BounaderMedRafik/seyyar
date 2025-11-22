import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { useSignUp } from "@/hooks/useSignUp";
import { Ionicons } from "@expo/vector-icons";
import { useSupabase } from "@/hooks/useSupabase";

export default function Page() {
  const { isLoaded, signUp, verifyOtp } = useSignUp();
  const { supabase } = useSupabase();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [token, setToken] = useState("");

  const onStep1Continue = () => {
    if (firstName && lastName && phoneNumber) {
      setStep(2);
    }
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      await signUp({
        email,
        password,
      });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const verificationResult = await verifyOtp({
        email,
        token,
      });

      // Get the current session to access the user ID
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        throw sessionError;
      }

      if (session?.user) {
        // Create user in the 'users' table
        const { data, error } = await supabase
          .from("users")
          .insert([
            {
              id: session.user.id,
              name: lastName, // last name
              firstname: firstName, // first name
              email: email,
              phone: phoneNumber,
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) {
          console.error("Error creating user in database:", error);

          // Check if it's a duplicate key error (user already exists)
          if (error.code === "23505") {
            console.log("User already exists in database");
          } else {
            throw error;
          }
        } else {
          console.log("User successfully created in database:", data);
        }

        // Navigate to main app after successful verification and database creation
        router.replace("/(protected)/(tabs)");
      } else {
        throw new Error("No user session found after verification");
      }
    } catch (err) {
      console.error("Verification error:", JSON.stringify(err, null, 2));
      alert("Verification failed. Please check the code and try again.");
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <Image
            source={require("@/assets/images/illus/undraw_forgot-password_nttj.png")}
            style={styles.image}
          />

          <Text style={styles.title}>Verify Your Account</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to your email
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              value={token}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#999"
              onChangeText={(token) => setToken(token)}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !token && styles.buttonDisabled]}
            onPress={onVerifyPress}
            disabled={!token}
          >
            <Text style={styles.buttonText}>Verify & Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step 1: Personal Information
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, styles.progressDotActive]} />
              <Text style={styles.progressText}>Personal Info</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>Account</Text>
            </View>
          </View>

          <Image
            source={require("@/assets/images/illus/undraw_distractions_jmxk.png")}
            style={styles.image}
          />

          <Text style={styles.title}>Personal Information</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.row}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
              >
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  placeholder="John"
                  placeholderTextColor="#999"
                  onChangeText={setFirstName}
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  placeholder="Doe"
                  placeholderTextColor="#999"
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#999"
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!firstName || !lastName || !phoneNumber) &&
                  styles.buttonDisabled,
              ]}
              onPress={onStep1Continue}
              disabled={!firstName || !lastName || !phoneNumber}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/sign-in")}>
              <Text style={styles.linkText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step 2: Account Information
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <Text style={styles.progressText}>Personal Info</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <Text style={styles.progressText}>Account</Text>
          </View>
        </View>

        <Image
          source={require("@/assets/images/illus/undraw_key-insights_ex8y.png")}
          style={styles.image}
        />

        <Text style={styles.title}>Account Information</Text>
        <Text style={styles.subtitle}>Create your login credentials</Text>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={email}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Create a password"
              placeholderTextColor="#999"
              secureTextEntry={true}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              secureTextEntry={true}
              onChangeText={setConfirmPassword}
            />
          </View>

          {password !== confirmPassword && confirmPassword ? (
            <Text style={styles.errorText}>Passwords don't match</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              (!email ||
                !password ||
                !confirmPassword ||
                password !== confirmPassword) &&
                styles.buttonDisabled,
            ]}
            onPress={onSignUpPress}
            disabled={
              !email ||
              !password ||
              !confirmPassword ||
              password !== confirmPassword
            }
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={20} color="#406264" />
          <Text style={styles.backButtonText}>Back to Personal Info</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/sign-in")}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
    resizeMode: "cover",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#406264",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#406264",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 16,
    color: "#666",
  },
  linkText: {
    fontSize: 16,
    color: "#406264",
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  progressStep: {
    alignItems: "center",
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ddd",
    marginBottom: 4,
  },
  progressDotActive: {
    backgroundColor: "#406264",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#ddd",
    marginHorizontal: 8,
    maxWidth: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginTop: 16,
  },
  backButtonText: {
    color: "#406264",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
    marginTop: -8,
  },
});
