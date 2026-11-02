// Tamaños (en px) de los PNG de public/sprites. Los mismos valores están en index.css como variables
// (--paisaje-ancho, --paisaje-alto, --paisaje-tira, --hada-ancho, --hada-alto); dimensiones.test.js
// comprueba que no se desfasen.

// Paisaje: una tira de FOTOGRAMAS fotogramas de ancho x alto.
const PAISAJE_ANCHO = 960;
const PAISAJE_FOTOGRAMAS = 4;
export const PAISAJE = Object.freeze({
  ancho: PAISAJE_ANCHO,
  alto: 540,
  fotogramas: PAISAJE_FOTOGRAMAS,
  anchoTira: PAISAJE_ANCHO * PAISAJE_FOTOGRAMAS,
});

// Un fotograma del hada (la versión @2x mide el doble).
export const HADA = Object.freeze({ ancho: 320, alto: 150 });

// Código QR de transferencia: no tiene que ver con el sprite del hada, aunque hoy mida lo mismo de ancho.
export const TAMANO_QR = 320;
