import graphene
import usuarios.schema
import inventario.schema
import compras.schema


class Query(
    usuarios.schema.Query,
    inventario.schema.Query,
    compras.schema.Query,
    graphene.ObjectType
):
    pass


class Mutation(
    usuarios.schema.Mutation,
    inventario.schema.Mutation,
    compras.schema.Mutation,
    graphene.ObjectType
):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)