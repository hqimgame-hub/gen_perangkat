const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'main.js');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find the last occurrence of '}'
    const lastBraceIndex = content.lastIndexOf('}');

    if (lastBraceIndex !== -1) {
        console.log(`Found last brace at index ${lastBraceIndex}. Truncating file...`);
        // Keep everything up to and including the brace
        const cleanContent = content.substring(0, lastBraceIndex + 1);

        fs.writeFileSync(filePath, cleanContent);
        console.log("File truncated successfully.");
    } else {
        console.error("Could not find any closing brace in the file!");
    }
} catch (e) {
    console.error("Error:", e);
}
