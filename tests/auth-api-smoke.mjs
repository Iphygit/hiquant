globalThis.window = {};
await import("../js/config.js");

const config = globalThis.window && globalThis.window.HIQUANT_CONFIG;
if (!config) throw new Error("Could not load js/config.js.");

const authResponse = await fetch(
  config.supabaseUrl + "/auth/v1/token?grant_type=password",
  {
    method: "POST",
    headers: {
      apikey: config.supabasePublishableKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "phase6-invalid-" + Date.now() + "@example.invalid",
      password: "invalid-password-for-smoke-test"
    })
  }
);

const membershipResponse = await fetch(
  config.supabaseUrl + "/rest/v1/admin_profiles?select=user_id",
  {
    headers: {
      apikey: config.supabasePublishableKey,
      Authorization: "Bearer " + config.supabasePublishableKey
    }
  }
);
const membershipBody = await membershipResponse.json();

const results = {
  invalidPasswordLogin: authResponse.status,
  anonymousAdminMembershipRead: membershipResponse.status,
  anonymousAdminMembershipRows: Array.isArray(membershipBody) ? membershipBody.length : null
};

console.log(JSON.stringify(results, null, 2));

if (authResponse.status < 400) {
  throw new Error("Invalid administrator credentials unexpectedly created a session.");
}
const membershipDenied = membershipResponse.status >= 400;
const membershipEmpty =
  membershipResponse.status === 200 &&
  Array.isArray(membershipBody) &&
  membershipBody.length === 0;

if (!membershipDenied && !membershipEmpty) {
  throw new Error("Anonymous access unexpectedly exposed administrator membership.");
}
