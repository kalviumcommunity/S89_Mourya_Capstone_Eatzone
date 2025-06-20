# Test multiple food categories
$uri = "http://localhost:4000/api/chatbot/chat"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🤖 Testing multiple food categories..." -ForegroundColor Green

# Test desserts
$body = @{
    message = "desserts"
    chatMode = "recommendation"
    userId = "test-user"
} | ConvertTo-Json

Write-Host "`n=== Testing: desserts ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test pizza
$body = @{
    message = "pizza"
    chatMode = "recommendation"
    userId = "test-user"
} | ConvertTo-Json

Write-Host "`n=== Testing: pizza ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test veg items
$body = @{
    message = "veg items"
    chatMode = "recommendation"
    userId = "test-user"
} | ConvertTo-Json

Write-Host "`n=== Testing: veg items ===" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
