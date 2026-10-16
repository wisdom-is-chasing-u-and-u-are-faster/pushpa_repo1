-- Seed Data for Smart Study Management System

INSERT OR IGNORE INTO users (id, name, email, role, retention_target, preferred_study_time)
VALUES ('user_1', 'Alex Chen', 'alex.chen@university.edu', 'student', 0.92, 'evening');

INSERT OR IGNORE INTO materials (id, user_id, title, category, format, content_text, chunks_count, status)
VALUES ('mat_1', 'user_1', 'Distributed Systems - Raft Consensus Algorithm', 'Computer Science', 'pdf', 'The Raft consensus algorithm is designed to be easy to understand. It decomposes consensus into leader election, log replication, and safety.', 3, 'PROCESSED');

INSERT OR IGNORE INTO flashcards (id, material_id, user_id, front, back, source_citation, stability, difficulty, interval_days, repetition_count, due_date)
VALUES 
('fc_1', 'mat_1', 'user_1', 'What are the three primary subproblems in the Raft consensus algorithm?', 'Leader election, log replication, and safety guarantees.', 'Raft Paper Section 5', 2.5, 4.0, 1, 0, CURRENT_TIMESTAMP),
('fc_2', 'mat_1', 'user_1', 'What happens in Raft when a follower detects election timeout?', 'It increments its current term, transitions to candidate state, and issues RequestVote RPCs.', 'Raft Paper Section 5.2', 3.0, 3.5, 2, 1, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO quizzes (id, material_id, user_id, title)
VALUES ('quiz_1', 'mat_1', 'user_1', 'Raft Consensus Quick Check');

INSERT OR IGNORE INTO quiz_questions (id, quiz_id, question, options, correct_index, explanation)
VALUES 
('qq_1', 'quiz_1', 'In Raft, which node initiates log replication?', '["Leader", "Candidate", "Follower", "Any node"]', 0, 'Only the designated leader handles incoming client requests and initiates AppendEntries RPCs for log replication.'),
('qq_2', 'quiz_1', 'What ensures safety in Raft during leader election?', '["Randomized timeouts and log up-to-date checks", "Static pre-assigned leader roles", "First-come first-served broadcast", "Global lock service"]', 0, 'Randomized election timeouts prevent split votes, and candidates must possess all committed log entries.');

INSERT OR IGNORE INTO study_schedules (id, user_id, title, scheduled_time, duration_minutes, topic, status)
VALUES 
('sch_1', 'user_1', 'Active Recall: Distributed Consensus & Raft', '2026-10-16 18:00:00', 45, 'Distributed Systems', 'SCHEDULED'),
('sch_2', 'user_1', 'FSRS Adaptive Review: OS Memory Paging', '2026-10-17 09:00:00', 30, 'Operating Systems', 'SCHEDULED');

INSERT OR IGNORE INTO retention_telemetry (id, user_id, date, mastery_score_pct, retention_rate_pct, cards_reviewed)
VALUES 
('ret_1', 'user_1', '2026-10-14', 82.0, 86.5, 12),
('ret_2', 'user_1', '2026-10-15', 86.0, 89.0, 18),
('ret_3', 'user_1', '2026-10-16', 91.5, 93.0, 24);
