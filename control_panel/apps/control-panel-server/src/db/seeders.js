import { categoriaDocumento, tipoDocumento } from "./schema.js";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import logger from "../libs/logger.js";
export async function seedCategoriaDocumento(db) {
    let categorias = [
        "Inicio de proceso",
        "Documentos que integran el expediente técnico",
        "Concurso",
        "Propuesta técnica",
        "Propuesta económica",
        "Fallo",
        "Documentación legal del proveedor",
        "Contrato, convenios y garantías",
        "Primer pago o pago subsecuente",
        "Acta entrega, recepción y entregables",
    ];
    for (const categoria of categorias) {
        let categoriasDb = await db.select().from(categoriaDocumento).where(eq(categoriaDocumento.nombre, categoria));
        if (categoriasDb.length === 0) {
            await db.insert(categoriaDocumento).values({ nombre: categoria });
            logger.debug(`💾 "${categoria}"`);
        }
        else {
            logger.debug(`✅ "${categoria}"`);
        }
    }
}
export async function seedTipoDocumento(db) {
    let tiposDocumento = [
        { "nombre": "Solicitud FSADS (Interna)", "categoria": "Inicio de proceso" },
        { "nombre": "Oficio de solicitud de Dirección General hacía las áreas", "categoria": "Inicio de proceso" },
        { "nombre": "Justificación general", "categoria": "Inicio de proceso" },
        { "nombre": "Estudio de mercado y/o Cotización", "categoria": "Inicio de proceso" },
        { "nombre": "Sesión del Consejo de Administración.", "categoria": "Inicio de proceso" },
        { "nombre": "Documento que establezca montos máximos y mínimos de contratación autorizados para el ejercicio, así como la documentación donde se establece el presupuesto autorizado para el ejercicio", "categoria": "Inicio de proceso" },
        { "nombre": "Oficio de solicitud de inicio del proceso de compra", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Solicitud de pedido o requisición de compra (SIAA) formato DI-01", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Formato de validación presupuestal para adquisiciones (VPA)", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Oficio de disponibilidad presupuestal", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Copia del programa anual de adquisiciones (PAAAS)", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Anexo Técnico de bienes o servicios a contratar", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Formato de excepción a la licitación F-03", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Justificación a la excepción a la licitación", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Formato de solicitud de cotización F-02", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Cotizaciones elaboradas por el proveedor", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Solicitud de validación emitida a la Subsecretaria de Innovación y Tecnologías de la Información", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Dictamen de validación de la Subsecretaria de Innovación y Tecnologías de la Información", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Copia de credencial del padrón", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Opinión positiva de cumplimiento emitida por el SAT", "categoria": "Documentos que integran el expediente técnico" },
        { "nombre": "Oficio de invitación de la dependencia a la API", "categoria": "Concurso" },
        { "nombre": "Invitaciones", "categoria": "Concurso" },
        { "nombre": "Petición de oferta", "categoria": "Concurso" },
        { "nombre": "Bases del concurso", "categoria": "Concurso" },
        { "nombre": "Remisión de invitación", "categoria": "Concurso" },
        { "nombre": "Relación de invitados al concurso", "categoria": "Concurso" },
        { "nombre": "Acta de apertura", "categoria": "Concurso" },
        { "nombre": "Lista de asistencia", "categoria": "Concurso" },
        { "nombre": "Copia de las bases del concurso y anexos", "categoria": "Propuesta técnica" },
        { "nombre": "Copia de credencial del padrón", "categoria": "Propuesta técnica" },
        { "nombre": "Escrito de garantía de sostenimiento de la propuesta", "categoria": "Propuesta técnica" },
        { "nombre": "Folletos o fichas técnicas de las propuestas", "categoria": "Propuesta técnica" },
        { "nombre": "Escrito de garantía de calidad de los bienes y/o servicios", "categoria": "Propuesta técnica" },
        { "nombre": "Escrito de programa de entrega", "categoria": "Propuesta técnica" },
        { "nombre": "Opinion positiva de cumpliento emitida por el SAT", "categoria": "Propuesta técnica" },
        { "nombre": "Confirmación de recibida la invitación", "categoria": "Propuesta técnica" },
        { "nombre": "Propuesta económica", "categoria": "Propuesta económica" },
        { "nombre": "Escrito de garantía, seriedad y sostenimiento de la propuesta", "categoria": "Propuesta económica" },
        { "nombre": "Garantía en Moneda Nacional (20% del monto total de la propuesta con el impuesto)", "categoria": "Propuesta económica" },
        { "nombre": "Carta Compromiso", "categoria": "Propuesta económica" },
        { "nombre": "Fallo", "categoria": "Fallo" },
        { "nombre": "Oficio de notificación de adjudicación", "categoria": "Fallo" },
        { "nombre": "Constancia de Situación fiscal emitida por el SAT con fecha de expedición no mayor a 30 días", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Acta constitutiva y/o modificaciones (P.M.) / Acta de nacimiento (P.F.)", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Poder Notarial", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Copia de identificación oficial (persona física y/o persona moral)", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Opinión positiva de cumplimiento emitida por el SAT con fecha de expedición no mayor a 30 días", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Opinión positiva de cumplimiento emitida por el IMSS con fecha de expedición no mayor a 30 días", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Opinión positiva de cumplimiento emitida por el INFONAVIT con fecha de expedición no mayor a 30 días", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Copia de carátula del estado de cuenta bancario (Con fecha de no mayor a 30 días)", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Comprobante de domicilio Fiscal (no mayor a dos meses) y en caso de ser diferente del Estado de Tamaulipas, presentar manifiesto para oir y recibir notificaciones.", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Escrito firmado por el proveedor en el que manifieste 'Bajo protesta de decir verdad' que no se encuentra en niguno de los supuestos del Art. 31 de La Ley de Adquisiciones para la Administración Publica del Estado de Tamaulipas y sus Municipios", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Tarjetón del padrón de proveedores del gobierno del Estado de Tamaulipas (Vigente)", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Escrito con datos bancarios, número de telefono y correo de contacto", "categoria": "Documentación legal del proveedor" },
        { "nombre": "Contrato", "categoria": "Contrato, convenios y garantías" },
        { "nombre": "Convenio modificatorio al contrato", "categoria": "Contrato, convenios y garantías" },
        { "nombre": "Fianza de Anticipo", "categoria": "Contrato, convenios y garantías" },
        { "nombre": "Fianza de Cumplimiento", "categoria": "Contrato, convenios y garantías" },
        { "nombre": "Fianza de Vicios Ocultos", "categoria": "Contrato, convenios y garantías" },
        { "nombre": "Fianza (modificación)", "categoria": "Contrato, convenios y garantías" },
        { "nombre": "Póliza de registro contable", "categoria": "Primer pago o pago subsecuente" },
        { "nombre": "SPEI", "categoria": "Primer pago o pago subsecuente" },
        { "nombre": "Autorización de transferencia bancaria", "categoria": "Primer pago o pago subsecuente" },
        { "nombre": "Instrucción de pago del área técnica", "categoria": "Primer pago o pago subsecuente" },
        { "nombre": "Instrucción de pago del proveedor", "categoria": "Primer pago o pago subsecuente" },
        { "nombre": "Factura (firmada) y XML", "categoria": "Primer pago o pago subsecuente" },
        { "nombre": "Validación del SAT", "categoria": "Primer pago o pago subsecuente" },
        { "nombre": "Acta de entrega de bienes", "categoria": "Acta entrega, recepción y entregables" },
        { "nombre": "Reporte fotográfico", "categoria": "Acta entrega, recepción y entregables" },
        { "nombre": "Acta entrega-recepción", "categoria": "Acta entrega, recepción y entregables" },
        { "nombre": "Ingreso y resguardo de bienes", "categoria": "Acta entrega, recepción y entregables" },
    ];
    for (const tipo of tiposDocumento) {
        let categorias = await db.select().from(categoriaDocumento).where(eq(categoriaDocumento.nombre, tipo.categoria));
        if (categorias.length === 0) {
            logger.error(`${tipo.nombre}: ${tipo.categoria} 🔎❌`);
            continue;
        }
        let categoriaId = categorias[0].id;
        let tipos = await db.select().from(tipoDocumento).where(eq(tipoDocumento.nombre, tipo.nombre));
        if (tipos.length === 0) {
            await db.insert(tipoDocumento).values({ nombre: tipo.nombre, categoria: categoriaId });
            logger.debug(`💾 "${tipo.nombre}"`);
        }
        else {
            logger.debug(`✅ "${tipo.nombre}"`);
        }
    }
}
