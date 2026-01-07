export const MAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

export const LYON_CENTER = {
  lat: 45.764043,
  lng: 4.835659,
};

export const MAP_DEFAULT_ZOOM = 11.8;
export const MAP_MIN_ZOOM = 6;
export const MAP_MAX_ZOOM = 19;

export const LYON_BOUNDS: [[number, number], [number, number]] = [
  [4.63, 45.62],
  [5.15, 45.9],
];
