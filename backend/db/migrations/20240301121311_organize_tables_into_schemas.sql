-- migrate:up
CREATE SCHEMA auth;
CREATE SCHEMA components;
CREATE SCHEMA media;
CREATE SCHEMA website_structure;
CREATE SCHEMA tracking;

ALTER TABLE public.auth_user SET SCHEMA auth;
ALTER TABLE public.oauth_account SET SCHEMA auth;
ALTER TABLE public.user_session SET SCHEMA auth;

ALTER TABLE public.component SET SCHEMA components;
ALTER TABLE public.component_position SET SCHEMA components;
ALTER TABLE public.component_type_accordion SET SCHEMA components;
ALTER TABLE public.component_type_audio SET SCHEMA components;
ALTER TABLE public.component_type_button SET SCHEMA components;
ALTER TABLE public.component_type_image SET SCHEMA components;
ALTER TABLE public.component_type_text SET SCHEMA components;
ALTER TABLE public.component_type_video SET SCHEMA components;

ALTER TABLE public.media_asset SET SCHEMA media;

ALTER TABLE public.page SET SCHEMA website_structure;
ALTER TABLE public.website SET SCHEMA website_structure;

-- migrate:down