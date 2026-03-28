-- Migration 003: Unique constraint on payment_events to prevent duplicate webhook processing
-- Fixes TOCTOU race in Koko webhook handler: concurrent webhooks for the same reference
-- can now only insert one completed/failed event per reference.

ALTER TABLE payment_events
  ADD CONSTRAINT uq_payment_events_ref_type
  UNIQUE (provider_reference, event_type);
