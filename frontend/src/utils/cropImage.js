export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

export default async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set canvas size to match the bounding box
  canvas.width = image.width;
  canvas.height = image.height;

  // Draw image
  ctx.drawImage(image, 0, 0);

  // Extract the cropped image using a new canvas
  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  // Set proper canvas dimensions for the cropped output
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Paste data
  ctx.putImageData(data, 0, 0);

  // As Blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, 'image/jpeg', 0.95); // High quality JPEG
  });
}