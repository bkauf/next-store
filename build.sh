#!/usr/bin/env bash

# Verify that the scripts are being run from Linux and not Mac
if [[ $OSTYPE != "linux-gnu" ]]; then
    echo -e "\e[91mERROR: This script has only been tested on Linux. Currently, only Linux (debian) is supported. Please run in Cloud Shell or in a VM running Linux".
    exit;
fi

# Export a SCRIPT_DIR var and make all links relative to SCRIPT_DIR
export SCRIPT_DIR=$(dirname $(readlink -f $0 2>/dev/null) 2>/dev/null || echo "${PWD}/$(dirname $0)")

usage()
{
   echo ""
   echo "Usage: $0"
   echo -e "\tExample usage to start a new install from scratch:"
   echo -e "\t./build.sh --PALM_API_KEY=<PALM_API_KEY> --region=<REGION>"
   echo -e "\tExample usage to refresh an exisiting install after the infra has already been created:"
   echo -e "\t./build.sh --PALM_API_KEY=<PALM_API_KEY> --quick"
   echo -e "\tExample usage to delete the entire install"
   echo -e "\t./build.sh ---delete"
   exit 1 # Exit script after printing help
}

destroy()
{
    echo -e "\e[95mSetting DESTROY var to 'true'...\e[0m"
    DESTROY=true
}

quick()
{
    echo -e "\e[95mSetting QUICK var to 'false'...\e[0m"
    QUICK=true
}

# Setting default value
unset DESTROY
unset QUICK
REGION=us-central1

# Define bash args
while [ "$1" != "" ]; do
    case $1 in
        --region | -r )        shift
                                REGION=$1
                                ;;
        --palm-key | -k)      shift
                                PALM_API_KEY=$1
                                ;;
        --destroy | -d )      shift
                                destroy
                                ;;
        --quick | -q )          shift
                                quick
                                ;;
        --help | -h )           usage
                                exit
    esac
    shift
done

# Set project to PROJECT_ID or exit
[[ ! "${PROJECT_ID}" ]] && echo -e "Please export PROJECT_ID variable (\e[95mexport PROJECT_ID=<YOUR PROJECT ID>\e[0m)\nExiting." && exit 0
[[ ! "${PALM_API_KEY}" ]] && echo -e "Please export the PALM_API_KEY variable (\e[95mexport PALM_API_KEY=<YOUR PALM API KEY>\e[0m)\nExiting." && exit 0

echo -e "\e[95mPROJECT_ID is set to ${PROJECT_ID}\e[0m"
gcloud config set core/project ${PROJECT_ID}
echo -e "\e[95mREGION is set to ${REGION}\e[0m"
echo -e "\e[95mPALM_API_KEY is set to ${PALM_API_KEY}\e[0m"

# Enable Cloudbuild API
echo -e "\e[95mEnabling minimal APIs in ${PROJECT_ID}\e[0m"
gcloud services enable cloudbuild.googleapis.com storage.googleapis.com serviceusage.googleapis.com cloudresourcemanager.googleapis.com

# Make cloudbiuld SA roles/owner for PROJECT_ID
# TODO: Make these permissions more granular to precisely what is required by cloudbuild
echo -e "\e[95mAssigning Cloudbuild Service Account roles/owner in ${PROJECT_ID}\e[0m"
export PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format 'value(projectNumber)')
gcloud projects add-iam-policy-binding ${PROJECT_ID} --member serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com --role roles/owner

# Create GCS Bucket for terraform state
[[ "${DESTROY}" != "true" ]] && \
[[ "${QUICK}" != "true" ]] && \
echo -e "\e[95mCreating GCS Bucket called ${PROJECT_ID} to store terraform state files.\e[0m" && \
      ([[ $(gsutil ls | grep "gs://${_PROJECT_ID}/") ]] || \
      gsutil mb -p ${PROJECT_ID} gs://${_PROJECT_ID}) && \
      ([[ $(gsutil versioning get gs://${PROJECT_ID} | grep Enabled) ]] || \
      gsutil versioning set on gs://${PROJECT_ID}) 

# Create HELM BUILDER
[[ "${DESTROY}" != "true" ]] && \
[[ "${QUICK}" != "true" ]] && \
echo -e "\e[95mCreating Helm Builder...\e[0m" && gcloud builds submit --config=infra/builds/build_helm_builder.yaml --substitutions=_PROJECT_ID=${PROJECT_ID}

# Start terraform 
[[ "${DESTROY}" != "true" ]] && \
[[ "${QUICK}" != "true" ]] && \
 echo -e "\e[95mStarting Terraform to CREATE infrastructure...\e[0m" && gcloud builds submit --config=infra/builds/create_infra_terraform.yaml --substitutions=_PROJECT_ID=${PROJECT_ID},_REGION=${REGION}

# Install WEAVIATE HELM CHART
[[ "${DESTROY}" != "true" ]] && \
echo -e "\e[95mDeploy Weaviate Helm Chart...\e[0m" && gcloud builds submit --config=infra/builds/deploy_weaviate.yaml \
--substitutions=_PROJECT_ID=${PROJECT_ID},_REGION=${REGION},_CLUSTER_NAME=cluster-${PROJECT_ID},_PALM_API_KEY=${PALM_API_KEY}

# Create and deploy chatbot
[[ "${DESTROY}" != "true" ]] && echo -e "\e[95mDeploy ChatBot...\e[0m" && gcloud builds submit --config=infra/builds/deploy_chatbot.yaml --substitutions=_PROJECT_ID=${PROJECT_ID},_REPO_URL=${REGION}-docker.pkg.dev
