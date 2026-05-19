import { obtenerProspectos, obtenerExpedientes, validarYCrearExpediente } from '../services/clinicalService.js';
import { renderizarCalendarioVacio, recargarCalendario } from '../modules/calendar-ui.js';
import { inicializarModalesCitas } from '../modules/appointment-modal.js';
import {
    listarCitasPendientes,
    listarCitasPorPaciente,
    confirmarCita,
    cancelarCita
} from '../services/appointmentService.js';

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

document.querySelectorAll('[data-target-view]').forEach(btn => {
    btn.addEventListener('click', () => cambiarVista(btn.dataset.targetView));
});

document.getElementById('btn-dashboard-nueva-cita')?.addEventListener('click', () => {
    cambiarVista('citas');
    window.dispatchEvent(new CustomEvent('calendario:nuevaCita', {
        detail: { fecha: '', horaInicio: '' }
    }));
});

document.getElementById('busquedaPaciente')?.addEventListener('input', (e) => {
    pintarExpedientes(window.expedientesActuales || [], e.target.value);
});

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
                        <div class="text-muted small"><i class="bi bi-phone me-1"></i>${cita.telefono}</div>
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
                            <i class="bi bi-check2 me-1"></i>Confirmar
                        </button>
                        <button class="btn btn-sm btn-danger"
                            onclick="accionCitaAdmin('${cita.id}', 'cancelar')">
                            <i class="bi bi-x-lg me-1"></i>Rechazar
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
        window.expedientesActuales = expedientes;
        pintarExpedientes(expedientes, document.getElementById('busquedaPaciente')?.value || '');
    } catch (error) {
        contenedor.innerHTML = `<div class="col-12 text-center text-danger">Error al cargar expedientes.</div>`;
    }
}

