{/* Local de utilizacao Login/Header/App/rotas 
Efeito bloqueia/permite acesso às páginas e mantém
 o usuário logado enquanto o navegador guardar o localStorage.
    logged diz se está logado true/false
    login marca como logado e salva o papel(tenant).
    logout limpa tudo (desloga).
getRole/setRole define o papel do usuário ex. owner, user.
getTenant/setTenant define a empresa/conta ativa.
       
    */}

// chaves no localStorage (prefixo pf_ = proflex)
const KEY_LOGGED = "pf_logged"; // "1" quando logado
const KEY_ROLE = "pf_role"; // papel do usuário: superadmin | owner | user | guest
const KEY_TENANT = "pf_tenant"; // conta/empresa atual (JSON)

// gerador  de id
const uid = (p = "id") =>
  `${p}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;

// funcao de sessao...(login/logout)

/// aqui retorna true ou false se  sessao ativa

export const logged = () => localStorage.getItem(KEY_LOGGED) === "1";

// cria e atualiza sessao, login guarda quen está logado.
// logged consulta,  logout limpa.

export const login = ({ role = "user", tenant = null } = {}) => {
  localStorage.setItem(KEY_LOGGED, "1");
  localStorage.setItem(KEY_LOGGED, "1");
  localStorage.setItem(KEY_ROLE, role);
  if (tenant) {
    localStorage.setItem(KEY_TENANT, JSON.stringify(tenant));
  }

  // paga a sessao

}
  export const logout = () => {
    localStorage.removeItem(KEY_LOGGED);
    localStorage.removeItem(KEY_ROLE);
    localStorage.removeItem(KEY_TENANT);
  };

// define o paple do usuario

export const getRole = ()=>localStorage.getItem(KEY_ROLE) || 'guest';
export const setRole =(r)=>localStorage.setItem(KEY_ROLE, r);

export const getTenant = ()=>{

try{

return JSON.parse(localStorage.getItem(KEY_TENANT) || 'null' );
}catch{

return null;



}



};

export const setTenant = (t)=>localStorage.setItem(KEY_TENANT,JSON.stringify(t))



















