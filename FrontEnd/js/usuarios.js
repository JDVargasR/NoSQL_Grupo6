const usuarioId = localStorage.getItem("usuarioId");

if (!usuarioId) {
  Swal.fire({
    title: "No has iniciado sesión",
    icon: "warning",
    confirmButtonText: "Ir al login",
    scrollbarPadding: false,
    heightAuto: false
  }).then(() => window.location.href = "login.html");
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
        document.querySelector(".user-email").textContent = usuario.correo;
        iniciarCrudUsuarios();
      }
    })
    .catch(error => {
      console.error("Error de validación:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo validar el usuario",
        icon: "error",
        confirmButtonText: "Volver al login",
        scrollbarPadding: false,
        heightAuto: false
      }).then(() => window.location.href = "login.html");
    });
}

function iniciarCrudUsuarios() {
  const tablaUsuarios = document.getElementById("tablaUsuarios");
  const modal = document.querySelector(".modalUsuarios");
  const btnAgregar = document.getElementById("btnAgregarUsuario");
  const btnCerrar = modal.querySelector(".close");
  const btnGuardar = document.getElementById("btnGuardarUsuario");

  const idInput = document.getElementById("usuarioId");
  const nombreInput = document.getElementById("nombreUsuario");
  const correoInput = document.getElementById("correoUsuario");
  const contrasenaInput = document.getElementById("contrasenaUsuario");
  const tipoInput = document.getElementById("tipoUsuario");
  const estadoInput = document.getElementById("estadoUsuario");

  let editando = false;
  let idEditando = "";

  const cargarUsuarios = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/usuarios");
      const usuarios = await response.json();

      tablaUsuarios.innerHTML = "";
      usuarios.forEach((usuario) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${usuario._id}</td>
          <td>${usuario.nombre}</td>
          <td>${usuario.correo}</td>
          <td>${usuario.tipo}</td>
          <td>${usuario.estado}</td>
          <td>
            <button class="btn-editar" data-id="${usuario._id}">Editar</button>
            <button class="btn-eliminar" data-id="${usuario._id}">Eliminar</button>
          </td>
        `;
        tablaUsuarios.appendChild(fila);
      });
    } catch (error) {
      console.error("Error al cargar usuarios", error);
    }
  };

  btnAgregar.addEventListener("click", () => {
    editando = false;
    idEditando = "";
    idInput.value = "";
    nombreInput.value = "";
    correoInput.value = "";
    contrasenaInput.value = "";
    tipoInput.value = "CLIENTE";
    estadoInput.value = "ACTIVO";
    modal.style.display = "block";
  });

  btnCerrar.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  btnGuardar.addEventListener("click", async () => {
    const usuario = {
      nombre: nombreInput.value,
      correo: correoInput.value,
      contrasenna: contrasenaInput.value,
      tipo: tipoInput.value,
      estado: estadoInput.value
    };

    let url = "http://localhost:3000/api/usuarios";
    let method = "POST";

    if (editando) {
      url += `/${idEditando}`;
      method = "PUT";
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire("Éxito", editando ? "Usuario actualizado" : "Usuario creado", "success");
        modal.style.display = "none";
        cargarUsuarios();
      } else {
        Swal.fire("Error", data.error || "Error desconocido", "error");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo guardar el usuario", "error");
    }
  });

  tablaUsuarios.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("btn-editar")) {
      try {
        const res = await fetch(`http://localhost:3000/api/usuarios/${id}`);
        if (!res.ok) throw new Error("Error al obtener usuario");

        const usuario = await res.json();
        idEditando = usuario._id;
        editando = true;
        idInput.value = usuario._id;
        nombreInput.value = usuario.nombre;
        correoInput.value = usuario.correo;
        contrasenaInput.value = usuario.contrasenna;
        tipoInput.value = usuario.tipo;
        estadoInput.value = usuario.estado;
        modal.style.display = "block";
      } catch (err) {
        Swal.fire("Error", "No se pudo cargar el usuario", "error");
      }
    }

    if (e.target.classList.contains("btn-eliminar")) {
      Swal.fire({
        title: "¿Seguro que desea eliminar?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Sí, eliminar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
              method: "DELETE"
            });

            if (res.ok) {
              Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
              cargarUsuarios();
            } else {
              Swal.fire("Error", "No se pudo eliminar el usuario", "error");
            }
          } catch (err) {
            Swal.fire("Error", "Error en el servidor", "error");
          }
        }
      });
    }
  });

  cargarUsuarios();
}