import { obtenerProspectos, obtenerExpedientes, validarYCrearExpediente } from '../services/clinicalService.js';
import { renderizarCalendarioVacio, recargarCalendario } from '../modules/calendar-ui.js';
import { inicializarModalesCitas } from '../modules/appointment-modal.js';
import { listarCitasPendientes, confirmarCita, cancelarCita } from '../services/appointmentService.js';

// ─────────────────────────────────────────────
//  VISTAS DEL SIDEBAR
// ─────────────────────────────────────────────
const vistas = ['inicio', 'solicitudes', 'citas', 'expedientes'];

function cambiarVista(vistaDestino) {
    vistas.forEach(vista => {
        document.getElementById(`btn-${vista}`).classList.toggle('active-link', vista === vistaDestino);
        const seccion = document.getElementById(`vista-${vista}`);
        seccion.classList.toggle('vista-activa', vista === vistaDestino);
        seccion.style.display = vista === vistaDestino ? 'block' : 'none';
    });

    if (vistaDestino === 'solicitudes') {
        renderizarProspectos();
        renderizarCitasPendientes();
    }
    if (vistaDestino === 'expedientes') renderizarExpedientes();
    if (vistaDestino === 'citas')       renderizarCalendarioVacio();
}

document.getElementById('btn-inicio').addEventListener('click',      () => cambiarVista('inicio'));
document.getElementById('btn-solicitudes').addEventListener('click', () => cambiarVista('solicitudes'));
document.getElementById('btn-citas').addEventListener('click',       () => cambiarVista('citas'));
document.getElementById('btn-expedientes').addEventListener('click', () => cambiarVista('expedientes'));

// ─────────────────────────────────────────────
//  INIT AL CARGAR LA PÁGINA
// ─────────────────────────────────────────────
inicializarModalesCitas();
actualizarBadgePendientes();

// Cuando appointment-modal confirma/cancela una cita,
// refrescamos la tabla y el badge sin recargar la página
window.addEventListener('citas:actualizado', () => {
    renderizarCitasPendientes();
    actualizarBadgePendientes();
});

// ─────────────────────────────────────────────
//  BADGE DE PENDIENTES EN EL SIDEBAR
// ─────────────────────────────────────────────
async function actualizarBadgePendientes() {
    try {
        const pendientes = await listarCitasPendientes();
        const cantidad = pendientes.length;

        const badgeSidebar = document.getElementById('badge-citas-pendientes');
        const badgeTab     = document.getElementById('badge-tab-pendientes');

        [badgeSidebar, badgeTab].forEach(badge => {
            if (!badge) return;
            if (cantidad > 0) {
                badge.textContent = cantidad;
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }
        });
    } catch (e) {
        console.error('Error actualizando badge de pendientes:', e);
    }
}

