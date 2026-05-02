import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile, BirthData } from "@/types";

const PROFILE_KEY = "destinybridge_profile";

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  nickname: "",
  baziData: null,
  preferredTone: "gentle",
  recurringThemes: [],
  languagePreference: "en",
  membershipStatus: "free",
  trialStartDate: null,
  lastChatClearDate: "",
  conversationHistory: [],
  liurenDailyCount: 0,
  lastLiurenDate: "",
  liurenHistory: [],
};

export async function getProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function updateProfile(partial: Partial<UserProfile>): Promise<UserProfile> {
  const current = await getProfile();
  const merged = { ...current, ...partial };
  await saveProfile(merged);
  return merged;
}

export async function saveBirthData(data: BirthData): Promise<void> {
  await updateProfile({ baziData: data });
}

export function getTrialDaysRemaining(profile: UserProfile): number {
  if (!profile.trialStartDate) return 0;
  const start = new Date(profile.trialStartDate);
  const now = new Date();
  const elapsed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(7 - elapsed));
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}
