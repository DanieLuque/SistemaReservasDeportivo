esta es la parte que voy a subir:# 🏟️ Sistema de Reservas Deportivas - Aplicando SRP


---

## 👥 Integrantes del Equipo

| Nombre | Rol en el proyecto
|--------|-----------------
| Daniel Luque | Desarrolo Gestioen e Instalacion |
| Alejandro Galindo | Desarrollo Reservas | 
| Andrés Mancera | Desarrollo y análisis de usuarios |



### ---

Sistema refactorizado aplicando correctamente el *Principio de Responsabilidad Única*.

## ❌ *Errores en el Código Original*

### *Problema: Clase Usuarios con Múltiples Responsabilidades*

typescript
class Usuarios extends Gestion<User> {
    // ✅ Gestión de datos (CORRECTO)
    obtenerUsuarioPorId(id: number): User | undefined { }
    
    // ❌ Autenticación (ERROR - responsabilidad extra)
    LoginUsuario(creds: { email: string; password: string }) { }
    
    // ❌ Búsquedas especializadas (ERROR - responsabilidad extra)
    VerUsuarioPorEmail(email: string) { }
}


*¿Por qué está mal?*
- *3 razones diferentes para cambiar la clase:*
  1. Cambios en almacenamiento de usuarios
  2. Cambios en sistema de autenticación  
  3. Cambios en criterios de búsqueda
- *Violación SRP*: "Una clase = una responsabilidad"

### *Problema: Clase Reservas Mezclando Datos y Lógica*

typescript
class Reservas extends Gestion<Reserva> {
    // ❌ Lógica de negocio mezclada con datos
    CancelarReserva(reservaId: number) {
        const encontrada = this.buscarPorId(reservaId);
        if (encontrada) {
            encontrada.Estado = "Cancelado";  // ← Regla de negocio
        }
    }
    
    // ❌ Consultas especializadas mezcladas con datos
    VerReservasPorUsuario(usuario: User) {
        return this.items.filter(r => r.usuarioID === usuario.id);
    }
}


*¿Por qué está mal?*
- *Mezcla 3 tipos de responsabilidades:*
  1. Gestión de datos
  2. Lógica de negocio (cancelación)
  3. Consultas complejas
- Si cambian reglas de negocio → modificar clase de datos
- Difícil de testear y mantener

## ✅ *Solución: Clases con SRP Correctamente Aplicado*

### Clase `Reservas`

```typescript
class Reservas extends Gestion {
   CancelarReserva(reservaId: number) { ... }
   VerReservasPorUsuario(usuario: User) { ... }
}
```

---

## Análisis por Principio

### **S (Single Responsibility Principle)**

#### ❌ **VIOLA SRP**

**Problemas identificados:**
La clase `Reservas` tiene múltiples responsabilidades:

1. **Gestión de operaciones CRUD** (heredadas de `Gestion`)
2. **Lógica de negocio específica** (cancelar reservas)
3. **Operaciones de consulta/filtrado** (buscar reservas por usuario)
4. **Manejo de estados** (cambio de estado a "Cancelado")

**Justificación del problema:**
Tiene más de una razón para cambiar:
- Si cambian las reglas de cancelación de reservas
- Si cambian los criterios de filtrado por usuario 
- Si cambian las operaciones CRUD base
- Si cambian los estados de reserva

# Solución SOLID - Sistema de Reservas

## 🔍 Análisis del Código Original

### Clase Analizada: `Reservas`

```typescript
class Reservas extends Gestion {
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

```



# 🟢 Informe SOLID (S y O) — Proyecto: Sistema de Reservas Deportivo

---

## 1. 🏗️ Contexto
El proyecto **Sistema de Reservas Deportivo** permite:  

- Registrar usuarios del sistema.  
- Autenticarse mediante login.  
- Buscar usuarios por email o ID.  

El módulo analizado se centra en la **gestión y autenticación de usuarios**, base fundamental para controlar reservas y accesos.

---

## 2. 📦 Inventario de Clases Analizadas
| Clase | Ruta | Rol en el sistema |
|-------|------|-----------------|
| `Usuarios` | `src/core/User.ts` | Gestión de usuarios: login, búsqueda por email e ID |

