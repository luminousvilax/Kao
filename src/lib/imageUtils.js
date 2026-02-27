/**
 * Compresses an image file to a data URL string.
 * Resizes large images to max 1920px width/height and reduces quality to 0.7.
 * Targeted for localStorage (keep under ~500KB ideally).
 *
 * @param {File} file - The image file to compress
 * @returns {Promise<string>} - The base64 data URL
 */
export const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    // If file is small enough (< 2MB), don't compress, just return base64
    // 2MB binary ~ 2.7MB string. Total limit is ~5MB.
    if (file.size < 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 1920;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
