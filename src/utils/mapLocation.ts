export function isValidCoordinate(value: string, minimum: number, maximum: number) {
  if (!value.trim()) return false;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && coordinate >= minimum && coordinate <= maximum;
}

export function buildGoogleMapsUrl(latitude: string, longitude: string) {
  if (!isValidCoordinate(latitude, -90, 90) || !isValidCoordinate(longitude, -180, 180)) return "";
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export function parseCoordinatesFromGoogleMapsUrl(url: string) {
  const decodedUrl = (() => {
    try {
      return decodeURIComponent(url);
    } catch {
      return url;
    }
  })();
  const coordinatePatterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|ll|center|destination|origin)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i
  ];

  for (const pattern of coordinatePatterns) {
    const match = decodedUrl.match(pattern);
    if (!match) continue;
    if (!isValidCoordinate(match[1], -90, 90) || !isValidCoordinate(match[2], -180, 180)) continue;
    return { latitude: match[1], longitude: match[2] };
  }

  return null;
}
