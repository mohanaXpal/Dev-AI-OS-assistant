require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testQuota() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro-latest",
        "gemini-flash-latest"
    ];

    console.log("--- Testing Quota for Models ---");

    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`✅ SUCCESS: ${modelName}`);
            return;
        } catch (error) {
            console.log(`❌ FAILED: ${modelName} - ${error.message.includes('429') ? 'QUOTA EXCEEDED' : error.message}`);
        }
    }
}

testQuota();
