package com._x.TestRegister1.Config;

import javax.net.ssl.SSLException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {
    @Bean
    public WebClient.Builder webClientBuilder() {
        HttpClient httpClient = HttpClient.create()
                .secure(t -> {
                    try {
                        t.sslContext(SslContextBuilder.forClient()
                                .trustManager(InsecureTrustManagerFactory.INSTANCE)
                                .build());
                    } catch (SSLException e) {
                        throw new RuntimeException(e);
                    }
                });
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient));
    }

   
}
