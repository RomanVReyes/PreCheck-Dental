import {
    db, collection, addDoc, getDocs, doc, setDoc, getDoc, query, where
} from '../core/firebase.js';
import { Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ─────────────────────────────────────────────
//  GUARDAR CITA (paciente o manual)
//  origen: "paciente" | "manual"
// ─────────────────────────────────────────────
export async function guardarCita(datosCita) {
    try {
        const cita = {
            // Quién
            pacienteId:  datosCita.pacienteId  ?? null,
            nombre:      datosCita.nombre       ?? "",
            telefono:    datosCita.telefono     ?? "",

            // Cuándo
            fecha:       datosCita.fecha,        // "YYYY-MM-DD"
            horaInicio:  datosCita.horaInicio,   // "09:00"
            horaFin:     calcularHoraFin(datosCita.horaInicio, datosCita.duracion),
            duracion:    datosCita.duracion,     // minutos: 30 | 60 | 90

            // Qué
            motivo:      datosCita.motivo       ?? "",
            tipo:        datosCita.tipo         ?? "revisión",

            // Control
            estado:      datosCita.estado       ?? "pendiente",
            origen:      datosCita.origen       ?? "manual",
            notas:       datosCita.notas        ?? "",

            // Timestamps
            fechaSolicitud:     Timestamp.now(),
            fechaActualizacion: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "citas"), cita);
        return { id: docRef.id, ...cita };
    } catch (error) {
        console.error("Error al guardar cita:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────
//  LISTAR CITAS POR FECHA  →  para el calendario
//  Retorna todas las citas de un día específico
// ─────────────────────────────────────────────
export async function listarCitasPorFecha(fecha) {
    try {
        const q = query(
            collection(db, "citas"),
            where("fecha", "==", fecha)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error al listar citas por fecha:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────
//  LISTAR CITAS POR RANGO  →  para vista semanal
//  fechaInicio y fechaFin: "YYYY-MM-DD"
// ─────────────────────────────────────────────
export async function listarCitasPorRango(fechaInicio, fechaFin) {
    try {
        const q = query(
            collection(db, "citas"),
            where("fecha", ">=", fechaInicio),
            where("fecha", "<=", fechaFin)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error al listar citas por rango:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────
//  LISTAR SOLICITUDES PENDIENTES  →  tab dashboard
// ─────────────────────────────────────────────
export async function listarCitasPendientes() {
    try {
        const q = query(
            collection(db, "citas"),
            where("estado", "==", "pendiente")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error al listar citas pendientes:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────
//  LISTAR CITAS DE UN PACIENTE
// ─────────────────────────────────────────────
export async function listarCitasPorPaciente(pacienteId) {
    try {
        const q = query(
            collection(db, "citas"),
            where("pacienteId", "==", pacienteId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error al listar citas por paciente:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────
//  OBTENER UNA CITA POR ID
// ─────────────────────────────────────────────
export async function obtenerCita(idCita) {
    try {
        const docRef = doc(db, "citas", idCita);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
        console.error("Error al obtener cita:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────
//  ACTUALIZAR ESTADO DE CITA
//  estados válidos: "pendiente" | "confirmada" | "cancelada" | "completada"
// ─────────────────────────────────────────────
export async function actualizarEstadoCita(idCita, nuevoEstado, notas = null) {
    try {
        const docRef = doc(db, "citas", idCita);
        const cambios = {
            estado:             nuevoEstado,
            fechaActualizacion: Timestamp.now(),
        };
        if (notas !== null) cambios.notas = notas;

        await setDoc(docRef, cambios, { merge: true });
    } catch (error) {
        console.error("Error al actualizar estado de cita:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────
//  CONFIRMAR CITA  →  atajo semántico
// ─────────────────────────────────────────────
export async function confirmarCita(idCita, notas = null) {
    return actualizarEstadoCita(idCita, "confirmada", notas);
}

// ─────────────────────────────────────────────
//  CANCELAR CITA  →  atajo semántico
// ─────────────────────────────────────────────
export async function cancelarCita(idCita, notas = null) {
    return actualizarEstadoCita(idCita, "cancelada", notas);
}

// ─────────────────────────────────────────────
//  COMPLETAR CITA  →  atajo semántico
// ─────────────────────────────────────────────
export async function completarCita(idCita, notas = null) {
    return actualizarEstadoCita(idCita, "completada", notas);
}

// ─────────────────────────────────────────────
//  ACTUALIZAR DATOS COMPLETOS DE UNA CITA
//  (reagendar, editar motivo, agregar notas, etc.)
// ─────────────────────────────────────────────
export async function actualizarCita(idCita, cambios) {
    try {
        const docRef = doc(db, "citas", idCita);

        // Si cambia hora o duración, recalculamos horaFin automáticamente
        if (cambios.horaInicio || cambios.duracion) {
            const citaActual = await obtenerCita(idCita);
            const horaInicio = cambios.horaInicio ?? citaActual.horaInicio;
            const duracion   = cambios.duracion   ?? citaActual.duracion;
            cambios.horaFin  = calcularHoraFin(horaInicio, duracion);
        }

        await setDoc(docRef, {
            ...cambios,
            fechaActualizacion: Timestamp.now(),
        }, { merge: true });
    } catch (error) {
        console.error("Error al actualizar cita:", error);
        throw error;
    }
}

// ─────────────────────────────────────────────
//  HELPER INTERNO: calcular horaFin
//  horaInicio: "09:00", duracion: 30  →  "09:30"
// ─────────────────────────────────────────────
function calcularHoraFin(horaInicio, duracionMinutos) {
    const [horas, minutos] = horaInicio.split(":").map(Number);
    const totalMinutos = horas * 60 + minutos + duracionMinutos;
    const hFin = Math.floor(totalMinutos / 60).toString().padStart(2, "0");
    const mFin = (totalMinutos % 60).toString().padStart(2, "0");
    return `${hFin}:${mFin}`;
}