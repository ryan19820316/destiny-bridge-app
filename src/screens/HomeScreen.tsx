import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  onEnter?: () => void;
}

export default function HomeScreen({ onEnter }: Props) {
  const handleCTA = () => {
    onEnter?.();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.heroSection}>
        <Text style={styles.trigramBg}>☰ ☷ ☵ ☲</Text>
        <Text style={styles.hero}>DestinyBridge</Text>
        <Text style={styles.tagline}>
          Ancient Eastern wisdom,{"\n"}your modern life compass
        </Text>
        <Text style={styles.heroDesc}>
          Navigate relationships, career, and well-being with AI-powered I Ching hexagram readings
          rooted in 3,000 years of Chinese tradition.
        </Text>
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.8}
          onPress={handleCTA}
        >
          <Text style={styles.ctaBtnText}>Cast Your First Hexagram →</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>☰ ☷ ☵ ☲ ☳ ☴ ☶ ☱</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* How It Works */}
      <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
      <Text style={styles.sectionTitle}>Three Steps to Insight</Text>

      {[
        { step: "01", title: "Set Your Profile", desc: "Enter your birth data once. We use it for true solar time correction and personalized readings." },
        { step: "02", title: "Cast Your Hexagram", desc: "Toss three coins six times. The ancient algorithm generates your I Ching hexagram." },
        { step: "03", title: "Receive Guidance", desc: "AI interprets the hexagram through the lens of Chinese wisdom — clear, warm, and actionable." },
      ].map((s, i) => (
        <View key={i} style={styles.stepRow}>
          <Text style={styles.stepNum}>{s.step}</Text>
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>{s.title}</Text>
            <Text style={styles.stepDesc}>{s.desc}</Text>
          </View>
        </View>
      ))}

      {/* Features */}
      <Text style={styles.sectionLabel}>WHAT YOU GET</Text>
      <View style={styles.featureGrid}>
        {[
          { icon: "🪙", title: "Liu Yao Divination", desc: "Six-coin I Ching casting for marriage, career, wealth & health." },
          { icon: "💬", title: "Talk to Clara", desc: "Chat with an AI mentor trained in Professor Zeng Shiqiang's I Ching wisdom." },
          { icon: "📅", title: "Daily Guidance", desc: "Personalized food, clothing, travel & wellness tips based on your chart." },
          { icon: "💎", title: "Feng Shui Shop", desc: "Curated crystals and home decor to harmonize your energy." },
        ].map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>DestinyBridge</Text>
        <Text style={styles.footerText}>Rooted in tradition. Powered by AI. Built for you.</Text>
        <Text style={styles.footerCopy}>2026 DestinyBridge. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const gold = "#d4a240";
const muted = "#999";
const bg = "#0a0a0a";
const card = "#111111";
const border = "#1a1a1a";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: bg },
  content: { paddingHorizontal: 24, paddingBottom: 60, alignItems: "center" },

  heroSection: { alignItems: "center", paddingTop: 56, paddingBottom: 32 },
  trigramBg: { color: gold, fontSize: 18, opacity: 0.3, letterSpacing: 12, marginBottom: 16 },
  hero: { fontSize: 36, fontWeight: "bold", color: gold, letterSpacing: 2 },
  tagline: { color: "#ccc", fontSize: 16, marginTop: 8, textAlign: "center", lineHeight: 24 },
  heroDesc: { color: muted, fontSize: 13, marginTop: 16, textAlign: "center", lineHeight: 20, maxWidth: 320 },
  ctaBtn: {
    marginTop: 24,
    backgroundColor: gold,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  ctaBtnText: { color: "#0a0a0a", fontWeight: "700", fontSize: 15 },

  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: border },
  dividerText: { color: gold, fontSize: 12, marginHorizontal: 12, opacity: 0.5, letterSpacing: 6 },

  sectionLabel: { color: gold, fontSize: 11, letterSpacing: 3, marginTop: 24 },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "600", marginTop: 6, marginBottom: 16 },

  stepRow: { flexDirection: "row", width: "100%", marginBottom: 20, alignItems: "flex-start" },
  stepNum: { color: gold, fontSize: 24, fontWeight: "800", width: 44, textAlign: "center", opacity: 0.4 },
  stepBody: { flex: 1 },
  stepTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  stepDesc: { color: muted, fontSize: 13, marginTop: 4, lineHeight: 19 },

  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, width: "100%", marginTop: 12 },
  featureCard: {
    width: "47%",
    backgroundColor: card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: border,
    alignItems: "center",
  },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureTitle: { color: "#fff", fontSize: 13, fontWeight: "600", textAlign: "center", marginBottom: 4 },
  featureDesc: { color: muted, fontSize: 11, lineHeight: 16, textAlign: "center" },

  footer: { alignItems: "center", marginTop: 40, paddingTop: 24 },
  footerBrand: { color: gold, fontSize: 16, fontWeight: "600", letterSpacing: 2 },
  footerText: { color: muted, fontSize: 12, marginTop: 6 },
  footerCopy: { color: "#444", fontSize: 11, marginTop: 4 },
});
