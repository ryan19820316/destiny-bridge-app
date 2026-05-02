import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomeScreen from "./screens/HomeScreen";
import Navigation from "./navigation";

const WELCOME_KEY = "destinybridge_welcome_shown";

export default function App() {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_KEY).then((val) => {
      setShowWelcome(val !== "true");
    });
    Updates.checkForUpdateAsync()
      .then((u) => {
        if (u.isAvailable) return Updates.fetchUpdateAsync();
      })
      .then(() => Updates.reloadAsync())
      .catch(() => {});
  }, []);

  const handleEnter = async () => {
    await AsyncStorage.setItem(WELCOME_KEY, "true");
    setShowWelcome(false);
  };

  if (showWelcome === null) return null;

  return (
    <>
      <StatusBar style="light" />
      {showWelcome ? <HomeScreen onEnter={handleEnter} /> : <Navigation />}
    </>
  );
}
