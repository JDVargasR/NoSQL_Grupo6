document.addEventListener("DOMContentLoaded", () => {
  const usuarioId = localStorage.getItem("usuarioId");

  if (!usuarioId || usuarioId.length !== 24) {
    Swal.fire({
      title: "Sesión inválida",
      text: "Tu sesión ha expirado o el ID de usuario es incorrecto.",
      icon: "warning",
      confirmButtonText: "Volver al login",
      scrollbarPadding: false,
      heightAuto: false
    }).then(() => {
      localStorage.clear();
      window.location.href = "login.html";
    });
    return;
  }

  fetch(`http://localhost:3000/api/usuarios/${usuarioId}`)
    .then(res => {
      if (!res.ok) throw new Error("No se pudo obtener el usuario");
      return res.json();
    })
    .then(usuario => {
      if (!usuario || usuario.estado !== "ACTIVO") throw new Error("Usuario inactivo");
      document.getElementById("correoUsuario").textContent = usuario.correo;

      if (usuario.tipo === "ADMIN") {
        iniciarCrudOpiniones();
      } else {
        iniciarVistaCliente();
      }
    })
    .catch(err => {
      console.error("Error al validar usuario:", err);
      Swal.fire({
        title: "Acceso denegado",
        text: "No tienes permisos para esta sección.",
        icon: "error",
        confirmButtonText: "Volver",
        scrollbarPadding: false,
        heightAuto: false
      }).then(() => window.location.href = "agenda.html");
    });
});

// CLIENTE: vista con formulario y estrellas
function iniciarVistaCliente() {
  const contenedor = document.querySelector(".opinion-section-container");
  contenedor.innerHTML = `
    <h2 class="opinion-titulo">Déjanos tu opinión</h2>

    <form id="formOpinion" class="form-reserva">
      <div class="form-group">
        <label for="nombre">Nombre:</label>
        <input type="text" id="nombre" required />
      </div>

      <div class="form-group">
        <label for="comentario">Comentario:</label>
        <input id="comentario" rows="3" required />
      </div>

      <div class="form-group">
        <label for="calificacion">Calificación (1-5):</label>
        <input type="number" id="calificacion" min="1" max="5" required />
      </div>

      <button type="submit" class="btn-naranja">Enviar Opinión</button>
    </form>

    <h2 class="opinion-subtitulo">Opiniones de otros usuarios</h2>
    <div id="listaOpiniones" class="opinion-listado-container"></div>
  `;

  cargarOpiniones();

  const form = document.getElementById("formOpinion");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const comentario = document.getElementById('comentario').value.trim();
    const calificacion = parseInt(document.getElementById('calificacion').value);

    if (!nombre || !comentario || isNaN(calificacion)) {
      alert("Por favor completa todos los campos correctamente.");
      return;
    }

    if (calificacion < 1 || calificacion > 5) {
      alert('La calificación debe estar entre 1 y 5.');
      return;
    }

    const nuevaOpinion = { usuario: nombre, comentario, calificacion };

    try {
      const res = await fetch('/api/opiniones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaOpinion)
      });

      if (res.ok) {
        form.reset();
        cargarOpiniones();
      } else {
        alert('Hubo un error al enviar tu opinión.');
      }
    } catch (err) {
      console.error('Error de red:', err);
      alert('Error de conexión con el servidor.');
    }
  });
}

// Función reutilizable para mostrar opiniones (con estrellitas)
async function cargarOpiniones() {
  try {
    const res = await fetch('/api/opiniones');
    const data = await res.json();

    const contenedor = document.getElementById('listaOpiniones');
    contenedor.innerHTML = '';

    data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    data.forEach(op => {
      const div = document.createElement('div');
      div.className = 'opinion';
      div.innerHTML = `
        <h3>${op.usuario}</h3>
        <p>${op.comentario}</p>
        <p>⭐ Calificación: ${'★'.repeat(op.calificacion)}</p>
      `;
      contenedor.appendChild(div);
    });
  } catch (error) {
    console.error('Error al cargar opiniones:', error);
    const contenedor = document.getElementById('listaOpiniones');
    contenedor.innerHTML = '<p>Error al cargar las opiniones.</p>';
  }
}

