const express = require('express');
const bodyParser = require('body-parser');
const bodyParserXml = require('body-parser-xml');
const mssql = require('mssql');
const xml2js = require('xml2js');
const { DOMParser } = require('xmldom');

const app = express();
const port = process.env.PORT || 3000;

const dbConfig = {
  user: 'sa',
  password: 'root',
  server: 'localhost',
  port: 1433,
  database: 'EjemploXMLDB',
  options: {
    encrypt: false,
  },
};

// Configurar body-parser-xml para manejar XML
bodyParserXml(bodyParser);

app.use(bodyParser.xml());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

mssql.connect(dbConfig)
  .then(() => {
    console.log('Conectado a la base de datos');
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos', err);
  });

// Rutas para Cursos
app.get('/api/cursos', async (req, res) => {
  try {
    // Obtener la lista de cursos desde la base de datos
    const result = await mssql.query('SELECT * FROM Cursos FOR XML PATH(\'Curso\'), ROOT(\'ListaCursos\')');
    
    console.log('Lista de cursos obtenida:');
    console.log(result.recordset);

    res.setHeader('Content-Type', 'application/xml'); // Configura el tipo de contenido a XML
    res.send(result.recordset);
  } catch (err) {
    console.error('Error al obtener cursos', err);
    res.status(500).send('Error Interno del Servidor');
  }
});

app.post('/api/cursos', async (req, res) => {
  const { nombre, categoria, maestro } = req.body;

  // Construir la cadena XML
  const detallesCursoXML = `<Nombre>${nombre}</Nombre><Categoria>${categoria}</Categoria><Maestro>${maestro}</Maestro>`;

  try {
    await mssql.query`
      INSERT INTO Cursos (DetallesCurso)
      VALUES (${detallesCursoXML});
    `;

    console.log('Curso creado exitosamente');
    res.send('Curso creado exitosamente');
  } catch (err) {
    console.error('Error al crear curso', err);
    res.status(500).send('Error Interno del Servidor');
  }
});

app.put('/api/cursos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, maestro } = req.body;

  // Construir la cadena XML
  const detallesCursoXML = `<Nombre>${nombre}</Nombre><Categoria>${categoria}</Categoria><Maestro>${maestro}</Maestro>`;

  try {
    await mssql.query`
      UPDATE Cursos
      SET DetallesCurso.modify('replace value of (Curso/Nombre/text())[1] with ${nombre}'),
          DetallesCurso.modify('replace value of (Curso/Categoria/text())[1] with ${categoria}'),
          DetallesCurso.modify('replace value of (Curso/Maestro/text())[1] with ${maestro}')
      WHERE CursoID = ${id};
    `;

    console.log('Curso actualizado exitosamente:', { id, nombre, categoria, maestro });
    res.send('Curso actualizado exitosamente');
  } catch (err) {
    console.error('Error al actualizar curso', err);
    res.status(500).send('Error Interno del Servidor');
  }
});

