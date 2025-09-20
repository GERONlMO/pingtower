package com.pingtower.ping_worker.config;

import com.pingtower.ping_worker.scheduler.CheckReaderJob;
import org.quartz.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QuartzConfig {

    @Bean
    public JobDetail checkReaderJobDetail() {
        return JobBuilder.newJob(CheckReaderJob.class)
                .withIdentity("checkReaderJob")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger checkReaderJobTrigger(JobDetail checkReaderJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(checkReaderJobDetail)
                .withIdentity("checkReaderJobTrigger")
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withIntervalInSeconds(30)
                        .repeatForever())
                .build();
    }
}
