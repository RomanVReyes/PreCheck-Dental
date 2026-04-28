import { obtenerProspectos, obtenerExpedientes, validarYCrearExpediente } from '../services/clinicalService.js';

// Navegación
document.getElementById('btn-prospectos').addEventListener('click', () => {
    document.getElementById('btn-prospectos').classList.add('active-link');
    document.getElementById('btn-expedientes').classList.remove('active-link');
    document.getElementById('vista-prospectos').classList.remove('d-none');
    document.getElementById('vista-expedientes').classList.add('d-none');
    renderizarProspectos();
});

document.getElementById('btn-expedientes').addEventListener('click', () => {
    document.getElementById('btn-expedientes').classList.add('active-link');
    document.getElementById('btn-prospectos').classList.remove('active-link');
    document.getElementById('vista-prospectos').classList.add('d-none');
    document.getElementById('vista-expedientes').classList.remove('d-none');
    renderizarExpedientes();
});

// Renderizar Prospectos
async function renderizarProspectos() {
    const tabla = document.getElementById('tabla-prospectos');
    tabla.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>"; 
    
    const prospectos = await obtenerProspectos();
    tabla.innerHTML = "";
    
    prospectos.forEach((p) => {
        const alertaClase = (p.alergias && p.alergias.toLowerCase() !== "ninguna") ? "text-danger fw-bold" : "";
        tabla.innerHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.telefono}</td>
                <td>${p.motivo}</td>
                <td class="${alertaClase}">${p.alergias}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="validarPaciente('${p.id}')">Aceptar y Abrir Expediente</button>
                </td>
            </tr>
        `;
    });
}

// Acción de Validar (Exportada a window por el botón dinámico del HTML)
window.validarPaciente = async (id) => {
    if (!confirm("¿Deseas convertir este prospecto en un expediente oficial?")) return;
    try {
        await validarYCrearExpediente(id);
        alert("¡Paciente agregado a la librería oficial!");
        renderizarProspectos();
    } catch (error) {
        console.error("Error al validar:", error);
    }
};

// Renderizar Expedientes
async function renderizarExpedientes() {
    const contenedor = document.getElementById('contenedor-expedientes');
    contenedor.innerHTML = "<p>Cargando pacientes...</p>"; 
    
    const expedientes = await obtenerExpedientes();
    contenedor.innerHTML = "";
    
    // Guardamos los datos globalmente para no volver a consultar Firebase al abrir el modal
    window.expedientesActuales = expedientes;

    expedientes.forEach((p) => {
        const alertaText = (p.alergias && p.alergias.toLowerCase() !== "ninguna") ? "Alerta Médica" : "Sano";
        const alertaColor = alertaText === "Alerta Médica" ? "bg-danger" : "bg-success";

        contenedor.innerHTML += `
            <div class="col">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title">${p.nombre}</h5>
                            <span class="badge ${alertaColor}">${alertaText}</span>
                        </div>
                        <p class="card-text text-muted small">Tel: ${p.telefono}</p>
                        <p class="card-text small"><strong>Motivo original:</strong> ${p.motivo ? p.motivo.substring(0, 50) : ''}...</p>
                    </div>
                    <div class="card-footer bg-transparent border-0 pb-3">
                        <button class="btn btn-outline-primary w-100" onclick="abrirExpediente('${p.id}')">Ver Expediente Completo</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Abrir Modal
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

// Inicialización
renderizarProspectos();