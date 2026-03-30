terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "gcp-hva-hbo-ict-prgr-1-481610"
  region  = "europe-west4"
}