
# From RAG to autonomous apps with Weaviate and Gemini on Google Kubernetes Engine
![Next Demo Achitecture](https://github.com/bkauf/next-store/blob/main/diagram.png)


To Deploy the basic components needed for this demo we'll follow the following steps.
- Get your Gemini API key
- Enable the necessary Google Cloud APIs
- Deploy the GKE Cluster
- Install Weaviate
- Get Weaviate Server IP addresses.
- Create an Artifact registry
- Install the demo application

### Get your GEMINI API key
- Go to https://developers.generativeai.google/ to create a GEMINI API key. This is necessary to be able to run the demo.
- Set this API key as an environment variable

```sh
GEMINI_API_KEY=<your Gemini API key>
```

### Enable the necessary Google Cloud APIs
Set your project id

```sh
PROJECT_ID=<your project id>
gcloud config set core/project $PROJECT_ID
```
Enable the necessary Google cloud APIs for your project.

```sh

gcloud services enable \
cloudbuild.googleapis.com \
storage.googleapis.com \
serviceusage.googleapis.com \
cloudresourcemanager.googleapis.com \
compute.googleapis.com \
iam.googleapis.com \
container.googleapis.com \
artifactregistry.googleapis.com \
clouddeploy.googleapis.com

```

### Deploy the GKE Cluster
Set some environment variables used in later steps.

```sh
CLUSTER_NAME=demo-cluster # A name for your cluster
SA_NAME=$CLUSTER_NAME-sa # A name for your service account
REGION=us-central1 # Google cloud region to host your infrastucture
AR_NAME=demo-registry # name for your artifact registry repo
```
Create a service account for the GKE cluster. and add the necessary roles.

```sh
gcloud iam service-accounts create $SA_NAME --display-name="Demo cluster service account"

gcloud projects add-iam-policy-binding $PROJECT_ID  \
--member=serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com \
--role=roles/monitoring.metricWriter
```

Deploy a small regional GKE Cluster. This step can take several minutes to finish.

```sh 
gcloud container clusters create $CLUSTER_NAME \
 --project=$PROJECT_ID \
 --region=$REGION \
 --enable-ip-alias \
 --num-nodes=1 \
 --service-account=$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com \
 --scopes=https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring,https://www.googleapis.com/auth/cloud-platform

 ```

### Install Weaviate 

Let's connect to the cluster
```sh
gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION --project $PROJECT_ID
```

We are going to use the regional persistant disk storage class for weaviate, so we'll install that storage class in the cluster.

```sh
kubectl apply -f weaviate/storage-class.yaml
```

Let's create a secret API KEY for weaviate so we don't allow unauthenticated access.

```sh
WEAVIATE_API_KEY=<some secret key string> # use any random string, make sure you save it
```
Let's store the key as a kubernetes secret.

```sh
kubectl create namespace weaviate

kubectl create secret generic user-keys \
--from-literal=AUTHENTICATION_APIKEY_ALLOWED_KEYS=$WEAVIATE_API_KEY \
-n weaviate
```
Let's install Weaviate using a helm chart.

```sh
helm repo add weaviate https://weaviate.github.io/weaviate-helm

helm upgrade --install weaviate weaviate/weaviate \
-f weaviate/demo-values.yaml \
--set modules.generative-palm.apiKey=$GEMINI_API_KEY \
--set modules.text2vec-palm.apiKey=$GEMINI_API_KEY \
--namespace weaviate
```

### Get Weaviate Server IPs

```sh
HTTP_IP=""
while [[ -z "$HTTP_IP" ]]; do
  HTTP_IP=$(kubectl get service weaviate -n weaviate -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  sleep 2 
done

echo "External HTTP IP obtained: $HTTP_IP"
```
Optionally, we can get the IP of the GRPC service as well
```sh
GRPC_IP=""
while [[ -z "$GRPC_IP" ]]; do
  GRPC_IP=$(kubectl get service weaviate-grpc -n weaviate -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  sleep 2 
done

echo "External GRPC IP obtained: $GRPC_IP"
```

### Create an Artifact Registry

```sh
gcloud artifacts repositories create $AR_NAME \
--location=$REGION \
--repository-format=docker 

```

## Setup the Demo application
