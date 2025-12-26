require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // There isn't a direct listModels on genAI instance in some versions, 
        // but usually it's on a manager or we test a generation.
        // Actually, usually `genAI.getGenerativeModel` is the entry.
        // A quick way is to try a known working model or just print the error details if a specific one fails.

        // Official SDK doesn't always expose listModels simply on client.
        // Let's try to just run a generation with 'gemini-1.5-flash' and see if it works.
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);

        try {
            console.log("Testing gemini-pro...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Hello");
            console.log("Success with gemini-pro:", result2.response.text());
        } catch (e2) {
            console.error("Error with gemini-pro:", e2.message);
        }
    }
}

listModels();
