document.addEventListener("DOMContentLoaded", () => {
  cargarOpiniones();

  // Manejador para enviar una nueva opinión
  const form = document.getElementById('formOpinion');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const comentario = document.getElementById('comentario').value.trim();
    const calificacion = parseInt(document.getElementById('calificacion').value);

    // Validación básica
    if (!nombre || !comentario || isNaN(calificacion)) {
      alert("Por favor completa todos los campos correctamente.");
      return;
    }

    if (calificacion < 1 || calificacion > 5) {
      alert('La calificación debe estar entre 1 y 5.');
      return;
    }

    const nuevaOpinion = {
      usuario: nombre,
      comentario: comentario,
      calificacion: calificacion
    };

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
});

// Función para cargar y mostrar las opiniones
async function cargarOpiniones() {
  try {
    const res = await fetch('/api/opiniones');
    const data = await res.json();

    const contenedor = document.getElementById('listaOpiniones');
    contenedor.innerHTML = '';

    data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordena por fecha descendente

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