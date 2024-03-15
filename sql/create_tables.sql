--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

-- Started on 2023-06-17 13:09:23

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
-- TOC entry 4296 (class 1262 OID 16398)
-- Name: geo_data; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE geo_data WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LC_COLLATE = 'Portuguese_Brazil.1252' LC_CTYPE = 'C';


ALTER DATABASE geo_data OWNER TO postgres;

\connect geo_data

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
-- TOC entry 2 (class 3079 OID 16461)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 4297 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 17875)
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    privileges character varying(255)
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17874)
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.groups_id_seq OWNER TO postgres;

--
-- TOC entry 4298 (class 0 OID 0)
-- Dependencies: 220
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- TOC entry 227 (class 1259 OID 17925)
-- Name: layers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.layers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    project_id integer
);


ALTER TABLE public.layers OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17924)
-- Name: layers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.layers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.layers_id_seq OWNER TO postgres;

--
-- TOC entry 4299 (class 0 OID 0)
-- Dependencies: 226
-- Name: layers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.layers_id_seq OWNED BY public.layers.id;


--
-- TOC entry 229 (class 1259 OID 17937)
-- Name: points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.points (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    coordinates public.geometry(Point,4326),
    foto bytea,
    layer_id integer
);


ALTER TABLE public.points OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17936)
-- Name: points_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.points_id_seq OWNER TO postgres;

--
-- TOC entry 4300 (class 0 OID 0)
-- Dependencies: 228
-- Name: points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.points_id_seq OWNED BY public.points.id;


--
-- TOC entry 232 (class 1259 OID 17979)
-- Name: points_properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.points_properties (
    point_id integer NOT NULL,
    property_id integer NOT NULL
);


ALTER TABLE public.points_properties OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17896)
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17895)
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO postgres;

--
-- TOC entry 4301 (class 0 OID 0)
-- Dependencies: 224
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- TOC entry 233 (class 1259 OID 17994)
-- Name: projects_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects_users (
    project_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.projects_users OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17951)
-- Name: properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.properties (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    value jsonb,
    style jsonb
);


ALTER TABLE public.properties OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17950)
-- Name: properties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.properties_id_seq OWNER TO postgres;

--
-- TOC entry 4302 (class 0 OID 0)
-- Dependencies: 230
-- Name: properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- TOC entry 223 (class 1259 OID 17884)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    group_id integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17883)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4303 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4098 (class 2604 OID 17878)
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- TOC entry 4101 (class 2604 OID 17928)
-- Name: layers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layers ALTER COLUMN id SET DEFAULT nextval('public.layers_id_seq'::regclass);


--
-- TOC entry 4102 (class 2604 OID 17940)
-- Name: points id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points ALTER COLUMN id SET DEFAULT nextval('public.points_id_seq'::regclass);


--
-- TOC entry 4100 (class 2604 OID 17899)
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- TOC entry 4103 (class 2604 OID 17954)
-- Name: properties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- TOC entry 4099 (class 2604 OID 17887)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4278 (class 0 OID 17875)
-- Dependencies: 221
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.groups VALUES (7, 'Admin', 'privileges 1');
INSERT INTO public.groups VALUES (8, 'Editor', 'privileges 2');


--
-- TOC entry 4284 (class 0 OID 17925)
-- Dependencies: 227
-- Data for Name: layers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.layers VALUES (13, 'Layer 1', 7);
INSERT INTO public.layers VALUES (14, 'Layer 2', 7);
INSERT INTO public.layers VALUES (15, 'Layer 1', 8);
INSERT INTO public.layers VALUES (16, 'Layer 2', 8);


--
-- TOC entry 4286 (class 0 OID 17937)
-- Dependencies: 229
-- Data for Name: points; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.points VALUES (25, 'Point 1', '0101000020E6100000A5BDC1172693444046B6F3FDD43821C0', '\x68747470733a2f2f6578616d706c652e636f6d2f696d616765312e6a7067', 13);
INSERT INTO public.points VALUES (26, 'Point 2', '0101000020E6100000A5BDC1172693444046B6F3FDD43821C0', '\x68747470733a2f2f6578616d706c652e636f6d2f696d616765322e6a7067', 13);
INSERT INTO public.points VALUES (27, 'Point 3', '0101000020E61000004DF38E53745C434065AA6054524722C0', '\x68747470733a2f2f6578616d706c652e636f6d2f696d616765332e6a7067', 14);
INSERT INTO public.points VALUES (28, 'Point 4', '0101000020E61000004DF38E53745C434065AA6054524722C0', '\x68747470733a2f2f6578616d706c652e636f6d2f696d616765342e6a7067', 14);
INSERT INTO public.points VALUES (29, 'Point 5', '0101000020E6100000A5BDC1172693444046B6F3FDD43821C0', '\x68747470733a2f2f6578616d706c652e636f6d2f696d616765352e6a7067', 15);
INSERT INTO public.points VALUES (30, 'Point 6', '0101000020E6100000A5BDC1172693444046B6F3FDD43821C0', '\x68747470733a2f2f6578616d706c652e636f6d2f696d616765362e6a7067', 15);
INSERT INTO public.points VALUES (31, 'Point 7', '0101000020E61000004DF38E53745C434065AA6054524722C0', '\x68747470733a2f2f6578616d706c652e636f6d2f696d616765372e6a7067', 16);
INSERT INTO public.points VALUES (32, 'Point 8', '0101000020E61000004DF38E53745C434065AA6054524722C0', '\x68747470733a2f2f6578616d706c652e636f6d2f696d616765382e6a7067', 16);


