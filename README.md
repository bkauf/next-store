# From RAG to autonomous apps with Weaviate and Gemini on Google Kubernetes Engine

This demo application creates a product catalog that is stored in a database and vectorized for semantic search. It is also integrated into the [Gemini Pro Vision](https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemini-pro-vision) API to automatically create product descriptions.

![Next Demo Achitecture](https://github.com/bkauf/next-store/blob/main/diagram.png)

## To Deploy this demo...

clone this git repo

```sh
git clone https://github.com/bkauf/next-store.git
```

### Enable the Nessessary APIs

```sh

gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Setup the Weaviate Vector Database

1. Deploy the GKE Cluster

1. Install Weaviate

1. load the sample data into weaviate(python script provided)

1. Get Weaviate Server IP

### Setup the Demo application

The following steps will walk through adding the nessessary variables to the demo application, creating a container for it, then running it on Google Cloud Run

1.  Get your PALM API key
    Go to https://developers.generativeai.google/ to create a PALM API key. This is necessary to be able to run the demo.

1.  Create your storage bucket and allow public access to it.

    Create the bucket

    ```sh
    export GCS_BUCKET="next-demo"
    export LOCATION="us-central1"

    gcloud storage buckets create gs://$GCS_BUCKET --location=$LOCATION \
    --no-public-access-prevention
    ```

    Allow public access to the bucket

    ```sh

    gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME --member=allUsers --role=roles/storage.objectViewer
    ```

    1.  Create a .env file for the demo application

    ```sh
    cd next-store/demo-website/
    touch .env
    ```

Create a .env file in the demo-website directory and replace the variables below with your own. If you would like to run this demo app locally with 'npm run dev' you will need a service account, see option section below for more details. If you would like to run this on Cloud Run you do not need a local service account.

.env file contents:
```sh
GEMINI_API_KEY="From step 1"
GCS_BUCKET="next-demo"
WEAVIATE_SERVER="from weaviate install steps"
WEAVIATE_API_KEY="next-demo349834"
#If you plan to run this locally you will need the following sevice account varable
#GOOGLE_APPLICATION_CREDENTIALS="sa.json"
```

1. Create a artifact registry repo for your container

```sh
export REPO_NAME="next-demo"

gcloud artifacts repositories create $REPO_NAME --repository-format=docker \
    --location=$LOCATION --description="Docker repository" \
    --project=$PROJECT_ID
```


2. Create a container image to store in the image repo

```sh

gcloud builds submit --tag $LOCATION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/next-demo:1.0

```

3. Create a service account for Cloud Run to use to connect to GCS for image uploads


```sh
export SERVICE_ACCOUNT_NAME="next-demo"

gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --display-name="Next Demo"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

4. Deploy the Container to Cloud Run

The following commands set your envorinemnt varaibles for Cloud Run and also the service account that allows uploads to your public Google Cloud Storage bucket.

```sh

export CLOUD_RUN_NAME="next-store"
export WEAVIATE_API_KEY="next-demo349834"
export WEAVIATE_SERVER="[server IP]"
export GEMINI_API_KEY="From step 1"


gcloud run deploy $CLOUD_RUN_NAME \
    --image $LOCATION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/next-demo:1.0 \
    --port=3000 \
    --allow-unauthenticated \
    --region $LOCATION \
  --set-env-vars=GEMINI_API_KEY=$GEMINI_API_KEY, \
  --set-env-vars=GCS_BUCKET=$GCS_BUCKET, \
  --set-env-vars=WEAVIATE_SERVER=$WEAVIATE_SERVER, \
  --set-env-vars=WEAVIATE_API_KEY=$WEAVIATE_API_KEY \
  --service-account=$SERVICE_ACCOUNT_NAME
  
```

Navigate to the demo application via the service URL returned. You can use the same data below to create a new item:

```sh

        "title": "Project Sushi Tshirt",
        "category": "Clothing  accessories Tops  tees Tshirts",
        "Test image link": "https://shop.googlemerchandisestore.com/store/20190522377/assets/items/images/GGCPGXXX1338.jpg",

```
