# ── Amplify Hosting (Next.js SSR) ─────────────────────────────────────────────

resource "aws_iam_role" "amplify" {
  name = "qlcayxanh-amplify-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "amplify.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "amplify_admin" {
  role       = aws_iam_role.amplify.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

variable "github_access_token" {
  type      = string
  sensitive = true
}

resource "aws_amplify_app" "web" {
  name       = "qlcayxanh-web"
  repository = "https://github.com/NguyenHuuDinh135/225DAPM_Nhom9"
  platform   = "WEB_COMPUTE"

  access_token         = var.github_access_token
  iam_service_role_arn = aws_iam_role.amplify.arn

  build_spec = file("${path.module}/../../../amplify.yml")

  environment_variables = {
    NEXT_PUBLIC_API_URL        = "http://${aws_lb.api.dns_name}"
    AMPLIFY_MONOREPO_APP_ROOT = "frontend/apps/web"
    _CUSTOM_IMAGE             = "amplify:al2023"
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.web.id
  branch_name = "main"
  framework   = "Next.js - SSR"

  enable_auto_build = true

  environment_variables = {
    NEXT_PUBLIC_API_URL = "http://${aws_lb.api.dns_name}"
  }
}

output "amplify_app_url" {
  value = "https://main.${aws_amplify_app.web.id}.amplifyapp.com"
}
