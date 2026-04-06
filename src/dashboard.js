// src/dashboard.js

// Esperar a que el documento HTML cargue completamente
document.addEventListener("DOMContentLoaded", async () => {
    const tablaPacientes = document.getElementById("tablaPacientes");
    
    // Limpiamos el contenido de prueba (hardcodeado)
    tablaPacientes.innerHTML = "<tr><td colspan='4' class='text-center'>Cargando pacientes...</td></tr>";

    try {
        // Consultar la colección 'consultas' en Firebase
        const querySnapshot = await window.getDocs(window.collection(window.db, "consultas"));
        
        // Limpiamos el mensaje de "Cargando"
        tablaPacientes.innerHTML = "";

        // Si no hay datos
        if (querySnapshot.empty) {
            tablaPacientes.innerHTML = "<tr><td colspan='4' class='text-center'>No hay pacientes registrados aún.</td></tr>";
            return;
        }

        // Recorrer cada paciente encontrado y crear una fila (tr)
        querySnapshot.forEach((doc) => {
            const paciente = doc.data();
            
            // Construcción dinámica de la fila
            const fila = `
                <tr>
                    <td><strong>${paciente.nombre}</strong><br><small class="text-muted">${paciente.fecha}</small></td>
                    <td class="${paciente.alergias ? 'text-danger' : ''}">${paciente.alergias || 'Ninguna'}</td>
                    <td><span class="badge bg-secondary">${paciente.motivo}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="alert('Funcionalidad de PDF en desarrollo')">Ver Detalles</button>
                    </td>
                </tr>
            `;
            
            // Agregar la fila a la tabla
            tablaPacientes.innerHTML += fila;
        });

    } catch (error) {
        console.error("Error al obtener los documentos: ", error);
        tablaPacientes.innerHTML = "<tr><td colspan='4' class='text-center text-danger'>Error al cargar los datos.</td></tr>";
    }
});