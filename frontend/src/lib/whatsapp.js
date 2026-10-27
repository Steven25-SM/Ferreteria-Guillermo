// Configure VITE_WHATSAPP_PHONE in frontend/.env (country code + number, digits only).
export const whatsappPhone = String(import.meta.env.VITE_WHATSAPP_PHONE || '').replace(/\D/g, '');
export const whatsappReady = whatsappPhone.length >= 10 && whatsappPhone.length <= 15;

export function whatsappMessage(products = []) {
  if (!products.length) return 'Hola, tengo una consulta sobre sus productos.\n\nQuedo atento. Gracias.';
  const lines = products.map(p => `- ${p.name} x${Math.max(1, Number(p.quantity) || 1)}`);
  return ['Hola, me interesan estos productos:', '', ...lines, '', 'Quedo atento. Gracias.'].join('\n');
}
export function whatsappUrl(products = []) {
  if (!whatsappReady) return null;
  return `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(whatsappMessage(products))}`;
}
export function openWhatsApp(products = []) {
  const url = whatsappUrl(products);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