app.delete('/api/cursos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await mssql.query`
      DELETE FROM Cursos
      WHERE CursoID = ${id};
    `;

    console.log('Curso eliminado exitosamente:', { id });
    res.send('Curso eliminado exitosamente');
  } catch (err) {
    console.error('Error al eliminar curso', err);
    res.status(500).send('Error Interno del Servidor');
  }
});

// Rutas para Estudiantes
app.get('/api/estudiantes', async (req, res) => {
  try {
    // Obtener la lista de estudiantes desde la base de datos
    const result = await mssql.query('SELECT * FROM Estudiantes FOR XML PATH(\'Estudiante\'), ROOT(\'ListaEstudiantes\')');
    
    console.log('Lista de estudiantes obtenida:');
    console.log(result.recordset);

    res.setHeader('Content-Type', 'application/xml'); // Configura el tipo de contenido a XML
    res.send(result.recordset);
  } catch (err) {
    console.error('Error al obtener estudiantes', err);
    res.status(500).send('Error Interno del Servidor');
  }
});

app.post('/api/estudiantes', async (req, res) => {
  const { nombre, apellido, cursoId } = req.body;

  // Construir la cadena XML
  const datosEstudianteXML = `<Nombre>${nombre}</Nombre><Apellido>${apellido}</Apellido>`;

  try {
    await mssql.query`
      INSERT INTO Estudiantes (DatosEstudiante, CursoID)
      VALUES (${datosEstudianteXML}, ${cursoId});
    `;

    console.log('Estudiante creado exitosamente');
    res.send('Estudiante creado exitosamente');
  } catch (err) {
    console.error('Error al crear estudiante', err);
    res.status(500).send('Error Interno del Servidor');
  }
});

app.put('/api/estudiantes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, cursoId } = req.body;

  try {
    await mssql.query`
      UPDATE Estudiantes
      SET DatosEstudiante.modify('replace value of (Estudiante/Nombre/text())[1] with ${nombre}'),
          DatosEstudiante.modify('replace value of (Estudiante/Apellido/text())[1] with ${apellido}'),
          CursoID = ${cursoId}
      WHERE EstudianteID = ${id};
    `;

    console.log('Estudiante actualizado exitosamente:', { id, nombre, apellido, cursoId });
    res.send('Estudiante actualizado exitosamente');
  } catch (err) {
    console.error('Error al actualizar estudiante', err);
    res.status(500).send('Error Interno del Servidor');
  }
});

app.delete('/api/estudiantes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await mssql.query`
      DELETE FROM Estudiantes
      WHERE EstudianteID = ${id};
    `;

    console.log('Estudiante eliminado exitosamente:', { id });
    res.send('Estudiante eliminado exitosamente');
  } catch (err) {
    console.error('Error al eliminar estudiante', err);
    res.status(500).send('Error Interno del Servidor');
  }
});

app.listen(port, () => {
  console.log(`El servidor está corriendo en el puerto ${port}`);
});



// Ruta para Estudiantes en formato JSON
app.get('/api/estudiantes/json', async (req, res) => {
  try {
    // Obtener la lista de estudiantes desde la base de datos
    const result = await mssql.query('SELECT * FROM Estudiantes FOR XML PATH(\'Estudiante\'), ROOT(\'ListaEstudiantes\')');
    
    console.log('Datos de la base de datos:');
    console.log(result.recordset);

    // Verificar si hay datos antes de intentar convertir a JSON
    if (result.recordset.length > 0) {
      // Mostrar el contenido real de la primera fila
      console.log('Contenido real de la primera fila:');
      console.log(result.recordset[0]);

      // Extraer la cadena XML de la primera fila
      const xml = result.recordset[0]['XML_F52E2B61-18A1-11d1-B105-00805F49916B'];

      // Verificar si la cadena XML no es null o undefined
      if (xml !== null && xml !== undefined) {
        // Convertir XML a JSON
        xml2js.parseString(xml, { explicitArray: false, mergeAttrs: true }, (err, jsonData) => {
          if (err) {
            console.error('Error al convertir XML a JSON', err);
            res.status(500).send('Error Interno del Servidor');
          } else {
            // Extraer la lista de estudiantes y enviar la respuesta como JSON
            const estudiantes = jsonData.ListaEstudiantes.Estudiante;
            if (Array.isArray(estudiantes)) {
              res.setHeader('Content-Type', 'application/json');
              res.send(estudiantes);
            } else if (estudiantes) {
              // Si solo hay un estudiante, convertirlo en un array
              res.setHeader('Content-Type', 'application/json');
              res.send([estudiantes]);
            } else {
              res.status(404).send('No se encontraron datos de estudiantes');
            }
          }
        });
      } else {
        res.status(404).send('No se encontraron datos de estudiantes');
      }
    } else {
      res.status(404).send('No se encontraron datos de estudiantes');
    }
  } catch (err) {
    console.error('Error al obtener estudiantes', err);
    res.status(500).send('Error Interno del Servidor');
  }
});