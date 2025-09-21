package com.pingtower.ping_worker.check.pool;

import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.openqa.selenium.WebDriver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebDriverPoolConfig {

    @Bean
    public GenericObjectPool<WebDriver> webDriverPool(WebDriverPoolFactory factory) {
        GenericObjectPoolConfig<WebDriver> config = new GenericObjectPoolConfig<>();
        config.setMaxTotal(4); // Max 4 concurrent browsers
        config.setMaxIdle(2);  // Keep 2 browsers ready
        config.setTestOnBorrow(true);
        config.setTestOnReturn(true);
        return new GenericObjectPool<>(factory, config);
    }
}
