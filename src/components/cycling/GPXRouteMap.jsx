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
      "gpx-route-map__marker gpx-route-map__marker--start",

    html:
      "<span>D</span>",

    iconSize:
      [30, 30],

    iconAnchor:
      [15, 15],
  });

const finishIcon =
  divIcon({
    className:
      "gpx-route-map__marker gpx-route-map__marker--finish",

    html:
      "<span>A</span>",

    iconSize:
      [30, 30],

    iconAnchor:
      [15, 15],
  });

function FitRouteBounds({
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

    const bounds =
      latLngBounds(
        positions,
      );

    map.fitBounds(
      bounds,
      {
        padding:
          [28, 28],

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

function GPXRouteMap({
  routeData,
  startPoint,
  endPoint,
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
            (
              coordinate,
            ) => [
              Number(
                coordinate[1],
              ),

              Number(
                coordinate[0],
              ),
            ],
          )
          .filter(
            (
              coordinate,
            ) =>
              Number.isFinite(
                coordinate[0],
              ) &&
              Number.isFinite(
                coordinate[1],
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
    return (
      <div className="gpx-route-map__empty">
        Le tracé GPS ne contient pas assez de points pour afficher la carte.
      </div>
    );
  }

  const startPosition =
    startPoint
      ? [
          startPoint.latitude,
          startPoint.longitude,
        ]
      : positions[0];

  const endPosition =
    endPoint
      ? [
          endPoint.latitude,
          endPoint.longitude,
        ]
      : positions[
          positions.length - 1
        ];

  return (
    <div className="gpx-route-map">
      <MapContainer
        center={
          positions[0]
        }
        zoom={13}
        scrollWheelZoom={
          false
        }
        className="gpx-route-map__canvas"
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
              5,

            opacity:
              0.95,

            lineCap:
              "round",

            lineJoin:
              "round",
          }}
        />

        <Marker
          position={
            startPosition
          }
          icon={
            startIcon
          }
        />

        <Marker
          position={
            endPosition
          }
          icon={
            finishIcon
          }
        />

        <FitRouteBounds
          positions={
            positions
          }
        />
      </MapContainer>

      <div className="gpx-route-map__legend">
        <span>
          <i className="is-start">
            D
          </i>
          Départ
        </span>

        <span>
          <i className="is-finish">
            A
          </i>
          Arrivée
        </span>
      </div>
    </div>
  );
}

export default GPXRouteMap;
