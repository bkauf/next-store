variable "project_id" {
  description = "Project ID"
}

variable "network_name" {
  description = "VPC name"
  default     = "gke-vpc"
}

variable "region" {
  description = ""
}


variable "ip_range_subnet" {
  description = "value"
  default     = "10.10.0.0/20"
}

variable "ip_range_pods" {
  description = "value"
  default     = "10.11.0.0/18"
}

variable "ip_range_svcs" {
  description = "value"
  default     = "10.12.0.0/24"
}