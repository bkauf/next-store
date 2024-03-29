import weaviate
from weaviate.connect import ConnectionParams
import weaviate.classes as wvc
from weaviate.auth import AuthApiKey
import os


WEAVIATE_HTTP_URL = os.getenv("WEAVIATE_HTTP_URL")
WEAVIATE_GRPC_URL = os.getenv("WEAVIATE_GRPC_URL")
WEAVIATE_API_KEY = os.getenv("WEAVIATE_API_KEY")

# https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-explicit-connection
client = weaviate.WeaviateClient(
    connection_params=ConnectionParams.from_params(
        http_host=WEAVIATE_HTTP_URL,
        http_port="80",
        http_secure=False,
        grpc_host=WEAVIATE_GRPC_URL,
        grpc_port="50051",
        grpc_secure=False,
    ),
    auth_client_secret=AuthApiKey(WEAVIATE_API_KEY)
)

try:
    client.connect()
    client.collections.create(
        "Article",
        properties=[ 
            wvc.config.Property(name="title", data_type=wvc.config.DataType.TEXT),
            wvc.config.Property(name="body", data_type=wvc.config.DataType.TEXT),
        ]
    )
    collection = client.collections.get("Article")

    uuid = collection.data.insert({
        "title": "Some title",
        "body": "loads of interesting stuff", 
    })
    data_object = collection.query.fetch_object_by_id(uuid)
    print(data_object.properties)
    
    # Clean up
    client.collections.delete("Article")
finally:
    client.close() 