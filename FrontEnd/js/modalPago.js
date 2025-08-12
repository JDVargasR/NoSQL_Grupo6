(() => {
  const els = () => ({
    overlay: document.getElementById('agendaPagoOverlay'),
    form: document.getElementById('agendaPagoForm'),
    btnCerrar: document.getElementById('agendaPagoCerrar'),
    btnCancelar: document.getElementById('agendaPagoCancelar'),
    inputReservaId: document.getElementById('agendaPagoReservaId'),
    inputMonto: document.getElementById('agendaPagoMonto'),
    selectTipo: document.getElementById('agendaPagoMetodo'),
    inputDescuento: document.getElementById('agendaPagoDescuento'),
  });

  const isValidObjectId = (id) => typeof id === 'string' && id.length === 24;

  function show() {
    const { overlay } = els();
    if (!overlay) {
      console.error('Modal Pago: no se encontró #agendaPagoOverlay');
      Swal.fire({ title: 'Error', text: 'No se encontró el modal de pago.', icon: 'error' });
      return;
    }
    overlay.classList.add('agendaPago-open');
  }

  function hide() {
    const { overlay } = els();
    overlay?.classList.remove('agendaPago-open');
  }

  // --- API calls ---
  async function crearPago(usuarioId, payload) {
    const res = await fetch('http://localhost:3000/api/pagos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-usuario-id': usuarioId },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Error HTTP ${res.status}`);
    return data;
  }

  async function completarReserva(usuarioId, reservaId) {
    const res = await fetch(`http://localhost:3000/api/reservas/${reservaId}/completar`, {
      method: 'PATCH',
      headers: { 'x-usuario-id': usuarioId, 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Error HTTP ${res.status}`);
    return data;
  }

  // --- API global para abrir el modal desde agenda.js ---
  window.abrirModalPago = (reservaId, montoSugerido) => {
    const { inputReservaId, inputMonto, selectTipo, inputDescuento } = els();
    if (!inputReservaId || !inputMonto || !selectTipo || !inputDescuento) {
      console.error('Modal Pago: elementos del formulario no disponibles');
      Swal.fire({ title: 'Error', text: 'El formulario de pago no está disponible.', icon: 'error' });
      return;
    }
    inputReservaId.value = reservaId || '';
    inputMonto.value = typeof montoSugerido === 'number' ? montoSugerido : '';
    selectTipo.value = 'EFECTIVO';
    inputDescuento.value = '0';
    show();
  };

  // --- Enlazar eventos cuando el DOM esté listo ---
  document.addEventListener('DOMContentLoaded', () => {
    const { overlay, form, btnCerrar, btnCancelar } = els();

    // Cerrar modal
    btnCerrar?.addEventListener('click', hide);
    btnCancelar?.addEventListener('click', (e) => { e.preventDefault(); hide(); });
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) hide(); });

    // Enviar pago + completar reserva
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const { inputReservaId, inputMonto, selectTipo, inputDescuento } = els();
      const usuarioId = localStorage.getItem('usuarioId');

      if (!usuarioId || !isValidObjectId(usuarioId)) {
        await Swal.fire({
          title: 'Sesión inválida',
          text: 'Inicia sesión nuevamente.',
          icon: 'warning',
          confirmButtonText: 'Ir al login',
          scrollbarPadding: false,
          heightAuto: false
        });
        localStorage.clear();
        window.location.href = 'login.html';
        return;
      }

      const reservaId = inputReservaId.value;
      const monto = Number(inputMonto.value);
      const tipo = String(selectTipo.value || 'EFECTIVO');
      const descuento = inputDescuento.value === '' ? 0 : Number(inputDescuento.value);

      if (!isValidObjectId(reservaId)) {
        Swal.fire({ title: 'Reserva inválida', text: 'ID de reserva inválido.', icon: 'warning' });
        return;
      }
      if (isNaN(monto) || monto <= 0) {
        Swal.fire({ title: 'Monto inválido', text: 'Ingresa un monto mayor a 0.', icon: 'warning' });
        return;
      }
      if (isNaN(descuento) || descuento < 0) {
        Swal.fire({ title: 'Descuento inválido', text: 'Debe ser un número ≥ 0.', icon: 'warning' });
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        // 1) Registrar pago
        await crearPago(usuarioId, {
          monto_pago: monto,
          tipo_pago: tipo,
          id_descuento: descuento
        });

        // 2) Completar la reserva (ACTIVO -> COMPLETADA)
        await completarReserva(usuarioId, reservaId);

        hide();
        await Swal.fire({
          title: 'Reserva completada',
          text: 'El pago fue registrado de manera correcta',
          icon: 'success',
          confirmButtonText: 'OK',
          scrollbarPadding: false,
          heightAuto: false
        });

        // Notificar para refrescar agenda
        document.dispatchEvent(new CustomEvent('reservaCompletada'));
        // Compatibilidad con listeners anteriores
        document.dispatchEvent(new CustomEvent('pagoExitoso'));

      } catch (err) {
        console.error('Error en pago/completar:', err);
        Swal.fire({
          title: 'No se pudo completar',
          text: err.message || 'Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'OK',
          scrollbarPadding: false,
          heightAuto: false
        });
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
})();