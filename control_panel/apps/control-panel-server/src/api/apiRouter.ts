import { type Request } from "express";
import { tableMap } from "../db/schema.js";
import type { PgTable } from "drizzle-orm/pg-core/table";
import type { NodePgDatabase } from "drizzle-orm/node-postgres/driver";
import { count } from "drizzle-orm/sql/functions/aggregate";
import type { SQL } from "drizzle-orm/sql/sql";
import { and, eq, getColumns, sql } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core/utils";
import type { ForeignKey } from "drizzle-orm/pg-core/foreign-keys";
import type { PgColumn } from "drizzle-orm/pg-core/columns/common";
import { EntityNotFoundError } from "./apiError.js";
import { CollectionResponse } from "../../../../packages/server/types.js";
import logger from "../libs/logger.js";

interface joinInfo {
    sourceTable: PgTable,
    sourceColumn: PgColumn,
    targetTable: PgTable,
    targetColumn: PgColumn
}

export default class APIRouter {
    
    get entityParam(): string {
        return this.request.params.entity;
    }

    get entityPgTable(): PgTable {
        return tableMap[this.entityParam as keyof typeof tableMap]
    }

    itemsPerPage: number = 10;
    page: number = 1;
    params: Record<string, string> = {};
    
    constructor(private request: Request<{ entity: string }>, private db: NodePgDatabase){
        this.itemsPerPage = parseInt(request.query.itemsPerPage as string) || 10;
        this.page = parseInt(request.query.page as string) || 1;
        this.params = request.query as Record<string, string>;
        if (!this.entityPgTable) {
            throw new EntityNotFoundError(this.entityParam);
        }
    }

    async getCollection(): Promise<CollectionResponse<any>> {
        await this.db.execute(sql`CREATE EXTENSION IF NOT EXISTS unaccent;`);
        let queryCount: any = this.db.select({ count: count() }).from(this.entityPgTable);
        let queryCollection: any = this.db.select(getColumns(this.entityPgTable)).from(this.entityPgTable);
        const { filters, joins, orders } = this.processQueryParams();
        for (const join of joins) {
            queryCount = queryCount.leftJoin(join.targetTable, eq(join.sourceColumn, join.targetColumn));
            queryCollection = queryCollection.leftJoin(join.targetTable, eq(join.sourceColumn, join.targetColumn));
        }
        if (orders.length > 0) {
            queryCollection = queryCollection.orderBy(...orders);
        }
        queryCount = queryCount.where(and(...filters));
        queryCollection = queryCollection.where(and(...filters)).limit(this.itemsPerPage).offset((this.page - 1) * this.itemsPerPage);
        let totalItems = await queryCount.execute();
        let items = await queryCollection.execute();
        let { foreignKeys } = getTableConfig(this.entityPgTable);
        items = items.map((item: any) => this.postProcessItem(item, foreignKeys));
        return {
            "@id": `/api/${this.entityParam}`,
            totalItems: totalItems.at(0)?.count || 0,
            member: (items as any[]).map((item: any) => ({
                "@id": `/api/${this.entityParam}/${item.id}`,
                ...item,
            }))
        }
    }

    async getItem(id: string): Promise<any> {
        let query: any = this.db.select(getColumns(this.entityPgTable)).from(this.entityPgTable).where(eq((this.entityPgTable as any).id, id));
        let item = await query.execute();
        if (!item || item.length === 0) {
            throw new EntityNotFoundError(this.entityParam);
        }
        let { foreignKeys } = getTableConfig(this.entityPgTable);
        return { 
            "@id": `/api/${this.entityParam}/${item[0].id}`,
            ...this.postProcessItem(item[0], foreignKeys) 
        };
    }

