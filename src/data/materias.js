// Las materias que se pueden estudiar. `id` es la clave interna (la misma de data/contenido.js y del
// almacenamiento); `nombre` y `clave` salen en el selector de materias; `etiqueta` es el texto de la
// portada de cada materia.
export const MATERIAS = [
  { id: "PE", nombre: "Programación Estructurada", etiqueta: "Programación Estructurada · IL352", clave: "IL352" },
  { id: "FP", nombre: "Fundamentos de Programación", etiqueta: "Fundamentos de Programación", clave: "Departamental" },
];

export const materiaPorId = (id) => MATERIAS.find((m) => m.id === id);
