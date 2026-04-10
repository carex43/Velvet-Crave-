const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.png') && !f.includes('transparent'));

async function processAll() {
    for (const file of files) {
        console.log(`Processing ${file}...`);
        const p = path.join(assetsDir, file);
        try {
            const img = await Jimp.read(p);
            
            img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
                const r = this.bitmap.data[idx + 0];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];
                
                // standard luminance formula
                const lum = (r * 0.299 + g * 0.587 + b * 0.114);
                
                if (lum <= 5) {
                    this.bitmap.data[idx + 3] = 0;
                } else if (lum <= 45) {
                    // Soft falloff for edges
                    const alpha = Math.floor(((lum - 5) / 40) * 255);
                    this.bitmap.data[idx + 3] = alpha;
                }
            });
            
            await img.writeAsync(p);
            console.log(`Successfully made background transparent for ${file}`);
        } catch(e) {
            console.error(`Failed ${file}:`, e);
        }
    }
    console.log("All backgrounds cleared.");
}

processAll();
