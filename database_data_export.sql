--
-- PostgreSQL database dump
--

\restrict Ffj34PeDYWK9BVaYYlV8gs6rwdxO5oCJahEKNbkNBGvjJ4HIeruxxlhZSi1PCJI

-- Dumped from database version 16.11 (df20cf9)
-- Dumped by pg_dump version 16.10

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
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.companies VALUES (1, 'Acme Corp', '2025-11-04 06:31:58.692371');
INSERT INTO public.companies VALUES (2, 'Tech Solutions', '2025-11-04 06:32:08.32355');
INSERT INTO public.companies VALUES (3, 'Empty Company Test', '2025-11-05 00:27:33.988937');
INSERT INTO public.companies VALUES (4, 'Real-time Test Co', '2025-11-05 01:15:40.545289');
INSERT INTO public.companies VALUES (5, 'Test Company', '2025-11-05 04:23:21.508065');
INSERT INTO public.companies VALUES (6, 'Touch Count Test', '2025-11-05 04:31:30.280099');
INSERT INTO public.companies VALUES (7, 'Test''s Company', '2025-11-12 05:45:43.918177');
INSERT INTO public.companies VALUES (8, 'My Company', '2025-11-12 06:05:20.375058');
INSERT INTO public.companies VALUES (9, 'Test''s Company', '2025-11-12 16:38:31.310436');
INSERT INTO public.companies VALUES (10, 'austin''s Company', '2025-11-12 18:20:27.670624');
INSERT INTO public.companies VALUES (11, 'Test Company - No Membership', '2025-11-12 20:54:38.32808');
INSERT INTO public.companies VALUES (12, 'austin''s Company', '2025-11-13 01:29:11.73902');
INSERT INTO public.companies VALUES (13, 'Test Company Ww-I', '2025-11-13 21:14:57.969343');
INSERT INTO public.companies VALUES (14, 'Test Company iPr6AX', '2025-11-13 21:21:24.126836');
INSERT INTO public.companies VALUES (15, 'Test Company Alpha', '2025-11-19 18:58:23.463563');
INSERT INTO public.companies VALUES (16, 'Test Company tzin2N', '2025-11-19 19:37:09.620408');
INSERT INTO public.companies VALUES (17, 'SMS Test Company 4SUVTP', '2025-11-19 19:43:01.568597');
INSERT INTO public.companies VALUES (18, 'SMS Verified Test knT3LD', '2025-11-19 19:53:37.329465');
INSERT INTO public.companies VALUES (19, 'TestCompany_i7UCsM', '2025-12-01 20:26:56.860367');
INSERT INTO public.companies VALUES (20, 'company_vNuMVq', '2025-12-01 20:32:30.865922');
INSERT INTO public.companies VALUES (21, 'Test Company PD-cyZ', '2025-12-01 20:41:28.527908');
INSERT INTO public.companies VALUES (22, 'TestCo_VTyfZo', '2025-12-02 03:12:55.000608');
INSERT INTO public.companies VALUES (23, 'TestCo_8I7wVF', '2025-12-02 03:18:37.128441');
INSERT INTO public.companies VALUES (24, 'TestCo', '2025-12-04 17:00:17.239725');


--
-- Data for Name: pipelines; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.pipelines VALUES (6, 'Acme Sales Pipeline', '2025-11-04 06:35:54.247755', 1);
INSERT INTO public.pipelines VALUES (7, 'Sales Pipeline Test', '2025-11-05 01:19:27.128587', 4);
INSERT INTO public.pipelines VALUES (8, 'test', '2025-11-13 05:58:20.953618', 12);


