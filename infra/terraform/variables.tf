variable "project_id" { 
    type = string 
}
variable "region"     { 
    type = string 
    default = "asia-northeast1" 
}
variable "service_name" { 
    type = string 
    default = "omoshiro-api" 
}

# Cloud Runが参照するコンテナイメージ
variable "image" { 
    type = string 
}

# MVPなので unauth を許す
variable "allow_unauthenticated" { 
    type = bool 
    default = true 
}

variable "service_account_email" {
  description = "Service Account email used by Cloud Run"
  type        = string
}