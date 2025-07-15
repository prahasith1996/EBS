const express = require('express')
require('dotenv').config();
const app = express()
app.use(express.json());
const path = require('path')
const port = process.env.PORT

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/style.css', function(req, res) {
  res.sendFile(path.join(__dirname + '/style.css'));
});

app.get('/app.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/app.js'));
});



// PostgreSQL connection configuration
const pg = require('pg')
const {Client} = pg

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

// Connect to PostgreSQL
async function connectDB() {
  try {
    await client.connect()
    console.log('Connected to PostgreSQL')
  } catch (err) {
    console.error('Database connection error:', err)
    process.exit(1)
  }
}

// Initialize database connection
connectDB()


// Async function to get questions
app.get('/question', async function(req, res) {
  try {
    const result = await client.query(`
      SELECT
      (SELECT COALESCE (array_to_json(array_agg(row_to_json(array_row))),'[]'::json) FROM (SELECT * FROM questions WHERE NOT EXISTS (SELECT 1 FROM answers WHERE answers.question_uuid = questions.uuid) ORDER BY RANDOM() LIMIT 1)array_row) as question,
      (SELECT COALESCE (FLOOR((SELECT COUNT(DISTINCT question_uuid) FROM answers) * 100.0 / NULLIF((SELECT COUNT(*) FROM questions), 0)), 0) AS progress),
      (SELECT COALESCE (FLOOR((SELECT COUNT(DISTINCT question_uuid) FROM answers WHERE choice = (SELECT correct_answer FROM questions WHERE questions.uuid = answers.question_uuid)) * 100.0 / NULLIF((SELECT COUNT(*) FROM questions), 0)), 0) AS score)
      `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database get question error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//performance way
// app.get('/questions', async function(req, res) {
//   try {
//     const result = await client.query(`
//       SELECT 
//         (SELECT question.uuid FROM questions WHERE question.uuid NOT IN (SELECT question_uuid FROM answers) LIMIT 1) as question_index,
//         (SELECT COALESCE (array_to_json(array_agg(row_to_json(array_row))),'[]'::json) FROM (
//         SELECT * FROM questions)array_row) as questions
//       `);
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Database query error:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


      // (SELECT * FROM questions WHERE NOT EXISTS (SELECT 1 FROM answers WHERE answers.question_uuid = questions.uuid) ORDER BY RANDOM() LIMIT 1) as current_questions,


app.put('/submit', async function(req, res) {
  try {
    const { choice, question_uuid } = req.body;
    const answer = await client.query(`INSERT INTO answers (choice, question_uuid) VALUES ($1, $2)`, [choice, question_uuid]); 
    res.json(answer.rows)
  } catch (err) {
    console.error('Database submit answer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/reset', async function(req, res) {
  try {
    const reset = await client.query(`TRUNCATE TABLE answers`); 
    res.json(reset.rows)
  } catch (err) {
    console.error('Database reset answer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


console.log(`PLANNING TO USE PORT: ${port}`)
app.listen(port, '0.0.0.0', () => console.log(`Listening on port ${port}!`))
