-- RingLink MVP full schema baseline
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role ENUM('wrestler','promotion','admin') NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email_verified_at TIMESTAMP NULL,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  INDEX idx_users_role(role)
);
CREATE TABLE wrestler_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  ring_name VARCHAR(120) NOT NULL,
  hometown VARCHAR(120) NULL,
  state CHAR(2) NULL,
  wrestling_style VARCHAR(120) NULL,
  match_types JSON NULL,
  gimmick TEXT NULL,
  travel_radius_miles SMALLINT UNSIGNED NULL,
  years_experience TINYINT UNSIGNED NULL,
  gender_division VARCHAR(80) NULL,
  booking_rate_min INT UNSIGNED NULL,
  booking_rate_max INT UNSIGNED NULL,
  social_links JSON NULL,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL, deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_wrestler_profiles_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_wrestlers_discovery(state, wrestling_style, years_experience),
  INDEX idx_wrestlers_rate(booking_rate_min, booking_rate_max)
);
CREATE TABLE promotion_profiles (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL UNIQUE,
 promotion_name VARCHAR(160) NOT NULL,
 city VARCHAR(120) NULL,
 state CHAR(2) NULL,
 branding JSON NULL,
 description TEXT NULL,
 created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL, deleted_at TIMESTAMP NULL,
 CONSTRAINT fk_promotion_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE events (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 promotion_profile_id BIGINT UNSIGNED NOT NULL,
 name VARCHAR(160) NOT NULL,
 starts_at DATETIME NOT NULL,
 venue VARCHAR(160) NULL,
 city VARCHAR(120) NULL,
 state CHAR(2) NULL,
 created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL, deleted_at TIMESTAMP NULL,
 CONSTRAINT fk_events_promotion FOREIGN KEY (promotion_profile_id) REFERENCES promotion_profiles(id),
 INDEX idx_events_start(starts_at)
);
CREATE TABLE submissions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 event_id BIGINT UNSIGNED NOT NULL,
 wrestler_profile_id BIGINT UNSIGNED NOT NULL,
 status ENUM('submitted','reviewing','interested','offer_sent','accepted','declined','booked','completed','cancelled') NOT NULL DEFAULT 'submitted',
 note TEXT NULL,
 created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
 CONSTRAINT fk_submissions_event FOREIGN KEY (event_id) REFERENCES events(id),
 CONSTRAINT fk_submissions_wrestler FOREIGN KEY (wrestler_profile_id) REFERENCES wrestler_profiles(id),
 UNIQUE KEY uniq_submission (event_id,wrestler_profile_id),
 INDEX idx_submissions_status(status)
);
CREATE TABLE bookings (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 submission_id BIGINT UNSIGNED NOT NULL UNIQUE,
 promotion_profile_id BIGINT UNSIGNED NOT NULL,
 wrestler_profile_id BIGINT UNSIGNED NOT NULL,
 status ENUM('pending','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
 fee_cents INT UNSIGNED NULL,
 booked_at DATETIME NULL,
 created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
 CONSTRAINT fk_bookings_submission FOREIGN KEY (submission_id) REFERENCES submissions(id),
 CONSTRAINT fk_bookings_promotion FOREIGN KEY (promotion_profile_id) REFERENCES promotion_profiles(id),
 CONSTRAINT fk_bookings_wrestler FOREIGN KEY (wrestler_profile_id) REFERENCES wrestler_profiles(id),
 INDEX idx_bookings_status(status)
);
CREATE TABLE conversations (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 booking_id BIGINT UNSIGNED NULL,
 created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
 CONSTRAINT fk_conversations_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
CREATE TABLE messages (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 conversation_id BIGINT UNSIGNED NOT NULL,
 sender_user_id BIGINT UNSIGNED NOT NULL,
 body TEXT NOT NULL,
 read_at TIMESTAMP NULL,
 created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
 CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id),
 CONSTRAINT fk_messages_sender FOREIGN KEY (sender_user_id) REFERENCES users(id),
 INDEX idx_messages_read(read_at)
);
CREATE TABLE media_links (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 wrestler_profile_id BIGINT UNSIGNED NOT NULL,
 media_type VARCHAR(40) NOT NULL,
 url VARCHAR(500) NOT NULL,
 sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
 created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
 CONSTRAINT fk_media_links_wrestler FOREIGN KEY (wrestler_profile_id) REFERENCES wrestler_profiles(id)
);
CREATE TABLE availability_windows (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 wrestler_profile_id BIGINT UNSIGNED NOT NULL,
 starts_at DATETIME NOT NULL,
 ends_at DATETIME NOT NULL,
 created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
 CONSTRAINT fk_availability_wrestler FOREIGN KEY (wrestler_profile_id) REFERENCES wrestler_profiles(id),
 INDEX idx_availability_window(starts_at, ends_at)
);
CREATE TABLE verified_booking_reviews (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 booking_id BIGINT UNSIGNED NOT NULL UNIQUE,
 promotion_profile_id BIGINT UNSIGNED NOT NULL,
 wrestler_profile_id BIGINT UNSIGNED NOT NULL,
 overall_rating TINYINT UNSIGNED NOT NULL,
 professionalism_rating TINYINT UNSIGNED NOT NULL,
 communication_rating TINYINT UNSIGNED NOT NULL,
 in_ring_rating TINYINT UNSIGNED NOT NULL,
 reliability_rating TINYINT UNSIGNED NOT NULL,
 crowd_reaction_rating TINYINT UNSIGNED NOT NULL,
 review_text TEXT NULL,
 moderation_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
 created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
 CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
 CONSTRAINT fk_reviews_promotion FOREIGN KEY (promotion_profile_id) REFERENCES promotion_profiles(id),
 CONSTRAINT fk_reviews_wrestler FOREIGN KEY (wrestler_profile_id) REFERENCES wrestler_profiles(id)
);
CREATE TABLE notifications (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 type VARCHAR(120) NOT NULL,
 payload JSON NOT NULL,
 read_at TIMESTAMP NULL,
 created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
 CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE saved_talent (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 promotion_profile_id BIGINT UNSIGNED NOT NULL,
 wrestler_profile_id BIGINT UNSIGNED NOT NULL,
 created_at TIMESTAMP NULL,
 UNIQUE KEY uniq_saved_talent (promotion_profile_id, wrestler_profile_id),
 CONSTRAINT fk_saved_promotion FOREIGN KEY (promotion_profile_id) REFERENCES promotion_profiles(id),
 CONSTRAINT fk_saved_wrestler FOREIGN KEY (wrestler_profile_id) REFERENCES wrestler_profiles(id)
);
CREATE TABLE audit_logs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 actor_user_id BIGINT UNSIGNED NOT NULL,
 auditable_type VARCHAR(120) NOT NULL,
 auditable_id BIGINT UNSIGNED NOT NULL,
 action VARCHAR(120) NOT NULL,
 from_state VARCHAR(60) NULL,
 to_state VARCHAR(60) NULL,
 payload JSON NULL,
 created_at TIMESTAMP NULL,
 CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id),
 INDEX idx_auditable_lookup(auditable_type, auditable_id)
);
