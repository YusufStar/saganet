# packages/kafka todos

## Scaffold
- [x] packages/kafka klasörü oluştur
- [x] package.json, tsconfig.json
- [x] kafkajs bağımlılığı

## Producer
- [x] KafkaProducerService yaz
- [x] Topic'e mesaj gönder (send)
- [x] Batch gönderim desteği
- [x] Retry + hata yönetimi
- [x] Graceful shutdown (flush bekle)

## Consumer
- [x] KafkaConsumerService yaz
- [x] Consumer group yönetimi
- [x] Handler registry (topic → handler mapping)
- [x] Manual commit (at-least-once)
- [x] Graceful shutdown

## Outbox Relay
- [x] OutboxRelayService yaz (her servis kendi OutboxRelayService'ini içerir — service-local pattern)
- [x] DB'den işlenmemiş outbox kayıtlarını çek
- [x] Kafka'ya gönder → sent_at güncelle
- [x] Polling interval konfigürasyonu
- [x] Başarısız gönderimde retry sayacı

## Dead Letter Queue
- [x] DLQ topic'i tanımla ({topic}.dlq)
- [x] Max retry aşımında DLQ'ya yönlendir
- [x] DLQ monitor/alert hazırlığı

## Schema & Serialization
- [x] Event envelope formatı (eventId, type, timestamp, payload)
- [x] JSON serializer/deserializer
- [ ] Schema versioning hazırlığı (Avro / JSON Schema — ilerleyen aşama)

## Config
- [x] KafkaModule (NestJS dynamic module)
- [x] Broker, client ID, group ID env'den al
- [ ] SSL / SASL konfigürasyonu (production)

## Observability
- [x] Consumer lag metriği
- [x] Publish/consume latency histogram
- [x] DLQ mesaj sayısı metriği

## Tests
- [x] Unit: producer, consumer, outbox relay
- [x] Integration: kafkajs mock ile end-to-end
