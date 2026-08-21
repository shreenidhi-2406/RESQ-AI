import axios from 'axios';

/**
 * AI Service Integration Layer for RESQ-AI Node.js Backend.
 * Communicates with the Python FastAPI AI Microservice (http://localhost:8000).
 */

const getAiServiceUrl = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Sends an incident description text snippet to the Python AI service for analysis.
 *
 * @param {string} text - The incident text or report content.
 * @param {string} [incidentId] - Optional incident ID correlation tag.
 * @returns {Promise<{available: boolean, result: object|null, error?: string}>}
 */
export async function analyzeIncident(text, incidentId = null) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return {
            available: false,
            result: null,
            error: 'Invalid input: text snippet is empty'
        };
    }

    const aiServiceUrl = getAiServiceUrl();

    try {
        const response = await axios.post(
            `${aiServiceUrl}/api/ai/analyze`,
            {
                text: text.trim(),
                incident_id: incidentId || undefined
            },
            {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.status === 200 && response.data) {
            return {
                available: true,
                result: response.data
            };
        } else {
            console.warn(`[AIService] Unexpected response status: ${response.status}`);
            return {
                available: false,
                result: null,
                error: 'AI service returned non-200 status'
            };
        }
    } catch (error) {
        const errorMsg = error.response
            ? `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`
            : error.message;

        console.warn(`[AIService] AI analysis unavailable (${errorMsg})`);

        return {
            available: false,
            result: null,
            error: 'AI service unavailable'
        };
    }
}

/**
 * Checks if the Python AI microservice is online and healthy.
 *
 * @returns {Promise<{status: string, models_loaded: boolean}>}
 */
export async function checkAiHealth() {
    const aiServiceUrl = getAiServiceUrl();
    try {
        const response = await axios.get(`${aiServiceUrl}/health`, { timeout: 3000 });
        return response.data;
    } catch (error) {
        return {
            status: 'offline',
            models_loaded: false
        };
    }
}
