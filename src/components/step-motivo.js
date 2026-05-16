// components/step-motivo.js

export function renderStepMotivo(container, data) {

    const motivoGuardado =
        data.motivoConsulta?.motivo || '';

    container.innerHTML = `

        <h3 class="mb-3 fw-bold text-primary">

            <i class="bi bi-chat-left-text me-2"></i>

            Motivo de Consulta

        </h3>

        <p class="text-muted mb-4">

            Describa brevemente el motivo principal de su visita.

        </p>

        <!-- CARD -->
        <div class="card border-0 shadow-sm">

            <div class="card-body p-4">

                <label
                    for="motivo"
                    class="form-label fw-semibold mb-3">

                    ¿Qué le gustaría atender?

                </label>

                <textarea
                    class="form-control"
                    id="motivo"
                    rows="6"
                    placeholder="Ejemplos:
• Dolor de muela
• Limpieza dental
• Sensibilidad dental
• Ortodoncia
• Revisión general">${motivoGuardado}</textarea>

                <div class="form-text mt-2">
                    Entre más detalles proporcione, mejor podremos prepararnos para atenderle.
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

export function obtenerDatosMotivo() {

    return {

        motivo:
            document.querySelector('#motivo')
                ?.value
                .trim()

    };
}