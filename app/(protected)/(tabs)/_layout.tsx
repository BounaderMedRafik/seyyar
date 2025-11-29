import { Tabs } from "expo-router";
import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSupabase } from "@/hooks/useSupabase";

export default function TabLayout() {
  const { session } = useSupabase();

  const user = session?.user;
  const userAvatar = user?.user_metadata?.avatar_url;
  const userName = user?.user_metadata?.full_name || user?.email;
  const userInitial = userName?.charAt(0).toUpperCase() || "U";

  const HeaderLeft = () => (
    <View style={styles.headerLeft}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>Seyyar</Text>
    </View>
  );

  const HeaderRight = () => (
    <TouchableOpacity style={styles.avatarContainer}>
      {userAvatar ? (
        <Image source={{ uri: userAvatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarInitialContainer}>
          <Text style={styles.avatarInitial}>{userInitial}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#406264",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          height: 85,
          paddingBottom: 25,
          paddingTop: 12,
        },
        headerStyle: styles.header,
        headerTitle: "",
        headerShown: true,
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
        headerLeftContainerStyle: styles.headerLeftContainer,
        headerRightContainerStyle: styles.headerRightContainer,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="my-cars"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "car" : "car-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden tab - completely removed from tab bar */}
      <Tabs.Screen
        name="car/[id]"
        options={{
          headerShown: false,
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" }, // Add this line
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="car/add"
        options={{
          headerShown: false,
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none" }, // Add this line
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerLeftContainer: {
    paddingLeft: 16,
  },
  headerRightContainer: {
    paddingRight: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  appName: {
    color: "#406264",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Inter_700Bold",
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#406264",
  },
  avatarInitialContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#406264",
  },
  avatarInitial: {
    color: "#406264",
    fontWeight: "bold",
    fontSize: 18,
  },
});
