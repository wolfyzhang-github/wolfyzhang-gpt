import heic2any from "heic2any";

export function compressImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent: any) => {
      const image = new Image();
      image.onload = () => {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        let width = image.width;
        let height = image.height;
        let quality = 0.9;
        let dataUrl;

        const compress = () => {
          canvas.width = width;
          canvas.height = height;
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          ctx?.drawImage(image, 0, 0, width, height);
          dataUrl = canvas.toDataURL("image/jpeg", quality);

          if (dataUrl.length > maxSize) {
            if (quality > 0.5) {
              quality -= 0.05;
            } else if (width > 100 && height > 100) {
              width *= 0.95;
              height *= 0.95;
            } else {
              return resolve(dataUrl);
            }
            setTimeout(compress, 0);
          } else {
            resolve(dataUrl);
          }
        };

        compress();
      };
      image.onerror = reject;
      image.src = readerEvent.target.result;
    };
    reader.onerror = reject;

    if (file.type.includes("heic")) {
      heic2any({ blob: file, toType: "image/jpeg" })
        .then((blob) => {
          reader.readAsDataURL(blob as Blob);
        })
        .catch((e) => {
          reject(e);
        });
    } else {
      reader.readAsDataURL(file);
    }
  });
}