---

## 3. 🔍 Análisis por Clase

### 3.1 `src/core/User.ts`  
**Responsabilidad declarada:** Gestionar usuarios (almacenamiento, login y búsqueda).

#### ✅ S (Single Responsibility)
- **Diagnóstico:** ❌ No cumple completamente  
- **Justificación:**  
  La clase `Usuarios` combina varias responsabilidades:  
  1. Gestión de datos (`Gestion<User>`)  
  2. Autenticación (`LoginUsuario`)  
  3. Búsqueda de usuarios (`VerUsuarioPorEmail`, `obtenerUsuarioPorId`)  

  Cada responsabilidad podría cambiar por motivos distintos (p. ej., cambio en la base de datos vs cambio en la lógica de login).  
- **Riesgo:** Mayor acoplamiento, pruebas más difíciles y cambios que afectan múltiples funcionalidades.

#### ✅ O (Open/Closed)
- **Diagnóstico:** ❌ No cumple completamente  
- **Justificación:**  
  Para agregar nuevos métodos de autenticación o búsqueda, se tendría que modificar la clase `Usuarios`.  
  Ideal: extenderla o usar **composición/polimorfismo** para no tocar la clase existente.

#### 🔧 Refactor propuesto
```ts
// Antes (❌ violaba SRP y OCP)
class Usuarios extends Gestion<User> {
  LoginUsuario(creds: { email: string; password: string }) { /* ... */ }
  VerUsuarioPorEmail(email: string) { /* ... */ }
  obtenerUsuarioPorId(id: number) { /* ... */ }
}

// Después (✅ SRP: cada clase tiene una única responsabilidad)
// UserRepository solo maneja datos de usuarios
class UserRepository extends Gestion<User> {
  obtenerUsuarioPorId(id: number): User | undefined {
    return this.items.find(u => u.id === id);
  }

  buscarPorEmail(email: string): User | undefined {
    return this.items.find(u => u.email === email);
  }
}

// AuthService solo maneja autenticación (SRP)
// Además, OCP: se puede cambiar la estrategia de login sin modificar AuthService
class AuthService {
  constructor(private repo: UserRepository) {}

  login(creds: { email: string; password: string }): User | undefined {
    const user = this.repo.buscarPorEmail(creds.email);
    if (user && user.password === creds.password) return user;
    return undefined;
  }
}



```
---



# Informe de Principios SOLID en el Sistema de Reservas

Este documento analiza el cumplimiento del código con dos principios SOLID:  
- **Dependency Inversion Principle (DIP)**  
- **Liskov Substitution Principle (LSP)**  

---

## 1. Liskov Substitution Principle (LSP)

### Definición

El LSP establece que:

* Los objetos de una **subclase** deben poder reemplazar objetos de su **superclase** sin alterar el comportamiento esperado del programa.

### Análisis en el código

* `Usuarios`, `Reservas` e `Instalaciones` heredan de `Gestion<T>`.
* Cada subclase puede **sustituir** a `Gestion<T>` ya que mantienen los mismos contratos (`agregar`, `buscarPorId`, `obtenerTodos`).
* No existen métodos que rompan compatibilidad ni excepciones al sustituirlos.
* Los métodos adicionales (`LoginUsuario`, `VerReservasPorUsuario`, etc.) **extienden** la funcionalidad pero no alteran la herencia ni contradicen las reglas de `Gestion<T>`.

### Ejemplo

```ts
// Uso polimórfico
function listarTodos<T extends { id: number }>(gestion: Gestion<T>) {
    return gestion.obtenerTodos();
}

// Puede recibir Usuarios, Reservas o Instalaciones sin problema
listarTodos(new Usuarios());
listarTodos(new Reservas());
listarTodos(new Instalaciones());
```

✅ **Conclusión LSP:**
El código **sí cumple** con el principio de sustitución de Liskov, ya que las subclases pueden reemplazar a la superclase `Gestion<T>` sin problemas ni efectos inesperados.

---

# 📌 Conclusión General


**LSP:** Cumplido completamente. Las subclases respetan la herencia y pueden sustituir a la clase base sin inconvenientes.


---

# 🔧 Interface Segregation Principle (ISP)

