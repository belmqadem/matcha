import logger from "./logger.js";

function isPrivate172(ip) {
  const match = ip.match(/^172\.(\d+)\./);
  if (!match) return false;
  const second = parseInt(match[1], 10);
  return second >= 16 && second <= 31;
}

export async function getLocationFromIp(ip) {
  try {
    const cleanIp = ip.replace(/^::ffff:/, ""); // Strip IPv6 prefix if present

    if (
      cleanIp === "127.0.0.1" ||
      cleanIp === "::1" ||
      cleanIp.startsWith("192.168.") ||
      cleanIp.startsWith("10.") ||
      (cleanIp.startsWith("172.") && isPrivate172(cleanIp))
    ) {
      logger.debug(
        { ip: cleanIp },
        "Private IP detected — skipping geoip lookup",
      );
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(
      `http://ip-api.com/json/${cleanIp}?fields=status,lat,lon,city`,
      { signal: controller.signal },
    );
    clearTimeout(timeoutId);

    const data = await res.json();

    if (data.status !== "success") {
      logger.warn({ ip: cleanIp, data }, "IP geolocation failed");
      return null;
    }

    return {
      latitude: data.lat,
      longitude: data.lon,
      location_city: data.city,
    };
  } catch (err) {
    if (err && err.name === "AbortError") {
      logger.warn({ ip: cleanIp }, "IP geolocation request timed out");
      return null;
    }

    logger.error({ err }, "IP geolocation request failed");
    return null;
  }
}
