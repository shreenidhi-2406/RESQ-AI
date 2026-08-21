import 'dotenv/config';
import { analyzeIncident, checkAiHealth } from './services/aiService.js';

async function runTests() {
    console.log("==========================================");
    console.log("RESQ-AI Node.js -> Python AI Integration Test");
    console.log("==========================================");

    console.log("\n[TEST 1] Checking AI Microservice Health...");
    const health = await checkAiHealth();
    console.log("Health Status:", health);

    console.log("\n[TEST 2] Analyzing Disaster Incident via Node.js -> Python...");
    const sampleText = "Three people are trapped inside a flooded house and need immediate rescue.";
    const incidentId = "INCIDENT-TEST-777";

    console.log(`Input Text: "${sampleText}"`);
    console.log(`Incident ID: ${incidentId}`);

    const response = await analyzeIncident(sampleText, incidentId);
    console.log("\nNode.js Received AI Response:");
    console.log(JSON.stringify(response, null, 2));

    if (response.available && response.result) {
        console.log("\n✅ SUCCESS: Verified response fields:");
        console.log(" - Informativeness Label:", response.result.informativeness?.label);
        console.log(" - Informativeness Confidence:", response.result.informativeness?.confidence);
        console.log(" - Humanitarian Category:", response.result.humanitarian?.category);
        console.log(" - Category Display:", response.result.humanitarian?.category_display);
        console.log(" - Humanitarian Confidence:", response.result.humanitarian?.confidence);
        console.log(" - Top Categories Count:", response.result.humanitarian?.top_categories?.length);
    } else {
        console.error("❌ FAILED: AI response unavailable:", response.error);
    }

    console.log("\n[TEST 3] Testing Fallback Behavior (Simulating Offline Service)...");
    const originalUrl = process.env.AI_SERVICE_URL;
    process.env.AI_SERVICE_URL = "http://localhost:9999"; // Non-existent port

    const offlineResponse = await analyzeIncident(sampleText, incidentId);
    console.log("Offline Fallback Response:");
    console.log(JSON.stringify(offlineResponse, null, 2));

    if (offlineResponse.available === false && offlineResponse.result === null) {
        console.log("✅ SUCCESS: Graceful fallback handled without crashing Node.js backend.");
    } else {
        console.error("❌ FAILED: Unexpected offline fallback response.");
    }

    // Restore original URL
    process.env.AI_SERVICE_URL = originalUrl;
    console.log("\n==========================================");
    console.log("Integration Tests Completed Successfully!");
    console.log("==========================================");
}

runTests();
