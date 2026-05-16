export function validarTelefono(telefono) {

    return /^[0-9]{10}$/.test(telefono);
}