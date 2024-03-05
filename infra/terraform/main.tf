# Enable APIs
module "project-services" {
  source     = "terraform-google-modules/project-factory/google//modules/project_services"
  version    = "~> 14.5"
  project_id = var.project_id
  activate_apis = [
    "compute.googleapis.com",
    "iam.googleapis.com",
    "container.googleapis.com",
    "artifactregistry.googleapis.com",
    "clouddeploy.googleapis.com"
  ]
}

# Create VPC and subnets
module "vpc" {
  source       = "terraform-google-modules/network/google"
  version      = "9.0.0"
  project_id   = var.project_id
  network_name = var.network_name
  routing_mode = "GLOBAL"
  subnets = [
    {
      subnet_name   = "subnet-primary"
      subnet_ip     = var.ip_range_subnet
      subnet_region = var.region
  }]
  secondary_ranges = {
    subnet-primary = [{
      range_name    = "pods-subnet"
      ip_cidr_range = var.ip_range_pods
      },
      {
        range_name    = "svcs-subnet"
        ip_cidr_range = var.ip_range_svcs
    }]
  }
}

