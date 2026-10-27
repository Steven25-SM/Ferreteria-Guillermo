-- Extiende el evento permitido sin alterar V2 ya ejecutada por Flyway.
ALTER TABLE customer_interactions DROP CONSTRAINT IF EXISTS customer_interactions_event_type_check;
ALTER TABLE customer_interactions ADD CONSTRAINT customer_interactions_event_type_check
  CHECK (event_type IN ('VIEW','SEARCH','CART_ADD','CART_REMOVE','WHATSAPP_INTENT'));
