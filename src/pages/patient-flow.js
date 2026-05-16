// ─────────────────────────────────────────────
//  FLUJO COMPLETO DEL PACIENTE
//  Maneja: bienvenida → registro nuevo / recurrente → solicitar cita
// ─────────────────────────────────────────────
import { renderProgressBar, updateProgressBar } from '../components/progress-bar.js';
import { renderStepPersonales, obtenerDatosPersonales }       from '../components/step-personales.js';
import { renderStepMedicos, obtenerDatosMedicos }             from '../components/step-padecimientos.js';
import { renderStepCirugias, obtenerDatosCirugias }           from '../components/step-cirugias.js';
import { renderStepMedicamentos, obtenerDatosMedicamentos }   from '../components/step-medicamentos.js';
import { renderStepAlergias, obtenerDatosAlergias }           from '../components/step-alergias.js';
import { renderStepHabitos, obtenerDatosHabitos }             from '../components/step-habitos.js'; // <-- NUEVO IMPORT
import { renderStepHistoria, obtenerDatosHistoria }           from '../components/step-historia.js';
import { renderStepMotivo, obtenerDatosMotivo }               from '../components/step-motivo.js';
import { renderStepConsentimientos, obtenerDatosConsentimientos } from '../components/step-consentimientos.js';
import { buscarPacienteRecurrente, guardarProspecto }         from '../services/patientService.js';
import { guardarCita }                                        from '../services/appointmentService.js';

// ─────────────────────────────────────────────
//  ESTADO GLOBAL DEL FORMULARIO
// ─────────────────────────────────────────────
const TOTAL_STEPS = 9; // <-- CAMBIO: Ahora son 9 pasos
let currentStep = 1;

const patientData = {
    datosPersonales: {},
    antecedentes: {
        enfermedades: [],
        cirugias: {}, 
        medicamentos: [], 
        alergias:     [],
        habitos:      {}, // <-- Lo cambiamos de [] a {} para manejar el objeto
    },
    historiaOdontologica: {},
    motivoConsulta: {},
    consentimientos: {},
};

// Paciente recurrente identificado (se llena al validar)
let pacienteRecurrente = null;

// ─────────────────────────────────────────────
//  REFERENCIAS DOM
// ─────────────────────────────────────────────
const secciones = {
    bienvenida:    document.getElementById('seccion-bienvenida'),
    registro:      document.getElementById('seccion-registro'),
    recurrente:    document.getElementById('seccion-recurrente'),
    solicitarCita: document.getElementById('seccion-solicitar-cita'),
};

const stepContainer      = document.getElementById('step-container');
const progressContainer  = document.getElementById('progress-container');

// ─────────────────────────────────────────────
//  NAVEGACIÓN ENTRE SECCIONES
// ─────────────────────────────────────────────
function mostrarSeccion(nombre) {
    Object.values(secciones).forEach(s => s.classList.add('d-none'));
    secciones[nombre].classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Bienvenida → Registro nuevo
document.getElementById('btn-nuevo').addEventListener('click', () => {
    mostrarSeccion('registro');
    iniciarFormulario();
});

// Bienvenida → Recurrente
document.getElementById('btn-recurrente').addEventListener('click', () => {
    resetRecurrente();
    mostrarSeccion('recurrente');
});

// Registro → Bienvenida
document.getElementById('btn-volver-inicio').addEventListener('click', () => {
    mostrarSeccion('bienvenida');
});

// Recurrente → Bienvenida
document.getElementById('btn-volver-recurrente').addEventListener('click', () => {
    mostrarSeccion('bienvenida');
});

// Solicitar cita → Recurrente
document.getElementById('btn-volver-cita').addEventListener('click', () => {
    mostrarSeccion('recurrente');
});

// Link "¿Eres paciente nuevo?" en error de recurrente
document.getElementById('rec-link-nuevo').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarSeccion('registro');
    iniciarFormulario();
});

