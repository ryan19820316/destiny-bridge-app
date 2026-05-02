import { View, Text, StyleSheet } from "react-native";
import type { LiuYaoResultLine } from "@/types";

const LIUQIN_EN: Record<string, string> = {
  "父母": "Parents", "官鬼": "Officer", "妻财": "Wealth",
  "子孙": "Children", "兄弟": "Siblings",
};

const LIUSHEN_EN: Record<string, string> = {
  "青龙": "Azure Dragon", "朱雀": "Vermilion Bird", "勾陈": "Stagnation",
  "腾蛇": "Flying Serpent", "白虎": "White Tiger", "玄武": "Black Tortoise",
};

const COLUMNS = [
  { key: "position", label: "Pos", width: 28 },
  { key: "yinyang", label: "Y/Y", width: 36 },
  { key: "branch", label: "Branch", width: 72 },
  { key: "liuqin", label: "Liu Qin", width: 60 },
  { key: "liushen", label: "Liu Shen", width: 80 },
  { key: "shiyin", label: "S/Y", width: 28 },
  { key: "moving", label: "Mov", width: 28 },
] as const;

interface HexagramTableProps {
  lines: LiuYaoResultLine[];
}

export default function HexagramTable({ lines }: HexagramTableProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {COLUMNS.map((c) => (
          <Text key={c.key} style={[styles.th, { width: c.width }]}>
            {c.label}
          </Text>
        ))}
      </View>
      {[...lines].reverse().map((l) => (
        <View
          key={l.position}
          style={[
            styles.row,
            l.isShi ? styles.shiRow : undefined,
            l.isYing ? styles.yingRow : undefined,
          ]}
        >
          <Text style={[styles.td, { width: COLUMNS[0].width }]}>{l.position}</Text>
          <Text style={[styles.td, { width: COLUMNS[1].width }]}>
            {l.isYang ? "⚊" : "⚋"}{l.isMoving ? "○" : ""}
          </Text>
          <Text style={[styles.td, { width: COLUMNS[2].width }]}>
            {l.branch} ({l.branchElement})
          </Text>
          <Text style={[styles.td, { width: COLUMNS[3].width }]}>
            {LIUQIN_EN[l.liuqin] || l.liuqin}
          </Text>
          <Text style={[styles.td, styles.liushen, { width: COLUMNS[4].width }]}>
            {LIUSHEN_EN[l.liushen] || l.liushen}
          </Text>
          <Text style={[styles.td, { width: COLUMNS[5].width }]}>
            {l.isShi ? "S" : l.isYing ? "R" : ""}
          </Text>
          <Text style={[styles.td, { width: COLUMNS[6].width }]}>
            {l.isMoving ? "○" : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111111",
    borderRadius: 16,
    marginTop: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#222222",
  },
  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#222222",
    padding: 8,
  },
  th: { color: "#666", fontSize: 10, textAlign: "center" },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#22222222",
    padding: 8,
    alignItems: "center",
  },
  td: { color: "#ccc", fontSize: 12, textAlign: "center" },
  shiRow: { backgroundColor: "#d4a24008" },
  yingRow: { backgroundColor: "#d4a24005" },
  liushen: { fontSize: 10 },
});
