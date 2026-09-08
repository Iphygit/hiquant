globalThis.window = {};
await import("../js/config.js");

const config = globalThis.window && globalThis.window.HIQUANT_CONFIG;
if (!config) throw new Error("Could not load js/config.js.");

const headers = { apikey: config.supabasePublishableKey, Authorization: "Bearer " + config.supabasePublishableKey, "Content-Type": "application/json" };
const endpoint = config.supabaseUrl + "/rest/v1/appointments";
const marker = "phase8-smoke-" + Date.now() + "@example.invalid";
const future = new Date();
future.setUTCDate(future.getUTCDate() + 14);
const payload = { client_name: "Phase Eight Smoke Test", client_email: marker, company: "HiQuant API verification", meeting_type: "initial_consultation_30", preferred_date: future.toISOString().slice(0, 10), preferred_time: "10:30:00", timezone: "America/New_York", consultation_topic: "Verify anonymous appointment request security", client_notes: "Synthetic test record; remove after verification." };

const createResponse = await fetch(endpoint, { method: "POST", headers: Object.assign({}, headers, { Prefer: "return=minimal" }), body: JSON.stringify(payload) });
const readResponse = await fetch(endpoint + "?client_email=eq." + encodeURIComponent(marker) + "&select=id", { headers });
const protectedWriteResponse = await fetch(endpoint, { method: "POST", headers: Object.assign({}, headers, { Prefer: "return=minimal" }), body: JSON.stringify(Object.assign({}, payload, { client_email: "protected-" + marker, status: "confirmed", admin_notes: "Anonymous protected write" })) });
const updateResponse = await fetch(endpoint + "?client_email=eq." + encodeURIComponent(marker), { method: "PATCH", headers: Object.assign({}, headers, { Prefer: "return=representation" }), body: JSON.stringify({ status: "confirmed", admin_notes: "Anonymous update" }) });

const results = { marker, anonymousCreate: createResponse.status, anonymousRead: readResponse.status, anonymousProtectedWrite: protectedWriteResponse.status, anonymousUpdate: updateResponse.status };
console.log(JSON.stringify(results, null, 2));
if (createResponse.status !== 201) throw new Error("Anonymous appointment creation did not return HTTP 201.");
if (readResponse.status < 400) throw new Error("Anonymous appointment reading unexpectedly succeeded.");
if (protectedWriteResponse.status < 400) throw new Error("Anonymous protected-field writing unexpectedly succeeded.");
if (updateResponse.status < 400) throw new Error("Anonymous appointment updating unexpectedly succeeded.");
