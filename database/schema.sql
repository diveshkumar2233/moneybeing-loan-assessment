--
-- PostgreSQL database dump
--

\restrict o9eC5xScZV1g4Pg4Qqf1eVuWxcbZ8sATUi7dlch9ihRc5XES0iZmT6mtYayzM7r

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    full_name character varying(120) NOT NULL,
    mobile character varying(10) NOT NULL,
    email character varying(254) NOT NULL,
    date_of_birth date NOT NULL,
    city character varying(100) NOT NULL,
    pincode character varying(6) NOT NULL,
    loan_type character varying(30) NOT NULL,
    employment_type character varying(30) NOT NULL,
    monthly_income numeric(16,2) NOT NULL,
    loan_amount numeric(16,2) NOT NULL,
    property_value numeric(16,2) NOT NULL,
    consent boolean NOT NULL,
    credit_score integer,
    credit_score_error character varying(255),
    bre_status character varying(20) NOT NULL,
    rejection_reasons json NOT NULL,
    rule_results json NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT leads_check CHECK (((monthly_income > (0)::numeric) AND (loan_amount > (0)::numeric) AND (property_value > (0)::numeric))),
    CONSTRAINT leads_credit_score_check CHECK (((credit_score IS NULL) OR ((credit_score >= 300) AND (credit_score <= 900))))
);


--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rules (
    id integer NOT NULL,
    rule_name character varying(120) NOT NULL,
    field character varying(40) NOT NULL,
    operator character varying(2) NOT NULL,
    value numeric(16,2) NOT NULL,
    reference_field character varying(40),
    rejection_message character varying(255) NOT NULL,
    is_active boolean NOT NULL
);


--
-- Name: rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rules_id_seq OWNED BY public.rules.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(254) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules ALTER COLUMN id SET DEFAULT nextval('public.rules_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: rules rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rules
    ADD CONSTRAINT rules_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_leads_bre_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_leads_bre_status ON public.leads USING btree (bre_status);


--
-- Name: ix_leads_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_leads_created_at ON public.leads USING btree (created_at);


--
-- Name: ix_leads_full_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_leads_full_name ON public.leads USING btree (full_name);


--
-- Name: ix_leads_loan_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_leads_loan_type ON public.leads USING btree (loan_type);


--
-- Name: ix_leads_mobile; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_leads_mobile ON public.leads USING btree (mobile);


--
-- PostgreSQL database dump complete
--

\unrestrict o9eC5xScZV1g4Pg4Qqf1eVuWxcbZ8sATUi7dlch9ihRc5XES0iZmT6mtYayzM7r
