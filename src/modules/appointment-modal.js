import { obtenerExpedientes } from '../services/clinicalService.js';
import {
    guardarCita,
    actualizarCita,
    confirmarCita,
    cancelarCita,
    completarCita
} from '../services/appointmentService.js';
import { recargarCalendario } from '../modules/calendar-ui.js';

// ─────────────────────────────────────────────
//  TIPOS DE CITA DISPONIBLES
// ─────────────────────────────────────────────
const TIPOS_CITA = [
    'Revisión general',
    'Limpieza dental',
    'Extracción',
    'Ortodoncia',
    'Endodoncia',
    'Blanqueamiento',
    'Radiografía',
    'Otro',
];

// ─────────────────────────────────────────────
//  INIT — escucha eventos del calendario
//  Llamar desde admin.js una sola vez al cargar
// ─────────────────────────────────────────────
export function inicializarModalesCitas() {
    // Click en slot vacío → abrir modal nueva cita
    window.addEventListener('calendario:nuevaCita', (e) => {
        abrirModalNuevaCita(e.detail.fecha, e.detail.horaInicio);
    });

    // Click en tarjeta de cita → abrir modal detalle
    window.addEventListener('calendario:verCita', (e) => {
        abrirModalDetalleCita(e.detail.cita);
    });

    // Botón "+ Nueva Cita Manual" del dashboard
    document.getElementById('btn-nueva-cita-manual')?.addEventListener('click', () => {
        abrirModalNuevaCita();
    });
}

