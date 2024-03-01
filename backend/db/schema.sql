SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: components; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA components;


--
-- Name: media; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA media;


--
-- Name: tracking; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA tracking;


--
-- Name: website_structure; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA website_structure;


--
-- Name: asset_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.asset_type AS ENUM (
    'image',
    'video',
    'audio'
);


--
-- Name: component_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.component_type AS ENUM (
    'text',
    'button',
    'image',
    'video',
    'audio',
    'accordion'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_user; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.auth_user (
    id character varying NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL
);


--
-- Name: oauth_account; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_account (
    provider_id character varying NOT NULL,
    provider_user_id character varying NOT NULL,
    user_id character varying NOT NULL
);


--
-- Name: user_session; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.user_session (
    id character varying NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    user_id character varying NOT NULL
);


--
-- Name: component; Type: TABLE; Schema: components; Owner: -
--

CREATE TABLE components.component (
    id integer NOT NULL,
    type public.component_type NOT NULL,
    page_id integer NOT NULL,
    custom_style character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: component_id_seq; Type: SEQUENCE; Schema: components; Owner: -
--

CREATE SEQUENCE components.component_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: component_id_seq; Type: SEQUENCE OWNED BY; Schema: components; Owner: -
--

ALTER SEQUENCE components.component_id_seq OWNED BY components.component.id;


--
-- Name: component_position; Type: TABLE; Schema: components; Owner: -
--

CREATE TABLE components.component_position (
    component_id integer NOT NULL,
    grid_x integer NOT NULL,
    grid_y integer NOT NULL,
    grid_width integer NOT NULL,
    grid_height integer NOT NULL
);


--
-- Name: component_type_accordion; Type: TABLE; Schema: components; Owner: -
--

CREATE TABLE components.component_type_accordion (
    component_id integer NOT NULL,
    title character varying NOT NULL,
    content character varying NOT NULL,
    isopen boolean DEFAULT false
);


--
-- Name: component_type_audio; Type: TABLE; Schema: components; Owner: -
--

CREATE TABLE components.component_type_audio (
    component_id integer NOT NULL,
    asset_id integer NOT NULL,
    alt_text character varying NOT NULL,
    is_looped boolean DEFAULT false
);


--
-- Name: component_type_button; Type: TABLE; Schema: components; Owner: -
--

CREATE TABLE components.component_type_button (
    component_id integer NOT NULL,
    label character varying NOT NULL,
    hyperlink character varying NOT NULL
);


--
-- Name: component_type_image; Type: TABLE; Schema: components; Owner: -
--

CREATE TABLE components.component_type_image (
    component_id integer NOT NULL,
    asset_id integer NOT NULL,
    alt_text character varying NOT NULL
);


--
-- Name: component_type_text; Type: TABLE; Schema: components; Owner: -
--

CREATE TABLE components.component_type_text (
    component_id integer NOT NULL,
    content character varying NOT NULL
);


--
-- Name: component_type_video; Type: TABLE; Schema: components; Owner: -
--

CREATE TABLE components.component_type_video (
    component_id integer NOT NULL,
    asset_id integer NOT NULL,
    alt_text character varying NOT NULL,
    is_looped boolean DEFAULT false
);


--
-- Name: media_asset; Type: TABLE; Schema: media; Owner: -
--

CREATE TABLE media.media_asset (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    asset_type public.asset_type NOT NULL,
    asset_name character varying NOT NULL,
    asset_url character varying NOT NULL,
    storage_path character varying NOT NULL,
    mime_type character varying NOT NULL,
    size integer NOT NULL,
    pixel_width integer,
    pixel_height integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: media_asset_id_seq; Type: SEQUENCE; Schema: media; Owner: -
--

CREATE SEQUENCE media.media_asset_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_asset_id_seq; Type: SEQUENCE OWNED BY; Schema: media; Owner: -
--

ALTER SEQUENCE media.media_asset_id_seq OWNED BY media.media_asset.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: page; Type: TABLE; Schema: website_structure; Owner: -
--

CREATE TABLE website_structure.page (
    id integer NOT NULL,
    website_id integer NOT NULL,
    route character varying NOT NULL,
    title character varying,
    meta_description character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: page_id_seq; Type: SEQUENCE; Schema: website_structure; Owner: -
--

CREATE SEQUENCE website_structure.page_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: page_id_seq; Type: SEQUENCE OWNED BY; Schema: website_structure; Owner: -
--

ALTER SEQUENCE website_structure.page_id_seq OWNED BY website_structure.page.id;


--
-- Name: website; Type: TABLE; Schema: website_structure; Owner: -
--

CREATE TABLE website_structure.website (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    title character varying NOT NULL,
    meta_description character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: website_id_seq; Type: SEQUENCE; Schema: website_structure; Owner: -
--

CREATE SEQUENCE website_structure.website_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: website_id_seq; Type: SEQUENCE OWNED BY; Schema: website_structure; Owner: -
--

ALTER SEQUENCE website_structure.website_id_seq OWNED BY website_structure.website.id;


--
-- Name: component id; Type: DEFAULT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component ALTER COLUMN id SET DEFAULT nextval('components.component_id_seq'::regclass);


--
-- Name: media_asset id; Type: DEFAULT; Schema: media; Owner: -
--

ALTER TABLE ONLY media.media_asset ALTER COLUMN id SET DEFAULT nextval('media.media_asset_id_seq'::regclass);


--
-- Name: page id; Type: DEFAULT; Schema: website_structure; Owner: -
--

ALTER TABLE ONLY website_structure.page ALTER COLUMN id SET DEFAULT nextval('website_structure.page_id_seq'::regclass);


--
-- Name: website id; Type: DEFAULT; Schema: website_structure; Owner: -
--

ALTER TABLE ONLY website_structure.website ALTER COLUMN id SET DEFAULT nextval('website_structure.website_id_seq'::regclass);


--
-- Name: auth_user auth_user_email_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.auth_user
    ADD CONSTRAINT auth_user_email_key UNIQUE (email);


--
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- Name: oauth_account oauth_account_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_account
    ADD CONSTRAINT oauth_account_pkey PRIMARY KEY (provider_id, provider_user_id);


--
-- Name: user_session user_session_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.user_session
    ADD CONSTRAINT user_session_pkey PRIMARY KEY (id);


--
-- Name: component component_pkey; Type: CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component
    ADD CONSTRAINT component_pkey PRIMARY KEY (id);


--
-- Name: component_position component_position_pkey; Type: CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_position
    ADD CONSTRAINT component_position_pkey PRIMARY KEY (component_id);


--
-- Name: component_type_accordion component_type_accordion_pkey; Type: CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_accordion
    ADD CONSTRAINT component_type_accordion_pkey PRIMARY KEY (component_id);


--
-- Name: component_type_audio component_type_audio_pkey; Type: CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_audio
    ADD CONSTRAINT component_type_audio_pkey PRIMARY KEY (component_id);


--
-- Name: component_type_button component_type_button_pkey; Type: CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_button
    ADD CONSTRAINT component_type_button_pkey PRIMARY KEY (component_id);


--
-- Name: component_type_image component_type_image_pkey; Type: CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_image
    ADD CONSTRAINT component_type_image_pkey PRIMARY KEY (component_id);


--
-- Name: component_type_text component_type_text_pkey; Type: CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_text
    ADD CONSTRAINT component_type_text_pkey PRIMARY KEY (component_id);


--
-- Name: component_type_video component_type_video_pkey; Type: CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_video
    ADD CONSTRAINT component_type_video_pkey PRIMARY KEY (component_id);


--
-- Name: media_asset media_asset_pkey; Type: CONSTRAINT; Schema: media; Owner: -
--

ALTER TABLE ONLY media.media_asset
    ADD CONSTRAINT media_asset_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: page page_pkey; Type: CONSTRAINT; Schema: website_structure; Owner: -
--

ALTER TABLE ONLY website_structure.page
    ADD CONSTRAINT page_pkey PRIMARY KEY (id);


--
-- Name: page page_route_key; Type: CONSTRAINT; Schema: website_structure; Owner: -
--

ALTER TABLE ONLY website_structure.page
    ADD CONSTRAINT page_route_key UNIQUE (route);


--
-- Name: website website_pkey; Type: CONSTRAINT; Schema: website_structure; Owner: -
--

ALTER TABLE ONLY website_structure.website
    ADD CONSTRAINT website_pkey PRIMARY KEY (id);


--
-- Name: oauth_account oauth_account_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_account
    ADD CONSTRAINT oauth_account_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.auth_user(id) ON DELETE CASCADE;


--
-- Name: user_session user_session_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.user_session
    ADD CONSTRAINT user_session_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.auth_user(id) ON DELETE CASCADE;


--
-- Name: component component_page_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component
    ADD CONSTRAINT component_page_id_fkey FOREIGN KEY (page_id) REFERENCES website_structure.page(id) ON DELETE CASCADE;


--
-- Name: component_position component_position_component_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_position
    ADD CONSTRAINT component_position_component_id_fkey FOREIGN KEY (component_id) REFERENCES components.component(id) ON DELETE CASCADE;


--
-- Name: component_type_accordion component_type_accordion_component_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_accordion
    ADD CONSTRAINT component_type_accordion_component_id_fkey FOREIGN KEY (component_id) REFERENCES components.component(id) ON DELETE CASCADE;


--
-- Name: component_type_audio component_type_audio_asset_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_audio
    ADD CONSTRAINT component_type_audio_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES media.media_asset(id);


--
-- Name: component_type_audio component_type_audio_component_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_audio
    ADD CONSTRAINT component_type_audio_component_id_fkey FOREIGN KEY (component_id) REFERENCES components.component(id) ON DELETE CASCADE;


--
-- Name: component_type_button component_type_button_component_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_button
    ADD CONSTRAINT component_type_button_component_id_fkey FOREIGN KEY (component_id) REFERENCES components.component(id) ON DELETE CASCADE;


--
-- Name: component_type_image component_type_image_asset_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_image
    ADD CONSTRAINT component_type_image_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES media.media_asset(id);


--
-- Name: component_type_image component_type_image_component_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_image
    ADD CONSTRAINT component_type_image_component_id_fkey FOREIGN KEY (component_id) REFERENCES components.component(id) ON DELETE CASCADE;


--
-- Name: component_type_text component_type_text_component_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_text
    ADD CONSTRAINT component_type_text_component_id_fkey FOREIGN KEY (component_id) REFERENCES components.component(id) ON DELETE CASCADE;


--
-- Name: component_type_video component_type_video_asset_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_video
    ADD CONSTRAINT component_type_video_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES media.media_asset(id);


--
-- Name: component_type_video component_type_video_component_id_fkey; Type: FK CONSTRAINT; Schema: components; Owner: -
--

ALTER TABLE ONLY components.component_type_video
    ADD CONSTRAINT component_type_video_component_id_fkey FOREIGN KEY (component_id) REFERENCES components.component(id) ON DELETE CASCADE;


--
-- Name: media_asset media_asset_user_id_fkey; Type: FK CONSTRAINT; Schema: media; Owner: -
--

ALTER TABLE ONLY media.media_asset
    ADD CONSTRAINT media_asset_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.auth_user(id);


--
-- Name: page page_website_id_fkey; Type: FK CONSTRAINT; Schema: website_structure; Owner: -
--

ALTER TABLE ONLY website_structure.page
    ADD CONSTRAINT page_website_id_fkey FOREIGN KEY (website_id) REFERENCES website_structure.website(id) ON DELETE CASCADE;


--
-- Name: website website_user_id_fkey; Type: FK CONSTRAINT; Schema: website_structure; Owner: -
--

ALTER TABLE ONLY website_structure.website
    ADD CONSTRAINT website_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.auth_user(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20240223085542'),
    ('20240223085633'),
    ('20240223143704'),
    ('20240223145048'),
    ('20240223154958'),
    ('20240223191322'),
    ('20240224184413'),
    ('20240225003529'),
    ('20240225131732'),
    ('20240226173510'),
    ('20240226174747'),
    ('20240227160724'),
    ('20240229104246'),
    ('20240229104831'),
    ('20240301071938'),
    ('20240301120121'),
    ('20240301121311');
