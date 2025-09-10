import prompts from "prompts";
import { Usuarios, User } from "./models/Users";
import { Reservas, Reserva } from "./models/Reservas";
import { Instalaciones, Canchas } from "./models/Instalaciones";


const gestionUsuarios = new Usuarios();
const gestionReservas = new Reservas();
const gestionInstalaciones = new Instalaciones();



gestionUsuarios.agregar({
    id: 1,
    name: "Admin",
    email: "admin@example.com",
    password: "admin",
    tipoUsuario: "Administrador",
});



gestionInstalaciones.agregar({ id: 1, nombre: "Campo A", tipoDeporte: "Footbal", precioHora: 0 });
gestionInstalaciones.agregar({ id: 2, nombre: "Cancha 1", tipoDeporte: "Basquetbol", precioHora: 0 });
gestionInstalaciones.agregar({ id: 3, nombre: "Cancha 2", tipoDeporte: "Voleibol", precioHora: 0 });
gestionInstalaciones.agregar({ id: 4, nombre: "Cancha 3", tipoDeporte: "Tenis", precioHora: 0 });
gestionInstalaciones.agregar({ id: 5, nombre: "Piscina 1", tipoDeporte: "Natación", precioHora: 0 });
gestionInstalaciones.agregar({ id: 6, nombre: "Campo B", tipoDeporte: "Rugby", precioHora: 0 });
gestionInstalaciones.agregar({ id: 7, nombre: "Cancha 4", tipoDeporte: "Handball", precioHora: 0 });
gestionInstalaciones.agregar({ id: 8, nombre: "Cancha 5", tipoDeporte: "Hockey", precioHora: 0 });
gestionInstalaciones.agregar({ id: 9, nombre: "Mesa 1", tipoDeporte: "PingPong", precioHora: 0 });
gestionInstalaciones.agregar({ id: 10, nombre: "Cancha 6", tipoDeporte: "Bádminton", precioHora: 0 });
gestionInstalaciones.agregar({ id: 11, nombre: "Campo C", tipoDeporte: "Footbal", precioHora: 0 });
gestionInstalaciones.agregar({ id: 12, nombre: "Cancha 7", tipoDeporte: "Basquetbol", precioHora: 0 });
gestionInstalaciones.agregar({ id: 13, nombre: "Cancha 8", tipoDeporte: "Voleibol", precioHora: 0 });
gestionInstalaciones.agregar({ id: 14, nombre: "Piscina 2", tipoDeporte: "Natación", precioHora: 0 });
gestionInstalaciones.agregar({ id: 15, nombre: "Campo D", tipoDeporte: "Rugby", precioHora: 0 });



async function loginORegistro(): Promise<User | undefined> {
    console.log("\n=== Bienvenido al Sistema de Reservas ===");

    const { accion } = await prompts({
        type: "select",
        name: "accion",
        message: "Seleccione acción",
        choices: [
            { title: "Registrarse", value: "registro" },
            { title: "Iniciar sesión", value: "login" },
            { title: "Salir del programa", value: "salir" },
        ],
    });

    if (accion === "salir") {
        console.log("Saliendo del programa...");
        process.exit(0);
    }

    if (accion === "registro") {
        const nuevoUsuario = await prompts([
            { type: "text", name: "name", message: "Nombre:" },
            { type: "text", name: "email", message: "Email:" },
            { type: "password", name: "password", message: "Password:" },
        ]);

        if (!nuevoUsuario.name || !nuevoUsuario.email || !nuevoUsuario.password) {
            console.log("Todos los campos son obligatorios.");
            return loginORegistro();
        }

        if (gestionUsuarios.VerUsuarioPorEmail(nuevoUsuario.email)) {
            console.log("¡Ese email ya está registrado!");
            return loginORegistro();
        }

        const user: User = {
            id: Math.floor(Math.random() * 1000),
            tipoUsuario: "Cliente",
            ...nuevoUsuario,
        };

        gestionUsuarios.agregar(user);
        console.log("¡Usuario registrado con éxito como Cliente!");
        return loginORegistro();
    }

    const input = await prompts([
        { type: "text", name: "email", message: "Email:" },
        { type: "password", name: "password", message: "Password:" },
    ]);

    if (!input.email || !input.password) {
        console.log("Debe ingresar email y contraseña.");
        return loginORegistro();
    }

    const usuario = gestionUsuarios.LoginUsuario(input);
    if (!usuario) {
        console.log("Credenciales incorrectas");
        return loginORegistro();
    }

    return usuario;
}



async function menu(usuario: User) {
    const opcionesCliente = [
        { title: "Ver instalaciones disponibles", value: "1" },
        { title: "Crear reserva", value: "2" },
        { title: "Ver mis reservas", value: "3" },
        { title: "Cerrar sesión", value: "0" },
    ];

    const opcionesAdmin = [
        { title: "Ver instalaciones", value: "1" },
        { title: "Ver todas las reservas", value: "2" },
        { title: "Confirmar/Cancela reservas", value: "3" },
        { title: "Cerrar sesión", value: "0" },
    ];

    const opciones = usuario.tipoUsuario === "Administrador" ? opcionesAdmin : opcionesCliente;

    const { opcion } = await prompts({
        type: "select",
        name: "opcion",
        message: `Bienvenido ${usuario.name} (${usuario.tipoUsuario}) - Seleccione opción`,
        choices: opciones,
    });

    return opcion;
}



