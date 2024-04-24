--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

-- Started on 2024-04-21 14:50:44

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
-- TOC entry 4306 (class 0 OID 0)
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
-- TOC entry 4307 (class 0 OID 0)
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
-- TOC entry 4308 (class 0 OID 0)
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
    foto text,
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
-- TOC entry 4309 (class 0 OID 0)
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
    property_id integer NOT NULL,
    value text
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
-- TOC entry 4310 (class 0 OID 0)
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
    "values" text,
    default_value text,
    project_id integer
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
-- TOC entry 4311 (class 0 OID 0)
-- Dependencies: 230
-- Name: properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- TOC entry 235 (class 1259 OID 26020)
-- Name: styles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.styles (
    id integer NOT NULL,
    name text NOT NULL,
    value text,
    priority integer,
    project_id integer,
    condition text
);


ALTER TABLE public.styles OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 26019)
-- Name: styles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.styles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.styles_id_seq OWNER TO postgres;

--
-- TOC entry 4312 (class 0 OID 0)
-- Dependencies: 234
-- Name: styles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.styles_id_seq OWNED BY public.styles.id;


--
-- TOC entry 223 (class 1259 OID 17884)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    group_id integer,
    password text
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
-- TOC entry 4313 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4103 (class 2604 OID 17878)
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- TOC entry 4106 (class 2604 OID 17928)
-- Name: layers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layers ALTER COLUMN id SET DEFAULT nextval('public.layers_id_seq'::regclass);


--
-- TOC entry 4107 (class 2604 OID 17940)
-- Name: points id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points ALTER COLUMN id SET DEFAULT nextval('public.points_id_seq'::regclass);


--
-- TOC entry 4105 (class 2604 OID 17899)
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- TOC entry 4108 (class 2604 OID 17954)
-- Name: properties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- TOC entry 4109 (class 2604 OID 26023)
-- Name: styles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.styles ALTER COLUMN id SET DEFAULT nextval('public.styles_id_seq'::regclass);


--
-- TOC entry 4104 (class 2604 OID 17887)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4286 (class 0 OID 17875)
-- Dependencies: 221
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, privileges) FROM stdin;
7	Admin	privileges 1
8	Editor	privileges 2
\.


--
-- TOC entry 4292 (class 0 OID 17925)
-- Dependencies: 227
-- Data for Name: layers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.layers (id, name, project_id) FROM stdin;
20	Layer 1	14
21	Layer 2	14
33	Layer 3	14
34	torre 1	15
35	torre 2	15
43	OFS	10
\.


--
-- TOC entry 4294 (class 0 OID 17937)
-- Dependencies: 229
-- Data for Name: points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.points (id, name, coordinates, foto, layer_id) FROM stdin;
131	Chaves	0101000020E6100000970DFB75A65A29C173CEF052E8885341	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	43
124	49.960628, -8.592665	0101000020E61000004CB72C1705392AC15B3CC8B4F70E5341	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	43
127	51.387428, -10.015373	0101000020E6100000A3A1A2A882902EC1D1DF5BB34D9A5341	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	33
129	49.609983, -9.126409	0101000020E6100000780A3FB401DA2BC12F304094B9EC5241	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	33
128	Lombo	0101000020E6100000DA63EE1C805427C15575E0A8D05F5341	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	33
123	50.290836, -8.953547	0101000020E610000004404552F5522BC1B37DBDE7362F5341	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	43
126	Vila Real	0101000020E61000006665F11EB1552AC12E34DF3C164A5341	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	33
132	48.867824, -8.334386	0101000020E6100000D48B36223D6F29C1FA575D993FA45241	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	43
125	Viseu	0101000020E6100000174736E60CE52AC15D778CE2EDEC5241	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	43
119	Braga	0101000020E610000056F3F1258CA12CC12CF91A0F206C5341	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	43
130	Amorcito	0101000020E61000009461DF72319128C10C8E0E0EF8DC5241	./icons/IMG_20230924_192436.jpg	43
122	50.254146, -8.072752	0101000020E61000008D85B175D6A228C1737630A9A12B5341	https://img.freepik.com/vetores-gratis/design-plano-sem-sinal-de-foto_23-2149272417.jpg?w=740&t=st=1694276438~exp=1694277038~hmac=6dba50b5b1cd4985e02643e3159d349ae79eeabaf70ec97e9bd4cfac5987f219	43
\.


--
-- TOC entry 4297 (class 0 OID 17979)
-- Dependencies: 232
-- Data for Name: points_properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.points_properties (point_id, property_id, value) FROM stdin;
127	75	pequeno
129	75	pequeno
128	75	pequeno
126	75	grande
124	69	ma
124	71	não iniciado
124	70	Ninguém
124	76	"Nenhum"
123	76	"Nenhum"
119	76	"Nenhum"
123	69	ma
123	70	Ninguém
123	71	não iniciado
125	69	boa
125	71	não iniciado
125	70	Ninguém
125	76	"Nenhum"
130	69	boa
130	76	Aveiro
130	70	Tavares
119	69	boa
119	71	não iniciado
119	70	Ninguém
130	71	não iniciado
122	69	boa
122	70	Ninguém
122	71	não iniciado
122	76	"Nenhum"
131	69	ma
131	70	Ninguém
131	76	Aveiro
131	71	resolvido
132	69	boa
132	70	Ninguém
132	71	não iniciado
132	76	Nenhum
\.


