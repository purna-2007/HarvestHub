import React from "react";

function Map({ latitude, longitude, label = "Job location" }) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const validCoordinates =
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180;

  if (!validCoordinates) {
    return (
      <p role="status" style={{ color: "#6b7280" }}>
        Map coordinates are unavailable for this location.
      </p>
    );
  }

  const padding = 0.01;
  const bounds = [
    lon - padding,
    lat - padding,
    lon + padding,
    lat + padding
  ].join("%2C");
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bounds}&layer=mapnik&marker=${lat}%2C${lon}`;
  const mapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;

  return (
    <section aria-label={label}>
      <iframe
        title={label}
        src={mapUrl}
        loading="lazy"
        referrerPolicy="no-referrer"
        style={{
          width: "100%",
          minHeight: 260,
          border: "1px solid #d1d5db",
          borderRadius: 8
        }}
      />
      <a href={mapLink} target="_blank" rel="noreferrer">
        Open map in OpenStreetMap
      </a>
    </section>
  );
}

export default Map;