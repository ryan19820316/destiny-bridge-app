import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "@/navigation/types";
import type { DailyGuidance } from "@/types";
import { getProfile } from "@/store/profile";
import { getDailyGuidance } from "@/api";

type TabNav = BottomTabNavigationProp<MainTabParamList>;

const CACHE_KEY = "daily_guidance_cache";

export default function DailyScreen() {
  const navigation = useNavigation<TabNav>();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [guidance, setGuidance] = useState<DailyGuidance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const profile = await getProfile();
    if (!profile.baziData) {
      setHasProfile(false);
      setGuidance(null);
      return;
    }
    setHasProfile(true);

    const today = new Date().toISOString().split("T")[0];

    // Use cached result if it's from today
    try {
      const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached.date === today) {
          setGuidance(cached);
          return;
        }
      }
    } catch {}

    setLoading(true);
    setError(null);
    try {
      const g = await getDailyGuidance(
        profile.baziData.year,
        profile.baziData.month,
        profile.baziData.day,
        profile.baziData.hour,
        profile.baziData.gender,
        profile.baziData.city,
      );
      setGuidance(g);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(g)).catch(() => {});
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load daily guidance";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (hasProfile === null) return null;

  if (!hasProfile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emoji}>📅</Text>
        <Text style={styles.emptyTitle}>Daily Guidance</Text>
        <Text style={styles.emptyText}>
          Set up your birth data to receive personalized daily advice on food, clothing, travel, and wellness.
        </Text>
        <TouchableOpacity
          style={styles.gotoBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.gotoBtnText}>Go to Profile →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d4a240" />
        <Text style={styles.loadingText}>Generating today's guidance...</Text>
      </View>
    );
  }

  if (error || !guidance) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Something went wrong"}</Text>
        <TouchableOpacity onPress={load} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Daily Guidance</Text>
      <Text style={styles.date}>{guidance.date} · {guidance.lunarDate}</Text>

      {/* Energy */}
      <View style={styles.energyCard}>
        <Text style={styles.energyIndex}>{guidance.energyIndex}/100</Text>
        <Text style={styles.energySummary}>{guidance.energySummary}</Text>
      </View>

      {/* Food */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Food</Text>
        <Text style={styles.cardTitle}>{guidance.food.ingredient}</Text>
        <Text style={styles.cardText}>{guidance.food.tip}</Text>
        <Text style={styles.cardSub}>{guidance.food.simpleRecipe}</Text>
      </View>

      {/* Clothing */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Clothing</Text>
        <Text style={styles.cardTitle}>{guidance.clothing.powerColor}</Text>
        <Text style={styles.cardText}>Avoid: {guidance.clothing.avoidColor}</Text>
        <Text style={styles.cardSub}>{guidance.clothing.styleTip}</Text>
      </View>

      {/* Home */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Home</Text>
        <Text style={styles.cardText}>{guidance.home.quickTask}</Text>
        <Text style={styles.cardSub}>{guidance.home.crystalTip}</Text>
      </View>

      {/* Travel */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Travel</Text>
        <Text style={styles.cardTitle}>{guidance.travel.direction}</Text>
        <Text style={styles.cardText}>Best: {guidance.travel.bestTime}</Text>
        <Text style={styles.cardSub}>Avoid: {guidance.travel.avoid}</Text>
      </View>

      {/* Body */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Wellness</Text>
        <Text style={styles.cardText}>{guidance.body.focus}</Text>
        <Text style={styles.cardSub}>{guidance.body.twoMinuteRitual}</Text>
      </View>

      {/* Mantra */}
      <View style={styles.mantraCard}>
        <Text style={styles.mantraText}>"{guidance.mantra}"</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 20, paddingBottom: 60 },
  centered: { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center", padding: 40 },
  emoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: "#d4a240", fontSize: 20, fontWeight: "700", marginBottom: 8 },
  emptyText: { color: "#999", fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  gotoBtn: {
    backgroundColor: "#d4a240",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  gotoBtnText: { color: "#0a0a0a", fontWeight: "700", fontSize: 14 },
  loadingText: { color: "#d4a240", fontSize: 14, marginTop: 16 },
  errorText: { color: "#e05555", fontSize: 14 },
  retryBtn: { marginTop: 12 },
  retryText: { color: "#d4a240", fontSize: 14 },

  title: { color: "#d4a240", fontSize: 22, fontWeight: "700", textAlign: "center" },
  date: { color: "#666", fontSize: 12, textAlign: "center", marginTop: 4, marginBottom: 20 },

  energyCard: {
    backgroundColor: "#d4a24010",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#d4a24030",
    alignItems: "center",
    marginBottom: 16,
  },
  energyIndex: { color: "#d4a240", fontSize: 36, fontWeight: "800" },
  energySummary: { color: "#ccc", fontSize: 14, marginTop: 8, textAlign: "center" },

  card: {
    backgroundColor: "#111111",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  cardLabel: { color: "#d4a240", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
  cardText: { color: "#ccc", fontSize: 14, lineHeight: 20 },
  cardSub: { color: "#888", fontSize: 13, marginTop: 6, fontStyle: "italic" },

  mantraCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#d4a24040",
    alignItems: "center",
  },
  mantraText: { color: "#d4a240", fontSize: 16, fontStyle: "italic", textAlign: "center", lineHeight: 24 },
});
