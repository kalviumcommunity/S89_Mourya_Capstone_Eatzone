# Test intent detection debugging
$uri = "http://localhost:4000/api/chatbot/chat"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "🔍 Testing intent detection..." -ForegroundColor Green

# Test problematic queries
$testQueries = @(
    @{ message = "I want to track my order"; mode = "support" },
    @{ message = "The food was amazing!"; mode = "feedback" },
    @{ message = "chicken"; mode = "recommendation" }
)

foreach ($test in $testQueries) {
    Write-Host "`n=== Testing: '$($test.message)' (Expected: $($test.mode)) ===" -ForegroundColor Yellow
    
    $body = @{
        message = $test.message
        chatMode = $test.mode
        userId = "test-user"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
        Write-Host "Response: $($response.reply.Substring(0, [Math]::Min(100, $response.reply.Length)))..." -ForegroundColor Green
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
