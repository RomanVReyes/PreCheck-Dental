// components/step-consentimientos.js

export function renderStepConsentimientos(container, data) {

    const cons =
        data.consentimientos || {};

    const hoy =
        new Date().toISOString().split('T')[0];

    container.innerHTML = `

        <h3 class="mb-3 fw-bold text-primary">

            <i class="bi bi-shield-check me-2"></i>

            Consentimientos y Autorizaciones

        </h3>

        <p class="text-muted mb-4">

            Lea cuidadosamente y marque las opciones correspondientes
            antes de finalizar su registro.

        </p>

        <!-- CONSENTIMIENTO GENERAL -->
        <div class="card border-0 shadow-sm mb-4">

            <div class="card-header bg-primary text-white py-3">

                <h5 class="mb-0 fw-bold">

                    <i class="bi bi-file-earmark-medical me-2"></i>

                    Consentimiento General
                </h5>

            </div>

            <div class="card-body p-4">

                <div class="alert alert-light border mb-4">

                    <div class="small text-muted">

                        La información proporcionada será utilizada
                        exclusivamente para fines médicos y administrativos.

                    </div>

                </div>

                <div class="d-flex flex-column gap-3">

                    <div class="form-check p-3 border rounded bg-light-subtle">

                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="consent-verdad"
                            ${cons.verdad ? 'checked' : ''}>

                        <label
                            class="form-check-label fw-medium"
                            for="consent-verdad">

                            Declaro que la información médica y personal
                            proporcionada es verdadera.

                        </label>

                    </div>

                    <div class="form-check p-3 border rounded bg-light-subtle">

                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="consent-evaluacion"
                            ${cons.evaluacion ? 'checked' : ''}>

                        <label
                            class="form-check-label fw-medium"
                            for="consent-evaluacion">

                            Autorizo la valoración y atención odontológica.

                        </label>

                    </div>

                    <div class="form-check p-3 border rounded bg-light-subtle">

                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="consent-estudios"
                            ${cons.estudios ? 'checked' : ''}>

                        <label
                            class="form-check-label fw-medium"
                            for="consent-estudios">

                            Entiendo que podrían requerirse estudios
                            adicionales como radiografías o análisis
                            complementarios para un diagnóstico adecuado.

                        </label>

                    </div>

                </div>

                <!-- FIRMA -->
                <div class="card border-0 bg-light mt-4">

                    <div class="card-body">

                        <h6 class="fw-bold text-secondary mb-3">

                            Firma Electrónica

                        </h6>

                        <div class="row g-3">

                            <div class="col-md-8">

                                <label class="form-label fw-semibold">

                                    Nombre completo

                                </label>

                                <input
                                    type="text"
                                    id="firma-nombre"
                                    class="form-control"
                                    placeholder="Escriba su nombre completo"
                                    value="${cons.firma || ''}">

                            </div>

                            <div class="col-md-4">

                                <label class="form-label fw-semibold">

                                    Fecha

                                </label>

                                <input
                                    type="date"
                                    id="firma-fecha"
                                    class="form-control"
                                    value="${cons.fecha || hoy}">

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

        <!-- AUTORIZACIONES OPCIONALES -->
        <div class="card border-0 shadow-sm mb-4">

            <div class="card-header bg-info-subtle py-3">

                <h5 class="mb-0 fw-bold text-info-emphasis">

                    <i class="bi bi-camera me-2"></i>

                    Autorizaciones Opcionales

                </h5>

            </div>

            <div class="card-body p-4">

                <p class="text-muted mb-4">

                    Estas autorizaciones son opcionales y no afectan
                    su tratamiento médico.

                </p>

                <div class="d-flex flex-column gap-3">

                    <div class="form-check p-3 border rounded">

                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="media-rx"
                            ${cons.rx ? 'checked' : ''}>

                        <label
                            class="form-check-label fw-medium"
                            for="media-rx">

                            Autorizo la toma de radiografías
                            con fines diagnósticos.

                        </label>

                    </div>

                    <div class="form-check p-3 border rounded">

                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="media-fotos"
                            ${cons.fotos ? 'checked' : ''}>

                        <label
                            class="form-check-label fw-medium"
                            for="media-fotos">

                            Autorizo la toma de fotografías clínicas.

                        </label>

                    </div>

                    <div class="form-check p-3 border rounded">

                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="media-academico"
                            ${cons.academico ? 'checked' : ''}>

                        <label
                            class="form-check-label fw-medium"
                            for="media-academico">

                            Autorizo el uso académico de mis fotografías
                            y radiografías manteniendo protegida mi identidad.

                        </label>

                    </div>

                    <div class="form-check p-3 border rounded border-primary bg-primary-subtle">

                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="media-redes"
                            ${cons.redes ? 'checked' : ''}>

                        <label
                            class="form-check-label fw-semibold text-primary"
                            for="media-redes">

                            Autorizo el uso de fotografías y videos
                            para publicidad y redes sociales de la clínica.

                        </label>

                    </div>

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
                class="btn btn-success btn-lg px-5 fw-semibold">

                Finalizar Registro

                <i class="bi bi-check-circle ms-2"></i>

            </button>

        </div>
    `;
}

export function obtenerDatosConsentimientos() {

    return {

        // GENERALES
        verdad:
            document.getElementById('consent-verdad')
                ?.checked || false,

        evaluacion:
            document.getElementById('consent-evaluacion')
                ?.checked || false,

        estudios:
            document.getElementById('consent-estudios')
                ?.checked || false,

        firma:
            document.getElementById('firma-nombre')
                ?.value
                .trim() || '',

        fecha:
            document.getElementById('firma-fecha')
                ?.value || '',

        // OPCIONALES
        rx:
            document.getElementById('media-rx')
                ?.checked || false,

        fotos:
            document.getElementById('media-fotos')
                ?.checked || false,

        academico:
            document.getElementById('media-academico')
                ?.checked || false,

        redes:
            document.getElementById('media-redes')
                ?.checked || false
    };
}