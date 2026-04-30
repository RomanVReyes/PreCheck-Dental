// src/modules/calendar-ui.js

// Estado del calendario
let fechaNavegacion = new Date(); 
let fechaMiniCalendario = new Date(); 
let vistaActual = 'dia'; 
const HORA_INICIO = 6;
const HORA_FIN = 22;

const nombresDias = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

// ESTADO: Horario Base Semanal
let horarioBase = {
    0: { inhabil: false, inicio: 8, fin: 22 },  // DOMINGO
    1: { inhabil: false, inicio: 9, fin: 19 }, // LUNES
    2: { inhabil: false, inicio: 9, fin: 19 }, // MARTES
    3: { inhabil: false, inicio: 9, fin: 19 }, // MIÉRCOLES
    4: { inhabil: false, inicio: 9, fin: 19 }, // JUEVES
    5: { inhabil: false, inicio: 9, fin: 19 }, // VIERNES
    6: { inhabil: false, inicio: 10, fin: 14 } // SÁBADO
};

export function renderizarCalendarioVacio() {
    configurarEventosControles();
    actualizarVista();
    renderizarMiniCalendario();
}

function configurarEventosControles() {
    document.getElementById('btn-vista-dia').addEventListener('change', (e) => {
        if(e.target.checked) { vistaActual = 'dia'; actualizarVista(); }
    });
    document.getElementById('btn-vista-semana').addEventListener('change', (e) => {
        if(e.target.checked) { vistaActual = 'semana'; actualizarVista(); }
    });

    document.getElementById('btn-dia-anterior').addEventListener('click', () => {
        if (vistaActual === 'dia') {
            fechaNavegacion.setDate(fechaNavegacion.getDate() - 1);
        } else {
            fechaNavegacion.setDate(fechaNavegacion.getDate() - 7);
        }
        fechaMiniCalendario = new Date(fechaNavegacion); 
        actualizarVista();
        renderizarMiniCalendario();
    });

    document.getElementById('btn-dia-siguiente').addEventListener('click', () => {
        if (vistaActual === 'dia') {
            fechaNavegacion.setDate(fechaNavegacion.getDate() + 1);
        } else {
            fechaNavegacion.setDate(fechaNavegacion.getDate() + 7);
        }
        fechaMiniCalendario = new Date(fechaNavegacion); 
        actualizarVista();
        renderizarMiniCalendario();
    });

    // --- EVENTOS DE CONFIGURACIÓN DE HORARIO ---
    document.getElementById('btn-config-horario').addEventListener('click', abrirModalHorario);
    document.getElementById('btn-guardar-horario').addEventListener('click', guardarHorarioBase);
}

function actualizarVista() {
    const grid = document.getElementById('calendario-grid');
    const titulo = document.getElementById('titulo-rango-fechas');

    grid.innerHTML = ''; 

    const mesNombre = fechaNavegacion.toLocaleString('es-ES', { month: 'long' });
    const anio = fechaNavegacion.getFullYear();
    const hoy = new Date();

    if (vistaActual === 'dia') {
        const nombreDia = nombresDias[fechaNavegacion.getDay()];
        const numDia = fechaNavegacion.getDate();
        const esHoy = fechaNavegacion.toDateString() === hoy.toDateString();

        titulo.innerText = `${nombreDia} ${numDia} de ${mesNombre}, ${anio}`;
        titulo.classList.toggle('texto-hoy', esHoy);

        grid.appendChild(generarVistaDia());

    } else {
        const diaActual = fechaNavegacion.getDay();
        const distanciaLunes = diaActual === 0 ? -6 : 1 - diaActual;

        const lunes = new Date(fechaNavegacion);
        lunes.setDate(fechaNavegacion.getDate() + distanciaLunes);
        lunes.setHours(0,0,0,0);

        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);
        domingo.setHours(23,59,59,999);

        const hoyNormalizado = new Date();
        hoyNormalizado.setHours(12,0,0,0); 

        const estaEnSemana = hoyNormalizado >= lunes && hoyNormalizado <= domingo;

        titulo.innerText = `Semana del ${lunes.getDate()} de ${mesNombre}`;
        titulo.classList.toggle('texto-hoy', estaEnSemana);

        grid.appendChild(generarVistaSemana());
    }
}