El **🎯 Principio de Segregación de Interfaces** establece que ningún cliente debería verse forzado a depender de métodos que no utiliza.  
En lugar de crear interfaces grandes y monolíticas, debemos crear interfaces pequeñas y específicas.

> 💬 "Los clientes no deberían verse obligados a depender de interfaces que no usan."

---

## 📌 Ejemplo: Sistema de Impresoras

### ❌ Violando el ISP

```typescript
interface MultiFunctionDevice {
  print(document: string): void;
  scan(document: string): void;
  fax(document: string): void;
  photocopy(document: string): void;
}

class SimplePrinter implements MultiFunctionDevice {
  print(document: string): void {
    console.log(`🖨️ Printing: ${document}`);
  }
  
  // ❌ Forzado a implementar métodos que no necesita
  scan(document: string): void {
    throw new Error("❌ Scan not supported");
  }
  
  fax(document: string): void {
    throw new Error("❌ Fax not supported");
  }
  
  photocopy(document: string): void {
    throw new Error("❌ Photocopy not supported");
  }
}

class BasicScanner implements MultiFunctionDevice {
  scan(document: string): void {
    console.log(`📄 Scanning: ${document}`);
  }
  
  // ❌ Forzado a implementar métodos que no necesita
  print(document: string): void {
    throw new Error("❌ Print not supported");
  }
  
  fax(document: string): void {
    throw new Error("❌ Fax not supported");
  }
  
  photocopy(document: string): void {
    throw new Error("❌ Photocopy not supported");
  }
}
```

### ✅ Aplicando el ISP

```typescript
// 🎯 Interfaces segregadas y específicas
interface Printer {
  print(document: string): void;
}

interface Scanner {
  scan(document: string): void;
}

interface FaxMachine {
  fax(document: string): void;
}

interface PhotoCopier {
  photocopy(document: string): void;
}

// ✅ Implementaciones que solo dependen de lo que necesitan
class SimplePrinter implements Printer {
  print(document: string): void {
    console.log(`🖨️ Printing: ${document}`);
  }
}

class BasicScanner implements Scanner {
  scan(document: string): void {
    console.log(`📄 Scanning: ${document}`);
  }
}

class PrinterScanner implements Printer, Scanner {
  print(document: string): void {
    console.log(`🖨️ Advanced printing: ${document}`);
  }
  
  scan(document: string): void {
    console.log(`📄 Advanced scanning: ${document}`);
  }
}

class MultiFunctionDevice implements Printer, Scanner, FaxMachine, PhotoCopier {
  print(document: string): void {
    console.log(`🖨️ MFD printing: ${document}`);
  }
  
  scan(document: string): void {
    console.log(`📄 MFD scanning: ${document}`);
  }
  
  fax(document: string): void {
    console.log(`📠 MFD faxing: ${document}`);
  }
  
  photocopy(document: string): void {
    console.log(`📋 MFD photocopying: ${document}`);
  }
}

// 💡 Uso flexible
function processPrintJob(printer: Printer, document: string) {
  printer.print(document); // 🎯 Solo necesita la capacidad de imprimir
}

function processScanJob(scanner: Scanner, document: string) {
  scanner.scan(document); // 🎯 Solo necesita la capacidad de escanear
}

// 📝 Ejemplo de uso
const simplePrinter = new SimplePrinter();
const scanner = new BasicScanner();
const mfd = new MultiFunctionDevice();

processPrintJob(simplePrinter, "document1.pdf"); // ✅ Funciona
processPrintJob(mfd, "document2.pdf");           // ✅ Funciona

processScanJob(scanner, "photo.jpg");            // ✅ Funciona  
processScanJob(mfd, "contract.pdf");             // ✅ Funciona
```

## 🎯 Beneficios del ISP

- 🔄 **Flexibilidad**: Cada clase implementa solo lo que necesita
- 🛠️ **Mantenibilidad**: Los cambios afectan menos componentes
- ♻️ **Reutilización**: Interfaces pequeñas son más reutilizables
- 🧩 **Composición**: Permite combinar múltiples capacidades según sea necesario



# 🌟✨ Fin del Informe ✨🌟
## ✨ ¡Muchas tank you 
