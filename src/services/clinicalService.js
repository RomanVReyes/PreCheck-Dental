import { db, collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc } from '../core/firebase.js';

export async function obtenerProspectos() {
    const querySnapshot = await getDocs(collection(db, "prospectos"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function obtenerExpedientes() {
    const querySnapshot = await getDocs(collection(db, "expedientes"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function validarYCrearExpediente(idProspecto) {
    const prospectos = await obtenerProspectos();
    const datos = prospectos.find(p => p.id === idProspecto);
    
    if (!datos) throw new Error("Prospecto no encontrado");

    delete datos.id; 

    await addDoc(collection(db, "expedientes"), {
        ...datos,
        estatus: "activo",
        fechaAltaOficial: new Date().toISOString()
    });

    await deleteDoc(doc(db, "prospectos", idProspecto));
}

export async function obtenerHorarioBase() {
    try {
        const docRef = doc(db, "configuracion", "horarioBase");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null; 
        }
    } catch (error) {
        console.error("Error al obtener horario base:", error);
        throw error;
    }
}

export async function guardarHorarioBaseDB(nuevoHorario) {
    try {
        const docRef = doc(db, "configuracion", "horarioBase");

        await setDoc(docRef, nuevoHorario); 
    } catch (error) {
        console.error("Error al guardar horario base:", error);
        throw error;
    }
}