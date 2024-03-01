-- migrate:up
CREATE TYPE component_type AS ENUM ('text', 'button', 'image', 'video', 'audio', 'accordion');
CREATE TYPE asset_type AS ENUM ('image', 'video', 'audio');

CREATE TABLE component (
    id SERIAL PRIMARY KEY,
    type component_type NOT NULL,
    page_id INTEGER NOT NULL REFERENCES page(id) ON DELETE CASCADE,
    custom_style VARCHAR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE component_position (
    component_id INTEGER PRIMARY KEY REFERENCES component(id) ON DELETE CASCADE,
    grid_x INTEGER NOT NULL,
    grid_y INTEGER NOT NULL,
    grid_width INTEGER NOT NULL,
    grid_height INTEGER NOT NULL
);

CREATE TABLE component_type_text (
    component_id INTEGER PRIMARY KEY REFERENCES component(id) ON DELETE CASCADE,
    content VARCHAR NOT NULL
);

CREATE TABLE component_type_button (
    component_id INTEGER PRIMARY KEY REFERENCES component(id) ON DELETE CASCADE,
    label VARCHAR NOT NULL,
    hyperlink VARCHAR NOT NULL
);

create table media_asset (
    id SERIAL primary key,
    user_id VARCHAR not null references auth_user(id),
    asset_type asset_type not null,
    asset_name VARCHAR not null,
    asset_url VARCHAR not null,
    storage_path VARCHAR not null,
    mime_type VARCHAR not null,
    size INTEGER not null,
    pixel_width INTEGER,
    pixel_height INTEGER,
    created_at TIMESTAMPTZ not null default CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE TABLE component_type_image (
    component_id INTEGER PRIMARY KEY REFERENCES component(id) ON DELETE CASCADE,
    asset_id INTEGER NOT NULL REFERENCES media_asset(id),
    alt_text VARCHAR NOT NULL
);

CREATE TABLE component_type_video (
    component_id INTEGER PRIMARY KEY REFERENCES component(id) ON DELETE CASCADE,
    asset_id INTEGER NOT NULL REFERENCES media_asset(id),
    alt_text VARCHAR NOT NULL,
    is_looped BOOLEAN DEFAULT FALSE
);

CREATE TABLE component_type_audio (
    component_id INTEGER PRIMARY KEY REFERENCES component(id) ON DELETE CASCADE,
    asset_id INTEGER NOT NULL REFERENCES media_asset(id),
    alt_text VARCHAR NOT NULL,
    is_looped BOOLEAN DEFAULT FALSE
);

CREATE TABLE component_type_accordion (
    component_id INTEGER PRIMARY KEY REFERENCES component(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    content VARCHAR NOT NULL,
    isOpen BOOLEAN DEFAULT FALSE
);

-- migrate:down
DROP TYPE component_type;
DROP TYPE asset_type;
DROP TABLE component;
DROP TABLE component_position;
DROP TABLE component_type_text;
DROP TABLE component_type_button;
DROP TABLE media_asset;
DROP TABLE component_type_image;
DROP TABLE component_type_video;
DROP TABLE component_type_audio;
DROP TABLE component_type_accordion;