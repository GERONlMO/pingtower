package com.pingtower.control_tower.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

@Service
@Slf4j
public class TelegramService {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.chat-id}")
    private String chatId;

    private TelegramBot bot;

    @PostConstruct
    public void init() {
        if (botToken == null || botToken.equals("YOUR_TELEGRAM_BOT_TOKEN") || chatId == null || chatId.equals("YOUR_CHAT_ID")) {
            log.warn("Telegram bot token or chat ID is not configured. Telegram notifications will be disabled.");
            return;
        }
        
        try {
            bot = new TelegramBot();
            TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
            botsApi.registerBot(bot);
            log.info("Telegram bot initialized and registered successfully.");
        } catch (TelegramApiException e) {
            log.error("Failed to initialize or register Telegram bot", e);
        }
    }

    public void sendMessage(String text) {
        if (bot == null) {
            log.warn("Telegram bot is not initialized. Skipping message sending.");
            return;
        }

        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText(text);
        message.setParseMode("Markdown");

        try {
            bot.execute(message);
            log.info("Successfully sent Telegram notification.");
        } catch (TelegramApiException e) {
            log.error("Failed to send Telegram message", e);
        }
    }
    
    // Inner class for the bot itself
    private class TelegramBot extends TelegramLongPollingBot {

        @Override
        public String getBotUsername() {
            return "PingTowerBot"; // A nominal username
        }

        @Override
        public String getBotToken() {
            return botToken;
        }

        @Override
        public void onUpdateReceived(Update update) {
            // We don't need to receive messages, so this is left empty.
        }
    }
}
