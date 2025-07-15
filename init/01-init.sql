CREATE DATABASE study;

\c study

CREATE EXTENSION "uuid-ossp";

CREATE TABLE public.answers (
    uuid UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_uuid UUID NOT NULL,
    choice CHAR(1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.questions (
    uuid UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL
);