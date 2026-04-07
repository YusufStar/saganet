# packages/kafka todos

## Scaffold
- [x] packages/kafka klasörü oluştur
- [x] package.json, tsconfig.json
- [x] kafkajs bağımlılığı

## Producer
- [x] KafkaProducerService yaz
- [x] Topic'e mesaj gönder (send)
- [ ] Batch gönderim desteği
- [ ] Retry + hata yönetimi
- [ ] Graceful shutdown (flush bekle)

## Consumer
- [x] KafkaConsumerService yaz
- [x] Consumer group yönetimi
- [x] Handler registry (topic → handler mapping)
- [ ] Manual commit (at-least-once)
- [ ] Graceful shutdown

## Outbox Relay
- [ ] OutboxRelayService yaz
- [ ] DB'den işlenmemiş outbox kayıtlarını çek
- [ ] Kafka'ya gönder → sent_at güncelle
- [ ] Polling interval konfigürasyonu
- [ ] Başarısız gönderimde retry sayacı

## Dead Letter Queue
- [ ] DLQ topic'i tanımla ({topic}.dlq)
- [ ] Max retry aşımında DLQ'ya yönlendir
- [ ] DLQ monitor/alert hazırlığı

## Schema & Serialization
- [x] Event envelope formatı (eventId, type, timestamp, payload)
- [x] JSON serializer/deserializer
- [ ] Schema versioning hazırlığı (Avro / JSON Schema — ilerleyen aşama)

## Config
- [ ] KafkaModule (NestJS dynamic module)
- [ ] Broker, client ID, group ID env'den al
- [ ] SSL / SASL konfigürasyonu (production)

## Observability
- [ ] Consumer lag metriği
- [ ] Publish/consume latency histogram
- [ ] DLQ mesaj sayısı metriği

## Tests
- [ ] Unit: producer, consumer, outbox relay
- [ ] Integration: kafkajs mock ile end-to-end
