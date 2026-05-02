import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface LanguageSwitcherProps {
  lang: "en" | "zh";
  loading: boolean;
  onSwitch: (lang: "en" | "zh") => void;
}

export default function LanguageSwitcher({ lang, loading, onSwitch }: LanguageSwitcherProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, lang === "en" && styles.btnActive]}
        onPress={() => onSwitch("en")}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Switch to English"
      >
        <Text style={[styles.text, lang === "en" && styles.textActive]}>English</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, lang === "zh" && styles.btnActive]}
        onPress={() => onSwitch("zh")}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Switch to Chinese"
      >
        <Text style={[styles.text, lang === "zh" && styles.textActive]}>中文</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 20 },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333333",
  },
  btnActive: { backgroundColor: "#d4a24015", borderColor: "#d4a24040" },
  text: { color: "#999", fontSize: 13 },
  textActive: { color: "#d4a240" },
});
