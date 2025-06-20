# Test all chatbot modes
$uri = "http://localhost:4000/api/chatbot/chat"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🤖 Testing all chatbot modes..." -ForegroundColor Green

# Test Support Mode
Write-Host "`n=== Testing SUPPORT Mode ===" -ForegroundColor Yellow

$body = @{
    message = "I want to track my order"
    chatMode = "support"
    userId = "test-user"
} | ConvertTo-Json

Write-Host "Query: 'I want to track my order'" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

$body = @{
    message = "How do I get a refund?"
    chatMode = "support"
    userId = "test-user"
} | ConvertTo-Json

Write-Host "`nQuery: 'How do I get a refund?'" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Feedback Mode
Write-Host "`n=== Testing FEEDBACK Mode ===" -ForegroundColor Yellow

$body = @{
    message = "The food was amazing!"
    chatMode = "feedback"
    userId = "test-user"
} | ConvertTo-Json

Write-Host "Query: 'The food was amazing!'" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

$body = @{
    message = "The delivery was very late"
    chatMode = "feedback"
    userId = "test-user"
} | ConvertTo-Json

Write-Host "`nQuery: 'The delivery was very late'" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Recommendation Mode
Write-Host "`n=== Testing RECOMMENDATION Mode ===" -ForegroundColor Yellow

$body = @{
    message = "chicken"
    chatMode = "recommendation"
    userId = "test-user"
} | ConvertTo-Json

Write-Host "Query: 'chicken'" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test General Conversation
Write-Host "`n=== Testing GENERAL Conversation ===" -ForegroundColor Yellow

$body = @{
    message = "Hello"
    userId = "test-user"
} | ConvertTo-Json

Write-Host "Query: 'Hello'" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

$body = @{
    message = "What is your menu?"
    userId = "test-user"
} | ConvertTo-Json

Write-Host "`nQuery: 'What is your menu?'" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 All mode testing completed!" -ForegroundColor Green
