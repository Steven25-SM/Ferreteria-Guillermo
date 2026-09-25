package com.ferreteriaguillermo.service;

import com.ferreteriaguillermo.model.Quote;
import com.ferreteriaguillermo.model.QuoteItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.to}")
    private String destinationEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendQuoteNotification(Quote quote) {

        String products = buildProductsText(quote);

        // =========================================================
        // 1. CORREO PARA LA FERRETERÍA
        // =========================================================

        SimpleMailMessage adminMessage = new SimpleMailMessage();

        adminMessage.setTo(destinationEmail);
        adminMessage.setReplyTo(quote.getClientEmail());
        adminMessage.setSubject(
                "Nueva solicitud de cotización #" + quote.getId()
        );

        StringBuilder adminBody = new StringBuilder();

        adminBody.append("NUEVA SOLICITUD DE COTIZACIÓN\n");
        adminBody.append("================================\n\n");

        adminBody.append("Cliente: ")
                .append(quote.getClientName())
                .append("\n");

        adminBody.append("Correo: ")
                .append(quote.getClientEmail())
                .append("\n");

        adminBody.append("Teléfono: ")
                .append(quote.getClientPhone())
                .append("\n\n");

        adminBody.append("Mensaje:\n");

        if (quote.getMessage() != null && !quote.getMessage().isBlank()) {
            adminBody.append(quote.getMessage());
        } else {
            adminBody.append("Sin mensaje adicional.");
        }

        adminBody.append("\n\n");
        adminBody.append(products);

        adminBody.append("TOTAL REFERENCIAL: S/ ")
                .append(quote.getTotal())
                .append("\n");

        adminBody.append("\nCotización registrada con ID: ")
                .append(quote.getId());

        adminMessage.setText(adminBody.toString());

        mailSender.send(adminMessage);


        // =========================================================
        // 2. CORREO DE CONFIRMACIÓN PARA EL CLIENTE
        // =========================================================

        SimpleMailMessage clientMessage = new SimpleMailMessage();

        clientMessage.setTo(quote.getClientEmail());
        clientMessage.setReplyTo(destinationEmail);
        clientMessage.setSubject(
                "Solicitud de cotización recibida #" + quote.getId()
        );

        StringBuilder clientBody = new StringBuilder();

        clientBody.append("Hola ")
                .append(quote.getClientName())
                .append(",\n\n");

        clientBody.append(
                "Hemos recibido correctamente tu solicitud de cotización."
        );

        clientBody.append("\n\n");
        clientBody.append("DETALLE DE TU SOLICITUD\n");
        clientBody.append("================================\n\n");

        clientBody.append(products);

        clientBody.append("TOTAL REFERENCIAL: S/ ")
                .append(quote.getTotal())
                .append("\n\n");

        if (quote.getMessage() != null && !quote.getMessage().isBlank()) {
            clientBody.append("Tu mensaje:\n");
            clientBody.append(quote.getMessage());
            clientBody.append("\n\n");
        }

        clientBody.append(
                "Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo."
        );

        clientBody.append("\n\nSolicitud #")
                .append(quote.getId());

        clientBody.append("\n\nGracias por contactar con Ferretería Guillermo.");

        clientMessage.setText(clientBody.toString());

        mailSender.send(clientMessage);
    }

    private String buildProductsText(Quote quote) {

        StringBuilder body = new StringBuilder();

        body.append("PRODUCTOS\n");
        body.append("================================\n");

        for (QuoteItem item : quote.getItems()) {

            BigDecimal subtotal = item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            body.append("- ")
                    .append(item.getProduct().getName())
                    .append("\n");

            body.append("  Cantidad: ")
                    .append(item.getQuantity())
                    .append("\n");

            body.append("  Precio unitario: S/ ")
                    .append(item.getUnitPrice())
                    .append("\n");

            body.append("  Subtotal: S/ ")
                    .append(subtotal)
                    .append("\n\n");
        }

        return body.toString();
    }
}