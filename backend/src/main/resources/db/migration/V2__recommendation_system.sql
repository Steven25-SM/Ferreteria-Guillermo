-- Historial de acciones de clientes (sin recoger datos identificativos ajenos a la sesión).
CREATE TABLE customer_interactions (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
 event_type VARCHAR(24) NOT NULL CHECK(event_type IN ('VIEW','SEARCH','CART_ADD','CART_REMOVE')),
 search_query VARCHAR(120),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_customer_interactions_user_time ON customer_interactions(user_id, created_at DESC);
CREATE TABLE recommendation_feedback (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 action VARCHAR(20) NOT NULL CHECK(action IN ('CLICK','DISMISS')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recommendation_feedback_user ON recommendation_feedback(user_id,created_at DESC);
CREATE TABLE product_ai_attributes (
 product_id BIGINT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
 tags TEXT NOT NULL DEFAULT '',
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE recommendation_cache (
 user_id BIGINT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
 result_json TEXT NOT NULL,
 expires_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
