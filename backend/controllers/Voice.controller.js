import { convertSpeechToText } from "../services/SpeechToText.js";

/**
 * Handles voice input and converts it to text.
 */
export const processVoiceInput = async (req, res) => {
    try {
        // 🔹 Step 1: Check if audio file is provided
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided." });
        }

        console.log("🎙️ Received voice input... Processing...");

        // 🔹 Step 2: Convert speech to text
        const textQuery = await convertSpeechToText(req.file.path);

        if (!textQuery) {
            return res.status(500).json({ error: "Failed to convert speech to text." });
        }

        console.log(`📝 Converted Text: ${textQuery}`);

        // 🔹 Step 3: Return the converted text
        return res.status(200).json({ success: true, query: textQuery });

    } catch (error) {
        console.error("❌ Voice processing error:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};