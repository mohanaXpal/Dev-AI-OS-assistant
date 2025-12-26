require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testConfig() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro"
    ];

    console.log("--- Starting Model Availability Test ---");

    for (const modelName of modelsToTest) {
        try {
            console.log(`\nTesting: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`✅ SUCCESS: ${modelName}`);
            console.log("Response:", result.response.text());
            return; // Stop on first success
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            // console.log("Error:", error.message.split(']')[1] || error.message); 
        }
    }
    console.log("\n--- All models failed ---");
}

testConfig();
