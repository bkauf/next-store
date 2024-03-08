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
