# Release v4.0

## 1. Laboratorijska vježba: Izrada otvorenog skupa podataka

**Licenca:** Creative Commons Attribution 4.0 International (CC BY 4.0)  
Ovaj skup podataka objavljen je pod Creative Commons Attribution 4.0 International licencom. To znači da ga bilo tko može slobodno koristiti, dijeliti i prilagođavati, uz obvezu navođenja izvora. Više informacija o licenci dostupno je na [Creative Commons stranici](https://creativecommons.org/licenses/by/4.0/).

**Autor:** Boris Boronjek

**Verzija skupa podataka:** 4.0

**Jezik u kojemu se nalaze podaci:** hrvatski

**Opis atributa:**  
- `grad_id` - jedinstveni identifikator  
- `grad_naziv` - naziv grada  
- `broj_stanovnika` - broj stanovnika grada  
- `zupanija` - županija u kojoj se grad nalazi  
- `postanski_broj` - poštanski broj grada  
- `povrsina` - površina koju grad zauzima u km²  
- `godina_osnutka` - godina osnutka grada  
- `status` - označuje je li grad sjedište županije  
- `autooznaka` - registracijske tablice koje se koriste u gradu  
- `znamenitosti` - popis kulturnih/turističkih znamenitosti u gradu  

Za izradu korišten PostgreSQL.

CSV izdvajanje:  
u terminalu/cmd-u  
psql -U postgres -d HrvatskiGradovi  
\COPY (SELECT g.id AS grad_id, g.naziv AS grad_naziv, g.broj_stanovnika, g.zupanija, g.postanski_broj, g.povrsina, g.godina_osnutka, g.status, g.autooznaka, z.naziv AS znamenitost_naziv FROM gradovi g LEFT JOIN znamenitosti z ON g.id = z.grad_id) TO 'C:\Users\boris\Desktop\faks\OR\Lab1\hrvatski_gradovi.csv' WITH (FORMAT CSV, HEADER, ENCODING 'UTF8', DELIMITER ';');

JSON izdvajanje:  
u terminalu/cmd-u  
psql -U postgres -d HrvatskiGradovi  
\COPY (SELECT json_agg(json_build_object('grad_id', g.id, 'grad_naziv', g.naziv, 'broj_stanovnika', g.broj_stanovnika, 'zupanija', g.zupanija, 'postanski_broj', g.postanski_broj, 'povrsina', g.povrsina, 'godina_osnutka', g.godina_osnutka, 'status', g.status, 'autooznaka', g.autooznaka, 'znamenitosti', (SELECT json_agg(json_build_object('znamenitost_id', z.id, 'naziv', z.naziv)) FROM znamenitosti z WHERE z.grad_id = g.id))) FROM gradovi g) TO 'C:\Users\boris\Desktop\faks\OR\Lab1\hrvatski_gradovi.json' WITH (ENCODING 'UTF8');

dump baze:  
u terminalu/cmd-u  
pg_dump -U postgres -d HrvatskiGradovi > C:\Users\boris\Desktop\faks\OR\Lab1\hrvatski_gradovi.sql

## 2. Laboratorijska vježba: Pristupačnost i vidljivost otvorenih podataka

U sklopu druge laboratorijske vježbe, cilj je omogućiti pristup i vidljivost podataka putem web sučelja. Za ostvarenje ovog cilja, implementiran je web sučaj s nekoliko važnih funkcionalnosti koje omogućuju korisnicima preuzimanje i filtriranje podataka, kao i pristup metapodacima skupa podataka.

### Tehničke značajke implementacije:
- **Backend tehnologija**: Node.js je korišten za razvoj backend aplikacije koja omogućuje pristup i distribuciju podataka u različitim formatima.
- **Frontend tehnologija**: React.js je korišten za razvoj korisničkog sučelja koje omogućava interakciju s podacima putem dinamičkih tablica.
- **Filtriranje podataka**: Implementirano je filtriranje podataka na web stranici s mogućnošću odabira atributa za pretragu, omogućujući korisnicima da pretražuju podatke prema različitim kriterijima.
- **Preuzimanje podataka**: Podaci su dostupni za preuzimanje u CSV i JSON formatima.

### Prikazivanje i preuzimanje podataka:
Korisnici mogu preuzeti cijeli skup podataka u različitim formatima. Na stranici je implementirana opcija za preuzimanje:
- **CSV format**
- **JSON format**

### Metapodaci i vidljivost podataka:
Na web stranici su dodani metapodaci o skupu podataka, uključujući:
- **Licencu** skupa podataka.
- **Opis skupa podataka**, uključujući verziju i autorstvo.
- **Opis atributa podataka** koji omogućuju korisnicima da razumiju što svaki atribut znači.

### Tehnološki detalji:
1. **Backend**: Node.js poslužitelj omogućuje dohvat podataka i slanje odgovora u različitim formatima.
2. **Frontend**: React.js je korišten za razvoj korisničkog sučelja, s dinamičkim tablicama koje prikazuju podatke, filtriranje prema atributima, te preuzimanje podataka u CSV i JSON formatima.
3. **Baza podataka**: PostgreSQL se koristi za pohranu podataka i omogućavanje izvoza podataka u različite formate koristeći SQL upite.