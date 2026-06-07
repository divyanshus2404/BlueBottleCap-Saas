const { Jimp } = require('jimp');

async function cropImage() {
    try {
        const imagePath = process.argv[2];
        const image = await Jimp.read(imagePath);
        console.log(`Original size: ${image.bitmap.width}x${image.bitmap.height}`);
        
        // autocrop removes borders of the same color
        image.autocrop();
        
        await image.write(imagePath);
        console.log(`Autocropped size: ${image.bitmap.width}x${image.bitmap.height}`);
    } catch (err) {
        console.error(err);
    }
}

cropImage();
