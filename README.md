



# Deploy this demo

## Get your PALM API key
Go to https://developers.generativeai.google/ to create a PALM API key. This is necessary to be able to run the demo.

## Launch the GKE Cluster and install the necessary weaviate helm charts
Set the necessary env variables for the installers. 

```sh
export PROJECT_ID=<your project id>
export REGION=<your region>
export PALM_API_KEY=<your palm api key>
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

## Connect to the demo

Get the external IP addresses of the grpc and http services

```sh
kubectl get svc -n weaviate
```