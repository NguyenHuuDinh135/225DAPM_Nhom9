#!/bin/bash
export ASPNETCORE_ENVIRONMENT=Development
export DOTNET_ENVIRONMENT=Development
export ASPIRE_ALLOW_UNSECURED_TRANSPORT=true
export ASPIRE_DASHBOARD_ENABLED=false
export ASPNETCORE_URLS="http://localhost:15010"
export ASPIRE_DASHBOARD_OTLP_ENDPOINT_URL="http://localhost:19152"
export ASPIRE_DASHBOARD_OTLP_HTTP_ENDPOINT_URL="http://localhost:19153"
export DOTNET_DASHBOARD_OTLP_ENDPOINT_URL="http://localhost:19152"
export DOTNET_RESOURCE_SERVICE_ENDPOINT_URL="http://localhost:20152"

# Fix for Aspire 9.0+ complaining about missing OTLP vars even when disabled
export ASPIRE_DASHBOARD_OTLP_ENDPOINT_URL="http://localhost:18123"

cd backend/src/AppHost
dotnet run --no-launch-profile
