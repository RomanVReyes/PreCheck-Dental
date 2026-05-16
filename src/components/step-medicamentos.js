import { obtenerCatalogo } from '../services/catalogService.js';

export async function renderStepMedicamentos(container, data) {

    const catalogo = await obtenerCatalogo('catalogoMedicamentos');

    const medicamentosDB =
        catalogo.filter(med => med.activo);

    let medicamentosActuales =
        data.antecedentes.medicamentos || [];

    const tomaMedicamentos =
        medicamentosActuales.length > 0;

    container.innerHTML = `

        <h3 class="mb-3 fw-bold text-primary">
            <i class="bi bi-capsule me-2"></i>
            Medicamentos Actuales
        </h3>

        <p class="text-muted mb-4">
            Indique si actualmente toma medicamentos.
        </p>

        <!-- PREGUNTA -->
        <div class="card border-0 shadow-sm mb-4">

            <div class="card-body">

                <label class="form-label fw-semibold mb-3">
                    ¿Actualmente toma medicamentos?
                </label>

                <div class="d-flex gap-4">

                    <div class="form-check">

                        <input
                            class="form-check-input"
                            type="radio"
                            name="usaMedicamentos"
                            id="med-si"
                            value="si"
                            ${tomaMedicamentos ? 'checked' : ''}>

                        <label
                            class="form-check-label"
                            for="med-si">

                            Sí
                        </label>

                    </div>

                    <div class="form-check">

                        <input
                            class="form-check-input"
                            type="radio"
                            name="usaMedicamentos"
                            id="med-no"
                            value="no"
                            ${!tomaMedicamentos ? 'checked' : ''}>

                        <label
                            class="form-check-label"
                            for="med-no">

                            No
                        </label>

                    </div>

                </div>

            </div>

        </div>

        <!-- SECCIÓN MEDICAMENTOS -->
        <div
            id="seccion-medicamentos"
            class="${tomaMedicamentos ? '' : 'd-none'}">

            <!-- BUSCADOR -->
            <div class="card border-0 shadow-sm mb-4">

                <div class="card-body">

                    <label class="form-label fw-semibold">
                        Buscar medicamento
                    </label>

                    <input
                        type="text"
                        id="buscar-medicamento"
                        class="form-control"
                        placeholder="Escriba para buscar...">

                    <div
                        id="resultados-medicamentos"
                        class="list-group mt-2 d-none">
                    </div>

                </div>

            </div>

            <!-- CARDS -->
            <div id="medicamentos-container"></div>

        </div>

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

    const seccionMedicamentos =
        container.querySelector('#seccion-medicamentos');

    const radioSi =
        container.querySelector('#med-si');

    const radioNo =
        container.querySelector('#med-no');

    const buscador =
        container.querySelector('#buscar-medicamento');

    const resultados =
        container.querySelector('#resultados-medicamentos');

    const medicamentosContainer =
        container.querySelector('#medicamentos-container');

    // =====================================
    // MOSTRAR / OCULTAR
    // =====================================

    radioSi.addEventListener('change', () => {
        seccionMedicamentos.classList.remove('d-none');
    });

    radioNo.addEventListener('change', () => {
        seccionMedicamentos.classList.add('d-none');
        medicamentosContainer.innerHTML = '';
    });

    // =====================================
    // CREAR CARD
    // =====================================

    const agregarMedicamentoCard = (medicamento) => {

        const existe =
            medicamentosContainer.querySelector(
                `[data-medicamento="${medicamento.nombre}"]`
            );

        if (existe) return;

        const card = document.createElement('div');

        card.className =
            'card border-0 shadow-sm mb-3 medicamento-card';

        card.dataset.medicamento =
            medicamento.nombre;

        card.innerHTML = `

            <div class="card-body">

                <div class="d-flex justify-content-between align-items-start mb-3">

                    <h5 class="fw-bold text-primary mb-0">
                        ${medicamento.nombre}
                    </h5>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger btn-remove-med">

                        <i class="bi bi-trash"></i>
                    </button>

                </div>

                <div class="row g-3">

                    <div class="col-md-6">

                        <label class="form-label">
                            Dosis
                        </label>

                        <input
                            type="text"
                            class="form-control med-dosis"
                            placeholder="Ej. 500mg"
                            value="${medicamento.dosis || ''}">

                    </div>

                    <div class="col-md-6">

                        <label class="form-label">
                            Frecuencia
                        </label>

                        <input
                            type="text"
                            class="form-control med-frecuencia"
                            placeholder="Ej. Cada 12 horas"
                            value="${medicamento.frecuencia || ''}">

                    </div>

                </div>

            </div>
        `;

        card.querySelector('.btn-remove-med')
            .addEventListener('click', () => {
                card.remove();
            });

        medicamentosContainer.appendChild(card);
    };

    // =====================================
    // CARGAR PREVIOS
    // =====================================

    medicamentosActuales.forEach(med => {
        agregarMedicamentoCard(med);
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
            medicamentosDB.filter(med =>
                med.nombre.toLowerCase()
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

        encontrados.forEach(med => {

            const item =
                document.createElement('button');

            item.type = 'button';

            item.className =
                'list-group-item list-group-item-action';

            item.textContent = med.nombre;

            item.addEventListener('click', () => {

                agregarMedicamentoCard({
                    nombre: med.nombre,
                    dosis: '',
                    frecuencia: ''
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

export function obtenerDatosMedicamentos() {

    const usaMedicamentos =
        document.querySelector('#med-si')?.checked;

    if (!usaMedicamentos) {
        return [];
    }

    const medicamentos = [];

    document.querySelectorAll('.medicamento-card')
        .forEach(card => {

            medicamentos.push({

                nombre: card.dataset.medicamento,

                dosis: card.querySelector('.med-dosis')
                    .value
                    .trim(),

                frecuencia: card.querySelector('.med-frecuencia')
                    .value
                    .trim()

            });
        });

    return medicamentos;
}