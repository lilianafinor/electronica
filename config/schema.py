import graphene
import usuarios.schema
import inventario.schema


class Query(
    usuarios.schema.Query,
    inventario.schema.Query,
    graphene.ObjectType
):
    pass


class Mutation(
    usuarios.schema.Mutation,
    inventario.schema.Mutation,
    graphene.ObjectType
):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)