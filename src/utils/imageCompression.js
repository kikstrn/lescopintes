const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1920;
const DEFAULT_QUALITY = 0.82;
const DEFAULT_MIN_QUALITY = 0.52;
const DEFAULT_QUALITY_STEP = 0.06;
const DEFAULT_RESIZE_STEP = 0.9;
const DEFAULT_MAX_ATTEMPTS = 12;
const DEFAULT_MAX_FILE_SIZE = 2 * 1024 * 1024;
const DEFAULT_OUTPUT_TYPE = "image/webp";
const MIN_LONGEST_SIDE = 960;

const HEIC_TYPES = new Set([
  "image/heic",
  "image/heif",
]);

const SUPPORTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  ...HEIC_TYPES,
]);

function clamp(value, min, max) {
  return Math.min(
    max,
    Math.max(min, value),
  );
}

function emitProgress(
  onProgress,
  payload,
) {
  if (
    typeof onProgress === "function"
  ) {
    onProgress(payload);
  }
}

function isHeicFile(file) {
  if (!file) {
    return false;
  }

  const type = String(
    file.type ?? "",
  ).toLowerCase();

  const name = String(
    file.name ?? "",
  ).toLowerCase();

  return (
    HEIC_TYPES.has(type) ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

function replaceExtension(
  fileName,
  extension,
) {
  const safeName =
    String(fileName || "image");

  const baseName = safeName.replace(
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

  const ratio = Math.min(
    maxWidth / width,
    maxHeight / height,
  );

  return {
    width: Math.max(
      1,
      Math.round(width * ratio),
    ),
    height: Math.max(
      1,
      Math.round(height * ratio),
    ),
  };
}

function reduceDimensions({
  width,
  height,
  resizeStep,
}) {
  const longestSide = Math.max(
    width,
    height,
  );

  if (
    longestSide <= MIN_LONGEST_SIDE
  ) {
    return {
      width,
      height,
      changed: false,
    };
  }

  const targetLongestSide =
    Math.max(
      MIN_LONGEST_SIDE,
      Math.round(
        longestSide * resizeStep,
      ),
    );

  const ratio =
    targetLongestSide /
    longestSide;

  return {
    width: Math.max(
      1,
      Math.round(width * ratio),
    ),
    height: Math.max(
      1,
      Math.round(height * ratio),
    ),
    changed: ratio < 1,
  };
}

function canvasToBlob(
  canvas,
  type,
  quality,
) {
  return new Promise(
    (resolve, reject) => {
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
    },
  );
}

function createCanvas({
  source,
  width,
  height,
}) {
  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext("2d", {
      alpha: false,
    });

  if (!context) {
    throw new Error(
      "Le navigateur ne peut pas traiter cette image.",
    );
  }

  context.imageSmoothingEnabled =
    true;

  context.imageSmoothingQuality =
    "high";

  /*
   * Fond blanc pour éviter un fond noir
   * lors de la conversion PNG transparent
   * vers JPEG/WebP.
   */
  context.fillStyle = "#ffffff";

  context.fillRect(
    0,
    0,
    width,
    height,
  );

  context.drawImage(
    source,
    0,
    0,
    width,
    height,
  );

  return canvas;
}

function loadImageElement(file) {
  return new Promise(
    (resolve, reject) => {
      const image = new Image();

      const objectUrl =
        URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(
          objectUrl,
        );

        resolve({
          source: image,
          width:
            image.naturalWidth,
          height:
            image.naturalHeight,
          close: () => {},
        });
      };

      image.onerror = () => {
        URL.revokeObjectURL(
          objectUrl,
        );

        reject(
          new Error(
            `Impossible de lire l’image « ${file.name} ».`,
          ),
        );
      };

      image.src = objectUrl;
    },
  );
}

async function loadImageSource(file) {
  /*
   * createImageBitmap applique généralement
   * l’orientation EXIF automatiquement.
   */
  if (
    typeof createImageBitmap ===
    "function"
  ) {
    try {
      const bitmap =
        await createImageBitmap(
          file,
          {
            imageOrientation:
              "from-image",
          },
        );

      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () =>
          bitmap.close?.(),
      };
    } catch {
      // Repli vers Image().
    }
  }

  return loadImageElement(file);
}

async function convertHeicToJpeg(
  file,
) {
  let heic2any;

  try {
    const module =
      await import("heic2any");

    heic2any =
      module.default ?? module;
  } catch {
    throw new Error(
      "La conversion HEIC nécessite le paquet « heic2any ». Exécute : npm install heic2any",
    );
  }

  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });

  const blob = Array.isArray(result)
    ? result[0]
    : result;

  if (!(blob instanceof Blob)) {
    throw new Error(
      `Impossible de convertir « ${file.name} » depuis le format HEIC.`,
    );
  }

  return new File(
    [blob],
    replaceExtension(
      file.name,
      "jpg",
    ),
    {
      type: "image/jpeg",
      lastModified:
        file.lastModified ||
        Date.now(),
    },
  );
}

