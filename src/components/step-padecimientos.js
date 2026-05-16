import { obtenerCatalogo } from '../services/catalogService.js';

export async function renderStepMedicos(container, data) {

    const enfermedades =
        await obtenerCatalogo('catalogoPadecimientos');

    const seleccionadas =
        data.antecedentes.enfermedades || [];

    const tienePadecimientos =
        seleccionadas.length > 0;

    const getDetalles = (nombre) => {

        return seleccionadas.find(e =>
            e.nombre === nombre
        ) || {
            nombre,
            desde: '',
            controlado: '',
            observaciones: ''
        };
    };

    // =====================================
    // AGRUPAR CATEGORÍAS
    // =====================================

    const categorias = {};

    enfermedades.forEach(enf => {

        if (!categorias[enf.categoria]) {
            categorias[enf.categoria] = [];
        }

        categorias[enf.categoria].push(enf);
    });

    // =====================================
    // HTML
    // =====================================

    container.innerHTML = `

        <h3 class="mb-3 fw-bold text-primary">

            <i class="bi bi-heart-pulse me-2"></i>

            Antecedentes Médicos

        </h3>

        <p class="text-muted mb-4">

            Indique si tiene enfermedades
            diagnosticadas actualmente.

        </p>

        <!-- PREGUNTA -->
        <div class="card border-0 shadow-sm mb-4">

            <div class="card-body">

                <label class="form-label fw-semibold mb-3">

                    ¿Tiene enfermedades diagnosticadas?

                </label>

                <div class="d-flex gap-4">

                    <div class="form-check">

                        <input
                            class="form-check-input"
                            type="radio"
                            name="tienePadecimientos"
                            id="padecimientos-si"
                            value="si"
                            ${tienePadecimientos ? 'checked' : ''}>

                        <label
                            class="form-check-label"
                            for="padecimientos-si">

                            Sí

                        </label>

                    </div>

                    <div class="form-check">

                        <input
                            class="form-check-input"
                            type="radio"
                            name="tienePadecimientos"
                            id="padecimientos-no"
                            value="no"
                            ${!tienePadecimientos ? 'checked' : ''}>

                        <label
                            class="form-check-label"
                            for="padecimientos-no">

                            No

                        </label>

                    </div>

                </div>

            </div>

        </div>

        <!-- SECCIÓN COMPLETA -->
        <div
            id="seccion-padecimientos"
            class="${tienePadecimientos ? '' : 'd-none'}">

            <!-- BUSCADOR -->
            <div class="card border-0 shadow-sm mb-4">

                <div class="card-body">

                    <label class="form-label fw-semibold">

                        Buscar enfermedad

                    </label>

                    <input
                        type="text"
                        id="buscar-enfermedad"
                        class="form-control"
                        placeholder="Escriba para buscar...">

                </div>

            </div>

            <!-- LISTA -->
            <div id="lista-enfermedades">

                ${Object.entries(categorias).map(([categoria, items]) => `

                    <div class="card border-0 shadow-sm mb-4 categoria-bloque">

                        <div class="card-body">

                            <h5 class="fw-bold text-secondary border-bottom pb-2 mb-3 text-capitalize">

                                ${categoria}

                            </h5>

                            <div class="row g-2">

                                ${items.map(item => `

                                    <div
                                        class="col-md-6 enfermedad-item"
                                        data-nombre="${item.nombre.toLowerCase()}">

                                        <div class="form-check border rounded p-3 h-100">

                                            <input
                                                class="form-check-input enfermedad-check"
                                                type="checkbox"
                                                value="${item.nombre}"
                                                id="chk-${item.id}"
                                                ${seleccionadas.some(e =>
                                                    e.nombre === item.nombre
                                                ) ? 'checked' : ''}>

                                            <label
                                                class="form-check-label fw-medium"
                                                for="chk-${item.id}">

                                                ${item.nombre}

                                            </label>

                                        </div>

                                    </div>

                                `).join('')}

                            </div>

                        </div>

                    </div>

                `).join('')}

            </div>

            <!-- DETALLES -->
            <div class="mt-5">

                <h4 class="fw-bold mb-3">

                    Detalles de enfermedades seleccionadas

                </h4>

                <div id="detalles-container">

                </div>

            </div>

        </div>

        <!-- BOTONES -->
        <div class="d-flex justify-content-between mt-5 pt-3 border-top">

            <button
                type="button"
                id="btn-prev"
                class="btn btn-outline-secondary btn-lg px-4">

                <i class="bi bi-arrow-left me-2"></i>
                Regresar

            </button>

            <button
                type="button"
                id="btn-next"
                class="btn btn-primary btn-lg px-5">

                Continuar
                <i class="bi bi-arrow-right ms-2"></i>

            </button>

        </div>
    `;

    // =====================================
    // ELEMENTOS
    // =====================================

    const seccionPadecimientos =
        container.querySelector('#seccion-padecimientos');

    const radioSi =
        container.querySelector('#padecimientos-si');

    const radioNo =
        container.querySelector('#padecimientos-no');

    const buscador =
        container.querySelector('#buscar-enfermedad');

    const detallesContainer =
        container.querySelector('#detalles-container');

    // =====================================
    // MOSTRAR / OCULTAR
    // =====================================

    radioSi.addEventListener('change', () => {

        seccionPadecimientos.classList.remove('d-none');

    });

    radioNo.addEventListener('change', () => {

        seccionPadecimientos.classList.add('d-none');

        detallesContainer.innerHTML = '';

        container.querySelectorAll('.enfermedad-check')
            .forEach(chk => chk.checked = false);

    });

    // =====================================
    // CREAR CARD
    // =====================================

    const crearCardDetalle = (enf) => {

        const existe =
            detallesContainer.querySelector(
                `[data-enfermedad="${enf.nombre}"]`
            );

        if (existe) return;

        const card = document.createElement('div');

        card.className =
            'card border-0 shadow-sm mb-3 detalle-card';

        card.dataset.enfermedad =
            enf.nombre;

        card.innerHTML = `

            <div class="card-body">

                <div class="d-flex justify-content-between align-items-start mb-3">

                    <h5 class="fw-bold text-primary mb-0">

                        ${enf.nombre}

                    </h5>

                </div>

                <div class="row g-3">

                    <div class="col-md-4">

                        <label class="form-label">

                            ¿Desde cuándo?

                        </label>

                        <input
                            type="text"
                            class="form-control dt-desde"
                            placeholder="Ej. Hace 5 años"
                            value="${enf.desde || ''}">

                    </div>

                    <div class="col-md-4">

                        <label class="form-label">

                            ¿Controlado?

                        </label>

                        <select class="form-select dt-controlado">

                            <option value="">
                                Seleccione...
                            </option>

                            <option
                                value="Sí"
                                ${enf.controlado === 'Sí'
                                    ? 'selected'
                                    : ''}>

                                Sí

                            </option>

                            <option
                                value="No"
                                ${enf.controlado === 'No'
                                    ? 'selected'
                                    : ''}>

                                No

                            </option>

                        </select>

                    </div>

                    <div class="col-md-4">

                        <label class="form-label">

                            Observaciones

                        </label>

                        <input
                            type="text"
                            class="form-control dt-obs"
                            placeholder="Medicamentos o notas"
                            value="${enf.observaciones || ''}">

                    </div>

                </div>

            </div>
        `;

        detallesContainer.appendChild(card);
    };

    // =====================================
    // CARGAR PREVIOS
    // =====================================

    seleccionadas.forEach(enf => {
        crearCardDetalle(enf);
    });

    // =====================================
    // BUSCADOR
    // =====================================

    buscador?.addEventListener('input', (e) => {

        const valor =
            e.target.value.toLowerCase();

        container.querySelectorAll('.enfermedad-item')
            .forEach(item => {

                const nombre =
                    item.dataset.nombre;

                item.style.display =
                    nombre.includes(valor)
                        ? ''
                        : 'none';
            });
    });

    // =====================================
    // CHECKBOXES
    // =====================================

    container.querySelectorAll('.enfermedad-check')
        .forEach(checkbox => {

            checkbox.addEventListener('change', (e) => {

                const nombre =
                    e.target.value;

                if (e.target.checked) {

                    crearCardDetalle(
                        getDetalles(nombre)
                    );

                } else {

                    const cardEliminar =
                        detallesContainer.querySelector(
                            `[data-enfermedad="${nombre}"]`
                        );

                    if (cardEliminar) {
                        cardEliminar.remove();
                    }
                }
            });
        });
}

export function obtenerDatosMedicos() {

    const tienePadecimientos =
        document.querySelector('#padecimientos-si')
            ?.checked;

    if (!tienePadecimientos) {

        return {
            enfermedades: []
        };
    }

    const enfermedades = [];

    document.querySelectorAll('.detalle-card')
        .forEach(card => {

            enfermedades.push({

                nombre:
                    card.dataset.enfermedad,

                desde:
                    card.querySelector('.dt-desde')
                        .value
                        .trim(),

                controlado:
                    card.querySelector('.dt-controlado')
                        .value,

                observaciones:
                    card.querySelector('.dt-obs')
                        .value
                        .trim()

            });
        });

    return {
        enfermedades
    };
}