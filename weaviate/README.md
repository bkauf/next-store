# Weaviate configuration details 


# Adjust API Keys

```sh
helm show values weaviate/weaviate > values.yaml
```

Install K8s Secret

Create the weaviatekeys file and add in your keys
```sh

export APIKEYS="api-keys-here"
kubectl create secret -n weaviate generic userapikeys --from-literal=AUTHENTICATION_APIKEY_ALLOWED_KEYS=$APIKEYS


```

# Deploy



```sh
helm upgrade --install \
  "weaviate" \
  weaviate/weaviate \
  --namespace "weaviate" \
  --values ./values.yaml
```


# Delete

```sh
helm delete \
  "weaviate" \
  weaviate/weaviate \
```