--
-- TOC entry 4289 (class 0 OID 17979)
-- Dependencies: 232
-- Data for Name: points_properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.points_properties VALUES (25, 25);
INSERT INTO public.points_properties VALUES (26, 25);
INSERT INTO public.points_properties VALUES (27, 25);
INSERT INTO public.points_properties VALUES (28, 25);
INSERT INTO public.points_properties VALUES (29, 25);
INSERT INTO public.points_properties VALUES (30, 25);
INSERT INTO public.points_properties VALUES (31, 25);
INSERT INTO public.points_properties VALUES (32, 25);


--
-- TOC entry 4282 (class 0 OID 17896)
-- Dependencies: 225
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.projects VALUES (7, 'Project 1');
INSERT INTO public.projects VALUES (8, 'Project 2');


--
-- TOC entry 4290 (class 0 OID 17994)
-- Dependencies: 233
-- Data for Name: projects_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.projects_users VALUES (7, 7);
INSERT INTO public.projects_users VALUES (8, 7);


--
-- TOC entry 4288 (class 0 OID 17951)
-- Dependencies: 231
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.properties VALUES (25, 'state', '["done", "pending", "invalid"]', '{"font": "Times New Roman", "icon": "https://example.com/green-pin-icon.png", "color": "green", "condition": "done", "font-size": 14}');


--
-- TOC entry 4097 (class 0 OID 16774)
-- Dependencies: 216
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4280 (class 0 OID 17884)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (7, 'Daniel', 7);
INSERT INTO public.users VALUES (8, 'Pedro', 8);


--
-- TOC entry 4304 (class 0 OID 0)
-- Dependencies: 220
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_id_seq', 8, true);


--
-- TOC entry 4305 (class 0 OID 0)
-- Dependencies: 226
-- Name: layers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.layers_id_seq', 16, true);


--
-- TOC entry 4306 (class 0 OID 0)
-- Dependencies: 228
-- Name: points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.points_id_seq', 32, true);


--
-- TOC entry 4307 (class 0 OID 0)
-- Dependencies: 224
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 8, true);


--
-- TOC entry 4308 (class 0 OID 0)
-- Dependencies: 230
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.properties_id_seq', 32, true);


--
-- TOC entry 4309 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- TOC entry 4108 (class 2606 OID 17882)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- TOC entry 4114 (class 2606 OID 17930)
-- Name: layers layers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layers
    ADD CONSTRAINT layers_pkey PRIMARY KEY (id);


--
-- TOC entry 4116 (class 2606 OID 17944)
-- Name: points points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_pkey PRIMARY KEY (id);


--
-- TOC entry 4120 (class 2606 OID 17983)
-- Name: points_properties points_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_properties
    ADD CONSTRAINT points_properties_pkey PRIMARY KEY (point_id, property_id);


--
-- TOC entry 4112 (class 2606 OID 17901)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4122 (class 2606 OID 17998)
-- Name: projects_users projects_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT projects_users_pkey PRIMARY KEY (project_id, user_id);


--
-- TOC entry 4118 (class 2606 OID 17958)
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- TOC entry 4110 (class 2606 OID 17889)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4124 (class 2606 OID 17931)
-- Name: layers layers_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layers
    ADD CONSTRAINT layers_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- TOC entry 4125 (class 2606 OID 17945)
-- Name: points points_layer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_layer_id_fkey FOREIGN KEY (layer_id) REFERENCES public.layers(id);


--
-- TOC entry 4126 (class 2606 OID 17984)
-- Name: points_properties points_properties_point_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_properties
    ADD CONSTRAINT points_properties_point_id_fkey FOREIGN KEY (point_id) REFERENCES public.points(id);


--
-- TOC entry 4127 (class 2606 OID 17989)
-- Name: points_properties points_properties_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_properties
    ADD CONSTRAINT points_properties_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- TOC entry 4128 (class 2606 OID 17999)
-- Name: projects_users projects_users_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT projects_users_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- TOC entry 4129 (class 2606 OID 18004)
-- Name: projects_users projects_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT projects_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4123 (class 2606 OID 17890)
-- Name: users users_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id);


-- Completed on 2023-06-17 13:09:24

--
-- PostgreSQL database dump complete
--

