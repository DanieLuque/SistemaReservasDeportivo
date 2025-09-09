import Gestion from "./Gestion";
import { User } from "./Users";

type EstadoReserva = "Pendiente" | "Confirmado" | "Cancelado";

type Reserva = {
    id: number;
    usuarioID: number;
    InstalacionesID: number;
    fecha: Date;
    horaInicio: Date;
    horaFin: Date;
    Estado: EstadoReserva;
};

class Reservas extends Gestion<Reserva> {

    CancelarReserva(reservaId: number) {
        const encontrada = this.buscarPorId(reservaId);
        if (encontrada) {
            encontrada.Estado = "Cancelado";
        } else {
            console.log(`No se encontró la reserva con id ${reservaId}`);
        }
    }

    VerReservasPorUsuario(usuario: User) {
        return this.items.filter(r => r.usuarioID === usuario.id);
    }
}

export { EstadoReserva, Reserva, Reservas };
