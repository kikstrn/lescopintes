import { motion } from "framer-motion";
import {
  Bike,
  Clock3,
  Gauge,
  MapPin,
  Mountain,
  Navigation,
} from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

const route = [
  [50.3818, 3.0532],
  [50.389, 3.041],
  [50.398, 3.022],
  [50.414, 3.008],
  [50.429, 3.022],
  [50.438, 3.046],
  [50.428, 3.07],
  [50.411, 3.079],
  [50.396, 3.067],
  [50.3818, 3.0532],
];

function BikeMap() {
  return (
    <motion.section
      className="bike-map glass-panel"
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="bike-map__content">
        <div className="bike-map__map-wrapper">
          <MapContainer
            center={[50.407, 3.045]}
            zoom={12}
            scrollWheelZoom={false}
            className="bike-map__map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Polyline
              positions={route}
              pathOptions={{
                color: "#5ee49b",
                weight: 5,
                opacity: 0.9,
              }}
            />

            <CircleMarker
              center={route[0]}
              radius={9}
              pathOptions={{
                color: "#ffffff",
                fillColor: "#5ee49b",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                Départ et arrivée : Cuincy
              </Popup>
            </CircleMarker>

            <CircleMarker
              center={route[5]}
              radius={7}
              pathOptions={{
                color: "#ffffff",
                fillColor: "#63b8ff",
                fillOpacity: 1,
                weight: 2,
              }}
            >
              <Popup>
                Pause prévue à mi-parcours
              </Popup>
            </CircleMarker>
          </MapContainer>

          <div className="bike-map__badge">
            <Navigation size={15} />
            Parcours prévisionnel
          </div>
        </div>

        <div className="bike-map__information">
          <div className="bike-map__title">
            <span className="bike-map__title-icon">
              <Bike size={21} />
            </span>

            <div>
              <span className="section-heading__eyebrow">
                Dimanche 2 août
              </span>

              <h3>Boucle de la Scarpe</h3>
            </div>
          </div>

          <p className="bike-map__description">
            Une boucle roulante avec quelques portions plus sportives et une
            pause prévue à mi-parcours.
          </p>

          <div className="bike-map__stats">
            <div className="bike-map__stat">
              <span>
                <Navigation size={17} />
              </span>

              <div>
                <small>Distance</small>
                <strong>62 km</strong>
              </div>
            </div>

            <div className="bike-map__stat">
              <span>
                <Mountain size={17} />
              </span>

              <div>
                <small>Dénivelé</small>
                <strong>340 m</strong>
              </div>
            </div>

            <div className="bike-map__stat">
              <span>
                <Clock3 size={17} />
              </span>

              <div>
                <small>Durée estimée</small>
                <strong>2 h 45</strong>
              </div>
            </div>

            <div className="bike-map__stat">
              <span>
                <Gauge size={17} />
              </span>

              <div>
                <small>Allure</small>
                <strong>Modérée</strong>
              </div>
            </div>
          </div>

          <div className="bike-map__meeting-point">
            <MapPin size={17} />

            <div>
              <small>Point de rendez-vous</small>
              <strong>Place de Cuincy à 9 h</strong>
            </div>
          </div>

          <div className="bike-map__participants">
            <div className="bike-map__avatars">
              <span>KI</span>
              <span>RA</span>
              <span>FA</span>
            </div>

            <p>
              <strong>3 participants</strong>
              Kiks, Raf et Fab
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default BikeMap;