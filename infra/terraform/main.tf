# 1) 必須API
locals {
  services = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "aiplatform.googleapis.com",
    "iam.googleapis.com",
    "firestore.googleapis.com",
  ]
}

resource "google_project_service" "services" {
  for_each           = toset(local.services)
  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

# 2) Artifact Registry（Docker）
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "omoshiro"
  description   = "container images for omoshiro antonym mvp"
  format        = "DOCKER"

  depends_on = [google_project_service.services]
}

# 3) Cloud Run用サービスアカウント => 手動で

# 4) Vertex AI呼び出し権限 => 手動で

# 5) Firestore（Native mode）
resource "google_firestore_database" "default" {
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.services]
}

# 6) Cloud Run サービス
resource "google_cloud_run_v2_service" "api" {
  name     = var.service_name
  location = var.region

  template {
    service_account = var.service_account_email

    containers {
      image = var.image

      # Cloud Run標準のPORT=8080を使うなら省略可
      env {
        name  = "PORT"
        value = "8080"
      }

      # あとでここにMODEL名などを入れていく
      # env { name="GEMINI_MODEL" value="..." }
    }
  }

  depends_on = [
    google_project_service.services
  ]
}

# 7) 公開（MVPは unauth でOK）
resource "google_cloud_run_v2_service_iam_member" "public" {
  count    = var.allow_unauthenticated ? 1 : 0
  name     = google_cloud_run_v2_service.api.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}