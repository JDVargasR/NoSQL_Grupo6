document.addEventListener("DOMContentLoaded", () => {
  const idUsuarioInput = document.getElementById("idUsuario");
  const idModeloSelect = document.getElementById("idModelo");
  const idEspacioSelect = document.getElementById("idEspacio");
  const formReserva = document.getElementById("formReserva");

  const usuarioId = localStorage.getItem("usuarioId");
  const isObjectId = (s) => typeof s === "string" && /^[0-9a-fA-F]{24}$/.test(s);

  // Sesión
  if (!usuarioId || !isObjectId(usuarioId)) {
    Swal.fire({
      title: "Sesión no iniciada",
      text: "Por favor, inicia sesión",
      icon: "warning",
      confirmButtonText: "Ir al login"
    }).then(() => (window.location.href = "login.html"));
    return;
  }

  if (idUsuarioInput) idUsuarioInput.value = usuarioId;

  // Helpers de UI
  function setLoading(selectEl, loading, placeholder = "Cargando...") {
    if (!selectEl) return;
    selectEl.disabled = !!loading;
    if (loading) {
      selectEl.innerHTML = `<option>${placeholder}</option>`;
    }
  }

  // Cargar SOLO modelos ACTIVO
  async function cargarModelosActivos() {
    if (!idModeloSelect) return;

    setLoading(idModeloSelect, true, "Cargando modelos activos...");

    try {
      const res = await fetch("http://localhost:3000/api/modelos/activos");
      const modelos = await res.json();
      if (!res.ok) throw new Error(modelos?.error || "No se pudieron obtener los modelos activos");

      idModeloSelect.innerHTML = `<option value="">Seleccione un modelo</option>`;

      if (!Array.isArray(modelos) || modelos.length === 0) {
        idModeloSelect.innerHTML = `<option value="">(Sin modelos activos)</option>`;
        idModeloSelect.disabled = true;
        return;
      }

      modelos.forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m._id;
        const anio = m.anio ? ` (${m.anio})` : "";
        const placa = m.placa ? ` • ${m.placa}` : "";
        opt.textContent = `${m.marca || "Marca"} ${m.modelo || "Modelo"}${anio}${placa}`;
        idModeloSelect.appendChild(opt);
      });
      idModeloSelect.disabled = false;
    } catch (err) {
      console.error("Error al cargar modelos activos:", err);
      idModeloSelect.innerHTML = `<option value="">(Error cargando modelos)</option>`;
      idModeloSelect.disabled = true;
      Swal.fire("Error", err.message || "No se pudieron obtener los modelos activos", "error");
    }
  }

  // Cargar ESPACIOS (siempre, sin filtrar)
  async function cargarEspaciosSiempre() {
    if (!idEspacioSelect) return;

    setLoading(idEspacioSelect, true, "Cargando espacios...");

    try {
      const res = await fetch("http://localhost:3000/api/espacios");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudieron obtener los espacios");

      const espacios = Array.isArray(data) ? data : [];

      idEspacioSelect.innerHTML = `<option value="">Seleccione un espacio</option>`;

      if (espacios.length === 0) {
        idEspacioSelect.innerHTML = `<option value="">(Sin espacios cargados)</option>`;
        idEspacioSelect.disabled = true;
        return;
      }

      espacios.forEach((e) => {
        const opt = document.createElement("option");
        opt.value = e._id;
        // soporta distintos nombres de campo: numero_espacio | numero | codigo
        const num = e.numero_espacio ?? e.numero ?? e.codigo ?? "?";
        const etiquetaEstado = e.estado ? ` — ${String(e.estado).toUpperCase()}` : "";
        opt.textContent = `Espacio #${num}`;
        idEspacioSelect.appendChild(opt);
      });

      idEspacioSelect.disabled = false;
    } catch (err) {
      console.error("Error al cargar espacios", err);
      idEspacioSelect.innerHTML = `<option value="">(Error cargando espacios)</option>`;
      idEspacioSelect.disabled = true;
      Swal.fire("Error", err.message || "No se pudieron obtener los espacios", "error");
    }
  }

  // Lanzar cargas
  cargarModelosActivos();
  cargarEspaciosSiempre();

  // Guardar reserva
  formReserva?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id_modelo = idModeloSelect?.value?.trim();
    const id_espacio = idEspacioSelect?.value?.trim();

    if (!isObjectId(usuarioId)) {
      Swal.fire("Sesión inválida", "Vuelve a iniciar sesión", "warning").then(() => {
        localStorage.clear();
        window.location.href = "login.html";
      });
      return;
    }
    if (!isObjectId(id_modelo)) {
      Swal.fire("Modelo requerido", "Selecciona un modelo ACTIVO válido.", "warning");
      return;
    }
    if (!isObjectId(id_espacio)) {
      Swal.fire("Espacio requerido", "Selecciona un espacio válido.", "warning");
      return;
    }

    const datos = {
      id_usuario: usuarioId,
      id_modelo,
      id_espacio,
      estado: "INACTIVO"
    };

    // Confirmación
    const { isConfirmed } = await Swal.fire({
      title: "Crear reserva",
      text: "¿Confirmas crear la reserva?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, crear",
      cancelButtonText: "Cancelar",
      reverseButtons: true
    });
    if (!isConfirmed) return;

    const submitBtn = formReserva.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch("http://localhost:3000/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      const data = await res.json();

      if (res.ok) {
        await Swal.fire("Reserva creada", "La reserva fue registrada exitosamente", "success");
        formReserva.reset();
        idModeloSelect.selectedIndex = 0;
        idEspacioSelect.selectedIndex = 0;
        // cargarModelosActivos();
        // cargarEspaciosSiempre();
      } else {
        Swal.fire("Error", data.error || "No se pudo crear la reserva", "error");
      }
    } catch (error) {
      console.error("Error al crear la reserva:", error);
      Swal.fire("Error", "Error al crear la reserva", "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});