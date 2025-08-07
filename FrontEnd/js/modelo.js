const usuarioId = localStorage.getItem("usuarioId");

// Validar ID antes de proceder
if (!usuarioId || usuarioId.length !== 24) {
  Swal.fire({
    title: "Sesión inválida",
    text: "Tu sesión ha expirado o el ID del usuario es inválido.",
    icon: "warning",
    confirmButtonText: "Ir al login",
    scrollbarPadding: false,
    heightAuto: false
  }).then(() => {
    localStorage.clear();
    window.location.href = "login.html";
  });
} else {
  fetch(`http://localhost:3000/api/usuarios/${usuarioId}`)
    .then(res => {
      if (!res.ok) throw new Error("No se pudo obtener el usuario");
      return res.json();
    })
    .then(usuario => {
      if (!usuario || usuario.tipo !== "ADMIN" || usuario.estado !== "ACTIVO") {
        Swal.fire({
          title: "Acceso denegado",
          text: "Esta sección es solo para administradores activos",
          icon: "warning",
          confirmButtonText: "Volver al inicio",
          scrollbarPadding: false,
          heightAuto: false
        }).then(() => window.location.href = "agenda.html");
      } else {
        document.getElementById("correoUsuario").textContent = usuario.correo;
        iniciarCrudModelos();
      }
    })
    .catch(error => {
      console.error("Error al validar usuario:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo validar el usuario",
        icon: "error",
        confirmButtonText: "Volver al login",
        scrollbarPadding: false,
        heightAuto: false
      }).then(() => {
        localStorage.clear();
        window.location.href = "login.html";
      });
    });
}

function iniciarCrudModelos() {
  const tablaModelos = document.getElementById("tablaModelos");
  const modal = document.querySelector(".modalUsuarios");
  const btnAgregar = document.getElementById("btnAgregarModelo");
  const btnCerrar = modal.querySelector(".close");
  const btnGuardar = document.getElementById("btnGuardarModelo");

  const idInput = document.getElementById("modeloId");
  const marcaInput = document.getElementById("marca");
  const modeloInput = document.getElementById("modelo");
  const anioInput = document.getElementById("anio");
  const estadoInput = document.getElementById("estado");

  let editando = false;
  let idEditando = "";

  const cargarModelos = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/modelos");
      const modelos = await res.json();

      tablaModelos.innerHTML = "";
      modelos.forEach((m) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${m._id}</td>
          <td>${m.marca}</td>
          <td>${m.modelo}</td>
          <td>${m.anio}</td>
          <td>${m.estado}</td>
          <td>
            <button class="btn-editar" data-id="${m._id}">Editar</button>
            <button class="btn-eliminar" data-id="${m._id}">Eliminar</button>
          </td>
        `;
        tablaModelos.appendChild(fila);
      });
    } catch (err) {
      console.error("Error al cargar modelos:", err);
    }
  };

  btnAgregar.addEventListener("click", () => {
    editando = false;
    idEditando = "";
    idInput.value = "";
    marcaInput.value = "";
    modeloInput.value = "";
    anioInput.value = "";
    estadoInput.value = "ACTIVO";
    modal.style.display = "block";
  });

  btnCerrar.addEventListener("click", () => modal.style.display = "none");

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  btnGuardar.addEventListener("click", async () => {
    const datos = {
      marca: marcaInput.value,
      modelo: modeloInput.value,
      anio: parseInt(anioInput.value),
      estado: estadoInput.value
    };

    let url = "http://localhost:3000/api/modelos";
    let method = "POST";

    if (editando) {
      url += `/${idEditando}`;
      method = "PUT";
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Éxito", editando ? "Modelo actualizado" : "Modelo creado", "success");
        modal.style.display = "none";
        cargarModelos();
      } else {
        Swal.fire("Error", data.error || "Error desconocido", "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo guardar el modelo", "error");
    }
  });

  tablaModelos.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("btn-editar")) {
      try {
        const res = await fetch(`http://localhost:3000/api/modelos/${id}`);
        if (!res.ok) throw new Error("Error al obtener modelo");

        const modelo = await res.json();
        idEditando = modelo._id;
        editando = true;
        idInput.value = modelo._id;
        marcaInput.value = modelo.marca;
        modeloInput.value = modelo.modelo;
        anioInput.value = modelo.anio;
        estadoInput.value = modelo.estado;
        modal.style.display = "block";
      } catch (err) {
        Swal.fire("Error", "No se pudo cargar el modelo", "error");
      }
    }

    if (e.target.classList.contains("btn-eliminar")) {
      Swal.fire({
        title: "¿Eliminar modelo?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Sí, eliminar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`http://localhost:3000/api/modelos/${id}`, {
              method: "DELETE"
            });

            if (res.ok) {
              Swal.fire("Eliminado", "Modelo eliminado correctamente", "success");
              cargarModelos();
            } else {
              Swal.fire("Error", "No se pudo eliminar el modelo", "error");
            }
          } catch (err) {
            Swal.fire("Error", "Error en el servidor", "error");
          }
        }
      });
    }
  });

  cargarModelos();
}