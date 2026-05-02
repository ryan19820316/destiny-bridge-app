import type { LiuYaoFormData, LiuYaoResult } from "@/types";

export type RootStackParamList = {
  Main: undefined;
  LiuYaoResult: { result: LiuYaoResult; formData: LiuYaoFormData };
  BaziFullReport: undefined;
};

export type MainTabParamList = {
  Cast: undefined;
  Talk: undefined;
  Daily: undefined;
  Shop: undefined;
  Profile: undefined;
};
