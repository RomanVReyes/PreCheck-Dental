// 1. MANEJO DE VISTAS (Navegación Lateral)
document.getElementById('btn-prospectos').addEventListener('click', () => {
    document.getElementById('btn-prospectos').classList.add('active-link');
    document.getElementById('btn-expedientes').classList.remove('active-link');
    
    document.getElementById('vista-prospectos').classList.remove('d-none');
    document.getElementById('vista-expedientes').classList.add('d-none');
    cargarProspectos();
});

document.getElementById('btn-expedientes').addEventListener('click', () => {
    document.getElementById('btn-expedientes').classList.add('active-link');
    document.getElementById('btn-prospectos').classList.remove('active-link');

    document.getElementById('vista-prospectos').classList.add('d-none');
    document.getElementById('vista-expedientes').classList.remove('d-none');
    cargarExpedientes();
});

// 2. CARGAR PROSPECTOS (Nuevos registros)
async function cargarProspectos() {
    const tabla = document.getElementById('tabla-prospectos');
    tabla.innerHTML = ""; 
    
    const querySnapshot = await window.getDocs(window.collection(window.db, "prospectos"));
    
    querySnapshot.forEach((documento) => {
        const p = documento.data();
        const alertaClase = (p.alergias && p.alergias.toLowerCase() !== "ninguna") ? "text-danger fw-bold" : "";
        
        tabla.innerHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.telefono}</td>
                <td>${p.motivo}</td>
                <td class="${alertaClase}">${p.alergias}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="validarPaciente('${documento.id}')">Aceptar y Abrir Expediente</button>
                </td>
            </tr>
        `;
    });
}

// 3. VALIDAR PACIENTE (Mover de prospectos a expedientes)
window.validarPaciente = async (id) => {
    if (!confirm("¿Deseas convertir este prospecto en un expediente oficial?")) return;

    try {
        const prospectoRef = window.doc(window.db, "prospectos", id);
        const querySnapshot = await window.getDocs(window.collection(window.db, "prospectos"));
        const datos = querySnapshot.docs.find(d => d.id === id).data();

        await window.addDoc(window.collection(window.db, "expedientes"), {
            ...datos,
            estatus: "activo",
            fechaAltaOficial: new Date().toISOString()
        });

        await window.deleteDoc(prospectoRef);

        alert("¡Paciente agregado a la librería oficial!");
        cargarProspectos(); // Recarga la tabla
    } catch (error) {
        console.error("Error al validar:", error);
    }
};

// 4. CARGAR EXPEDIENTES (Librería de Pacientes)
async function cargarExpedientes() {
    const contenedor = document.getElementById('contenedor-expedientes');
    contenedor.innerHTML = ""; 
    
    const querySnapshot = await window.getDocs(window.collection(window.db, "expedientes"));
    
    querySnapshot.forEach((doc) => {
        const p = doc.data();
        const id = doc.id;
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
                        <button class="btn btn-outline-primary w-100" onclick="abrirExpediente('${id}')">Ver Expediente Completo</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// 5. ABRIR EXPEDIENTE EN MODAL
window.abrirExpediente = async (id) => {
    try {
        const querySnapshot = await window.getDocs(window.collection(window.db, "expedientes"));
        const docSnap = querySnapshot.docs.find(d => d.id === id);
        const p = docSnap.data();

        document.getElementById('tituloExpediente').innerText = `Expediente: ${p.nombre}`;
        document.getElementById('texto-alergias').innerText = p.alergias || 'Ninguna';
        
        const fechaRegistro = p.fechaRegistro ? new Date(p.fechaRegistro).toLocaleDateString() : 'Desconocida';

        document.getElementById('detalle-perfil').innerHTML = `
            <p><strong>Fecha de Nacimiento:</strong> ${p.fechaNacimiento}</p>
            <p><strong>Teléfono:</strong> ${p.telefono}</p>
            <p><strong>Enfermedades:</strong> ${p.enfermedades || 'Sin reporte'}</p>
            <p><strong>Fecha de Alta:</strong> ${fechaRegistro}</p>
        `;

        // Instanciar y mostrar el modal de Bootstrap
        const modalElement = document.getElementById('modalExpediente');
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();

    } catch (error) {
        console.error("Error al abrir expediente:", error);
    }
};

// Carga inicial al abrir la página
cargarProspectos();