// ─────────────────────────────────────────────
//  FORMULARIO MULTI-PASO (paciente nuevo)
// ─────────────────────────────────────────────
function iniciarFormulario() {
    currentStep = 1;
    renderProgressBar(progressContainer);
    renderCurrentStep();
}

async function renderCurrentStep() {
    updateProgressBar(currentStep, TOTAL_STEPS);
    switch (currentStep) {
        case 1: renderStepPersonales(stepContainer, patientData);       break;
        case 2: await renderStepMedicos(stepContainer, patientData);    break;
        case 3: renderStepCirugias(stepContainer, patientData);         break; 
        case 4: await renderStepMedicamentos(stepContainer, patientData); break;
        case 5: await renderStepAlergias(stepContainer, patientData);   break; 
        case 6: renderStepHabitos(stepContainer, patientData);          break; // <-- NUEVO PASO 6
        case 7: renderStepHistoria(stepContainer, patientData);         break; // <-- DESPLAZADO A 7
        case 8: renderStepMotivo(stepContainer, patientData);           break; // <-- DESPLAZADO A 8
        case 9: renderStepConsentimientos(stepContainer, patientData);  break; // <-- DESPLAZADO A 9
    }
    attachNavigationEvents();
}

function attachNavigationEvents() {
    document.getElementById('btn-prev')?.addEventListener('click', previousStep);
    document.getElementById('btn-next')?.addEventListener('click', nextStep);
}

function nextStep() {
    if (!validarPasoActual()) return;
    guardarDatosPasoActual();
    if (currentStep < TOTAL_STEPS) {
        currentStep++;
        renderCurrentStep();
    } else {
        finalizarFormulario();
    }
}

function previousStep() {
    guardarDatosPasoActual();
    if (currentStep > 1) {
        currentStep--;
        renderCurrentStep();
    }
}

function guardarDatosPasoActual() {
    switch (currentStep) {
        case 1: patientData.datosPersonales           = obtenerDatosPersonales();  break;
        case 2: patientData.antecedentes              = obtenerDatosMedicos();      break;
        case 3: patientData.antecedentes.cirugias     = obtenerDatosCirugias();     break; 
        case 4: patientData.antecedentes.medicamentos = obtenerDatosMedicamentos(); break; 
        case 5: patientData.antecedentes.alergias     = obtenerDatosAlergias();     break; 
        case 6: patientData.antecedentes.habitos      = obtenerDatosHabitos();      break; // <-- NUEVO
        case 7: patientData.historiaOdontologica      = obtenerDatosHistoria();     break; // <-- DESPLAZADO
        case 8: patientData.motivoConsulta            = obtenerDatosMotivo();       break; // <-- DESPLAZADO
        case 9: patientData.consentimientos           = obtenerDatosConsentimientos(); break; // <-- DESPLAZADO
    }
}

// Validación básica por paso
function validarPasoActual() {
    /*
    // Validaciones del Paso 1 (Datos Personales)
    if (currentStep === 1) {
        const nombre = document.getElementById('nombre')?.value.trim();
        const tel    = document.getElementById('telefono')?.value.trim();
        const fecha  = document.getElementById('fechaNacimiento')?.value;
        const edad   = parseInt(document.getElementById('edad')?.value, 10);

        if (!nombre || !tel || !fecha) {
            mostrarErrorPaso('Por favor completa nombre, teléfono y fecha de nacimiento.');
            return false;
        }
        if (!/^\d{10}$/.test(tel)) {
            mostrarErrorPaso('El teléfono celular debe tener exactamente 10 dígitos.');
            return false;
        }

        // Validación dinámica de menor de edad
        if (edad < 18) {
            const tNombre = document.getElementById('tutorNombre').value.trim();
            const tParentesco = document.getElementById('tutorParentesco').value.trim();
            const tFirma = document.getElementById('tutorFirma').value.trim();
            
            if (!tNombre || !tParentesco || !tFirma) {
                mostrarErrorPaso('El paciente es menor de edad. Los datos básicos y la firma del tutor son obligatorios.');
                return false;
            }
        }
    }
    
    // Validaciones del Paso 9 (Consentimientos)
    if (currentStep === 9) {
        const verdad = document.getElementById('consent-verdad')?.checked;
        const evaluacion = document.getElementById('consent-evaluacion')?.checked;
        const estudios = document.getElementById('consent-estudios')?.checked;
        const firma = document.getElementById('firma-nombre')?.value.trim();

        if (!verdad || !evaluacion || !estudios) {
            mostrarErrorPaso('Debes aceptar los tres puntos del Consentimiento General (casillas superiores) para poder continuar con la atención.');
            return false;
        }

        if (!firma) {
            mostrarErrorPaso('Por favor, ingresa tu nombre completo como firma para avalar el registro.');
            return false;
        }
    }
    
    limpiarErrorPaso();*/
    return true;
}

