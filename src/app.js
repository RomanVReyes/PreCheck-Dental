document.getElementById('patientForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const datosPaciente = {
        nombre: document.getElementById('nombre').value,
        alergias: document.getElementById('alergias').value,
        motivo: document.getElementById('motivo').value,
        fecha: new Date().toLocaleString(),
        estado: "Nuevo"
    };

    try {
        // Guardar en la colección 'consultas' de Firestore
        const docRef = await window.addDoc(window.collection(window.db, "consultas"), datosPaciente);
        console.log("Documento escrito con ID: ", docRef.id);
        alert("¡Registro enviado exitosamente!");
        this.reset();
    } catch (e) {
        console.error("Error al añadir documento: ", e);
        alert("Hubo un error al enviar los datos.");
    }
});