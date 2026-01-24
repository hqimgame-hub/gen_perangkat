const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'main.js');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    const signature = "function generateLKPD(data) {";

    const firstIndex = content.indexOf(signature);
    const secondIndex = content.lastIndexOf(signature);

    if (firstIndex !== -1 && secondIndex !== -1 && firstIndex !== secondIndex) {
        console.log(`Found duplicate blocks.`);
        console.log(`First occurrence at index: ${firstIndex}`);
        console.log(`Second occurrence at index: ${secondIndex}`);

        // We want to keep the Second one (Enhanced), and remove the First one (Legacy).
        // Check content to be sure
        const checkExcerpt = content.substring(firstIndex, firstIndex + 300);
        if (checkExcerpt.includes("getModelActivities(data.model)")) {
            console.log("First occurrence confirmed as Legacy (calls getModelActivities directly). Deleting...");

            // Construct new content: Everything before firstIndex + Everything starting from secondIndex
            const part1 = content.substring(0, firstIndex);
            const part2 = content.substring(secondIndex);

            fs.writeFileSync(filePath, part1 + part2);
            console.log("Legacy block removed. File saved.");
        } else {
            // Maybe the first one is the new one?
            // The new one calls generateTP inside renderLKPD
            console.log("First occurrence layout unclear. Aborting safety check.");
            console.log("Excerpt:", checkExcerpt);
        }
    } else {
        console.log("Did not find two distinct occurrences of the function signature.");
        console.log(`First: ${firstIndex}, Second: ${secondIndex}`);
    }
} catch (e) {
    console.error("Error:", e);
}
