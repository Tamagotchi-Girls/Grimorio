import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import LZString from "lz-string";

function datosTransferencia(perfil) {
  const leer = (k) => {
    try { return JSON.parse(localStorage.getItem(k) || "{}"); } catch { return {}; }
  };
  return { version: 1, perfil, progreso: { PE: leer("guia-pe-progreso-v1"), FP: leer("guia-fp-progreso-v1") } };
}

export function crearEnlace(perfil) {
  const raw = JSON.stringify(datosTransferencia(perfil));
  const encoded = LZString.compressToEncodedURIComponent(raw);
  return `${location.origin}${location.pathname}#/importar?d=${encodeURIComponent(encoded)}`;
}

export function decodificarEnlace() {
  try {
    const query = location.hash.split("?")[1] || "";
    const d = new URLSearchParams(query).get("d");
    const raw = d ? LZString.decompressFromEncodedURIComponent(d) : null;
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function Transferencia({ perfil }) {
  const enlace = useMemo(() => crearEnlace(perfil), [perfil]);
  const [qr, setQr] = useState("");
  const [estado, setEstado] = useState("");
  useEffect(() => {
    QRCode.toDataURL(enlace, { width: 320, margin: 2, color: { dark: "#3d2f66", light: "#fffbea" }, errorCorrectionLevel: "L" })
      .then(setQr)
      .catch(() => { setQr("error"); setEstado("No se pudo generar el QR. Usa el enlace copiable."); });
  }, [enlace]);
  const copiar = async () => {
    await navigator.clipboard.writeText(enlace);
    setEstado("Enlace copiado");
  };
  const compartir = async () => {
    if (navigator.share) await navigator.share({ title: "Mi progreso en Grimorio", text: "Importa mi progreso de estudio", url: enlace });
    else await copiar();
  };
  return (
    <section className="transferencia px">
      <div>
        <p className="eyebrow">Sin cuenta, sin contraseña</p>
        <h2 className="sub">Llevar mi progreso a otro dispositivo</h2>
        <p>Escanéalo con la cámara de tu otro dispositivo.</p>
        <div className="acciones">
          <button className="btn px pink" onClick={copiar}>Copiar enlace</button>
          <button className="btn px" onClick={compartir}>Compartir</button>
        </div>
        <p className="sr" aria-live="polite">{estado}</p>
      </div>
      <div className="qr-marco">{qr === "error" ? <span>Usa el enlace copiable</span> : qr ? <img src={qr} alt="Código QR con el enlace para importar tu progreso" /> : <span>Generando QR…</span>}</div>
      <details className="enlace-copiable"><summary>Ver enlace copiable</summary><code>{enlace}</code></details>
    </section>
  );
}
