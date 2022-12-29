const express = require('express');
const app = express();
const port = 5000
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { urlencoded } = require('express');
const exec = require('child_process').exec;
const fs = require('fs');
var cors = require('cors');

const PERSISTENT = false;
// FALSE => RESET DB AND LOAD WITH FILES FROM DIR AS IDs, WITH DEFAULT RATING/DESCRIPTION
// TRUE => CREATE DB IF NOT EXISTS (NOTHING IF ALREADY EXISTS)

//  We will need:
// CREATE TABLE RESUME_TABLE (id INTEGER PRIMARY KEY, rating INTEGER, description TEXT);
// DROP TABLE RESUME_TABLE;
// INSERT INTO RESUME_TABLE (id, rating, description) VALUES (?,?,?)
// SELECT * FROM RESUME_TABLE WHERE ID = ? RATING > ?
// UPDATE RESUME_TABLE SET RATING = ? WHERE ID = ?
// REMOVE FROM RESUME_TABLE WHERE ID = ?

app.use(cors());
app.use(urlencoded({extended: true}))
app.use(require('body-parser').json());
app.use('/uploads/',express.static('/root/resumerater/resumerater/uploads/'));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  // res.header("Access-Control-Allow-Headers", "X-Requested-With");
  // res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Range, Content-Type, Accept");
  // res.setHeader('Content-Type', 'application/pdf');
  // res.header('Access-Control-Allow-Credentials', 'true');
  // res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  // res.header('Access-Control-Expose-Headers', 'Content-Length');
  next();
});

  const Database = require('better-sqlite3');
  const db = new Database('resumes.db', { verbose: console.log });
  if(!PERSISTENT) {
    console.log("not persistent so we drop table if exists and create table")
    db.prepare('DROP TABLE IF EXISTS RESUME_TABLE').run();
    db.prepare('CREATE TABLE RESUME_TABLE (id TEXT PRIMARY KEY, rating INTEGER, description TEXT)').run();
    console.log("done")
    let cmd = "ls -1 /root/resumerater/resumerater/uploads/"
    exec(cmd, (err, stdout, stderr) => {
      if (err !== null) {
        console.log('exec error: ' + err);
      }
      console.log("output is: " + stdout)
      output = stdout.split(/\r?\n/);
      console.log("output is: " + output + " and its length is: " + output.length);
      console.log("output[0] is: " + output[0] + " and output[length-2] is: " + output[output.length-2]);
      let i=0;
      for(i=0;i<output.length-1;i++) {
        console.log("output[" + i + "] is: " + output[i]);
        db.prepare('INSERT INTO RESUME_TABLE (id, rating, description) VALUES (?,?,?)').run(output[i], 5, "No description yet.");
      }
    });
  } else {
    console.log("persistent so we just create table if not exists")
    db.prepare('CREATE TABLE IF NOT EXISTS RESUME_TABLE (id TEXT PRIMARY KEY, rating INTEGER, description TEXT)').run();
  }
  const stmt = db.prepare('SELECT * FROM RESUME_TABLE');

  app.get('/db_get_all_resumes', (req,res) => {
    console.log("Fetching all resumes from db...");
    const stmt = db.prepare('SELECT * FROM RESUME_TABLE');
    stmt.all().forEach(({ id, rating, description }) => {
      console.log(id, rating, description);
    });
    res.send(stmt.all());
  });
  app.get('/db_reset', (req,res) => {
    console.log("Resetting entire database");
    db.prepare('DROP TABLE IF EXISTS RESUME_TABLE').run();
    db.prepare('CREATE TABLE IF NOT EXISTS RESUME_TABLE (id TEXT PRIMARY KEY, rating INTEGER, description TEXT)').run();
    res.send("success reseting database");
  });
  app.get('/db_add_entry', (req,res) => {
    num = Math.floor(Math.random() * 10000);
    console.log(`Inserting an entry to database (${num}, 5, test description v2)`);
    db.prepare('INSERT INTO RESUME_TABLE (id, rating, description) VALUES (?,?,?)').run(num, 5, "This is a test description v2");
    res.send("success adding random entry to database");
  });
  app.get('/db_load_from_dir', (req,res) => {
    db.prepare('DROP TABLE IF EXISTS RESUME_TABLE').run();
    db.prepare('CREATE TABLE IF NOT EXISTS RESUME_TABLE (id TEXT PRIMARY KEY, rating INTEGER, description TEXT)').run();
    let cmd = "ls -1 /root/resumerater/resumerater/uploads/"
    exec(cmd, (err, stdout, stderr) => {
      if (err !== null) {
        console.log('exec error: ' + err);
      }
      console.log("output is: " + stdout)
      output = stdout.split(/\r?\n/);
      // 👇️ ['first', 'second', 'third']
      console.log("output is: " + output + " and its length is: " + output.length);
      console.log("output[0] is: " + output[0] + " and output[length-2] is: " + output[output.length-2]);
      let i=0;
      for(i=0;i<output.length-1;i++) {
        console.log("output[" + i + "] is: " + output[i]);
        db.prepare('INSERT INTO RESUME_TABLE (id, rating, description) VALUES (?,?,?)').run(output[i], 5, "No description yet.");
      }
    });
    res.send("success clearing & reloading database");
  });

