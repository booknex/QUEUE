-- Production Data Export
-- Delete all data in correct foreign key order
DELETE FROM opportunities;
DELETE FROM kanban_columns;
DELETE FROM contacts;
DELETE FROM meeting_notes;
DELETE FROM work_sessions;
DELETE FROM status_filters;
DELETE FROM client_files;
DELETE FROM user_companies;
DELETE FROM pipelines;
DELETE FROM users;
DELETE FROM companies;

-- Insert companies
INSERT INTO companies (id, name, created_at) VALUES
(1, 'BOOKNEX', '2025-11-05 00:24:16.839211'),
(2, 'THE MORTGAGE BOARD', '2025-11-05 01:58:02.989783'),
(8, 'OPEN HOME SUITES', '2025-11-18 04:23:57.001104'),
(9, 'THE REALTY BOARD', '2025-11-18 04:24:10.545573');

-- Insert users
INSERT INTO users (id, username, password, email, first_name, last_name, profile_image_url, created_at, updated_at) VALUES
('ca473819-21e2-44a3-913e-f1621f5cb49f', 'austin@inboxplace.com', 'e193b3d95f3244b06c041548f5cbf02d6d4a912b1afd4f24ee5195ca790d00772a6823b83a9684644dff07c5679c994408bd54971c6f862e06dd20b678b0545e.b0feac6025ace95cef8ede3f8445422c', '', 'austin', 'otero', '', '2025-11-12 17:27:12.838204', '2025-11-12 17:27:12.838204'),
('a13f0126-b568-4550-8f29-133d7730c48a', 'dylan', '40b4b8cd4860dba1a29346fdd4186f71161fe758e403fb723ade688485fc3806991a0e1a6d31ca8f214980be808f67b95fd3a7c84a550ea3508ca0fcb0340ddb.ed8d49e9106c5116d4b0c16361fcfb7a', '', 'dylan', 'otero', '', '2025-11-12 18:56:47.255658', '2025-11-12 18:56:47.255658'),
('791f6235-6886-4c49-9220-fecde6255af4', 'hannah@inboxplace.com', '02945287a0e67f50f601af0209f826eae38ce04d3011d34596a05ac6d12e6b8ddb082bb53c94ac28eae7e010cff2c1fb8d2cdd0d4269c9e9113e5e115f7befd1.8a877463c59c0591899f1b8891674f43', '', 'Hannah', 'Ladin', '', '2025-11-13 16:06:38.709203', '2025-11-13 16:06:38.709203'),
('cc80ad6a-687e-4966-93f0-860d64ae3b73', 'Emma@inboxplace.com', '342c94f38db849078b479d226290c6483c5c3616a7592d05772420c645763798a0ecde21539f88ab1605e6da0c35065259a8675168e33db555a6297e8e1051a5.aab2046fa484ef8d1ff7e03cd75bdfcc', '', 'Emma', 'Aponte', '', '2025-11-13 22:16:39.601434', '2025-12-02 04:11:57.866'),
('d44df9c2-0cef-460a-8ddc-4af17cb9469e', 'bailyn@inboxplace.com', '02b60cb5a6cbf19a77731801543f59defe3c7f3ca6268e79d0e97dd6d5ff61f7f7eba1598c8f73338a4740b228983cd7e50e0dae8d4f46990c73e241aed0d2fc.68a8d0a926702b70f69031fb33a5b291', '', 'Bailyn', 'Hagadone', '', '2025-11-18 17:12:47.410508', '2025-11-18 17:12:47.410508'),
('8363a3cd-8424-4f1d-9401-00d3d5116cc7', 'Jaleen@inboxplace.com', 'd27f58010a8aaeafde6ecd07919c6135742cce171cb7c15164637de44d992706617708372e2f133c510008e5d8da37d23a1ce071bab22f43db7a58fd6d0c076e.aa356af7341a4aaa65d533e3e22735b5', '', 'Jaleen', 'Gonzalez', '', '2025-11-19 18:42:28.414667', '2025-11-19 18:42:28.414667'),
('45341f55-578a-4747-aec6-5685225db300', 'yuli@inboxplace.com', '0c4ade1f50c7fe33e6bfb536c36e0811d65b4d3b59c8f03b800c829057ea72db25bd55fe36956740513880efacb2e915bd28b3a25dc08dbe68f939f29351c21d.e02cca16c70133f10fade958a87340e9', '', 'yuli', 'ariza', '', '2025-11-12 19:10:35.682071', '2026-01-08 18:10:47.903');

