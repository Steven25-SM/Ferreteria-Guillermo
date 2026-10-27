import { api } from './api';
// Los fallos de analítica nunca deben impedir comprar o navegar.
export function trackInteraction(type, productId = null, query = null) {
  api.post('/interactions', { type, productId, query }).catch(() => {});
}
