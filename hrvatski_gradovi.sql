--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

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
-- Name: gradovi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gradovi (
    id integer NOT NULL,
    naziv character varying(100),
    broj_stanovnika integer,
    zupanija character varying(100),
    postanski_broj integer,
    povrsina integer,
    godina_osnutka integer,
    status character varying(10),
    autooznaka character varying(10)
);


ALTER TABLE public.gradovi OWNER TO postgres;

--
-- Name: gradovi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gradovi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gradovi_id_seq OWNER TO postgres;

--
-- Name: gradovi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gradovi_id_seq OWNED BY public.gradovi.id;


--
-- Name: znamenitosti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.znamenitosti (
    id integer NOT NULL,
    grad_id integer,
    naziv character varying(100)
);


ALTER TABLE public.znamenitosti OWNER TO postgres;

--
-- Name: znamenitosti_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.znamenitosti_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.znamenitosti_id_seq OWNER TO postgres;

--
-- Name: znamenitosti_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.znamenitosti_id_seq OWNED BY public.znamenitosti.id;


--
-- Name: gradovi id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gradovi ALTER COLUMN id SET DEFAULT nextval('public.gradovi_id_seq'::regclass);


--
-- Name: znamenitosti id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.znamenitosti ALTER COLUMN id SET DEFAULT nextval('public.znamenitosti_id_seq'::regclass);


--
-- Data for Name: gradovi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gradovi (id, naziv, broj_stanovnika, zupanija, postanski_broj, povrsina, godina_osnutka, status, autooznaka) FROM stdin;
2	Split	160577	Splitsko-dalmatinska	21000	79	295	da	ST
3	Rijeka	107964	Primorsko-goranska	51000	43	1993	da	RI
4	Osijek	96313	Osječko-baranjska	31000	174	1196	da	OS
5	Zadar	70779	Zadarska	23000	25	1991	da	ZD
6	Slavonski Brod	49891	Brodsko-posavska	35000	54	1244	da	SB
7	Velika Gorica	61075	Zagrebačka	10410	100	1228	ne	ZG
8	Karlovac	49377	Karlovačka	47000	95	1579	da	KA
9	Pula	52220	Istarska	52100	54	-45	ne	PU
1	Zagreb	767131	Grad Zagreb	10000	641	1094	da	ZG
10	Sisak	40121	Sisačko-moslavačka	44000	59	1838	da	SK
\.


--
-- Data for Name: znamenitosti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.znamenitosti (id, grad_id, naziv) FROM stdin;
1	1	Zagrebačka katedrala
2	1	Hrvatsko narodno kazalište
3	1	Trg bana Josipa Jelačića
4	2	Dioklecijanova palača
5	2	Splitska katedrala
6	2	Dioklecijanovi podrumi
7	3	Trsatski kaštel
8	3	Katedrala sv. Vida
9	3	Korzo
10	4	Katedrala sv Petra i Pavla
11	4	Tvrđa
12	4	Park prirode Kopački rit
13	5	Crkva sv. Donata
14	5	Morske orgulje
15	5	Katedrala sv. Stošije
16	6	Tvrđava Brod
17	7	Muzej Turopolja
18	8	Muzej Domovinskog rata
19	9	Pulska arena
20	9	Augustov hram
21	9	Katedrala uznesenja blažene djevice Marije
22	10	Katedrala uzvisenja svetog križa
23	10	Bazilika sv. kvirina
\.


--
-- Name: gradovi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gradovi_id_seq', 13, true);


--
-- Name: znamenitosti_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.znamenitosti_id_seq', 23, true);


--
-- Name: gradovi gradovi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gradovi
    ADD CONSTRAINT gradovi_pkey PRIMARY KEY (id);


--
-- Name: znamenitosti znamenitosti_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.znamenitosti
    ADD CONSTRAINT znamenitosti_pkey PRIMARY KEY (id);


--
-- Name: znamenitosti znamenitosti_grad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.znamenitosti
    ADD CONSTRAINT znamenitosti_grad_id_fkey FOREIGN KEY (grad_id) REFERENCES public.gradovi(id);


--
-- PostgreSQL database dump complete
--

