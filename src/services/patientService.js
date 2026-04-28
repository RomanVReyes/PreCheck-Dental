import { db, collection, addDoc, query, where, getDocs } from '../core/firebase.js';

export async function guardarProspecto(nuevoPaciente) {
    return await addDoc(collection(db, "prospectos"), nuevoPaciente);
}

export async function buscarPacienteRecurrente(telefono, fechaNacimiento) {
    const q = query(
        collection(db, "expedientes"), 
        where("telefono", "==", telefono),
        where("fechaNacimiento", "==", fechaNacimiento)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data();
}