async function main() {
    while (true) {
        const usuario = await loginORegistro();
        if (!usuario) continue;

        let salirSesion = false;

        while (!salirSesion) {
            const opcion = await menu(usuario);

            switch (opcion) {
                case "1":
                    console.log("\n=== Instalaciones ===");
                    if (usuario.tipoUsuario === "Cliente") {
                        const disponibles = gestionInstalaciones.obtenerTodos().filter(inst =>
                            !gestionReservas.obtenerTodos().some(r =>
                                r.InstalacionesID === inst.id && r.Estado === "Confirmado"
                            )
                        );
                        console.table(disponibles.map(i => ({
                            ID: i.id,
                            Nombre: i.nombre,
                            Deporte: i.tipoDeporte
                        })));
                    } else {
                        console.table(gestionInstalaciones.obtenerTodos().map(i => ({
                            ID: i.id,
                            Nombre: i.nombre,
                            Deporte: i.tipoDeporte
                        })));
                    }
                    break;

                case "2":
                    if (usuario.tipoUsuario === "Cliente") {
                        const disponibles = gestionInstalaciones.obtenerTodos().filter(inst =>
                            !gestionReservas.obtenerTodos().some(r =>
                                r.InstalacionesID === inst.id && r.Estado === "Confirmado"
                            )
                        );

                        if (disponibles.length === 0) {
                            console.log("No hay instalaciones disponibles para reservar.");
                            break;
                        }

                        console.log("\n=== Instalaciones disponibles ===");
                        console.table(disponibles.map(i => ({
                            ID: i.id,
                            Nombre: i.nombre,
                            Deporte: i.tipoDeporte
                        })));

                        const reservaInput = await prompts([
                            { type: "number", name: "instId", message: "Seleccione ID de instalación:" },
                            { type: "text", name: "fecha", message: "Fecha (YYYY-MM-DD):" },
                            { type: "text", name: "inicio", message: "Hora inicio (HH:MM):" },
                            { type: "text", name: "fin", message: "Hora fin (HH:MM):" },
                        ]);

                        const reserva: Reserva = {
                            id: Math.floor(Math.random() * 1000),
                            usuarioID: usuario.id,
                            InstalacionesID: reservaInput.instId,
                            fecha: new Date(reservaInput.fecha),
                            horaInicio: new Date(`${reservaInput.fecha}T${reservaInput.inicio}:00`),
                            horaFin: new Date(`${reservaInput.fecha}T${reservaInput.fin}:00`),
                            Estado: "Pendiente",
                        };

                        gestionReservas.agregar(reserva);
                        console.log("Reserva creada!");
                    } else {
                        console.log("\n=== Todas las reservas ===");
                        console.table(gestionReservas.obtenerTodos().map(r => ({
                            ID: r.id,
                            UsuarioID: r.usuarioID,
                            Usuario: gestionUsuarios.obtenerUsuarioPorId(r.usuarioID)?.name,
                            InstalacionID: r.InstalacionesID,
                            Instalacion: gestionInstalaciones.buscarPorId(r.InstalacionesID)?.nombre,
                            Fecha: r.fecha.toLocaleDateString(),
                            Inicio: r.horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            Fin: r.horaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            Estado: r.Estado
                        })));
                    }
                    break;

                case "3":
                    if (usuario.tipoUsuario === "Cliente") {
                        const misReservas = gestionReservas.VerReservasPorUsuario(usuario);
                        if (misReservas.length === 0) console.log("No tienes reservas.");
                        else console.table(misReservas.map(r => ({
                            ID: r.id,
                            InstalacionID: r.InstalacionesID,
                            Instalacion: gestionInstalaciones.buscarPorId(r.InstalacionesID)?.nombre,
                            Fecha: r.fecha.toLocaleDateString(),
                            Inicio: r.horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            Fin: r.horaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            Estado: r.Estado
                        })));
                    } else {
                        console.log("\n=== Reservas pendientes/confirmadas ===");
                        const reservas = gestionReservas.obtenerTodos().filter(r => r.Estado !== "Cancelado");
                        if (reservas.length === 0) {
                            console.log("No hay reservas.");
                            break;
                        }
                        console.table(reservas.map(r => ({
                            ID: r.id,
                            Usuario: gestionUsuarios.obtenerUsuarioPorId(r.usuarioID)?.name,
                            Instalacion: gestionInstalaciones.buscarPorId(r.InstalacionesID)?.nombre,
                            Fecha: r.fecha.toLocaleDateString(),
                            Inicio: r.horaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            Fin: r.horaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            Estado: r.Estado
                        })));

                        const { reservaId, accion } = await prompts([
                            { type: "number", name: "reservaId", message: "ID de reserva a modificar:" },
                            {
                                type: "select", name: "accion", message: "Seleccione acción:", choices: [
                                    { title: "Confirmar", value: "Confirmado" },
                                    { title: "Cancelar", value: "Cancelado" }
                                ]
                            }
                        ]);

                        const reserva = gestionReservas.buscarPorId(reservaId);
                        if (reserva) {
                            reserva.Estado = accion;
                            console.log(`Reserva ${accion} correctamente.`);
                        } else {
                            console.log("Reserva no encontrada.");
                        }
                    }
                    break;

                case "0":
                    console.log("\nCerrando sesión...");
                    salirSesion = true;
                    break;

                default:
                    console.log("Opción no válida");
            }
        }
    }
}

main();