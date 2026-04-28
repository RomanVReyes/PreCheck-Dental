import { obtenerProspectos, obtenerExpedientes, validarYCrearExpediente } from '../services/clinicalService.js';

// --- SISTEMA DE NAVEGACIÓN UX ---
const vistas = ['inicio', 'solicitudes', 'citas', 'expedientes'];

function cambiarVista(vistaDestino) {
    vistas.forEach(vista => {
        // Manejo de botones (Sidebar)
        const btn = document.getElementById(`btn-${vista}`);
        if (vista === vistaDestino) {
            btn.classList.add('active-link');
        } else {
            btn.classList.remove('active-link');
        }

        // Manejo de secciones (Main Content)
        const seccion = document.getElementById(`vista-${vista}`);
        if (vista === vistaDestino) {
            seccion.classList.add('vista-activa');
        } else {
            seccion.classList.remove('vista-activa');
        }
    });

    // Cargar datos dependiendo de la vista para no saturar Firebase
    if (vistaDestino === 'solicitudes') renderizarProspectos();
    if (vistaDestino === 'expedientes') renderizarExpedientes();
    if (vistaDestino === 'citas') {
        // En el futuro: renderizarCitas();
    }
}

// Asignar eventos a los botones del menú
document.getElementById('btn-inicio').addEventListener('click', () => cambiarVista('inicio'));
document.getElementById('btn-solicitudes').addEventListener('click', () => cambiarVista('solicitudes'));
document.getElementById('btn-citas').addEventListener('click', () => cambiarVista('citas'));
document.getElementById('btn-expedientes').addEventListener('click', () => cambiarVista('expedientes'));


// --- FUNCIONES DE RENDERIZADO ---

async function renderizarProspectos() {
    const tabla = document.getElementById('tabla-prospectos');
    tabla.innerHTML = "<tr><td colspan='5' class='text-center py-4'>Cargando solicitudes...</td></tr>"; 
    
    try {
        const prospectos = await obtenerProspectos();
        tabla.innerHTML = "";
        
        if(prospectos.length === 0) {
            tabla.innerHTML = "<tr><td colspan='5' class='text-center py-4 text-muted'>No hay solicitudes nuevas.</td></tr>";
            return;
        }

        prospectos.forEach((p) => {
            const alertaClase = (p.alergias && p.alergias.toLowerCase() !== "ninguna") ? "text-danger fw-bold" : "text-muted";
            tabla.innerHTML += `
                <tr>
                    <td class="fw-bold">${p.nombre}</td>
                    <td>${p.telefono}</td>
                    <td>${p.motivo}</td>
                    <td class="${alertaClase}">${p.alergias}</td>
                    <td>
                        <button class="btn btn-sm btn-success shadow-sm" onclick="validarPaciente('${p.id}')">Aceptar Paciente</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tabla.innerHTML = "<tr><td colspan='5' class='text-center text-danger'>Error al cargar los datos.</td></tr>";
    }
}

// Acción de Validar
window.validarPaciente = async (id) => {
    if (!confirm("¿Deseas convertir este prospecto en un expediente oficial y pasarlo a tu librería?")) return;
    try {
        await validarYCrearExpediente(id);
        alert("¡Paciente agregado con éxito!");
        renderizarProspectos(); // Recarga la tabla
    } catch (error) {
        console.error("Error al validar:", error);
        alert("Hubo un error al procesar al paciente.");
    }
};

async function renderizarExpedientes() {
    const contenedor = document.getElementById('contenedor-expedientes');
    contenedor.innerHTML = "<div class='col-12 text-center py-4'>Cargando pacientes...</div>"; 
    
    try {
        const expedientes = await obtenerExpedientes();
        contenedor.innerHTML = "";
        
        window.expedientesActuales = expedientes;

        if(expedientes.length === 0) {
            contenedor.innerHTML = "<div class='col-12 text-center text-muted'>Tu librería está vacía. Acepta prospectos para llenar esta sección.</div>";
            return;
        }

        expedientes.forEach((p) => {
            const alertaText = (p.alergias && p.alergias.toLowerCase() !== "ninguna") ? "Alerta Médica" : "Sano";
            const alertaColor = alertaText === "Alerta Médica" ? "bg-danger" : "bg-success";

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
                            <button class="btn btn-outline-primary w-100 fw-bold" onclick="abrirExpediente('${p.id}')">Ver Expediente</button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        contenedor.innerHTML = "<div class='col-12 text-center text-danger'>Error al cargar expedientes.</div>";
    }
}

window.abrirExpediente = (id) => {
    const p = window.expedientesActuales.find(e => e.id === id);
    if(!p) return;

    document.getElementById('tituloExpediente').innerText = `Expediente: ${p.nombre}`;
    document.getElementById('texto-alergias').innerText = p.alergias || 'Ninguna';
    
    const fechaRegistro = p.fechaRegistro ? new Date(p.fechaRegistro).toLocaleDateString() : 'Desconocida';
    document.getElementById('detalle-perfil').innerHTML = `
        <p><strong>Fecha de Nacimiento:</strong> ${p.fechaNacimiento}</p>
        <p><strong>Teléfono:</strong> ${p.telefono}</p>
        <p><strong>Enfermedades:</strong> ${p.enfermedades || 'Sin reporte'}</p>
        <p><strong>Fecha de Alta:</strong> ${fechaRegistro}</p>
    `;

    const modalElement = document.getElementById('modalExpediente');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.show();
};

// Inicialización: Ya no llamamos a renderizarProspectos() aquí directamente. 
// La vista 'inicio' está activa por defecto en el HTML, no requiere carga de Firebase por ahora.