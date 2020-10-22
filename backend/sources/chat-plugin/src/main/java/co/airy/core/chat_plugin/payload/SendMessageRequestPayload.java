package co.airy.core.chat_plugin.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
public class SendMessageRequestPayload {
    public MessagePayload message;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessagePayload {
        @NotBlank
        public String text;
    }
}
