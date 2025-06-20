# Test the improved chatbot with the specific scenario
$uri = "http://localhost:4000/api/chatbot/chat"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🤖 Testing Improved Eatzone Chatbot..." -ForegroundColor Green

# Test the specific scenario that was problematic
$testScenario = @(
    @{ message = "Something light"; description = "User asks for light food" },
    @{ message = "yes"; description = "User says yes to light food suggestions" },
    @{ message = "chicken"; description = "User specifically wants chicken" },
    @{ message = "desserts"; description = "User wants desserts" },
    @{ message = "recommend me food"; description = "General recommendation request" }
)

foreach ($test in $testScenario) {
    Write-Host "`n=== Testing: '$($test.message)' ($($test.description)) ===" -ForegroundColor Yellow
    
    $body = @{
        message = $test.message
        userId = "test-user"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
        Write-Host "✅ Response: $($response.reply)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 1000
}

Write-Host "`n🎉 Improved chatbot testing completed!" -ForegroundColor Green
