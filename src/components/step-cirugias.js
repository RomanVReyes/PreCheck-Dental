export function renderStepCirugias(container, data) {
    // Inicializamos con los datos guardados o vacío
    const cirugiasData = data.antecedentes.cirugias || {
        hospitalizado: '',
        cirugias: '',
        cuales: '',
        fecha: ''
    };

    container.innerHTML = `
        <h3 class="mb-4 fw-bold text-primary">
            <i class="bi bi-hospital me-2"></i>Cirugías y Hospitalizaciones
        </h3>
        <p class="text-muted mb-4">
            Por favor, indique si ha sido hospitalizado o si se le ha realizado alguna intervención quirúrgica.
        </p>

        <div class="card mb-3 border-0 shadow-sm bg-light">
            <div class="card-body py-4">
                
                <div class="mb-4">
                    <label class="form-label fw-semibold fs-5 d-block mb-3">¿Ha sido hospitalizado alguna vez?</label>
                    <div class="form-check form-check-inline fs-5 me-4">
                        <input class="form-check-input" type="radio" name="rad-hosp" id="hosp-si" value="Sí" 
                            ${cirugiasData.hospitalizado === 'Sí' ? 'checked' : ''}>
                        <label class="form-check-label" for="hosp-si">Sí</label>
                    </div>
                    <div class="form-check form-check-inline fs-5">
                        <input class="form-check-input" type="radio" name="rad-hosp" id="hosp-no" value="No" 
                            ${cirugiasData.hospitalizado === 'No' ? 'checked' : ''}>
                        <label class="form-check-label" for="hosp-no">No</label>
                    </div>
                </div>

                <hr class="my-4 text-muted">

                <div class="mb-3">
                    <label class="form-label fw-semibold fs-5 d-block mb-3">¿Ha tenido cirugías?</label>
                    <div class="form-check form-check-inline fs-5 me-4">
                        <input class="form-check-input rad-cirugias" type="radio" name="rad-cir" id="cir-si" value="Sí" 
                            ${cirugiasData.cirugias === 'Sí' ? 'checked' : ''}>
                        <label class="form-check-label" for="cir-si">Sí</label>
                    </div>
                    <div class="form-check form-check-inline fs-5">
                        <input class="form-check-input rad-cirugias" type="radio" name="rad-cir" id="cir-no" value="No" 
                            ${cirugiasData.cirugias === 'No' ? 'checked' : ''}>
                        <label class="form-check-label" for="cir-no">No</label>
                    </div>
                </div>

                <div id="detalles-cirugias" class="mt-4 pt-3 border-top ${cirugiasData.cirugias === 'Sí' ? '' : 'd-none'}">
                    <div class="row g-3">
                        <div class="col-md-8">
                            <label for="cir-cuales" class="form-label form-label-sm fw-semibold">¿Cuáles cirugías?</label>
                            <input type="text" class="form-control" id="cir-cuales" 
                                placeholder="Ej. Apendicitis, Vesícula, Cesárea..." value="${cirugiasData.cuales}">
                        </div>
                        <div class="col-md-4">
                            <label for="cir-fecha" class="form-label form-label-sm fw-semibold">Fecha aproximada</label>
                            <input type="text" class="form-control" id="cir-fecha" 
                                placeholder="Ej. 2019 o Hace 3 años" value="${cirugiasData.fecha}">
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div class="d-flex justify-content-between mt-4 pt-3 border-top">
            <button type="button" id="btn-prev" class="btn btn-outline-secondary btn-lg px-4">
                <i class="bi bi-arrow-left ms-2"></i> Regresar
            </button>
            <button type="button" id="btn-next" class="btn btn-primary btn-lg px-5">
                Continuar <i class="bi bi-arrow-right ms-2"></i>
            </button>
        </div>
    `;

    // Event listener para mostrar/ocultar los detalles si elige Sí/No en cirugías
    container.querySelectorAll('.rad-cirugias').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const divDetalles = document.getElementById('detalles-cirugias');
            if (e.target.value === 'Sí') {
                divDetalles.classList.remove('d-none');
            } else {
                divDetalles.classList.add('d-none');
                // Limpiamos los campos si marca que No
                document.getElementById('cir-cuales').value = '';
                document.getElementById('cir-fecha').value = '';
            }
        });
    });
}

export function obtenerDatosCirugias() {
    const hospEl = document.querySelector('input[name="rad-hosp"]:checked');
    const cirEl = document.querySelector('input[name="rad-cir"]:checked');

    return {
        hospitalizado: hospEl ? hospEl.value : '',
        cirugias: cirEl ? cirEl.value : '',
        cuales: document.getElementById('cir-cuales')?.value.trim() || '',
        fecha: document.getElementById('cir-fecha')?.value.trim() || ''
    };
}