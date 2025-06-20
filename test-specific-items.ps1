# Test the chatbot with specific food item requests
$uri = "http://localhost:4000/api/chatbot/chat"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🤖 Testing Specific Food Item Requests..." -ForegroundColor Green

# Test the specific scenarios that were problematic
$testScenario = @(
    @{ message = "i want some chicken items"; description = "User wants chicken items" },
    @{ message = "meal"; description = "User wants meal options" },
    @{ message = "desserts"; description = "User wants desserts" },
    @{ message = "veg items"; description = "User wants veg items" },
    @{ message = "chicken"; description = "Simple chicken request" }
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
    
    Start-Sleep -Milliseconds 1500
}

Write-Host "`n🎉 Specific food item testing completed!" -ForegroundColor Green
