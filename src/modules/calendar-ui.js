import { obtenerHorarioBase, guardarHorarioBaseDB } from '../services/clinicalService.js';
import { listarCitasPorFecha, listarCitasPorRango } from '../services/appointmentService.js';

let fechaNavegacion = new Date(); 
let fechaMiniCalendario = new Date(); 
let vistaActual = 'dia'; 
const HORA_INICIO = 6;
const HORA_FIN = 22;

const nombresDias = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

let horarioBase = {
    0: { inhabil: false, inicio: 8, fin: 22 },  
    1: { inhabil: false, inicio: 9, fin: 19 }, 
    2: { inhabil: false, inicio: 9, fin: 19 }, 
    3: { inhabil: false, inicio: 9, fin: 19 }, 
    4: { inhabil: false, inicio: 9, fin: 19 }, 
    5: { inhabil: false, inicio: 9, fin: 19 }, 
    6: { inhabil: false, inicio: 10, fin: 14 } 
};

// ─────────────────────────────────────────────
//  COLORES POR ESTADO DE CITA
// ─────────────────────────────────────────────
const COLORES_ESTADO = {
    pendiente:   { fondo: '#fff3cd', borde: '#ffc107', texto: '#856404' },
    confirmada:  { fondo: '#d1e7dd', borde: '#198754', texto: '#0f5132' },
    cancelada:   { fondo: '#f8d7da', borde: '#dc3545', texto: '#842029' },
    completada:  { fondo: '#e2e3e5', borde: '#6c757d', texto: '#41464b' },
};

// ─────────────────────────────────────────────
//  HELPERS DE FECHA
// ─────────────────────────────────────────────
function fechaAString(fecha) {
    // Date → "YYYY-MM-DD" en hora local (sin desfase UTC)
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function horaAMinutos(horaStr) {
    const [h, m] = horaStr.split(':').map(Number);
    return h * 60 + m;
}

// ─────────────────────────────────────────────
//  INIT PRINCIPAL
// ─────────────────────────────────────────────
export async function renderizarCalendarioVacio() {
    configurarEventosControles();
    
    try {
        const datosDB = await obtenerHorarioBase();
        if (datosDB) horarioBase = datosDB;
    } catch (error) {
        console.error("Error cargando DB, usando horario por defecto.", error);
    }

    await actualizarVista();
    renderizarMiniCalendario();
}

// ─────────────────────────────────────────────
//  RECARGA PÚBLICA  →  admin.js puede llamarla
//  tras confirmar/cancelar una cita
// ─────────────────────────────────────────────
export async function recargarCalendario() {
    await actualizarVista();
}

// ─────────────────────────────────────────────
//  CONTROLES DE NAVEGACIÓN (sin cambios)
// ─────────────────────────────────────────────
function configurarEventosControles() {
    document.getElementById('btn-vista-dia').addEventListener('change', async (e) => {
        if (e.target.checked) { vistaActual = 'dia'; await actualizarVista(); }
    });
    document.getElementById('btn-vista-semana').addEventListener('change', async (e) => {
        if (e.target.checked) { vistaActual = 'semana'; await actualizarVista(); }
    });

    document.getElementById('btn-dia-anterior').addEventListener('click', async () => {
        fechaNavegacion.setDate(fechaNavegacion.getDate() + (vistaActual === 'dia' ? -1 : -7));
        fechaMiniCalendario = new Date(fechaNavegacion); 
        await actualizarVista();
        renderizarMiniCalendario();
    });

    document.getElementById('btn-dia-siguiente').addEventListener('click', async () => {
        fechaNavegacion.setDate(fechaNavegacion.getDate() + (vistaActual === 'dia' ? 1 : 7));
        fechaMiniCalendario = new Date(fechaNavegacion); 
        await actualizarVista();
        renderizarMiniCalendario();
    });

    document.getElementById('btn-config-horario').addEventListener('click', abrirModalHorario);
    document.getElementById('btn-guardar-horario').addEventListener('click', guardarHorarioBase);
}

// ─────────────────────────────────────────────
//  ACTUALIZAR VISTA  →  ahora async
// ─────────────────────────────────────────────
async function actualizarVista() {
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

        const fechaStr = fechaAString(fechaNavegacion);
        let citas = [];
        try {
            citas = await listarCitasPorFecha(fechaStr);
        } catch (e) {
            console.error("Error cargando citas del día:", e);
        }

        grid.appendChild(generarVistaDia(citas));

    } else {
        const diaActual = fechaNavegacion.getDay();
        const distanciaLunes = diaActual === 0 ? -6 : 1 - diaActual;
        const lunes = new Date(fechaNavegacion);
        lunes.setDate(fechaNavegacion.getDate() + distanciaLunes);
        lunes.setHours(0, 0, 0, 0);

        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);
        domingo.setHours(23, 59, 59, 999);

        const hoyNormalizado = new Date();
        hoyNormalizado.setHours(12, 0, 0, 0);
        const estaEnSemana = hoyNormalizado >= lunes && hoyNormalizado <= domingo;

        titulo.innerText = `Semana del ${lunes.getDate()} de ${mesNombre}`;
        titulo.classList.toggle('texto-hoy', estaEnSemana);

        const fechaInicioStr = fechaAString(lunes);
        const fechaFinStr    = fechaAString(domingo);
        let citas = [];
        try {
            citas = await listarCitasPorRango(fechaInicioStr, fechaFinStr);
        } catch (e) {
            console.error("Error cargando citas de la semana:", e);
        }

        grid.appendChild(generarVistaSemana(citas, lunes));
    }
}