-- Insert user_companies (Dylan as owner for all 4 companies)
INSERT INTO user_companies (user_id, company_id, role, created_at) VALUES
('ca473819-21e2-44a3-913e-f1621f5cb49f', 2, 'owner', '2025-11-13 03:15:11.357938'),
('ca473819-21e2-44a3-913e-f1621f5cb49f', 1, 'admin', '2025-11-13 03:14:57.365167'),
('ca473819-21e2-44a3-913e-f1621f5cb49f', 8, 'owner', '2025-11-18 04:23:57.027029'),
('ca473819-21e2-44a3-913e-f1621f5cb49f', 9, 'owner', '2025-11-18 04:24:10.566211'),
('791f6235-6886-4c49-9220-fecde6255af4', 2, 'member', '2025-11-18 06:16:07.271418'),
('791f6235-6886-4c49-9220-fecde6255af4', 1, 'member', '2025-11-18 06:16:10.436788'),
('cc80ad6a-687e-4966-93f0-860d64ae3b73', 9, 'member', '2025-11-18 06:16:20.804659'),
('cc80ad6a-687e-4966-93f0-860d64ae3b73', 2, 'member', '2025-11-18 06:16:21.46744'),
('cc80ad6a-687e-4966-93f0-860d64ae3b73', 1, 'member', '2025-11-18 06:16:22.112233'),
('cc80ad6a-687e-4966-93f0-860d64ae3b73', 8, 'member', '2025-11-18 06:16:24.02035'),
('45341f55-578a-4747-aec6-5685225db300', 1, 'member', '2025-11-18 06:16:55.849261'),
('45341f55-578a-4747-aec6-5685225db300', 2, 'member', '2025-11-18 06:16:56.59178'),
('a13f0126-b568-4550-8f29-133d7730c48a', 1, 'owner', '2025-11-18 06:17:07.838855'),
('a13f0126-b568-4550-8f29-133d7730c48a', 2, 'owner', '2025-11-18 06:17:09.249366'),
('a13f0126-b568-4550-8f29-133d7730c48a', 9, 'owner', '2025-11-18 06:17:10.234179'),
('a13f0126-b568-4550-8f29-133d7730c48a', 8, 'owner', '2025-11-18 06:17:10.824553'),
('d44df9c2-0cef-460a-8ddc-4af17cb9469e', 8, 'member', '2025-11-19 15:38:09.251909'),
('8363a3cd-8424-4f1d-9401-00d3d5116cc7', 2, 'member', '2025-11-19 18:44:23.18941'),
('8363a3cd-8424-4f1d-9401-00d3d5116cc7', 8, 'member', '2025-11-20 16:21:53.176466'),
('8363a3cd-8424-4f1d-9401-00d3d5116cc7', 1, 'member', '2025-11-20 16:21:53.452592'),
('8363a3cd-8424-4f1d-9401-00d3d5116cc7', 9, 'member', '2025-11-20 16:21:54.355907'),
('d44df9c2-0cef-460a-8ddc-4af17cb9469e', 1, 'member', '2025-11-20 16:21:57.656165'),
('d44df9c2-0cef-460a-8ddc-4af17cb9469e', 2, 'member', '2025-11-20 16:21:58.070708'),
('d44df9c2-0cef-460a-8ddc-4af17cb9469e', 9, 'member', '2025-11-20 16:21:58.375251'),
('791f6235-6886-4c49-9220-fecde6255af4', 9, 'member', '2025-11-20 16:22:06.848512'),
('791f6235-6886-4c49-9220-fecde6255af4', 8, 'member', '2025-11-20 16:22:07.141834'),
('45341f55-578a-4747-aec6-5685225db300', 8, 'member', '2025-11-20 16:22:10.503658'),
('45341f55-578a-4747-aec6-5685225db300', 9, 'member', '2025-11-20 16:22:11.970393');

-- Reset sequences
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

-- Remaining tables will be imported separately:
-- - client_files
-- - pipelines
-- - status_filters
-- - kanban_columns
-- - opportunities
-- - contacts
-- - work_sessions
-- - meeting_notes

-- Reset companies sequence
SELECT setval('companies_id_seq', (SELECT COALESCE(MAX(id), 1) FROM companies));

