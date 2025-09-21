package com.pingtower.ping_worker.check;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bonigarcia.wdm.WebDriverManager;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.Duration;

import org.apache.commons.pool2.impl.GenericObjectPool;

@Component
@Slf4j
public class BrowserCheckExecutor {

    private final ObjectMapper objectMapper;
    private final GenericObjectPool<WebDriver> webDriverPool;

    public BrowserCheckExecutor(ObjectMapper objectMapper, GenericObjectPool<WebDriver> webDriverPool) {
        this.objectMapper = objectMapper;
        this.webDriverPool = webDriverPool;
    }

    @PostConstruct
    public void setup() {
        log.info("Setting up Selenium WebDriverManager for Chrome...");
        try {
            WebDriverManager.chromedriver().setup();
            // Pre-warm the pool
            webDriverPool.addObject();
            log.info("WebDriverManager for Chrome setup and pool pre-warmed.");
        } catch (Exception e) {
            log.error("Failed to setup WebDriverManager for Chrome or pre-warm pool", e);
        }
    }

    public CheckResult execute(String configJson) {
        long startTime = System.currentTimeMillis();
        WebDriver driver = null;
        try {
            driver = webDriverPool.borrowObject(); // Get a browser from the pool

            JsonNode config = objectMapper.readTree(configJson);
            String url = config.get("url").asText();
            int timeout = config.has("timeout") ? config.get("timeout").asInt(30000) : 30000; // Default 30s for browser

            ChromeOptions options = new ChromeOptions();
            options.addArguments("--headless");
            options.addArguments("--disable-gpu");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--remote-allow-origins=*"); // Crucial for WebSocket connection
            options.addArguments("--disable-blink-features=AutomationControlled"); // Make it harder to detect automation

            // Performance optimizations to prevent renderer timeouts on heavy sites
            options.addArguments("--disable-extensions");
            options.addArguments("--disable-images");
            options.addArguments("--blink-settings=imagesEnabled=false");


            options.addArguments("--window-size=1920,1080");
            options.addArguments("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36");

            driver.manage().timeouts().pageLoadTimeout(Duration.ofMillis(timeout));

            log.info("Executing browser check for URL: {}", url);
            driver.get(url);

            // Wait for the body tag to be present, a better indicator of page load
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20)); // Wait up to 20 seconds
            wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName("body")));

            // Get DOM Content Loaded time via JavaScript
            JavascriptExecutor js = (JavascriptExecutor) driver;
            long domLoadTime = (long) js.executeScript(
                "return window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;"
            );

            long latency = System.currentTimeMillis() - startTime;
            String pageTitle = driver.getTitle();

            // Check for anti-bot pages
            if (isAntiBotPage(pageTitle)) {
                log.warn("Anti-bot page detected for URL '{}'. Title: '{}'", url, pageTitle);
                return CheckResult.builder()
                        .success(false)
                        .responseCode(403) // Use 403 Forbidden as a conventional code for this
                        .statusText("Blocked by Anti-bot")
                        .latencyMs(latency)
                        .details("Page title indicates an anti-bot challenge: " + pageTitle)
                        .build();
            }

            log.info("Browser check for URL '{}' successful. Page title: '{}'", url, pageTitle);

            return CheckResult.builder()
                    .success(true) // Explicitly set success to true
                    .responseCode(200) // Assuming 200 OK if page loads
                    .statusText("Page Loaded")
                    .latencyMs(latency)
                    .domLoadTimeMs(domLoadTime)
                    .details("Page loaded successfully. Title: " + pageTitle)
                    .build();

        } catch (Exception e) {
            long latency = System.currentTimeMillis() - startTime;
            log.error("Browser check for URL failed with exception: {}", e.getMessage());
            
            String statusText = e.getClass().getSimpleName();
            if (e instanceof org.openqa.selenium.TimeoutException) {
                statusText = "Timeout";
            }

            return CheckResult.builder()
                    .success(false)
                    .responseCode(0) // No specific code on timeout/error
                    .statusText(statusText)
                    .latencyMs(latency)
                    .errorMessage(e.getClass().getSimpleName() + ": " + e.getMessage())
                    .build();
        } finally {
            if (driver != null) {
                try {
                    // Reset state before returning to pool
                    driver.manage().deleteAllCookies();
                    driver.get("about:blank");
                    webDriverPool.returnObject(driver);
                } catch (Exception e) {
                    log.error("Failed to return WebDriver object to pool", e);
                    // To prevent a potentially broken driver from re-entering the pool
                    try {
                        webDriverPool.invalidateObject(driver);
                    } catch (Exception ex) {
                        log.error("Failed to invalidate WebDriver object", ex);
                    }
                }
            }
        }
    }

    private boolean isAntiBotPage(String title) {
        if (title == null || title.isEmpty()) {
            return false; // Cannot determine, assume it's not
        }
        String lowerTitle = title.toLowerCase();
        return lowerTitle.contains("antibot") ||
               lowerTitle.contains("challenge") ||
               lowerTitle.contains("защита от роботов") ||
               lowerTitle.contains("проверка") ||
               lowerTitle.contains("are you a robot");
    }
}
