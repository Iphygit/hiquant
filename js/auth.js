(function () {
  "use strict";

  function client() {
    if (!window.hiquantSupabase) {
      throw new Error("Authentication service unavailable");
    }
    return window.hiquantSupabase;
  }

  async function authorizedAdmin() {
    const supabase = client();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { authorized: false, reason: "session" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("user_id, full_name, role, is_active")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .eq("is_active", true)
      .maybeSingle();

    if (profileError) {
      throw new Error("Administrator verification failed");
    }

    if (!profile) {
      return {
        authorized: false,
        reason: "membership",
        user: userData.user
      };
    }

    return {
      authorized: true,
      user: userData.user,
      profile
    };
  }

  async function signOut() {
    const { error } = await client().auth.signOut({ scope: "local" });
    if (error) throw error;
  }

  function pageUrl(fileName) {
    return new URL(fileName, window.location.href).href;
  }

  window.hiquantAuth = Object.freeze({
    authorizedAdmin,
    client,
    pageUrl,
    signOut
  });
})();
