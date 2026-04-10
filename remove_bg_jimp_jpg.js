const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const files = fs.readdirSync(assetsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));

async function processAll() {
    for (const file of files) {
        console.log(`Processing ${file}...`);
        const p = path.join(assetsDir, file);
        const nameWithoutExt = path.parse(file).name;
        const outPath = path.join(assetsDir, nameWithoutExt + '_transparent.png');
        try {
            const img = await Jimp.read(p);
            
            img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
                const r = this.bitmap.data[idx + 0];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];
                
                const lum = (r * 0.299 + g * 0.587 + b * 0.114);
                
                // JPEG compression artifacts mean "black" can be slightly grey/noisy
                if (lum <= 10) {
                    this.bitmap.data[idx + 3] = 0;
                } else if (lum <= 45) {
                    const alpha = Math.floor(((lum - 10) / 35) * 255);
                    this.bitmap.data[idx + 3] = alpha;
                }
            });
            
            await img.writeAsync(outPath);
            console.log(`Successfully made background transparent for ${file}`);
        } catch(e) {
            console.error(`Failed ${file}:`, e);
        }
    }
    console.log("All JPG backgrounds cleared and saved as PNG.");
}

processAll();
