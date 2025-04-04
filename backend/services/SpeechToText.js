import { exec } from "child_process";
import fs from "fs";
import util from "util";
import path from "path";
import { pipeline } from "stream/promises";

const execPromise = util.promisify(exec);

/**
 * Converts an audio file into a text query using a speech-to-text engine.
 * @param {string} audioFilePath - Path to the uploaded audio file.
 * @returns {Promise<string>} - The transcribed text.
 */
export const convertSpeechToText = async (audioFilePath) => {
    try {
        if (!fs.existsSync(audioFilePath)) {
            throw new Error("Audio file not found.");
        }

        console.log(`🎙️ Processing speech-to-text for file: ${audioFilePath}`);

        // 🔹 Example using OpenAI Whisper (Modify for other STT engines)
        const whisperCommand = `whisper ${audioFilePath} --model small --language English --output_format txt`;
        await execPromise(whisperCommand);

        // 🔹 Extract transcribed text from the output file
        const outputTextFile = audioFilePath.replace(path.extname(audioFilePath), ".txt");
        const transcription = fs.readFileSync(outputTextFile, "utf-8").trim();

        // Clean up: Remove generated transcription file
        fs.unlinkSync(outputTextFile);

        console.log(`✅ Transcribed Query: "${transcription}"`);
        return transcription;
    } catch (error) {
        console.error("❌ Speech-to-Text Error:", error.message);
        throw new Error("Speech-to-text conversion failed.");
    }
};