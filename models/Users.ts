import Gestion from "./Gestion";

type TipoUsuario = "Cliente" | "Administrador";

type User = {
  id: number;
  name: string;
  password: string;
  email: string;
  tipoUsuario: TipoUsuario;
};

class Usuarios extends Gestion<User> {
  LoginUsuario(creds: { email: string; password: string }) {
    return this.items.find(
      (u) => u.email === creds.email && u.password === creds.password
    );
  }

  VerUsuarioPorEmail(email: string) {
    return this.items.find((u) => u.email === email);
  }

  // <-- Nuevo método
  obtenerUsuarioPorId(id: number): User | undefined {
    return this.items.find(u => u.id === id);
  }
}

export { TipoUsuario, User, Usuarios };
