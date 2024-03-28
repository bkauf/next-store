
# From RAG to autonomous apps with Weaviate and Gemini on Google Kubernetes Engine
![Next Demo Achitecture](https://github.com/bkauf/next-store/blob/main/diagram.png)


To Deploy this demo...


## Setup the Weaviate Vector Database

1. Deploy the GKE Cluster

1. Install Weaviate 

1. Get Weaviate Server IP

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

``

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