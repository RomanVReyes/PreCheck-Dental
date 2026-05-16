export function renderStepPersonales(container, data) {
    const p = data.datosPersonales || {};

    container.innerHTML = `
        <h3 class="mb-4 fw-bold text-primary">
            <i class="bi bi-person-lines-fill me-2"></i>Datos Personales
        </h3>

        <h5 class="mt-4 border-bottom pb-2">Información Básica</h5>
        <div class="row g-3">
            <div class="col-md-12">
                <label class="form-label fw-semibold">Nombre Completo <span class="text-danger">*</span></label>
                <input type="text" id="nombre" class="form-control" value="${p.nombre || ''}" required>
            </div>
            
            <div class="col-md-4">
                <label class="form-label fw-semibold">Fecha de Nacimiento <span class="text-danger">*</span></label>
                <input type="date" id="fechaNacimiento" class="form-control" value="${p.fechaNacimiento || ''}" required>
            </div>
            
            <div class="col-md-2">
                <label class="form-label fw-semibold">Edad</label>
                <input type="number" id="edad" class="form-control bg-light" value="${p.edad || ''}" readonly tabindex="-1">
            </div>
            
            <div class="col-md-6">
                <label class="form-label fw-semibold">CURP</label>
                <input type="text" id="curp" class="form-control text-uppercase" value="${p.curp || ''}" maxlength="18">
            </div>
            
            <div class="col-md-4">
                <label class="form-label fw-semibold">Sexo</label>
                <select id="sexo" class="form-select">
                    <option value="">Seleccione...</option>
                    <option value="Femenino" ${p.sexo === 'Femenino' ? 'selected' : ''}>Femenino</option>
                    <option value="Masculino" ${p.sexo === 'Masculino' ? 'selected' : ''}>Masculino</option>
                    <option value="Otro" ${p.sexo === 'Otro' ? 'selected' : ''}>Otro</option>
                </select>
            </div>
            
            <div class="col-md-4">
                <label class="form-label fw-semibold">Estado Civil</label>
                <select id="estadoCivil" class="form-select">
                    <option value="">Seleccione...</option>
                    <option value="Soltero(a)" ${p.estadoCivil === 'Soltero(a)' ? 'selected' : ''}>Soltero(a)</option>
                    <option value="Casado(a)" ${p.estadoCivil === 'Casado(a)' ? 'selected' : ''}>Casado(a)</option>
                    <option value="Divorciado(a)" ${p.estadoCivil === 'Divorciado(a)' ? 'selected' : ''}>Divorciado(a)</option>
                    <option value="Viudo(a)" ${p.estadoCivil === 'Viudo(a)' ? 'selected' : ''}>Viudo(a)</option>
                    <option value="Unión Libre" ${p.estadoCivil === 'Unión Libre' ? 'selected' : ''}>Unión Libre</option>
                </select>
            </div>
            
            <div class="col-md-4">
                <label class="form-label fw-semibold">Ocupación</label>
                <input type="text" id="ocupacion" class="form-control" value="${p.ocupacion || ''}">
            </div>
        </div>

        <h5 class="mt-5 border-bottom pb-2">Contacto</h5>
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label fw-semibold">Teléfono Celular <span class="text-danger">*</span></label>
                <input type="tel" id="telefono" class="form-control" value="${p.telefono || ''}" placeholder="10 dígitos" required>
            </div>
            
            <div class="col-md-6">
                <label class="form-label fw-semibold">Correo Electrónico</label>
                <input type="email" id="correo" class="form-control" value="${p.correo || ''}" placeholder="ejemplo@correo.com">
            </div>
            
            <div class="col-12">
                <label class="form-label fw-semibold">Domicilio Completo</label>
                <input type="text" id="domicilio" class="form-control" value="${p.domicilio || ''}" placeholder="Calle, Número, Colonia, Ciudad, C.P.">
            </div>
        </div>

        <h5 class="mt-5 border-bottom pb-2">Contacto de Emergencia</h5>
        <div class="row g-3">
            <div class="col-md-5">
                <label class="form-label fw-semibold">Nombre</label>
                <input type="text" id="emergenciaNombre" class="form-control" value="${p.emergenciaNombre || ''}">
            </div>
            <div class="col-md-3">
                <label class="form-label fw-semibold">Parentesco</label>
                <input type="text" id="emergenciaParentesco" class="form-control" value="${p.emergenciaParentesco || ''}">
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold">Teléfono</label>
                <input type="tel" id="emergenciaTelefono" class="form-control" value="${p.emergenciaTelefono || ''}">
            </div>
        </div>

        <div id="seccion-tutor" class="d-none mt-4">
            <div class="alert alert-warning border border-warning shadow-sm">
                <h5 class="text-warning-emphasis mb-3 fw-bold">
                    <i class="bi bi-shield-lock me-2"></i>Información del Tutor (Paciente Menor de Edad)
                </h5>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Nombre del Tutor <span class="text-danger">*</span></label>
                        <input type="text" id="tutorNombre" class="form-control" value="${p.tutorNombre || ''}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Parentesco <span class="text-danger">*</span></label>
                        <input type="text" id="tutorParentesco" class="form-control" value="${p.tutorParentesco || ''}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Teléfono del Tutor <span class="text-danger">*</span></label>
                        <input type="tel" id="tutorTelefono" class="form-control" value="${p.tutorTelefono || ''}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Identificación Oficial <span class="text-danger">*</span></label>
                        <input type="text" id="tutorIdentificacion" class="form-control" value="${p.tutorIdentificacion || ''}" placeholder="Folio INE o Pasaporte">
                    </div>
                    <div class="col-12">
                        <label class="form-label fw-semibold">Firma de Consentimiento del Tutor <span class="text-danger">*</span></label>
                        <input type="text" id="tutorFirma" class="form-control" value="${p.tutorFirma || ''}" placeholder="Escriba el nombre completo del tutor para firma digital">
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-end mt-4 pt-4 border-top">
            <button type="button" id="btn-next" class="btn btn-primary btn-lg px-5">
                Continuar <i class="bi bi-arrow-right ms-2"></i>
            </button>
        </div>
    `;

    // ─────────────────────────────────────────────
    // Lógica para Edad y Tutor
    // ─────────────────────────────────────────────
    const inputFecha = document.getElementById('fechaNacimiento');
    const inputEdad = document.getElementById('edad');
    const seccionTutor = document.getElementById('seccion-tutor');

    const calcularEdad = () => {
        if (!inputFecha.value) {
            inputEdad.value = '';
            seccionTutor.classList.add('d-none');
            return;
        }

        const hoy = new Date();
        const nacimiento = new Date(inputFecha.value);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        inputEdad.value = edad >= 0 ? edad : 0;

        // Mostrar u ocultar sección de tutor
        if (edad < 18 && edad >= 0) {
            seccionTutor.classList.remove('d-none');
        } else {
            seccionTutor.classList.add('d-none');
        }
    };

    // Escuchar cambios en la fecha
    inputFecha.addEventListener('change', calcularEdad);
    
    // Ejecutar al cargar la vista por si el usuario está retrocediendo pasos
    if(inputFecha.value) calcularEdad();
}

export function obtenerDatosPersonales() {
    return {
        // Básica
        nombre: document.getElementById('nombre').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        edad: document.getElementById('edad').value,
        sexo: document.getElementById('sexo').value,
        curp: document.getElementById('curp').value,
        estadoCivil: document.getElementById('estadoCivil').value,
        ocupacion: document.getElementById('ocupacion').value,
        
        // Contacto
        telefono: document.getElementById('telefono').value,
        correo: document.getElementById('correo').value,
        domicilio: document.getElementById('domicilio').value,
        
        // Emergencia
        emergenciaNombre: document.getElementById('emergenciaNombre').value,
        emergenciaParentesco: document.getElementById('emergenciaParentesco').value,
        emergenciaTelefono: document.getElementById('emergenciaTelefono').value,
        
        // Tutor
        tutorNombre: document.getElementById('tutorNombre').value,
        tutorParentesco: document.getElementById('tutorParentesco').value,
        tutorTelefono: document.getElementById('tutorTelefono').value,
        tutorIdentificacion: document.getElementById('tutorIdentificacion').value,
        tutorFirma: document.getElementById('tutorFirma').value
    };
}