function mostrarErrorPaso(msg) {
    let el = document.getElementById('paso-error');
    if (!el) {
        el = document.createElement('div');
        el.id = 'paso-error';
        el.className = 'alert alert-danger mt-3 py-2';
        stepContainer.appendChild(el);
    }
    el.textContent = msg;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function limpiarErrorPaso() {
    document.getElementById('paso-error')?.remove();
}

async function finalizarFormulario() {
    guardarDatosPasoActual();

    const btn = document.getElementById('btn-next');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

    try {
        const dp = patientData.datosPersonales;
        const hOdo = patientData.historiaOdontologica || {}; 
        const hab = patientData.antecedentes.habitos || {}; // <-- Rescatamos hábitos
        
        // Formatear las enfermedades complejas en un texto legible para la BD
        const padecimientosGuardar = (patientData.antecedentes.enfermedades || []).map(enf => {
            let detalleStr = [];
            if (enf.desde) detalleStr.push(`Desde: ${enf.desde}`);
            if (enf.controlado) detalleStr.push(`Controlado: ${enf.controlado}`);
            if (enf.observaciones) detalleStr.push(`Obs: ${enf.observaciones}`);
            
            return detalleStr.length > 0 
                ? `${enf.nombre} (${detalleStr.join(' | ')})` 
                : enf.nombre;
        }).join(', ');

        const dCir = patientData.antecedentes.cirugias || {}; 
        
        // Formatear medicamentos para la base de datos (Ej: "Metformina (500mg | Cada 12h), Aspirina (100mg | 1 al día)")
        const medicamentosGuardar = (patientData.antecedentes.medicamentos || []).map(med => {
            let detalles = [];
            if (med.dosis) detalles.push(med.dosis);
            if (med.frecuencia) detalles.push(med.frecuencia);
            
            return detalles.length > 0 
                ? `${med.nombre} (${detalles.join(' | ')})` 
                : med.nombre;
        }).join(', ');

        // Formatear alergias para la base de datos
        const alergiasGuardar = (patientData.antecedentes.alergias || []).map(al => {
            return al.reaccion 
                ? `${al.nombre} (Reacción: ${al.reaccion})` 
                : al.nombre;
        }).join(', ');

        // Formatear Hábitos para la base de datos
        const habitosGuardar = [
            `Fuma: ${hab.fuma || 'No'}`,
            `Alcohol: ${hab.alcohol || 'No'}`,
            `Drogas: ${hab.drogas || 'No'}`,
            `Bruxismo: ${hab.bruxismo || 'No'}`,
            `Embarazo: ${hab.embarazo || 'No aplica'}`
        ].join(' | ');

        // Construimos el prospecto con toda la nueva información
        const prospecto = {
            // Datos Personales Extendidos
            nombre:          dp.nombre,
            fechaNacimiento: dp.fechaNacimiento,
            edad:            dp.edad,
            curp:            dp.curp || '',
            sexo:            dp.sexo || '',
            estadoCivil:     dp.estadoCivil || '',
            ocupacion:       dp.ocupacion || '',
            
            // Contacto
            telefono:        dp.telefono,
            correo:          dp.correo || '',
            domicilio:       dp.domicilio || '',
            
            // Emergencia
            emergenciaNombre:     dp.emergenciaNombre || '',
            emergenciaParentesco: dp.emergenciaParentesco || '',
            emergenciaTelefono:   dp.emergenciaTelefono || '',
            
            // Tutor (si aplica)
            tutorNombre:         dp.tutorNombre || '',
            tutorParentesco:     dp.tutorParentesco || '',
            tutorTelefono:       dp.tutorTelefono || '',
            tutorIdentificacion: dp.tutorIdentificacion || '',
            tutorFirma:          dp.tutorFirma || '',

            // Antecedentes Médicos
            enfermedades:    padecimientosGuardar,
            
            // Cirugías
            hospitalizado:   dCir.hospitalizado || '',
            tuvoCirugias:    dCir.cirugias || '',
            cirugiasDetalle: dCir.cuales || '',
            cirugiasFecha:   dCir.fecha || '',

            // <-- CAMBIO: Usamos nuestra nueva variable formateada
            medicamentos: medicamentosGuardar, 
            
            alergias: alergiasGuardar, 
    
            habitos: habitosGuardar,
            
            // --- NUEVO BLOQUE: HISTORIA ODONTOLÓGICA ---
            ultimaVisitaDentista: hOdo.ultimaVisita || '',
            usoBrackets:          hOdo.brackets || '',
            extracciones:         hOdo.extracciones || '',
            endodoncias:          hOdo.endodoncias || '',
            sangradoEncias:       hOdo.sangrado || '',
            sensibilidadDental:   hOdo.sensibilidad || '',
            miedoDental:          hOdo.miedo || '',

            // Consulta
            motivo:          patientData.motivoConsulta?.motivo       ?? '',
            tipoConsulta:    patientData.motivoConsulta?.tipo         ?? '', // (si la tenías antes)
            consentimientos: patientData.consentimientos,
            fechaRegistro:   new Date().toISOString(),
            estatus:         'prospecto',
        };

        await guardarProspecto(prospecto);
        mostrarExitoRegistro();
    } catch (e) {
        console.error('Error al guardar prospecto:', e);
        mostrarErrorPaso('Ocurrió un error al enviar. Intenta de nuevo.');
        if (btn) { 
            btn.disabled = false; 
            btn.innerHTML = 'Continuar <i class="bi bi-arrow-right ms-2"></i>'; 
        }
    }
}

function mostrarExitoRegistro() {
    stepContainer.innerHTML = `
        <div class="text-center py-5">
            <div style="font-size: 4rem;" class="mb-4">🎉</div>
            <h3 class="fw-bold mb-2">¡Registro exitoso!</h3>
            <p class="text-muted mb-4">
                Recibimos tu información. En breve nos pondremos<br>
                en contacto contigo para confirmar tu primera cita.
            </p>
            <button class="btn btn-outline-primary" onclick="location.reload()">
                Volver al inicio
            </button>
        </div>
    `;
    progressContainer.innerHTML = '';
}

// ─────────────────────────────────────────────
//  FLUJO RECURRENTE — buscar expediente
// ─────────────────────────────────────────────
function resetRecurrente() {
    pacienteRecurrente = null;
    document.getElementById('rec-telefono').value = '';
    document.getElementById('rec-fecha').value    = '';
    document.getElementById('rec-error').classList.add('d-none');
    document.getElementById('rec-exito').classList.add('d-none');
    document.getElementById('rec-form').classList.remove('d-none');
}

document.getElementById('btn-buscar-recurrente').addEventListener('click', async () => {
    const telefono = document.getElementById('rec-telefono').value.trim();
    const fecha    = document.getElementById('rec-fecha').value;
    const btnBuscar = document.getElementById('btn-buscar-recurrente');
    const errorEl   = document.getElementById('rec-error');

    errorEl.classList.add('d-none');

    if (!telefono || !fecha) {
        errorEl.textContent = 'Por favor ingresa tu teléfono y fecha de nacimiento.';
        errorEl.classList.remove('d-none');
        return;
    }

    btnBuscar.disabled = true;
    btnBuscar.textContent = 'Buscando...';

    try {
        const paciente = await buscarPacienteRecurrente(telefono, fecha);

        if (!paciente) {
            document.getElementById('rec-error').classList.remove('d-none');
        } else {
            pacienteRecurrente = paciente;
            document.getElementById('rec-nombre-bienvenida').textContent =
                `¡Hola, ${paciente.nombre.split(' ')[0]}!`;
            document.getElementById('rec-form').classList.add('d-none');
            document.getElementById('rec-exito').classList.remove('d-none');
        }
    } catch (e) {
        console.error('Error buscando paciente:', e);
        errorEl.textContent = 'Error al buscar. Intenta de nuevo.';
        errorEl.classList.remove('d-none');
    } finally {
        btnBuscar.disabled = false;
        btnBuscar.textContent = 'Buscar mi expediente';
    }
});

// Botón "Solicitar una cita" tras identificarse
document.getElementById('btn-solicitar-cita').addEventListener('click', () => {
    iniciarSolicitudCita();
    mostrarSeccion('solicitarCita');
});

// ─────────────────────────────────────────────
//  FLUJO SOLICITAR CITA (paciente recurrente)
// ─────────────────────────────────────────────
function iniciarSolicitudCita() {
    // Fecha mínima = hoy
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('cita-fecha').min   = hoy;
    document.getElementById('cita-fecha').value = '';

    // Rellenar selector de horas (06:00 – 21:30 cada 30 min)
    const selectHora = document.getElementById('cita-hora');
    selectHora.innerHTML = '<option value="">— Selecciona —</option>';
    for (let h = 6; h < 22; h++) {
        for (let m of [0, 30]) {
            const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            selectHora.innerHTML += `<option value="${val}">${val}</option>`;
        }
    }

    // Limpiar estado previo
    document.getElementById('cita-error').classList.add('d-none');
    document.getElementById('cita-exito').classList.add('d-none');
    document.getElementById('cita-form-footer').classList.remove('d-none');
    document.getElementById('cita-motivo').value = '';
}

document.getElementById('btn-enviar-cita').addEventListener('click', async () => {
    const fecha    = document.getElementById('cita-fecha').value;
    const hora     = document.getElementById('cita-hora').value;
    const duracion = parseInt(document.getElementById('cita-duracion').value);
    const tipo     = document.getElementById('cita-tipo').value;
    const motivo   = document.getElementById('cita-motivo').value.trim();
    const errorEl  = document.getElementById('cita-error');
    const btn      = document.getElementById('btn-enviar-cita');

    errorEl.classList.add('d-none');

    if (!fecha) { errorEl.textContent = 'Por favor selecciona una fecha.'; errorEl.classList.remove('d-none'); return; }
    if (!hora)  { errorEl.textContent = 'Por favor selecciona una hora.';  errorEl.classList.remove('d-none'); return; }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        await guardarCita({
            pacienteId: pacienteRecurrente?.id    ?? null,
            nombre:     pacienteRecurrente?.nombre ?? '',
            telefono:   pacienteRecurrente?.telefono ?? '',
            fecha,
            horaInicio: hora,
            duracion,
            tipo,
            motivo,
            estado:  'pendiente',
            origen:  'paciente',
        });

        document.getElementById('cita-form-footer').classList.add('d-none');
        document.getElementById('cita-exito').classList.remove('d-none');

    } catch (e) {
        console.error('Error enviando cita:', e);
        errorEl.textContent = 'Error al enviar la solicitud. Intenta de nuevo.';
        errorEl.classList.remove('d-none');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar solicitud';
    }
});