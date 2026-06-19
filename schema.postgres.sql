-- ============================================================
--  RAÍCES — Schema PostgreSQL v1.0
--  Motor: PostgreSQL 17+ / Neon
--  Migrado desde querys.sql (MySQL 8.0) — 2026-06-19
--
--  Ejecutar directamente sobre neondb (la base ya existe en Neon).
--  No incluye DROP/CREATE DATABASE ni USE.
-- ============================================================


-- ============================================================
-- TIPOS ENUM
-- Deben crearse antes de las tablas que los referencian.
-- ============================================================

-- Tabla: users
CREATE TYPE user_role        AS ENUM ('worker', 'employer', 'both');
CREATE TYPE platform_section AS ENUM ('raices', 'semillas');

-- Tabla: user_documents
CREATE TYPE doc_type   AS ENUM ('NIE', 'TIE', 'passport', 'work_permit');
CREATE TYPE doc_status AS ENUM ('pending', 'approved', 'rejected');

-- Tablas: jobs, services
CREATE TYPE contract_type    AS ENUM ('full_time', 'part_time', 'temporary', 'freelance', 'internship');
CREATE TYPE listing_status   AS ENUM ('active', 'paused', 'closed');
CREATE TYPE service_type     AS ENUM ('personal', 'digital', 'tutoring', 'other');
CREATE TYPE service_modality AS ENUM ('in_person', 'remote', 'both');

-- Tabla: applications
CREATE TYPE application_status AS ENUM ('pending', 'viewed', 'contacted', 'rejected', 'hired');

-- Tabla: connections
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'blocked');

-- Tabla: posts
CREATE TYPE post_type    AS ENUM ('opportunity', 'experience', 'question', 'announcement');
CREATE TYPE post_section AS ENUM ('raices', 'semillas', 'both');

-- Tabla: notifications
CREATE TYPE notification_type AS ENUM (
    'new_message', 'new_application', 'application_update',
    'connection_request', 'connection_accepted', 'new_job_in_city',
    'doc_approved', 'doc_rejected', 'post_like', 'post_comment'
);
CREATE TYPE ref_type AS ENUM ('job', 'service', 'message', 'application', 'connection', 'post');

-- Tabla: admin_users
CREATE TYPE admin_role AS ENUM ('superadmin', 'moderator', 'support');

-- Tabla: embeddings (módulo agentes)
CREATE TYPE embedding_entity AS ENUM ('job', 'user', 'service');


-- ============================================================
-- 1. CITIES — catálogo de ciudades de España
-- ============================================================
CREATE TABLE cities (
    id         SMALLSERIAL  PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    region     VARCHAR(100),
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE cities IS 'Catálogo de ciudades de España donde opera Raíces';

CREATE INDEX idx_cities_name ON cities (name);


-- ============================================================
-- 2. COUNTRIES — catálogo de países de origen
-- ============================================================
CREATE TABLE countries (
    id         SMALLSERIAL  PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    iso_code   CHAR(2)      NOT NULL,
    flag_emoji VARCHAR(10),
    UNIQUE (iso_code)
);

COMMENT ON TABLE countries IS 'Países de origen de los usuarios';


-- ============================================================
-- 3. USERS — tabla central
-- ============================================================
CREATE TABLE users (
    id             UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(255)     NOT NULL,
    password_hash  VARCHAR(255)     NOT NULL,
    full_name      VARCHAR(150)     NOT NULL,
    phone_whatsapp VARCHAR(20),
    avatar_url     VARCHAR(500),
    country_id     SMALLINT,
    city_id        SMALLINT,
    role           user_role        NOT NULL DEFAULT 'worker',
    section        platform_section NOT NULL DEFAULT 'raices',
    is_active      BOOLEAN          NOT NULL DEFAULT TRUE,
    is_verified    BOOLEAN          NOT NULL DEFAULT FALSE,
    is_available   BOOLEAN          NOT NULL DEFAULT TRUE,
    bio            TEXT,
    last_login_at  TIMESTAMP        NULL,
    created_at     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email),
    CONSTRAINT fk_user_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_city    FOREIGN KEY (city_id)    REFERENCES cities(id)    ON DELETE SET NULL
);

COMMENT ON TABLE users IS 'Usuarios de la plataforma — Raíces y Semillas';

