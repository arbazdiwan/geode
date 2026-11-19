/** Public files travel with source downloads and are served by any static host. */
const base = import.meta.env.BASE_URL;

export const landmarkAssets = {
  bigNickel: `${base}landmarks/big-nickel.png`,
  waterTower: `${base}landmarks/water-tower.png`,
  scienceNorth: `${base}landmarks/science-north.png`,
};

// WASM is fetched only after a portrait is uploaded, never imported into SSR.
export const portraitAssets = {
  wasmLoaderPath: `${base}portrait/portrait-vision-runtime.js`,
  wasmParts: [
    `${base}portrait/portrait-vision-runtime.wasm.part0`,
    `${base}portrait/portrait-vision-runtime.wasm.part1`,
  ],
  modelAssetPath: `${base}portrait/selfie-segmenter.tflite`,
};