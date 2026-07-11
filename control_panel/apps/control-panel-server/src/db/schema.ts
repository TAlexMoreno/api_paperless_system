import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const categoriaDocumento = pgTable("categoria_documento", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    nombre: varchar("nombre", { length: 255 }).notNull().unique(),
    habilitado: boolean("habilitado").notNull().default(true),
})

export const tipoDocumento = pgTable("tipo_documento", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    nombre: varchar("nombre", { length: 255 }).notNull().unique(),
    habilitado: boolean("habilitado").notNull().default(true),
    categoriaId: integer("categoria_id").notNull().references(() => categoriaDocumento.id, { onDelete: "cascade", name: "categoria_fk" }),
})

export const expediente = pgTable("expediente", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    clave: varchar("clave", { length: 255 }).notNull().notNull().unique(),
})

export const tableMap = {
    categorias: categoriaDocumento,
    tipos: tipoDocumento,
    expedientes: expediente,
} as const;

