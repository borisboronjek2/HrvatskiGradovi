const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Parser } = require('json2csv');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Postavljanje konekcije s bazom podataka
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'HrvatskiGradovi',
  password: 'BORIS',
  port: 5432,
});

// Ruta za dohvaćanje svih gradova
app.get('/api/gradovi', async (req, res) => {
    try {
      const result = await pool.query(`
          SELECT json_agg(json_build_object(
            'grad_id', g.id,
            'grad_naziv', g.naziv,
            'broj_stanovnika', g.broj_stanovnika,
            'zupanija', g.zupanija,
            'postanski_broj', g.postanski_broj,
            'povrsina', g.povrsina,
            'godina_osnutka', g.godina_osnutka,
            'status', g.status,
            'autooznaka', g.autooznaka,
            'znamenitosti', (
              SELECT json_agg(json_build_object('znamenitost_id', z.id, 'naziv', z.naziv))
              FROM znamenitosti z
              WHERE z.grad_id = g.id
            )
          )) AS gradovi FROM gradovi g
        `);
      
      console.log(result); // Ispisujemo cijeli rezultat
  
      if (result.rows.length > 0 && result.rows[0].gradovi) {
        res.json(result.rows[0].gradovi);  // Vraća redove u JSON formatu
      } else {
        res.json([]); // Vraća prazan array ako nema podataka
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Greška u dohvaćanju podataka');
    }
  });

  // Ruta za filtriranje gradova
app.get('/api/gradovi/filter', async (req, res) => {
    const { grad_naziv, zupanija } = req.query;
  
    try {
      let query = `
        SELECT 
          g.id,
          g.naziv AS grad_naziv,
          g.broj_stanovnika,
          g.zupanija,
          g.postanski_broj,
          g.povrsina,
          g.godina_osnutka,
          g.status,
          g.autooznaka,
          (SELECT json_agg(z) FROM znamenitosti z WHERE z.grad_id = g.id) AS znamenitosti
        FROM gradovi g
        WHERE 1=1
      `;
      const params = [];
  
      if (grad_naziv) {
        query += ' AND g.naziv ILIKE $1';
        params.push(`%${grad_naziv}%`);
      }
  
      if (zupanija) {
        query += ' AND g.zupanija ILIKE $2';
        params.push(`%${zupanija}%`);
      }
  
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Greška u dohvaćanju podataka');
    }
  });

// Ruta za preuzimanje podataka u JSON formatu
  app.get('/api/gradovi/json', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT json_agg(
                json_build_object(
                    'grad_id', g.id,
                    'grad_naziv', g.naziv,
                    'broj_stanovnika', g.broj_stanovnika,
                    'zupanija', g.zupanija,
                    'postanski_broj', g.postanski_broj,
                    'povrsina', g.povrsina,
                    'godina_osnutka', g.godina_osnutka,
                    'status', g.status,
                    'autooznaka', g.autooznaka,
                    'znamenitosti', (
                        SELECT json_agg(
                            json_build_object(
                                'znamenitost_id', z.id,
                                'naziv', z.naziv
                            )
                        )
                        FROM znamenitosti z
                        WHERE z.grad_id = g.id
                    )
                )
            ) AS gradovi
            FROM gradovi g
        `);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=gradovi.json');
        res.send(result.rows[0].gradovi);
    } catch (error) {
        console.error(error);
        res.status(500).send('Greška u preuzimanju podataka');
    }
});

  // Ruta za preuzimanje podataka u CSV formatu
  app.get('/api/gradovi/csv', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          g.id AS grad_id,
          g.naziv AS grad_naziv,
          g.broj_stanovnika,
          g.zupanija,
          g.postanski_broj,
          g.povrsina,
          g.godina_osnutka,
          g.status,
          g.autooznaka,
          string_agg(z.naziv, ', ') AS znamenitosti
        FROM gradovi g
        LEFT JOIN znamenitosti z ON z.grad_id = g.id
        GROUP BY g.id
      `);
  
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(result.rows);
  
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=gradovi.csv');
      res.send(csv);
    } catch (error) {
      console.error(error);
      res.status(500).send('Greška u preuzimanju podataka');
    }
  });

// Pokretanje servera
app.listen(port, () => {
  console.log(`Server je pokrenut na http://localhost:${port}`);
});