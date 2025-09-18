import React, { useEffect, useRef, useState } from "react";

export default function FotoCapture({ onData, width = 320, height = 240 }) {
  const videoRef = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    let stream;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {}
    };
    if (on) start();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [on]);

  const shoot = () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = width; c.height = height;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, width, height);
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    onData && onData(dataUrl);
  };

  return (
    <div className="border rounded p-2 d-inline-block">
      {!on ? (
        <button className="btn btn-sm btn-secondary" onClick={() => setOn(true)}>Camera</button>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline width={width} height={height} style={{ background:"#000" }} />
          <div className="mt-2 d-flex gap-2">
            <button className="btn btn-sm btn-primary" onClick={shoot}>Foto</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setOn(false)}>Fechar</button>
          </div>
        </>
      )}

      <div className="mt-2">
        <label className="form-label small"> Selecionar</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="form-control form-control-sm"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => onData && onData(String(r.result));
            r.readAsDataURL(f);
          }}
        />
      </div>
    </div>
  );
}
