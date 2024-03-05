resource "google_artifact_registry_repository" "repo" {
  location      = "us-central1"
  repository_id = "demo"
  description   = "docker repository for Next demo"
  format        = "DOCKER"
  project = var.project_id
  docker_config {
    immutable_tags = false
  }
}