    async postItem(id: string, data: any): Promise<any> {
        let result = await this.db.select().from(this.entityPgTable).where(eq((this.entityPgTable as any).id, id)).execute();
        if (!result || result.length === 0) {
            throw new EntityNotFoundError(this.entityParam);
        }
        let dictamination = this.dictaminateRequestBody(data);
        let updateQuery: any = this.db.update(this.entityPgTable).set(dictamination).where(eq((this.entityPgTable as any).id, id));
        let updateResult = await updateQuery.execute();
        let updatedItem = await this.db.select(getColumns(this.entityPgTable)).from(this.entityPgTable).where(eq((this.entityPgTable as any).id, id)).execute();
        let { foreignKeys } = getTableConfig(this.entityPgTable);
        return { 
            "@id": `/api/${this.entityParam}/${updatedItem[0].id}`,
            ...this.postProcessItem(updatedItem[0], foreignKeys) 
        };
    }

    dictaminateRequestBody(data: any): any {
        let body: any = {};
        if (data.hasOwnProperty("@id")) delete data["@id"];
        if (data.hasOwnProperty("id")) delete data["id"];
        let { columns } = getTableConfig(this.entityPgTable);
        for (const [key, value] of Object.entries(columns)) {
            let columnName = value.name;
            let columnType = value.columnType
            if (data.hasOwnProperty(columnName)) {
                if (this.matchDataType(data[columnName], columnType)) {
                    body[columnName] = data[columnName];
                } else {
                    throw new Error(`Invalid data type for column ${columnName} (${data[columnName]}). Expected ${columnType}.`);
                }
            }

        }
        return body;
    }

    matchDataType(value: any, columnType: string): boolean {
        switch (columnType) {
            case "PgInteger":
                value = parseInt(value);
                return !isNaN(value);
            case "PgBigInt":
                value = BigInt(value);
                return typeof value === "bigint" || (typeof value === "string" && !isNaN(parseInt(value)));
            case "PgVarchar":
            case "PgText":
                value = String(value);
                return typeof value === "string";
            case "PgBoolean":
                value = (value === 'true' || value === true);
                return typeof value === "boolean";
            case "PgDate":
                value = new Date(value);
                return value instanceof Date && !isNaN(value.getTime());
            default:
                return false;
        }
    }

    postProcessItem(item: any, foreignKeys: ForeignKey[]): any {
        for (const foreignKey of foreignKeys) {
            const reference = foreignKey.reference();
            const sourceColumn = reference.columns[0];
            if (!sourceColumn) {
                continue;
            }
            const propertyName = this.getColumnPropertyName(sourceColumn, this.entityPgTable);
            const targetEntity = this.getEntityParamFromTable(reference.foreignTable);
            item[reference.name!.replace(/_fk$/, "")] = `/api/${targetEntity}/${item[propertyName!]}`;
            delete item[propertyName!];
        }
        return item;
    }

