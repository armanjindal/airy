package co.airy.core.sources.twilio;

import co.airy.avro.communication.DeliveryState;
import co.airy.avro.communication.Message;
import co.airy.core.sources.twilio.dto.SendMessageRequest;
import co.airy.core.sources.twilio.services.Api;
import co.airy.log.AiryLoggerFactory;
import co.airy.spring.auth.IgnoreAuthPattern;
import co.airy.spring.web.filters.RequestLoggingIgnorePatterns;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twilio.exception.ApiException;
import org.slf4j.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.util.List;

import static co.airy.model.message.MessageRepository.updateDeliveryState;

@Component
public class Connector {
    private static final Logger log = AiryLoggerFactory.getLogger(Connector.class);

    private final Api api;
    private final ObjectMapper mapper = new ObjectMapper();

    Connector(Api api) {
        this.api = api;
    }

    public Message sendMessage(SendMessageRequest sendMessageRequest) {
        final Message message = sendMessageRequest.getMessage();
        final String from = sendMessageRequest.getChannel().getSourceChannelId();
        final String to = sendMessageRequest.getSourceConversationId();
        try {
            final JsonNode messageNode = mapper.readTree(message.getContent());
            api.sendMessage(from, to, messageNode.get("text").textValue());

            updateDeliveryState(message, DeliveryState.DELIVERED);
            return message;
        } catch (ApiException e) {
            log.error(String.format("Twilio Api Exception for SendMessageRequest:\n%s", sendMessageRequest), e);
        } catch (Exception e) {
            log.error(String.format("Failed to send a message to Twilio \n SendMessageRequest: %s", sendMessageRequest), e);
        }

        updateDeliveryState(message, DeliveryState.FAILED);
        return message;
    }

    @Bean
    public IgnoreAuthPattern ignoreAuthPattern() {
        return new IgnoreAuthPattern("/twilio");
    }

    @Bean
    public RequestLoggingIgnorePatterns requestLoggingIgnorePatterns() {
        return new RequestLoggingIgnorePatterns(List.of("/twilio"));
    }

}
