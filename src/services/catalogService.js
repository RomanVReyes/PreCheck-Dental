import {
    db,
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "../core/firebase.js";

export async function obtenerCatalogo(nombreCatalogo) {

    try {

        const ref = collection(db, nombreCatalogo);

        const q = query(
            ref,
            where("activo", "==", true),
            //orderBy("nombre")
        );

        const snapshot = await getDocs(q);

        const resultados = [];

        snapshot.forEach(doc => {

            resultados.push({
                id: doc.id,
                ...doc.data()
            });

        });

        return resultados;

    } catch(error) {

        console.error(
            `Error obteniendo catálogo ${nombreCatalogo}:`,
            error
        );

        return [];
    }
}