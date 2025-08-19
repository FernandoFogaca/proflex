import React, {useState} from "react";
import {useNavigate} from "react-router-dom";


export default function DevLogin(){
 const [senha,setSenha]=useState("");
 const [autenticado, seAutenticado]=useState(false);
 const senhaCorreta="063807760599307575@fF";


 function handleLogin(e){
e.preventDefault();//evita que formulario carregue a pagina
if(senha===senhaCorreta){
  setAutenticado(true);
  alert("Authorised Login!")
}else{
alert("Access Denied!");
}
 }
return (
    <form
      onSubmit={handleLogin}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "100px",
        fontFamily: "sans-serif"
      }}
    >
      <h2>🔒 Dev Login</h2>
      <input
        type="password"
        placeholder="Digite a senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        style={{
          padding: "10px",
          marginBottom: "10px",
          fontSize: "1rem",
          borderRadius: "5px",
          border: "1px solid #ccc"
        }}
      />
      <button
        type="submit"
        style={{
          padding: "10px 20px",
          fontSize: "1rem",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Entrar
      </button>
    </form>
  );
}