// ADMIN: vista CRUD completa
function iniciarCrudOpiniones() {
  const seccion = document.querySelector(".opinion-section-container");
  seccion.innerHTML = `
    <h2 class="opinion-titulo">Administrar Opiniones</h2>
    <button class="btn-naranja" id="btnAgregarOpinion">Agregar Opinión</button>
    <table class="adminUsuarios-tabla">
      <thead>
        <tr>
          <th>ID</th>
          <th>Usuario</th>
          <th>Comentario</th>
          <th>Calificación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="tablaOpiniones"></tbody>
    </table>
  `;

  const tbody = document.getElementById("tablaOpiniones");

  const cargar = async () => {
    try {
      const res = await fetch("/api/opiniones");
      const opiniones = await res.json();

      tbody.innerHTML = "";
      opiniones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      opiniones.forEach((op) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${op._id}</td>
          <td>${op.usuario}</td>
          <td>${op.comentario}</td>
          <td>${op.calificacion}</td>
          <td>
            <button class="btn-editar" data-id="${op._id}" style="margin: 5px 10px 15px 20px;">Editar</button>
            <button class="btn-eliminar" data-id="${op._id}" style="margin: 5px 10px 15px 20px;">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error al cargar opiniones:", error);
    }
  };

  // Botón agregar
  document.getElementById("btnAgregarOpinion").addEventListener("click", () => {
    mostrarFormularioOpinion();
  });

  // Acciones editar y eliminar
  tbody.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains("btn-editar")) {
      const res = await fetch(`/api/opiniones/${id}`);
      const op = await res.json();
      mostrarFormularioOpinion(op);
    }

    if (e.target.classList.contains("btn-eliminar")) {
      Swal.fire({
        title: "¿Eliminar?",
        text: "No podrás deshacer esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await fetch(`/api/opiniones/${id}`, { method: "DELETE" });
          if (res.ok) {
            Swal.fire("Eliminado", "Opinión eliminada", "success");
            cargar();
          } else {
            Swal.fire("Error", "No se pudo eliminar", "error");
          }
        }
      });
    }
  });

  cargar();
}

// Mostrar modal para agregar o editar opinión
function mostrarFormularioOpinion(opinion = null) {
  Swal.fire({
    title: opinion ? "Editar Opinión" : "Nueva Opinión",
    html: `
      <input id="swal-usuario" class="swal2-input" placeholder="Usuario" value="${opinion ? opinion.usuario : ""}">
      <input id="swal-comentario" class="swal2-textarea" placeholder="Comentario"${opinion ? opinion.comentario : ""}>
      <input type="number" id="swal-calificacion" class="swal2-input" placeholder="Calificación (1-5)" value="${opinion ? opinion.calificacion : ""}">
    `,
    focusConfirm: false,
    preConfirm: () => {
      const usuario = document.getElementById("swal-usuario").value.trim();
      const comentario = document.getElementById("swal-comentario").value.trim();
      const calificacion = parseInt(document.getElementById("swal-calificacion").value);

      if (!usuario || !comentario || isNaN(calificacion) || calificacion < 1 || calificacion > 5) {
        Swal.showValidationMessage("Completa todos los campos correctamente (1-5 estrellas)");
        return false;
      }

      return { usuario, comentario, calificacion };
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      const datos = result.value;
      const url = opinion ? `/api/opiniones/${opinion._id}` : "/api/opiniones";
      const metodo = opinion ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method: metodo,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos)
        });

        if (res.ok) {
          Swal.fire("Guardado", "Opinión registrada correctamente", "success");
          iniciarCrudOpiniones(); // Recargar
        } else {
          Swal.fire("Error", "No se pudo guardar", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Fallo en la conexión", "error");
      }
    }
  });
}