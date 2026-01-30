terraform {
  backend "gcs" {
    bucket = "omoshiro-antonym-tfstate-omoshiro"
    prefix = "terraform/state"
  }
}