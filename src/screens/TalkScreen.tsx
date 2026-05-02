import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { chatWithClara, type ChatMessage } from "@/api";
import { getProfile } from "@/store/profile";

export default function TalkScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm Clara. Tell me what's on your mind — I'll use the wisdom of the I Ching to reflect and discuss with you. I hope I can help.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);

    setLoading(true);
    try {
      const profile = await getProfile();
      const reply = await chatWithClara(text, profile as unknown as Record<string, unknown>);
      setMessages([...updated, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([
        ...updated,
        { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, loading, messages]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Talk to Clara</Text>
        <Text style={styles.headerSub}>I Ching wisdom, Zeng Shiqiang style</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              msg.role === "user" ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={msg.role === "user" ? styles.userText : styles.assistantText}>
              {msg.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#d4a240" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask Clara anything..."
          placeholderTextColor="#555"
          multiline
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    alignItems: "center",
  },
  headerTitle: { color: "#d4a240", fontSize: 17, fontWeight: "600" },
  headerSub: { color: "#666", fontSize: 12, marginTop: 2 },
  chat: { flex: 1 },
  chatContent: { padding: 16, gap: 12 },
  bubble: { maxWidth: "82%", borderRadius: 16, padding: 14 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#d4a240" },
  assistantBubble: { alignSelf: "flex-start", backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#333" },
  userText: { color: "#0a0a0a", fontSize: 15, lineHeight: 21 },
  assistantText: { color: "#ccc", fontSize: 15, lineHeight: 21 },
  loadingBubble: { alignSelf: "flex-start", padding: 12 },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    gap: 10,
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#d4a240",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendText: { color: "#0a0a0a", fontWeight: "700", fontSize: 14 },
});
