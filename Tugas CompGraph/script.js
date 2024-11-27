// script.js
const uploadInput = document.getElementById("upload");
const grayscaleButton = document.getElementById("grayscale");
const blurButton = document.getElementById("blur");
const originalCanvas = document.getElementById("originalCanvas");
const processedCanvas = document.getElementById("processedCanvas");
const originalCtx = originalCanvas.getContext("2d");
const processedCtx = processedCanvas.getContext("2d");

let originalImage = null;

uploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            processedCanvas.width = img.width;
            processedCanvas.height = img.height;

            originalCtx.drawImage(img, 0, 0);
            originalImage = originalCtx.getImageData(0, 0, img.width, img.height);

            grayscaleButton.disabled = false;
            blurButton.disabled = false;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

grayscaleButton.addEventListener("click", () => {
    if (!originalImage) return;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalImage.data),
        originalImage.width,
        originalImage.height
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const gray = (r + g + b) / 3;

        imageData.data[i] = gray;
        imageData.data[i + 1] = gray;
        imageData.data[i + 2] = gray;
    }

    processedCtx.putImageData(imageData, 0, 0);
});

blurButton.addEventListener("click", () => {
    if (!originalImage) return;

    const imageData = new ImageData(
        new Uint8ClampedArray(originalImage.data),
        originalImage.width,
        originalImage.height
    );

    const { width, height } = imageData;
    const blurredData = new Uint8ClampedArray(imageData.data);

    const kernel = [
        [1 / 9, 1 / 9, 1 / 9],
        [1 / 9, 1 / 9, 1 / 9],
        [1 / 9, 1 / 9, 1 / 9],
    ];

    const applyKernel = (x, y, channel) => {
        let sum = 0;

        for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const px = Math.min(width - 1, Math.max(0, x + kx));
                const py = Math.min(height - 1, Math.max(0, y + ky));
                const index = (py * width + px) * 4 + channel;

                sum += originalImage.data[index] * kernel[ky + 1][kx + 1];
            }
        }
        return sum;
    };

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let channel = 0; channel < 3; channel++) {
                const index = (y * width + x) * 4 + channel;
                blurredData[index] = applyKernel(x, y, channel);
            }
        }
    }

    for (let i = 3; i < blurredData.length; i += 4) {
        blurredData[i] = 255; // Preserve alpha channel
    }

    processedCtx.putImageData(new ImageData(blurredData, width, height), 0, 0);
});
