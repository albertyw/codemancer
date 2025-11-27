import renderGradient from "../gradient.js";
import suncalc from "suncalc";

export function load() {
  const { latitude = "0", longitude = "0" } = Astro.locals.runtime.cf || {};

  const now = new Date();
  const sunPos = suncalc.getPosition(
    now,
    parseFloat(latitude),
    parseFloat(longitude),
  );

  const [gradient, topVec, bottomVec] = renderGradient(sunPos.altitude);

  const top = `rgb(${topVec[0]}, ${topVec[1]}, ${topVec[2]})`;
  const bottom = `rgb(${bottomVec[0]}, ${bottomVec[1]}, ${bottomVec[2]})`;
  console.log("Background gradient:", { gradient, top, bottom });
}
