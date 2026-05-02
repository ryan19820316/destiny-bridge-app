import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import type { LinkingOptions } from "@react-navigation/native";
import type { RootStackParamList, MainTabParamList } from "./types";
import CastScreen from "../screens/CastScreen";
import TalkScreen from "../screens/TalkScreen";
import DailyScreen from "../screens/DailyScreen";
import ShopScreen from "../screens/ShopScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LiuYaoResultScreen from "../screens/LiuYaoResultScreen";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["destinybridge://", "https://destinybridge.app"],
  config: {
    screens: {
      Main: {
        screens: {
          Cast: "cast",
          Talk: "talk",
          Daily: "daily",
          Shop: "shop",
          Profile: "profile",
        },
      },
      LiuYaoResult: "result",
    },
  },
};

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: "#d4a240",
    background: "#0a0a0a",
    card: "#111111",
    text: "#e5e5e5",
    border: "#222222",
    notification: "#d4a240",
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, string> = {
  Cast: "🪙",
  Talk: "💬",
  Daily: "📅",
  Shop: "💎",
  Profile: "☳",
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
      {TAB_ICONS[label] || "•"}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: "#d4a240",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#111111",
          borderTopColor: "#222222",
          paddingBottom: 8,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Cast" component={CastScreen} options={{ title: "Cast" }} />
      <Tab.Screen name="Talk" component={TalkScreen} options={{ title: "Clara" }} />
      <Tab.Screen name="Daily" component={DailyScreen} options={{ title: "Daily" }} />
      <Tab.Screen name="Shop" component={ShopScreen} options={{ title: "Shop" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer theme={DarkTheme} linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0a0a0a" },
          headerTintColor: "#d4a240",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="LiuYaoResult" component={LiuYaoResultScreen} options={{ title: "Result" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