app.get('/getrating/:id', (req,res) => {
  const id = req.params.id;
  console.log("Fetching rating from pdf with id " + id);
    const stmt = db.prepare('SELECT rating FROM RESUME_TABLE WHERE id = ?').get(id);
    console.log(stmt.rating.toString())
    res.send(stmt.rating.toString());
});

app.get('/getdesc/:id', (req,res) => {
  const id = req.params.id;
  console.log("Fetching desc from pdf with id " + id);
    const stmt = db.prepare('SELECT description FROM RESUME_TABLE WHERE id = ?').get(id);
    console.log(stmt.description)
    res.send(stmt.description);
});
app.get('/rate/:idw/:idl', (req,res) => {
  const idw = req.params.idw;
  const idl = req.params.idl;
  db.prepare('UPDATE RESUME_TABLE SET rating=rating+1 WHERE id = ?').run(idw);
  db.prepare('UPDATE RESUME_TABLE SET rating=rating-1 WHERE id = ?').run(idl);
  res.send(`incremented ${idw.substring(0,3)}... and decremented ${idl.substring(0,3)}...`);
});
app.post('/updatedesc', (req,res) => {
  const id = req.body.id;
  const desc = req.body.desc;
  console.log("Updating desc for pdf with id " + id + " to " + desc)
  db.prepare('UPDATE RESUME_TABLE SET description = ? WHERE id = ?').run(desc,id);
  db.prepare('SELECT description FROM RESUME_TABLE WHERE id = ?').run(id);
  res.json({message:'updated description'});
});

app.get('/random', (req,res) => {
  console.log("Fetching Random PDF");
  let cmd = "find /root/resumerater/resumerater/uploads/* -name '*' | shuf -n 1"
    let output = "";
    exec(cmd, (err, stdout, stderr) => {
      if (err !== null) {
        console.log('exec error: ' + err);
      }
      console.log(stdout)
      output = stdout.substring(38,stdout.length);
      console.log(output)
      console.log("FINISHED:")
      console.log("final res send output is: " + output)
      res.send(output);
    });
});

app.post('/upload', upload.single('pdf'), (req, res) => {
    console.log('someone hitting upload route')
    db.prepare('DROP TABLE IF EXISTS RESUME_TABLE').run();
    db.prepare('CREATE TABLE IF NOT EXISTS RESUME_TABLE (id TEXT PRIMARY KEY, rating INTEGER, description TEXT)').run();
    let cmd = "ls -1 /root/resumerater/resumerater/uploads/"
    exec(cmd, (err, stdout, stderr) => {
      if (err !== null) {
        console.log('exec error: ' + err);
      }
      console.log("output is: " + stdout)
      output = stdout.split(/\r?\n/);
      // 👇️ ['first', 'second', 'third']
      console.log("output is: " + output + " and its length is: " + output.length);
      console.log("output[0] is: " + output[0] + " and output[length-2] is: " + output[output.length-2]);
      let i=0;
      for(i=0;i<output.length-1;i++) {
        console.log("output[" + i + "] is: " + output[i]);
        db.prepare('INSERT INTO RESUME_TABLE (id, rating, description) VALUES (?,?,?)').run(output[i], 5, "No description yet.");
      }
    });
    res.redirect('http://139.177.207.245:3000/');
  });

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});