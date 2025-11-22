import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSupabase } from "@/hooks/useSupabase";

export default function Page() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email input, 2: Success message
  const [error, setError] = useState("");

  const showError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const showSuccess = () => {
    setStep(2);
  };

  const onResetPassword = async () => {
    if (!email) {
      showError("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Use Supabase's resetPasswordForEmail method
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: "seyyar://reset-password", // Deep link for your app
        }
      );

      if (resetError) {
        throw resetError;
      }

      showSuccess();
    } catch (err: any) {
      console.error("Password reset error:", err);

      // Handle specific error cases
      if (err.message?.includes("rate limit")) {
        showError("Too many attempts. Please try again in a few minutes.");
      } else if (err.message?.includes("not found")) {
        showError("No account found with this email address.");
      } else {
        showError("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onBackToSignIn = () => {
    router.replace("/sign-in");
  };

  // Step 1: Email Input
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Error Toast */}
          {error ? (
            <View style={styles.errorToast}>
              <Ionicons name="warning-outline" size={20} color="#fff" />
              <Text style={styles.errorToastText}>{error}</Text>
            </View>
          ) : null}

          {/* Header Image */}
          <Image
            source={require("@/assets/images/illus/undraw_forgot-password_nttj.png")}
            style={styles.image}
          />

          {/* Title */}
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Don't worry! Enter your email address and we'll send you a link to
            reset your password.
          </Text>

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
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!email || isLoading) && styles.buttonDisabled,
              ]}
              onPress={onResetPassword}
              disabled={!email || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Sending...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {/* Back to Sign In */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackToSignIn}
            >
              <Ionicons name="arrow-back" size={20} color="#406264" />
              <Text style={styles.backButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step 2: Success Message
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Success Image */}
        <Image
          source={require("@/assets/images/illus/undraw_forgot-password_nttj.png")}
          style={styles.image}
        />

        {/* Success Title */}
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a password reset link to{" "}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <Ionicons name="mail-outline" size={24} color="#406264" />
            <Text style={styles.instructionText}>
              Check your inbox for an email from Seyyar
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Ionicons name="link-outline" size={24} color="#406264" />
            <Text style={styles.instructionText}>
              Click the reset link in the email
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <Ionicons name="lock-closed-outline" size={24} color="#406264" />
            <Text style={styles.instructionText}>Create your new password</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.successActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onBackToSignIn}
          >
            <Text style={styles.primaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.secondaryButtonText}>Try another email</Text>
          </TouchableOpacity>
        </View>

        {/* Didn't receive email? */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the email? </Text>
          <TouchableOpacity onPress={onResetPassword}>
            <Text style={styles.resendLink}>Resend</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 32,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#406264",
  },
  form: {
    gap: 20,
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
    shadowOpacity: 0.3,
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginTop: 8,
  },
  backButtonText: {
    color: "#406264",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorToast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  errorToastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  instructions: {
    gap: 16,
    marginBottom: 32,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  successActions: {
    gap: 12,
    marginBottom: 24,
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#406264",
  },
  secondaryButtonText: {
    color: "#406264",
    fontSize: 18,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendLink: {
    fontSize: 14,
    color: "#406264",
    fontWeight: "600",
  },
});
