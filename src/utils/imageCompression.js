const DEFAULT_MAX_WIDTH = 2200;
const DEFAULT_MAX_HEIGHT = 2200;
const DEFAULT_QUALITY = 0.84;
const DEFAULT_OUTPUT_TYPE = "image/webp";

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(
        new Error(
          `Impossible de lire l’image « ${file.name} ».`,
        ),
      );
    };

    image.src = objectUrl;
  });
}

function calculateTargetSize({
  width,
  height,
  maxWidth,
  maxHeight,
}) {
  if (
    width <= maxWidth &&
    height <= maxHeight
  ) {
    return {
      width,
      height,
    };
  }

  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(
    widthRatio,
    heightRatio,
  );

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function canvasToBlob(
  canvas,
  type,
  quality,
) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Impossible de compresser l’image.",
            ),
          );
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function replaceExtension(
  fileName,
  extension,
) {
  const baseName = fileName.replace(
    /\.[^/.]+$/,
    "",
  );

  return `${baseName}.${extension}`;
}

function getExtensionFromMimeType(
  mimeType,
) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
    default:
      return "webp";
  }
}

export function isSupportedImageFile(
  file,
) {
  if (!file) {
    return false;
  }

  return [
    "image/jpeg",
    "image/png",
    "image/webp",
  ].includes(file.type);
}

export async function getImageDimensions(
  file,
) {
  const image = await loadImage(file);

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

export async function compressImage(
  file,
  {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
    outputType = DEFAULT_OUTPUT_TYPE,
  } = {},
) {
  if (!file) {
    throw new Error(
      "Aucune image à compresser.",
    );
  }

  if (!isSupportedImageFile(file)) {
    throw new Error(
      `Le format de « ${file.name} » n’est pas pris en charge.`,
    );
  }

  const image = await loadImage(file);

  const originalWidth =
    image.naturalWidth;

  const originalHeight =
    image.naturalHeight;

  const targetSize =
    calculateTargetSize({
      width: originalWidth,
      height: originalHeight,
      maxWidth,
      maxHeight,
    });

  const canvas =
    document.createElement("canvas");

  canvas.width = targetSize.width;
  canvas.height = targetSize.height;

  const context =
    canvas.getContext("2d", {
      alpha: false,
    });

  if (!context) {
    throw new Error(
      "Le navigateur ne peut pas traiter cette image.",
    );
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality =
    "high";

  context.drawImage(
    image,
    0,
    0,
    targetSize.width,
    targetSize.height,
  );

  let blob;

  try {
    blob = await canvasToBlob(
      canvas,
      outputType,
      quality,
    );
  } catch {
    blob = await canvasToBlob(
      canvas,
      "image/jpeg",
      quality,
    );

    outputType = "image/jpeg";
  }

  const extension =
    getExtensionFromMimeType(
      outputType,
    );

  const compressedFile = new File(
    [blob],
    replaceExtension(
      file.name,
      extension,
    ),
    {
      type: outputType,
      lastModified: Date.now(),
    },
  );

  return {
    file: compressedFile,
    width: targetSize.width,
    height: targetSize.height,
    originalWidth,
    originalHeight,
    originalSize: file.size,
    compressedSize:
      compressedFile.size,
    compressionRatio:
      file.size > 0
        ? compressedFile.size /
          file.size
        : 1,
  };
}

export async function prepareGalleryImage(
  file,
  options = {},
) {
  if (!file) {
    throw new Error(
      "Aucun fichier sélectionné.",
    );
  }

  /*
   * Les fichiers HEIC/HEIF ne sont généralement pas
   * décodables nativement dans tous les navigateurs.
   * Ils sont donc conservés tels quels.
   */
  if (
    file.type === "image/heic" ||
    file.type === "image/heif"
  ) {
    return {
      file,
      width: null,
      height: null,
      originalWidth: null,
      originalHeight: null,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
      skippedCompression: true,
    };
  }

  const result =
    await compressImage(
      file,
      options,
    );

  /*
   * Si la version compressée est plus lourde que l’originale,
   * on conserve le fichier initial.
   */
  if (
    result.compressedSize >=
    result.originalSize
  ) {
    return {
      file,
      width:
        result.originalWidth,
      height:
        result.originalHeight,
      originalWidth:
        result.originalWidth,
      originalHeight:
        result.originalHeight,
      originalSize:
        result.originalSize,
      compressedSize:
        result.originalSize,
      compressionRatio: 1,
      skippedCompression: true,
    };
  }

  return {
    ...result,
    skippedCompression: false,
  };
}

export async function prepareGalleryImages(
  files,
  {
    onProgress,
    ...options
  } = {},
) {
  const fileList =
    Array.from(files ?? []);

  const preparedImages = [];

  for (
    let index = 0;
    index < fileList.length;
    index += 1
  ) {
    const file = fileList[index];

    const prepared =
      await prepareGalleryImage(
        file,
        options,
      );

    preparedImages.push({
      ...prepared,
      originalFile: file,
      previewUrl:
        URL.createObjectURL(
          prepared.file,
        ),
      caption: "",
      takenAt: null,
    });

    onProgress?.({
      completed: index + 1,
      total: fileList.length,
      currentFile: file,
    });
  }

  return preparedImages;
}

export function revokeGalleryPreviewUrls(
  items,
) {
  for (const item of items ?? []) {
    if (item.previewUrl) {
      URL.revokeObjectURL(
        item.previewUrl,
      );
    }
  }
}

export function formatFileSize(
  size,
) {
  if (!Number.isFinite(size)) {
    return "0 octet";
  }

  if (size < 1024) {
    return `${size} octets`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} Ko`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} Mo`;
}

export function formatCompressionGain({
  originalSize,
  compressedSize,
}) {
  if (
    !originalSize ||
    compressedSize >= originalSize
  ) {
    return "Taille d’origine conservée";
  }

  const percentage =
    Math.round(
      (1 -
        compressedSize /
          originalSize) *
        100,
    );

  return `${percentage} % plus légère`;
}