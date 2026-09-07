(function () {
  "use strict";

  const config = window.HIQUANT_CONFIG;

  if (!config || !config.supabaseUrl || !config.supabasePublishableKey) {
    console.error("HiQuant submission configuration is unavailable.");
    return;
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("The Supabase client library could not be loaded.");
    return;
  }

  window.hiquantSupabase = window.supabase.createClient(
    config.supabaseUrl,
    config.supabasePublishableKey
  );
})();
