-- Sample data for testing
-- Run this after creating the database schema

USE admit_genie;

-- Sample Colleges
INSERT INTO colleges (name, location, state, city, accreditation, ranking, description, placement_info, website, contact_email) VALUES
('Indian Institute of Technology Bombay', 'Mumbai', 'Maharashtra', 'Mumbai', 'AICTE', 1, 'Premier engineering institute in India', 'Average package: ₹20 LPA', 'https://www.iitb.ac.in', 'admissions@iitb.ac.in'),
('Pune Institute of Computer Technology', 'Pune', 'Maharashtra', 'Pune', 'AICTE', 15, 'Top private engineering college in Pune', 'Average package: ₹8 LPA', 'https://www.pict.edu', 'info@pict.edu'),
('College of Engineering Pune', 'Pune', 'Maharashtra', 'Pune', 'AICTE', 10, 'Government engineering college', 'Average package: ₹12 LPA', 'https://www.coep.org.in', 'admissions@coep.ac.in'),
('Veermata Jijabai Technological Institute', 'Mumbai', 'Maharashtra', 'Mumbai', 'AICTE', 8, 'Government engineering institute', 'Average package: ₹10 LPA', 'https://www.vjti.ac.in', 'info@vjti.ac.in'),
('National Institute of Technology, Trichy', 'Tiruchirappalli', 'Tamil Nadu', 'Tiruchirappalli', 'AICTE', 5, 'Premier NIT', 'Average package: ₹15 LPA', 'https://www.nitt.edu', 'admissions@nitt.edu');

-- Sample Courses
INSERT INTO courses (college_id, course_name, course_code, duration, eligibility, fees, fees_period, intake, description) VALUES
(1, 'Computer Science Engineering', 'CSE', '4 years', 'JEE Advanced rank < 200', 200000, 'yearly', 120, 'B.Tech in Computer Science'),
(1, 'Electronics Engineering', 'ECE', '4 years', 'JEE Advanced rank < 500', 200000, 'yearly', 100, 'B.Tech in Electronics'),
(2, 'Computer Engineering', 'CE', '4 years', 'MHT-CET rank < 5000', 150000, 'yearly', 180, 'B.E. in Computer Engineering'),
(2, 'Information Technology', 'IT', '4 years', 'MHT-CET rank < 6000', 150000, 'yearly', 120, 'B.E. in Information Technology'),
(3, 'Computer Science', 'CS', '4 years', 'MHT-CET rank < 3000', 100000, 'yearly', 120, 'B.E. in Computer Science'),
(4, 'Computer Engineering', 'CE', '4 years', 'MHT-CET rank < 4000', 120000, 'yearly', 120, 'B.E. in Computer Engineering'),
(5, 'Computer Science Engineering', 'CSE', '4 years', 'JEE Main rank < 3000', 180000, 'yearly', 120, 'B.Tech in Computer Science');

-- Sample Cutoff Data (2024)
INSERT INTO cutoff_data (college_id, course_id, category, year, min_rank, max_rank, avg_rank, opening_rank, closing_rank) VALUES
(1, 1, 'General', 2024, 1, 150, 75, 1, 150),
(1, 2, 'General', 2024, 100, 500, 300, 100, 500),
(2, 3, 'General', 2024, 2000, 5000, 3500, 2000, 5000),
(2, 4, 'General', 2024, 3000, 6000, 4500, 3000, 6000),
(3, 5, 'General', 2024, 1000, 3000, 2000, 1000, 3000),
(4, 6, 'General', 2024, 1500, 4000, 2750, 1500, 4000),
(5, 7, 'General', 2024, 500, 3000, 1750, 500, 3000),
(2, 3, 'OBC', 2024, 5000, 8000, 6500, 5000, 8000),
(2, 4, 'OBC', 2024, 6000, 9000, 7500, 6000, 9000),
(3, 5, 'OBC', 2024, 4000, 6000, 5000, 4000, 6000);

-- Sample Exam Schedules
INSERT INTO exam_schedules (exam_name, exam_type, registration_start, registration_end, exam_date, result_date, application_link, exam_fee, description) VALUES
('MHT-CET 2024', 'State Level', '2024-01-15', '2024-03-15', '2024-04-20', '2024-06-15', 'https://cetcell.mahacet.org', 800, 'Maharashtra Common Entrance Test'),
('JEE Main 2024', 'National Level', '2024-11-01', '2024-12-31', '2024-01-24', '2024-02-15', 'https://jeemain.nta.ac.in', 1000, 'Joint Entrance Examination Main'),
('JEE Advanced 2024', 'National Level', '2024-05-01', '2024-05-10', '2024-05-26', '2024-06-10', 'https://jeeadv.ac.in', 2000, 'Joint Entrance Examination Advanced');

-- Sample Admissions
INSERT INTO admissions (college_id, course_id, deadline, required_exam, application_link, application_fee, admission_process, documents_required) VALUES
(2, 3, '2024-07-15', 'MHT-CET', 'https://www.pict.edu/admissions', 1000, 'Online application, Merit-based', 'MHT-CET scorecard, 12th marksheet, ID proof'),
(2, 4, '2024-07-15', 'MHT-CET', 'https://www.pict.edu/admissions', 1000, 'Online application, Merit-based', 'MHT-CET scorecard, 12th marksheet, ID proof'),
(3, 5, '2024-07-20', 'MHT-CET', 'https://www.coep.org.in/admissions', 500, 'Online application, Merit-based', 'MHT-CET scorecard, 12th marksheet, ID proof'),
(4, 6, '2024-07-18', 'MHT-CET', 'https://www.vjti.ac.in/admissions', 800, 'Online application, Merit-based', 'MHT-CET scorecard, 12th marksheet, ID proof');

