// components/step-habitos.js

export function renderStepHabitos(container, data) {

    const hab =
        data.antecedentes?.habitos || {};

    // =====================================
    // CREAR PREGUNTA
    // =====================================

    const crearPregunta = (
        id,
        pregunta,
        opciones = ['Sí', 'No'],
        icono = 'bi-check2-circle'
    ) => `

        <div class="card border-0 shadow-sm mb-3">

            <div class="card-body">

                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">

                    <div>

                        <h6 class="fw-semibold mb-1">

                            <i class="bi ${icono} text-primary me-2"></i>

                            ${pregunta}

                        </h6>

                    </div>

                    <div class="d-flex gap-4 flex-wrap">

                        ${opciones.map(opcion => `

                            <div class="form-check">

                                <input
                                    class="form-check-input"
                                    type="radio"
                                    name="${id}"
                                    id="${id}-${opcion.replace(/\s+/g, '')}"
                                    value="${opcion}"
                                    ${hab[id] === opcion ? 'checked' : ''}>

                                <label
                                    class="form-check-label"
                                    for="${id}-${opcion.replace(/\s+/g, '')}">

                                    ${opcion}

                                </label>

                            </div>

                        `).join('')}

                    </div>

                </div>

            </div>

        </div>
    `;

    // =====================================
    // HTML
    // =====================================

    container.innerHTML = `

        <h3 class="mb-3 fw-bold text-primary">

            <i class="bi bi-heart-pulse me-2"></i>

            Hábitos y Estilo de Vida

        </h3>

        <p class="text-muted mb-4">

            Esta información es completamente confidencial y nos ayuda
            a brindarle una atención más segura y personalizada.

        </p>

        <!-- HÁBITOS -->
        <div class="mb-4">

            ${crearPregunta(
                'fuma',
                '¿Fuma tabaco, vapeadores o similares?',
                ['Sí', 'No'],
                'bi-fire'
            )}

            ${crearPregunta(
                'alcohol',
                '¿Consume bebidas alcohólicas?',
                ['Sí', 'No'],
                'bi-cup-straw'
            )}

            ${crearPregunta(
                'drogas',
                '¿Consume drogas recreativas?',
                ['Sí', 'No'],
                'bi-exclamation-octagon'
            )}

            ${crearPregunta(
                'bruxismo',
                '¿Aprieta o rechina los dientes?',
                ['Sí', 'No'],
                'bi-emoji-frown'
            )}

            ${crearPregunta(
                'embarazo',
                '¿Actualmente está embarazada?',
                ['Sí', 'No', 'No aplica'],
                'bi-heart'
            )}

        </div>

        <!-- INFO -->
        <div class="alert alert-light border shadow-sm">

            <div class="d-flex align-items-start">

                <i class="bi bi-info-circle text-primary me-3 fs-5"></i>

                <div>

                    <div class="fw-semibold mb-1">

                        ¿Por qué preguntamos esto?

                    </div>

                    <small class="text-muted">

                        Algunos hábitos pueden influir en la cicatrización,
                        anestesia, sangrado o éxito del tratamiento dental.

                    </small>

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
}

export function obtenerDatosHabitos() {

    const getRadioVal = (name) =>

        document.querySelector(
            `input[name="${name}"]:checked`
        )?.value || '';

    return {

        fuma:
            getRadioVal('fuma'),

        alcohol:
            getRadioVal('alcohol'),

        drogas:
            getRadioVal('drogas'),

        bruxismo:
            getRadioVal('bruxismo'),

        embarazo:
            getRadioVal('embarazo')

    };
}