CREATE INDEX idx_users_city    ON users (city_id);
CREATE INDEX idx_users_role    ON users (role);
CREATE INDEX idx_users_section ON users (section);
CREATE INDEX idx_users_active  ON users (is_active);


-- ============================================================
-- 4. USER_DOCUMENTS — verificación de identidad
-- ============================================================
CREATE TABLE user_documents (
    id             SERIAL       PRIMARY KEY,
    user_id        UUID         NOT NULL,
    doc_type       doc_type     NOT NULL,
    doc_number     VARCHAR(50)  NOT NULL,
    expiry_year    SMALLINT,
    status         doc_status   NOT NULL DEFAULT 'pending',
    reviewed_by    UUID         NULL,
    reviewed_at    TIMESTAMP    NULL,
    rejection_note VARCHAR(500),
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE user_documents IS 'Documentos de identidad para verificación — número y estado, sin escáner';

CREATE INDEX idx_doc_user   ON user_documents (user_id);
CREATE INDEX idx_doc_status ON user_documents (status);


-- ============================================================
-- 5. SKILLS — catálogo de habilidades
-- ============================================================
CREATE TABLE skills (
    id   SMALLSERIAL  PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    UNIQUE (name)
);

COMMENT ON TABLE skills IS 'Catálogo de habilidades';


-- ============================================================
-- 5b. USER_SKILLS — habilidades del trabajador
-- ============================================================
CREATE TABLE user_skills (
    user_id  UUID     NOT NULL,
    skill_id SMALLINT NOT NULL,
    PRIMARY KEY (user_id, skill_id),
    CONSTRAINT fk_us_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_us_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

COMMENT ON TABLE user_skills IS 'Habilidades asignadas a cada usuario';


-- ============================================================
-- 6. SECTORS — sectores laborales
-- ============================================================
CREATE TABLE sectors (
    id   SMALLSERIAL  PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    UNIQUE (name)
);

COMMENT ON TABLE sectors IS 'Sectores laborales: hostelería, limpieza, construcción...';


-- ============================================================
-- 7. JOBS — oportunidades publicadas (sección Raíces)
-- ============================================================
CREATE TABLE jobs (
    id                 UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id        UUID           NOT NULL,
    city_id            SMALLINT       NOT NULL,
    sector_id          SMALLINT,
    title              VARCHAR(200)   NOT NULL,
    description        TEXT           NOT NULL,
    contract_type      contract_type  NOT NULL DEFAULT 'full_time',
    requires_nie       BOOLEAN        NOT NULL DEFAULT TRUE,
    vacancies          SMALLINT       NOT NULL DEFAULT 1,
    status             listing_status NOT NULL DEFAULT 'active',
    views_count        INTEGER        NOT NULL DEFAULT 0,
    applications_count INTEGER        NOT NULL DEFAULT 0,
    expires_at         DATE,
    created_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_employer FOREIGN KEY (employer_id) REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_job_city     FOREIGN KEY (city_id)     REFERENCES cities(id)  ON DELETE RESTRICT,
    CONSTRAINT fk_job_sector   FOREIGN KEY (sector_id)   REFERENCES sectors(id) ON DELETE SET NULL
);

COMMENT ON TABLE jobs IS 'Oportunidades laborales publicadas en Raíces';

CREATE INDEX idx_job_city     ON jobs (city_id);
CREATE INDEX idx_job_sector   ON jobs (sector_id);
CREATE INDEX idx_job_employer ON jobs (employer_id);
CREATE INDEX idx_job_status   ON jobs (status);
CREATE INDEX idx_job_created  ON jobs (created_at DESC);


-- ============================================================
-- 8. SERVICES — servicios entre personas (sección Semillas)
-- ============================================================
CREATE TABLE services (
    id           UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id  UUID             NOT NULL,
    city_id      SMALLINT         NOT NULL,
    title        VARCHAR(200)     NOT NULL,
    description  TEXT             NOT NULL,
    service_type service_type     NOT NULL DEFAULT 'personal',
    modality     service_modality NOT NULL DEFAULT 'in_person',
    price_info   VARCHAR(200),
    status       listing_status   NOT NULL DEFAULT 'active',
    views_count  INTEGER          NOT NULL DEFAULT 0,
    created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_svc_provider FOREIGN KEY (provider_id) REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_svc_city     FOREIGN KEY (city_id)     REFERENCES cities(id) ON DELETE RESTRICT
);

COMMENT ON TABLE services IS 'Servicios entre personas — sección Semillas';

CREATE INDEX idx_svc_city     ON services (city_id);
CREATE INDEX idx_svc_provider ON services (provider_id);
CREATE INDEX idx_svc_status   ON services (status);
CREATE INDEX idx_svc_type     ON services (service_type);


-- ============================================================
-- 9. APPLICATIONS — candidatura a un job
-- ============================================================
CREATE TABLE applications (
    id         SERIAL             PRIMARY KEY,
    job_id     UUID               NOT NULL,
    worker_id  UUID               NOT NULL,
    status     application_status NOT NULL DEFAULT 'pending',
    cover_note TEXT,
    created_at TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (job_id, worker_id),
    CONSTRAINT fk_app_job    FOREIGN KEY (job_id)    REFERENCES jobs(id)  ON DELETE CASCADE,
    CONSTRAINT fk_app_worker FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE applications IS 'Candidaturas de trabajadores a ofertas de empleo';

CREATE INDEX idx_app_job    ON applications (job_id);
CREATE INDEX idx_app_worker ON applications (worker_id);
CREATE INDEX idx_app_status ON applications (status);


-- ============================================================
-- 10. CONNECTIONS — red de contactos
-- ============================================================
CREATE TABLE connections (
    id           SERIAL            PRIMARY KEY,
    requester_id UUID              NOT NULL,
    addressee_id UUID              NOT NULL,
    status       connection_status NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (requester_id, addressee_id),
    CONSTRAINT fk_conn_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_conn_addressee FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE connections IS 'Red de conexiones entre usuarios';

CREATE INDEX idx_conn_addressee ON connections (addressee_id);
CREATE INDEX idx_conn_status    ON connections (status);


-- ============================================================
-- 11. CONVERSATIONS — mensajería interna
-- ============================================================
CREATE TABLE conversations (
    id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id       UUID      NOT NULL,
    user_b_id       UUID      NOT NULL,
    job_id          UUID      NULL,
    service_id      UUID      NULL,
    last_message_at TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_a_id, user_b_id),
    CONSTRAINT fk_conv_user_a  FOREIGN KEY (user_a_id)  REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_conv_user_b  FOREIGN KEY (user_b_id)  REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_conv_job     FOREIGN KEY (job_id)     REFERENCES jobs(id)     ON DELETE SET NULL,
    CONSTRAINT fk_conv_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

COMMENT ON TABLE conversations IS 'Conversaciones privadas entre dos usuarios';

CREATE INDEX idx_conv_user_a ON conversations (user_a_id);
CREATE INDEX idx_conv_user_b ON conversations (user_b_id);
CREATE INDEX idx_conv_last   ON conversations (last_message_at DESC);


-- ============================================================
-- 12. MESSAGES — mensajes dentro de una conversación
-- ============================================================
CREATE TABLE messages (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id UUID      NOT NULL,
    sender_id       UUID      NOT NULL,
    body            TEXT      NOT NULL,
    is_read         BOOLEAN   NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_conv   FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id)       REFERENCES users(id)         ON DELETE CASCADE
);

COMMENT ON TABLE messages IS 'Mensajes individuales dentro de una conversación';

CREATE INDEX idx_msg_conv   ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_msg_sender ON messages (sender_id);
CREATE INDEX idx_msg_unread ON messages (conversation_id, is_read);


-- ============================================================
-- 13. POSTS — publicaciones de comunidad (feed)
-- ============================================================
CREATE TABLE posts (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id      UUID         NOT NULL,
    city_id        SMALLINT,
    post_type      post_type    NOT NULL DEFAULT 'experience',
    content        TEXT         NOT NULL,
    section        post_section NOT NULL DEFAULT 'raices',
    likes_count    INTEGER      NOT NULL DEFAULT 0,
    comments_count INTEGER      NOT NULL DEFAULT 0,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_post_city   FOREIGN KEY (city_id)   REFERENCES cities(id) ON DELETE SET NULL
);

COMMENT ON TABLE posts IS 'Publicaciones de comunidad en el feed';

CREATE INDEX idx_post_author  ON posts (author_id);
CREATE INDEX idx_post_city    ON posts (city_id);
CREATE INDEX idx_post_section ON posts (section);
CREATE INDEX idx_post_created ON posts (created_at DESC);


-- ============================================================
-- 14. POST_LIKES — likes en publicaciones
-- ============================================================
CREATE TABLE post_likes (
    post_id    UUID      NOT NULL,
    user_id    UUID      NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE post_likes IS 'Likes en publicaciones del feed';


-- ============================================================
-- 15. POST_COMMENTS — comentarios en publicaciones
-- ============================================================
CREATE TABLE post_comments (
    id         SERIAL    PRIMARY KEY,
    post_id    UUID      NOT NULL,
    author_id  UUID      NOT NULL,
    body       TEXT      NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_post   FOREIGN KEY (post_id)   REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE post_comments IS 'Comentarios en publicaciones del feed';

CREATE INDEX idx_comment_post ON post_comments (post_id, created_at DESC);


-- ============================================================
-- 16. NOTIFICATIONS — centro de notificaciones
--
-- CORRECCIÓN: el original (querys.sql línea 310) tenía una
-- definición de columna duplicada por un error de edición:
--   is_read  BOOLEAN NOT NULL DEFAULT FALSE,  BOOLEAN NOT NULL DEFAULT FALSE,
-- Se corrige aquí a una sola definición válida.
--
-- NOTA: ref_id es VARCHAR(36) y no UUID porque puede referenciar
-- tanto entidades con UUID (jobs, services, posts) como entidades
-- con id entero (applications → SERIAL, connections → SERIAL,
-- messages → BIGSERIAL). VARCHAR(36) almacena ambos como texto.
-- ============================================================
CREATE TABLE notifications (
    id         BIGSERIAL         PRIMARY KEY,
    user_id    UUID              NOT NULL,
    type       notification_type NOT NULL,
    ref_type   ref_type          NULL,
    ref_id     VARCHAR(36)       NULL,
    title      VARCHAR(200)      NOT NULL,
    body       VARCHAR(500),
    is_read    BOOLEAN           NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE notifications IS 'Notificaciones del sistema para cada usuario';

CREATE INDEX idx_notif_user    ON notifications (user_id, is_read);
CREATE INDEX idx_notif_created ON notifications (created_at DESC);


-- ============================================================
-- 17. ADMIN_USERS — panel de administración
-- ============================================================
CREATE TABLE admin_users (
    id            SERIAL       PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(150) NOT NULL,
    role          admin_role   NOT NULL DEFAULT 'moderator',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email)
);

COMMENT ON TABLE admin_users IS 'Usuarios del panel de administración';


-- ============================================================
-- SEED DATA — datos iniciales
-- ============================================================

INSERT INTO cities (name, region) VALUES
    ('Madrid',          'Comunidad de Madrid'),
    ('Barcelona',       'Cataluña'),
    ('Valencia',        'Comunitat Valenciana'),
    ('Sevilla',         'Andalucía'),
    ('Zaragoza',        'Aragón'),
    ('Málaga',          'Andalucía'),
    ('Murcia',          'Región de Murcia'),
    ('Palma',           'Islas Baleares'),
    ('Las Palmas',      'Canarias'),
    ('Bilbao',          'País Vasco'),
    ('Vitoria-Gasteiz', 'País Vasco'),
    ('Alicante',        'Comunitat Valenciana'),
    ('Córdoba',         'Andalucía'),
    ('Valladolid',      'Castilla y León'),
    ('Vigo',            'Galicia'),
    ('Gijón',           'Asturias'),
    ('Granada',         'Andalucía'),
    ('A Coruña',        'Galicia'),
    ('San Sebastián',   'País Vasco'),
    ('Santander',       'Cantabria');

INSERT INTO countries (name, iso_code, flag_emoji) VALUES
    ('Colombia',             'CO', '🇨🇴'),
    ('México',               'MX', '🇲🇽'),
    ('Venezuela',            'VE', '🇻🇪'),
    ('Perú',                 'PE', '🇵🇪'),
    ('Ecuador',              'EC', '🇪🇨'),
    ('Argentina',            'AR', '🇦🇷'),
    ('Bolivia',              'BO', '🇧🇴'),
    ('Chile',                'CL', '🇨🇱'),
    ('Paraguay',             'PY', '🇵🇾'),
    ('Uruguay',              'UY', '🇺🇾'),
    ('Cuba',                 'CU', '🇨🇺'),
    ('República Dominicana', 'DO', '🇩🇴'),
    ('Honduras',             'HN', '🇭🇳'),
    ('Guatemala',            'GT', '🇬🇹'),
    ('El Salvador',          'SV', '🇸🇻'),
    ('Nicaragua',            'NI', '🇳🇮'),
    ('Costa Rica',           'CR', '🇨🇷'),
    ('Panamá',               'PA', '🇵🇦');

INSERT INTO sectors (name) VALUES
    ('Hostelería y restauración'),
    ('Limpieza y mantenimiento'),
    ('Construcción y obras'),
    ('Logística y almacén'),
    ('Cuidado de personas'),
    ('Comercio y ventas'),
    ('Agricultura'),
    ('Seguridad'),
    ('Administración'),
    ('Tecnología e IT'),
    ('Educación y formación'),
    ('Salud'),
    ('Marketing y comunicación'),
    ('Transporte'),
    ('Otros');

INSERT INTO skills (name) VALUES
    ('Atención al cliente'),
    ('Cocina'),
    ('Limpieza industrial'),
    ('Conducción'),
    ('Idioma inglés'),
    ('Idioma francés'),
    ('Redes sociales'),
    ('Diseño gráfico'),
    ('Contabilidad básica'),
    ('Cuidado de mayores'),
    ('Cuidado de niños'),
    ('Programación'),
    ('Electricidad'),
    ('Fontanería'),
    ('Soldadura'),
    ('Traducción e interpretación'),
    ('Carnet de manipulador de alimentos'),
    ('Trabajo en equipo'),
    ('Gestión de almacén'),
    ('Microsoft Office');

INSERT INTO admin_users (email, password_hash, full_name, role)
VALUES ('admin@hausseup.com', '$2b$12$CHANGE_THIS_HASH_IN_PRODUCTION', 'Admin Hausseup', 'superadmin');


-- ============================================================
-- TRIGGER set_updated_at
-- Función genérica que actualiza updated_at en cada UPDATE.
-- Se aplica a todas las tablas que tenían ON UPDATE CURRENT_TIMESTAMP
-- en MySQL: users, user_documents, jobs, services, applications,
-- connections, posts. También a agent_user_memory (tabla nueva).
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_documents_updated_at
    BEFORE UPDATE ON user_documents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- MÓDULO AGENTES — tablas adicionales
-- ============================================================

-- ----------------------------------------------------------
-- SAVED_JOBS — ofertas guardadas por un trabajador
-- ----------------------------------------------------------
CREATE TABLE saved_jobs (
    user_id    UUID      NOT NULL,
    job_id     UUID      NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_job  FOREIGN KEY (job_id)  REFERENCES jobs(id)  ON DELETE CASCADE
);

COMMENT ON TABLE saved_jobs IS 'Ofertas guardadas por un trabajador para revisar después';


-- ----------------------------------------------------------
-- AGENT_USER_MEMORY — memoria persistente del agente IA
-- ----------------------------------------------------------
CREATE TABLE agent_user_memory (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL,
    memory_key   VARCHAR(100) NOT NULL,
    memory_value TEXT         NOT NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, memory_key),
    CONSTRAINT fk_mem_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE agent_user_memory IS 'Memoria persistente del agente IA por usuario (clave-valor)';

CREATE INDEX idx_mem_user ON agent_user_memory (user_id);

CREATE TRIGGER trg_agent_memory_updated_at
    BEFORE UPDATE ON agent_user_memory
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ----------------------------------------------------------
-- EMBEDDINGS — vectores para búsqueda semántica
--
-- embedding se almacena como JSONB (array de floats).
-- Si en el futuro se habilita pgvector en Neon, migrar a:
--   embedding vector(1536)
-- con CREATE INDEX ... USING ivfflat o hnsw.
-- ----------------------------------------------------------
CREATE TABLE embeddings (
    id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type embedding_entity NOT NULL,
    entity_id   UUID             NOT NULL,
    model       VARCHAR(100)     NOT NULL DEFAULT 'text-embedding-3-small',
    embedding   JSONB            NOT NULL,
    created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (entity_type, entity_id, model)
);

COMMENT ON TABLE embeddings IS 'Embeddings vectoriales para búsqueda semántica de empleos y perfiles';

CREATE INDEX idx_emb_entity ON embeddings (entity_type, entity_id);
