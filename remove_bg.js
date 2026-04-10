const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

async function processAll() {
    const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.png'));
    
    for (const file of files) {
        console.log(`Processing ${file}...`);
        const inputPath = path.join(assetsDir, file);
        try {
            const blob = await removeBackground(inputPath);
            const buffer = Buffer.from(await blob.arrayBuffer());
            fs.writeFileSync(inputPath, buffer); // Overwrite the original!
            console.log(`Successfully removed background from ${file}`);
        } catch (e) {
            console.error(`Failed to process ${file}:`, e);
        }
    }
    console.log("All done!");
}

processAll();
