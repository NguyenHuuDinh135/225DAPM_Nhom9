$body = @{
    email = "test@test.com"
    password = "Test123!"
} | ConvertTo-Json

try {
    $r = Invoke-WebRequest -Uri "http://localhost:8080/api/Users/login?useCookies=false&useSessionCookies=false" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "Status:" $r.StatusCode
    Write-Host "Content:" $r.Content
} catch {
    Write-Host "Status:" $_.Exception.Response.StatusCode.Value__
    Write-Host "Message:" $_.Exception.Message
}