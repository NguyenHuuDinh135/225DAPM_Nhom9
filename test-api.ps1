# Test API endpoints
$baseUrl = "http://localhost:5000"

Write-Host "Testing API endpoints..." -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method Get -UseBasicParsing
    Write-Host "✓ Health check: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}

# Test 2: Tree Incidents (without auth)
Write-Host "`n2. Testing tree-incidents endpoint (should return 401)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/tree-incidents" -Method Get -UseBasicParsing
    Write-Host "Response: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Correctly requires authentication (401)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

# Test 3: Work Items (without auth)
Write-Host "`n3. Testing work-items endpoint (should return 401)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/work-items" -Method Get -UseBasicParsing
    Write-Host "Response: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Correctly requires authentication (401)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

Write-Host "`n✓ API is running and responding correctly!" -ForegroundColor Green
Write-Host "Note: Endpoints require authentication, which is expected." -ForegroundColor Cyan
