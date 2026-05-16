// components/progress-bar.js

const STEP_LABELS = [
    'Datos personales',
    'Antecedentes médicos',
    'Cirugías',
    'Medicamentos',
    'Alergias',
    'Hábitos',
    'Historia dental',
    'Motivo de consulta',
    'Consentimientos'
];

export function renderProgressBar(container) {

    container.innerHTML = `

        <div class="card border-0 shadow-sm mb-4 overflow-hidden">

            <!-- HEADER -->
            <div class="bg-primary-subtle px-4 py-3 border-bottom">

                <div class="d-flex justify-content-between align-items-center">

                    <div>

                        <h6
                            class="fw-bold text-primary mb-1"
                            id="progressTitle">

                            Registro Clínico

                        </h6>

                        <small
                            class="text-muted"
                            id="progressText">

                            Paso 1 de 9

                        </small>

                    </div>

                    <div
                        id="progressPercent"
                        class="fw-bold text-primary">

                        0%

                    </div>

                </div>

            </div>

            <!-- BARRA -->
            <div class="px-4 pt-4">

                <div
                    class="progress rounded-pill"
                    style="height: 12px; background-color: #e9ecef;">

                    <div
                        id="progressBar"
                        class="progress-bar rounded-pill"
                        role="progressbar"
                        style="
                            width: 0%;
                            transition: width .4s ease;
                            background: linear-gradient(
                                90deg,
                                #0d6efd 0%,
                                #3b82f6 100%
                            );
                        ">
                    </div>

                </div>

            </div>

            <!-- STEPS -->
            <div
                id="progressSteps"
                class="px-3 py-4">

            </div>

        </div>
    `;
}

export function updateProgressBar(current, total) {

    const percentage =
        Math.round((current / total) * 100);

    const progressBar =
        document.getElementById('progressBar');

    const progressText =
        document.getElementById('progressText');

    const progressPercent =
        document.getElementById('progressPercent');

    const progressSteps =
        document.getElementById('progressSteps');

    if (progressBar) {

        progressBar.style.width =
            `${percentage}%`;
    }

    if (progressText) {

        progressText.textContent =
            `Paso ${current} de ${total}`;
    }

    if (progressPercent) {

        progressPercent.textContent =
            `${percentage}%`;
    }

    if (progressSteps) {

        progressSteps.innerHTML = `

            <div class="row g-3">

                ${STEP_LABELS.slice(0, total)
                    .map((label, index) => {

                        const step =
                            index + 1;

                        const isActive =
                            step === current;

                        const isCompleted =
                            step < current;

                        return `

                            <div class="col">

                                <div
                                    class="
                                        d-flex
                                        flex-column
                                        align-items-center
                                        text-center
                                    ">

                                    <!-- CÍRCULO -->
                                    <div
                                        class="
                                            rounded-circle
                                            d-flex
                                            align-items-center
                                            justify-content-center
                                            fw-bold
                                            mb-2
                                        "

                                        style="
                                            width: 38px;
                                            height: 38px;

                                            transition: all .25s ease;

                                            background:
                                                ${isCompleted
                                                    ? '#198754'
                                                    : isActive
                                                        ? '#0d6efd'
                                                        : '#e9ecef'};

                                            color:
                                                ${isCompleted || isActive
                                                    ? '#fff'
                                                    : '#6c757d'};

                                            box-shadow:
                                                ${isActive
                                                    ? '0 0 0 4px rgba(13,110,253,.15)'
                                                    : 'none'};
                                        ">

                                        ${isCompleted
                                            ? '<i class="bi bi-check-lg"></i>'
                                            : step}

                                    </div>

                                    <!-- TEXTO -->
                                    <small
                                        class="
                                            fw-medium
                                            ${isActive
                                                ? 'text-primary'
                                                : isCompleted
                                                    ? 'text-success'
                                                    : 'text-muted'}
                                        "

                                        style="
                                            font-size: .72rem;
                                            line-height: 1.2;
                                        ">

                                        ${label}

                                    </small>

                                </div>

                            </div>
                        `;
                    }).join('')}

            </div>
        `;
    }
}