function pintarExpedientes(expedientes, busqueda = '') {
    const contenedor = document.getElementById('contenedor-expedientes');
    const termino = busqueda.trim().toLowerCase();
    const filtrados = termino
        ? expedientes.filter(p => `${p.nombre} ${p.telefono}`.toLowerCase().includes(termino))
        : expedientes;

    contenedor.innerHTML = '';

    if (expedientes.length === 0) {
        contenedor.innerHTML = `<div class="col-12 text-center text-muted">Tu librería está vacía. Acepta prospectos para llenar esta sección.</div>`;
        return;
    }

    if (filtrados.length === 0) {
        contenedor.innerHTML = `<div class="col-12 text-center text-muted">No encontramos pacientes con esa búsqueda.</div>`;
        return;
    }

    filtrados.forEach(p => {
        const edad = calcularEdad(p.fechaNacimiento);
        const iniciales = obtenerIniciales(p.nombre);
        const alergias = normalizarListaClinica(p.alergias);
        const enfermedades = normalizarListaClinica(p.enfermedades);
        const tieneAlerta = alergias.length > 0 || enfermedades.length > 0;
        const alertaText  = tieneAlerta ? 'Alerta clínica' : 'Sin alertas';
        const motivo = p.motivo || 'Sin motivo registrado';

        contenedor.innerHTML += `
            <div class="col">
                <div class="card patient-card h-100 hover-card">
                    <div class="card-body">
                        <div class="patient-card-header">
                            <div class="patient-avatar">${iniciales}</div>
                            <div class="min-w-0">
                                <h5 class="card-title">${p.nombre}</h5>
                                <p class="patient-meta mb-0">
                                    <i class="bi bi-phone me-1"></i>${p.telefono || 'Sin teléfono'}
                                </p>
                            </div>
                            <span class="badge ${tieneAlerta ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}">${alertaText}</span>
                        </div>

                        <div class="patient-card-grid">
                            <div>
                                <span>Edad</span>
                                <strong>${edad || 'N/D'}</strong>
                            </div>
                            <div>
                                <span>Alta</span>
                                <strong>${formatearFechaCompacta(p.fechaAltaOficial || p.fechaRegistro)}</strong>
                            </div>
                        </div>

                        <div class="patient-card-section">
                            <span class="patient-label">Motivo principal</span>
                            <p>${motivo}</p>
                        </div>

                        <div class="patient-tags">
                            ${tieneAlerta
                                ? [...alergias.slice(0, 2), ...enfermedades.slice(0, 1)].map(item => `<span>${item}</span>`).join('')
                                : '<span>Sin alergias reportadas</span>'
                            }
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary w-100"
                            onclick="abrirExpediente('${p.id}')">
                            <i class="bi bi-folder2-open me-2"></i>Ver Expediente
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

window.abrirExpediente = async (id) => {
    const p = window.expedientesActuales?.find(e => e.id === id);
    if (!p) return;

    const citas = await obtenerCitasPacienteSeguro(id);
    const alergias = normalizarListaClinica(p.alergias);
    const enfermedades = normalizarListaClinica(p.enfermedades);
    const tieneAlerta = alergias.length > 0 || enfermedades.length > 0;
    const fechaAlta = formatearFechaLarga(p.fechaAltaOficial || p.fechaRegistro);
    const edad = calcularEdad(p.fechaNacimiento);
    const proximaCita = obtenerProximaCita(citas);
    const ultimaCita = obtenerUltimaCita(citas);

    document.getElementById('tituloExpediente').innerText = p.nombre;
    document.getElementById('texto-alergias').innerText = alergias.length ? alergias.join(', ') : 'Ninguna reportada';

    document.getElementById('detalle-perfil').innerHTML = `
        <div class="expediente-hero">
            <div class="patient-avatar avatar-lg">${obtenerIniciales(p.nombre)}</div>
            <div>
                <p class="section-kicker mb-1">Expediente clínico</p>
                <h3>${p.nombre}</h3>
                <div class="expediente-badges">
                    <span><i class="bi bi-phone me-1"></i>${p.telefono || 'Sin teléfono'}</span>
                    <span><i class="bi bi-calendar3 me-1"></i>${edad || 'Edad no disponible'}</span>
                    <span class="${tieneAlerta ? 'text-danger' : 'text-success'}">
                        <i class="bi bi-shield-check me-1"></i>${tieneAlerta ? 'Requiere revisión médica' : 'Sin alertas'}
                    </span>
                </div>
            </div>
        </div>

        <div class="expediente-summary-grid">
            <div class="clinical-info-card">
                <span>Fecha de nacimiento</span>
                <strong>${formatearFechaLarga(p.fechaNacimiento)}</strong>
            </div>
            <div class="clinical-info-card">
                <span>Alta del expediente</span>
                <strong>${fechaAlta}</strong>
            </div>
            <div class="clinical-info-card">
                <span>Próxima cita</span>
                <strong>${proximaCita ? `${formatearFechaCorta(proximaCita.fecha)} · ${proximaCita.horaInicio}` : 'No agendada'}</strong>
            </div>
            <div class="clinical-info-card">
                <span>Última atención</span>
                <strong>${ultimaCita ? `${formatearFechaCorta(ultimaCita.fecha)} · ${ultimaCita.estado}` : 'Sin historial'}</strong>
            </div>
        </div>

        <div class="row g-3 mt-1">
            <div class="col-md-6">
                <div class="clinical-block">
                    <h6><i class="bi bi-heart-pulse me-2"></i>Antecedentes médicos</h6>
                    ${renderListaClinica(enfermedades, 'Sin enfermedades reportadas')}
                </div>
            </div>
            <div class="col-md-6">
                <div class="clinical-block ${alergias.length ? 'clinical-alert' : ''}">
                    <h6><i class="bi bi-exclamation-triangle me-2"></i>Alergias</h6>
                    ${renderListaClinica(alergias, 'Sin alergias reportadas')}
                </div>
            </div>
            <div class="col-12">
                <div class="clinical-block">
                    <h6><i class="bi bi-chat-left-text me-2"></i>Motivo de consulta</h6>
                    <p class="mb-0">${p.motivo || 'Sin motivo registrado.'}</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('detalle-alertas').className = `alert ${tieneAlerta ? 'alert-warning' : 'alert-success'}`;
    document.getElementById('tab-odontograma').innerHTML = renderOdontograma();
    document.getElementById('tab-presupuesto').innerHTML = renderPresupuesto(p);
    document.getElementById('lista-citas').innerHTML = renderHistorialCitas(citas);

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById('modalExpediente')
    ).show();
};

async function obtenerCitasPacienteSeguro(id) {
    try {
        const citas = await listarCitasPorPaciente(id);
        return citas.sort((a, b) => `${b.fecha} ${b.horaInicio}`.localeCompare(`${a.fecha} ${a.horaInicio}`));
    } catch (error) {
        console.error('Error cargando citas del paciente:', error);
        return [];
    }
}

function renderOdontograma() {
    const dientes = [
        18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
        48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38
    ];

    return `
        <div class="odontogram-layout">
            <div class="odontogram-board">
                <div class="odontogram-title">
                    <div>
                        <p class="section-kicker">Mapa dental</p>
                        <h5>Odontograma clínico</h5>
                    </div>
                    <span class="status-pill">Base visual</span>
                </div>
                <div class="teeth-grid">
                    ${dientes.map(numero => `
                        <button class="tooth-cell" type="button">
                            <i class="bi bi-circle"></i>
                            <span>${numero}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="odontogram-side">
                <div class="clinical-block">
                    <h6>Hallazgos rápidos</h6>
                    <div class="odontogram-legend">
                        <span><i class="legend-dot healthy"></i>Sano</span>
                        <span><i class="legend-dot watch"></i>Vigilar</span>
                        <span><i class="legend-dot treatment"></i>Tratamiento</span>
                    </div>
                </div>
                <div class="clinical-block">
                    <h6>Nota clínica</h6>
                    <textarea class="form-control" rows="5" placeholder="Ej. Dolor en molar superior derecho, sensibilidad al frío..."></textarea>
                </div>
            </div>
        </div>
    `;
}

function renderPresupuesto(paciente) {
    const motivo = paciente.motivo || 'Tratamiento por definir';
    return `
        <div class="budget-layout">
            <div>
                <div class="panel-title-row">
                    <div>
                        <p class="section-kicker">Plan financiero</p>
                        <h3>Presupuesto del tratamiento</h3>
                    </div>
                    <button class="btn btn-primary btn-sm" type="button">
                        <i class="bi bi-plus-lg me-1"></i>Agregar procedimiento
                    </button>
                </div>
                <div class="dashboard-table-wrap">
                    <table class="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Procedimiento</th>
                                <th>Prioridad</th>
                                <th>Estado</th>
                                <th class="text-end">Costo</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-presupuesto">
                            <tr>
                                <td>
                                    <strong>Valoración inicial</strong>
                                    <div class="text-muted small">${motivo}</div>
                                </td>
                                <td><span class="badge bg-primary-subtle text-primary">Diagnóstico</span></td>
                                <td><span class="badge bg-secondary-subtle text-secondary">Pendiente</span></td>
                                <td class="text-end text-muted">Por definir</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <aside class="budget-summary">
                <span>Total estimado</span>
                <strong>$0.00</strong>
                <p>Agrega procedimientos para construir el plan de tratamiento.</p>
            </aside>
        </div>
    `;
}

function renderHistorialCitas(citas) {
    if (citas.length === 0) {
        return `
            <li class="history-empty">
                <i class="bi bi-calendar-x"></i>
                <div>
                    <strong>Sin citas registradas</strong>
                    <p>Cuando se agenden citas, aparecerán aquí con su estado y notas.</p>
                </div>
            </li>
        `;
    }

    return citas.map(cita => `
        <li class="history-item">
            <div class="history-date">
                <strong>${formatearFechaCorta(cita.fecha)}</strong>
                <span>${cita.horaInicio} - ${cita.horaFin}</span>
            </div>
            <div class="history-body">
                <div class="d-flex justify-content-between gap-2 flex-wrap">
                    <strong>${cita.tipo || 'Consulta dental'}</strong>
                    <span class="badge ${badgeEstado(cita.estado)}">${cita.estado || 'sin estado'}</span>
                </div>
                <p>${cita.motivo || 'Sin motivo registrado.'}</p>
                ${cita.notas ? `<small><i class="bi bi-journal-text me-1"></i>${cita.notas}</small>` : ''}
            </div>
        </li>
    `).join('');
}

// ─────────────────────────────────────────────
//  HELPER: formatear fecha "YYYY-MM-DD" → "10 jun 2025"
// ─────────────────────────────────────────────
function formatearFechaCorta(fechaStr) {
    if (!fechaStr) return 'Sin fecha';
    const [y, m, d] = fechaStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
        day:   'numeric',
        month: 'short',
        year:  'numeric',
    });
}

function formatearFechaCompacta(fechaStr) {
    if (!fechaStr) return 'N/D';
    const fecha = fechaStr.includes('T') ? new Date(fechaStr) : crearFechaLocal(fechaStr);
    if (Number.isNaN(fecha.getTime())) return 'N/D';
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function formatearFechaLarga(fechaStr) {
    if (!fechaStr) return 'No registrada';
    const fecha = fechaStr.includes('T') ? new Date(fechaStr) : crearFechaLocal(fechaStr);
    if (Number.isNaN(fecha.getTime())) return 'No registrada';
    return fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function crearFechaLocal(fechaStr) {
    const [y, m, d] = fechaStr.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return '';
    const nacimiento = crearFechaLocal(fechaNacimiento);
    if (Number.isNaN(nacimiento.getTime())) return '';
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad >= 0 ? `${edad} años` : '';
}

function obtenerIniciales(nombre = '') {
    return nombre
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0]?.toUpperCase())
        .join('') || 'PC';
}

function normalizarListaClinica(valor) {
    if (!valor) return [];
    if (Array.isArray(valor)) {
        return valor
            .map(item => {
                if (typeof item === 'string') return item;
                return item.nombre || item.descripcion || item.detalle || JSON.stringify(item);
            })
            .map(limpiarTextoClinico)
            .filter(Boolean)
            .filter(item => item.toLowerCase() !== 'ninguna');
    }
    return String(valor)
        .split(/\n|,|;/)
        .map(limpiarTextoClinico)
        .filter(Boolean)
        .filter(item => item.toLowerCase() !== 'ninguna');
}

function limpiarTextoClinico(texto) {
    return String(texto)
        .replace(/\s+/g, ' ')
        .replace(/^[-•]\s*/, '')
        .trim();
}

function renderListaClinica(items, textoVacio) {
    if (!items.length) return `<p class="text-muted mb-0">${textoVacio}</p>`;
    return `<ul class="clinical-list">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

function obtenerProximaCita(citas) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return citas
        .filter(cita => crearFechaLocal(cita.fecha) >= hoy && cita.estado !== 'cancelada')
        .sort((a, b) => `${a.fecha} ${a.horaInicio}`.localeCompare(`${b.fecha} ${b.horaInicio}`))[0];
}

function obtenerUltimaCita(citas) {
    const hoy = new Date();
    return citas
        .filter(cita => crearFechaLocal(cita.fecha) <= hoy)
        .sort((a, b) => `${b.fecha} ${b.horaInicio}`.localeCompare(`${a.fecha} ${a.horaInicio}`))[0];
}

function badgeEstado(estado = '') {
    const clases = {
        pendiente: 'bg-warning-subtle text-warning',
        confirmada: 'bg-success-subtle text-success',
        cancelada: 'bg-danger-subtle text-danger',
        completada: 'bg-secondary-subtle text-secondary',
    };
    return clases[estado] || 'bg-secondary-subtle text-secondary';
}
