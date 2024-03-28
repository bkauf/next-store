
# From RAG to autonomous apps with Weaviate and Gemini on Google Kubernetes Engine
![Next Demo Achitecture](https://github.com/bkauf/next-store/blob/main/diagram.png)


To Deploy this demo...


## Setup the Weaviate Vector Database
1. Set your project id

```sh
export PROJECT_ID=<your project id>
gcloud config set core/project $PROJECT_ID
```

1. Enable the necessary APIs for your project.

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

1. Create a service account for the GKE cluster


```sh
export CLUSTER_NAME=demo-cluster
export SA_NAME=$CLUSTER_NAME-sa
export REGION=us-central1

gcloud iam service-accounts create $SA_NAME --display-name="Demo cluster service account"
```
Add the necessary roles to the SA

```sh
gcloud projects add-iam-policy-binding $PROJECT_ID  \
--member=serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com \
--role=roles/monitoring.metricWriter

gcloud projects add-iam-policy-binding $PROJECT_ID  \
--member=serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com \
--role=roles/artifactregistry.reader

```

1. Deploy a regional GKE Cluster. This step can take several minutes.

```sh 
gcloud container clusters create $CLUSTER_NAME \
 --project=$PROJECT_ID \
 --region=$REGION \
 --enable-ip-alias \
 --num-nodes=1 \
 --service-account=$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com \
 --scopes=https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring,https://www.googleapis.com/auth/cloud-platform

 ```


1. Create an artifact registry

```sh
gcloud artifacts repositories create demo-registry \
--location=$REGION \
--repository-format=docker 

```
1.  Get your PALM API key
Go to https://developers.generativeai.google/ to create a PALM API key. This is necessary to be able to run the demo.
Set your palm API key as an environment variable

```sh
export $PALM_API_KEY=<your palm api key>
```

1. Install Weaviate 

Let's connect to the cluster
```sh
gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION --project $PROJECT_ID
```

We are going to use the regional persistant disk storage class for weaviate, so we'll install that storage class in the cluster.

```sh
kubectl apply -f weaviate/storage-class.yaml
```

Let's create a secret API KEY for weaviate so we don't allow unauthenticated access

```sh
export WEAVIATE_API_KEY=<some secret key string>
kubectl create namespace weaviate
kubectl create secret generic user-keys \
--from-literal=AUTHENTICATION_APIKEY_ALLOWED_KEYS=$WEAVIATE_API_KEY \
-n weaviate
```
Let's install Weaviate

```sh
helm repo add weaviate https://weaviate.github.io/weaviate-helm

helm upgrade --install weaviate weaviate/weaviate \
-f weaviate/demo-values.yaml \
--set modules.generative-palm.apiKey=$PALM_API_KEY \
--set modules.text2vec-palm.apiKey=$PALM_API_KEY \
--namespace weaviate --create-namespace
```
1. Get Weaviate Server IPs

```sh
HTTP_IP=""
while [[ -z "$HTTP_IP" ]]; do
  HTTP_IP=$(kubectl get service weaviate -n weaviate -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  sleep 2  # Adjust delay as needed
done

echo "External HTTP IP obtained: $HTTP_IP"
```
Optionally, We can get the IP of the GRPC service IP as well
```sh
GRPC_IP=""
while [[ -z "$GRPC_IP" ]]; do
  GRPC_IP=$(kubectl get service weaviate-grpc -n weaviate -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  sleep 2  # Adjust delay as needed
done

echo "External GRPC IP obtained: $GRPC_IP"
```

## Setup the Demo application
The following steps will walk through adding the nessessary  variables to the demo application, creating a container for it, then running it on Google Cloud Run


1.  Get your PALM API key
Go to https://developers.generativeai.google/ to create a PALM API key. This is necessary to be able to run the demo.

1. Create your storage bucket

1. create a .env file in the demo-website directory and replace the variables below with your own. If you would like to run this locally and not in cloud build on GCP you will need a service account, see option section below for more details. 


```sh 
GEMINI_API_KEY="From step 1"
GCS_BUCKET="storage bucket name"
WEAVIATE_SERVER="from weaviate install steps"
WEAVIATE_API_KEY="next-demo349834"
#If you plan to run this locally you will need the following sevice account varable
#GOOGLE_APPLICATION_CREDENTIALS="sa.json"
```

1. Create a container repo 

1. Create a container

```sh
gcloud run deploy [Name] \
    --image us-central1-docker.pkg.dev/[Project ID]/Repo]/
    ```

1. create a service account for cloud build to use to connect to GCS for image uploads

1. Launch it to Cloud Build

```sh
TBD
```



Navigate to the demo application 
Sample product to upload

```sh
  
        "title": "Project Sushi Tshirt",
        "category": "Clothing  accessories Tops  tees Tshirts",
        "link": "https://shop.googlemerchandisestore.com/store/20190522377/assets/items/images/GGCPGXXX1338.jpg",
  
```