// ─────────────────────────────────────────────
//  VISTA DÍA — con citas reales
// ─────────────────────────────────────────────
function generarVistaDia(citas = []) {
    const contenedor = document.createElement('div');
    contenedor.className = 'calendario-contenedor';

    const diaIndex = fechaNavegacion.getDay();
    const configDia = horarioBase[diaIndex] || { inhabil: false, inicio: HORA_INICIO, fin: HORA_FIN };
    const fechaStr = fechaAString(fechaNavegacion);

    for (let i = HORA_INICIO; i <= HORA_FIN; i++) {
        const horaStr = `${i.toString().padStart(2, '0')}:00`;
        const esInhabil = configDia.inhabil || i < configDia.inicio || i >= configDia.fin;

        // Citas que empiezan en esta hora
        const citasEnSlot = citas.filter(c => {
            const horaInicioMin = horaAMinutos(c.horaInicio);
            return horaInicioMin >= i * 60 && horaInicioMin < (i + 1) * 60;
        });

        const filaEl = document.createElement('div');
        filaEl.className = 'hora-fila';
        filaEl.innerHTML = `<div class="hora-etiqueta">${horaStr}</div>`;

        const zonaEl = document.createElement('div');
        zonaEl.className = `hora-zona-clic ${esInhabil ? 'zona-inhabil' : ''}`;

        if (!esInhabil) {
            zonaEl.style.cursor = 'pointer';
            zonaEl.addEventListener('click', () => {
                // Emite evento global para que admin.js abra el modal de nueva cita
                window.dispatchEvent(new CustomEvent('calendario:nuevaCita', {
                    detail: { fecha: fechaStr, horaInicio: horaStr }
                }));
            });
        }

        // Pintar citas dentro de la zona
        citasEnSlot.forEach(cita => {
            zonaEl.appendChild(crearTarjetaCita(cita));
        });

        filaEl.appendChild(zonaEl);
        contenedor.appendChild(filaEl);
    }

    return contenedor;
}

// ─────────────────────────────────────────────
//  VISTA SEMANA — con citas reales
// ─────────────────────────────────────────────
function generarVistaSemana(citas = [], lunes) {
    const contenedor = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'calendario-header-semana';
    header.innerHTML = `<div style="width: 80px;"></div>`;

    const hoyReal = new Date();
    const diasSemana = [];

    for (let i = 0; i < 7; i++) {
        const dia = new Date(lunes);
        dia.setDate(lunes.getDate() + i);
        diasSemana.push(dia);

        const esHoy = dia.toDateString() === hoyReal.toDateString();
        header.innerHTML += `<div class="dia-header"><span class="${esHoy ? 'dia-actual-texto' : ''}">${nombresDias[dia.getDay()]} ${dia.getDate()}</span></div>`;
    }
    contenedor.appendChild(header);

    const cuerpo = document.createElement('div');
    cuerpo.className = 'cuerpo-semana calendario-contenedor';

    // Columna de horas
    let colHoras = `<div style="width: 80px;">`;
    for (let i = HORA_INICIO; i <= HORA_FIN; i++) {
        colHoras += `<div class="hora-fila"><div class="hora-etiqueta w-100 border-right-0">${i.toString().padStart(2, '0')}:00</div></div>`;
    }
    colHoras += `</div>`;
    cuerpo.innerHTML += colHoras;

    // Columnas por día
    diasSemana.forEach(dia => {
        const colDia = document.createElement('div');
        colDia.className = 'columna-dia';

        const configDia = horarioBase[dia.getDay()] || { inhabil: false, inicio: HORA_INICIO, fin: HORA_FIN };
        const fechaStr = fechaAString(dia);

        // Filtrar citas de este día
        const citasDia = citas.filter(c => c.fecha === fechaStr);

        for (let i = HORA_INICIO; i <= HORA_FIN; i++) {
            const horaStr = `${i.toString().padStart(2, '0')}:00`;
            const esInhabil = configDia.inhabil || i < configDia.inicio || i >= configDia.fin;

            const citasEnSlot = citasDia.filter(c => {
                const min = horaAMinutos(c.horaInicio);
                return min >= i * 60 && min < (i + 1) * 60;
            });

            const filaEl = document.createElement('div');
            filaEl.className = 'hora-fila';

            const zonaEl = document.createElement('div');
            zonaEl.className = `hora-zona-clic w-100 ${esInhabil ? 'zona-inhabil' : ''}`;

            if (!esInhabil) {
                zonaEl.style.cursor = 'pointer';
                zonaEl.addEventListener('click', () => {
                    window.dispatchEvent(new CustomEvent('calendario:nuevaCita', {
                        detail: { fecha: fechaStr, horaInicio: horaStr }
                    }));
                });
            }

            citasEnSlot.forEach(cita => {
                zonaEl.appendChild(crearTarjetaCita(cita));
            });

            filaEl.appendChild(zonaEl);
            colDia.appendChild(filaEl);
        }

        cuerpo.appendChild(colDia);
    });

    contenedor.appendChild(cuerpo);
    return contenedor;
}