    processQueryParams(): {filters: SQL[], joins: joinInfo[], orders: SQL[]} {
        let filters: SQL[] = [];
        let joins: joinInfo[] = [];
        let orders: SQL[] = [];
        const propertyChainRegex = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)+$/;
        const orderByRegex = /^order\[(.*)\]/;
        for (let [key, value] of Object.entries(this.params)) {
            let currentTable = this.entityPgTable;
            if (key === "itemsPerPage" || key === "page") {
                continue;
            }

            if (orderByRegex.test(key)) {
                let orderByMatch = key.match(orderByRegex);
                if (orderByMatch) {
                    let orderByProperty = orderByMatch[1];
                    let orderByColumn = this.getColumnName(orderByProperty, currentTable);
                    if (propertyChainRegex.test(orderByProperty)) {
                        let propertyChain = orderByProperty.split(".");
                        let nextProperty = propertyChain.shift()!;
                        let currentReference = this.getForeign(nextProperty, currentTable);
                        
                        while (currentReference && propertyChain.length > 0) {
                            const sourceTable = currentTable;
                            const sourceColumn = currentReference.reference().columns[0];
                            const targetColumn = currentReference.reference().foreignColumns[0];
                            if (!sourceColumn || !targetColumn) {
                                break;
                            }
                            currentTable = currentReference.reference().foreignTable;
                            joins.push({
                                sourceTable,
                                sourceColumn,
                                targetTable: currentReference.reference().foreignTable,
                                targetColumn,
                            });
                            nextProperty = propertyChain.shift()!;
                            currentReference = this.getForeign(nextProperty, currentTable);
                        }
                        
                        orderByColumn = this.getColumnName(nextProperty, currentTable);
                        if (orderByColumn) {
                            orders.push(sql`${(currentTable as any)[orderByColumn]} ${value === "desc" ? sql`DESC` : sql`ASC`}`);
                        }
                    }else {
                        if (orderByColumn) {
                            orders.push(sql`${(currentTable as any)[orderByColumn]} ${value === "desc" ? sql`DESC` : sql`ASC`}`);
                        }
                    }
                    break;
                }
            }

            if (propertyChainRegex.test(key)) {
                let propertyChain = key.split(".");
                let nextProperty = propertyChain.shift()!;
                let currentReference = this.getForeign(nextProperty, currentTable);
                
                while (currentReference && propertyChain.length > 0) {
                    const sourceTable = currentTable;
                    const sourceColumn = currentReference.reference().columns[0];
                    const targetColumn = currentReference.reference().foreignColumns[0];
                    if (!sourceColumn || !targetColumn) {
                        break;
                    }
                    currentTable = currentReference.reference().foreignTable;
                    joins.push({
                        sourceTable,
                        sourceColumn,
                        targetTable: currentReference.reference().foreignTable,
                        targetColumn,
                    });
                    nextProperty = propertyChain.shift()!;
                    currentReference = this.getForeign(nextProperty, currentTable);
                }
                
                key = nextProperty || key;
            }

            let columnName = this.getColumnName(key, currentTable);
            let columnType = this.getColumnType(key, currentTable);

            
            if (!columnName) continue;
            
            switch (columnType) {
                case "character varying":
                case "string":
                case "text":
                    filters.push(sql`unaccent(${(currentTable as any)[columnName]}) ILIKE '%' || unaccent(${value}) || '%'`);
                    break;
                case "boolean":
                    filters.push(sql`${(currentTable as any)[columnName]} = ${value === 'true'}`);
                    break;
                case "integer":
                case "bigint":
                case "numeric":
                case "number int32":
                    filters.push(sql`${(currentTable as any)[columnName]} = ${parseInt(value)}`);
                    break;
                default:
                    filters.push(sql`${(currentTable as any)[columnName]} = ${value}`);
            }
        }

        return {filters, joins, orders};
    }

    getForeign(property: string, table: PgTable): ForeignKey | null {
        let {foreignKeys} = getTableConfig(table);
        for (let foreignKey of foreignKeys) {
            if (foreignKey.getName() === `${property}_fk` || foreignKey.reference().name === `${property}_fk`) {
                return foreignKey;
            }
        }
        return null;
    }

    getColumnName(property: string, table: PgTable): string | null {
        let columns = getColumns(table);
        for (let column of Object.values(columns)) {
            if (column.name === property) {
                return column.name;
            }
        }
        return null;
    }

    getColumnType(property: string, table: PgTable): string | null {
        let columns = getColumns(table);
        for (let column of Object.values(columns)) {
            if (column.name === property) {
                return column.dataType.toString();
            }
        }
        return null;
    }

    getColumnPropertyName(columnToMatch: PgColumn, table: PgTable): string | null {
        const columns = getColumns(table);
        for (const [propertyName, column] of Object.entries(columns)) {
            if (column === columnToMatch) {
                return propertyName;
            }
        }

        return null;
    }

    getEntityParamFromTable(table: PgTable): string | null {
        for (const [entityParam, mappedTable] of Object.entries(tableMap)) {
            if (mappedTable === table) {
                return entityParam;
            }
        }

        return null;
    }
}