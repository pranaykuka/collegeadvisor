import axios from 'axios';

export async function getCoordinatesFromZip(zip) {
  try {
    const res = await axios.get(`https://api.zippopotam.us/us/${zip}`);
    const place = res.data.places[0];
    return { lat: parseFloat(place.latitude), lon: parseFloat(place.longitude) };
  } catch {
    throw new Error(`Could not find coordinates for zip code "${zip}". Please check and try again.`);
  }
}

export function haversineDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

export function formatDistance(miles, maxDrive) {
  if (miles <= maxDrive) {
    const hours = miles / 60;
    if (hours < 1) return `${Math.round(miles)} mi · ${Math.round(hours * 60)} min drive`;
    return `${Math.round(miles)} mi · ${hours.toFixed(1)} hr drive`;
  }
  const flightHours = miles / 500 + 2.5;
  return `${Math.round(miles)} mi · ~${flightHours.toFixed(1)} hr flight`;
}

export function estimateFlightHours(miles) {
  return miles / 500 + 2.5;
}