--
-- TOC entry 4290 (class 0 OID 17896)
-- Dependencies: 225
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, name) FROM stdin;
10	Operacao Floresta Segura
14	Castelos
15	Torres
24	caleiras
25	lameiras
26	Fontes
\.


--
-- TOC entry 4298 (class 0 OID 17994)
-- Dependencies: 233
-- Data for Name: projects_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects_users (project_id, user_id) FROM stdin;
10	7
14	7
15	7
24	30
25	30
26	31
\.


--
-- TOC entry 4296 (class 0 OID 17951)
-- Dependencies: 231
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.properties (id, name, "values", default_value, project_id) FROM stdin;
69	Situacao	["boa", "ma"]	ma	10
70	Responsavel	["Tavares", "Sampaio", "Ninguém"]	Ninguém	10
71	Estado	["resolvido", "pendente", "não iniciado"]	não iniciado	10
75	Tipo de Castelo	["grande", "pequeno"]	pequeno	14
76	Distrito	["Aveiro", "Porto", "Viseu", "Guarda", "Nenhum"]	Nenhum	10
\.


--
-- TOC entry 4102 (class 0 OID 16774)
-- Dependencies: 216
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 4300 (class 0 OID 26020)
-- Dependencies: 235
-- Data for Name: styles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.styles (id, name, value, priority, project_id, condition) FROM stdin;
20	boa ou ma	{ \n"normal" :  { \n                              "img" : "./icons/icons8-location-100.png",\n\t\t\t     "scale": 1,\n\t\t\t     "font" : "12px sans-serif"\n                              },\n"highlighted" : { \n                              "img" : "./icons/icons8-location-100.png",\n\t\t\t      "scale": 1.5,\n\t\t\t     "font" : "14px sans-serif"\n                              }\n}	\N	10	{ \n "property_id": 69,\n "value": "boa"\n}
63	error	{"normal":{ \n                            "img": "./icons/error.png",\n                            "scale": 1,\n                            "font" : "12px sans-serif"\n                                    },\n                        "highlighted":{ \n                            "img" : "./icons/error.png",\n                            "scale": 2,\n                            "font" : "12px sans-serif"\n                        }}	1	10	{ "property_id": "69",\n                              "value": "ma"\n                            }
\.


--
-- TOC entry 4288 (class 0 OID 17884)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, group_id, password) FROM stdin;
18	André	7	andre
7	Daniel	7	daniel
23	Helio	7	helio
30	Francisco	7	francisco
31	Orlando	7	orlando
\.


--
-- TOC entry 4314 (class 0 OID 0)
-- Dependencies: 220
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_id_seq', 8, true);


--
-- TOC entry 4315 (class 0 OID 0)
-- Dependencies: 226
-- Name: layers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.layers_id_seq', 43, true);


--
-- TOC entry 4316 (class 0 OID 0)
-- Dependencies: 228
-- Name: points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.points_id_seq', 132, true);


--
-- TOC entry 4317 (class 0 OID 0)
-- Dependencies: 224
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 26, true);


--
-- TOC entry 4318 (class 0 OID 0)
-- Dependencies: 230
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.properties_id_seq', 76, true);


--
-- TOC entry 4319 (class 0 OID 0)
-- Dependencies: 234
-- Name: styles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.styles_id_seq', 63, true);


--
-- TOC entry 4320 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 31, true);


--
-- TOC entry 4114 (class 2606 OID 17882)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- TOC entry 4120 (class 2606 OID 17930)
-- Name: layers layers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layers
    ADD CONSTRAINT layers_pkey PRIMARY KEY (id);


--
-- TOC entry 4122 (class 2606 OID 17944)
-- Name: points points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_pkey PRIMARY KEY (id);


--
-- TOC entry 4126 (class 2606 OID 17983)
-- Name: points_properties points_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_properties
    ADD CONSTRAINT points_properties_pkey PRIMARY KEY (point_id, property_id);


--
-- TOC entry 4118 (class 2606 OID 17901)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4128 (class 2606 OID 17998)
-- Name: projects_users projects_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT projects_users_pkey PRIMARY KEY (project_id, user_id);


--
-- TOC entry 4124 (class 2606 OID 17958)
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- TOC entry 4130 (class 2606 OID 26027)
-- Name: styles styles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.styles
    ADD CONSTRAINT styles_pkey PRIMARY KEY (id);


--
-- TOC entry 4116 (class 2606 OID 17889)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4132 (class 2606 OID 18014)
-- Name: layers layers_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layers
    ADD CONSTRAINT layers_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 4133 (class 2606 OID 18019)
-- Name: points points_layer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_layer_id_fkey FOREIGN KEY (layer_id) REFERENCES public.layers(id) ON DELETE CASCADE;


--
-- TOC entry 4134 (class 2606 OID 18024)
-- Name: points_properties points_properties_point_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_properties
    ADD CONSTRAINT points_properties_point_id_fkey FOREIGN KEY (point_id) REFERENCES public.points(id) ON DELETE CASCADE;


--
-- TOC entry 4135 (class 2606 OID 18034)
-- Name: points_properties points_properties_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.points_properties
    ADD CONSTRAINT points_properties_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- TOC entry 4136 (class 2606 OID 18009)
-- Name: projects_users projects_users_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT projects_users_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 4137 (class 2606 OID 18029)
-- Name: projects_users projects_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT projects_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4131 (class 2606 OID 17890)
-- Name: users users_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id);


-- Completed on 2024-04-21 14:50:45

--
-- PostgreSQL database dump complete
--

