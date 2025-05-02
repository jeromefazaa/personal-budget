--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Postgres.app)
-- Dumped by pg_dump version 17.4 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: cleanup_inactive_users(); Type: FUNCTION; Schema: public; Owner: jeromefazaa
--

CREATE FUNCTION public.cleanup_inactive_users() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
inactive_count INTEGER;
inactive_limit CONSTANT INTEGER := 30;
BEGIN
SELECT COUNT(*) INTO inactive_count FROM users WHERE is_active = false;
IF inactive_count >= inactive_limit THEN
DELETE FROM envelopes
USING users
WHERE users.user_id = envelopes.user_id
AND users.is_active = false;
DELETE FROM users
WHERE is_active = false
AND user_id <> NEW.user_id;
END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION public.cleanup_inactive_users() OWNER TO jeromefazaa;

--
-- Name: envelopes_update_user_expenses_on_delete(); Type: FUNCTION; Schema: public; Owner: jeromefazaa
--

CREATE FUNCTION public.envelopes_update_user_expenses_on_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
UPDATE users
SET user_total_expenses = user_total_expenses - OLD.budget
WHERE user_id = OLD.user_id;
RETURN OLD;
END;
$$;


ALTER FUNCTION public.envelopes_update_user_expenses_on_delete() OWNER TO jeromefazaa;

--
-- Name: envelopes_update_user_expenses_on_insert(); Type: FUNCTION; Schema: public; Owner: jeromefazaa
--

CREATE FUNCTION public.envelopes_update_user_expenses_on_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN 
UPDATE users
SET user_total_expenses = user_total_expenses + NEW.budget
WHERE user_id = NEW.user_id;
RETURN NEW;
END;
$$;


ALTER FUNCTION public.envelopes_update_user_expenses_on_insert() OWNER TO jeromefazaa;

--
-- Name: envelopes_update_user_expenses_on_update(); Type: FUNCTION; Schema: public; Owner: jeromefazaa
--

CREATE FUNCTION public.envelopes_update_user_expenses_on_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN 
IF OLD.budget IS DISTINCT FROM NEW.budget THEN 
UPDATE users
SET user_total_expenses = user_total_expenses - OLD.budget + NEW.budget
WHERE user_id = OLD.user_id;
END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION public.envelopes_update_user_expenses_on_update() OWNER TO jeromefazaa;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: envelopes; Type: TABLE; Schema: public; Owner: jeromefazaa
--

CREATE TABLE public.envelopes (
    envelope_id integer NOT NULL,
    name character varying(250) NOT NULL,
    budget integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT envelopes_budget_check CHECK ((budget >= 0))
);


ALTER TABLE public.envelopes OWNER TO jeromefazaa;

--
-- Name: envelopes_id_seq; Type: SEQUENCE; Schema: public; Owner: jeromefazaa
--

CREATE SEQUENCE public.envelopes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.envelopes_id_seq OWNER TO jeromefazaa;

--
-- Name: envelopes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jeromefazaa
--

ALTER SEQUENCE public.envelopes_id_seq OWNED BY public.envelopes.envelope_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: jeromefazaa
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    user_first_name character varying(20) DEFAULT ''::character varying NOT NULL,
    user_last_name character varying(20) DEFAULT ''::character varying NOT NULL,
    user_email character varying(30) DEFAULT 'inactive@example.com'::character varying NOT NULL,
    user_password character varying(20) DEFAULT ''::character varying NOT NULL,
    user_monthly_income integer DEFAULT 0,
    user_total_expenses integer DEFAULT 0,
    is_active boolean DEFAULT false NOT NULL,
    CONSTRAINT total_expenses_within_income CHECK ((user_total_expenses <= user_monthly_income)),
    CONSTRAINT users_user_monthly_income_check CHECK ((user_monthly_income >= 0))
);


ALTER TABLE public.users OWNER TO jeromefazaa;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: jeromefazaa
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO jeromefazaa;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jeromefazaa
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: envelopes envelope_id; Type: DEFAULT; Schema: public; Owner: jeromefazaa
--

ALTER TABLE ONLY public.envelopes ALTER COLUMN envelope_id SET DEFAULT nextval('public.envelopes_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: jeromefazaa
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: envelopes envelopes_pkey; Type: CONSTRAINT; Schema: public; Owner: jeromefazaa
--

ALTER TABLE ONLY public.envelopes
    ADD CONSTRAINT envelopes_pkey PRIMARY KEY (envelope_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: jeromefazaa
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users_user_email_unique_non_default; Type: INDEX; Schema: public; Owner: jeromefazaa
--

CREATE UNIQUE INDEX users_user_email_unique_non_default ON public.users USING btree (user_email) WHERE ((user_email)::text <> 'inactive@example.com'::text);


--
-- Name: users cleanup_inactive_users_on_insert; Type: TRIGGER; Schema: public; Owner: jeromefazaa
--

CREATE TRIGGER cleanup_inactive_users_on_insert AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.cleanup_inactive_users();


--
-- Name: envelopes updae_user_total_expenses_on_insert; Type: TRIGGER; Schema: public; Owner: jeromefazaa
--

CREATE TRIGGER updae_user_total_expenses_on_insert AFTER INSERT ON public.envelopes FOR EACH ROW EXECUTE FUNCTION public.envelopes_update_user_expenses_on_insert();


--
-- Name: envelopes update_user_total_expenses_on_delete; Type: TRIGGER; Schema: public; Owner: jeromefazaa
--

CREATE TRIGGER update_user_total_expenses_on_delete AFTER DELETE ON public.envelopes FOR EACH ROW EXECUTE FUNCTION public.envelopes_update_user_expenses_on_delete();


--
-- Name: envelopes update_user_total_expenses_on_update; Type: TRIGGER; Schema: public; Owner: jeromefazaa
--

CREATE TRIGGER update_user_total_expenses_on_update AFTER UPDATE ON public.envelopes FOR EACH ROW EXECUTE FUNCTION public.envelopes_update_user_expenses_on_update();


--
-- Name: envelopes envelopes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jeromefazaa
--

ALTER TABLE ONLY public.envelopes
    ADD CONSTRAINT envelopes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

