import logger from "../utils/logger.js";
import { query } from "./pool.js";

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  username          VARCHAR(30)   UNIQUE NOT NULL,
  email             VARCHAR(255)  UNIQUE NOT NULL,
  password_hash     VARCHAR(255),
  first_name        VARCHAR(50)   NOT NULL,
  last_name         VARCHAR(50)   NOT NULL,

  gender            VARCHAR(20),
  sexual_preference VARCHAR(20)   NOT NULL DEFAULT 'bisexual',
  biography         TEXT,

  fame_rating       DECIMAL(5,2)  NOT NULL DEFAULT 0,

  latitude          DECIMAL(9,6),
  longitude         DECIMAL(9,6),
  location_city     VARCHAR(100),

  is_verified       BOOLEAN       NOT NULL DEFAULT FALSE,
  is_online         BOOLEAN       NOT NULL DEFAULT FALSE,
  last_seen         TIMESTAMP     WITH TIME ZONE,

  oauth_provider    VARCHAR(30),
  oauth_id          VARCHAR(100),

  created_at        TIMESTAMP     WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP     WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_tokens (
  id         SERIAL       PRIMARY KEY,
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(255) UNIQUE NOT NULL,
  type       VARCHAR(30)  NOT NULL, -- 'verification' or 'reset'
  expires_at TIMESTAMP    WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP    WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
  id          SERIAL        PRIMARY KEY,
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename    VARCHAR(255)  NOT NULL,
  url         VARCHAR(255)  NOT NULL,
  order_index INTEGER       NOT NULL DEFAULT 0,
  created_at  TIMESTAMP     WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_picture_id INTEGER REFERENCES photos(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS tags (
  id   SERIAL      PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_tags (
  user_id UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (user_id, tag_id)
);

CREATE TABLE IF NOT EXISTS likes (
  liker_id   UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  liked_id   UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (liker_id, liked_id)
);

CREATE TABLE IF NOT EXISTS visits (
  visitor_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visited_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (visitor_id, visited_id)
);

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS reports (
  reporter_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason      TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (reporter_id, reported_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL    PRIMARY KEY,
  sender_id   UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT      NOT NULL,
  is_read     BOOLEAN   NOT NULL DEFAULT FALSE,
  sent_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL      PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(30) NOT NULL,
  from_id    UUID        REFERENCES users(id) ON DELETE SET NULL,
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP   WITH TIME ZONE DEFAULT NOW()
);

-- === Bonus: Dates table for scheduling meetups ===
CREATE TABLE IF NOT EXISTS dates (
  id           SERIAL      PRIMARY KEY,
  proposer_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP   WITH TIME ZONE NOT NULL,
  location     VARCHAR(255),
  status       VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMP   WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP   WITH TIME ZONE DEFAULT NOW()
);

-- indexes for performance
CREATE INDEX IF NOT EXISTS idx_photos_user_id         ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_id         ON likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_visits_visited_id      ON visits(visited_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver      ON messages(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_users_location         ON users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_fame             ON users(fame_rating DESC);
`;

(async () => {
  try {
    await query(schema);
    logger.info("Database migration completed successfully");
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Database migration failed");
    process.exit(1);
  }
})();
