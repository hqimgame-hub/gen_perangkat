const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'main.js');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    // Normalize newlines to avoid LF/CRLF confusion
    const lines = data.split(/\r?\n/);

    const startMarker = "function generateLKPD(data) {";
    const endMarker = "function generateKKTP(tps) {";

    const startIdx = lines.findIndex(l => l.trim() === startMarker);
    const endIdx = lines.findIndex(l => l.trim().startsWith("function generateKKTP"));

    if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
        console.log(`Found start at line ${startIdx + 1}`);
        console.log(`Found end at line ${endIdx + 1}`);

        // Ensure we are deleting the Duplicate (the one early in the file)
        // The file has ~1100 lines. The duplicate is around 259.
        if (startIdx > 200 && startIdx < 400) {
            console.log("Deleting duplicate block...");
            // Remove lines from startIdx to endIdx (exclusive of generateKKTP)
            lines.splice(startIdx, endIdx - startIdx);

            // Rejoin with appropriate newline (Vercel/Windows usually handles Git autocrlf, but let's stick to what we found)
            fs.writeFileSync(filePath, lines.join('\n'));
            console.log("Successfully removed duplicate functions.");
        } else {
            console.log("Start index out of expected range for duplicate. Aborting safety check.");
        }
    } else {
        console.log("Markers not found or invalid order.");
        console.log("StartIdx:", startIdx, "EndIdx:", endIdx);
    }
} catch (e) {
    console.error("Error:", e);
}
