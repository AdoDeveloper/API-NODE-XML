
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const cors = require('cors');

const app = express();
const port = 3001;
app.use(express.static(__dirname));
app.use(cors());

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
  console.log(`Ruta API: http://localhost:${port}/usuarios`);
  console.log(`Ruta Interfaz: http://localhost:${port}/index.htm`);
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'crud_api',
});

connection.connect((error) => {
  if (error) {
    console.error(error);
  } else {
    console.log('Conectado a la base de datos');
  }
});

app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'application/xml' }));

// Middleware para analizar el cuerpo XML
app.use((req, res, next) => {
  if (req.is('application/xml')) {
    xml2js.parseString(req.body, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('Formato XML inválido');
        res.status(400).send('Formato XML inválido');
      } else {
        req.body = result;
        next();
      }
    });
  } else {
    next();
  }
});

app.get('/usuarios', (request, response) => {
  connection.query('SELECT * FROM users', (error, data) => {
    if (error) {
      console.error(error);
      response.status(500).send('Error al recuperar usuarios');
    } else {
      // Convertir datos a formato XML
      const xmlBuilder = new xml2js.Builder();
      const xmlString = xmlBuilder.buildObject({ usuarios: data });

      // Establecer el encabezado Content-Type a application/xml
      response.header('Content-Type', 'application/xml');

      // Enviar la respuesta XML
      console.log('Usuarios recuperados');
      console.log(xmlString);
      response.send(xmlString);
    }
  });
});

app.post('/usuarios', (request, response) => {
  const { name, email } = request.body.user;

  // Agregar impresiones de consola para verificar los valores
  console.log('Nombre:', name);
  console.log('Correo electrónico:', email);

  connection.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (error) => {
    if (error) {
      console.error(error);
      response.status(500).send('Error al crear usuario');
    } else {
      console.log('Usuario creado exitosamente');
      response.send('Usuario creado exitosamente');
    }
  });
});

app.put('/usuarios/:id', (request, response) => {
  const { id } = request.params;
  const { name, email } = request.body.user;

  // Verificar si el usuario existe antes de intentar actualizarlo
  connection.query('SELECT * FROM users WHERE id = ?', [id], (selectError, selectResult) => {
    if (selectError) {
      console.error(selectError);
      response.status(500).send('Error al verificar la existencia del usuario');
    } else {
      if (selectResult.length === 0) {
        // No se encontró el usuario con el ID proporcionado
        console.log('Usuario no encontrado con el ID proporcionado');
        response.status(404).send('Usuario no encontrado con el ID proporcionado');
      } else {
        // El usuario existe, proceder con la actualización
        connection.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (updateError) => {
          if (updateError) {
            console.error(updateError);
            response.status(500).send('Error al actualizar usuario');
          } else {
            console.log('Usuario actualizado exitosamente');
            response.send('Usuario actualizado exitosamente');
          }
        });
      }
    }
  });
});


app.delete('/usuarios', (request, response) => {
  const { id } = request.body.user; // Extraer el ID del cuerpo XML

  // Verificar si el usuario existe antes de intentar eliminarlo
  connection.query('SELECT * FROM users WHERE id = ?', [id], (selectError, selectResult) => {
    if (selectError) {
      console.error(selectError);
      response.status(500).send('Error al verificar la existencia del usuario');
    } else {
      if (selectResult.length === 0) {
        // No se encontró el usuario con el ID proporcionado
        console.log('Usuario no encontrado con el ID proporcionado');
        response.status(404).send('Usuario no encontrado con el ID proporcionado');
      } else {
        // El usuario existe, proceder con la eliminación
        connection.query('DELETE FROM users WHERE id = ?', [id], (deleteError) => {
          if (deleteError) {
            console.error(deleteError);
            response.status(500).send('Error al eliminar usuario');
          } else {
            console.log('Usuario eliminado exitosamente');
            response.send('Usuario eliminado exitosamente');
          }
        });
      }
    }
  });
});

