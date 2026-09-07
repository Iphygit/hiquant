globalThis.window = {};
await import("../js/config.js");

const config = globalThis.window && globalThis.window.HIQUANT_CONFIG;
if (!config) throw new Error("Could not load js/config.js.");

const headers = {
  apikey: config.supabasePublishableKey,
  Authorization: "Bearer " + config.supabasePublishableKey,
  "Content-Type": "application/json"
};
const endpoint = config.supabaseUrl + "/rest/v1/intakes";

const readResponse = await fetch(endpoint + "?select=id&limit=1", {
  headers
});

const updateResponse = await fetch(
  endpoint + "?id=eq.00000000-0000-0000-0000-000000000000",
  {
    method: "PATCH",
    headers: Object.assign({}, headers, { Prefer: "return=representation" }),
    body: JSON.stringify({
      status: "reviewing",
      admin_notes: "Unauthorized smoke test"
    })
  }
);

const results = {
  anonymousIntakeRead: readResponse.status,
  anonymousIntakeUpdate: updateResponse.status
};

console.log(JSON.stringify(results, null, 2));

if (readResponse.status < 400) {
  throw new Error("Anonymous intake reading unexpectedly succeeded.");
}
if (updateResponse.status < 400) {
  throw new Error("Anonymous intake updating unexpectedly succeeded.");
}