// --- GENERADORES DE VISTA PRINCIPAL MODIFICADOS ---
function generarVistaDia() {
    const contenedor = document.createElement('div');
    contenedor.className = 'calendario-contenedor';
    
    // Obtener la configuración del día seleccionado
    const diaIndex = fechaNavegacion.getDay();
    const configDia = horarioBase[diaIndex];

    for (let i = HORA_INICIO; i <= HORA_FIN; i++) {
        const horaStr = `${i.toString().padStart(2, '0')}:00`;
        
        // Determinar si la celda debe ser gris (Inhábil o fuera de horario)
        const esInhabil = configDia.inhabil || i < configDia.inicio || i >= configDia.fin;
        const claseColor = esInhabil ? 'zona-inhabil' : '';
        const funcionClic = esInhabil ? '' : `onclick="alert('Clic en ${horaStr}')"`;

        contenedor.innerHTML += `
            <div class="hora-fila">
                <div class="hora-etiqueta">${horaStr}</div>
                <div class="hora-zona-clic ${claseColor}" ${funcionClic}></div>
            </div>`;
    }
    return contenedor;
}

function generarVistaSemana() {
    const contenedor = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'calendario-header-semana';
    header.innerHTML = `<div style="width: 80px;"></div>`; 

    const diaActual = fechaNavegacion.getDay();
    const distanciaLunes = diaActual === 0 ? -6 : 1 - diaActual;
    const lunes = new Date(fechaNavegacion);
    lunes.setDate(fechaNavegacion.getDate() + distanciaLunes);

    const hoyReal = new Date();
    const diasSemana = [];
    
    for(let i = 0; i < 7; i++) {
        const dia = new Date(lunes);
        dia.setDate(lunes.getDate() + i);
        diasSemana.push(dia);

        const esHoy = dia.toDateString() === hoyReal.toDateString();
        const claseTexto = esHoy ? 'dia-actual-texto' : '';

        header.innerHTML += `<div class="dia-header"><span class="${claseTexto}">${nombresDias[dia.getDay()]} ${dia.getDate()}</span></div>`;
    }
    contenedor.appendChild(header);

    const cuerpo = document.createElement('div');
    cuerpo.className = 'cuerpo-semana calendario-contenedor';

    let colHoras = `<div style="width: 80px;">`;
    for (let i = HORA_INICIO; i <= HORA_FIN; i++) {
        colHoras += `<div class="hora-fila"><div class="hora-etiqueta w-100 border-right-0">${i.toString().padStart(2, '0')}:00</div></div>`;
    }
    colHoras += `</div>`;
    cuerpo.innerHTML += colHoras;

    diasSemana.forEach((dia, index) => {
        let colDia = `<div class="columna-dia">`;
        const configDia = horarioBase[dia.getDay()]; // Traemos la configuración de este día

        for (let i = HORA_INICIO; i <= HORA_FIN; i++) {
            // Evaluamos si pinta gris
            const esInhabil = configDia.inhabil || i < configDia.inicio || i >= configDia.fin;
            const claseColor = esInhabil ? 'zona-inhabil' : '';
            const funcionClic = esInhabil ? '' : `onclick="alert('Clic Día ${index+1}, Hora ${i}:00')"`;

            colDia += `<div class="hora-fila"><div class="hora-zona-clic w-100 ${claseColor}" ${funcionClic}></div></div>`;
        }
        colDia += `</div>`;
        cuerpo.innerHTML += colDia;
    });

    contenedor.appendChild(cuerpo);
    return contenedor;
}

