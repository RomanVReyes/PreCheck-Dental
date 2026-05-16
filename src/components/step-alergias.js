import { obtenerCatalogo } from '../services/catalogService.js';

export async function renderStepAlergias(container, data) {

    // =====================================
    // CARGAR CATÁLOGO
    // =====================================

    const catalogo =
        await obtenerCatalogo('catalogoAlergias');

    const alergiasDB =
        catalogo.filter(a =>
            a.activo &&
            a.nombre.toLowerCase() !== 'ninguna'
        );

    const alergiasActuales =
        data.antecedentes.alergias || [];

    const tieneAlergias =
        alergiasActuales.length > 0;

    // =====================================
    // HTML
    // =====================================

    container.innerHTML = `

        <h3 class="mb-3 fw-bold text-primary">

            <i class="bi bi-exclamation-triangle me-2"></i>

            Alergias

        </h3>

        <p class="text-muted mb-4">

            Indique si presenta alergias conocidas.

        </p>

        <!-- PREGUNTA -->
        <div class="card border-0 shadow-sm mb-4">

            <div class="card-body">

                <label class="form-label fw-semibold mb-3">

                    ¿Tiene alguna alergia conocida?

                </label>

                <div class="d-flex gap-4">

                    <div class="form-check">

                        <input
                            class="form-check-input"
                            type="radio"
                            name="tieneAlergias"
                            id="alergias-si"
                            value="si"
                            ${tieneAlergias ? 'checked' : ''}>

                        <label
                            class="form-check-label"
                            for="alergias-si">

                            Sí

                        </label>

                    </div>

                    <div class="form-check">

                        <input
                            class="form-check-input"
                            type="radio"
                            name="tieneAlergias"
                            id="alergias-no"
                            value="no"
                            ${!tieneAlergias ? 'checked' : ''}>

                        <label
                            class="form-check-label"
                            for="alergias-no">

                            No

                        </label>

                    </div>

                </div>

            </div>

        </div>

        <!-- SECCIÓN -->
        <div
            id="seccion-alergias"
            class="${tieneAlergias ? '' : 'd-none'}">

            <!-- BUSCADOR -->
            <div class="card border-0 shadow-sm mb-4">

                <div class="card-body">

                    <label class="form-label fw-semibold">

                        Buscar alergia

                    </label>

                    <input
                        type="text"
                        id="buscar-alergia"
                        class="form-control"
                        placeholder="Escriba para buscar...">

                    <div
                        id="resultados-alergias"
                        class="list-group mt-2 d-none">
                    </div>

                </div>

            </div>

            <!-- CARDS -->
            <div id="alergias-container"></div>

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

    const seccionAlergias =
        container.querySelector('#seccion-alergias');

    const radioSi =
        container.querySelector('#alergias-si');

    const radioNo =
        container.querySelector('#alergias-no');

    const buscador =
        container.querySelector('#buscar-alergia');

    const resultados =
        container.querySelector('#resultados-alergias');

    const alergiasContainer =
        container.querySelector('#alergias-container');

    // =====================================
    // MOSTRAR / OCULTAR
    // =====================================

    radioSi.addEventListener('change', () => {

        seccionAlergias.classList.remove('d-none');

    });

    radioNo.addEventListener('change', () => {

        seccionAlergias.classList.add('d-none');

        alergiasContainer.innerHTML = '';

    });

    // =====================================
    // CREAR CARD
    // =====================================

    const agregarAlergiaCard = (alergia) => {

        const existe =
            alergiasContainer.querySelector(
                `[data-alergia="${alergia.nombre}"]`
            );

        if (existe) return;

        const card = document.createElement('div');

        card.className =
            'card border-0 shadow-sm mb-3 detalle-alergia-card border-start border-danger border-4';

        card.dataset.alergia =
            alergia.nombre;

        card.innerHTML = `

            <div class="card-body">

                <div class="d-flex justify-content-between align-items-start mb-3">

                    <h5 class="fw-bold text-danger mb-0">

                        ${alergia.nombre}

                    </h5>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger btn-remove-alergia">

                        <i class="bi bi-trash"></i>

                    </button>

                </div>

                <div class="row">

                    <div class="col-12">

                        <label class="form-label">

                            Reacción alérgica

                        </label>

                        <input
                            type="text"
                            class="form-control dt-reaccion"
                            placeholder="Ej. Ronchas, inflamación, dificultad respiratoria..."
                            value="${alergia.reaccion || ''}">

                    </div>

                </div>

            </div>
        `;

        card.querySelector('.btn-remove-alergia')
            .addEventListener('click', () => {

                card.remove();

            });

        alergiasContainer.appendChild(card);
    };

    // =====================================
    // CARGAR PREVIOS
    // =====================================

    alergiasActuales.forEach(alergia => {

        agregarAlergiaCard(alergia);

    });

    // =====================================
    // BUSCADOR
    // =====================================

    buscador?.addEventListener('input', (e) => {

        const valor =
            e.target.value.toLowerCase().trim();

        resultados.innerHTML = '';

        if (!valor) {

            resultados.classList.add('d-none');

            return;
        }

        const encontrados =
            alergiasDB.filter(alergia =>
                alergia.nombre.toLowerCase()
                    .includes(valor)
            );

        if (encontrados.length === 0) {

            resultados.innerHTML = `
                <div class="list-group-item text-muted">
                    No encontrado
                </div>
            `;

            resultados.classList.remove('d-none');

            return;
        }

        encontrados.forEach(alergia => {

            const item =
                document.createElement('button');

            item.type = 'button';

            item.className =
                'list-group-item list-group-item-action';

            item.textContent =
                alergia.nombre;

            item.addEventListener('click', () => {

                agregarAlergiaCard({
                    nombre: alergia.nombre,
                    reaccion: ''
                });

                buscador.value = '';

                resultados.innerHTML = '';

                resultados.classList.add('d-none');
            });

            resultados.appendChild(item);
        });

        resultados.classList.remove('d-none');
    });
}

export function obtenerDatosAlergias() {

    const tieneAlergias =
        document.querySelector('#alergias-si')
            ?.checked;

    if (!tieneAlergias) {

        return [];
    }

    const alergias = [];

    document.querySelectorAll('.detalle-alergia-card')
        .forEach(card => {

            alergias.push({

                nombre:
                    card.dataset.alergia,

                reaccion:
                    card.querySelector('.dt-reaccion')
                        .value
                        .trim()

            });
        });

    return alergias;
}