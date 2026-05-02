import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from "react-native";

interface Product {
  id: string;
  name: string;
  emoji: string;
  price: string;
  element: string;
  desc: string;
  url: string;
}

const PRODUCTS: Product[] = [
  {
    id: "crystal-amethyst",
    name: "Amethyst Cluster",
    emoji: "💎",
    price: "$28.99",
    element: "水 Water",
    desc: "Calms the mind, enhances intuition. Ideal for meditation and spiritual work.",
    url: "https://www.amazon.com/s?k=amethyst+cluster+natural&tag=destinybridge-20",
  },
  {
    id: "crystal-rose-quartz",
    name: "Rose Quartz Heart",
    emoji: "🩷",
    price: "$18.99",
    element: "火 Fire",
    desc: "Opens the heart chakra. Attracts love and restores trust in relationships.",
    url: "https://www.amazon.com/s?k=rose+quartz+heart+polished&tag=destinybridge-20",
  },
  {
    id: "crystal-citrine",
    name: "Citrine Point",
    emoji: "🌟",
    price: "$24.99",
    element: "土 Earth",
    desc: "The merchant's stone. Attracts wealth, success, and positive energy.",
    url: "https://www.amazon.com/s?k=citrine+crystal+point+natural&tag=destinybridge-20",
  },
  {
    id: "crystal-tiger-eye",
    name: "Tiger Eye Bracelet",
    emoji: "🐯",
    price: "$15.99",
    element: "金 Metal",
    desc: "Grounds scattered energy. Boosts courage and protects against negativity.",
    url: "https://www.amazon.com/s?k=tiger+eye+bracelet+men+women&tag=destinybridge-20",
  },
  {
    id: "crystal-jade",
    name: "Jade Guanyin Pendant",
    emoji: "🍃",
    price: "$35.99",
    element: "木 Wood",
    desc: "Traditional protection. Brings compassion, serenity, and good health.",
    url: "https://www.amazon.com/s?k=jade+guanyin+pendant&tag=destinybridge-20",
  },
  {
    id: "fengshui-bagua",
    name: "Bagua Mirror",
    emoji: "🪞",
    price: "$19.99",
    element: "金 Metal",
    desc: "Classic Feng Shui protection. Deflects negative energy from doors and windows.",
    url: "https://www.amazon.com/s?k=bagua+mirror+feng+shui&tag=destinybridge-20",
  },
  {
    id: "fengshui-fountain",
    name: "Tabletop Water Fountain",
    emoji: "⛲",
    price: "$42.99",
    element: "水 Water",
    desc: "Activates wealth corner. Flowing water brings career opportunities and cash flow.",
    url: "https://www.amazon.com/s?k=tabletop+water+fountain+indoor&tag=destinybridge-20",
  },
  {
    id: "tea-puerh",
    name: "Aged Pu-erh Tea Cake",
    emoji: "🍵",
    price: "$22.99",
    element: "火 Fire",
    desc: "Warms the body. Supports digestion and mindful daily ritual.",
    url: "https://www.amazon.com/s?k=aged+pu+erh+tea+cake&tag=destinybridge-20",
  },
];

const ELEMENT_COLORS: Record<string, string> = {
  "水 Water": "#2196f3",
  "火 Fire": "#f44336",
  "土 Earth": "#ff9800",
  "金 Metal": "#ffc107",
  "木 Wood": "#4caf50",
};

export default function ShopScreen() {
  const openProduct = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Feng Shui Shop</Text>
      <Text style={styles.subtitle}>Curated crystals, home decor, and wellness items for your energy</Text>

      <View style={styles.grid}>
        {PRODUCTS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.productCard}
            onPress={() => openProduct(p.url)}
            activeOpacity={0.8}
          >
            <Text style={styles.productEmoji}>{p.emoji}</Text>
            <Text style={styles.productName}>{p.name}</Text>
            <View style={[styles.elementBadge, { backgroundColor: (ELEMENT_COLORS[p.element] || "#333") + "20" }]}>
              <Text style={[styles.elementText, { color: ELEMENT_COLORS[p.element] || "#999" }]}>
                {p.element}
              </Text>
            </View>
            <Text style={styles.productDesc}>{p.desc}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{p.price}</Text>
              <Text style={styles.buyText}>View on Amazon →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.disclaimer}>
        As an Amazon Associate, DestinyBridge earns from qualifying purchases.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 20, paddingBottom: 60 },
  title: { color: "#d4a240", fontSize: 22, fontWeight: "700", textAlign: "center" },
  subtitle: { color: "#999", fontSize: 13, textAlign: "center", marginTop: 6, marginBottom: 20 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  productCard: {
    width: "47%",
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1a1a1a",
    gap: 8,
  },
  productEmoji: { fontSize: 36, textAlign: "center" },
  productName: { color: "#fff", fontSize: 14, fontWeight: "600", textAlign: "center" },
  elementBadge: {
    alignSelf: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  elementText: { fontSize: 11, fontWeight: "600" },
  productDesc: { color: "#888", fontSize: 12, lineHeight: 17, textAlign: "center" },
  priceRow: { alignItems: "center", gap: 4 },
  price: { color: "#d4a240", fontSize: 15, fontWeight: "700" },
  buyText: { color: "#666", fontSize: 11 },

  disclaimer: {
    color: "#444",
    fontSize: 11,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 16,
  },
});
