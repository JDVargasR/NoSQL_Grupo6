function iniciarCrudRecomendaciones() {
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

  const cargarRecomendaciones = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/recomendaciones");
      const recomendaciones = await res.json();

      tabla.innerHTML = "";
      recomendaciones.forEach((r) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${r.recomendacion}</td>
          <td>
            <button class="btn-editar" data-id="${r._id}">Editar</button>
            <button class="btn-eliminar" data-id="${r._id}">Eliminar</button>
          </td>
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
    estadoInput.value = "1"; // Por defecto activo
    grupoEstado.style.display = "block"; // Mostrar campo estado al agregar
    modal.style.display = "flex";
  });

  btnCerrar.addEventListener("click", () => modal.style.display = "none");

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  btnGuardar.addEventListener("click", async () => {
    const datos = {
      recomendacion: textoInput.value.trim()
    };

    if (!datos.recomendacion) {
      return Swal.fire("Error", "La recomendación no puede estar vacía", "warning");
    }

    if (!editando) {
      datos.id_estado = parseInt(estadoInput.value);

      // Validar si está inactivo y cancelar creación
      if (datos.id_estado === 0) {
        return Swal.fire("Aviso", "La recomendación no fue creada porque está inactiva.", "info");
      }
    }

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
        Swal.fire("Error", "Hubo un problema para crear la recomendación.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Hubo un problema para crear la recomendación.", "error");
    }
  });

  tabla.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("btn-editar")) {
      try {
        const res = await fetch(`http://localhost:3000/api/recomendaciones/${id}`);
        if (!res.ok) throw new Error("Error al obtener la recomendación");

        const recomendacion = await res.json();
        idEditando = recomendacion._id;
        editando = true;
        idInput.value = recomendacion._id;
        textoInput.value = recomendacion.recomendacion;
        grupoEstado.style.display = "none"; // Ocultar campo estado al editar
        modal.style.display = "flex";
      } catch (err) {
        Swal.fire("Error", "No se pudo cargar la recomendación", "error");
      }
    }

    if (e.target.classList.contains("btn-eliminar")) {
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

document.addEventListener("DOMContentLoaded", iniciarCrudRecomendaciones);
