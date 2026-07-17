import { boolean, integer, pgTable, primaryKey, varchar, timestamp } from "drizzle-orm/pg-core";
export const categoriaDocumento = pgTable("categoria_documento", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    nombre: varchar("nombre", { length: 255 }).notNull().unique(),
    habilitado: boolean("habilitado").notNull().default(true),
});
export const tipoDocumento = pgTable("tipo_documento", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    nombre: varchar("nombre", { length: 255 }).notNull().unique(),
    habilitado: boolean("habilitado").notNull().default(true),
    categoriaId: integer("categoria_id").notNull().references(() => categoriaDocumento.id, { onDelete: "cascade", name: "categoria_fk" }),
    paperlessId: integer("paperless_id"),
});
export const expediente = pgTable("expediente", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    clave: varchar("clave", { length: 255 }).notNull().unique(),
    descripcion: varchar("descripcion", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdBy: varchar("created_by", { length: 255 }).notNull().default(""),
});
export const expedienteTipoDocumento = pgTable("expediente_tipo_documento", {
    expedienteId: integer("expediente_id").notNull().references(() => expediente.id, { onDelete: "cascade", name: "expediente_fk" }),
    tipoDocumentoId: integer("tipo_documento_id").notNull().references(() => tipoDocumento.id, { onDelete: "cascade", name: "tipo_documento_fk" }),
    comentario: varchar("comentario", { length: 255 }).notNull().default(""),
}, (table) => [
    primaryKey({ columns: [table.expedienteId, table.tipoDocumentoId], name: "expediente_tipo_documento_pkey" })
]);
export const tableMap = {
    categorias: categoriaDocumento,
    tipos: tipoDocumento,
    expedientes: expediente,
    expedienteTipos: expedienteTipoDocumento,
};
