# Configuration du provider Google Cloud
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

# Configuration du provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Variables
variable "project_id" {
  description = "ID du projet Google Cloud"
  type        = string
}

variable "region" {
  description = "Région Google Cloud"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "Zone Google Cloud"
  type        = string
  default     = "europe-west1-b"
}

variable "folder_structure" {
  description = "Structure de dossiers à créer"
  type        = list(string)
  default = [
    "raw/",
    "raw/adoptions/",
    "raw/refuges/", 
    "photos/"
  ]
}


# Génération d'un ID aléatoire pour éviter les conflits de noms
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Bucket pour stocker les données SPA
resource "google_storage_bucket" "spa_data_bucket" {
  name     = "data-spa-storage-${random_id.bucket_suffix.hex}"
  location = "EU"
  
  # Configuration pour données
  force_destroy = true
  
  # Versioning pour historique
  versioning {
    enabled = true
  }
  
  # Lifecycle pour gérer les coûts - Cold après 90 jours
  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }
  
  # Uniform bucket-level access
  uniform_bucket_level_access = true
  
  # Labels pour organisation
  labels = {
    environnement = "dev"
    projet        = "data-spa"
    type          = "storage"
  }
}

# Création dynamique des dossiers
resource "google_storage_bucket_object" "folders" {
  for_each = toset(var.folder_structure)
  
  name    = each.value
  bucket  = google_storage_bucket.spa_data_bucket.name
  content = " "
}

# Dataset BigQuery pour les données SPA
resource "google_bigquery_dataset" "spa_dataset" {
  dataset_id    = "SPA"
  friendly_name = "SPA Data Dataset"
  description   = "Dataset pour stocker e traiter les données issus de l'etraction des données SPA"
  location      = "EU"
  
  # Labels pour organisation
  labels = {
    environnement = "dev"
    projet        = "data-spa"
    type          = "bigquery"
  }
}


# Output
output "bucket_name" {
  description = "Nom du bucket créé"
  value       = google_storage_bucket.spa_data_bucket.name
}


# Output pour voir la structure créée
output "created_folders" {
  description = "Dossiers créés dans le bucket"
  value       = var.folder_structure
}

output "dataset_name" {
  description = "Nom du dataset BigQuery créé"
  value       = google_bigquery_dataset.spa_dataset.dataset_id
  
}