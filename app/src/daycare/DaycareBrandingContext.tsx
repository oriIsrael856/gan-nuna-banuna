import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ImageSource } from "expo-image";

import { useAuth } from "../auth/AuthContext";
import { CLIENT_CONFIG } from "../config/client.config";
import {
  getDaycareSettings,
  getHeroUrls,
  type DaycareSettings,
} from "../services/daycareSetup.service";
import { Colors as StaticColors } from "../theme/colors";
import { Heroes } from "../theme/heroes";
import type { HeroKey } from "../types/daycareBranding";

export type BrandingColors = {
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  warning: string;
  error: string;
  white: string;
  presentBackground: string;
  presentText: string;
  absentBackground: string;
  absentText: string;
  lateBackground: string;
  lateText: string;
  leftEarlyBackground: string;
  leftEarlyText: string;
  sentBackground: string;
  sentText: string;
  signedBackground: string;
  signedText: string;
  expiredBackground: string;
  expiredText: string;
  draftBackground: string;
  draftText: string;
};

function buildColors(settings: DaycareSettings): BrandingColors {
  return {
    ...StaticColors,
    primary: settings.primaryColor ?? StaticColors.primary,
    secondary: settings.secondaryColor ?? StaticColors.secondary,
    background: settings.backgroundColor ?? StaticColors.background,
    cardBackground: settings.cardBackgroundColor ?? StaticColors.cardBackground,
    textPrimary: settings.textPrimaryColor ?? StaticColors.textPrimary,
    textSecondary: settings.textSecondaryColor ?? StaticColors.textSecondary,
  };
}

interface DaycareBrandingContextValue {
  settings: DaycareSettings;
  colors: BrandingColors;
  heroUrls: Partial<Record<HeroKey, string>>;
  loading: boolean;
  refresh: () => Promise<void>;
  getHeroSource: (key: HeroKey) => ImageSource;
}

const DaycareBrandingContext = createContext<DaycareBrandingContextValue | undefined>(
  undefined,
);

export function DaycareBrandingProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<DaycareSettings | null>(null);
  const [heroUrls, setHeroUrls] = useState<Partial<Record<HeroKey, string>>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const daycareId = profile?.daycareId;
    if (!daycareId) {
      setSettings(null);
      setHeroUrls({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const [nextSettings, nextHeroUrls] = await Promise.all([
      getDaycareSettings(daycareId),
      getHeroUrls(daycareId),
    ]);
    setSettings(nextSettings);
    setHeroUrls(nextHeroUrls);
    setLoading(false);
  }, [profile?.daycareId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const resolvedSettings = useMemo(
    () =>
      settings ?? {
        daycareId: "",
        daycareName: CLIENT_CONFIG.daycareName,
        ownerName: CLIENT_CONFIG.ownerName,
        tagline: CLIENT_CONFIG.homeTagline,
        subtitle: CLIENT_CONFIG.homeSubtitle,
        primaryColor: CLIENT_CONFIG.primaryColor,
        secondaryColor: CLIENT_CONFIG.secondaryColor,
        backgroundColor: CLIENT_CONFIG.backgroundColor,
        cardBackgroundColor: CLIENT_CONFIG.cardBackgroundColor,
        textPrimaryColor: CLIENT_CONFIG.textPrimary,
        textSecondaryColor: CLIENT_CONFIG.textSecondary,
        supportPhone: CLIENT_CONFIG.supportPhone,
        supportEmail: CLIENT_CONFIG.supportEmail,
        logoUrl: null,
        setupCompleted: true,
      },
    [settings],
  );

  const getHeroSource = useCallback(
    (key: HeroKey): ImageSource => {
      const remote = heroUrls[key];
      if (remote) {
        return { uri: remote };
      }
      return Heroes[key];
    },
    [heroUrls],
  );

  const value = useMemo<DaycareBrandingContextValue>(
    () => ({
      settings: resolvedSettings,
      colors: buildColors(resolvedSettings),
      heroUrls,
      loading,
      refresh,
      getHeroSource,
    }),
    [resolvedSettings, heroUrls, loading, refresh, getHeroSource],
  );

  return (
    <DaycareBrandingContext.Provider value={value}>{children}</DaycareBrandingContext.Provider>
  );
}

export function useDaycareBranding(): DaycareBrandingContextValue {
  const context = useContext(DaycareBrandingContext);
  if (!context) {
    throw new Error("useDaycareBranding must be used within DaycareBrandingProvider");
  }
  return context;
}

export function useDaycareColors(): BrandingColors {
  return useDaycareBranding().colors;
}

export function useHero(key: HeroKey): ImageSource {
  return useDaycareBranding().getHeroSource(key);
}

export function useDaycareSettings(): DaycareSettings {
  return useDaycareBranding().settings;
}
