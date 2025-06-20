# Test support without explicit mode
$uri = "http://localhost:4000/api/chatbot/chat"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Testing support query without explicit mode..." -ForegroundColor Green

$body = @{
    message = "I want to track my order"
    userId = "test-user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
