import { guardarProspecto, buscarPacienteRecurrente } from '../services/patientService.js';

// Como usamos modules, las funciones no son globales. 
// Las exponemos a 'window' solo para los botones HTML (onclick="mostrarSeccion(...)")
window.mostrarSeccion = (idSeccion) => {
    document.getElementById('seccion-bienvenida').classList.add('d-none');
    document.getElementById('seccion-nuevo').classList.add('d-none');
    document.getElementById('seccion-recurrente').classList.add('d-none');
    document.getElementById(idSeccion).classList.remove('d-none');
};

// Formulario Nuevo
document.getElementById('formNuevo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevoPaciente = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        alergias: document.getElementById('alergias').value || "Ninguna",
        enfermedades: document.getElementById('enfermedades').value,
        motivo: document.getElementById('motivo').value,
        fechaRegistro: new Date().toISOString(),
        estatus: "prospecto"
    };

    try {
        await guardarProspecto(nuevoPaciente);
        alert("¡Datos enviados con éxito! El dentista te contactará pronto.");
        location.reload(); 
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error al enviar los datos.");
    }
});

// Formulario Recurrente
document.getElementById('formRecurrente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tel = document.getElementById('telBusqueda').value;
    const fecha = document.getElementById('fechaBusqueda').value;

    try {
        const paciente = await buscarPacienteRecurrente(tel, fecha);
        if (paciente) {
            alert(`Bienvenido de nuevo, ${paciente.nombre}. Redirigiendo a tu agenda...`);
        } else {
            alert("No encontramos tus datos. Si es tu primera vez, regístrate como Paciente Nuevo.");
        }
    } catch (error) {
        console.error("Error al buscar:", error);
    }
});