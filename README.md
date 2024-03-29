# From RAG to autonomous apps with Weaviate and Gemini on Google Kubernetes Engine

![Next Demo Achitecture](https://github.com/bkauf/next-store/blob/main/diagram.png)

To Deploy this demo...

## Setup the Weaviate Vector Database

1. enable the nessessary APIs

```sh

gcloud services enable artifactregistry.googleapis.com
```


1. Deploy the GKE Cluster

1. Install Weaviate

1. load the sample data into weaviate(python script provided)

1. Get Weaviate Server IP

## Setup the Demo application
The following steps will walk through adding the nessessary  variables to the demo application, creating a container for it, then running it on Google Cloud Run


1.  Get your PALM API key
Go to https://developers.generativeai.google/ to create a PALM API key. This is necessary to be able to run the demo.

1. Create your storage bucket and allow public access to it.


```sh
export BUCKET_NAME="[your bucket name]"
export BUCKET_LOCATION="us-central1"

gcloud storage buckets create gs://$BUCKET_NAME --location=$BUCKET_LOCATION \
--no-public-access-prevention 

gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME --member=allUsers --role=roles/storage.objectViewer

```


1. Create a .env file for the demo application

create a .env file in the demo-website directory and replace the variables below with your own. If you would like to run this locally and not in cloud build on GCP you will need a service account, see option section below for more details.


```sh
GEMINI_API_KEY="From step 1"
GCS_BUCKET="storage bucket name from BUCKET_NAME"
WEAVIATE_SERVER="from weaviate install steps"
WEAVIATE_API_KEY="next-demo349834"
#If you plan to run this locally you will need the following sevice account varable
#GOOGLE_APPLICATION_CREDENTIALS="sa.json"
```

1. Create a artifact registry repo for your container

```sh
export REPO=[Your Repo Name]
export LOCATION="us-central1"
gcloud artifacts repositories create $REPO \
    --repository-format=docker \
    --location=$LOCATION \
    --description="Next Store Demo"
```

1. Create a container

```sh
export PROJECT_ID=[Your Project ID]
export REPO=[Your Repo Name]
export CLOUD_RUN_NAME="next-store"
gcloud builds submit --tag $LOCATION-docker.pkg.dev/$PROJECT_ID/$REPO/next-demo:1.0

```


1. Create a service account for Cloud Run to use to connect to GCS for image uploads


```sh
tbd
```
1. Deploy the Container to Cloud Run


```sh
export PROJECT_ID="[Your Project ID]"

gcloud run deploy $CLOUD_RUN_NAME \
    --image us-central1-docker.pkg.dev/$PROJECT_ID/$REPO/next-demo:1.0
```


Navigate to the demo application
Sample product to upload

```sh

        "title": "Project Sushi Tshirt",
        "category": "Clothing  accessories Tops  tees Tshirts",
        "link": "https://shop.googlemerchandisestore.com/store/20190522377/assets/items/images/GGCPGXXX1338.jpg",

```
