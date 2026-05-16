// components/step-historia.js

export function renderStepHistoria(container, data) {

    const hist =
        data.historiaOdontologica || {};

    const crearPregunta = (
        id,
        pregunta,
        icono = 'bi-check2-circle'
    ) => `

        <div class="card border-0 shadow-sm mb-3">

            <div class="card-body">

                <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">

                    <div>

                        <h6 class="fw-semibold mb-1">

                            <i class="bi ${icono} text-primary me-2"></i>

                            ${pregunta}

                        </h6>

                    </div>

                    <div class="d-flex gap-4">

                        <div class="form-check">

                            <input
                                class="form-check-input"
                                type="radio"
                                name="${id}"
                                id="${id}-si"
                                value="Sí"
                                ${hist[id] === 'Sí' ? 'checked' : ''}>

                            <label
                                class="form-check-label"
                                for="${id}-si">

                                Sí

                            </label>

                        </div>

                        <div class="form-check">

                            <input
                                class="form-check-input"
                                type="radio"
                                name="${id}"
                                id="${id}-no"
                                value="No"
                                ${hist[id] === 'No' ? 'checked' : ''}>

                            <label
                                class="form-check-label"
                                for="${id}-no">

                                No

                            </label>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    `;

    container.innerHTML = `

        <h3 class="mb-3 fw-bold text-primary">

            <i class="bi bi-clipboard2-pulse me-2"></i>

            Historia Odontológica

        </h3>

        <p class="text-muted mb-4">

            Ayúdenos a conocer mejor sus antecedentes dentales.

        </p>

        <!-- ÚLTIMA VISITA -->
        <div class="card border-0 shadow-sm mb-4">

            <div class="card-body">

                <label
                    for="ultimaVisita"
                    class="form-label fw-semibold mb-3">

                    ¿Cuándo fue su última visita al dentista?

                </label>

                <input
                    type="text"
                    class="form-control"
                    id="ultimaVisita"
                    placeholder="Ej. Hace 6 meses, hace 2 años..."
                    value="${hist.ultimaVisita || ''}">

            </div>

        </div>

        <!-- PREGUNTAS -->
        <div class="mb-4">

            ${crearPregunta(
                'brackets',
                '¿Ha usado brackets u ortodoncia?',
                'bi-braces'
            )}

            ${crearPregunta(
                'extracciones',
                '¿Le han realizado extracciones dentales?',
                'bi-scissors'
            )}

            ${crearPregunta(
                'endodoncias',
                '¿Le han realizado endodoncias?',
                'bi-tools'
            )}

            ${crearPregunta(
                'sangrado',
                '¿Le sangran las encías al cepillarse?',
                'bi-droplet-half'
            )}

            ${crearPregunta(
                'sensibilidad',
                '¿Tiene sensibilidad dental?',
                'bi-thermometer-half'
            )}

            ${crearPregunta(
                'miedo',
                '¿Presenta miedo o ansiedad dental?',
                'bi-emoji-frown'
            )}

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

export function obtenerDatosHistoria() {

    const getRadioVal = (name) =>

        document.querySelector(
            `input[name="${name}"]:checked`
        )?.value || '';

    return {

        ultimaVisita:
            document.querySelector('#ultimaVisita')
                ?.value
                .trim(),

        brackets:
            getRadioVal('brackets'),

        extracciones:
            getRadioVal('extracciones'),

        endodoncias:
            getRadioVal('endodoncias'),

        sangrado:
            getRadioVal('sangrado'),

        sensibilidad:
            getRadioVal('sensibilidad'),

        miedo:
            getRadioVal('miedo')

    };
}