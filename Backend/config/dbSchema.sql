-- Admit Genie Database Schema
-- Run this SQL script to create all necessary tables
-- This script handles foreign key constraints properly

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS admit_genie;
USE admit_genie;

-- Disable foreign key checks for the entire operation
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist (in reverse dependency order to avoid FK issues)
DROP TABLE IF EXISTS saved_colleges;
DROP TABLE IF EXISTS rank_predictions;
DROP TABLE IF EXISTS chat_history;
DROP TABLE IF EXISTS chatbot_intents;
DROP TABLE IF EXISTS cutoff_data;
DROP TABLE IF EXISTS admissions;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS exam_schedules;
DROP TABLE IF EXISTS colleges;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;

-- Now create all tables (FK checks are still disabled)
-- Users table (must be created first as it's referenced by other tables)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  cet_rank INT,
  category ENUM('General', 'OBC', 'SC', 'ST', 'EWS') DEFAULT 'General',
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_cet_rank (cet_rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admins table
CREATE TABLE admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Colleges table (must be created before courses, admissions, cutoff_data, saved_colleges)
CREATE TABLE colleges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  state VARCHAR(100),
  city VARCHAR(100),
  accreditation VARCHAR(100),
  ranking INT,
  description TEXT,
  placement_info TEXT,
  website VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_location (location),
  INDEX idx_ranking (ranking)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Courses table (depends on colleges)
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  college_id INT NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(50),
  duration VARCHAR(50),
  eligibility TEXT,
  fees DECIMAL(10, 2),
  fees_period ENUM('yearly', 'semester', 'total') DEFAULT 'yearly',
  intake INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  INDEX idx_college_id (college_id),
  INDEX idx_course_name (course_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admissions table (depends on colleges and courses)
CREATE TABLE admissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  college_id INT NOT NULL,
  course_id INT,
  deadline DATE,
  required_exam VARCHAR(255),
  application_link VARCHAR(255),
  application_fee DECIMAL(10, 2),
  admission_process TEXT,
  documents_required TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  INDEX idx_college_id (college_id),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cutoff data table (depends on colleges and courses)
CREATE TABLE cutoff_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  college_id INT NOT NULL,
  course_id INT NOT NULL,
  category ENUM('General', 'OBC', 'SC', 'ST', 'EWS') NOT NULL,
  year INT NOT NULL,
  min_rank INT,
  max_rank INT,
  avg_rank INT,
  opening_rank INT,
  closing_rank INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_college_course (college_id, course_id),
  INDEX idx_category (category),
  INDEX idx_year (year),
  INDEX idx_ranks (min_rank, max_rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exam schedules table (independent)
CREATE TABLE exam_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_name VARCHAR(255) NOT NULL,
  exam_type VARCHAR(100),
  registration_start DATE,
  registration_end DATE,
  exam_date DATE,
  result_date DATE,
  application_link VARCHAR(255),
  exam_fee DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_exam_name (exam_name),
  INDEX idx_exam_date (exam_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chat history table (depends on users)
CREATE TABLE chat_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rank predictions table (depends on users)
CREATE TABLE rank_predictions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  `rank` INT NOT NULL,
  category ENUM('General', 'OBC', 'SC', 'ST', 'EWS') NOT NULL,
  course_preference VARCHAR(255),
  results JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_rank (`rank`),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Saved colleges table (depends on users, colleges, and courses)
CREATE TABLE saved_colleges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  college_id INT NOT NULL,
  course_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_college_course (user_id, college_id, course_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chatbot intents/FAQs table (for admin management, independent)
CREATE TABLE chatbot_intents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  intent_name VARCHAR(255) NOT NULL,
  keywords TEXT,
  response_template TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_intent_name (intent_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Re-enable foreign key checks AFTER all tables are created
SET FOREIGN_KEY_CHECKS = 1;