// ─────────────────────────────────────────────
//  MODAL: NUEVA CITA MANUAL
//  fecha y horaInicio son opcionales (vienen del calendario)
// ─────────────────────────────────────────────
async function abrirModalNuevaCita(fecha = '', horaInicio = '') {
    // Cargar expedientes para el buscador de pacientes
    let expedientes = [];
    try {
        expedientes = await obtenerExpedientes();
    } catch (e) {
        console.error('Error cargando expedientes:', e);
    }

    // Opciones del select de tipo
    const opcionesTipo = TIPOS_CITA.map(t =>
        `<option value="${t}">${t}</option>`
    ).join('');

    // Opciones de pacientes
    const opcionesPacientes = [
        `<option value="">— Selecciona un paciente —</option>`,
        ...expedientes.map(p =>
            `<option value="${p.id}" data-nombre="${p.nombre}" data-telefono="${p.telefono}">${p.nombre} — ${p.telefono}</option>`
        )
    ].join('');

    // Horas disponibles cada 30 min (06:00 – 21:30)
    const opcionesHora = generarOpcionesHora(horaInicio);

    // Construir body del modal
    document.getElementById('modal-cita-titulo').textContent = 'Nueva Cita Manual';
    document.getElementById('modal-cita-body').innerHTML = `
        <div class="mb-3">
            <label class="form-label fw-semibold">Paciente</label>
            <select class="form-select" id="cita-paciente-select">
                ${opcionesPacientes}
            </select>
        </div>
        <div class="row g-3 mb-3">
            <div class="col-md-4">
                <label class="form-label fw-semibold">Fecha</label>
                <input type="date" class="form-control" id="cita-fecha"
                    value="${fecha}" min="${hoy()}">
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold">Hora inicio</label>
                <select class="form-select" id="cita-hora-inicio">
                    ${opcionesHora}
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold">Duración</label>
                <select class="form-select" id="cita-duracion">
                    <option value="30">30 min</option>
                    <option value="60" selected>60 min</option>
                    <option value="90">90 min</option>
                </select>
            </div>
        </div>
        <div class="mb-3">
            <label class="form-label fw-semibold">Tipo de cita</label>
            <select class="form-select" id="cita-tipo">
                ${opcionesTipo}
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-semibold">Motivo / detalle</label>
            <textarea class="form-control" id="cita-motivo" rows="2"
                placeholder="Describe brevemente el motivo de la consulta"></textarea>
        </div>
        <div class="mb-1">
            <label class="form-label fw-semibold">Notas internas</label>
            <textarea class="form-control" id="cita-notas" rows="2"
                placeholder="Notas visibles solo para el dentista (opcional)"></textarea>
        </div>
    `;

    // Footer: cancelar + guardar
    document.getElementById('modal-cita-footer').innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="btn-guardar-nueva-cita">
            <i class="bi bi-save me-2"></i>Guardar Cita
        </button>
    `;

    document.getElementById('btn-guardar-nueva-cita').addEventListener('click', guardarNuevaCita);

    abrirModal();
}

async function guardarNuevaCita() {
    const btn = document.getElementById('btn-guardar-nueva-cita');

    const selectPaciente = document.getElementById('cita-paciente-select');
    const pacienteId  = selectPaciente.value;
    const opcionSel   = selectPaciente.options[selectPaciente.selectedIndex];
    const nombre      = opcionSel?.dataset?.nombre  ?? '';
    const telefono    = opcionSel?.dataset?.telefono ?? '';
    const fecha       = document.getElementById('cita-fecha').value;
    const horaInicio  = document.getElementById('cita-hora-inicio').value;
    const duracion    = parseInt(document.getElementById('cita-duracion').value);
    const tipo        = document.getElementById('cita-tipo').value;
    const motivo      = document.getElementById('cita-motivo').value.trim();
    const notas       = document.getElementById('cita-notas').value.trim();

    // Validaciones mínimas
    if (!pacienteId) return mostrarErrorModal('Selecciona un paciente.');
    if (!fecha)      return mostrarErrorModal('Indica la fecha de la cita.');
    if (!horaInicio) return mostrarErrorModal('Indica la hora de inicio.');

    try {
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        await guardarCita({
            pacienteId,
            nombre,
            telefono,
            fecha,
            horaInicio,
            duracion,
            tipo,
            motivo,
            notas,
            estado: 'confirmada',   // manual = ya confirmada
            origen: 'manual',
        });

        cerrarModal();
        await recargarCalendario();

    } catch (e) {
        console.error('Error guardando cita:', e);
        mostrarErrorModal('Ocurrió un error al guardar. Intenta de nuevo.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Cita';
    }
}

// ─────────────────────────────────────────────
//  MODAL: DETALLE DE CITA EXISTENTE
// ─────────────────────────────────────────────
function abrirModalDetalleCita(cita) {
    const colores = {
        pendiente:  'warning',
        confirmada: 'success',
        cancelada:  'danger',
        completada: 'secondary',
    };
    const badgeColor = colores[cita.estado] ?? 'secondary';

    document.getElementById('modal-cita-titulo').textContent = 'Detalle de Cita';
    document.getElementById('modal-cita-body').innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
                <h5 class="fw-bold mb-1">${cita.nombre}</h5>
                <span class="text-muted small"><i class="bi bi-phone me-1"></i>${cita.telefono}</span>
            </div>
            <span class="badge bg-${badgeColor} fs-6 text-capitalize">${cita.estado}</span>
        </div>
        <hr>
        <div class="row g-2 mb-3">
            <div class="col-sm-4">
                <span class="text-muted small d-block">Fecha</span>
                <strong>${formatearFecha(cita.fecha)}</strong>
            </div>
            <div class="col-sm-4">
                <span class="text-muted small d-block">Horario</span>
                <strong>${cita.horaInicio} – ${cita.horaFin}</strong>
            </div>
            <div class="col-sm-4">
                <span class="text-muted small d-block">Duración</span>
                <strong>${cita.duracion} min</strong>
            </div>
        </div>
        <div class="row g-2 mb-3">
            <div class="col-sm-6">
                <span class="text-muted small d-block">Tipo</span>
                <strong>${cita.tipo || '—'}</strong>
            </div>
            <div class="col-sm-6">
                <span class="text-muted small d-block">Origen</span>
                <strong class="text-capitalize">${cita.origen}</strong>
            </div>
        </div>
        <div class="mb-3">
            <span class="text-muted small d-block">Motivo</span>
            <p class="mb-0">${cita.motivo || '—'}</p>
        </div>
        <div class="mb-3">
            <label class="form-label fw-semibold">Notas internas</label>
            <textarea class="form-control" id="detalle-notas" rows="2"
                placeholder="Agregar o editar notas...">${cita.notas || ''}</textarea>
        </div>
    `;

    // Botones según estado actual
    const footer = document.getElementById('modal-cita-footer');
    footer.innerHTML = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>`;

    if (cita.estado === 'pendiente') {
        footer.innerHTML += `
            <button class="btn btn-success" id="btn-det-confirmar"><i class="bi bi-check2 me-2"></i>Confirmar</button>
            <button class="btn btn-danger"  id="btn-det-cancelar"><i class="bi bi-x-lg me-2"></i>Cancelar</button>
        `;
    }
    if (cita.estado === 'confirmada') {
        footer.innerHTML += `
            <button class="btn btn-outline-success" id="btn-det-completar"><i class="bi bi-flag me-2"></i>Marcar completada</button>
            <button class="btn btn-danger"           id="btn-det-cancelar"><i class="bi bi-x-lg me-2"></i>Cancelar cita</button>
        `;
    }

    // Siempre: guardar notas
    footer.innerHTML += `
        <button class="btn btn-primary" id="btn-det-guardar-notas"><i class="bi bi-save me-2"></i>Guardar notas</button>
    `;

    // Eventos de los botones de acción
    document.getElementById('btn-det-confirmar')?.addEventListener('click', async () => {
        await accionCita(cita.id, 'confirmar');
    });
    document.getElementById('btn-det-cancelar')?.addEventListener('click', async () => {
        await accionCita(cita.id, 'cancelar');
    });
    document.getElementById('btn-det-completar')?.addEventListener('click', async () => {
        await accionCita(cita.id, 'completar');
    });
    document.getElementById('btn-det-guardar-notas').addEventListener('click', async () => {
        await guardarNotasCita(cita.id);
    });

    abrirModal();
}

async function accionCita(idCita, accion) {
    const notas = document.getElementById('detalle-notas')?.value.trim() ?? null;
    try {
        if (accion === 'confirmar') await confirmarCita(idCita, notas || null);
        if (accion === 'cancelar')  await cancelarCita(idCita,  notas || null);
        if (accion === 'completar') await completarCita(idCita, notas || null);

        cerrarModal();
        await recargarCalendario();

        // Notificar a admin.js para refrescar la tabla de pendientes si está visible
        window.dispatchEvent(new CustomEvent('citas:actualizado'));

    } catch (e) {
        console.error('Error en acción de cita:', e);
        mostrarErrorModal('Ocurrió un error. Intenta de nuevo.');
    }
}

async function guardarNotasCita(idCita) {
    const notas = document.getElementById('detalle-notas')?.value.trim() ?? '';
    const btn = document.getElementById('btn-det-guardar-notas');
    try {
        btn.disabled = true;
        btn.textContent = 'Guardando...';
        await actualizarCita(idCita, { notas });
        btn.innerHTML = '<i class="bi bi-check2 me-2"></i>Guardado';
        setTimeout(() => {
            btn.innerHTML = '<i class="bi bi-save me-2"></i>Guardar notas';
            btn.disabled = false;
        }, 1500);
    } catch (e) {
        console.error('Error guardando notas:', e);
        mostrarErrorModal('No se pudieron guardar las notas.');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-save me-2"></i>Guardar notas';
    }
}

// ─────────────────────────────────────────────
//  HELPERS DE UI
// ─────────────────────────────────────────────
function abrirModal() {
    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('modalCita')
    );
    modal.show();
}

function cerrarModal() {
    const modal = bootstrap.Modal.getInstance(
        document.getElementById('modalCita')
    );
    modal?.hide();
}

function mostrarErrorModal(mensaje) {
    // Elimina error previo si existe
    document.getElementById('modal-cita-error')?.remove();

    const alerta = document.createElement('div');
    alerta.id = 'modal-cita-error';
    alerta.className = 'alert alert-danger mt-3 mb-0 py-2';
    alerta.textContent = mensaje;
    document.getElementById('modal-cita-body').appendChild(alerta);
}

function generarOpcionesHora(seleccionada = '') {
    const opciones = [];
    for (let h = 6; h < 22; h++) {
        for (let m of [0, 30]) {
            const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            const sel = val === seleccionada ? 'selected' : '';
            opciones.push(`<option value="${val}" ${sel}>${val}</option>`);
        }
    }
    return opciones.join('');
}

function hoy() {
    return new Date().toISOString().split('T')[0];
}

function formatearFecha(fechaStr) {
    // "YYYY-MM-DD" → "lunes 10 de junio de 2025"
    const [y, m, d] = fechaStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}
