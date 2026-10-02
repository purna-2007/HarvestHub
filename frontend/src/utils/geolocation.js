export const getUserCurrentLocation = (options = {}) =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser does not support location services."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude, accuracy } = coords;
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          reject(new Error("The device returned invalid location coordinates."));
          return;
        }

        resolve({ latitude, longitude, accuracy });
      },
      (error) => {
        const messages = {
          1: "Location permission was denied.",
          2: "Your current location is unavailable.",
          3: "Location request timed out."
        };
        reject(
          new Error(
            messages[error.code] || "Unable to determine your current location."
          )
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
        ...options
      }
    );
  });