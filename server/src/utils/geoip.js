import { get } from "http";
import logger from "./logger.js";

export async function getLocationFromIp(ip) {
  try {
    const cleanIp = ip.replace(/^::ffff:/, ""); // Strip IPv6 prefix if present

    if (
      cleanIp === "127.0.0.1" ||
      cleanIp === "::1" ||
      cleanIp.startsWith("192.168.") ||
      cleanIp.startsWith("10.") ||
      cleanIp.startsWith("172.")
    ) {
      logger.debug(
        { ip: cleanIp },
        "Private IP detected — skipping geoip lookup",
      );
      return null;
    }

    const res = await fetch(
      `http://ip-api.com/json/${cleanIp}?fields=status,lat,lon,city`,
    );
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
    logger.error({ err }, "IP geolocation request failed");
    return null;
  }
}
