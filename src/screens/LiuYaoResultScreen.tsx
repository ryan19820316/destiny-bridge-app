import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@/navigation/types";
import type { LiuYaoResult } from "@/types";
import { castHexagram } from "@/api";
import Card from "@/components/Card";
import HexagramTable from "@/components/HexagramTable";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type ResultRoute = RouteProp<RootStackParamList, "LiuYaoResult">;

type Lang = "en" | "zh";

const SECTIONS = [
  { key: "section1_hexagramSetup" as const, label: "Hexagram Setup" },
  { key: "section2_yongShenAnalysis" as const, label: "Focus Spirit Analysis" },
  { key: "section3_hexagramProcess" as const, label: "Hexagram Process" },
  { key: "section4_conclusion" as const, label: "Conclusion" },
  { key: "section5_timing" as const, label: "Timing" },
  { key: "section6_risks" as const, label: "Risks & Cautions" },
];

export default function LiuYaoResultScreen() {
  const route = useRoute<ResultRoute>();
  const initialResult = route.params.result;

  const [result, setResult] = useState<LiuYaoResult>(initialResult);
  const [lang, setLang] = useState<Lang>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Partial<Record<Lang, LiuYaoResult>>>({ en: initialResult });

  useEffect(() => {
    castHexagram(route.params.formData, "zh")
      .then((r) => { cache.current["zh"] = r; })
      .catch(() => {});
  }, []);

  const switchLang = useCallback(async (newLang: Lang) => {
    if (cache.current[newLang]) {
      setResult(cache.current[newLang]!);
      setLang(newLang);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await castHexagram(route.params.formData, newLang);
      cache.current[newLang] = r;
      setResult(r);
      setLang(newLang);
    } catch {
      setError("Failed to translate. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [route.params.formData]);

  const traits = useMemo(() => result.yinyaoTraits ?? [], [result.yinyaoTraits]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.hexagramName}>{result.hexagramName}</Text>
      {result.changedHexagramName ? (
        <Text style={styles.changedHexagram}>Changed → {result.changedHexagramName}</Text>
      ) : null}
      <Text style={styles.meta}>
        {result.palace} · {result.palaceElement} · {result.monthBranch} · {result.dayBranch}
      </Text>

      {/* Verdict */}
      <View style={styles.verdictBox}>
        <Text style={styles.verdict}>{result.fortuneVerdict}</Text>
        {result.oneLineSummary ? (
          <Text style={styles.summary}>"{result.oneLineSummary}"</Text>
        ) : null}
      </View>

      {/* Lines table */}
      <HexagramTable lines={result.lines} />

      {/* Focus Spirit */}
      <Card label="Focus Spirit">
        <Text style={styles.yongShenValue}>{result.yongShen}</Text>
        {result.yongShenStrength ? (
          <Text style={styles.yongShenStrength}>{result.yongShenStrength}</Text>
        ) : null}
      </Card>

      {/* Sections */}
      {SECTIONS.map(({ key, label }) => {
        const content = result[key] as string | undefined;
        if (!content) return null;
        return (
          <Card key={key} label={label}>
            <Text style={styles.sectionText}>{content}</Text>
          </Card>
        );
      })}

      {/* Personality */}
      {traits.length > 0 && (
        <Card label="Personality Analysis" borderColor="#d4a24020">
          <View style={styles.traitsRow}>
            {traits.map((t, i) => (
              <View key={i} style={styles.traitChip}>
                <Text style={styles.traitText}>{t}</Text>
              </View>
            ))}
          </View>
          {result.yinyaoAdvice ? (
            <Text style={styles.adviceText}>{result.yinyaoAdvice}</Text>
          ) : null}
        </Card>
      )}

      {/* Language switcher */}
      <LanguageSwitcher lang={lang} loading={loading} onSwitch={switchLang} />
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#d4a240" />
          <Text style={styles.loadingHint}> Translating...</Text>
        </View>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        {new Date(result.timestamp).toLocaleString()}
      </Text>
    </ScrollView>
  );
}

const COLORS = {
  bg: "#0a0a0a",
  card: "#111111",
  border: "#222222",
  gold: "#d4a240",
  text: "#ccc",
  muted: "#999",
  dim: "#666",
  faint: "#444",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 60 },
  hexagramName: { fontSize: 24, fontWeight: "bold", color: COLORS.gold, textAlign: "center" },
  changedHexagram: { color: COLORS.gold, fontSize: 14, textAlign: "center", marginTop: 4 },
  meta: { color: COLORS.dim, fontSize: 11, textAlign: "center", marginTop: 4 },
  verdictBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verdict: { color: COLORS.gold, fontSize: 16, fontWeight: "700" },
  summary: { color: COLORS.muted, fontSize: 13, marginTop: 8, fontStyle: "italic" },
  yongShenValue: { color: "#fff", fontSize: 16, textAlign: "center" },
  yongShenStrength: { color: COLORS.muted, fontSize: 13, textAlign: "center", marginTop: 4 },
  sectionText: { color: COLORS.text, fontSize: 14, lineHeight: 22 },
  traitsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  traitChip: {
    backgroundColor: "#d4a24010",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#d4a24020",
  },
  traitText: { color: COLORS.gold, fontSize: 12 },
  adviceText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  loadingRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 },
  loadingHint: { color: COLORS.dim, fontSize: 12 },
  errorText: { color: "#e05555", fontSize: 12, textAlign: "center", marginTop: 8 },
  timestamp: { color: COLORS.faint, fontSize: 11, textAlign: "center", marginTop: 24 },
});
