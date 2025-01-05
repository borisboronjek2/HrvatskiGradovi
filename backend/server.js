const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Parser } = require('json2csv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

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

// Standardna funkcija za response omotac
function responseWrapper(status, message, data) {
  return {
    status: status,
    message: message,
    data: data,
  };
}

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

    const data = result.rows[0]?.gradovi || [];
    res.json(responseWrapper(true, 'Podaci uspješno dohvaćeni.', data));
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper(false, 'Greška u dohvaćanju podataka.', null));
  }
});

// Ruta za filtriranje gradova
app.get('/api/gradovi/filter', async (req, res) => {
  const { searchText, attribute } = req.query; // Dobivanje parametara iz upita

  try {
    let query = `
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
      )) AS gradovi
      FROM gradovi g
    `;

    const params = []; // Parametri za SQL upit
    let condition = '';

    // Dodavanje uvjeta za filtriranje
    if (searchText) {
      if (attribute) {
        // Filtriranje prema odabranom atributu
        switch (attribute) {
          case 'grad_naziv':
            condition = `WHERE g.naziv ILIKE $1`;
            params.push(`%${searchText}%`);
            break;
          case 'zupanija':
            condition = `WHERE g.zupanija ILIKE $1`;
            params.push(`%${searchText}%`);
            break;
          case 'all':
            condition = `
              WHERE (
                g.naziv ILIKE $1 OR
                g.zupanija ILIKE $1 OR
                CAST(g.broj_stanovnika AS TEXT) ILIKE $1 OR
                CAST(g.postanski_broj AS TEXT) ILIKE $1 OR
                CAST(g.povrsina AS TEXT) ILIKE $1 OR
                CAST(g.godina_osnutka AS TEXT) ILIKE $1 OR
                g.status ILIKE $1 OR
                g.autooznaka ILIKE $1
              )
            `;
            params.push(`%${searchText}%`);
            break;
          default:
            return res.status(400).json(responseWrapper(false, 'Nepoznat atribut za filtriranje.', null));
        }
      }
    }

    query += ` ${condition}`;

    const result = await pool.query(query, params);

    const data = result.rows[0]?.gradovi || [];
    res.json(responseWrapper(true, 'Podaci uspješno dohvaćeni.', data));
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper(false, 'Greška u dohvaćanju podataka.', null));
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
    res.status(500).json(responseWrapper(false, 'Greška u preuzimanju podataka.', null));
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
    res.status(500).json(responseWrapper(false, 'Greška u preuzimanju podataka.', null));
  }
});

// GET ruta za dohvaćanje pojedinog grada po ID-u
app.get('/api/gradovi/:id', async (req, res) => {
  const { id } = req.params;
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
        (SELECT json_agg(
          json_build_object(
            'znamenitost_id', z.id,
            'naziv', z.naziv
          )
        ) FROM znamenitosti z WHERE z.grad_id = g.id) AS znamenitosti
      FROM gradovi g
      WHERE g.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(responseWrapper(false, 'Grad nije pronađen.', null));
    }

    res.json(responseWrapper(true, 'Grad uspješno dohvaćen.', result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper(false, 'Greška u dohvaćanju grada.', null));
  }
});

// POST ruta za dodavanje novog grada
app.post('/api/gradovi', async (req, res) => {
  const {
    naziv,
    broj_stanovnika,
    zupanija,
    postanski_broj,
    povrsina,
    godina_osnutka,
    status,
    autooznaka,
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO gradovi 
        (naziv, broj_stanovnika, zupanija, postanski_broj, povrsina, godina_osnutka, status, autooznaka)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [naziv, broj_stanovnika, zupanija, postanski_broj, povrsina, godina_osnutka, status, autooznaka]);

    res.status(201).json(responseWrapper(true, 'Grad uspješno dodan.', result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper(false, 'Greška u dodavanju grada.', null));
  }
});

// PUT ruta za ažuriranje postojećeg grada
app.put('/api/gradovi/:id', async (req, res) => {
  const { id } = req.params;
  const {
    naziv,
    broj_stanovnika,
    zupanija,
    postanski_broj,
    povrsina,
    godina_osnutka,
    status,
    autooznaka,
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE gradovi
      SET 
        naziv = $1,
        broj_stanovnika = $2,
        zupanija = $3,
        postanski_broj = $4,
        povrsina = $5,
        godina_osnutka = $6,
        status = $7,
        autooznaka = $8
      WHERE id = $9
      RETURNING *
    `, [naziv, broj_stanovnika, zupanija, postanski_broj, povrsina, godina_osnutka, status, autooznaka, id]);

    if (result.rows.length === 0) {
      return res.status(404).json(responseWrapper(false, 'Grad nije pronađen za ažuriranje.', null));
    }

    res.json(responseWrapper(true, 'Grad uspješno ažuriran.', result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper(false, 'Greška u ažuriranju grada.', null));
  }
});

// DELETE ruta za brisanje grada
app.delete('/api/gradovi/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM gradovi WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(responseWrapper(false, 'Grad nije pronađen za brisanje.', null));
    }

    res.json(responseWrapper(true, 'Grad uspješno obrisan.', result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json(responseWrapper(false, 'Greška u brisanju grada.', null));
  }
});

// Ruta za Swagger dokumentaciju
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Došlo je do pogreške na serveru' });
  });

  app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Ruta nije pronađena' });
  });

// Pokretanje servera
app.listen(port, () => {
  console.log(`Server je pokrenut na http://localhost:${port}`);
  console.log(`Swagger dokumentacija dostupna na http://localhost:${port}/api-docs`);
});