import { evaluateDisasterRelevance } from '../utils/disasterFilter.js';

const MUST_REJECT_CASES = [
    { title: "Onion prices surge across Tamil Nadu", expectedReason: "commodity_price" },
    { title: "Vegetable prices rise ahead of festival", expectedReason: "commodity_price" },
    { title: "Sensex rises after positive market sentiment", expectedReason: "general_business" },
    { title: "New movie releases this weekend", expectedReason: "entertainment" },
    { title: "Local team wins championship", expectedReason: "sports" },
    { title: "Government announces new economic policy", expectedReason: "politics_or_policy" },
    { title: "Heavy rain expected in Tamil Nadu tomorrow", expectedReason: "insufficient_disaster_context" },
    { title: "Rain affects onion production and prices increase", expectedReason: "commodity_price_context" },
    { title: "Business owners discuss rising costs", expectedReason: "general_business" }
];

const MUST_ACCEPT_CASES = [
    { title: "Flooding in Tamil Nadu forces hundreds to evacuate", expectedType: "flood" },
    { title: "Cyclone damages houses along coastal districts", expectedType: "cyclone" },
    { title: "Landslide blocks highway; rescue teams deployed", expectedType: "landslide" },
    { title: "Five injured after building collapse", expectedType: "structural_accidents" },
    { title: "NDRF rescues residents trapped by floodwaters", expectedType: "emergency_impact" },
    { title: "SACHET issues severe cyclone warning", expectedType: "emergency_impact" },
    { title: "Bridge damaged after flash flood", expectedType: "flood" },
    { title: "Families seek drinking water after flood", expectedType: "flood" },
    { title: "Several people missing after landslide", expectedType: "landslide" }
];

console.log("=== RUNNING ADVERSARIAL DISASTER RELEVANCE FILTER TESTS ===\n");

let passed = 0;
let failed = 0;

console.log("--- TEST GROUP 1: MUST REJECT ADVERSARIAL CASES ---");
for (const testCase of MUST_REJECT_CASES) {
    const result = evaluateDisasterRelevance(testCase.title, "", "TestInput");
    if (!result.isRelevant) {
        console.log(`[PASS] REJECTED: "${testCase.title}" | Reason: ${result.reason}`);
        passed++;
    } else {
        console.error(`[FAIL] EXPECTED REJECT BUT ACCEPTED: "${testCase.title}"`);
        failed++;
    }
}

console.log("\n--- TEST GROUP 2: MUST ACCEPT GENUINE DISASTER CASES ---");
for (const testCase of MUST_ACCEPT_CASES) {
    const result = evaluateDisasterRelevance(testCase.title, "", "TestInput");
    if (result.isRelevant) {
        console.log(`[PASS] ACCEPTED: "${testCase.title}" | Type: ${result.disasterType}`);
        passed++;
    } else {
        console.error(`[FAIL] EXPECTED ACCEPT BUT REJECTED: "${testCase.title}" | Reason: ${result.reason}`);
        failed++;
    }
}

console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${MUST_REJECT_CASES.length + MUST_ACCEPT_CASES.length} TESTS ===`);

if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