--
-- Data for Name: client_files; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.client_files VALUES (19, 'Client from User A', 'Testing real-time updates', 'APP-INTAKE', '2025-11-05 01:17:45.879076', '2025-11-05 01:19:48.586', NULL, 4, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (46, 'E2E Client FmWIbr', '', 'LOAN SETUP', '2025-11-19 06:11:25.854748', NULL, NULL, 1, NULL, '555-0100', '3gFjQ@example.com', NULL, NULL);
INSERT INTO public.client_files VALUES (24, 'Client 2', 'Automated test client', 'APP-INTAKE', '2025-11-05 03:08:01.656824', '2025-11-12 04:54:38.056', NULL, 1, NULL, '', '', NULL, NULL);
INSERT INTO public.client_files VALUES (29, 'Touched Client', 'This client was recently touched', 'APP-INTAKE', '2025-11-05 04:24:24.831', '2025-11-05 04:24:24.831', NULL, 5, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (28, 'Untouched Client', 'This client has never been touched', 'APP-INTAKE', '2025-11-05 04:24:24.831', '2025-11-05 04:25:31.949', NULL, 5, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (32, 'Touched Once', 'This client has 1 touch', 'APP-INTAKE', '2025-11-05 04:33:18.63984', '2025-11-05 04:34:04.585', NULL, 6, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (33, 'Touched Multiple', 'This client has multiple touches', 'APP-INTAKE', '2025-11-05 04:33:33.945018', '2025-11-05 04:35:04.979', NULL, 6, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (31, 'Never Touched', 'This client has 0 touches', 'APP-INTAKE', '2025-11-05 04:33:04.923562', '2025-11-05 04:35:28.594', NULL, 6, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (18, 'Client T1', 'Test client for Tech', 'APP-INTAKE', '2025-11-04 06:34:31.910304', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (20, 'Client from User B', 'Another test', 'APP-INTAKE', '2025-11-05 01:18:29.431356', NULL, NULL, 4, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (30, 'No Description Client', NULL, 'APP-INTAKE', '2025-11-05 04:24:24.831', NULL, NULL, 5, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (47, 'Checklist Test Client', 'make phone call', 'CHECKLIST STATUS', '2025-12-04 17:02:38.910383', '2025-12-04 17:13:12.335', NULL, 24, NULL, '', '', NULL, NULL);
INSERT INTO public.client_files VALUES (25, 'raplph', '24', 'completed', '2025-11-05 04:19:23.591869', '2025-11-05 04:20:03.635', '2025-11-07 00:00:00', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (48, 'austin a a', '', 'LOAN SETUP', '2026-01-29 16:59:04.554125', NULL, NULL, 1, NULL, '7273648783', '', '', '');
INSERT INTO public.client_files VALUES (37, 'Test Close Client JlRMbw', 'Testing close functionality', 'completed', '2025-11-07 03:02:27.222389', '2025-11-07 03:04:26.035', '2025-11-07 00:00:00', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (26, 're', 're', 'completed', '2025-11-05 04:20:16.487143', '2025-11-05 04:41:47.651', '2025-11-07 00:00:00', 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (38, 'LENDER Test Client S9sM4U', 'Testing NEEDS LENDER filter', 'NEEDS LENDER', '2025-11-07 03:56:38.497704', '2025-11-07 04:50:55.246', NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (40, 'Urgent Test xk5bun', 'Testing red urgency indicator', 'NEEDS LENDER', '2025-11-07 04:51:13.419184', '2025-11-07 04:52:07.227', NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (41, 'Test Green Card Client', 'Testing 0-24hr green card', 'APP-INTAKE', '2025-11-07 05:26:38.012574', '2025-11-07 05:27:23.629', NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (49, 'austin otero aaaa', 'test', 'LOAN SETUP', '2026-01-29 17:04:42.986776', NULL, NULL, 1, NULL, '7273648783', '', '', '');
INSERT INTO public.client_files VALUES (36, 'Fresh Client Test', 'test', 'APP-INTAKE', '2025-11-06 06:32:57.05845', '2025-11-12 04:18:20.766', NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (27, 'erearearea', 'eraraeraerea', 'APP-INTAKE', '2025-11-05 04:20:22.695527', '2025-11-06 06:49:54.834', NULL, 1, NULL, '7273648783', '', 'fha', '7.8');
INSERT INTO public.client_files VALUES (23, 'test', 'Meeting note to delete', 'APP-INTAKE', '2025-11-05 01:51:31.304453', '2025-11-06 06:39:37.573', NULL, 1, 6, '7273648783', '', 'FHA', '12.3%');
INSERT INTO public.client_files VALUES (39, 'APP Test Client WSRQYR', 'Testing APP-INTAKE filter', 'APP-INTAKE', '2025-11-07 04:08:50.802573', NULL, NULL, 1, 6, '7567889799', '', 'fha', '7%');
INSERT INTO public.client_files VALUES (35, 'te', 'this is what the note is going to be', 'TEST', '2025-11-06 06:27:38.595121', '2025-11-12 04:42:38.772', NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (34, 'auto-old-48h-1762409720220', 'Test meeting note 1', 'APP-INTAKE', '2025-11-03 06:15:20.22', '2025-11-12 04:47:05.062', NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (42, 'Test Loan Client', 'Testing LOAN SETUP status n', 'LOAN SETUP', '2025-11-10 19:34:46.268673', '2025-11-12 04:49:00.774', NULL, 1, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.client_files VALUES (43, 'AUSTIN R OTERO', '', 'LOAN SETUP', '2025-11-19 03:23:59.547424', NULL, NULL, 1, NULL, '17273648783', 'austin@inboxplace.com', NULL, NULL);
INSERT INTO public.client_files VALUES (44, 'Collapsible Test Client', '', 'LOAN SETUP', '2025-11-19 04:12:10.555177', NULL, NULL, 1, NULL, '', '', NULL, NULL);
INSERT INTO public.client_files VALUES (45, 'Panel Test Client', '', 'APP-INTAKE', '2025-11-19 04:17:00.852373', NULL, NULL, 1, NULL, '', '', NULL, NULL);


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.contacts VALUES (17, 'Duplicate Test Contact', '555-1234', 'duplicate@test.com', '2025-11-05 03:55:12.936819', 1);
INSERT INTO public.contacts VALUES (18, 'Different Contact Name', '555-1234', 'duplicate@test.com', '2025-11-05 03:55:51.960185', 1);
INSERT INTO public.contacts VALUES (19, 'John Smith', '555-0001', 'john@example.com', '2025-11-05 03:58:21.156993', 1);
INSERT INTO public.contacts VALUES (20, 'Sarah Williams', '555-3333', 'sarah@example.com', '2025-11-05 04:00:15.247372', 1);
INSERT INTO public.contacts VALUES (21, 'Alice Thompson', '555-1111', 'alice@example.com', '2025-11-05 04:05:26.947853', 1);
INSERT INTO public.contacts VALUES (22, 'Bob Miller', NULL, NULL, '2025-11-05 04:05:56.68776', 1);
INSERT INTO public.contacts VALUES (23, 'hailey bishop', NULL, NULL, '2025-11-05 04:52:17.640279', 1);
INSERT INTO public.contacts VALUES (24, '(800) 829-0922', '+18008290922', NULL, '2025-11-05 04:52:17.72151', 1);
INSERT INTO public.contacts VALUES (25, '(720) 979-2175', '+17209792175', NULL, '2025-11-05 04:52:17.794698', 1);
INSERT INTO public.contacts VALUES (26, '(813) 723-0511', '+18137230511', NULL, '2025-11-05 04:52:17.864104', 1);
INSERT INTO public.contacts VALUES (27, '(813) 279-1949', '+18132791949', NULL, '2025-11-05 04:52:17.932394', 1);
INSERT INTO public.contacts VALUES (28, '(448) 444-5174', '+14484445174', NULL, '2025-11-05 04:52:18.002751', 1);
INSERT INTO public.contacts VALUES (29, 'maria wilkins', '+928133285655', 'maria@maxfreshcleaning.com', '2025-11-05 04:52:18.100197', 1);
INSERT INTO public.contacts VALUES (30, '34831', '+134831', NULL, '2025-11-05 04:52:18.169893', 1);
INSERT INTO public.contacts VALUES (31, '(727) 615-6683', '+17276156683', NULL, '2025-11-05 04:52:18.240653', 1);
INSERT INTO public.contacts VALUES (32, '(727) 906-5830', '+17279065830', NULL, '2025-11-05 04:52:18.311393', 1);
INSERT INTO public.contacts VALUES (33, 'jorge blanco', '+18135804805', 'jb461626@gmail.com', '2025-11-05 04:52:18.40599', 1);
INSERT INTO public.contacts VALUES (34, 'jorge rigual', NULL, NULL, '2025-11-05 04:52:18.453467', 1);
INSERT INTO public.contacts VALUES (35, 'paula gutierrez', '+17274591432', 'paulagutierrez0515@gmail.com', '2025-11-05 04:52:18.54769', 1);
INSERT INTO public.contacts VALUES (36, '(304) 707-9491', '+13047079491', NULL, '2025-11-05 04:52:18.619144', 1);
INSERT INTO public.contacts VALUES (37, '(352) 606-1402', '+13526061402', NULL, '2025-11-05 04:52:18.690166', 1);
INSERT INTO public.contacts VALUES (38, '(941) 841-3755', '+19418413755', NULL, '2025-11-05 04:52:18.760285', 1);
INSERT INTO public.contacts VALUES (39, '(888) 525-1985', '+18885251985', NULL, '2025-11-05 04:52:18.831615', 1);
INSERT INTO public.contacts VALUES (40, '(949) 390-7062', '+19493907062', NULL, '2025-11-05 04:52:18.902386', 1);
INSERT INTO public.contacts VALUES (41, '(833) 961-1963', '+18339611963', NULL, '2025-11-05 04:52:18.972504', 1);
INSERT INTO public.contacts VALUES (42, '(610) 557-1228', '+16105571228', NULL, '2025-11-05 04:52:19.042567', 1);
INSERT INTO public.contacts VALUES (43, '(972) 884-5504', '+19728845504', NULL, '2025-11-05 04:52:19.112067', 1);
INSERT INTO public.contacts VALUES (44, 'karina moreno', '+17276781175', NULL, '2025-11-05 04:52:19.180087', 1);
INSERT INTO public.contacts VALUES (45, 'lauren abott', '+18138294054', NULL, '2025-11-05 04:52:19.25036', 1);
INSERT INTO public.contacts VALUES (46, '(813) 901-1107', '+18139011107', NULL, '2025-11-05 04:52:19.32164', 1);
INSERT INTO public.contacts VALUES (47, '(727) 625-2311', '+17276252311', NULL, '2025-11-05 04:52:19.391796', 1);
INSERT INTO public.contacts VALUES (48, '(866) 411-2742', '+18664112742', NULL, '2025-11-05 04:52:19.464976', 1);
INSERT INTO public.contacts VALUES (49, '(727) 376-1808', '+17273761808', NULL, '2025-11-05 04:52:19.536291', 1);
INSERT INTO public.contacts VALUES (50, '(727) 460-2655', '+17274602655', NULL, '2025-11-05 04:52:19.610475', 1);
INSERT INTO public.contacts VALUES (51, '(650) 203-2795', '+16502032795', NULL, '2025-11-05 04:52:19.679696', 1);
INSERT INTO public.contacts VALUES (52, '(858) 215-8150', '+18582158150', NULL, '2025-11-05 04:52:19.753082', 1);
INSERT INTO public.contacts VALUES (53, '(786) 403-8749', '+17864038749', NULL, '2025-11-05 04:52:19.823702', 1);
INSERT INTO public.contacts VALUES (54, '(860) 940-8224', '+18609408224', NULL, '2025-11-05 04:52:19.893617', 1);
INSERT INTO public.contacts VALUES (55, '(727) 331-2382', '+17273312382', NULL, '2025-11-05 04:52:19.965603', 1);
INSERT INTO public.contacts VALUES (56, '(855) 480-8573', '+18554808573', NULL, '2025-11-05 04:52:20.036276', 1);
INSERT INTO public.contacts VALUES (57, '(833) 352-7759', '+18333527759', NULL, '2025-11-05 04:52:20.106367', 1);
INSERT INTO public.contacts VALUES (58, '(877) 846-8770', '+18778468770', NULL, '2025-11-05 04:52:20.176599', 1);
INSERT INTO public.contacts VALUES (59, '(727) 623-6270', '+17276236270', NULL, '2025-11-05 04:52:20.245923', 1);
INSERT INTO public.contacts VALUES (60, '(540) 420-9624', '+15404209624', NULL, '2025-11-05 04:52:20.317489', 1);
INSERT INTO public.contacts VALUES (61, 'bernadette hurd', '+13522388025', NULL, '2025-11-05 04:52:20.389786', 1);
INSERT INTO public.contacts VALUES (62, 'daniel edwards', '+918454479454', 'daniel.websolution07@gmail.com', '2025-11-05 04:52:20.484114', 1);
INSERT INTO public.contacts VALUES (63, '(727) 350-2416', '+17273502416', NULL, '2025-11-05 04:52:20.555437', 1);
INSERT INTO public.contacts VALUES (64, '(866) 919-0081', '+18669190081', NULL, '2025-11-05 04:52:20.626739', 1);
INSERT INTO public.contacts VALUES (65, '(786) 482-6582', '+17864826582', NULL, '2025-11-05 04:52:20.697888', 1);
INSERT INTO public.contacts VALUES (66, 'jaleeeen doeeee', '+17277777777', 'jaleeenmadeaoopsie@gmail.com', '2025-11-05 04:52:20.791503', 1);
INSERT INTO public.contacts VALUES (67, '(727) 604-5596', '+17276045596', NULL, '2025-11-05 04:52:20.861531', 1);
INSERT INTO public.contacts VALUES (68, '(352) 354-2589', '+13523542589', NULL, '2025-11-05 04:52:20.931997', 1);
INSERT INTO public.contacts VALUES (69, '(239) 940-9376', '+12399409376', NULL, '2025-11-05 04:52:21.009506', 1);
INSERT INTO public.contacts VALUES (70, '(813) 468-6151', '+18134686151', NULL, '2025-11-05 04:52:21.079657', 1);
INSERT INTO public.contacts VALUES (71, '(339) 223-9431', '+13392239431', NULL, '2025-11-05 04:52:21.150344', 1);
INSERT INTO public.contacts VALUES (72, '(727) 667-0302', '+17276670302', NULL, '2025-11-05 04:52:21.220697', 1);
INSERT INTO public.contacts VALUES (73, '(850) 717-6570', '+18507176570', NULL, '2025-11-05 04:52:21.289634', 1);
INSERT INTO public.contacts VALUES (74, 'dylans.eth', NULL, NULL, '2025-11-05 04:52:21.336657', 1);
INSERT INTO public.contacts VALUES (75, 'yanet sago', '+17868047431', NULL, '2025-11-05 04:52:21.408491', 1);
INSERT INTO public.contacts VALUES (76, '(800) 463-3339', '+18004633339', NULL, '2025-11-05 04:52:21.480441', 1);
INSERT INTO public.contacts VALUES (77, '(813) 699-3054', '+18136993054', NULL, '2025-11-05 04:52:21.550085', 1);
INSERT INTO public.contacts VALUES (78, '(727) 267-1524', '+17272671524', NULL, '2025-11-05 04:52:21.621474', 1);
INSERT INTO public.contacts VALUES (79, '(727) 271-9409', '+17272719409', NULL, '2025-11-05 04:52:21.692612', 1);
INSERT INTO public.contacts VALUES (80, '(800) 981-8898', '+18009818898', NULL, '2025-11-05 04:52:21.766027', 1);
INSERT INTO public.contacts VALUES (81, '(813) 446-3634', '+18134463634', NULL, '2025-11-05 04:52:21.834682', 1);
INSERT INTO public.contacts VALUES (82, '(813) 412-0834', '+18134120834', NULL, '2025-11-05 04:52:21.903878', 1);
INSERT INTO public.contacts VALUES (83, '(727) 698-7371', '+17276987371', NULL, '2025-11-05 04:52:21.97343', 1);
INSERT INTO public.contacts VALUES (84, 'olt pro', '+18776584776', NULL, '2025-11-05 04:52:22.045127', 1);
INSERT INTO public.contacts VALUES (85, '(352) 544-0911', '+13525440911', NULL, '2025-11-05 04:52:22.116908', 1);
INSERT INTO public.contacts VALUES (86, '(727) 226-5074', '+17272265074', NULL, '2025-11-05 04:52:22.186921', 1);
INSERT INTO public.contacts VALUES (87, '(833) 678-7020', '+18336787020', NULL, '2025-11-05 04:52:22.257201', 1);
INSERT INTO public.contacts VALUES (88, '(727) 306-1127', '+17273061127', NULL, '2025-11-05 04:52:22.328383', 1);
INSERT INTO public.contacts VALUES (89, '(866) 738-6297', '+18667386297', NULL, '2025-11-05 04:52:22.397566', 1);
INSERT INTO public.contacts VALUES (90, '(727) 275-8035', '+17272758035', NULL, '2025-11-05 04:52:22.468368', 1);
INSERT INTO public.contacts VALUES (91, '(740) 981-6817', '+17409816817', NULL, '2025-11-05 04:52:22.542911', 1);
INSERT INTO public.contacts VALUES (92, 'bridge maría alvarado', '+18322267164', NULL, '2025-11-05 04:52:22.61391', 1);
INSERT INTO public.contacts VALUES (93, '(646) 350-2274', '+16463502274', NULL, '2025-11-05 04:52:22.684427', 1);
INSERT INTO public.contacts VALUES (94, '(727) 777-6886', '+17277776886', NULL, '2025-11-05 04:52:22.757301', 1);
INSERT INTO public.contacts VALUES (95, 'jaleen', '+17277776468', NULL, '2025-11-05 04:52:22.829672', 1);
INSERT INTO public.contacts VALUES (96, '33637212', '+8133637212', NULL, '2025-11-05 04:52:22.901425', 1);
INSERT INTO public.contacts VALUES (97, 'yuli@inboxplace.com', NULL, 'yuli@inboxplace.com', '2025-11-05 04:52:22.972962', 1);
INSERT INTO public.contacts VALUES (98, '(910) 585-8018', '+19105858018', NULL, '2025-11-05 04:52:23.064894', 1);
INSERT INTO public.contacts VALUES (99, '(844) 234-2500', '+18442342500', NULL, '2025-11-05 04:52:23.135018', 1);
INSERT INTO public.contacts VALUES (100, '(239) 634-6487', '+12396346487', NULL, '2025-11-05 04:52:23.205887', 1);
INSERT INTO public.contacts VALUES (101, 'dylan', '+12058514558', NULL, '2025-11-05 04:52:23.277424', 1);
INSERT INTO public.contacts VALUES (102, 'nell33ll3lmop', NULL, NULL, '2025-11-05 04:52:23.325473', 1);
INSERT INTO public.contacts VALUES (103, '58026', '+158026', NULL, '2025-11-05 04:52:23.396611', 1);
INSERT INTO public.contacts VALUES (104, '(352) 521-4433', '+13525214433', NULL, '2025-11-05 04:52:23.466685', 1);
INSERT INTO public.contacts VALUES (105, '(631) 568-7288', '+16315687288', NULL, '2025-11-05 04:52:23.538566', 1);
INSERT INTO public.contacts VALUES (106, 'booknex inc', NULL, 'admin@booknex.com', '2025-11-05 04:52:23.627986', 1);
INSERT INTO public.contacts VALUES (107, 'test', NULL, 'test@gmail.com', '2025-11-05 04:52:23.698757', 1);
INSERT INTO public.contacts VALUES (108, '(877) 202-4291', '+18772024291', NULL, '2025-11-05 04:52:23.767049', 1);
INSERT INTO public.contacts VALUES (109, 'henry handsum', NULL, 'email@dylanotero.com', '2025-11-05 04:52:23.836589', 1);
INSERT INTO public.contacts VALUES (110, 'dylan otero', NULL, 'oterodylan00@gmail.com', '2025-11-05 04:52:23.910112', 1);
INSERT INTO public.contacts VALUES (111, '(786) 491-7100', '+17864917100', NULL, '2025-11-05 04:52:23.985774', 1);
INSERT INTO public.contacts VALUES (112, 'josh', NULL, NULL, '2025-11-05 04:52:24.033378', 1);
INSERT INTO public.contacts VALUES (113, '(304) 707-9492', '+13047079492', NULL, '2025-11-05 04:52:24.102831', 1);
INSERT INTO public.contacts VALUES (114, '(816) 232-9095', '+18162329095', NULL, '2025-11-05 04:52:24.180873', 1);
INSERT INTO public.contacts VALUES (115, '(541) 596-6031', '+15415966031', NULL, '2025-11-05 04:52:24.257542', 1);
INSERT INTO public.contacts VALUES (116, '(641) 742-8227', '+16417428227', NULL, '2025-11-05 04:52:24.328161', 1);
INSERT INTO public.contacts VALUES (117, 'yerson c salazar alvira', NULL, NULL, '2025-11-05 04:52:24.376297', 1);
INSERT INTO public.contacts VALUES (118, 'deladier payares cuadro', '+17867547585', NULL, '2025-11-05 04:52:24.447474', 1);
INSERT INTO public.contacts VALUES (119, 'manuel perlaza', '+18134851954', NULL, '2025-11-05 04:52:24.515991', 1);
INSERT INTO public.contacts VALUES (120, 'oscar perez', NULL, NULL, '2025-11-05 04:52:24.564458', 1);
INSERT INTO public.contacts VALUES (121, 'jamie osorio ocampo', NULL, NULL, '2025-11-05 04:52:24.61091', 1);
INSERT INTO public.contacts VALUES (122, 'jorge mora nunez', NULL, NULL, '2025-11-05 04:52:24.658043', 1);
INSERT INTO public.contacts VALUES (123, 'jose mora vargas', NULL, NULL, '2025-11-05 04:52:24.705253', 1);
INSERT INTO public.contacts VALUES (124, 'maria ariza', '+17273262207', NULL, '2025-11-05 04:52:24.774998', 1);
INSERT INTO public.contacts VALUES (125, 'joseph aponte', '+13526169823', 'ghostman112@gmail.com', '2025-11-05 04:52:24.868454', 1);
INSERT INTO public.contacts VALUES (126, 'austin otero', NULL, NULL, '2025-11-05 04:52:24.914989', 1);
INSERT INTO public.contacts VALUES (127, '(800) 225-5342', '+18002255342', NULL, '2025-11-05 04:52:24.987861', 1);
INSERT INTO public.contacts VALUES (128, 'carlos linaceros alpizar', '+18139009240', NULL, '2025-11-05 04:52:25.058292', 1);
INSERT INTO public.contacts VALUES (129, 'jose mora', '+18137509308', NULL, '2025-11-05 04:52:25.128462', 1);
INSERT INTO public.contacts VALUES (130, '(727) 297-8754', '+17272978754', NULL, '2025-11-05 04:52:25.196014', 1);
INSERT INTO public.contacts VALUES (131, 'jake sicili', '+17274953804', NULL, '2025-11-05 04:52:25.265832', 1);
INSERT INTO public.contacts VALUES (132, 'karen lizeth achurry escobar', '+13213141798', 'karens-192@hotmail.com', '2025-11-05 04:52:25.363687', 1);
INSERT INTO public.contacts VALUES (133, 'jojalbabdabe', NULL, NULL, '2025-11-05 04:52:25.41053', 1);
INSERT INTO public.contacts VALUES (134, 'karen', '+77773652547', NULL, '2025-11-05 04:52:25.48049', 1);
INSERT INTO public.contacts VALUES (135, 'orjoshuaafwelka2000', NULL, NULL, '2025-11-05 04:52:25.526973', 1);
INSERT INTO public.contacts VALUES (136, 'jorge eduardo mora', '+18137509307', NULL, '2025-11-05 04:52:25.596733', 1);
INSERT INTO public.contacts VALUES (137, 'joanne dibenedetto', '+13525852986', NULL, '2025-11-05 04:52:25.665348', 1);
INSERT INTO public.contacts VALUES (138, '(786) 273-1273', '+17862731273', NULL, '2025-11-05 04:52:25.736055', 1);
INSERT INTO public.contacts VALUES (139, '(727) 354-0347', '+17273540347', NULL, '2025-11-05 04:52:25.804962', 1);
INSERT INTO public.contacts VALUES (140, '(727) 272-3528', '+17272723528', NULL, '2025-11-05 04:52:25.87488', 1);
INSERT INTO public.contacts VALUES (141, '(727) 326-2325', '+17273262325', NULL, '2025-11-05 04:52:25.948035', 1);
INSERT INTO public.contacts VALUES (142, 'christopher waye', '+17274007642', 'chriskwaye@gmail.com', '2025-11-05 04:52:26.039879', 1);
INSERT INTO public.contacts VALUES (143, '(813) 357-4513', '+18133574513', NULL, '2025-11-05 04:52:26.110597', 1);
INSERT INTO public.contacts VALUES (144, '(415) 858-1458', '+14158581458', NULL, '2025-11-05 04:52:26.18379', 1);
INSERT INTO public.contacts VALUES (145, '(415) 301-3705', '+14153013705', NULL, '2025-11-05 04:52:26.253551', 1);
INSERT INTO public.contacts VALUES (146, '(771) 223-4451', '+17712234451', NULL, '2025-11-05 04:52:26.32299', 1);
INSERT INTO public.contacts VALUES (147, 'nerelys', '+18134412340', 'nerelysyuni22@gmail.com', '2025-11-05 04:52:26.418617', 1);
INSERT INTO public.contacts VALUES (148, 'yunierkis gonzalez', '+18137049207', NULL, '2025-11-05 04:52:26.490089', 1);
INSERT INTO public.contacts VALUES (149, 'miguel martin', '+16562103125', NULL, '2025-11-05 04:52:26.563352', 1);
INSERT INTO public.contacts VALUES (150, 'jorge mora', '+18137509309', 'jorgemoraa74@gmail.com', '2025-11-05 04:52:26.653467', 1);
INSERT INTO public.contacts VALUES (151, 'irulegalrealm_96vil', NULL, NULL, '2025-11-05 04:52:26.699946', 1);
INSERT INTO public.contacts VALUES (152, 'zorigormortisxxkub', NULL, NULL, '2025-11-05 04:52:26.745459', 1);
INSERT INTO public.contacts VALUES (153, '(808) 400-7209', '+18084007209', NULL, '2025-11-05 04:52:26.820895', 1);
INSERT INTO public.contacts VALUES (154, '(201) 679-9622', '+12016799622', NULL, '2025-11-05 04:52:26.890375', 1);
INSERT INTO public.contacts VALUES (155, '(352) 233-3376', '+13522333376', NULL, '2025-11-05 04:52:26.960762', 1);
INSERT INTO public.contacts VALUES (156, '(813) 403-3031', '+18134033031', NULL, '2025-11-05 04:52:27.030941', 1);
INSERT INTO public.contacts VALUES (157, 'sami salim', NULL, NULL, '2025-11-05 04:52:27.077326', 1);
INSERT INTO public.contacts VALUES (158, '(877) 727-2932', '+18777272932', NULL, '2025-11-05 04:52:27.145688', 1);
INSERT INTO public.contacts VALUES (159, '(813) 764-6058', '+18137646058', NULL, '2025-11-05 04:52:27.216463', 1);
INSERT INTO public.contacts VALUES (160, 'luis ruiz contreras', NULL, NULL, '2025-11-05 04:52:27.26653', 1);
INSERT INTO public.contacts VALUES (161, '(305) 200-6112', '+13052006112', NULL, '2025-11-05 04:52:27.337347', 1);
INSERT INTO public.contacts VALUES (162, 'zubrui_.0915eh', NULL, NULL, '2025-11-05 04:52:27.38363', 1);
INSERT INTO public.contacts VALUES (163, 'toboso, luis', NULL, NULL, '2025-11-05 04:52:27.429687', 1);
INSERT INTO public.contacts VALUES (164, 'ariza yuli', NULL, NULL, '2025-11-05 04:52:27.477174', 1);
INSERT INTO public.contacts VALUES (165, 'ronchetti, jesse', NULL, NULL, '2025-11-05 04:52:27.526003', 1);
INSERT INTO public.contacts VALUES (166, 'verdecia, leonardo', NULL, NULL, '2025-11-05 04:52:27.572872', 1);
INSERT INTO public.contacts VALUES (167, 'verdecia, lissandro', NULL, NULL, '2025-11-05 04:52:27.619054', 1);
INSERT INTO public.contacts VALUES (168, 'aguilera ariel & belkis hernandez', NULL, NULL, '2025-11-05 04:52:27.665278', 1);
INSERT INTO public.contacts VALUES (169, 'michael pons', NULL, NULL, '2025-11-05 04:52:27.71083', 1);
INSERT INTO public.contacts VALUES (170, 'pedro romaguera perez', '+18132158120', NULL, '2025-11-05 04:52:27.778499', 1);
INSERT INTO public.contacts VALUES (171, 'kenan harriott', NULL, NULL, '2025-11-05 04:52:27.824251', 1);
INSERT INTO public.contacts VALUES (172, 'michael litwin', NULL, NULL, '2025-11-05 04:52:27.871098', 1);
INSERT INTO public.contacts VALUES (173, 'ada riveros', NULL, NULL, '2025-11-05 04:52:27.939821', 1);
INSERT INTO public.contacts VALUES (174, 'mami christina', NULL, NULL, '2025-11-05 04:52:27.98728', 1);
INSERT INTO public.contacts VALUES (175, 'oscar gonzales', NULL, NULL, '2025-11-05 04:52:28.033781', 1);
INSERT INTO public.contacts VALUES (176, 'william f gutierrez', NULL, NULL, '2025-11-05 04:52:28.080151', 1);
INSERT INTO public.contacts VALUES (177, 'yailin gonzalez', NULL, NULL, '2025-11-05 04:52:28.125557', 1);
INSERT INTO public.contacts VALUES (178, 'zack', NULL, NULL, '2025-11-05 04:52:28.172455', 1);
INSERT INTO public.contacts VALUES (179, 'selena diaz', NULL, NULL, '2025-11-05 04:52:28.219295', 1);
INSERT INTO public.contacts VALUES (180, 'reina perez tania', '+17276457867', NULL, '2025-11-05 04:52:28.29045', 1);
INSERT INTO public.contacts VALUES (181, 'diosmar jesus barreiro', NULL, NULL, '2025-11-05 04:52:28.339025', 1);
INSERT INTO public.contacts VALUES (182, 'rosa alpizar', NULL, NULL, '2025-11-05 04:52:28.386474', 1);
INSERT INTO public.contacts VALUES (183, 'katherine chaviagra', NULL, NULL, '2025-11-05 04:52:28.432072', 1);
INSERT INTO public.contacts VALUES (184, 'gonzalez leonel', NULL, NULL, '2025-11-05 04:52:28.478615', 1);
INSERT INTO public.contacts VALUES (185, 'cabrera aylin', NULL, NULL, '2025-11-05 04:52:28.525581', 1);
INSERT INTO public.contacts VALUES (186, 'ruben falcon', NULL, NULL, '2025-11-05 04:52:28.572377', 1);
INSERT INTO public.contacts VALUES (187, 'rivera elvin', NULL, NULL, '2025-11-05 04:52:28.621313', 1);
INSERT INTO public.contacts VALUES (188, '2022', NULL, NULL, '2025-11-05 04:52:28.66796', 1);
INSERT INTO public.contacts VALUES (189, 'mayra reyes', NULL, NULL, '2025-11-05 04:52:28.713148', 1);
INSERT INTO public.contacts VALUES (190, 'jorge torres', '+18137035095', NULL, '2025-11-05 04:52:28.780864', 1);
INSERT INTO public.contacts VALUES (191, 'morgan rowe', NULL, NULL, '2025-11-05 04:52:28.827155', 1);
INSERT INTO public.contacts VALUES (192, 'marciano, dalton chase', NULL, NULL, '2025-11-05 04:52:28.873118', 1);
INSERT INTO public.contacts VALUES (193, 'elijah elliott', NULL, NULL, '2025-11-05 04:52:28.919878', 1);
INSERT INTO public.contacts VALUES (194, 'jazmin caballero', '+18132037719', NULL, '2025-11-05 04:52:28.987992', 1);
INSERT INTO public.contacts VALUES (195, 'brana carlos', NULL, 'charlybrana93@gmail.com', '2025-11-05 04:52:29.057375', 1);
INSERT INTO public.contacts VALUES (196, 'alpizar rosa', NULL, NULL, '2025-11-05 04:52:29.104037', 1);
INSERT INTO public.contacts VALUES (197, 'jonah matos', '+17278152556', NULL, '2025-11-05 04:52:29.174277', 1);
INSERT INTO public.contacts VALUES (198, 'ralph kirk', '+17273593594', 'ralph.kirkjrsretail@gmail.com', '2025-11-05 04:52:29.266093', 1);
INSERT INTO public.contacts VALUES (199, 'sandino lopez daylen', NULL, NULL, '2025-11-05 04:52:29.312132', 1);
INSERT INTO public.contacts VALUES (200, 'odalys alzurez and felix', '+18134389373', NULL, '2025-11-05 04:52:29.385804', 1);
INSERT INTO public.contacts VALUES (201, 'reyes liz k', NULL, NULL, '2025-11-05 04:52:29.433016', 1);
INSERT INTO public.contacts VALUES (202, 'daniel aguilera', NULL, NULL, '2025-11-05 04:52:29.480239', 1);
INSERT INTO public.contacts VALUES (203, 'torrez, pedro', NULL, NULL, '2025-11-05 04:52:29.526661', 1);
INSERT INTO public.contacts VALUES (204, 'marrero, maria judith', '+18134823202', 'marreromiqueo1@gmail.com', '2025-11-05 04:52:29.619661', 1);
INSERT INTO public.contacts VALUES (205, 'sotolongo felix', NULL, 'ramirez.isis85@yahoo.com', '2025-11-05 04:52:29.69031', 1);
INSERT INTO public.contacts VALUES (206, 'paul france', '+17273772046', NULL, '2025-11-05 04:52:29.761058', 1);
INSERT INTO public.contacts VALUES (207, 'ariza maria', NULL, NULL, '2025-11-05 04:52:29.807864', 1);
INSERT INTO public.contacts VALUES (208, 'ali zapata', NULL, 'fitnessportcenter@hotmail.com', '2025-11-05 04:52:29.876659', 1);
INSERT INTO public.contacts VALUES (209, 'rozo, sierra jenny', NULL, NULL, '2025-11-05 04:52:29.923004', 1);
INSERT INTO public.contacts VALUES (210, 'zuluaga guillermo', NULL, NULL, '2025-11-05 04:52:29.969352', 1);
INSERT INTO public.contacts VALUES (211, 'alexa jude', NULL, NULL, '2025-11-05 04:52:30.017286', 1);
INSERT INTO public.contacts VALUES (212, 'lady glamorous nails inc', NULL, NULL, '2025-11-05 04:52:30.064709', 1);
INSERT INTO public.contacts VALUES (213, 'dyhleid service corp', NULL, NULL, '2025-11-05 04:52:30.11245', 1);
INSERT INTO public.contacts VALUES (214, 'arias julio', NULL, 'henry01021974@gmail.com', '2025-11-05 04:52:30.180935', 1);
INSERT INTO public.contacts VALUES (215, 'aguilera dariel', NULL, 'dariel201993@gmail.com', '2025-11-05 04:52:30.294745', 1);
INSERT INTO public.contacts VALUES (216, 'gonzalez oscar a', NULL, NULL, '2025-11-05 04:52:30.342789', 1);
INSERT INTO public.contacts VALUES (217, 'harris, zac', NULL, NULL, '2025-11-05 04:52:30.388441', 1);
INSERT INTO public.contacts VALUES (218, 'munoz alfonso amy', NULL, NULL, '2025-11-05 04:52:30.435328', 1);
INSERT INTO public.contacts VALUES (219, 'castillo, herminio', '+12397382731', NULL, '2025-11-05 04:52:30.505708', 1);
INSERT INTO public.contacts VALUES (220, 'yoel guerra', NULL, 'aguini@yahoo.com', '2025-11-05 04:52:30.575177', 1);
INSERT INTO public.contacts VALUES (221, 'raul pena', '+18134200553', NULL, '2025-11-05 04:52:30.666135', 1);
INSERT INTO public.contacts VALUES (222, 'miranda omar', '+18137514082', 'omiranda@yahoo.com', '2025-11-05 04:52:30.75973', 1);
INSERT INTO public.contacts VALUES (223, 'marquez gonzalez ramses', '+17866268807', 'ramarque@gmail.com', '2025-11-05 04:52:30.852269', 1);
INSERT INTO public.contacts VALUES (224, 'blanca mendez', '+17275634717', 'balensuelablanca431@gmail.com', '2025-11-05 04:52:30.945693', 1);
INSERT INTO public.contacts VALUES (225, 'concha, mary', '+17276575841', 'conchitamary1266@hotmail.com', '2025-11-05 04:52:31.042324', 1);
INSERT INTO public.contacts VALUES (226, 'mariapz1106@gmail.com', '+17277662612', 'mariapz1106@gmail.com', '2025-11-05 04:52:31.134789', 1);
INSERT INTO public.contacts VALUES (227, '(727) 543-5519', '+17275435519', NULL, '2025-11-05 04:52:31.204076', 1);
INSERT INTO public.contacts VALUES (228, '(850) 488-6800', '+18504886800', NULL, '2025-11-05 04:52:31.273804', 1);
INSERT INTO public.contacts VALUES (229, 'nancy', NULL, NULL, '2025-11-05 04:52:31.320095', 1);
INSERT INTO public.contacts VALUES (230, '(727) 845-1024', '+17278451024', NULL, '2025-11-05 04:52:31.388753', 1);
INSERT INTO public.contacts VALUES (231, '(727) 857-2780', '+17278572780', NULL, '2025-11-05 04:52:31.457805', 1);
INSERT INTO public.contacts VALUES (232, '(727) 868-2566', '+17278682566', NULL, '2025-11-05 04:52:31.527075', 1);
INSERT INTO public.contacts VALUES (233, '(855) 292-6719', '+18552926719', NULL, '2025-11-05 04:52:31.598157', 1);
INSERT INTO public.contacts VALUES (234, '(727) 841-6242', '+17278416242', NULL, '2025-11-05 04:52:31.667011', 1);
INSERT INTO public.contacts VALUES (235, '(727) 847-9100', '+17278479100', NULL, '2025-11-05 04:52:31.737607', 1);
INSERT INTO public.contacts VALUES (236, '(813) 279-6526', '+18132796526', NULL, '2025-11-05 04:52:31.810073', 1);
INSERT INTO public.contacts VALUES (237, '(954) 947-4000', '+19549474000', NULL, '2025-11-05 04:52:31.880319', 1);
INSERT INTO public.contacts VALUES (238, '(682) 304-9732', '+16823049732', NULL, '2025-11-05 04:52:31.949186', 1);
INSERT INTO public.contacts VALUES (239, 'stephanie', '+17203803564', NULL, '2025-11-05 04:52:32.018295', 1);
INSERT INTO public.contacts VALUES (240, '(949) 517-7330', '+19495177330', NULL, '2025-11-05 04:52:32.087916', 1);
INSERT INTO public.contacts VALUES (241, 'juan acosta ruiz', '+18133704257', NULL, '2025-11-05 04:52:32.157258', 1);
INSERT INTO public.contacts VALUES (242, 'frank mota', '+17272773300', 'motamota7234@gmail.com', '2025-11-05 04:52:32.249343', 1);
INSERT INTO public.contacts VALUES (243, '(415) 723-4000', '+14157234000', NULL, '2025-11-05 04:52:32.318435', 1);
INSERT INTO public.contacts VALUES (244, '(469) 661-3158', '+14696613158', NULL, '2025-11-05 04:52:32.387045', 1);
INSERT INTO public.contacts VALUES (245, 'yudeyki', '+18134662326', 'yudeykialfonso@gmail.com', '2025-11-05 04:52:32.478917', 1);
INSERT INTO public.contacts VALUES (246, '(727) 242-8008', '+17272428008', NULL, '2025-11-05 04:52:32.547385', 1);
INSERT INTO public.contacts VALUES (247, 'edwin arias', NULL, NULL, '2025-11-05 04:52:32.594308', 1);
INSERT INTO public.contacts VALUES (248, '(877) 613-7864', '+18776137864', NULL, '2025-11-05 04:52:32.665351', 1);
INSERT INTO public.contacts VALUES (249, 'alejandro', NULL, NULL, '2025-11-05 04:52:32.711832', 1);
INSERT INTO public.contacts VALUES (250, 'henry hooo', '+17273253532', 'henera@gmail.com', '2025-11-05 04:52:32.815053', 1);
INSERT INTO public.contacts VALUES (251, 'jaleen gonzalez', NULL, 'jaleen@inboxplace.com', '2025-11-05 04:52:32.884368', 1);
INSERT INTO public.contacts VALUES (252, 'handsome henry', '+17278866654', 'henryhanndsome@gmail.com', '2025-11-05 04:52:32.976036', 1);
INSERT INTO public.contacts VALUES (253, 'alejandro gutierrez', '+17274668056', NULL, '2025-11-05 04:52:33.046316', 1);
INSERT INTO public.contacts VALUES (254, '(352) 754-4190', '+13527544190', NULL, '2025-11-05 04:52:33.116005', 1);
INSERT INTO public.contacts VALUES (255, '(877) 968-7147', '+18779687147', NULL, '2025-11-05 04:52:33.186323', 1);
INSERT INTO public.contacts VALUES (256, '(954) 825-4574', '+19548254574', NULL, '2025-11-05 04:52:33.257626', 1);
INSERT INTO public.contacts VALUES (257, '22395', '+122395', NULL, '2025-11-05 04:52:33.327878', 1);
INSERT INTO public.contacts VALUES (258, 'duniesky rodriguez', '+17864006874', 'duniesky.rodriguez@gmail.com', '2025-11-05 04:52:33.421192', 1);
INSERT INTO public.contacts VALUES (259, '(727) 261-6063', '+17272616063', NULL, '2025-11-05 04:52:33.491732', 1);
INSERT INTO public.contacts VALUES (260, 'amaloa contreras', NULL, NULL, '2025-11-05 04:52:33.538429', 1);
INSERT INTO public.contacts VALUES (261, 'paola perlaza', NULL, NULL, '2025-11-05 04:52:33.631576', 1);
INSERT INTO public.contacts VALUES (262, 'juan acosta', NULL, NULL, '2025-11-05 04:52:33.678211', 1);
INSERT INTO public.contacts VALUES (263, 'cameron green', '+18135859861', 'premierpropertyadvancements@gmail.com', '2025-11-05 04:52:33.771156', 1);
INSERT INTO public.contacts VALUES (264, 'paula silvio', '+16158567069', NULL, '2025-11-05 04:52:33.840326', 1);
INSERT INTO public.contacts VALUES (265, 'cesar rodriguez', '+14086273556', NULL, '2025-11-05 04:52:33.910115', 1);
INSERT INTO public.contacts VALUES (266, 'fredy pulido', '+16693088794', NULL, '2025-11-05 04:52:33.980551', 1);
INSERT INTO public.contacts VALUES (267, 'luis arturo', '+17862266623', 'arturist47@gmail.com', '2025-11-05 04:52:34.073637', 1);
INSERT INTO public.contacts VALUES (268, 'paola', NULL, NULL, '2025-11-05 04:52:34.121496', 1);
INSERT INTO public.contacts VALUES (269, 'susan kucera', '+12013645250', NULL, '2025-11-05 04:52:34.19129', 1);
INSERT INTO public.contacts VALUES (270, 'patricia gorman', NULL, NULL, '2025-11-05 04:52:34.241094', 1);
INSERT INTO public.contacts VALUES (271, 'jeisson and monica quiroga-diaz', '+17272073080', 'taxes@booknex.com', '2025-11-05 04:52:34.333925', 1);
INSERT INTO public.contacts VALUES (272, 'william perez diaz', '+19412263518', 'owili304@gmail.com', '2025-11-05 04:52:34.425885', 1);
INSERT INTO public.contacts VALUES (273, 'henry rodriguez', NULL, 'henryrodriguezramirez180@gmail.com', '2025-11-05 04:52:34.495821', 1);
INSERT INTO public.contacts VALUES (274, 'alberto', '+18639401422', NULL, '2025-11-05 04:52:34.565313', 1);
INSERT INTO public.contacts VALUES (275, 'francess f barchue', '+17278155499', 'francessabdulai3@gmail.com', '2025-11-05 04:52:34.656838', 1);
INSERT INTO public.contacts VALUES (276, 'july botero', '+14074495988', 'yk0155@hotmail.com', '2025-11-05 04:52:34.750273', 1);
INSERT INTO public.contacts VALUES (277, 'darrell collier', '+17279661136', 'brghtgreen369@gmail.com', '2025-11-05 04:52:34.84315', 1);
INSERT INTO public.contacts VALUES (278, 'rosali fernandez rodriguez', '+18134011420', 'rosalitorre@gmail.com', '2025-11-05 04:52:34.933666', 1);
INSERT INTO public.contacts VALUES (279, 'gonzalez rodriguez yailin', '+18136470752', 'yailingr02@gmail.com', '2025-11-05 04:52:35.026325', 1);
INSERT INTO public.contacts VALUES (280, 'orlando guapacha', '+19548122808', 'lilireslo17@hotmail.com', '2025-11-05 04:52:35.124624', 1);
INSERT INTO public.contacts VALUES (281, 'zac harris', '+17277416482', NULL, '2025-11-05 04:52:35.19424', 1);
INSERT INTO public.contacts VALUES (282, 'israel infante', '+18139705434', 'isrraidairi@gmail.com', '2025-11-05 04:52:35.288137', 1);
INSERT INTO public.contacts VALUES (283, 'benijamin kocan', '+17273555997', 'croatia5665@gmail.com', '2025-11-05 04:52:35.38305', 1);
INSERT INTO public.contacts VALUES (284, 'arlene michelle mejia', '+18133528229', NULL, '2025-11-05 04:52:35.4526', 1);
INSERT INTO public.contacts VALUES (285, 'heidy nunez', '+18134557917', 'heidynunez36@gmail.com', '2025-11-05 04:52:35.545515', 1);
INSERT INTO public.contacts VALUES (286, 'nainshari ortiz', '+17276452149', NULL, '2025-11-05 04:52:35.614345', 1);
INSERT INTO public.contacts VALUES (287, 'yeney perez', '+18135507554', 'yeneyperez25@yahoo.com', '2025-11-05 04:52:35.705572', 1);
INSERT INTO public.contacts VALUES (288, 'samanta tipan', '+15512322063', 'samanta.tipanp@gmail.com', '2025-11-05 04:52:35.797922', 1);
INSERT INTO public.contacts VALUES (289, 'jovany angeles', '+17278534278', 'jovany@inboxplace.com', '2025-11-05 04:52:35.894016', 1);
INSERT INTO public.contacts VALUES (290, 'alejandro r batista', '+12016552034', 'chichok24@gmail.com', '2025-11-05 04:52:35.990512', 1);
INSERT INTO public.contacts VALUES (291, 'zachary cantonwine', '+17279196299', 'igetithowiliveit88@gmail.com', '2025-11-05 04:52:36.086187', 1);
INSERT INTO public.contacts VALUES (292, 'chavarriaga katherine', '+17862410892', 'katherinemarie.bella@gmail.com', '2025-11-05 04:52:36.18796', 1);
INSERT INTO public.contacts VALUES (293, 'leidy cruz rodriguez', '+18139003049', 'cruzleidy1983@gmail.com', '2025-11-05 04:52:36.295368', 1);
INSERT INTO public.contacts VALUES (294, 'fenix saldana', '+19417188171', 'mrscarney72@gmail.com', '2025-11-05 04:52:36.415132', 1);
INSERT INTO public.contacts VALUES (295, 'werner cuessi', '+19545362261', 'cuessi.werner3@gmail.com', '2025-11-05 04:52:36.508749', 1);
INSERT INTO public.contacts VALUES (296, 'hector ferrer', '+19188538312', 'hectorferrer@msn.com', '2025-11-05 04:52:36.60134', 1);
INSERT INTO public.contacts VALUES (297, 'kenny j flores', '+17274958034', 'kennyflores371@yahoo.com', '2025-11-05 04:52:36.694223', 1);
INSERT INTO public.contacts VALUES (298, 'yoanner gonzalez leyva', '+17868200283', 'yoannergonzalez1@gmail.com', '2025-11-05 04:52:36.787809', 1);
INSERT INTO public.contacts VALUES (299, 'lian raul gonzalez gonzalez', '+18137702294', 'liangonzalezz1985@gmail.com', '2025-11-05 04:52:36.879558', 1);
INSERT INTO public.contacts VALUES (300, 'william gonzalez gutierrez', '+18138166616', 'william@inboxplace.com', '2025-11-05 04:52:37.000347', 1);
INSERT INTO public.contacts VALUES (301, 'gutierrez gonzalez santiago', '+18138636386', 'sebastian.granco@gmail.com', '2025-11-05 04:52:37.121534', 1);
INSERT INTO public.contacts VALUES (302, 'tyler heveran', NULL, NULL, '2025-11-05 04:52:37.169604', 1);
INSERT INTO public.contacts VALUES (303, 'maida kocan', '+17273640026', 'mayak01yu@gmail.com', '2025-11-05 04:52:37.264597', 1);
INSERT INTO public.contacts VALUES (304, 'john khodhair', '+17275349547', 'johnkhodhair@gmail.com', '2025-11-05 04:52:37.355843', 1);
INSERT INTO public.contacts VALUES (305, 'alejandra leon rosero', '+18138590017', 'alejaleon91@hotmail.com', '2025-11-05 04:52:37.452584', 1);
INSERT INTO public.contacts VALUES (306, 'macyori lopez martinez', '+15033176228', 'macyorilopez@yahoo.com', '2025-11-05 04:52:37.584904', 1);
INSERT INTO public.contacts VALUES (307, 'jorge manes', '+15033474973', 'jorge.manes@yahoo.com', '2025-11-05 04:52:37.678184', 1);
INSERT INTO public.contacts VALUES (308, 'isabel mccafferty', '+17272155270', 'izzymb27@gmail.com', '2025-11-05 04:52:37.773233', 1);
INSERT INTO public.contacts VALUES (309, 'yuliett monserrat', '+18132352397', 'yuliett@therealtyboard.com', '2025-11-05 04:52:37.867552', 1);
INSERT INTO public.contacts VALUES (310, 'jaime ocampo', '+19144267163', 'jaimesorio@gmail.com', '2025-11-05 04:52:37.963707', 1);
INSERT INTO public.contacts VALUES (311, 'teresa pelaez', '+13473190300', 'tpelaez515@gmail.com', '2025-11-05 04:52:38.058682', 1);
INSERT INTO public.contacts VALUES (312, 'milton pelegrin', '+12016201590', 'miltonpele14@gmail.com', '2025-11-05 04:52:38.154238', 1);
INSERT INTO public.contacts VALUES (313, 'janet ramos', '+13523275001', 'janet.428.ramos@gmail.com', '2025-11-05 04:52:38.277709', 1);
INSERT INTO public.contacts VALUES (314, 'elvin rivera velez', '+18132976763', 'elvin@yourfloridapropertyfinders.com', '2025-11-05 04:52:38.371205', 1);
INSERT INTO public.contacts VALUES (315, 'roylis rodriguez', '+18134548062', NULL, '2025-11-05 04:52:38.444134', 1);
INSERT INTO public.contacts VALUES (316, 'henry, colombe schnieder , horchos schniedr', '+17273729003', 'chorchos1@verizon.net', '2025-11-05 04:52:38.539612', 1);
INSERT INTO public.contacts VALUES (317, 'lianet suarez miguel', '+13057630501', 'lianetdoll@gmail.com', '2025-11-05 04:52:38.643313', 1);
INSERT INTO public.contacts VALUES (318, 'dany toledo', '+18133271234', 'dannytoledo201@gmail.com', '2025-11-05 04:52:38.746566', 1);
INSERT INTO public.contacts VALUES (319, 'alexis fernandez', '+14079275486', 'alexisfernandez69@yahoo.com', '2025-11-05 04:52:38.866432', 1);
INSERT INTO public.contacts VALUES (320, 'yosbel romero martinez', '+18136967298', 'yosbelromero11@gmail.com', '2025-11-05 04:52:38.959803', 1);
INSERT INTO public.contacts VALUES (321, 'lourdes tejeda rodriguez', '+18133259862', 'mytigger20@hotmail.com', '2025-11-05 04:52:39.054199', 1);
INSERT INTO public.contacts VALUES (322, 'john aponte', NULL, NULL, '2025-11-05 04:52:39.101223', 1);
INSERT INTO public.contacts VALUES (323, 'perlaza manuel and paola', '+16315687290', 'mpmperlaza@yahoo.com', '2025-11-05 04:52:39.223218', 1);
INSERT INTO public.contacts VALUES (324, 'carlos tramontana', '+18138308998', 'carlostramontanaii@gmail.com', '2025-11-05 04:52:39.321339', 1);
INSERT INTO public.contacts VALUES (325, 'amaris yepes', '+18135683472', NULL, '2025-11-05 04:52:39.402777', 1);
INSERT INTO public.contacts VALUES (326, 'aleyda columbie', '+18134814372', 'alemusibay@icloud.com', '2025-11-05 04:52:39.496528', 1);
INSERT INTO public.contacts VALUES (327, 'armando esquivel', '+18132849206', 'esquivelarmando@icloud.com', '2025-11-05 04:52:39.589618', 1);
INSERT INTO public.contacts VALUES (328, 'eduardo jiménez molinet', '+17272977867', 'edujimenezmoline89@gmail.com', '2025-11-05 04:52:39.681676', 1);
INSERT INTO public.contacts VALUES (329, 'hannah ladin', '+17276881398', 'hannah@inboxplace.con', '2025-11-05 04:52:39.77455', 1);
INSERT INTO public.contacts VALUES (330, 'david mandycz', '+13529420960', NULL, '2025-11-05 04:52:39.846244', 1);
INSERT INTO public.contacts VALUES (331, 'martha arias', '+18622877160', 'martica_arias25@hotmail.com', '2025-11-05 04:52:39.9403', 1);
INSERT INTO public.contacts VALUES (332, 'william burney', '+17133966082', 'williamburney713@gmail.com', '2025-11-05 04:52:40.033096', 1);
INSERT INTO public.contacts VALUES (333, 'jose castro', '+18135504664', 'jc6329317@gmail.com', '2025-11-05 04:52:40.125948', 1);
INSERT INTO public.contacts VALUES (334, 'melisa dont know yet', '+13054077424', 'noemailyet@gmail.com', '2025-11-05 04:52:40.227766', 1);
INSERT INTO public.contacts VALUES (335, 'tanya gomez', '+17875985876', 'gomez1881@gmail.com', '2025-11-05 04:52:40.320069', 1);
INSERT INTO public.contacts VALUES (336, 'osbaldo gonzales', '+15175079925', 'noemail@gmail.com', '2025-11-05 04:52:40.41474', 1);
INSERT INTO public.contacts VALUES (337, 'pierre mura', '+13054070793', 'murapierre@yahoo.com', '2025-11-05 04:52:40.509841', 1);
INSERT INTO public.contacts VALUES (338, 'yenovis jimenez carballosa', '+18139000543', 'jyenovis@gmail.com', '2025-11-05 04:52:40.601666', 1);
INSERT INTO public.contacts VALUES (339, 'saul ortiz soler', '+18133527293', 'saulortiz1121@hotmail.com', '2025-11-05 04:52:40.692615', 1);
INSERT INTO public.contacts VALUES (340, 'verdecia alexis', '+18139176237', 'verdecia1963@yahoo.com', '2025-11-05 04:52:40.785416', 1);
INSERT INTO public.contacts VALUES (341, 'dilan otero', '+17273756866', NULL, '2025-11-05 04:52:40.8562', 1);
INSERT INTO public.contacts VALUES (342, '(813) 710-4150', '+18137104150', NULL, '2025-11-05 04:52:40.927314', 1);
INSERT INTO public.contacts VALUES (343, 'sebastian gutierrez', '+18137242076', NULL, '2025-11-05 04:52:40.99766', 1);
INSERT INTO public.contacts VALUES (344, 'richard sleeper', NULL, NULL, '2025-11-05 04:52:41.113019', 1);
INSERT INTO public.contacts VALUES (345, 'eduardo antonio la rosa padilla', '+16562006759', 'jenicampello@gmail.com', '2025-11-05 04:52:41.205152', 1);
INSERT INTO public.contacts VALUES (346, 'martin c gomez', NULL, 'ericksoftball@gmail.com', '2025-11-05 04:52:41.371173', 1);
INSERT INTO public.contacts VALUES (347, 'daikel suarez', '+18139704791', 'daikelsuarez001@gmail.com', '2025-11-05 04:52:41.470679', 1);
INSERT INTO public.contacts VALUES (348, 'hilarion briceno', '+18133895344', NULL, '2025-11-05 04:52:41.567634', 1);
INSERT INTO public.contacts VALUES (349, 'juan lopez irizarry', '+17276980575', NULL, '2025-11-05 04:52:41.636621', 1);
INSERT INTO public.contacts VALUES (350, 'virginia lee konter', '+17277770623', NULL, '2025-11-05 04:52:41.705751', 1);
INSERT INTO public.contacts VALUES (351, 'patricia l gorman', '+13522936901', 'pattylou226@gmail.com', '2025-11-05 04:52:41.797515', 1);
INSERT INTO public.contacts VALUES (352, 'virgen lucero hernandez-maya', '+17275175001', NULL, '2025-11-05 04:52:41.867033', 1);
INSERT INTO public.contacts VALUES (353, 'richard jackson sleeper jr', '+17278086519', NULL, '2025-11-05 04:52:41.938171', 1);
INSERT INTO public.contacts VALUES (354, 'martin carmelo gomez', '+18134801202', NULL, '2025-11-05 04:52:42.009324', 1);
INSERT INTO public.contacts VALUES (355, 'cruz ronaldo hernandez', '+18136199119', NULL, '2025-11-05 04:52:42.08013', 1);
INSERT INTO public.contacts VALUES (356, 'dany toledo gonzalez', '+18133271415', NULL, '2025-11-05 04:52:42.148593', 1);
INSERT INTO public.contacts VALUES (357, 'jeffrey hilton johnson', '+18135035210', NULL, '2025-11-05 04:52:42.21939', 1);
INSERT INTO public.contacts VALUES (358, 'isleidys mora sanchez', '+18138503553', NULL, '2025-11-05 04:52:42.291314', 1);
INSERT INTO public.contacts VALUES (359, 'mark david harris', '+14843326412', NULL, '2025-11-05 04:52:42.361675', 1);
INSERT INTO public.contacts VALUES (360, 'yuli ariza', NULL, NULL, '2025-11-05 04:52:42.411779', 1);
INSERT INTO public.contacts VALUES (361, 'scott anthony enos', '+15088176681', 'scottenos72@gmail.com', '2025-11-05 04:52:42.508304', 1);
INSERT INTO public.contacts VALUES (362, 'nohora nossa duran', '+17278152368', NULL, '2025-11-05 04:52:42.57801', 1);
INSERT INTO public.contacts VALUES (363, 'tatiani nieves', '+18623682903', NULL, '2025-11-05 04:52:42.651316', 1);
INSERT INTO public.contacts VALUES (364, 'sandro de la pera rodriguez', '+17277882802', NULL, '2025-11-05 04:52:42.721611', 1);
INSERT INTO public.contacts VALUES (365, 'ruben correa ortiz', '+17277394274', NULL, '2025-11-05 04:52:42.790026', 1);
INSERT INTO public.contacts VALUES (366, 'lester fornet', '+17864060743', NULL, '2025-11-05 04:52:42.882301', 1);
INSERT INTO public.contacts VALUES (367, 'juan gutierrez', NULL, 'juansebastiangutierrezbaq@gmail.com', '2025-11-05 04:52:42.951401', 1);
INSERT INTO public.contacts VALUES (368, 'santiago gutierrez gonzalez', NULL, NULL, '2025-11-05 04:52:42.998462', 1);
INSERT INTO public.contacts VALUES (369, 'jose carlos romero ortega', '+12016811821', NULL, '2025-11-05 04:52:43.068629', 1);
INSERT INTO public.contacts VALUES (370, 'david alexander aguilar del castillo', '+15029361004', NULL, '2025-11-05 04:52:43.147435', 1);
INSERT INTO public.contacts VALUES (371, 'marco antonio castellon jr', '+17188640204', NULL, '2025-11-05 04:52:43.2162', 1);
INSERT INTO public.contacts VALUES (372, 'yulitza f perez bravo', '+18138334851', NULL, '2025-11-05 04:52:43.28574', 1);
INSERT INTO public.contacts VALUES (373, 'yemma gallardo pedreira', '+18139657789', NULL, '2025-11-05 04:52:43.356351', 1);
INSERT INTO public.contacts VALUES (374, 'anderson andres perez bravo', '+17273541540', NULL, '2025-11-05 04:52:43.426523', 1);
INSERT INTO public.contacts VALUES (375, 'terianne bernal', '+17865255081', NULL, '2025-11-05 04:52:43.497217', 1);
INSERT INTO public.contacts VALUES (376, 'nadia perez', '+13525735978', NULL, '2025-11-05 04:52:43.569936', 1);
INSERT INTO public.contacts VALUES (377, 'jovani peter valdes', '+13212800474', NULL, '2025-11-05 04:52:43.640494', 1);
INSERT INTO public.contacts VALUES (378, 'elvira soto', '+19173629915', NULL, '2025-11-05 04:52:43.709506', 1);
INSERT INTO public.contacts VALUES (379, 'gabriela trujillo-layrisse', '+17279029498', NULL, '2025-11-05 04:52:43.781154', 1);
INSERT INTO public.contacts VALUES (380, 'domingo gomez gomez', '+17273628116', NULL, '2025-11-05 04:52:43.850734', 1);
INSERT INTO public.contacts VALUES (381, 'hilario b lopez king', '+12014551706', NULL, '2025-11-05 04:52:43.919247', 1);
INSERT INTO public.contacts VALUES (382, 'teresa scull', '+18138935384', NULL, '2025-11-05 04:52:43.988031', 1);
INSERT INTO public.contacts VALUES (383, 'pedro castillo', NULL, NULL, '2025-11-05 04:52:44.035068', 1);
INSERT INTO public.contacts VALUES (384, 'orialys cabrera', '+15082982345', 'orialyscabrera@outlook.com', '2025-11-05 04:52:44.127573', 1);
INSERT INTO public.contacts VALUES (385, 'emma aponte', '+13522388367', 'emma@inboxplace.com', '2025-11-05 04:52:44.221876', 1);
INSERT INTO public.contacts VALUES (386, 'fernando vazquez', '+17273171733', NULL, '2025-11-05 04:52:44.291313', 1);
INSERT INTO public.contacts VALUES (387, 'irs pract. hotline', '+18668604259', NULL, '2025-11-05 04:52:44.360333', 1);
INSERT INTO public.contacts VALUES (388, 'martha daza', '+16616440606', 'mdaza007@gmail.com', '2025-11-05 04:52:44.452394', 1);
INSERT INTO public.contacts VALUES (389, '(813) 929-2780', '+18139292780', NULL, '2025-11-05 04:52:44.52276', 1);
INSERT INTO public.contacts VALUES (390, 'Test New Contact', '555-9999', 'test.new@example.com', '2025-11-05 05:09:13.645636', 1);
INSERT INTO public.contacts VALUES (15, 'uWSko- Updated', '555-1234', 'updated@test.com', '2025-11-04 06:36:54.767291', 1);
INSERT INTO public.contacts VALUES (392, 'Jane Doe TuVzn8', NULL, 'jane+tIKn@example.com', '2025-11-05 05:31:16.749164', 1);
INSERT INTO public.contacts VALUES (393, 'Test Contact OwpffX', '555-0004', 'test4+hgG5@example.com', '2025-11-05 05:32:55.544519', 1);
INSERT INTO public.contacts VALUES (394, 'Test Contact', '+15551234567', 'test@example.com', '2025-11-06 05:34:39.0069', 1);
INSERT INTO public.contacts VALUES (395, 'Jane Smith', '+15559876543', 'jane.smith@example.com', '2025-11-06 05:41:02.082686', 1);
INSERT INTO public.contacts VALUES (396, 'Mike Johnson', '+15551112222', 'mike@example.com', '2025-11-06 05:54:18.442131', 1);
INSERT INTO public.contacts VALUES (398, 'testddaf', 'testasdfasd', 'tsdafest@gmail.com', '2025-11-18 04:59:56.978134', 1);
INSERT INTO public.contacts VALUES (399, 'dsfa', 'asdfdasf', 'g@gmail.com', '2025-11-19 00:17:47.926284', 1);
INSERT INTO public.contacts VALUES (397, 'AUSTIN R OTERO', '17273648783', 'austin@inboxplace.com', '2025-11-06 06:05:01.170211', 1);
INSERT INTO public.contacts VALUES (400, 'SMS Test Contact Ygv4VK', '+17271234567', 'smstest_oygpl4@example.com', '2025-11-19 19:38:01.691555', 16);
INSERT INTO public.contacts VALUES (401, 'Test User Phone unHl', '+17272374096', 'testphone_FtPyRf@example.com', '2025-11-19 19:44:00.890591', 17);
INSERT INTO public.contacts VALUES (402, 'Verified Phone Test', '+17272374096', 'verified_PtM5Sm@example.com', '2025-11-19 19:54:28.280934', 18);
INSERT INTO public.contacts VALUES (403, 'austin otero aaaa', '7273648783', NULL, '2026-01-29 17:04:43.073316', 1);
INSERT INTO public.contacts VALUES (404, 'APP Test Client WSRQYR', '7567889799', NULL, '2026-01-30 15:23:13.35139', 1);


--
-- Data for Name: kanban_columns; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.kanban_columns VALUES (57, 'Test Col A', 1, 6, '2025-11-10 18:07:16.745426');
INSERT INTO public.kanban_columns VALUES (60, 'test', 0, NULL, '2025-11-13 05:58:12.039221');
INSERT INTO public.kanban_columns VALUES (61, 'sf', 0, 8, '2025-11-13 05:58:24.948479');
INSERT INTO public.kanban_columns VALUES (62, 'tset', 1, 8, '2025-11-13 05:58:26.814749');
INSERT INTO public.kanban_columns VALUES (63, 'tsdfsf', 2, 8, '2025-11-13 05:58:28.524053');
INSERT INTO public.kanban_columns VALUES (64, 'sdfas', 3, 8, '2025-11-13 05:58:32.267225');
INSERT INTO public.kanban_columns VALUES (65, 'asdfadsfasd', 4, 8, '2025-11-13 05:58:34.145653');
INSERT INTO public.kanban_columns VALUES (66, 'asdfsaf', 5, 8, '2025-11-13 05:58:36.125723');
INSERT INTO public.kanban_columns VALUES (67, 'k', 2, 6, '2025-11-18 23:47:45.632212');


--
-- Data for Name: meeting_notes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.meeting_notes VALUES (2, 34, 'Test meeting note 1', '2025-11-12 04:32:46.596294', 0);
INSERT INTO public.meeting_notes VALUES (3, 35, 'test hjk', '2025-11-12 04:41:46.642279', 0);
INSERT INTO public.meeting_notes VALUES (4, 35, 'this is what the note is going to be', '2025-11-12 04:42:01.124869', 0);
INSERT INTO public.meeting_notes VALUES (8, 47, 'make phone call', '2025-12-04 17:12:00.151815', 0);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.users VALUES ('c6e48136-b2e8-4921-a70b-4a13c02864ae', NULL, 'Test', 'User', NULL, '2025-11-19 06:18:00.371518', '2025-11-19 06:18:00.371518', 'SKlS3y@example.com', '6dd20cc5fd8e1b12df6b6488962a5b4d7defcb32e96b080da4c0015ae759567b569c168c69bdebb2a4aeb5edf10d037df61ac718dcba1bf6d40e8707616cd9b1.513965abfce76b82387aaf33bc22b659');
INSERT INTO public.users VALUES ('dfdb3e62-1b7a-44d6-9744-99c987797700', 'testuser@example.com', 'Test', 'User', NULL, '2025-11-12 16:38:31.245457', '2025-11-12 16:38:31.245457', 'testusereyFyCk', '7cc78b5a00e31a628a3132513195190598f9c4b94c9c09ddcbf469fb064e22662a7785dfcce85548f8e54f55da8f7d478883769cfd782c1d88a829465bc8aa2e.25a20601de40bd5e2c4a88eac7486aca');
INSERT INTO public.users VALUES ('13d892f2-3ba0-4624-b3ef-04023157a455', '6asotC@example.com', 'John', 'Doe', NULL, '2025-11-19 06:21:30.793638', '2025-11-19 06:21:30.793638', '6asotC@example.com', '177af74dd575b85c214aae56de94d243f6f2d11844f70fe3b141b3f11d323b1bad6a939189cedd2d268ffa63df713a9e0f93d46d6b94fd52fbf5f9ffaaccd7a9.ed7890d13f844f86ae610a63210367ad');
INSERT INTO public.users VALUES ('beff76a2-9473-4333-bdf8-66a005693417', 'newuser@test.com', 'New', 'User', NULL, '2025-11-12 21:07:18.226432', '2025-11-12 21:07:18.226432', 'newuser@test.com', '0');
INSERT INTO public.users VALUES ('502ed2eb-4540-4ce6-b660-6a77a851a77b', 'austin@inboxplace.com', 'austin', 'otero', NULL, '2025-11-12 18:20:27.611614', '2025-11-12 18:20:27.611614', 'austin@inboxplace.com', '1515e605ad0f9ba092287c1e3c15ce82a817c1553e8061d2a3f5808c3ea9f206d341b5d8224886b85268774be13049124f7cb8feb2fdf14c829cd9199b07c7ce.e861f16c7f5796ca837aa1d59ebe560b');
INSERT INTO public.users VALUES ('849e178d-c8f5-4358-8d20-cbb50e487aef', NULL, 'austin', 'otero', NULL, '2025-11-13 01:29:11.688747', '2025-11-13 01:29:11.688747', 'novology3@gmail.com', '910da7243017cead71b56b65eab9213f8562171ddd20e1fc511bc21f5b27b6e1c0c1d855b382c9ce6e6bd727e9d2a2aad5f67dee35bb41ccf225123ca09a8b74.828807a61e4ffda523af0375ae504976');
INSERT INTO public.users VALUES ('3a644b02-5eab-4081-b0b1-62740008f61b', NULL, 'Test', 'User', NULL, '2025-11-13 03:36:03.210187', '2025-11-13 03:36:03.210187', 'testuser_4VVIqH', 'be6561ec4d3ae50310fffc4b3204a79a6ce634b1359b346aa962981d2a7f58df0354ca2363aedbdfdaecb93ee1766a9b0cee079fa3f476135b2b96eac1450447.a0965909f036e40dc0ef552828dfbfbc');
INSERT INTO public.users VALUES ('d6c57189-06d5-47ab-84e7-e6c03cdef4f9', 'user1_CHw9bb@test.com', 'Test', 'User One', NULL, '2025-11-13 21:13:51.250079', '2025-11-13 21:13:51.250079', 'testuser1_UBzTtr', '2969a9942c3133e145d6fdb6b0ce729782df495a96fdb836674f6fe8940931a66205508f8eba11ef6a2d0b685572303515b9a8ce5f8b311deca38e622b482b96.aa190bd864857e2975fb51b0f7ef5a21');
INSERT INTO public.users VALUES ('32d8aa48-8ea7-44de-bf83-ecd9478c3ed0', 'user2_ZSQpkk@test.com', 'Second', 'User Two', NULL, '2025-11-13 21:13:51.636068', '2025-11-13 21:13:51.636068', 'testuser2_GUvY06', 'a17d96cb52b9edfb5092a8066e227b42ebe78f04e92db4f94af84369614f64c249f9b47790ee01ad6f16312da5ab22f3ed99c6fed169631fb297bccc838bfb24.f74884307913f551c653874f25c8ab4d');
INSERT INTO public.users VALUES ('1ada374e-c608-4c2c-a94e-e6ac5a0b4055', 'user1_69g6Pz@test.com', 'Test', 'User One', NULL, '2025-11-13 21:20:35.481328', '2025-11-13 21:20:35.481328', 'testuser1__bT5yy', 'e9a6df4779e71f7d04f8e5556707108293d3f32503f8fe27142a87bbecc1110c9e17ce6f050f087a3a35ddff994b00150b1a8c960fd408634b94340afe22b103.50ddfc62cf8688b935ee4303d0b744c9');
INSERT INTO public.users VALUES ('3afedcf4-81d0-493e-8bc9-e3cddc206330', NULL, 'testtest', 'testtest', NULL, '2025-11-19 18:49:26.269932', '2025-11-19 18:49:26.269932', 'testtest', '371ba3fbf3a3d8b32b69a327bf29c9c1ea7e7e29bb4c8f962d5bd85e7876b229cf21b9bafe70fba5af42be0990f33044ccbe3f6ee0cc1c09c2aa8b84d3fab052.9955aeab56bc6504677978031d21a39c');
INSERT INTO public.users VALUES ('c039a614-a4a5-4b19-893b-fec9320c0308', 'user2_pSffO1@test.com', 'Modified', 'ByUserOne', NULL, '2025-11-13 21:20:47.110653', '2025-11-13 21:23:54.82', 'testuser2_fppMqx', '62380021506fba64818df928b1ceabe9543b026c8263d334fa67029f363f1e1501b0a5394ae82c66c422428aaa4f9b75b7f8044675c91fac4f42880d956e0344.4cef7df94e32d9ae56f7afdbec9e06f4');
INSERT INTO public.users VALUES ('d2dad711-4de5-4c69-86d1-079389f62ad3', NULL, 'John', 'Doe', NULL, '2025-11-18 22:58:49.56033', '2025-11-18 22:58:49.56033', 'DOlV91@example.com', '55b644cf045ae55fd3c48324f961fbb5dd1fa64ca8d007a215eae1d6e48bc498f00fb77678b138e7c9695f09b660676e2daf47072a8726d1f5ff785957bbe723.fb7829874e752d06fa5a19b58c88e441');
INSERT INTO public.users VALUES ('test-user-debug', 'debug@test.com', NULL, NULL, NULL, '2025-11-18 23:55:52.943465', '2025-11-18 23:55:52.943465', 'debuguser', 'hashedpass');
INSERT INTO public.users VALUES ('0cb9f33a-34e9-44b4-9368-8c6d3399229d', NULL, 'Test', 'User', NULL, '2025-11-19 03:49:35.727098', '2025-11-19 03:49:35.727098', 'testuser_UDOc', '52172c1ea2deecbdf4bdee39608ed903e39f11ea761e0ab2b2bc5b050b17e4b878ddc51c189a22884b922afb2973829ea25ba7c88e6f6c2a1f79965acd63195b.b55904255d5d3cfceadb352e264b11a3');
INSERT INTO public.users VALUES ('c6a5c51d-e543-4057-84a5-631e376d0599', NULL, 'Test', 'User', NULL, '2025-11-19 04:09:59.874171', '2025-11-19 04:09:59.874171', 'SMPC34', '46e7e3ca53201b899c6fd089d693ee7d79a8a04c96a85d6902e66f96b01d85bd02a96f7722da4131d590602f3a0edffd515906e4d694685ed7d2216001f2a172.d2e72e8afe9a71b538d14d24a76ba1c3');
INSERT INTO public.users VALUES ('722717a4-9c88-4e85-a5e3-7318be95d920', NULL, 'Test', 'User', NULL, '2025-11-19 04:14:26.553488', '2025-11-19 04:14:26.553488', 'Jiaa48', 'fb91706d968fbce79c5c6b6524781e76cb603ad6468a05de3c1cdab09312237088566a8598a0ce331297da048bcd1cc7a9d134fb761c90b3e736c0ff81ca4975.b349bda12c923112bc61f02909dc6002');
INSERT INTO public.users VALUES ('efd220e0-aba5-4c4d-82c3-56b2fa4b4697', 'testuser2@example.com', 'Test', 'User', NULL, '2025-11-19 04:45:51.710716', '2025-11-19 04:45:51.710716', 'testuser2', 'd1ce23ba53cb35dac3421b0302f2e4d0ac0e2cf3c0209d1eb997f79929c948a3d7dc13c22574168cc611e0d32744846ce03481a444cf5cc9ff3b67be8b492dfd.133f8de87bb94db195b6a4cce4068d7c');
INSERT INTO public.users VALUES ('5408b295-5be0-41c0-abe0-8d63ee8f64b8', NULL, 'Test', 'User', NULL, '2025-11-19 05:50:47.571653', '2025-11-19 05:50:47.571653', 'testuser_aXUuQk', 'a7af34b75ed31d31e86dd5c6d20729a6f27c6e93e5c0b837f62d311c92e109da7e7f35e88cdbc6ca1208e2e729f8f489b3bacee6a2dea73173e973d09334f833.0c3f51a8cc6523b6ad5de65401e799da');
INSERT INTO public.users VALUES ('a0173a8e-2ee1-4a84-96a0-8addb4194ec5', NULL, 'John', 'Doe', NULL, '2025-11-19 06:08:24.6147', '2025-11-19 06:08:24.6147', '-ROk5O@example.com', 'f0359f3fb7123e70cd0801afba0aa03f26024897a0699a18bd8911f36be150ec092a85bc749e4ede0e3011552cd4da4f1f1e620603dc27f09b28a3c5c4ca29cc.a4411c95a89210656a8d5885d45ac74d');
INSERT INTO public.users VALUES ('61f0863a-aa8a-4e3d-b89a-d1a2fe7dca76', NULL, 'Test', 'User', NULL, '2025-11-19 06:10:59.155696', '2025-11-19 06:10:59.155696', 'user_VfTJfG', '72054b05c582532de05a8d8a97b54b24ea3c1e2c9eca746f387a0390b636fffc103c39c3500357a822995fd8d538361ad10b59c96dac2aea158ff0ceee13d287.a4ffa8f0f74b40af6437a8a5d0cb2124');
INSERT INTO public.users VALUES ('a2d057b0-4d1e-4801-bba2-ac42df9f5cfe', NULL, 'Test', 'User', NULL, '2025-11-19 06:14:45.405295', '2025-11-19 06:14:45.405295', 'testuser_p_7Lv', '4696b08fbd2cd4a3046d96f0e5547b88437201bf034e6b3dedb50ac5a8e7aaa4bbbbab232a4eab851b97aab70de3e493ad045239a10f453ea0258e774028f0c2.ac59f751d7beec510794eba230c025c2');
INSERT INTO public.users VALUES ('d90a3b20-5fed-44ab-8ad6-5a4832bc2b59', NULL, 'Test', 'User', NULL, '2025-11-19 18:57:42.224462', '2025-11-19 18:57:42.224462', 'newtestuser_l6Qr', '842e2cdc1477d279a53f6281ca1e3f9feab9723f3d46d60d3275d260378c7e1e4c8f00eb90a215e28a3d9f5fa5bd428846cfcba9c47dff70e0c28502a4dc1b61.6b501c059ee5af6008dc58375c44f44a');
INSERT INTO public.users VALUES ('49b41097-208e-44bd-84ec-c5046c1b87ae', 'autoadmin_dkiV@example.com', 'Auto', 'Admin', NULL, '2025-11-19 18:59:24.480923', '2025-11-19 18:59:24.480923', 'autoadmin_dkiV', 'c92d9dcfa3c5ef8b1da12a536db322902462143f31e243e3fc799f5069fda076b2fba0b5b58428acdf0ffde75da405b29630279b073d4c51c8f4d0bcd0076572.0ed094b5f1afb3afb0875c96fb098210');
INSERT INTO public.users VALUES ('4f3a12da-cef2-4b66-839f-7e88f558c017', NULL, 'dylan', 'otero', NULL, '2025-11-19 19:35:14.528919', '2025-11-19 19:35:14.528919', 'dylan', '19851442a7142ee8d0bcd9df855874fb5b9703abb7df467e5f13c7b037f4aa3c0d0441adb3b3aaf889833c0c2d334f56ab55f431ba3dc1f82df7af0baf4549c8.e615a9e020dab3154fd8ba58450daa66');
INSERT INTO public.users VALUES ('2bca1a10-dc86-42e9-90f1-91d38a987228', NULL, 'Test', 'User', NULL, '2025-11-19 19:36:32.645236', '2025-11-19 19:36:32.645236', 'testuser_7RAdDT', 'ec2f58111ae4dbc0361513710b843db4a9b96e0d3c92ec14f2d2133cbac01a87578000f6760fa46ea24888e4305ab9ad9e0eb39e75822547d84948f7aae6a7ff.333a6d07e0d4816bc8b552a4d73bcb6a');
INSERT INTO public.users VALUES ('172d064e-72bb-4b31-91ca-e50c0b5a3862', NULL, 'SMS', 'Tester', NULL, '2025-11-19 19:42:26.38343', '2025-11-19 19:42:26.38343', 'smstest_oOiFib', 'b96dd0409aad99d0e4bf881997dcec8fc07823844aefa687fd5185be396e9931e37ca34372e93e28683aec4bbf51d1947fc1fe2f875ee4a86b3cd03ba2ae038f.89e473e0a6837f9dcf519349fa603868');
INSERT INTO public.users VALUES ('21301228-d482-4ff0-a76c-a2942cc6b3a3', NULL, 'SMS', 'Verified', NULL, '2025-11-19 19:52:37.588375', '2025-11-19 19:52:37.588375', 'smsverify_-zWlu2', '04d6f1b22f46568f9755aa80e7c3f239ef2d1d9d47cd7081c7b0288cb6d178e1a34f924cba36991c0b67e85bbad70c2d7fd7bc61742bc0caa3e12e557023436a.9913b260e72d8ce90bacb260b7c9edd6');
INSERT INTO public.users VALUES ('d9233bbe-b703-4755-af24-bb602a1894d0', NULL, 'Edit', 'Test', NULL, '2025-12-01 20:25:48.393449', '2025-12-01 20:25:48.393449', 'edituser_Pxr4Dy', '11f02ce54df4ea18cb6528590286e4348f617c65e2787f21fd1a3f8e70fb6417978217ed522ce5d237ce88dcc2fd02e5c9f10813833568e9f00888410390cb1d.73468728beb1e55d899802e1e3e95027');
INSERT INTO public.users VALUES ('a4c2082f-f1eb-4da6-84a3-98758bb14e2d', NULL, 'Profile', 'Test', NULL, '2025-12-01 20:31:12.420552', '2025-12-01 20:34:05.149', 'profiletest_HoE_pK', '580324a6fef4dad685e986342a7d14662938c7a6c7ca6be47ce23a5d4fbdd99fe1d264968110695f81319d7606ec2d263a94cce0f6f83418cb9083f4f23553f9.2f81fe8606c0e6bbeba2fd3bf867e195');
INSERT INTO public.users VALUES ('81708ad7-84af-4ac5-a9c8-6426fa269a3f', NULL, 'Final', 'Test', NULL, '2025-12-01 20:38:20.820171', '2025-12-01 20:38:20.820171', 'finaltest_aPWRQS', 'f422be1b16999aa73796f46f0717e28c6c8b572a81b4df11989ab25ae26884a050d2a4c59ca483f6dc5c9fa775f356bf23c8200b2727d8eb4127fff844972254.14e4131d372db0953b1d69bdc4b54bca');
INSERT INTO public.users VALUES ('989c82fb-fa26-422e-8399-9a6c277d14be', '', 'Fixed', 'Test', NULL, '2025-12-01 20:40:30.650424', '2025-12-01 20:43:21.133', 'updated_dXivef', 'a94d493ae8b7206e75c08b269eeea94cab2202123564265320cba0a8b717887900f5f4bbb1c9d99c4b73b476f7d0a52cb43ba8203452c713d1ef3fb551398c8a.bd81a369f19d051e3a7fd14355a23f47');
INSERT INTO public.users VALUES ('d7358772-38e6-4c15-851e-5711c070bd9d', NULL, 'User', 'Alpha', NULL, '2025-12-02 03:12:11.520201', '2025-12-02 03:12:11.520201', 'userA_oom74z', '9bfacb8e351239f0e91b32f8a757ed309c3ab29b7c239cf1dfc49bb2c147f40ab34d0a0e185b82dbf5733bccc48457a1574f27b66c5bcf49b83cb65130f043ed.42414c6abe295a9510704c91dcdec769');
INSERT INTO public.users VALUES ('4e4a2b00-569e-40fc-a610-4cb1fd8ac6b9', NULL, 'User', 'Beta', NULL, '2025-12-02 03:13:56.146473', '2025-12-02 03:13:56.146473', 'userB_8rP-HV', '832501b30029282afb17dac6b9c8acd73340e5361366dd5b82ee050cd9d52debef6cfeacd902888a7156820b34a60e9aa9893c01632a91dbf881f2f6789851a7.512d6c670fa3ab511b22845889cbbc9e');
INSERT INTO public.users VALUES ('4b4ed7e2-19d3-46d8-8eb0-0e6d7aa89d21', NULL, 'User', 'Alpha', NULL, '2025-12-02 03:17:56.15188', '2025-12-02 03:17:56.15188', 'userA_wahNRF', '13a1c1bc34fbbb7e402d12243989321f678d6cd68bc65e28aceacc934ba9518050a0a7450e75cf6bc0de28a072470670e27093a00179619edca676d8f924fc27.cf640db2b80f2f31085b9e9ded46383b');
INSERT INTO public.users VALUES ('dddb5dae-93c3-4b78-8fdc-39d5c0f6c95c', NULL, 'User', 'Beta', NULL, '2025-12-02 03:20:20.489882', '2025-12-02 03:21:14.002', 'userB_new_v4bSs8', 'b4df33d1a3f9f63e9b8a71a4dbf1a7de7c83da00abb55d796c014b8a69b08561eb3f6f8642626411d5bacc44b96b0ea540a9420cdafe4090adb9e5b22d3ea718.177d3c180ac6a4adfc39413bfc04bca5');
INSERT INTO public.users VALUES ('72642430-cf1b-404e-aaae-5bbd10ee8abb', NULL, 'Test', 'User', NULL, '2025-12-04 16:42:06.812689', '2025-12-04 16:42:06.812689', 'testuser', '0fff71c1ae4d2c2381af554121f4cfb3ba75c08281e104c19b2d560bce5e69598215ea3917b9ffd6ce9ffcb347bcf7730605e91fffe467f420677d191d904fb7.6360fd455b817a0b6a7de1bbfdc71566');
INSERT INTO public.users VALUES ('0d66b92a-302a-41c4-ae69-c45bc8746b48', NULL, 'aaa', 'ooo', NULL, '2025-12-09 03:36:01.969409', '2025-12-09 03:36:01.969409', 'aaa', 'a21c3b500fa97fe213801d0cb2f553745060af4def55b718acf91099000547bbded60af8d7a470729cc7534deb6f9e1f178a202768313f237d8109b09cbbf49b.704d7264539a4bde0620ad589952d02e');
INSERT INTO public.users VALUES ('3045a5c9-6a2a-49fc-93bf-9fbc4f3d5126', NULL, 'okok', 'okok', NULL, '2025-12-17 18:33:13.723952', '2025-12-17 18:33:13.723952', 'okok', 'aafe2a4bf7d93149db90fb01d8c22a59bb6e8f367534f8c1565a4c21812157fc6d6828a210075a6dfdc10519c788887e7e8d360c88732e820e8d992d14954b0c.3d1b272c5b853a716efba8a35b6f3235');
INSERT INTO public.users VALUES ('8fcd41a8-83bb-4939-bbf3-0fb2a9d5c470', NULL, 'John', 'Doe', NULL, '2026-01-29 22:28:01.794941', '2026-01-29 22:28:01.794941', 'uID6tG@example.com', 'ccc92c7dba376a4d49b6131867dd76f14032c703fb50617288f4224cbcf72292ff05b7bd45ca46cf6774ab602d59a1965e282b4e1724e347cf94d89b9513dd26.bb81dcefb1abbcf7f0208be7c3c2d689');


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.opportunities VALUES (30, 'testddaf', 'test', '2025-11-18 04:59:57.11646', 398, 57, 0, '502ed2eb-4540-4ce6-b660-6a77a851a77b');
INSERT INTO public.opportunities VALUES (31, 'dsfa', 'asda', '2025-11-19 00:17:48.197396', 399, 57, 0, '3a644b02-5eab-4081-b0b1-62740008f61b');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.sessions VALUES ('y_27zT-YYI_sAdUgbr2LEZ1xDjb0kx0i', '{"cookie": {"path": "/", "secure": true, "expires": "2026-02-05T16:58:24.589Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}, "passport": {"user": "849e178d-c8f5-4358-8d20-cbb50e487aef"}}', '2026-02-06 22:54:57');
INSERT INTO public.sessions VALUES ('lj6WisYO_c7Gmy66wWhyquL5fM9wAL4J', '{"cookie": {"path": "/", "secure": true, "expires": "2026-02-05T22:28:02.000Z", "httpOnly": true, "sameSite": "none", "originalMaxAge": 604800000}, "passport": {"user": "8fcd41a8-83bb-4939-bbf3-0fb2a9d5c470"}}', '2026-02-05 22:28:03');


--
-- Data for Name: status_filters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.status_filters VALUES (33, 'CHECKLIST STATUS', 24, 0, '2025-12-04 17:02:13.489091', 0);
INSERT INTO public.status_filters VALUES (3, 'NEEDS LENDER', 2, 0, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (4, 'NEEDS LENDER', 3, 0, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (5, 'NEEDS LENDER', 4, 0, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (6, 'NEEDS LENDER', 5, 0, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (7, 'NEEDS LENDER', 6, 0, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (9, 'APP-INTAKE', 2, 1, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (10, 'APP-INTAKE', 3, 1, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (11, 'APP-INTAKE', 4, 1, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (12, 'APP-INTAKE', 5, 1, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (13, 'APP-INTAKE', 6, 1, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (15, 'PRE-APPROVED', 2, 2, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (16, 'PRE-APPROVED', 3, 2, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (17, 'PRE-APPROVED', 4, 2, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (18, 'PRE-APPROVED', 5, 2, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (19, 'PRE-APPROVED', 6, 2, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (21, 'APPROVED W/ CONDITIONS', 2, 3, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (22, 'APPROVED W/ CONDITIONS', 3, 3, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (23, 'APPROVED W/ CONDITIONS', 4, 3, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (24, 'APPROVED W/ CONDITIONS', 5, 3, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (25, 'APPROVED W/ CONDITIONS', 6, 3, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (27, 'LOAN SETUP', 2, 4, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (28, 'LOAN SETUP', 3, 4, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (29, 'LOAN SETUP', 4, 4, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (30, 'LOAN SETUP', 5, 4, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (31, 'LOAN SETUP', 6, 4, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (26, 'LOAN SETUP', 1, 0, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (1, 'URGENT CASES', 1, 1, '2025-11-10 22:48:47.185602', 0);
INSERT INTO public.status_filters VALUES (2, 'NEEDS LENDER', 1, 2, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (20, 'APPROVED W/ CONDITIONS', 1, 3, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (14, 'PRE-APPROVED', 1, 4, '2025-11-10 22:55:02.905273', 1);
INSERT INTO public.status_filters VALUES (8, 'APP-INTAKE', 1, 5, '2025-11-10 22:55:02.905273', 1);


--
-- Data for Name: user_companies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.user_companies VALUES ('dfdb3e62-1b7a-44d6-9744-99c987797700', 9, 'owner', '2025-11-12 16:38:31.353893');
INSERT INTO public.user_companies VALUES ('502ed2eb-4540-4ce6-b660-6a77a851a77b', 10, 'owner', '2025-11-12 18:20:27.709114');
INSERT INTO public.user_companies VALUES ('502ed2eb-4540-4ce6-b660-6a77a851a77b', 1, 'owner', '2025-11-12 18:23:26.529933');
INSERT INTO public.user_companies VALUES ('dfdb3e62-1b7a-44d6-9744-99c987797700', 11, 'owner', '2025-11-12 20:54:45.551896');
INSERT INTO public.user_companies VALUES ('849e178d-c8f5-4358-8d20-cbb50e487aef', 12, 'owner', '2025-11-13 01:29:11.76472');
INSERT INTO public.user_companies VALUES ('beff76a2-9473-4333-bdf8-66a005693417', 1, 'member', '2025-11-13 03:08:23.485796');
INSERT INTO public.user_companies VALUES ('3a644b02-5eab-4081-b0b1-62740008f61b', 1, 'member', '2025-11-13 03:39:08.010871');
INSERT INTO public.user_companies VALUES ('beff76a2-9473-4333-bdf8-66a005693417', 10, 'member', '2025-11-13 21:04:11.852521');
INSERT INTO public.user_companies VALUES ('d6c57189-06d5-47ab-84e7-e6c03cdef4f9', 13, 'owner', '2025-11-13 21:14:57.998339');
INSERT INTO public.user_companies VALUES ('32d8aa48-8ea7-44de-bf83-ecd9478c3ed0', 13, 'member', '2025-11-13 21:16:59.117876');
INSERT INTO public.user_companies VALUES ('1ada374e-c608-4c2c-a94e-e6ac5a0b4055', 14, 'owner', '2025-11-13 21:21:24.15497');
INSERT INTO public.user_companies VALUES ('c039a614-a4a5-4b19-893b-fec9320c0308', 14, 'member', '2025-11-13 21:21:24.320888');
INSERT INTO public.user_companies VALUES ('849e178d-c8f5-4358-8d20-cbb50e487aef', 1, 'member', '2025-11-18 23:51:08.970186');
INSERT INTO public.user_companies VALUES ('test-user-debug', 1, 'member', '2025-11-18 23:55:52.976428');
INSERT INTO public.user_companies VALUES ('3a644b02-5eab-4081-b0b1-62740008f61b', 2, 'member', '2025-11-19 16:16:11.750764');
INSERT INTO public.user_companies VALUES ('3a644b02-5eab-4081-b0b1-62740008f61b', 5, 'member', '2025-11-19 16:16:12.901026');
INSERT INTO public.user_companies VALUES ('d90a3b20-5fed-44ab-8ad6-5a4832bc2b59', 15, 'owner', '2025-11-19 18:58:23.503696');
INSERT INTO public.user_companies VALUES ('2bca1a10-dc86-42e9-90f1-91d38a987228', 16, 'owner', '2025-11-19 19:37:09.649604');
INSERT INTO public.user_companies VALUES ('172d064e-72bb-4b31-91ca-e50c0b5a3862', 17, 'owner', '2025-11-19 19:43:01.597902');
INSERT INTO public.user_companies VALUES ('21301228-d482-4ff0-a76c-a2942cc6b3a3', 18, 'owner', '2025-11-19 19:53:37.358936');
INSERT INTO public.user_companies VALUES ('d9233bbe-b703-4755-af24-bb602a1894d0', 19, 'owner', '2025-12-01 20:26:56.897373');
INSERT INTO public.user_companies VALUES ('a4c2082f-f1eb-4da6-84a3-98758bb14e2d', 20, 'owner', '2025-12-01 20:32:30.901499');
INSERT INTO public.user_companies VALUES ('989c82fb-fa26-422e-8399-9a6c277d14be', 21, 'owner', '2025-12-01 20:41:28.562297');
INSERT INTO public.user_companies VALUES ('d7358772-38e6-4c15-851e-5711c070bd9d', 22, 'owner', '2025-12-02 03:12:55.034578');
INSERT INTO public.user_companies VALUES ('4b4ed7e2-19d3-46d8-8eb0-0e6d7aa89d21', 23, 'owner', '2025-12-02 03:18:37.162818');
INSERT INTO public.user_companies VALUES ('dddb5dae-93c3-4b78-8fdc-39d5c0f6c95c', 23, 'member', '2025-12-02 03:20:42.012949');
INSERT INTO public.user_companies VALUES ('72642430-cf1b-404e-aaae-5bbd10ee8abb', 24, 'owner', '2025-12-04 17:00:17.310552');


--
-- Data for Name: work_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO public.work_sessions VALUES (109, 19, '2025-11-05 01:19:48.577002', NULL, NULL);
INSERT INTO public.work_sessions VALUES (111, 23, '2025-11-05 01:59:41.816165', NULL, NULL);
INSERT INTO public.work_sessions VALUES (112, 23, '2025-11-05 03:03:23.706758', 'Reviewed client documents and made updates', NULL);
INSERT INTO public.work_sessions VALUES (113, 23, '2025-11-05 03:04:24.828135', NULL, NULL);
INSERT INTO public.work_sessions VALUES (114, 23, '2025-11-05 03:07:33.91271', 'Second note for client 1', NULL);
INSERT INTO public.work_sessions VALUES (115, 24, '2025-11-05 03:08:37.067415', 'Note for client 2', NULL);
INSERT INTO public.work_sessions VALUES (116, 24, '2025-11-05 03:11:44.998216', NULL, NULL);
INSERT INTO public.work_sessions VALUES (117, 24, '2025-11-05 03:15:53.928883', 'Note for second client', NULL);
INSERT INTO public.work_sessions VALUES (118, 23, '2025-11-05 03:16:41.058189', NULL, NULL);
INSERT INTO public.work_sessions VALUES (119, 23, '2025-11-05 03:19:55.075857', 'Second client note test', NULL);
INSERT INTO public.work_sessions VALUES (120, 24, '2025-11-05 03:20:28.755678', NULL, NULL);
INSERT INTO public.work_sessions VALUES (121, 25, '2025-11-05 04:20:03.626974', 'test', NULL);
INSERT INTO public.work_sessions VALUES (122, 28, '2025-11-05 04:25:31.941101', NULL, NULL);
INSERT INTO public.work_sessions VALUES (123, 32, '2025-11-05 04:34:04.576107', NULL, NULL);
INSERT INTO public.work_sessions VALUES (124, 33, '2025-11-05 04:34:25.65435', NULL, NULL);
INSERT INTO public.work_sessions VALUES (125, 33, '2025-11-05 04:35:03.283808', NULL, NULL);
INSERT INTO public.work_sessions VALUES (126, 33, '2025-11-05 04:35:04.967453', NULL, NULL);
INSERT INTO public.work_sessions VALUES (127, 31, '2025-11-05 04:35:28.586464', NULL, NULL);
INSERT INTO public.work_sessions VALUES (128, 26, '2025-11-05 04:41:47.642774', 'Testing new layout', NULL);
INSERT INTO public.work_sessions VALUES (131, 37, '2025-11-07 03:04:26.027113', NULL, NULL);
INSERT INTO public.work_sessions VALUES (133, 40, '2025-11-07 04:52:07.219852', 'Testing urgency update', NULL);
INSERT INTO public.work_sessions VALUES (135, 36, '2025-11-12 04:18:20.759475', 'test', NULL);
INSERT INTO public.work_sessions VALUES (136, 35, '2025-11-12 04:42:18.681185', 'got this done today
', NULL);
INSERT INTO public.work_sessions VALUES (137, 35, '2025-11-12 04:42:38.764827', 'test', NULL);
INSERT INTO public.work_sessions VALUES (138, 34, '2025-11-12 04:45:24.369055', 'Testing touch comment functionality', NULL);
INSERT INTO public.work_sessions VALUES (140, 42, '2025-11-12 04:49:00.766302', 'test', NULL);
INSERT INTO public.work_sessions VALUES (144, 47, '2025-12-04 17:13:12.330335', 'made phone call today said he was going to com in tomorrow to bring doc', '72642430-cf1b-404e-aaae-5bbd10ee8abb');


--
-- Name: client_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.client_files_id_seq', 49, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.companies_id_seq', 24, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.contacts_id_seq', 404, true);


--
-- Name: kanban_columns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.kanban_columns_id_seq', 67, true);


--
-- Name: meeting_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.meeting_notes_id_seq', 8, true);


--
-- Name: opportunities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.opportunities_id_seq', 33, true);


--
-- Name: pipelines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pipelines_id_seq', 8, true);


--
-- Name: status_filters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.status_filters_id_seq', 33, true);


--
-- Name: work_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.work_sessions_id_seq', 144, true);


--
-- PostgreSQL database dump complete
--

\unrestrict Ffj34PeDYWK9BVaYYlV8gs6rwdxO5oCJahEKNbkNBGvjJ4HIeruxxlhZSi1PCJI

