$apiUrl = "http://localhost:8082/api"
$headers = @{"Content-Type"="application/json"}

# --- Deleting ALL Old Data ---
Write-Host "--- Deleting all existing checks and services for a clean start ---"
try {
    $services = Invoke-RestMethod -Uri "$apiUrl/services" -Method GET
    foreach ($service in $services) {
        Write-Host "Deleting service: $($service.id)"
        $checks = Invoke-RestMethod -Uri "$apiUrl/checks" -Method GET | Where-Object { $_.serviceId -eq $service.id }
        foreach ($check in $checks) {
            Write-Host "  -> Deleting check: $($check.id)"
            Invoke-WebRequest -Uri "$apiUrl/checks/$($check.id)" -Method DELETE -ErrorAction SilentlyContinue
        }
        Invoke-WebRequest -Uri "$apiUrl/services/$($service.id)" -Method DELETE -ErrorAction SilentlyContinue
    }
    Write-Host "--- Cleanup complete ---"
} catch {
    Write-Host "Could not retrieve existing services, or none exist. Continuing to creation."
}

# --- Creating New Data ---
Write-Host "`n--- Creating test sites with HTTP/Browser and SSL monitoring ---"

$projectId = "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5"

$testData = @(
    # Major Russian Portals
    @{ Id="yandex"; Name="Yandex"; Env="search"; Url="https://ya.ru"; Mode="http" },
    @{ Id="mail"; Name="Mail.ru"; Env="portal"; Url="https://mail.ru"; Mode="http" },
    @{ Id="rambler"; Name="Rambler"; Env="portal"; Url="https://rambler.ru"; Mode="http" },
    
    # Social Networks
    @{ Id="vk"; Name="VKontakte"; Env="social"; Url="https://vk.com"; Mode="browser" },
    @{ Id="ok"; Name="Odnoklassniki"; Env="social"; Url="https://ok.ru"; Mode="browser" },
    @{ Id="telegram"; Name="Telegram Web"; Env="social"; Url="https://web.telegram.org"; Mode="browser" },
    
    # Marketplaces
    @{ Id="ozon"; Name="OZON"; Env="marketplace"; Url="https://ozon.ru"; Mode="browser" },
    @{ Id="wb"; Name="Wildberries"; Env="marketplace"; Url="https://wildberries.ru"; Mode="browser" },
    @{ Id="aliexpress"; Name="AliExpress"; Env="marketplace"; Url="https://aliexpress.ru"; Mode="browser" },
    
    # Banks
    @{ Id="sber"; Name="Sberbank"; Env="banking"; Url="https://sberbank.ru"; Mode="browser" },
    @{ Id="vtb"; Name="VTB Bank"; Env="banking"; Url="https://vtb.ru"; Mode="browser" },
    @{ Id="tinkoff"; Name="Tinkoff Bank"; Env="banking"; Url="https://tinkoff.ru"; Mode="browser" },
    
    # Government Services
    @{ Id="gosuslugi"; Name="Gosuslugi"; Env="gov"; Url="https://gosuslugi.ru"; Mode="browser" },
    @{ Id="mos"; Name="Mos.ru"; Env="gov"; Url="https://mos.ru"; Mode="browser" },
    @{ Id="nalog"; Name="FNS"; Env="gov"; Url="https://nalog.gov.ru"; Mode="browser" },
    
    # News Sites
    @{ Id="rbc"; Name="RBC"; Env="news"; Url="https://rbc.ru"; Mode="http" },
    @{ Id="ria"; Name="RIA Novosti"; Env="news"; Url="https://ria.ru"; Mode="http" },
    @{ Id="tass"; Name="TASS"; Env="news"; Url="https://tass.ru"; Mode="http" },
    
    # Tech Sites
    @{ Id="habr"; Name="Habr"; Env="tech"; Url="https://habr.com"; Mode="http" },
    @{ Id="github"; Name="GitHub"; Env="tech"; Url="https://github.com"; Mode="http" },
    @{ Id="stackoverflow"; Name="Stack Overflow"; Env="tech"; Url="https://stackoverflow.com"; Mode="http" },
    
    # Entertainment
    @{ Id="kinopoisk"; Name="Kinopoisk"; Env="entertainment"; Url="https://kinopoisk.ru"; Mode="browser" },
    @{ Id="ivi"; Name="IVI"; Env="entertainment"; Url="https://ivi.ru"; Mode="browser" },
    @{ Id="okko"; Name="OKKO"; Env="entertainment"; Url="https://okko.tv"; Mode="browser" },
    
    # Education
    @{ Id="coursera"; Name="Coursera"; Env="education"; Url="https://coursera.org"; Mode="http" },
    @{ Id="stepik"; Name="Stepik"; Env="education"; Url="https://stepik.org"; Mode="http" },
    @{ Id="wikipedia"; Name="Wikipedia RU"; Env="education"; Url="https://ru.wikipedia.org"; Mode="http" }
)

foreach ($site in $testData) {
    Write-Host "Creating service and checks for: $($site.Name)"
    
    # Create Service
    $serviceBody = [PSCustomObject]@{
        id = $site.Id
        name = $site.Name
        url = $site.Url
        environment = $site.Env
        projectId = $projectId
        intervalSec = 60
        timeoutSec = 5
        degradationThresholdMs = 2000
        enabled = $true
    } | ConvertTo-Json
    
    Invoke-WebRequest -Uri "$apiUrl/services" -Method POST -Headers $headers -Body $serviceBody -ErrorAction SilentlyContinue | Out-Null
    
    # Create HTTP/Browser Check
    $httpConfigObject = [PSCustomObject]@{
        url = $site.Url
        method = "GET"
        expected_code = 200
    }
    if ($site.Mode -eq "browser") {
        $httpConfigObject | Add-Member -MemberType NoteProperty -Name "check_mode" -Value "browser"
    }
    $httpCheckBody = [PSCustomObject]@{
        serviceId = $site.Id
        type = "HTTP"
        enabled = $true
        schedule = "*/30 * * * * ?"  # Every 30 seconds
        config = $httpConfigObject | ConvertTo-Json -Compress
    } | ConvertTo-Json
    
    Invoke-WebRequest -Uri "$apiUrl/checks" -Method POST -Headers $headers -Body $httpCheckBody | Out-Null
    
    # Create SSL Check
    $sslConfigObject = [PSCustomObject]@{
        url = $site.Url
    }
    $sslCheckBody = [PSCustomObject]@{
        serviceId = $site.Id
        type = "SSL"
        enabled = $true
        schedule = "0 0 12 * * ?"  # Once a day at noon
        config = $sslConfigObject | ConvertTo-Json -Compress
    } | ConvertTo-Json
    
    Invoke-WebRequest -Uri "$apiUrl/checks" -Method POST -Headers $headers -Body $sslCheckBody | Out-Null
}

Write-Host "`n--- Test services with HTTP/Browser and SSL checks created successfully! ---"