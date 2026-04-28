// 1. FUNCIÓN PARA CAMBIAR DE PANTALLA
function mostrarSeccion(idSeccion) {
    // Ocultamos todas
    document.getElementById('seccion-bienvenida').classList.add('d-none');
    document.getElementById('seccion-nuevo').classList.add('d-none');
    document.getElementById('seccion-recurrente').classList.add('d-none');
    
    // Mostramos la elegida
    document.getElementById(idSeccion).classList.remove('d-none');
}

// 2. LÓGICA PARA PACIENTE NUEVO
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
        estatus: "prospecto" // Se guarda como prospecto hasta que el doctor lo valide
    };

    try {
        await window.addDoc(window.collection(window.db, "prospectos"), nuevoPaciente);
        alert("¡Datos enviados con éxito! El dentista te contactará pronto.");
        location.reload(); // Recarga para volver al inicio
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error al enviar los datos.");
    }
});

// 3. LÓGICA PARA PACIENTE RECURRENTE (Verificación por Llave Compuesta)
document.getElementById('formRecurrente').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tel = document.getElementById('telBusqueda').value;
    const fecha = document.getElementById('fechaBusqueda').value;

    try {
        // Buscamos en la colección oficial de expedientes (pacientes ya validados)
        const q = window.query(
            window.collection(window.db, "expedientes"), 
            window.where("telefono", "==", tel),
            window.where("fechaNacimiento", "==", fecha)
        );

        const querySnapshot = await window.getDocs(q);

        if (!querySnapshot.empty) {
            const datos = querySnapshot.docs[0].data();
            alert(`Bienvenido de nuevo, ${datos.nombre}. Redirigiendo a tu agenda...`);
            // Aquí podrías redirigir a una página de calendario
        } else {
            alert("No encontramos tus datos. Si es tu primera vez, regístrate como Paciente Nuevo.");
        }
    } catch (error) {
        console.error("Error al buscar:", error);
    }
});