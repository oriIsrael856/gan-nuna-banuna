import { Redirect } from "expo-router";
import type { Href } from "expo-router";

export default function SetupIndex() {
  return <Redirect href={"/setup/daycare-details" as Href} />;
}