// ─────────────────────────────────────────────
//  TABLA: PROSPECTOS NUEVOS (sin cambios lógicos)
// ─────────────────────────────────────────────
async function renderizarProspectos() {
    const tabla = document.getElementById('tabla-prospectos');
    tabla.innerHTML = `<tr><td colspan="5" class="text-center py-4">Cargando solicitudes...</td></tr>`;

    try {
        const prospectos = await obtenerProspectos();
        tabla.innerHTML = '';

        if (prospectos.length === 0) {
            tabla.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay solicitudes nuevas.</td></tr>`;
            return;
        }

        prospectos.forEach(p => {
            const alertaClase = (p.alergias && p.alergias.toLowerCase() !== 'ninguna')
                ? 'text-danger fw-bold'
                : 'text-muted';

            tabla.innerHTML += `
                <tr>
                    <td class="fw-bold">${p.nombre}</td>
                    <td>${p.telefono}</td>
                    <td>${p.motivo}</td>
                    <td class="${alertaClase}">${p.alergias}</td>
                    <td>
                        <button class="btn btn-sm btn-success shadow-sm"
                            onclick="validarPaciente('${p.id}')">
                            Aceptar Paciente
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tabla.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar los datos.</td></tr>`;
    }
}

window.validarPaciente = async (id) => {
    if (!confirm('¿Deseas convertir este prospecto en un expediente oficial y pasarlo a tu librería?')) return;
    try {
        await validarYCrearExpediente(id);
        alert('¡Paciente agregado con éxito!');
        renderizarProspectos();
    } catch (error) {
        console.error('Error al validar:', error);
        alert('Hubo un error al procesar al paciente.');
    }
};

// ─────────────────────────────────────────────
//  TABLA: SOLICITUDES DE CITA PENDIENTES
// ─────────────────────────────────────────────
async function renderizarCitasPendientes() {
    const tabla = document.getElementById('tabla-citas-pendientes');
    tabla.innerHTML = `<tr><td colspan="5" class="text-center py-4">Cargando solicitudes de cita...</td></tr>`;

    try {
        const pendientes = await listarCitasPendientes();
        tabla.innerHTML = '';

        if (pendientes.length === 0) {
            tabla.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay solicitudes de cita pendientes.</td></tr>`;
            return;
        }

        pendientes.forEach(cita => {
            const fechaFormateada = formatearFechaCorta(cita.fecha);

            tabla.innerHTML += `
                <tr>
                    <td>
                        <div class="fw-bold">${cita.nombre}</div>
                        <div class="text-muted small">📱 ${cita.telefono}</div>
                    </td>
                    <td>${fechaFormateada}</td>
                    <td>${cita.horaInicio} – ${cita.horaFin}</td>
                    <td>
                        <div>${cita.tipo || '—'}</div>
                        <div class="text-muted small">${cita.motivo || ''}</div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-success me-1"
                            onclick="accionCitaAdmin('${cita.id}', 'confirmar')">
                            ✅ Confirmar
                        </button>
                        <button class="btn btn-sm btn-danger"
                            onclick="accionCitaAdmin('${cita.id}', 'cancelar')">
                            ❌ Rechazar
                        </button>
                    </td>
                </tr>
            `;
        });

        // Actualizar badge con el conteo real
        actualizarBadgePendientes();

    } catch (error) {
        tabla.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar las solicitudes.</td></tr>`;
        console.error('Error renderizarCitasPendientes:', error);
    }
}

window.accionCitaAdmin = async (idCita, accion) => {
    const textoAccion = accion === 'confirmar' ? 'confirmar' : 'rechazar';
    if (!confirm(`¿Deseas ${textoAccion} esta cita?`)) return;

    try {
        if (accion === 'confirmar') await confirmarCita(idCita);
        if (accion === 'cancelar')  await cancelarCita(idCita);

        await renderizarCitasPendientes();

        // Si el calendario está visible, recargarlo también
        const vistaCitas = document.getElementById('vista-citas');
        if (vistaCitas.classList.contains('vista-activa')) {
            await recargarCalendario();
        }
    } catch (e) {
        console.error('Error en acción de cita:', e);
        alert('Ocurrió un error. Intenta de nuevo.');
    }
};

// ─────────────────────────────────────────────
//  LIBRERÍA DE EXPEDIENTES (sin cambios lógicos)
// ─────────────────────────────────────────────
async function renderizarExpedientes() {
    const contenedor = document.getElementById('contenedor-expedientes');
    contenedor.innerHTML = `<div class="col-12 text-center py-4">Cargando pacientes...</div>`;

    try {
        const expedientes = await obtenerExpedientes();
        contenedor.innerHTML = '';
        window.expedientesActuales = expedientes;

        if (expedientes.length === 0) {
            contenedor.innerHTML = `<div class="col-12 text-center text-muted">Tu librería está vacía. Acepta prospectos para llenar esta sección.</div>`;
            return;
        }

        expedientes.forEach(p => {
            const alertaText  = (p.alergias && p.alergias.toLowerCase() !== 'ninguna') ? 'Alerta Médica' : 'Sano';
            const alertaColor = alertaText === 'Alerta Médica' ? 'bg-danger' : 'bg-success';

            contenedor.innerHTML += `
                <div class="col">
                    <div class="card h-100 shadow-sm border-0 hover-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title fw-bold text-dark">${p.nombre}</h5>
                                <span class="badge ${alertaColor}">${alertaText}</span>
                            </div>
                            <p class="card-text text-muted small mb-1">📱 ${p.telefono}</p>
                        </div>
                        <div class="card-footer bg-transparent border-0 pb-3">
                            <button class="btn btn-outline-primary w-100 fw-bold"
                                onclick="abrirExpediente('${p.id}')">
                                Ver Expediente
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        contenedor.innerHTML = `<div class="col-12 text-center text-danger">Error al cargar expedientes.</div>`;
    }
}

window.abrirExpediente = (id) => {
    const p = window.expedientesActuales?.find(e => e.id === id);
    if (!p) return;

    document.getElementById('tituloExpediente').innerText = `Expediente: ${p.nombre}`;
    document.getElementById('texto-alergias').innerText   = p.alergias || 'Ninguna';

    const fechaRegistro = p.fechaRegistro
        ? new Date(p.fechaRegistro).toLocaleDateString('es-ES')
        : 'Desconocida';

    document.getElementById('detalle-perfil').innerHTML = `
        <p><strong>Fecha de Nacimiento:</strong> ${p.fechaNacimiento}</p>
        <p><strong>Teléfono:</strong> ${p.telefono}</p>
        <p><strong>Enfermedades:</strong> ${p.enfermedades || 'Sin reporte'}</p>
        <p><strong>Fecha de Alta:</strong> ${fechaRegistro}</p>
    `;

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById('modalExpediente')
    ).show();
};

// ─────────────────────────────────────────────
//  HELPER: formatear fecha "YYYY-MM-DD" → "10 jun 2025"
// ─────────────────────────────────────────────
function formatearFechaCorta(fechaStr) {
    const [y, m, d] = fechaStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
        day:   'numeric',
        month: 'short',
        year:  'numeric',
    });
}