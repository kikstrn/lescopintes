import {
  divIcon,
  latLngBounds,
} from "leaflet";

import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

import {
  useEffect,
  useMemo,
} from "react";

import "leaflet/dist/leaflet.css";

const startIcon =
  divIcon({
    className:
      "cycling-route-map__marker cycling-route-map__marker--start",

    html:
      "<span>D</span>",

    iconSize:
      [28, 28],

    iconAnchor:
      [14, 14],
  });

const finishIcon =
  divIcon({
    className:
      "cycling-route-map__marker cycling-route-map__marker--finish",

    html:
      "<span>A</span>",

    iconSize:
      [28, 28],

    iconAnchor:
      [14, 14],
  });

function FitBounds({
  positions,
}) {
  const map =
    useMap();

  useEffect(() => {
    if (
      positions.length <
      2
    ) {
      return;
    }

    map.fitBounds(
      latLngBounds(
        positions,
      ),
      {
        padding:
          [18, 18],

        maxZoom:
          15,
      },
    );
  }, [
    map,
    positions,
  ]);

  return null;
}

function CyclingRouteMap({
  routeData,
  startPoint,
  endPoint,
  compact = false,
  interactive = true,
}) {
  const positions =
    useMemo(
      () =>
        (
          routeData
            ?.coordinates ??
          []
        )
          .map(
            (coordinate) => [
              Number(
                coordinate[1],
              ),

              Number(
                coordinate[0],
              ),
            ],
          )
          .filter(
            (position) =>
              Number.isFinite(
                position[0],
              ) &&
              Number.isFinite(
                position[1],
              ),
          ),
      [
        routeData,
      ],
    );

  if (
    positions.length <
    2
  ) {
    return null;
  }

  const first =
    startPoint &&
    Number.isFinite(
      Number(
        startPoint.latitude,
      ),
    )
      ? [
          Number(
            startPoint.latitude,
          ),
          Number(
            startPoint.longitude,
          ),
        ]
      : positions[0];

  const last =
    endPoint &&
    Number.isFinite(
      Number(
        endPoint.latitude,
      ),
    )
      ? [
          Number(
            endPoint.latitude,
          ),
          Number(
            endPoint.longitude,
          ),
        ]
      : positions[
          positions.length - 1
        ];

  return (
    <div
      className={[
        "cycling-route-map",
        compact
          ? "cycling-route-map--compact"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <MapContainer
        center={
          positions[0]
        }
        zoom={13}
        zoomControl={
          interactive &&
          !compact
        }
        dragging={
          interactive
        }
        doubleClickZoom={
          interactive
        }
        scrollWheelZoom={
          false
        }
        touchZoom={
          interactive
        }
        keyboard={
          interactive
        }
        attributionControl={
          !compact
        }
        className="cycling-route-map__canvas"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={
            positions
          }
          pathOptions={{
            color:
              "#fc4c02",

            weight:
              compact
                ? 4
                : 5,

            opacity:
              0.96,

            lineCap:
              "round",

            lineJoin:
              "round",
          }}
        />

        {!compact && (
          <>
            <Marker
              position={
                first
              }
              icon={
                startIcon
              }
            />

            <Marker
              position={
                last
              }
              icon={
                finishIcon
              }
            />
          </>
        )}

        <FitBounds
          positions={
            positions
          }
        />
      </MapContainer>
    </div>
  );
}

export default CyclingRouteMap;