async function ensureBrowserReadableFile(
  file,
  onProgress,
) {
  if (!isHeicFile(file)) {
    return {
      file,
      convertedFromHeic: false,
    };
  }

  emitProgress(
    onProgress,
    {
      stage: "heic-conversion",
      message:
        "Conversion de la photo HEIC…",
    },
  );

  const convertedFile =
    await convertHeicToJpeg(file);

  return {
    file: convertedFile,
    convertedFromHeic: true,
  };
}

export function isSupportedImageFile(
  file,
) {
  if (!file) {
    return false;
  }

  const type = String(
    file.type ?? "",
  ).toLowerCase();

  return (
    SUPPORTED_TYPES.has(type) ||
    isHeicFile(file)
  );
}

export async function getImageDimensions(
  file,
) {
  if (!file) {
    throw new Error(
      "Aucun fichier sélectionné.",
    );
  }

  const {
    file: readableFile,
  } = await ensureBrowserReadableFile(
    file,
  );

  const loaded =
    await loadImageSource(
      readableFile,
    );

  try {
    return {
      width: loaded.width,
      height: loaded.height,
    };
  } finally {
    loaded.close();
  }
}

export async function compressImage(
  file,
  {
    maxWidth =
      DEFAULT_MAX_WIDTH,
    maxHeight =
      DEFAULT_MAX_HEIGHT,
    quality =
      DEFAULT_QUALITY,
    minQuality =
      DEFAULT_MIN_QUALITY,
    qualityStep =
      DEFAULT_QUALITY_STEP,
    resizeStep =
      DEFAULT_RESIZE_STEP,
    maxAttempts =
      DEFAULT_MAX_ATTEMPTS,
    maxFileSize =
      DEFAULT_MAX_FILE_SIZE,
    outputType =
      DEFAULT_OUTPUT_TYPE,
    onProgress,
  } = {},
) {
  if (!file) {
    throw new Error(
      "Aucune image à compresser.",
    );
  }

  if (
    !isSupportedImageFile(file)
  ) {
    throw new Error(
      `Le format de « ${file.name} » n’est pas pris en charge.`,
    );
  }

  emitProgress(
    onProgress,
    {
      stage: "preparing",
      message:
        "Préparation de l’image…",
    },
  );

  const {
    file: readableFile,
    convertedFromHeic,
  } = await ensureBrowserReadableFile(
    file,
    onProgress,
  );

  const loaded =
    await loadImageSource(
      readableFile,
    );

  const originalWidth =
    loaded.width;

  const originalHeight =
    loaded.height;

  if (
    !originalWidth ||
    !originalHeight
  ) {
    loaded.close();

    throw new Error(
      `Les dimensions de « ${file.name} » sont introuvables.`,
    );
  }

  const initialSize =
    calculateTargetSize({
      width: originalWidth,
      height: originalHeight,
      maxWidth,
      maxHeight,
    });

  let currentWidth =
    initialSize.width;

  let currentHeight =
    initialSize.height;

  let currentQuality = clamp(
    quality,
    minQuality,
    1,
  );

  let finalBlob = null;
  let finalType = outputType;
  let finalWidth =
    currentWidth;
  let finalHeight =
    currentHeight;
  let attemptsUsed = 0;

  try {
    const attempts = Math.max(
      1,
      Number(maxAttempts) || 1,
    );

    for (
      let attempt = 0;
      attempt < attempts;
      attempt += 1
    ) {
      attemptsUsed = attempt + 1;

      emitProgress(
        onProgress,
        {
          stage: "compressing",
          attempt:
            attempt + 1,
          totalAttempts:
            attempts,
          width:
            currentWidth,
          height:
            currentHeight,
          quality:
            currentQuality,
          message:
            "Compression de l’image…",
        },
      );

      const canvas =
        createCanvas({
          source:
            loaded.source,
          width:
            currentWidth,
          height:
            currentHeight,
        });

      try {
        finalBlob =
          await canvasToBlob(
            canvas,
            finalType,
            currentQuality,
          );
      } catch {
        finalType =
          "image/jpeg";

        finalBlob =
          await canvasToBlob(
            canvas,
            finalType,
            currentQuality,
          );
      }

      finalWidth =
        currentWidth;

      finalHeight =
        currentHeight;

      if (
        !maxFileSize ||
        finalBlob.size <=
          maxFileSize
      ) {
        break;
      }

      if (
        currentQuality >
        minQuality
      ) {
        currentQuality =
          Math.max(
            minQuality,
            Number(
              (
                currentQuality -
                qualityStep
              ).toFixed(2),
            ),
          );

        continue;
      }

      const reduced =
        reduceDimensions({
          width:
            currentWidth,
          height:
            currentHeight,
          resizeStep,
        });

      if (!reduced.changed) {
        break;
      }

      currentWidth =
        reduced.width;

      currentHeight =
        reduced.height;
    }
  } finally {
    loaded.close();
  }

  if (!finalBlob) {
    throw new Error(
      "Impossible de compresser l’image.",
    );
  }

  const extension =
    getExtensionFromMimeType(
      finalType,
    );

  const compressedFile =
    new File(
      [finalBlob],
      replaceExtension(
        file.name,
        extension,
      ),
      {
        type: finalType,
        lastModified:
          file.lastModified ||
          Date.now(),
      },
    );

  emitProgress(
    onProgress,
    {
      stage: "done",
      message:
        "Compression terminée.",
      size:
        compressedFile.size,
    },
  );

  return {
    file:
      compressedFile,
    width:
      finalWidth,
    height:
      finalHeight,
    originalWidth,
    originalHeight,
    originalSize:
      file.size,
    compressedSize:
      compressedFile.size,
    compressionRatio:
      file.size > 0
        ? compressedFile.size /
          file.size
        : 1,
    targetReached:
      !maxFileSize ||
      compressedFile.size <=
        maxFileSize,
    qualityUsed:
      currentQuality,
    outputType:
      finalType,
    attemptsUsed,
    convertedFromHeic,
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

  const result =
    await compressImage(
      file,
      options,
    );

  /*
   * On conserve l’original uniquement
   * lorsqu’il est déjà plus léger et qu’il
   * respecte la taille cible. HEIC est exclu,
   * car il doit rester lisible sur le web.
   */
  const canKeepOriginal =
    !result.convertedFromHeic &&
    result.originalSize <=
      result.compressedSize &&
    (
      !options.maxFileSize ||
      result.originalSize <=
        options.maxFileSize
    );

  if (canKeepOriginal) {
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
      targetReached: true,
      outputType:
        file.type,
      attemptsUsed:
        result.attemptsUsed,
      convertedFromHeic: false,
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
    onFileProgress,
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
    const file =
      fileList[index];

    const prepared =
      await prepareGalleryImage(
        file,
        {
          ...options,

          onProgress:
            (progress) => {
              onFileProgress?.({
                ...progress,
                file,
                index,
                total:
                  fileList.length,
              });
            },
        },
      );

    preparedImages.push({
      ...prepared,
      originalFile:
        file,
      previewUrl:
        URL.createObjectURL(
          prepared.file,
        ),
      caption: "",
      takenAt: null,
    });

    onProgress?.({
      completed:
        index + 1,
      total:
        fileList.length,
      currentFile:
        file,
      prepared,
    });
  }

  return preparedImages;
}

export function revokeGalleryPreviewUrls(
  items,
) {
  for (
    const item of items ?? []
  ) {
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

  if (
    size <
    1024 * 1024
  ) {
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
    compressedSize >=
      originalSize
  ) {
    return "Taille d’origine conservée";
  }

  const percentage =
    Math.round(
      (
        1 -
        compressedSize /
          originalSize
      ) *
        100,
    );

  return `${percentage} % plus légère`;
}
