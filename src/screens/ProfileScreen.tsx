import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from "react-native";
import type { Gender, BirthData, UserProfile } from "@/types";
import { calculateBazi } from "@/lib/bazi";
import type { BaziResult } from "@/types";
import { searchCities, findCity } from "@/lib/solar-time";
import type { CityInfo } from "@/lib/solar-time";
import { getProfile, saveBirthData, clearProfile, DEFAULT_PROFILE } from "@/store/profile";
import { sendFeedback } from "@/api";
import { encodeProfileCode, decodeProfileCode } from "@/lib/profile-code";

const ELEMENT_COLORS: Record<string, string> = {
  "木": "#4caf50", "火": "#f44336", "土": "#ff9800", "金": "#ffc107", "水": "#2196f3",
};
const ELEMENT_ORDER = ["木", "火", "土", "金", "水"] as const;

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [gender, setGender] = useState<Gender>("female");
  const [birthYear, setBirthYear] = useState("1990");
  const [birthMonth, setBirthMonth] = useState("1");
  const [birthDay, setBirthDay] = useState("1");
  const [birthHour, setBirthHour] = useState("12");
  const [cityQuery, setCityQuery] = useState("");
  const [birthplaceCity, setBirthplaceCity] = useState("");
  const [cityResults, setCityResults] = useState<CityInfo[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [baziResult, setBaziResult] = useState<BaziResult | null>(null);
  const [showFullReport, setShowFullReport] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState<"bug" | "suggestion" | "other">("suggestion");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [importError, setImportError] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: "I'm using DestinyBridge for daily Eastern wellness guidance. Try it: https://destinybridge.app",
      });
    } catch {
      // user cancelled
    }
  };

  const handleExportProfile = () => {
    if (!profile.baziData) return;
    const code = encodeProfileCode(profile.baziData);
    Alert.alert(
      "Profile Code",
      `Share this code to transfer your birth data:\n\n${code}\n\nLong-press to copy.`,
      [{ text: "OK" }]
    );
  };

  const handleImportProfile = async () => {
    const data = decodeProfileCode(importCode.trim());
    if (!data) {
      setImportError(true);
      return;
    }
    setImportError(false);
    await saveBirthData(data);
    setShowImport(false);
    setImportCode("");
    await loadProfile();
  };

  const cityInputRef = useRef<TextInput>(null);

  const loadProfile = useCallback(async () => {
    const p = await getProfile();
    setProfile(p);
    setIsPaid(p.membershipStatus === "active");
    if (p.baziData) {
      setGender(p.baziData.gender);
      setBirthYear(String(p.baziData.year));
      setBirthMonth(String(p.baziData.month));
      setBirthDay(String(p.baziData.day));
      setBirthHour(String(p.baziData.hour));
      setCityQuery(p.baziData.city || "");
      setBirthplaceCity(p.baziData.city || "");
      // Calculate free preview
      const result = calculateBazi(p.baziData);
      setBaziResult(result);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleCityInput = (text: string) => {
    setCityQuery(text);
    if (text.trim().length > 0) {
      setCityResults(searchCities(text, 6));
      setShowCityDropdown(true);
      const em = findCity(text.trim());
      setBirthplaceCity(em ? em.nameZh : "");
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

  const handleSave = async () => {
    const y = Number(birthYear);
    const m = Number(birthMonth);
    const d = Number(birthDay);
    const h = Number(birthHour);
    if (!y || !m || !d || isNaN(h)) return;

    const baziData: BirthData = { year: y, month: m, day: d, hour: h, gender, city: birthplaceCity || undefined };
    await saveBirthData(baziData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await loadProfile();
  };

  const handleClear = async () => {
    await clearProfile();
    setProfile(DEFAULT_PROFILE);
    setBaziResult(null);
    setGender("female");
    setBirthYear("1990");
    setBirthMonth("1");
    setBirthDay("1");
    setBirthHour("12");
    setCityQuery("");
    setBirthplaceCity("");
  };

  const hasData = profile.baziData !== null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Profile</Text>

      {/* ---- Birth Data Form ---- */}
      <Text style={styles.sectionLabel}>BIRTH DATA</Text>

      {hasData && (
        <View style={styles.savedBadge}>
          <Text style={styles.savedBadgeText}>
            Saved: {profile.baziData!.year}-{profile.baziData!.month}-{profile.baziData!.day}{"  "}
            {profile.baziData!.gender === "male" ? "♂" : "♀"}
            {profile.baziData!.city ? ` · ${profile.baziData!.city}` : ""}
          </Text>
        </View>
      )}

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

      <Text style={styles.label}>Birth Date</Text>
      <View style={styles.dateRow}>
        <TextInput style={[styles.input, styles.flex2]} value={birthYear} onChangeText={setBirthYear} keyboardType="numeric" maxLength={4} placeholder="Year" placeholderTextColor="#555" />
        <TextInput style={[styles.input, styles.flex1]} value={birthMonth} onChangeText={setBirthMonth} keyboardType="numeric" maxLength={2} placeholder="Mo" placeholderTextColor="#555" />
        <TextInput style={[styles.input, styles.flex1]} value={birthDay} onChangeText={setBirthDay} keyboardType="numeric" maxLength={2} placeholder="Day" placeholderTextColor="#555" />
      </View>

      <Text style={styles.label}>Birth Hour (0-23)</Text>
      <TextInput style={styles.input} value={birthHour} onChangeText={setBirthHour} keyboardType="numeric" maxLength={2} />

      <Text style={styles.label}>Birthplace<Text style={styles.labelHint}> — for true solar time</Text></Text>
      <View>
        <TextInput ref={cityInputRef} style={styles.input} value={cityQuery} onChangeText={handleCityInput} onFocus={() => { if (cityResults.length > 0) setShowCityDropdown(true); }} placeholder="Search city" placeholderTextColor="#555" />
        {showCityDropdown && cityResults.length > 0 && (
          <View style={styles.dropdown}>
            {cityResults.map((city) => (
              <TouchableOpacity key={city.nameZh} style={styles.dropdownItem} onPress={() => selectCity(city)}>
                <Text style={styles.dropdownText}>{city.nameZh}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveBtnText}>{saved ? "Saved!" : hasData ? "Update" : "Save Birth Data"}</Text>
      </TouchableOpacity>
      {hasData && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>Clear Data</Text>
        </TouchableOpacity>
      )}

      {/* ---- Ba Zi Report ---- */}
      {baziResult && (
        <>
          <Text style={styles.sectionLabel}>BA ZI · FOUR PILLARS</Text>

          {/* Four Pillars — free */}
          <View style={styles.card}>
            <View style={styles.pillarRow}>
              {(["year", "month", "day", "hour"] as const).map((key) => {
                const p = baziResult.chart[key];
                return (
                  <View key={key} style={styles.pillarCell}>
                    <Text style={styles.pillarKey}>{key === "year" ? "年" : key === "month" ? "月" : key === "day" ? "日" : "时"}</Text>
                    <Text style={styles.pillarValue}>{p.stem}{p.branch}</Text>
                    <Text style={[styles.pillarElem, { color: ELEMENT_COLORS[p.stemElement] || "#999" }]}>
                      {p.stemElement}{p.branchElement}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Day Master — free */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Day Master</Text>
            <View style={styles.dmRow}>
              <View style={[styles.dmBadge, { backgroundColor: (ELEMENT_COLORS[baziResult.dayMaster.element] || "#333") + "30" }]}>
                <Text style={[styles.dmStem, { color: ELEMENT_COLORS[baziResult.dayMaster.element] || "#fff" }]}>{baziResult.dayMaster.stem}</Text>
              </View>
              <View>
                <Text style={styles.dmElement}>{baziResult.dayMaster.element} element</Text>
                <Text style={styles.dmStrength}>Strength: {baziResult.dayMaster.strength}</Text>
              </View>
            </View>
          </View>

          {/* Full Report — paid only */}
          {isPaid || showFullReport ? (
            <>
              {/* Five Elements */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Five Elements</Text>
                {ELEMENT_ORDER.map((el) => {
                  const count = baziResult.elements[el];
                  const pct = Math.round((count / 8) * 100);
                  return (
                    <View key={el} style={styles.elementRow}>
                      <Text style={[styles.elementLabel, { color: ELEMENT_COLORS[el] || "#999" }]}>{el}</Text>
                      <View style={styles.elementBarBg}>
                        <View style={[styles.elementBarFill, { width: `${Math.max(pct, 4)}%`, backgroundColor: ELEMENT_COLORS[el] || "#999" }]} />
                      </View>
                      <Text style={styles.elementCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Ten Gods */}
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Ten Gods</Text>
                {baziResult.tenGods.map((tg) => (
                  <View key={tg.pillar} style={styles.tgRow}>
                    <Text style={styles.tgPillar}>{tg.pillar === "year" ? "年" : tg.pillar === "month" ? "月" : tg.pillar === "day" ? "日" : "时"}</Text>
                    <Text style={[styles.tgGod, { color: ELEMENT_COLORS[tg.element] || "#999" }]}>{tg.god}</Text>
                    <Text style={styles.tgElement}>{tg.element}</Text>
                  </View>
                ))}
              </View>

              {/* Favorable / Unfavorable */}
              <View style={styles.row}>
                <View style={[styles.card, styles.flex1]}>
                  <Text style={styles.cardLabel}>Favorable</Text>
                  <View style={styles.elemList}>
                    {baziResult.favorableElements.map((el) => (
                      <View key={el} style={[styles.elemChip, { borderColor: (ELEMENT_COLORS[el] || "#333") + "40" }]}>
                        <Text style={[styles.elemChipText, { color: ELEMENT_COLORS[el] || "#999" }]}>{el}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={[styles.card, styles.flex1]}>
                  <Text style={styles.cardLabel}>Unfavorable</Text>
                  <View style={styles.elemList}>
                    {baziResult.unfavorableElements.map((el) => (
                      <View key={el} style={[styles.elemChip, { borderColor: (ELEMENT_COLORS[el] || "#333") + "25" }]}>
                        <Text style={[styles.elemChipText, { color: "#666" }]}>{el}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {!isPaid && (
                <TouchableOpacity style={styles.closeReportBtn} onPress={() => setShowFullReport(false)}>
                  <Text style={styles.closeReportText}>Hide Full Report</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            /* Paywall */
            <View style={styles.paywallCard}>
              <Text style={styles.paywallEmoji}>🔒</Text>
              <Text style={styles.paywallTitle}>Full Ba Zi Report</Text>
              <Text style={styles.paywallDesc}>
                Unlock complete Five Elements analysis, Ten Gods interpretation, and personalized favorable/unfavorable elements.
              </Text>
              <TouchableOpacity style={styles.upgradeBtn}>
                <Text style={styles.upgradeBtnText}>Upgrade to Clara Membership →</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFullReport(true)}>
                <Text style={styles.previewLink}>Preview once for free</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Membership */}
      <Text style={styles.sectionLabel}>MEMBERSHIP</Text>
      <View style={styles.membershipCard}>
        <Text style={styles.membershipBadge}>{isPaid ? "ACTIVE MEMBER" : "FREE TIER"}</Text>
        <Text style={styles.membershipDesc}>
          {isPaid
            ? "You have full access to all features. Thank you for your support!"
            : "Upgrade for full Ba Zi reports, unlimited divinations, and daily personalized guidance."}
        </Text>
        {!isPaid && (
          <TouchableOpacity style={styles.outlinedBtn} activeOpacity={0.8}>
            <Text style={styles.outlinedBtnText}>Coming Soon</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Feedback */}
      <Text style={styles.sectionLabel}>FEEDBACK</Text>
      <View style={styles.card}>
        <Text style={styles.feedbackIntro}>
          DestinyBridge combines Eastern wisdom with AI to provide comprehensive life guidance. Help us improve — share your thoughts or report issues.
        </Text>

        {feedbackDone ? (
          <View style={styles.feedbackSuccess}>
            <Text style={styles.feedbackSuccessText}>Thank you! Your feedback has been sent.</Text>
            <TouchableOpacity onPress={() => { setFeedbackDone(false); setFeedbackMsg(""); }}>
              <Text style={styles.previewLink}>Send another</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.categoryRow}>
              {(["suggestion", "bug", "other"] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, feedbackCategory === cat && styles.categoryChipActive]}
                  onPress={() => setFeedbackCategory(cat)}
                >
                  <Text style={[styles.categoryText, feedbackCategory === cat && styles.categoryTextActive]}>
                    {cat === "suggestion" ? "Suggestion" : cat === "bug" ? "Bug" : "Other"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.feedbackInput}
              value={feedbackMsg}
              onChangeText={setFeedbackMsg}
              placeholder="Your feedback..."
              placeholderTextColor="#555"
              multiline
              numberOfLines={4}
            />
            {feedbackError && (
              <Text style={styles.feedbackErrorText}>Failed to send. Please try again.</Text>
            )}
            <TouchableOpacity
              style={[styles.saveBtn, (!feedbackMsg.trim() || feedbackSubmitting) && { opacity: 0.4 }]}
              onPress={async () => {
                if (!feedbackMsg.trim() || feedbackSubmitting) return;
                setFeedbackSubmitting(true);
                setFeedbackError(false);
                const ok = await sendFeedback(feedbackMsg.trim(), feedbackCategory);
                if (ok) {
                  setFeedbackDone(true);
                } else {
                  setFeedbackError(true);
                }
                setFeedbackSubmitting(false);
              }}
              disabled={!feedbackMsg.trim() || feedbackSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>
                {feedbackSubmitting ? "Sending..." : "Send Feedback"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Share & Profile Transfer */}
      <Text style={styles.sectionLabel}>SHARE & TRANSFER</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Text style={styles.shareBtnText}>📤 Share DestinyBridge</Text>
        </TouchableOpacity>

        {hasData && (
          <TouchableOpacity style={styles.shareBtn} onPress={handleExportProfile} activeOpacity={0.8}>
            <Text style={styles.shareBtnText}>📋 Export My Profile</Text>
          </TouchableOpacity>
        )}

        {showImport ? (
          <View style={styles.importSection}>
            <Text style={styles.importLabel}>Paste profile code:</Text>
            <TextInput
              style={styles.importInput}
              value={importCode}
              onChangeText={(t) => { setImportCode(t); setImportError(false); }}
              placeholder="Paste code here"
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {importError && (
              <Text style={styles.feedbackErrorText}>Invalid profile code. Please try again.</Text>
            )}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.importBtn, !importCode.trim() && { opacity: 0.4 }]}
                onPress={handleImportProfile}
                disabled={!importCode.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.importBtnText}>Import</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelImportBtn} onPress={() => { setShowImport(false); setImportCode(""); setImportError(false); }}>
                <Text style={styles.cancelImportText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.shareBtn} onPress={() => setShowImport(true)} activeOpacity={0.8}>
            <Text style={styles.shareBtnText}>📥 Import Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const COLORS = { bg: "#0a0a0a", card: "#111111", border: "#1a1a1a", gold: "#d4a240", text: "#ccc", muted: "#999", dim: "#666" };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: "bold", color: COLORS.gold, marginBottom: 8 },
  sectionLabel: { color: COLORS.gold, fontSize: 11, letterSpacing: 3, marginTop: 24, marginBottom: 12 },

  savedBadge: { backgroundColor: "#d4a24012", borderWidth: 1, borderColor: "#d4a24030", borderRadius: 12, padding: 10, marginBottom: 8 },
  savedBadgeText: { color: COLORS.gold, fontSize: 12, textAlign: "center" },

  label: { color: "#aaa", fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 14 },
  labelHint: { color: COLORS.dim, fontWeight: "400" },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: "#333", borderRadius: 12, padding: 14, color: "#fff", fontSize: 16 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  row: { flexDirection: "row", gap: 10 },
  dateRow: { flexDirection: "row", gap: 8 },

  toggleBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#333", backgroundColor: COLORS.card, alignItems: "center" },
  toggleActive: { backgroundColor: "#d4a24015", borderColor: "#d4a24050" },
  toggleText: { color: COLORS.muted, fontSize: 15 },
  toggleTextActive: { color: COLORS.gold, fontWeight: "600" },

  dropdown: { backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#333", borderRadius: 12, marginTop: 4, overflow: "hidden" },
  dropdownItem: { paddingVertical: 13, paddingHorizontal: 16 },
  dropdownText: { color: COLORS.text, fontSize: 15 },

  saveBtn: { backgroundColor: COLORS.gold, borderRadius: 14, padding: 16, marginTop: 20, alignItems: "center" },
  saveBtnText: { color: "#0a0a0a", fontSize: 15, fontWeight: "700" },
  clearBtn: { marginTop: 12, alignItems: "center" },
  clearBtnText: { color: "#e05555", fontSize: 13 },

  // Ba Zi cards
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardLabel: { color: COLORS.gold, fontSize: 12, fontWeight: "600", marginBottom: 12 },

  pillarRow: { flexDirection: "row" },
  pillarCell: { flex: 1, alignItems: "center", paddingVertical: 8, borderRightWidth: 1, borderRightColor: "#1a1a1a" },
  pillarKey: { color: "#555", fontSize: 12, marginBottom: 6 },
  pillarValue: { color: "#fff", fontSize: 18, fontWeight: "600" },
  pillarElem: { fontSize: 12, marginTop: 4 },

  dmRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  dmBadge: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#1a1a1a" },
  dmStem: { fontSize: 28, fontWeight: "700" },
  dmElement: { color: "#ccc", fontSize: 15, fontWeight: "600" },
  dmStrength: { color: "#888", fontSize: 13, marginTop: 2 },

  elementRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  elementLabel: { width: 20, fontSize: 16, fontWeight: "600", textAlign: "center" },
  elementBarBg: { flex: 1, height: 10, backgroundColor: "#1a1a1a", borderRadius: 5, overflow: "hidden" },
  elementBarFill: { height: "100%", borderRadius: 5 },
  elementCount: { color: "#888", fontSize: 13, width: 16, textAlign: "center" },

  tgRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#1a1a1a" },
  tgPillar: { color: "#888", fontSize: 13, width: 50 },
  tgGod: { fontSize: 15, fontWeight: "600", flex: 1 },
  tgElement: { color: "#555", fontSize: 13 },

  elemList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  elemChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  elemChipText: { fontSize: 14, fontWeight: "600" },

  // Paywall
  paywallCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: COLORS.gold, alignItems: "center", marginBottom: 10 },
  paywallEmoji: { fontSize: 40, marginBottom: 12 },
  paywallTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  paywallDesc: { color: COLORS.muted, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 16 },
  upgradeBtn: { backgroundColor: COLORS.gold, borderRadius: 24, paddingHorizontal: 28, paddingVertical: 12 },
  upgradeBtnText: { color: "#0a0a0a", fontWeight: "700", fontSize: 14 },
  previewLink: { color: COLORS.gold, fontSize: 13, marginTop: 12, textDecorationLine: "underline" },
  closeReportBtn: { alignItems: "center", marginTop: 8, marginBottom: 10 },
  closeReportText: { color: COLORS.dim, fontSize: 13 },

  // Membership
  membershipCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.gold, alignItems: "center", marginTop: 4 },
  membershipBadge: { color: COLORS.gold, fontSize: 10, letterSpacing: 3, marginBottom: 8 },
  membershipDesc: { color: COLORS.muted, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 14 },
  outlinedBtn: { borderWidth: 1, borderColor: COLORS.gold, borderRadius: 24, paddingHorizontal: 28, paddingVertical: 10 },
  outlinedBtnText: { color: COLORS.gold, fontWeight: "600", fontSize: 14 },

  // Feedback
  feedbackIntro: { color: COLORS.muted, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  categoryRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  categoryChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "#333", backgroundColor: COLORS.card },
  categoryChipActive: { backgroundColor: "#d4a24015", borderColor: "#d4a24050" },
  categoryText: { color: COLORS.muted, fontSize: 13 },
  categoryTextActive: { color: COLORS.gold, fontWeight: "600" },
  feedbackInput: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: "#333", borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, minHeight: 100, textAlignVertical: "top", marginBottom: 12 },
  feedbackSuccess: { alignItems: "center", paddingVertical: 12 },
  feedbackSuccessText: { color: "#4caf50", fontSize: 14, marginBottom: 8 },
  feedbackErrorText: { color: "#e05555", fontSize: 13, marginBottom: 8 },

  // Share & Import
  shareBtn: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#333", marginBottom: 8 },
  shareBtnText: { color: COLORS.text, fontSize: 14, textAlign: "center" },
  importSection: { marginTop: 4 },
  importLabel: { color: "#aaa", fontSize: 13, marginBottom: 8 },
  importInput: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: "#333", borderRadius: 12, padding: 12, color: "#fff", fontSize: 13, fontFamily: "monospace" },
  importBtn: { flex: 1, backgroundColor: COLORS.gold, borderRadius: 12, padding: 12, alignItems: "center" },
  importBtnText: { color: "#0a0a0a", fontWeight: "700", fontSize: 14 },
  cancelImportBtn: { flex: 1, marginLeft: 8, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#333", alignItems: "center" },
  cancelImportText: { color: COLORS.muted, fontSize: 14 },
});
