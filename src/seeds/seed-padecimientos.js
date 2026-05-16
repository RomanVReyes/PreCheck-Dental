import { db, collection, addDoc } from '../core/firebase.js';

const padecimientos = [
  {
    nombre: "Diabetes",
    categoria: "endocrina",
    activo: true,
    requiereDetalle: true
  },
  {
    nombre: "Hipertensión",
    categoria: "cardiovascular",
    activo: true,
    requiereDetalle: true
  },
  {
    nombre: "Problemas cardíacos",
    categoria: "cardiovascular",
    activo: true,
    requiereDetalle: true
  },
  {
    nombre: "Hepatitis",
    categoria: "infecciosa",
    activo: true,
    requiereDetalle: true
  },
  {
    nombre: "VIH",
    categoria: "infecciosa",
    activo: true,
    requiereDetalle: true
  },
  {
    nombre: "Epilepsia",
    categoria: "neurologica",
    activo: true,
    requiereDetalle: true
  },
  {
    nombre: "Asma",
    categoria: "respiratoria",
    activo: true,
    requiereDetalle: true
  }
];

async function importarPadecimientos() {
  try {

    for (const padecimiento of padecimientos) {

      await addDoc(
        collection(db, "catalogoPadecimientos"),
        padecimiento
      );

      console.log(`Insertado: ${padecimiento.nombre}`);
    }

    console.log("Importación completada");

  } catch (error) {
    console.error("Error:", error);
  }
}

importarPadecimientos();