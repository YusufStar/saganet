export interface KafkaEvent<T = unknown> {
  eventId: string;
  type: string;
  timestamp: string;
  payload: T;
}
