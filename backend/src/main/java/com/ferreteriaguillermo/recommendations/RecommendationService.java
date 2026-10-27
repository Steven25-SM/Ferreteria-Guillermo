package com.ferreteriaguillermo.recommendations;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferreteriaguillermo.auth.UserRepository;
import com.ferreteriaguillermo.inventory.InventoryRepository;
import com.ferreteriaguillermo.products.Product;
import com.ferreteriaguillermo.products.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {
 private final JdbcTemplate db;
 private final UserRepository users;
 private final ProductRepository products;
 private final InventoryRepository inventory;
 private final ObjectMapper json;
 private final String key;
 private final String model;
 public RecommendationService(JdbcTemplate db, UserRepository users, ProductRepository products,
         InventoryRepository inventory, ObjectMapper json,
         @Value("${groq.api-key:}") String key, @Value("${groq.model:openai/gpt-oss-20b}") String model) {
  this.db=db; this.users=users; this.products=products; this.inventory=inventory;
  this.json=json; this.key=key; this.model=model;
 }
 public Long customerId(String email) {
  if(email==null) return null;
  return users.findByEmailIgnoreCase(email).filter(u -> "CUSTOMER".equals(u.role)).map(u->u.id).orElse(null);
 }
 @Transactional
 public void event(Long userId, String type, Long productId, String query) {
  if(userId==null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
  if(!Set.of("VIEW","SEARCH","CART_ADD","CART_REMOVE","WHATSAPP_INTENT").contains(type)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
  String q=query==null?"":query.strip();
  if(q.length()>120) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Búsqueda demasiado larga");
  if(type.equals("SEARCH")) { if(q.length()<2) return; productId=null; }
  else if(productId==null || products.findById(productId).filter(p->p.active).isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Producto inválido");
  // Evitar inflar métricas por refrescos; 30 minutos entre vistas iguales, 60 s entre búsquedas iguales.
  if(type.equals("VIEW") && !db.queryForList("SELECT id FROM customer_interactions WHERE user_id=? AND product_id=? AND event_type='VIEW' AND created_at > now()-interval '30 minutes' LIMIT 1",userId,productId).isEmpty()) return;
  if(type.equals("SEARCH") && !db.queryForList("SELECT id FROM customer_interactions WHERE user_id=? AND search_query=? AND event_type='SEARCH' AND created_at > now()-interval '60 seconds' LIMIT 1",userId,q).isEmpty()) return;
  // Una consulta de WhatsApp es intención declarada, nunca pago ni venta.
  // Evitar inflarla si el usuario vuelve a abrir WhatsApp con la misma lista.
  if(type.equals("WHATSAPP_INTENT") && !db.queryForList("SELECT id FROM customer_interactions WHERE user_id=? AND product_id=? AND event_type='WHATSAPP_INTENT' AND created_at > now()-interval '15 minutes' LIMIT 1",userId,productId).isEmpty()) return;
  db.update("INSERT INTO customer_interactions(user_id,product_id,event_type,search_query) VALUES(?,?,?,?)",userId,productId,type,type.equals("SEARCH")?q:null);
  db.update("DELETE FROM recommendation_cache WHERE user_id=?",userId);
 }
 @Transactional
 public void feedback(Long userId,Long productId,String action) {
  if(userId==null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
  if(productId==null || !Set.of("CLICK","DISMISS").contains(action) || !products.existsById(productId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
  db.update("INSERT INTO recommendation_feedback(user_id,product_id,action) VALUES(?,?,?)",userId,productId,action);
  db.update("DELETE FROM recommendation_cache WHERE user_id=?",userId);
 }
 public List<Product> bestSellers() {
  List<Long> ids=db.queryForList("""
   SELECT oi.product_id FROM order_items oi JOIN orders o ON o.id=oi.order_id
   JOIN products p ON p.id=oi.product_id JOIN inventory i ON i.product_id=p.id
   WHERE o.status IN ('COMPLETED','DELIVERED') AND p.active=true AND i.quantity>0
   GROUP BY oi.product_id ORDER BY SUM(oi.quantity) DESC LIMIT 4
   """,Long.class);
  return ordered(ids);
 }
 private List<Product> ordered(List<Long> ids) {
  Map<Long,Product> found=products.findAllById(ids).stream().filter(p->p.active).filter(p->inventory.findById(p.id).map(i->i.quantity>0).orElse(false)).collect(Collectors.toMap(p->p.id,p->p));
  return ids.stream().distinct().map(found::get).filter(Objects::nonNull).toList();
 }
 // Relaciones funcionales conservadoras. Nunca equiparar "misma categoría" con "lo necesita".
 // Son extensibles mediante product_ai_attributes.tags sin volver a entrenar un modelo.
 private static final Map<String,Set<String>> COMPLEMENTS=Map.of(
  "lock",Set.of("screw","screwdriver","lubricant"),
  "paint",Set.of("masking","sandpaper"),
  "switch",Set.of("screwdriver","electrical_tape","wire"),
  "outlet",Set.of("screwdriver","electrical_tape","wire"),
  "masking",Set.of("paint"),
  "spray",Set.of("masking","sandpaper"),
  "gloves",Set.of(),
  "glue",Set.of("masking"));
 private String normalize(String v) {
  return java.text.Normalizer.normalize(v==null?"":v,java.text.Normalizer.Form.NFD)
   .replaceAll("\\p{M}","").toLowerCase(Locale.ROOT);
 }
 private Set<String> concepts(Product p,String tags) {
  String t=normalize(p.name+" "+(p.description==null?"":p.description)+" "+(tags==null?"":tags));
  Set<String> c=new HashSet<>();
  if(t.matches(".*(chapa|cerradura|candado|cerrojo|pestillo).*"))c.add("lock");
  if(t.matches(".*(pintura|esmalte|aerosol).*"))c.add("paint");
  if(t.contains("spray") || t.contains("aerosol"))c.add("spray");
  if(t.matches(".*(masking|cinta de papel|cinta para pintar).*"))c.add("masking");
  if(t.matches(".*(lija|abrasiv).*"))c.add("sandpaper");
  if(t.matches(".*(destornillador|atornillador).*"))c.add("screwdriver");
  if(t.matches(".*(tornillo|tarugo|perno).*"))c.add("screw");
  if(t.matches(".*(lubricante|aceite multiuso|wd.?40).*"))c.add("lubricant");
  if(t.matches(".*(interruptor|conmutador).*"))c.add("switch");
  if(t.matches(".*(tomacorriente|enchufe|tomacorrientes).*"))c.add("outlet");
  if(t.matches(".*(cinta aislante|cinta electrica).*"))c.add("electrical_tape");
  if(t.matches(".*(cable|alambre electrico).*"))c.add("wire");
  if(t.matches(".*(guante).*"))c.add("gloves");
  if(t.matches(".*(pegamento|adhesivo|silicona).*"))c.add("glue");
  return c;
 }
 private double relatedness(Product source,Product target,Map<Long,Set<String>> types) {
  Set<String> a=types.getOrDefault(source.id,Set.of()),b=types.getOrDefault(target.id,Set.of());
  double relation=0;
  for(String x:a)for(String y:COMPLEMENTS.getOrDefault(x,Set.of()))if(b.contains(y))relation=Math.max(relation,1.0);
  return relation;
 }
 private Set<String> tokens(String s) {
  Set<String> out=new HashSet<>();
  for(String word:normalize(s).split("[^a-z0-9]+")) if(word.length()>3 && !Set.of("para","este","esta","producto","productos","sobre","quiero","tengo","consulta","consultado","comprado","color").contains(word))out.add(word);
  return out;
 }
 private double searchMatch(String query,Product target) {
  Set<String> words=tokens(query);
  if(words.isEmpty())return 0;
  Set<String> title=tokens(target.name);
  int matches=0;for(String w:words)if(title.contains(w))matches++;
  return (double)matches/words.size();
 }
 public List<Product> recommended(Long userId) {
  if(userId==null)return bestSellers();
  try {
   List<String> cached=db.queryForList("SELECT result_json FROM recommendation_cache WHERE user_id=? AND expires_at>now()",String.class,userId);
   if(!cached.isEmpty()){
    JsonNode saved=json.readTree(cached.get(0));List<Long> ids=new ArrayList<>();
    for(JsonNode n:saved)ids.add(n.asLong());
    return ordered(ids).stream().limit(4).toList();
   }
  }catch(Exception ignored){}
  List<Product> available=products.findByActiveTrueOrderByIdDesc().stream()
   .filter(p->inventory.findById(p.id).map(i->i.quantity>0).orElse(false)).toList();
  if(available.isEmpty())return List.of();
  Map<Long,Product> byId=available.stream().collect(Collectors.toMap(p->p.id,p->p));
  Map<Long,Product> all=products.findAll().stream().collect(Collectors.toMap(p->p.id,p->p));
  Map<Long,String> tags=new HashMap<>();
  for(Map<String,Object> m:db.queryForList("SELECT product_id,tags FROM product_ai_attributes"))
   tags.put(((Number)m.get("product_id")).longValue(),(String)m.get("tags"));
  Map<Long,Set<String>> types=new HashMap<>();
  for(Product p:all.values())types.put(p.id,concepts(p,tags.get(p.id)));
  List<Map<String,Object>> history=db.queryForList("""
    SELECT product_id,event_type,search_query,created_at FROM customer_interactions
    WHERE user_id=? AND created_at>now()-interval '60 days'
    ORDER BY created_at DESC LIMIT 100
    """,userId);
  List<Long> bought=db.queryForList("""
    SELECT DISTINCT oi.product_id FROM order_items oi JOIN orders o ON o.id=oi.order_id
    WHERE o.user_id=? AND o.status IN ('COMPLETED','DELIVERED')
    """,Long.class,userId);
  Set<Long> purchased=new HashSet<>(bought);
  Set<Long> dismissed=new HashSet<>(db.queryForList("""
    SELECT product_id FROM recommendation_feedback WHERE user_id=? AND action='DISMISS'
    AND created_at>now()-interval '30 days'
    """,Long.class,userId));
  Map<Long,Double> scores=new HashMap<>();
  List<String> context=new ArrayList<>();
  // Historial decreciente: un interés nuevo tiene más peso que una compra antigua.
  int count=0;
  for(var e:history){
   double recency=Math.max(.25,1.0-count++/140.0);
   String kind=(String)e.get("event_type");
   if("SEARCH".equals(kind)){
    String query=(String)e.get("search_query");if(query==null)continue;
    if(context.size()<12)context.add("Búsqueda reciente: "+query);
    for(Product target:available){double match=searchMatch(query,target);
     if(match>=.66)scores.merge(target.id,5*recency*match,Double::sum);
    }
    continue;
   }
   if(e.get("product_id")==null)continue;
   Long id=((Number)e.get("product_id")).longValue();
   Product source=all.get(id);if(source==null)continue;
   if("CART_REMOVE".equals(kind)){scores.merge(id,-8*recency,Double::sum);continue;}
   double weight=switch(kind){case "WHATSAPP_INTENT"->9;case "CART_ADD"->7;case "VIEW"->2;default->0;};
   if(weight==0)continue;
   if(context.size()<12)context.add(kind+": "+source.name);
   // El producto que interesa explícitamente puede mostrarse, salvo compras ya realizadas.
   scores.merge(id,weight*.55*recency,Double::sum);
   for(Product target:available)if(!target.id.equals(id)){
    double relation=relatedness(source,target,types);
    if(relation>0)scores.merge(target.id,weight*.7*recency*relation,Double::sum);
   }
  }
  // Compras: solo complementos verificables, nunca otras chapas porque compró una chapa.
  for(Long id:bought){
   Product source=all.get(id);if(source==null)continue;
   if(context.size()<12)context.add("Compra completada: "+source.name);
   for(Product target:available)if(!target.id.equals(id)){
    double relation=relatedness(source,target,types);
    if(relation>0)scores.merge(target.id,4*relation,Double::sum);
   }
  }
  List<Product> candidates=available.stream()
   .filter(p->!purchased.contains(p.id)&&!dismissed.contains(p.id))
   .filter(p->scores.getOrDefault(p.id,0d)>=1.3)
   .sorted(Comparator.<Product>comparingDouble(p->scores.getOrDefault(p.id,0d)).reversed())
   .limit(16).toList();
  List<Long> ids=candidates.stream().map(p->p.id).toList();
  // IA solo evalúa candidatos respaldados por señales y relaciones funcionales.
  List<Long> fromAi=groqRank(ids,byId,context);
  // Preferimos el reordenamiento validado de Groq; si falla, usamos clasificación local.
  List<Long> order=new ArrayList<>(fromAi);
  for(Long id:ids)if(!order.contains(id))order.add(id);
  List<Long> chosen=new ArrayList<>();Set<Long> categoriesUsed=new HashSet<>();
  for(Long id:order){Product p=byId.get(id);if(p!=null&&categoriesUsed.add(p.category.id))chosen.add(id);if(chosen.size()==4)break;}
  if(chosen.size()<4)for(Long id:order){if(chosen.size()==4)break;if(!chosen.contains(id))chosen.add(id);}
  try{db.update("""
    INSERT INTO recommendation_cache(user_id,result_json,expires_at) VALUES(?,?,now()+interval '10 minutes')
    ON CONFLICT(user_id) DO UPDATE SET result_json=EXCLUDED.result_json,
    expires_at=EXCLUDED.expires_at,updated_at=now()
    """,userId,json.writeValueAsString(chosen));}catch(Exception ignored){}
  return ordered(chosen);
 }
 private List<Long> groqRank(List<Long> ids,Map<Long,Product> productsById,List<String> interests) {
  if(key==null || key.isBlank() || ids.isEmpty()) return List.of();
  try {
   List<Map<String,Object>> catalog=new ArrayList<>();
   for(Long id:ids) {Product p=productsById.get(id);if(p!=null) catalog.add(Map.of("id",id,"name",p.name,"category",p.category.name,"description",p.description==null?"":p.description.substring(0,Math.min(p.description.length(),220))));}
   String prompt="Eres un recomendador de artículos de ferretería. Evalúa interés explícito reciente y complementariedad funcional real. Una chapa NO implica necesitar otra chapa ni guantes. Si la relación es dudosa puedes devolver menos de cuatro IDs. Nunca inventes productos. Devuelve SOLO JSON {\\\"ids\\\":[id1,id2,...]} con entre 0 y 4 IDs únicos tomados del catálogo. No recomiendes modelos alternativos de un producto ya comprado ni productos sin relación funcional. Intereses recientes: "+json.writeValueAsString(interests.stream().limit(12).toList())+". Catálogo: "+json.writeValueAsString(catalog);
   var payload=Map.of("model",model,"temperature",0.2,"max_completion_tokens",250,"messages",List.of(Map.of("role","user","content",prompt)));
   HttpRequest request=HttpRequest.newBuilder(URI.create("https://api.groq.com/openai/v1/chat/completions"))
    .timeout(Duration.ofSeconds(5)).header("Authorization","Bearer "+key).header("Content-Type","application/json")
    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload))).build();
   HttpResponse<String> r=HttpClient.newHttpClient().send(request,HttpResponse.BodyHandlers.ofString());
   if(r.statusCode()!=200) return List.of();
   String content=json.readTree(r.body()).path("choices").path(0).path("message").path("content").asText();
   JsonNode root=json.readTree(content); List<Long> result=new ArrayList<>();
   for(JsonNode node:root.path("ids")) {long id=node.asLong(-1); if(ids.contains(id)&&!result.contains(id))result.add(id);}
   return result;
  } catch(Exception ex) {return List.of();}
 }
}
