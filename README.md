



# Deploy this demo

## Get your PALM API key
Go to https://developers.generativeai.google/ to create a PALM API key. This is necessary to be able to run the demo.

## Launch the GKE Cluster and install the necessary weaviate helm charts
Set the necessary env variables for the installers. 

```sh
export PROJECT_ID=<your project id>
export REGION=<your region>
export PALM_API_KEY=<your palm api key>
export WEAVIATE_API_KEY=<any key to secure the weaviate server>

```

Run the install script to install the infrastructure (GKE cluster, artifact registry) and install the weaviate server.

```sh
./install.sh 
```

## Build and deploy the application to the cluster
This command will build the chatbot and deploy it to CloudRun.

```sh
./install.sh --app
```

## Connect to the demo cluster

```sh
gcloud container clusters get-credentials cluster-${PROJECT_ID} --region $REGION --project ${PROJECT_ID}
```
We need to create an API key and attach it as a secret to the weaviate server so that only authorized users can connect to the weaviate server.

```sh
kubectl create secret generic user-keys \
--from-literal=AUTHENTICATION_APIKEY_ALLOWED_KEYS=$WEAVIATE_API_KEY
``` 
Get the external IP addresses of the grpc and http services

```sh
kubectl get svc -n weaviate
```