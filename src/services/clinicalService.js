import { db, collection, getDocs, addDoc, deleteDoc, doc } from '../core/firebase.js';

export async function obtenerProspectos() {
    const querySnapshot = await getDocs(collection(db, "prospectos"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function obtenerExpedientes() {
    const querySnapshot = await getDocs(collection(db, "expedientes"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function validarYCrearExpediente(idProspecto) {
    // 1. Obtener prospectos y buscar el que queremos
    const prospectos = await obtenerProspectos();
    const datos = prospectos.find(p => p.id === idProspecto);
    
    if (!datos) throw new Error("Prospecto no encontrado");

    // 2. Limpiar el ID para no guardarlo duplicado dentro del documento
    delete datos.id; 

    // 3. Crear expediente
    await addDoc(collection(db, "expedientes"), {
        ...datos,
        estatus: "activo",
        fechaAltaOficial: new Date().toISOString()
    });

    // 4. Eliminar prospecto
    await deleteDoc(doc(db, "prospectos", idProspecto));
}