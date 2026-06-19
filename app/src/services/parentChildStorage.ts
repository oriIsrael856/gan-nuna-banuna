import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "parent_child_id:";

export async function loadSavedParentChildId(profileId: string): Promise<string | null> {
  return AsyncStorage.getItem(`${KEY_PREFIX}${profileId}`);
}

export async function saveParentChildId(profileId: string, childId: string): Promise<void> {
  await AsyncStorage.setItem(`${KEY_PREFIX}${profileId}`, childId);
}

export async function clearSavedParentChildId(profileId: string): Promise<void> {
  await AsyncStorage.removeItem(`${KEY_PREFIX}${profileId}`);
}
