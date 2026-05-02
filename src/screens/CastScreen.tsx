import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CalcType, Gender, LiuYaoFormData } from "@/types";
import type { CoinTossLine, LiuYaoLineType } from "@/lib/liuyao/types";
import { searchCities, findCity } from "@/lib/solar-time";
import type { CityInfo } from "@/lib/solar-time";
import { castHexagram } from "@/api";
import { getProfile } from "@/store/profile";
import type { RootStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CALC_TYPES: { value: CalcType; label: string; emoji: string }[] = [
  { value: 1, label: "Marriage", emoji: "💕" },
  { value: 2, label: "Career", emoji: "💼" },
  { value: 3, label: "Wealth", emoji: "💰" },
  { value: 4, label: "Specific Q", emoji: "❓" },
  { value: 5, label: "Health", emoji: "🏥" },
  { value: 6, label: "Children", emoji: "👶" },
];

const TOSS_OPTIONS = [
  { type: "oldYang" as const, isYang: true, isMoving: true, label: "Old Yang ○", line: "━━━○" },
  { type: "yang" as const, isYang: true, isMoving: false, label: "Yang —", line: "━━━" },
  { type: "yin" as const, isYang: false, isMoving: false, label: "Yin - -", line: "━ ━" },
  { type: "oldYin" as const, isYang: false, isMoving: true, label: "Old Yin ×", line: "━ ━×" },
];

function isValidQuestion(q: string): boolean {
  const trimmed = q.trim();
  if (trimmed.length < 4) return false;
  // Reject strings made of a single repeated character
  if (/^(.)\1{2,}$/.test(trimmed)) return false;
  // Reject strings with fewer than 2 distinct characters
  const distinct = new Set(trimmed.replace(/\s/g, ""));
  if (distinct.size < 2) return false;
  return true;
}

export default function CastScreen() {
  const navigation = useNavigation<Nav>();

  const [gender, setGender] = useState<Gender>("female");
  const [birthYear, setBirthYear] = useState("1990");
  const [birthMonth, setBirthMonth] = useState("1");
  const [birthDay, setBirthDay] = useState("1");
  const [birthHour, setBirthHour] = useState("12");
  const [calcType, setCalcType] = useState<CalcType>(1);
  const [question, setQuestion] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [birthplaceCity, setBirthplaceCity] = useState("");
  const [cityResults, setCityResults] = useState<CityInfo[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [tossStarted, setTossStarted] = useState(false);
  const [tossStep, setTossStep] = useState(0);
  const [tossLines, setTossLines] = useState<CoinTossLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cityInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Auto-fill from saved profile
  useEffect(() => {
    getProfile().then((p) => {
      if (p.baziData) {
        setGender(p.baziData.gender);
        setBirthYear(String(p.baziData.year));
        setBirthMonth(String(p.baziData.month));
        setBirthDay(String(p.baziData.day));
        setBirthHour(String(p.baziData.hour));
        if (p.baziData.city) {
          setBirthplaceCity(p.baziData.city);
          setCityQuery(p.baziData.city);
        }
      }
    });
  }, []);

  const handleCityInput = (text: string) => {
    setCityQuery(text);
    if (text.trim().length > 0) {
      setCityResults(searchCities(text, 6));
      setShowCityDropdown(true);
      const exactMatch = findCity(text.trim());
      setBirthplaceCity(exactMatch ? exactMatch.nameZh : "");
    } else {
      setCityResults([]);
      setShowCityDropdown(false);
      setBirthplaceCity("");
    }
  };

  const selectCity = (city: CityInfo) => {
    setBirthplaceCity(city.nameZh);
    setCityQuery(city.nameZh);
    setShowCityDropdown(false);
    cityInputRef.current?.blur();
  };

  const validate = (): boolean => {
    if (!birthplaceCity.trim() || !findCity(birthplaceCity.trim())) {
      setError("Please select a valid city from the list");
      return false;
    }
    if (calcType === 4 && !isValidQuestion(question)) {
      setError("Please enter a meaningful question (at least 4 characters, with substance)");
      return false;
    }
    setError(null);
    return true;
  };

  const recordToss = async (tossType: LiuYaoLineType) => {
    const opt = TOSS_OPTIONS.find((o) => o.type === tossType)!;
    const newLine: CoinTossLine = {
      position: tossStep + 1,
      type: tossType,
      isYang: opt.isYang,
      isMoving: opt.isMoving,
    };
    const newLines = [...tossLines, newLine];
    setTossLines(newLines);

    if (tossStep >= 5) {
      setLoading(true);
      setError(null);
      try {
        const formData: LiuYaoFormData = {
          gender,
          birthYear: Number(birthYear),
          birthMonth: Number(birthMonth),
          birthDay: Number(birthDay),
          birthHour: Number(birthHour),
          calcType,
          question: calcType === 4 ? question : undefined,
          mode: "coin",
          lines: newLines,
          birthplaceCity: birthplaceCity || undefined,
        };
        const result = await castHexagram(formData);
        navigation.navigate("LiuYaoResult", { result, formData });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to interpret hexagram");
      } finally {
        setLoading(false);
      }
    } else {
      setTossStep((s) => s + 1);
    }
  };

  const cancelToss = () => {
    setTossStarted(false);
    setTossLines([]);
    setTossStep(0);
    setError(null);
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d4a240" />
        <Text style={styles.loadingText}>Interpreting your hexagram...</Text>
      </View>
    );
  }

  // ---- Toss mode ----
  if (tossStarted) {
    return (
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.tossHeader}>
          <Text style={styles.tossTitle}>Coin Toss</Text>
          <Text style={styles.tossSubtitle}>
            Step {tossStep + 1} of 6 — Toss three coins and select the result
          </Text>
        </View>

        {/* Progress dots */}
        <View style={styles.progressRow}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < tossStep && styles.progressDotDone,
                i === tossStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.tossGrid}>
          {TOSS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.type}
              style={styles.tossBtn}
              onPress={() => recordToss(opt.type)}
              activeOpacity={0.7}
            >
              <Text style={styles.tossLine}>{opt.line}</Text>
              <Text style={styles.tossLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hexagram lines accumulated — bottom (L1) to top (L6) */}
        {tossLines.length > 0 && (
          <View style={styles.linesContainer}>
            <Text style={styles.linesHeading}>Hexagram forming (bottom → top)</Text>
            {[1, 2, 3, 4, 5, 6].map((pos) => {
              const line = tossLines.find((l) => l.position === pos);
              const isCurrent = pos === tossStep + 1;
              return (
                <View key={pos} style={[styles.lineRow, isCurrent && styles.lineRowCurrent]}>
                  <Text style={styles.linePos}>L{pos}</Text>
                  <Text
                    style={[
                      styles.lineText,
                      !line && styles.lineTextEmpty,
                      line?.isMoving && styles.lineTextMoving,
                    ]}
                  >
                    {line
                      ? TOSS_OPTIONS.find((o) => o.type === line.type)?.line || "···"
                      : "━ ━"}
                  </Text>
                  {line && (
                    <Text style={styles.lineTypeTag}>
                      {line.isMoving ? "changing" : "stable"}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={cancelToss}>
          <Text style={styles.cancelText}>Cancel & Restart</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ---- Form mode ----
  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.screenTitle}>Liu Yao Divination</Text>

      {/* Gender */}
      <Text style={styles.label}>Gender</Text>
      <View style={styles.row}>
        {(["male", "female"] as const).map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.toggleBtn, gender === g && styles.toggleActive]}
            onPress={() => setGender(g)}
          >
            <Text style={[styles.toggleText, gender === g && styles.toggleTextActive]}>
              {g === "male" ? "♂ Male" : "♀ Female"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Birth date */}
      <Text style={styles.label}>Birth Date</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={[styles.input, styles.flex2]}
          value={birthYear}
          onChangeText={setBirthYear}
          keyboardType="numeric"
          maxLength={4}
          placeholder="Year"
          placeholderTextColor="#555"
        />
        <TextInput
          style={[styles.input, styles.flex1]}
          value={birthMonth}
          onChangeText={setBirthMonth}
          keyboardType="numeric"
          maxLength={2}
          placeholder="Mo"
          placeholderTextColor="#555"
        />
        <TextInput
          style={[styles.input, styles.flex1]}
          value={birthDay}
          onChangeText={setBirthDay}
          keyboardType="numeric"
          maxLength={2}
          placeholder="Day"
          placeholderTextColor="#555"
        />
      </View>

      {/* Birth hour */}
      <Text style={styles.label}>Birth Hour (0–23)</Text>
      <TextInput
        style={styles.input}
        value={birthHour}
        onChangeText={setBirthHour}
        keyboardType="numeric"
        maxLength={2}
        placeholder="e.g. 12 for noon"
        placeholderTextColor="#555"
      />

      {/* Birthplace city */}
      <Text style={styles.label}>Birthplace</Text>
      <View>
        <TextInput
          ref={cityInputRef}
          style={styles.input}
          value={cityQuery}
          onChangeText={handleCityInput}
          onFocus={() => {
            if (cityResults.length > 0) setShowCityDropdown(true);
          }}
          placeholder="Search city..."
          placeholderTextColor="#555"
        />
        {showCityDropdown && cityResults.length > 0 && (
          <View style={styles.dropdown}>
            {cityResults.map((city) => (
              <TouchableOpacity
                key={city.nameZh}
                style={styles.dropdownItem}
                onPress={() => selectCity(city)}
              >
                <Text style={styles.dropdownText}>{city.nameZh}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Divination type */}
      <Text style={styles.label}>Divination Type</Text>
      <View style={styles.typeGrid}>
        {CALC_TYPES.map((ct) => (
          <TouchableOpacity
            key={ct.value}
            style={[styles.typeBtn, calcType === ct.value && styles.typeBtnActive]}
            onPress={() => { setCalcType(ct.value); setError(null); }}
          >
            <Text style={styles.typeBtnEmoji}>{ct.emoji}</Text>
            <Text style={[styles.typeBtnText, calcType === ct.value && styles.typeBtnTextActive]}>
              {ct.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Question */}
      {calcType === 4 && (
        <>
          <Text style={styles.label}>Your Question</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={question}
            onChangeText={setQuestion}
            placeholder="What would you like to ask? Be specific..."
            placeholderTextColor="#555"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </>
      )}

      {/* Ceremony */}
      <View style={styles.ceremonyBox}>
        <Text style={styles.ceremonyTitle}>☯ Coin Ritual</Text>
        <Text style={styles.ceremonyText}>
          Prepare three identical coins. Quietly center yourself on your question, then toss the
          coins six times — once for each line of the hexagram. Sincerity brings accuracy.
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Start */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => { if (validate()) setTossStarted(true); }}
        activeOpacity={0.8}
      >
        <Text style={styles.submitText}>Cast Hexagram ☯</Text>
      </TouchableOpacity>

      {/* Dismiss dropdown on outside tap */}
      {showCityDropdown && (
        <Pressable
          style={styles.dropdownBackdrop}
          onPress={() => setShowCityDropdown(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 20, paddingBottom: 60 },
  centered: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: { color: "#d4a240", fontSize: 14 },
  screenTitle: {
    color: "#d4a240",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  label: { color: "#aaa", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    fontSize: 16,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  row: { flexDirection: "row", gap: 10 },
  dateRow: { flexDirection: "row", gap: 8 },
  toggleBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#111111",
    alignItems: "center",
  },
  toggleActive: { backgroundColor: "#d4a24015", borderColor: "#d4a24050" },
  toggleText: { color: "#999", fontSize: 15 },
  toggleTextActive: { color: "#d4a240", fontWeight: "600" },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeBtn: {
    width: "30%",
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#111111",
    alignItems: "center",
    gap: 4,
  },
  typeBtnActive: { backgroundColor: "#d4a24015", borderColor: "#d4a24050" },
  typeBtnEmoji: { fontSize: 16 },
  typeBtnText: { color: "#999", fontSize: 12 },
  typeBtnTextActive: { color: "#d4a240", fontWeight: "600" },
  dropdown: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
    zIndex: 10,
  },
  dropdownItem: { paddingVertical: 13, paddingHorizontal: 16 },
  dropdownText: { color: "#ccc", fontSize: 15 },
  dropdownBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  ceremonyBox: {
    backgroundColor: "#111111",
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  ceremonyTitle: {
    color: "#d4a240",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  ceremonyText: {
    color: "#888",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#ff000012",
    borderWidth: 1,
    borderColor: "#ff000030",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  errorText: { color: "#ff6666", fontSize: 13, textAlign: "center" },
  submitBtn: {
    backgroundColor: "#d4a240",
    borderRadius: 14,
    padding: 18,
    marginTop: 22,
    alignItems: "center",
  },
  submitText: { color: "#0a0a0a", fontSize: 17, fontWeight: "700" },

  /* Toss mode */
  tossHeader: { alignItems: "center", marginBottom: 8 },
  tossTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  tossSubtitle: { color: "#999", fontSize: 14, textAlign: "center", marginTop: 8 },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 16,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#222222",
  },
  progressDotDone: { backgroundColor: "#d4a24050" },
  progressDotActive: { backgroundColor: "#d4a240" },
  tossGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  tossBtn: {
    width: "47%",
    backgroundColor: "#111111",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    alignItems: "center",
  },
  tossLine: { color: "#fff", fontSize: 22, marginBottom: 6 },
  tossLabel: { color: "#ccc", fontSize: 14, fontWeight: "500" },
  linesContainer: {
    marginTop: 24,
    backgroundColor: "#111111",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  linesHeading: {
    color: "#888",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  lineRowCurrent: {
    backgroundColor: "#d4a24008",
    borderRadius: 8,
    marginVertical: 2,
  },
  linePos: { color: "#555", fontSize: 12, width: 24, textAlign: "right", fontVariant: ["tabular-nums"] },
  lineText: { color: "#ddd", fontSize: 20 },
  lineTextEmpty: { opacity: 0.15 },
  lineTextMoving: { color: "#ffa500" },
  lineTypeTag: { color: "#666", fontSize: 11, marginLeft: "auto" },
  cancelBtn: {
    marginTop: 24,
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelText: { color: "#666", fontSize: 14 },
});
