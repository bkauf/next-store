locals {
  cluster_name = "cluster-${var.project_id}"
}
resource "google_service_account" "gke_sa" {
  account_id   = local.cluster_name
  display_name = "${local.cluster_name} Service Account"
  project      = var.project_id
}

resource "google_project_iam_binding" "metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"

  members = [
    "serviceAccount:${google_service_account.gke_sa.email}",
  ]
}

resource "google_project_iam_binding" "artifact_registry_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"

  members = [
    "serviceAccount:${google_service_account.gke_sa.email}",
  ]
}
module "gke" {
  source              = "terraform-google-modules/kubernetes-engine/google//modules/beta-public-cluster"
  version             = "30.1.0"
  project_id          = var.project_id
  name                = local.cluster_name
  region              = var.region
  zones               = ["${var.region}-a", "${var.region}-b", "${var.region}-f"]
  network             = module.vpc.network_name
  subnetwork          = module.vpc.subnets_names[0]
  ip_range_pods       = "pods-subnet"
  ip_range_services   = "svcs-subnet"
  deletion_protection = false
  node_pools = [
    {
      name               = "default-pool"
      machine_type       = "e2-medium"
      autoscaling        = false
      node_count = 1
      disk_size_gb       = 10
      service_account    = google_service_account.gke_sa.email
    },
  ]

  node_pools_oauth_scopes = {
    all = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  node_pools_labels = {
    all = {}

    default-node-pool = {
      default-node-pool = true
    }
  }
  node_pools_tags = {
    all = []

    default-node-pool = [
      "default-pool",
    ]
  }
}

