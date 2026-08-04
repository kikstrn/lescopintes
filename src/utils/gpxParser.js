const EARTH_RADIUS_M =
  6_371_000;

function toRadians(
  value,
) {
  return (
    Number(value) *
    Math.PI /
    180
  );
}

function distanceBetween(
  pointA,
  pointB,
) {
  const latitudeDelta =
    toRadians(
      pointB.latitude -
      pointA.latitude,
    );

  const longitudeDelta =
    toRadians(
      pointB.longitude -
      pointA.longitude,
    );

  const latitudeA =
    toRadians(
      pointA.latitude,
    );

  const latitudeB =
    toRadians(
      pointB.latitude,
    );

  const haversine =
    Math.sin(
      latitudeDelta / 2,
    ) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(
        longitudeDelta / 2,
      ) ** 2;

  return (
    2 *
    EARTH_RADIUS_M *
    Math.atan2(
      Math.sqrt(haversine),
      Math.sqrt(
        Math.max(
          0,
          1 - haversine,
        ),
      ),
    )
  );
}

function firstTextByLocalName(
  node,
  localNames,
) {
  for (
    const localName
    of localNames
  ) {
    const nodes =
      node.getElementsByTagNameNS(
        "*",
        localName,
      );

    const value =
      nodes[0]
        ?.textContent
        ?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

function directChildText(
  node,
  localName,
) {
  const children =
    Array.from(
      node.children ??
      [],
    );

  const child =
    children.find(
      (item) =>
        item.localName ===
        localName,
    );

  return child
    ?.textContent
    ?.trim() ??
    null;
}

function getTrackPointNodes(
  document,
) {
  const trackPoints =
    Array.from(
      document
        .getElementsByTagNameNS(
          "*",
          "trkpt",
        ),
    );

  if (
    trackPoints.length > 0
  ) {
    return trackPoints;
  }

  return Array.from(
    document
      .getElementsByTagNameNS(
        "*",
        "rtept",
      ),
  );
}

function median(
  values,
) {
  const valid =
    values
      .filter(
        Number.isFinite,
      )
      .sort(
        (a, b) =>
          a - b,
      );

  if (
    valid.length === 0
  ) {
    return null;
  }

  const middle =
    Math.floor(
      valid.length / 2,
    );

  return valid.length % 2
    ? valid[middle]
    : (
        valid[middle - 1] +
        valid[middle]
      ) / 2;
}

function smoothElevations(
  points,
) {
  return points.map(
    (
      point,
      index,
    ) => {
      const nearby =
        points
          .slice(
            Math.max(
              0,
              index - 2,
            ),
            Math.min(
              points.length,
              index + 3,
            ),
          )
          .map(
            (item) =>
              item.elevation,
          );

      return {
        ...point,

        smoothedElevation:
          median(
            nearby,
          ),
      };
    },
  );
}

function calculateElevationGain(
  points,
) {
  const smoothed =
    smoothElevations(
      points,
    );

  let gain = 0;
  let pendingClimb = 0;

  for (
    let index = 1;
    index < smoothed.length;
    index += 1
  ) {
    const previous =
      smoothed[index - 1]
        .smoothedElevation;

    const current =
      smoothed[index]
        .smoothedElevation;

    if (
      !Number.isFinite(
        previous,
      ) ||
      !Number.isFinite(
        current,
      )
    ) {
      continue;
    }

    const difference =
      current - previous;

    if (difference > 0) {
      pendingClimb +=
        difference;
    } else if (
      difference < -1.5
    ) {
      if (
        pendingClimb >=
        2
      ) {
        gain +=
          pendingClimb;
      }

      pendingClimb = 0;
    }
  }

  if (
    pendingClimb >=
    2
  ) {
    gain +=
      pendingClimb;
  }

  return gain;
}

function calculateMovingTime(
  points,
) {
  let movingSeconds = 0;
  let elapsedSeconds = 0;

  for (
    let index = 1;
    index < points.length;
    index += 1
  ) {
    const previous =
      points[index - 1];

    const current =
      points[index];

    if (
      !previous.time ||
      !current.time
    ) {
      continue;
    }

    const seconds =
      (
        current.time.getTime() -
        previous.time.getTime()
      ) / 1000;

    if (
      seconds <= 0 ||
      seconds > 900
    ) {
      continue;
    }

    elapsedSeconds +=
      seconds;

    const distance =
      distanceBetween(
        previous,
        current,
      );

    const speedKmh =
      distance /
      seconds *
      3.6;

    /*
     * Considère le vélo en mouvement au-dessus de 1,5 km/h.
     * Les valeurs supérieures à 100 km/h sont considérées aberrantes.
     */
    if (
      speedKmh >= 1.5 &&
      speedKmh <= 100
    ) {
      movingSeconds +=
        seconds;
    }
  }

  return {
    movingSeconds:
      Math.round(
        movingSeconds,
      ),

    elapsedSeconds:
      Math.round(
        elapsedSeconds,
      ),
  };
}

function calculateBoundingBox(
  points,
) {
  const latitudes =
    points.map(
      (point) =>
        point.latitude,
    );

  const longitudes =
    points.map(
      (point) =>
        point.longitude,
    );

  return {
    north:
      Math.max(
        ...latitudes,
      ),

    south:
      Math.min(
        ...latitudes,
      ),

    east:
      Math.max(
        ...longitudes,
      ),

    west:
      Math.min(
        ...longitudes,
      ),
  };
}

function simplifyPoints(
  points,
  maximumPoints = 1800,
) {
  if (
    points.length <=
    maximumPoints
  ) {
    return points;
  }

  const step =
    Math.ceil(
      points.length /
      maximumPoints,
    );

  return points.filter(
    (
      point,
      index,
    ) =>
      index === 0 ||
      index ===
        points.length - 1 ||
      index % step === 0,
  );
}

async function sha256(
  value,
) {
  const bytes =
    new TextEncoder()
      .encode(value);

  const digest =
    await crypto.subtle
      .digest(
        "SHA-256",
        bytes,
      );

  return Array.from(
    new Uint8Array(
      digest,
    ),
  )
    .map(
      (byte) =>
        byte
          .toString(16)
          .padStart(2, "0"),
    )
    .join("");
}

export async function parseGpxFile(
  file,
) {
  if (!file) {
    throw new Error(
      "Sélectionne un fichier GPX.",
    );
  }

  if (
    !file.name
      .toLowerCase()
      .endsWith(".gpx")
  ) {
    throw new Error(
      "Le fichier doit être au format .gpx.",
    );
  }

  if (
    file.size >
    15 * 1024 * 1024
  ) {
    throw new Error(
      "Le fichier GPX dépasse 15 Mo.",
    );
  }

  const xml =
    await file.text();

  const document =
    new DOMParser()
      .parseFromString(
        xml,
        "application/xml",
      );

  if (
    document
      .getElementsByTagName(
        "parsererror",
      )
      .length > 0
  ) {
    throw new Error(
      "Le fichier GPX n’est pas valide.",
    );
  }

  const pointNodes =
    getTrackPointNodes(
      document,
    );

  const points =
    pointNodes
      .map((node) => {
        const latitude =
          Number(
            node.getAttribute(
              "lat",
            ),
          );

        const longitude =
          Number(
            node.getAttribute(
              "lon",
            ),
          );

        const elevationText =
          directChildText(
            node,
            "ele",
          ) ??
          firstTextByLocalName(
            node,
            ["ele"],
          );

        const elevation =
          elevationText ===
            null
            ? null
            : Number(
                elevationText,
              );

        const timeText =
          directChildText(
            node,
            "time",
          ) ??
          firstTextByLocalName(
            node,
            ["time"],
          );

        const time =
          timeText
            ? new Date(
                timeText,
              )
            : null;

        return {
          latitude,
          longitude,

          elevation:
            Number.isFinite(
              elevation,
            )
              ? elevation
              : null,

          time:
            time &&
            !Number.isNaN(
              time.getTime(),
            )
              ? time
              : null,
        };
      })
      .filter(
        (point) =>
          Number.isFinite(
            point.latitude,
          ) &&
          Number.isFinite(
            point.longitude,
          ),
      );

  if (
    points.length < 2
  ) {
    throw new Error(
      "Aucune trace GPS exploitable n’a été trouvée.",
    );
  }

  let distanceMeters = 0;

  for (
    let index = 1;
    index < points.length;
    index += 1
  ) {
    const segmentDistance =
      distanceBetween(
        points[index - 1],
        points[index],
      );

    if (
      segmentDistance > 0 &&
      segmentDistance < 5000
    ) {
      distanceMeters +=
        segmentDistance;
    }
  }

  const timedPoints =
    points.filter(
      (point) =>
        point.time,
    );

  const startTime =
    timedPoints[0]
      ?.time ??
    null;

  const endTime =
    timedPoints[
      timedPoints.length - 1
    ]?.time ??
    null;

  const {
    movingSeconds,
    elapsedSeconds,
  } = calculateMovingTime(
    points,
  );

  const effectiveDurationSeconds =
    movingSeconds > 0
      ? movingSeconds
      : elapsedSeconds > 0
        ? elapsedSeconds
        : startTime &&
          endTime
          ? Math.max(
              0,
              Math.round(
                (
                  endTime.getTime() -
                  startTime.getTime()
                ) / 1000,
              ),
            )
          : null;

  const distanceKm =
    distanceMeters /
    1000;

  const averageSpeedKmh =
    effectiveDurationSeconds &&
    effectiveDurationSeconds > 0
      ? distanceKm /
        (
          effectiveDurationSeconds /
          3600
        )
      : null;

  const track =
    document
      .getElementsByTagNameNS(
        "*",
        "trk",
      )[0];

  const metadata =
    document
      .getElementsByTagNameNS(
        "*",
        "metadata",
      )[0];

  const name =
    directChildText(
      track,
      "name",
    ) ??
    directChildText(
      metadata,
      "name",
    ) ??
    file.name.replace(
      /\.gpx$/i,
      "",
    );

  const description =
    directChildText(
      track,
      "desc",
    ) ??
    directChildText(
      metadata,
      "desc",
    );

  const simplifiedPoints =
    simplifyPoints(
      points,
    );

  return {
    fileName:
      file.name,

    fileSize:
      file.size,

    gpxHash:
      await sha256(
        xml,
      ),

    title:
      name,

    description,

    startTime,
    endTime,

    rideDate:
      (
        startTime ??
        new Date(
          file.lastModified ||
          Date.now(),
        )
      ).toISOString(),

    preciseDistanceKm:
      Number(
        distanceKm.toFixed(
          3,
        ),
      ),

    distanceKm:
      Math.ceil(
        distanceKm,
      ),

    durationSeconds:
      effectiveDurationSeconds,

    elapsedTimeSeconds:
      elapsedSeconds ||
      null,

    durationMinutes:
      effectiveDurationSeconds
        ? Math.max(
            1,
            Math.round(
              effectiveDurationSeconds /
              60,
            ),
          )
        : null,

    elevationGainM:
      Math.max(
        0,
        Math.round(
          calculateElevationGain(
            points,
          ),
        ),
      ),

    averageSpeedKmh:
      averageSpeedKmh
        ? (
            Math.round(
              (
                averageSpeedKmh +
                Number.EPSILON
              ) *
              10,
            ) /
            10
          )
        : null,

    pointCount:
      points.length,

    boundingBox:
      calculateBoundingBox(
        points,
      ),

    startPoint: {
      latitude:
        points[0].latitude,

      longitude:
        points[0].longitude,
    },

    endPoint: {
      latitude:
        points[
          points.length - 1
        ].latitude,

      longitude:
        points[
          points.length - 1
        ].longitude,
    },

    routeData: {
      type:
        "LineString",

      coordinates:
        simplifiedPoints.map(
          (point) => [
            point.longitude,
            point.latitude,
            point.elevation,
          ],
        ),
    },
  };
}
