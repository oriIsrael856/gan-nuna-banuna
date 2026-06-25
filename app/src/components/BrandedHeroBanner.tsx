import React from "react";

import { HeroBanner } from "./HeroBanner";
import { useHero } from "../daycare/DaycareBrandingContext";
import type { HeroKey } from "../types/daycareBranding";

type HeroBannerProps = React.ComponentProps<typeof HeroBanner>;

interface BrandedHeroBannerProps extends Omit<HeroBannerProps, "source"> {
  heroKey: HeroKey;
}

export function BrandedHeroBanner({ heroKey, ...rest }: BrandedHeroBannerProps) {
  const source = useHero(heroKey);
  return <HeroBanner source={source} {...rest} />;
}
