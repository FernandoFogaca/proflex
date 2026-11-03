import { useState } from "react";
import { salvarFotoTeste } from "../services/cloudinary.js";

export default function TesteCloudinary() {
  const [mensagem, setMensagem] = useState("");

  async function testarFoto(event) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    setMensagem("Enviando imagem...");

    try {
      const url = await salvarFotoTeste(arquivo);
      setMensagem("Imagem enviada com sucesso!");
      console.log("URL da imagem:", url);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao enviar imagem.");
    }
  }

  return (
    <div className="container py-4">
      <h2>Teste Cloudinary</h2>

      <input
        type="file"
        accept="image/*"
        onChange={testarFoto}
      />

      <p className="mt-3">{mensagem}</p>
    </div>
  );
}