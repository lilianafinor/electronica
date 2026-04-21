import graphene
import usuarios.schema

schema = graphene.Schema(
    query=usuarios.schema.Query,
    mutation=usuarios.schema.Mutation
)