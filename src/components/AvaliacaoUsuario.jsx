import React, { useState, useEffect } from "react";

export default function AvaliacaoUsuario() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("https://reqres.in/api/users?per_page=6", {
      headers: {
        "x-api-key": "reqres-free-v1"
      }
    })
      .then((res) => res.json())
      .then((dados) => setUsuarios(dados.data))
      .catch(() => setUsuarios([]));
  }, []);

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Quem já usa o ProFlex</h2>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {usuarios.map((user) => (
          <div key={user.id} className="col">
            <div className="card h-100 text-center shadow-sm border-0 p-3">
              <img
                src={user.avatar}
                alt={user.first_name}
                className="rounded-circle mx-auto"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
              />
              <h6 className="mt-3 mb-1">
                {user.first_name} {user.last_name}
              </h6>
             
              <div className="text-warning">★★★★★</div>
              <p className="small text-success mt-2">
                “Muito prático no dia a dia!”
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
