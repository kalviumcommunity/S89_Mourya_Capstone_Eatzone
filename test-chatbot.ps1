# PowerShell script to test the chatbot
$uri = "http://localhost:4000/api/chatbot/chat"
$headers = @{
    "Content-Type" = "application/json"
}

$testMessages = @(
    "hello",
    "recommend chicken",
    "desserts",
    "how to order",
    "refund",
    "delivery time"
)

Write-Host "🤖 Testing Eatzone Chatbot..." -ForegroundColor Green

foreach ($message in $testMessages) {
    Write-Host "`n=== Testing: '$message' ===" -ForegroundColor Yellow
    
    $body = @{
        message = $message
        userId = "test-user"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
        Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "`n🎉 Chatbot testing completed!" -ForegroundColor Green
