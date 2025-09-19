class Gestion<T extends { id: number }> {
    protected items: T[] = [];

    agregar(item: T) {
        this.items.push(item);
    }

    buscarPorId(id: number): T | undefined {
        return this.items.find(item => item.id === id);
    }

    obtenerTodos(): T[] {
        return this.items;
    }
}

export default Gestion;