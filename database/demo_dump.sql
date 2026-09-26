--
-- PostgreSQL database dump
--

\restrict xUwssssNvMk9X0DXtXt2c84s4Z0uawEo74OE9pEGbPR2MHlFA8kqDybbtBo8cWg

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
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leads (id, full_name, mobile, email, date_of_birth, city, pincode, loan_type, employment_type, monthly_income, loan_amount, property_value, consent, credit_score, credit_score_error, bre_status, rejection_reasons, rule_results, created_at) FROM stdin;
1	Asha Demo	9000000100	demo1@example.com	1995-05-12	Bengaluru	560001	Home Loan	Salaried	20000.00	5500000.00	6000000.00	t	785	\N	Not Eligible	["Monthly Income below eligibility criteria", "Loan Amount exceeds eligible limit"]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "20000", "target": "30000.00", "passed": false}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "785", "target": "700.00", "passed": true}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "5500000", "target": "4800000.00", "passed": false}]	2026-09-26 16:27:45.241752+05:30
2	Rohan Demo	9000000101	demo2@example.com	1995-05-12	Bengaluru	560001	LAP	Self Employed	75000.00	4000000.00	6000000.00	t	753	\N	Eligible	[]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "753", "target": "700.00", "passed": true}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}]	2026-09-26 16:27:45.417772+05:30
3	Meera Demo	9000000102	demo3@example.com	1995-05-12	Bengaluru	560001	Home Loan	Salaried	75000.00	4000000.00	6000000.00	t	649	\N	Not Eligible	["Credit Score below minimum requirement"]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "649", "target": "700.00", "passed": false}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}]	2026-09-26 16:27:45.439994+05:30
4	Arjun Demo	9000000103	demo4@example.com	1995-05-12	Bengaluru	560001	LAP	Self Employed	75000.00	4000000.00	6000000.00	t	742	\N	Eligible	[]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "742", "target": "700.00", "passed": true}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}]	2026-09-26 16:27:45.457056+05:30
5	Kavya Demo	9000000104	demo5@example.com	1995-05-12	Bengaluru	560001	Home Loan	Salaried	20000.00	4000000.00	6000000.00	t	700	\N	Not Eligible	["Monthly Income below eligibility criteria"]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "20000", "target": "30000.00", "passed": false}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "700", "target": "700.00", "passed": true}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}]	2026-09-26 16:27:45.472915+05:30
6	Vikram Demo	9000000105	demo6@example.com	1995-05-12	Bengaluru	560001	LAP	Self Employed	75000.00	5500000.00	6000000.00	t	592	\N	Not Eligible	["Credit Score below minimum requirement", "Loan Amount exceeds eligible limit"]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "592", "target": "700.00", "passed": false}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "5500000", "target": "4800000.00", "passed": false}]	2026-09-26 16:27:45.510123+05:30
7	Neha Demo	9000000106	demo7@example.com	1995-05-12	Bengaluru	560001	Home Loan	Salaried	75000.00	4000000.00	6000000.00	t	612	\N	Not Eligible	["Credit Score below minimum requirement"]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "612", "target": "700.00", "passed": false}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}]	2026-09-26 16:27:45.523619+05:30
8	Rahul Demo	9000000107	demo8@example.com	1995-05-12	Bengaluru	560001	LAP	Self Employed	75000.00	4000000.00	6000000.00	t	755	\N	Eligible	[]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "755", "target": "700.00", "passed": true}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}]	2026-09-26 16:27:45.537766+05:30
9	Priya Demo	9000000108	demo9@example.com	1995-05-12	Bengaluru	560001	Home Loan	Salaried	20000.00	4000000.00	6000000.00	t	673	\N	Not Eligible	["Monthly Income below eligibility criteria", "Credit Score below minimum requirement"]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "20000", "target": "30000.00", "passed": false}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "673", "target": "700.00", "passed": false}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}]	2026-09-26 16:27:45.549969+05:30
10	Amit Demo	9000000109	demo10@example.com	1995-05-12	Bengaluru	560001	LAP	Self Employed	75000.00	4000000.00	6000000.00	t	640	\N	Not Eligible	["Credit Score below minimum requirement"]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "640", "target": "700.00", "passed": false}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}]	2026-09-26 16:27:45.565457+05:30
11	Sana Demo	9000000110	demo11@example.com	1995-05-12	Bengaluru	560001	Home Loan	Salaried	75000.00	5500000.00	6000000.00	t	788	\N	Not Eligible	["Loan Amount exceeds eligible limit"]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "788", "target": "700.00", "passed": true}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "5500000", "target": "4800000.00", "passed": false}]	2026-09-26 16:27:45.581153+05:30
12	Dev Demo	9000000111	demo12@example.com	1995-05-12	Bengaluru	560001	LAP	Self Employed	75000.00	4000000.00	6000000.00	t	664	\N	Not Eligible	["Credit Score below minimum requirement"]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "664", "target": "700.00", "passed": false}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}]	2026-09-26 16:27:45.596324+05:30
13	Walkthrough Demo	9420571639	walkthrough@example.com	1995-05-12	Bengaluru	560001	Home Loan	Salaried	75000.00	4000000.00	6000000.00	t	817	\N	Eligible	[]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "817", "target": "700.00", "passed": true}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}]	2026-09-26 16:33:13.276248+05:30
14	New Rule Demo	9420571640	newrule@example.com	1995-05-12	Bengaluru	560001	Home Loan	Salaried	75000.00	4000000.00	6000000.00	t	603	\N	Not Eligible	["Credit Score below minimum requirement", "Monthly Income below walkthrough requirement"]	[{"rule_id": 1, "rule_name": "Minimum age", "field": "age", "operator": ">=", "value": "21.00", "reference_field": null, "actual": "31", "target": "21.00", "passed": true}, {"rule_id": 2, "rule_name": "Maximum age", "field": "age", "operator": "<=", "value": "60.00", "reference_field": null, "actual": "31", "target": "60.00", "passed": true}, {"rule_id": 3, "rule_name": "Minimum monthly income", "field": "monthly_income", "operator": ">=", "value": "30000.00", "reference_field": null, "actual": "75000", "target": "30000.00", "passed": true}, {"rule_id": 4, "rule_name": "Minimum credit score", "field": "credit_score", "operator": ">=", "value": "700.00", "reference_field": null, "actual": "603", "target": "700.00", "passed": false}, {"rule_id": 5, "rule_name": "Loan to property value", "field": "loan_amount", "operator": "<=", "value": "80.00", "reference_field": "property_value", "actual": "4000000", "target": "4800000.00", "passed": true}, {"rule_id": 6, "rule_name": "Walkthrough income check", "field": "monthly_income", "operator": ">=", "value": "80000.00", "reference_field": null, "actual": "75000", "target": "80000.00", "passed": false}]	2026-09-26 16:35:22.435491+05:30
\.


--
-- Data for Name: rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rules (id, rule_name, field, operator, value, reference_field, rejection_message, is_active) FROM stdin;
1	Minimum age	age	>=	21.00	\N	Age below minimum requirement	t
2	Maximum age	age	<=	60.00	\N	Age above maximum requirement	t
3	Minimum monthly income	monthly_income	>=	30000.00	\N	Monthly Income below eligibility criteria	t
4	Minimum credit score	credit_score	>=	700.00	\N	Credit Score below minimum requirement	t
5	Loan to property value	loan_amount	<=	80.00	property_value	Loan Amount exceeds eligible limit	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, is_active) FROM stdin;
1	admin@moneybeing.local	$argon2id$v=19$m=65536,t=3,p=4$S4kRopRyrhUCwLgX4vz/fw$IMALSPQGkJ7urlF99zCMpW6bbhFzGgFxgyJzVI0EOO8	admin	t
\.


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leads_id_seq', 14, true);


--
-- Name: rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rules_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


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

\unrestrict xUwssssNvMk9X0DXtXt2c84s4Z0uawEo74OE9pEGbPR2MHlFA8kqDybbtBo8cWg
