import { View, Text, StyleSheet } from "react-native";

interface CardProps {
  label?: string;
  children?: React.ReactNode;
  style?: View["props"]["style"];
  borderColor?: string;
}

export default function Card({ label, children, style, borderColor }: CardProps) {
  return (
    <View style={[styles.card, borderColor ? { borderColor } : undefined, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#222222",
  },
  label: { color: "#d4a240", fontSize: 13, fontWeight: "600", marginBottom: 8 },
});