// ─────────────────────────────────────────────
//  TARJETA DE CITA  →  se pinta dentro del slot
// ─────────────────────────────────────────────
function crearTarjetaCita(cita) {
    const colores = COLORES_ESTADO[cita.estado] || COLORES_ESTADO.pendiente;

    const el = document.createElement('div');
    el.className = 'cita-tarjeta';
    el.style.cssText = `
        background: ${colores.fondo};
        border-left: 3px solid ${colores.borde};
        color: ${colores.texto};
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.75rem;
        margin-bottom: 2px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    `;
    el.title = `${cita.nombre} — ${cita.horaInicio} a ${cita.horaFin} (${cita.estado})`;
    el.textContent = `${cita.horaInicio} ${cita.nombre}`;

    // Click en tarjeta → abre modal de detalle
    el.addEventListener('click', (e) => {
        e.stopPropagation(); // No dispara el evento de nueva cita
        window.dispatchEvent(new CustomEvent('calendario:verCita', {
            detail: { cita }
        }));
    });

    return el;
}

// ─────────────────────────────────────────────
//  MODAL HORARIO BASE  (sin cambios internos)
// ─────────────────────────────────────────────
function abrirModalHorario() {
    const contenedor = document.getElementById('contenedor-horario-base');
    contenedor.innerHTML = '';
    
    const diasNombresCompletos = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    for (let i = 0; i < 7; i++) {
        const config = horarioBase[i] || { inhabil: false, inicio: HORA_INICIO, fin: HORA_FIN };
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

    document.querySelectorAll('.check-inhabil').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const dia = e.target.dataset.dia;
            document.getElementById(`inicio-${dia}`).disabled = e.target.checked;
            document.getElementById(`fin-${dia}`).disabled = e.target.checked;
        });
    });

    const modal = new bootstrap.Modal(document.getElementById('modalHorarioBase'));
    modal.show();
}

async function guardarHorarioBase() {
    const btn = document.getElementById('btn-guardar-horario');
    const textoOriginal = btn.innerText;

    try {
        btn.innerText = "Guardando...";
        btn.disabled = true;

        const nuevoHorario = {};
        for (let i = 0; i < 7; i++) {
            nuevoHorario[i.toString()] = {
                inhabil: document.getElementById(`inhabil-${i}`).checked,
                inicio:  parseInt(document.getElementById(`inicio-${i}`).value),
                fin:     parseInt(document.getElementById(`fin-${i}`).value)
            };
        }
        
        await guardarHorarioBaseDB(nuevoHorario);
        horarioBase = nuevoHorario;
        
        bootstrap.Modal.getInstance(document.getElementById('modalHorarioBase')).hide();
        await actualizarVista();

    } catch (error) {
        alert("Ocurrió un error al guardar el horario.");
    } finally {
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}

// ─────────────────────────────────────────────
//  MINI CALENDARIO  (sin cambios)
// ─────────────────────────────────────────────
function renderizarMiniCalendario() {
    const contenedor = document.getElementById('mini-calendario-grid');
    const titulo = document.getElementById('titulo-mini-calendario');
    
    const mesMini = fechaMiniCalendario.getMonth();
    const anioMini = fechaMiniCalendario.getFullYear();
    const hoyReal = new Date();

    const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    
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

    for (let i = 0; i < primerDiaMes; i++) { html += `<div></div>`; }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
        const esHoyReal    = dia === hoyReal.getDate() && mesMini === hoyReal.getMonth() && anioMini === hoyReal.getFullYear();
        const esSeleccionado = dia === fechaNavegacion.getDate() && mesMini === fechaNavegacion.getMonth() && anioMini === fechaNavegacion.getFullYear();

        let claseDia = 'mini-dia text-dark';
        if (esHoyReal) claseDia += ' mini-dia-actual';
        else if (esSeleccionado) claseDia += ' mini-dia-hoy';

        html += `<div class="${claseDia}" onclick="seleccionarFechaDesdeMini(${anioMini}, ${mesMini}, ${dia})">${dia}</div>`;
    }

    html += `</div>`;
    contenedor.innerHTML = html;
}

window.cambiarMesMini = (delta) => {
    fechaMiniCalendario.setMonth(fechaMiniCalendario.getMonth() + delta);
    renderizarMiniCalendario();
};

window.seleccionarFechaDesdeMini = async (anio, mes, dia) => {
    fechaNavegacion = new Date(anio, mes, dia);
    fechaMiniCalendario = new Date(anio, mes, dia);
    await actualizarVista();
    renderizarMiniCalendario();
};