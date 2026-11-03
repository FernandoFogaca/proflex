export async function salvarFotoTeste(arquivo) {
  const dados = new FormData();

  dados.append("file", arquivo);
  dados.append("upload_preset", "proflex_teste");

  const resposta = await fetch(
    "https://api.cloudinary.com/v1_1/scpp5uyj/image/upload",
    {
      method: "POST",
      body: dados,
    }
  );

  if (!resposta.ok) {
    throw new Error("Erro ao enviar foto ao Cloudinary");
  }

  const resultado = await resposta.json();
  return resultado.secure_url;
}