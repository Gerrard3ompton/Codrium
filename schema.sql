-- ─────────────────────────────────────────────
--  CODRIUM — schema.sql  (MySQL)
--  Run this against your MySQL instance using
--  MySQL Workbench, the mysql CLI, or any
--  MySQL-compatible client.
--
--  For local testing on Windows this targets
--  MySQL Server installed alongside SSMS.
--  When you move to Ubuntu Server, run the
--  same file — nothing changes.
-- ─────────────────────────────────────────────

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS codrium
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE codrium;

-- 2. Products table
CREATE TABLE IF NOT EXISTS products (
  id          VARCHAR(16)                                        NOT NULL,
  name        VARCHAR(80)                                        NOT NULL,
  description VARCHAR(400)                                           NULL,
  features    JSON                                                   NULL,
  status      ENUM('active','beta','coming-soon','deprecated')   NOT NULL DEFAULT 'active',
  created_at  DATETIME                                           NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Seed a sample product so the page is not empty on first load
INSERT IGNORE INTO products (id, name, description, features, status)
VALUES (
  'seed001',
  'Sample Product',
  'This is a placeholder product added during setup. Edit or delete it from the admin panel.',
  JSON_ARRAY('Feature one', 'Feature two', 'Feature three'),
  'active'
);
