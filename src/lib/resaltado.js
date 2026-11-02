// Resaltado de sintaxis mínimo para C, línea por línea.
const KW = "int|float|double|char|void|return|if|else|for|while|do|switch|case|break|default|continue|struct|sizeof|const|unsigned|long|FILE|NULL|EOF";
const RE = new RegExp(
  [
    "(\\/\\/.*$|\\/\\*.*?\\*\\/)",            // 1 comentario
    "(\"(?:\\\\.|[^\"\\\\])*\")",              // 2 string
    "('(?:\\\\.|[^'\\\\])*')",                 // 3 char
    "(#\\w+(?:\\s*<[^>]+>)?)",                 // 4 preprocesador
    `\\b(${KW})\\b`,                            // 5 palabra reservada
    "\\b(\\d+(?:\\.\\d+)?)\\b",                // 6 número
    "\\b([A-Za-z_]\\w*)(?=\\s*\\()"            // 7 función
  ].join("|"),
  "g"
);
const CLASES = [null, "c-com", "c-str", "c-str", "c-pre", "c-kw", "c-num", "c-fn"];

export function tokenizar(linea) {
  const out = [];
  let ult = 0;
  linea.replace(RE, (m, ...g) => {
    const idx = g[7];
    if (idx > ult) out.push({ t: linea.slice(ult, idx) });
    const grupo = g.slice(0, 7).findIndex(x => x !== undefined) + 1;
    out.push({ t: m, c: CLASES[grupo] });
    ult = idx + m.length;
    return m;
  });
  if (ult < linea.length) out.push({ t: linea.slice(ult) });
  return out;
}
