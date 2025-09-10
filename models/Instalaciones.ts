import Gestion from "./Gestion";

type TipoDeporte =| "Footbal"| "Basquetbol"| "Voleibol"| "Tenis"| "Natación"| "Rugby"| "Handball"| "Hockey"| "PingPong"| "Bádminton";

type Canchas = {
    id: number;
    nombre: string;
    tipoDeporte: TipoDeporte;
    precioHora: number;
}

class Instalaciones extends Gestion<Canchas> {}

export { TipoDeporte, Canchas, Instalaciones };
