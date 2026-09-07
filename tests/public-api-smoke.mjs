globalThis.window = {};
await import("../js/config.js");

const config = globalThis.window?.HIQUANT_CONFIG;
if (!config) {
  throw new Error("Could not load js/config.js.");
}

const marker = `phase5-smoke-${Date.now()}@example.invalid`;
const endpoint = `${config.supabaseUrl}/rest/v1/intakes`;
const headers = {
  apikey: config.supabasePublishableKey,
  Authorization: `Bearer ${config.supabasePublishableKey}`,
  "Content-Type": "application/json"
};

const validPayload = {
  first_name: "Phase",
  last_name: "Five",
  company: "HiQuant integration test",
  email: marker,
  service_category: "strategy_advisory",
  project_description: "Temporary integration test record for the public intake Data API.",
  preferred_contact_method: "email",
  consent_acknowledged: true
};

async function request(url, options) {
  const response = await fetch(url, options);
  const body = await response.text();
  return { status: response.status, body };
}

const inserted = await request(endpoint, {
  method: "POST",
  headers: { ...headers, Prefer: "return=minimal" },
  body: JSON.stringify(validPayload)
});

const selected = await request(
  `${endpoint}?select=id&email=eq.${encodeURIComponent(marker)}`,
  { headers }
);

const protectedWrite = await request(endpoint, {
  method: "POST",
  headers: { ...headers, Prefer: "return=minimal" },
  body: JSON.stringify({ ...validPayload, status: "qualified" })
});

const results = {
  marker,
  anonymousInsert: inserted.status,
  anonymousSelect: selected.status,
  protectedColumnInsert: protectedWrite.status
};

console.log(JSON.stringify(results, null, 2));

if (inserted.status !== 201) {
  throw new Error(`Expected anonymous insert status 201, received ${inserted.status}: ${inserted.body}`);
}

if (selected.status < 400) {
  throw new Error(`Anonymous select unexpectedly succeeded with status ${selected.status}.`);
}

if (protectedWrite.status < 400) {
  throw new Error(`Protected-column insert unexpectedly succeeded with status ${protectedWrite.status}.`);
}
