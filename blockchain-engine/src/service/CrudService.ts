export interface CrudService<Entity, IdType> {
    create(entity:Entity):IdType;
    read(id:IdType):Entity|undefined;
    update(entity:Entity):Entity;
    delete(id:IdType):void
}