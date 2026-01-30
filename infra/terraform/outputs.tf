output "cloud_run_url" {
  value = google_cloud_run_v2_service.api.uri
}

output "artifact_repo" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
}

output "run_service_account" {
  value = google_service_account.run_sa.email
}