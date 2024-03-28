
# From RAG to autonomous apps with Weaviate and Gemini on Google Kubernetes Engine
![Next Demo Achitecture](https://github.com/bkauf/next-store/blob/main/diagram.png)


To Deploy this demo...


## Setup the Weaviate Vector Database
1. Set your project id

```sh
PROJECT_ID=<your project id>
gcloud config set core/project $PROJECT_ID
```
Set some environment variables

```sh
CLUSTER_NAME=demo-cluster # A name for your cluster
SA_NAME=$CLUSTER_NAME-sa # A name for your service account
REGION=us-central1 # Google cloud region to host your infrastucture
AR_NAME=demo-registry # name for your artifact registry repo

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

1. Create a service account for the GKE cluster

```sh
gcloud iam service-accounts create $SA_NAME --display-name="Demo cluster service account"
```
Add the necessary roles to the GKE service account

```sh
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

Create an artifact registry repository ti upload your docker images

```sh
gcloud artifacts repositories create $AR_NAME \
--location=$REGION \
--repository-format=docker 

```

Get your GEMINI API key
- Go to https://developers.generativeai.google/ to create a GEMINI API key. This is necessary to be able to run the demo.
- Set this API key as an environment variable

```sh
GEMINI_API_KEY=<your Gemini API key>
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
--namespace weaviate --create-namespace
```

Get Weaviate Server IPs

```sh
HTTP_IP=""
while [[ -z "$HTTP_IP" ]]; do
  HTTP_IP=$(kubectl get service weaviate -n weaviate -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  sleep 2 
done

echo "External HTTP IP obtained: $HTTP_IP"
```
Optionally, we can get the IP of the GRPC service IP as well
```sh
GRPC_IP=""
while [[ -z "$GRPC_IP" ]]; do
  GRPC_IP=$(kubectl get service weaviate-grpc -n weaviate -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  sleep 2 
done

echo "External GRPC IP obtained: $GRPC_IP"
```

## Setup the Demo application
The following steps will walk through adding the nessessary  variables to the demo application, creating a container for it, then running it on Google Cloud Run

Create your storage bucket and store the bucket name. We wrap this in an if-else statement to make the command idempotent

```sh
# Check if the bucket exists
GCS_BUCKET=${PROJECT_ID}-product-images
if gsutil ls -b gs://$GCS_BUCKET; then
   echo "Bucket gs://$GCS_BUCKET already exists."
else
   # Create the bucket if it doesn't exist
   gcloud storage buckets create gs://$GCS_BUCKET --location=$REGION --project=$PROJECT_ID
fi
echo BUCKET NAME is $GCS_BUCKET

```

Create a .env file in the demo-website directory and replace the variables below with your own. 

```sh 
ENV_FILE="demo-website/.env"
# Create the .env file (or overwrite if it exists)
cat > $ENV_FILE << EOF
GEMINI_API_KEY=$GEMINI_API_KEY
GCS_BUCKET=$GCS_BUCKET
WEAVIATE_SERVER=$HTTP_IP
WEAVIATE_API_KEY=$WEAVIATE_API_KEY
EOF

echo ".env file created in the demo-website directory."

```

Build and push the container to the artifact registry 
```sh
gcloud builds submit --config=demo-website/cloudbuild.yaml \
--substitutions=_PROJECT_ID=${PROJECT_ID},\
_REPO_URL=${REGION}-docker.pkg.dev,\
_IMAGE_REPO=$AR_NAME,\
_IMAGE_NAME=website
```

Create a service account for cloud run
```sh
CLOUDRUN_SA_NAME=cloudrun-sa
gcloud iam service-accounts create $CLOUDRUN_SA_NAME --display-name="Cloud Run service account"
```
Add the necessary roles to the SA

```sh
gcloud projects add-iam-policy-binding $PROJECT_ID  \
--member=serviceAccount:$CLOUDRUN_SA_NAME@$PROJECT_ID.iam.gserviceaccount.com \
--role=roles/storage.objectUser
```

Create a cloud run instance

```sh
gcloud run deploy website \
--image=${REGION}-docker.pkg.dev/$PROJECT_ID/$AR_NAME/website:latest \
--service-account=$CLOUDRUN_SA_NAME@$PROJECT_ID.iam.gserviceaccount.com \
--region=$REGION \
--allow-unauthenticated \
--set-env-vars=GEMINI_API_KEY=$GEMINI_API_KEY,\
GCS_BUCKET=$GCS_BUCKET,\
GOOGLE_STORAGE_PROJECT_ID=$PROJECT_ID,\
WEAVIATE_API_KEY=$WEAVIATE_API_KEY,\
WEAVIATE_SERVER="http://${HTTP_IP}"

```

Navigate to the demo application 
Sample product to upload

```sh
  "title": "Project Sushi Tshirt",
  "category": "Clothing  accessories Tops  tees Tshirts",
  "link": "https://shop.googlemerchandisestore.com/store/20190522377/assets/items/images/GGCPGXXX1338.jpg",

```