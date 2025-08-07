const usuarioId = localStorage.getItem("usuarioId");

if (!usuarioId) {
  Swal.fire({
    title: "No has iniciado sesión",
    icon: "warning",
    confirmButtonText: "Ir al login"
  }).then(() => window.location.href = "login.html");
} else {
  fetch(`http://localhost:3000/api/usuarios/${usuarioId}`)
    .then(res => {
      if (!res.ok) throw new Error("No se pudo obtener el usuario");
      return res.json();
    })
    .then(usuario => {
      if (!usuario || usuario.estado !== "ACTIVO") {
        Swal.fire({
          title: "Acceso denegado",
          text: "Tu cuenta no está activa",
          icon: "warning",
          confirmButtonText: "Volver al inicio"
        }).then(() => window.location.href = "agenda.html");
      } else {
        document.querySelector(".user-email").textContent = usuario.correo;
        iniciarCrudRecomendaciones(usuario);
      }
    })
    .catch(error => {
      console.error("Error de validación:", error);
      Swal.fire("Error", "No se pudo validar el usuario", "error")
        .then(() => window.location.href = "login.html");
    });
}

function iniciarCrudRecomendaciones(usuario) {
  const tabla = document.getElementById("tablaRecomendaciones");
  const modal = document.querySelector(".modalRecomendaciones");
  const btnAgregar = document.getElementById("btnAgregarRecomendacion");
  const btnCerrar = modal.querySelector(".close");
  const btnGuardar = document.getElementById("btnGuardarRecomendacion");

  const idInput = document.getElementById("recomendacionId");
  const textoInput = document.getElementById("recomendacion");
  const estadoInput = document.getElementById("id_estado");
  const grupoEstado = document.getElementById("grupoEstado");

  let editando = false;
  let idEditando = "";

  if (usuario.tipo !== "CLIENTE") {
    btnAgregar.style.display = "none";
  }

  const cargarRecomendaciones = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/recomendaciones");
      const recomendaciones = await res.json();

      tabla.innerHTML = "";

      const encabezado = document.createElement("tr");
      encabezado.innerHTML = usuario.tipo === "ADMIN"
        ? `<th>Recomendación</th><th>Acciones</th>`
        : `<th>Recomendación</th>`;
      tabla.appendChild(encabezado);

      recomendaciones.forEach((r) => {
        // Ocultar inactivas para todos
        if (r.id_estado === 0) return;

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${r.recomendacion}</td>
          ${
            usuario.tipo === "ADMIN"
              ? `<td>
                  <button class="btn-editar" data-id="${r._id}">Editar</button>
                  <button class="btn-eliminar" data-id="${r._id}">Eliminar</button>
                </td>`
              : ""
          }
        `;
        tabla.appendChild(fila);
      });
    } catch (err) {
      console.error("Error al cargar recomendaciones:", err);
    }
  };

  btnAgregar.addEventListener("click", () => {
    editando = false;
    idEditando = "";
    idInput.value = "";
    textoInput.value = "";
    estadoInput.value = "1";
    grupoEstado.style.display = "none"; 
    modal.style.display = "block";
  });

  btnCerrar.addEventListener("click", () => modal.style.display = "none");

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  btnGuardar.addEventListener("click", async () => {
    if (usuario.tipo !== "CLIENTE" && !editando) {
      return Swal.fire("Acción no permitida", "Solo los clientes pueden crear recomendaciones", "warning");
    }

    const recomendacionTexto = textoInput.value.trim();
    const estadoSeleccionado = parseInt(estadoInput.value);

    if (!recomendacionTexto) {
      return Swal.fire("Error", "La recomendación no puede estar vacía", "warning");
    }

    if (estadoSeleccionado === 0) {
      return Swal.fire("Aviso", "No se puede guardar una recomendación con estado inactivo", "info");
    }

    const datos = {
      recomendacion: recomendacionTexto,
      id_estado: estadoSeleccionado
    };

    let url = "http://localhost:3000/api/recomendaciones";
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
        Swal.fire("Éxito", editando ? "Recomendación actualizada" : "Recomendación creada", "success");
        modal.style.display = "none";
        cargarRecomendaciones();
      } else {
        Swal.fire("Error", "Hubo un problema para guardar la recomendación", "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  });

  tabla.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("btn-editar") && usuario.tipo === "ADMIN") {
      try {
        const res = await fetch(`http://localhost:3000/api/recomendaciones/${id}`);
        if (!res.ok) throw new Error("Error al obtener la recomendación");

        const recomendacion = await res.json();
        idEditando = recomendacion._id;
        editando = true;
        idInput.value = recomendacion._id;
        textoInput.value = recomendacion.recomendacion;
        estadoInput.value = recomendacion.id_estado || 1;
        grupoEstado.style.display = "block";
        modal.style.display = "block";
      } catch (err) {
        Swal.fire("Error", "No se pudo cargar la recomendación", "error");
      }
    }

    if (e.target.classList.contains("btn-eliminar") && usuario.tipo === "ADMIN") {
      Swal.fire({
        title: "¿Eliminar recomendación?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Sí, eliminar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetch(`http://localhost:3000/api/recomendaciones/${id}`, {
              method: "DELETE"
            });

            if (res.ok) {
              Swal.fire("Eliminado", "Recomendación eliminada correctamente", "success");
              cargarRecomendaciones();
            } else {
              Swal.fire("Error", "No se pudo eliminar la recomendación", "error");
            }
          } catch (err) {
            Swal.fire("Error", "Error en el servidor", "error");
          }
        }
      });
    }
  });

  cargarRecomendaciones();
}