// --- LÓGICA DE LA MODAL DE HORARIO BASE ---
function abrirModalHorario() {
    const contenedor = document.getElementById('contenedor-horario-base');
    contenedor.innerHTML = '';
    
    const diasNombresCompletos = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    for(let i=0; i<7; i++) {
        const config = horarioBase[i];
        contenedor.innerHTML += `
            <div class="row mb-2 align-items-center bg-light p-2 rounded border-bottom">
                <div class="col-3 fw-bold">${diasNombresCompletos[i]}</div>
                <div class="col-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input check-inhabil" type="checkbox" id="inhabil-${i}" data-dia="${i}" ${config.inhabil ? 'checked' : ''}>
                        <label class="form-check-label" for="inhabil-${i}">Inhábil</label>
                    </div>
                </div>
                <div class="col-6 d-flex align-items-center gap-2">
                    <input type="number" class="form-control form-control-sm" id="inicio-${i}" value="${config.inicio}" min="${HORA_INICIO}" max="${HORA_FIN}" ${config.inhabil ? 'disabled' : ''}>
                    <span>a</span>
                    <input type="number" class="form-control form-control-sm" id="fin-${i}" value="${config.fin}" min="${HORA_INICIO}" max="${HORA_FIN}" ${config.inhabil ? 'disabled' : ''}>
                </div>
            </div>
        `;
    }

    // Evento para deshabilitar los inputs de hora si se marca "Inhábil"
    document.querySelectorAll('.check-inhabil').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const dia = e.target.dataset.dia;
            document.getElementById(`inicio-${dia}`).disabled = e.target.checked;
            document.getElementById(`fin-${dia}`).disabled = e.target.checked;
        });
    });

    // Usando el API global de Bootstrap para mostrar la modal
    const modal = new bootstrap.Modal(document.getElementById('modalHorarioBase'));
    modal.show();
}

function guardarHorarioBase() {
    // Recolectar datos
    for(let i=0; i<7; i++) {
        horarioBase[i].inhabil = document.getElementById(`inhabil-${i}`).checked;
        horarioBase[i].inicio = parseInt(document.getElementById(`inicio-${i}`).value);
        horarioBase[i].fin = parseInt(document.getElementById(`fin-${i}`).value);
    }
    
    // Ocultar modal
    const modalEl = document.getElementById('modalHorarioBase');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();
    
    // Refrescar el calendario con los nuevos colores
    actualizarVista();
}

// --- MINI CALENDARIO (Sin cambios) ---
function renderizarMiniCalendario() {
    const contenedor = document.getElementById('mini-calendario-grid');
    const titulo = document.getElementById('titulo-mini-calendario');
    
    const mesMini = fechaMiniCalendario.getMonth();
    const anioMini = fechaMiniCalendario.getFullYear();
    const hoyReal = new Date();

    const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    titulo.className = 'fw-bold mb-3 d-flex justify-content-between align-items-center';
    titulo.innerHTML = `
        <span style="cursor:pointer; padding: 0 10px;" onclick="cambiarMesMini(-1)" class="text-primary fs-5">◀</span>
        <span>${mesesNombres[mesMini]} ${anioMini}</span>
        <span style="cursor:pointer; padding: 0 10px;" onclick="cambiarMesMini(1)" class="text-primary fs-5">▶</span>
    `;

    let html = `<div class="mini-dia-header">
        <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div>
    </div><div class="mini-dias-grid">`;

    const primerDiaMes = new Date(anioMini, mesMini, 1).getDay();
    const totalDiasMes = new Date(anioMini, mesMini + 1, 0).getDate();

    for(let i = 0; i < primerDiaMes; i++) { html += `<div></div>`; } 

    for(let dia = 1; dia <= totalDiasMes; dia++) {
        const esHoyReal = (dia === hoyReal.getDate() && mesMini === hoyReal.getMonth() && anioMini === hoyReal.getFullYear());
        const esSeleccionado = (dia === fechaNavegacion.getDate() && mesMini === fechaNavegacion.getMonth() && anioMini === fechaNavegacion.getFullYear());
        
        let claseDia = 'mini-dia text-dark';
        
        if (esHoyReal) {
            claseDia += ' mini-dia-actual';
        } else if (esSeleccionado) {
            claseDia += ' mini-dia-hoy';
        }

        html += `<div class="${claseDia}" onclick="seleccionarFechaDesdeMini(${anioMini}, ${mesMini}, ${dia})">${dia}</div>`;
    }

    html += `</div>`;
    contenedor.innerHTML = html;
}

window.cambiarMesMini = (delta) => {
    fechaMiniCalendario.setMonth(fechaMiniCalendario.getMonth() + delta);
    renderizarMiniCalendario();
};

window.seleccionarFechaDesdeMini = (anio, mes, dia) => {
    fechaNavegacion = new Date(anio, mes, dia);
    fechaMiniCalendario = new Date(anio, mes, dia); 
    actualizarVista();
    renderizarMiniCalendario();
};