const express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mysql= require('mysql2');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ycode@2021',
    database: 'brief4'
  });
/*insertion d'une user et supprition*/
  //INSERT INTO users (nom, prenom, tele, Adresse, profession, organisation, email, password, role)
 //VALUES ('taouili', 'hanane', '1234567890', '123 Main St', 'Freelance', 'Corporate', 'hanane@gmail.com', 'hanane','admin');
 //select * from users;
 //delete from users where id=2;
 

  db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
  });

  app.use(session({
    secret: '123456789',
    resave: false,
    saveUninitialized: true
  }));

app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(flash());
app.use(express.static('public'));

// Définir le moteur de template sur EJS
app.set('view engine', 'ejs');

// Définir le dossier des vues
app.set('views', path.join(__dirname, 'views'));

// Définir le dossier public pour les fichiers statiques
app.use(express.static(path.join(__dirname, '')));


// app.post('/inscreption', (req, res) => {
//     const { nom, prenom, tele, Adresse, profession, organisation, email, password } = req.body;
  
//     if (req.body.hasOwnProperty('signUp')) {
//       const query = `INSERT INTO users (nom, prenom, tele, Adresse, profession, organisation, email, password)
//                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
//       db.query(query, [nom, prenom, tele, Adresse, profession, organisation, email, password], (err, results) => {
//         if (err) {
//           res.status(500).send('Error registering user: ' + err.message);
//         } else {
//           res.send('User registered successfully');
//         }
//       });
//     } else if (req.body.hasOwnProperty('signIn')) {
//       const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
//       db.query(query, [email, password], (err, results) => {
//         if (err) {
//           res.status(500).send('Error signing in: ' + err.message);
//         } else if (results.length > 0) {
//           res.send('User signed in successfully');
//         } else {
//           res.status(401).send('Invalid email or password');
//         }
//       });
//     }
//   });

// Gestion de l'inscription
app.post('/inscreption', (req, res) => {
    const { nom, prenom, tele, Adresse, profession, organisation, email, password, signUp, signIn } = req.body;
  
    if (signUp) {
      // Handle sign-up
      const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
      db.query(checkEmailQuery, [email], (error, results) => {
        if (error) {
          return res.render('inscreption', { error: 'Erreur lors de la vérification de l\'email' });
        }
  
        if (results.length > 0) {
          return res.render('inscreption', { error: 'Email déjà utilisé' });
        } else {
          const role = 'user';
          const insertQuery = 'INSERT INTO users (nom, prenom, tele, Adresse, profession, organisation, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
          db.query(insertQuery, [nom, prenom, tele, Adresse, profession, organisation, email, password, role], (error, results) => {
            if (error) {
              return res.render('inscreption', { error: 'Erreur lors de l\'enregistrement de l\'utilisateur' });
            }
            console.log('Utilisateur inscrit avec succès.');
            req.flash('message', 'Inscription réussie !');
            res.redirect('/index');
          });
        }
      });
    } else if (signIn) {
      // Handle sign-in
      const query = 'SELECT * FROM users WHERE email = ?';
      db.query(query, [email], (error, results) => {
        if (error) {
          console.error('Erreur lors de la vérification des identifiants:', error);
          return res.render('inscreption', { error: 'Erreur lors de la vérification des identifiants' });
        }
  
        if (results.length === 0 || password !== results[0].password) { // Comparaison sans hachage
          console.log('Email ou mot de passe invalide');
          return res.render('inscreption', { error: 'Email ou mot de passe invalide' });
        }
  
        const user = results[0];
        req.session.user = {
          id: user.id,
          nom: user.nom,
          email: user.email,
          role: user.role
        };
  
        console.log('Utilisateur connecté:', req.session.user);
        res.redirect('/index'); // Assurez-vous que cette route fonctionne
      });
    }
  });

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.render('inscreption');
});

app.get('/index', (req, res) => {
    res.render('index');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});
  

// Démarrer le serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});