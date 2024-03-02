-- migrate:up
ALTER TABLE components.component ADD COLUMN content JSONB;
DROP TABLE components.component_type_text;
DROP TABLE components.component_type_button;
DROP TABLE components.component_type_image;
DROP TABLE components.component_type_video;
DROP TABLE components.component_type_audio;
DROP TABLE components.component_type_accordion;

-- migrate:down