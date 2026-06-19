// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Required so Metro can resolve the "exports" field used by @supabase/supabase-js
// (and its sub-packages like @supabase/postgrest-js).
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
