-- Crear la base de datos
CREATE DATABASE EjemploXMLDB;
GO

-- Usar la base de datos
USE EjemploXMLDB;
GO

-- Crear la tabla Cursos
CREATE TABLE Cursos (
    CursoID INT PRIMARY KEY IDENTITY(1,1),
    DetallesCurso XML
);

-- Insertar datos en la tabla Cursos
INSERT INTO Cursos (DetallesCurso)
VALUES
('<Nombre>Matemáticas</Nombre><Categoria>Ciencias</Categoria><Maestro>Carlos Martinez</Maestro>'),
('<Nombre>Historia</Nombre><Categoria>Humanidades</Categoria><Maestro>Juan Perez</Maestro>');

-- Crear la tabla Estudiantes
CREATE TABLE Estudiantes (
    EstudianteID INT PRIMARY KEY IDENTITY(1,1),
    DatosEstudiante XML,
    CursoID INT
);

-- Insertar datos en la tabla Estudiantes
INSERT INTO Estudiantes (DatosEstudiante, CursoID)
VALUES
('<Nombre>Juan</Nombre><Apellido>Pérez</Apellido>', 1),
('<Nombre>Maria</Nombre><Apellido>González</Apellido>', 2);

SELECT EstudianteID, DatosEstudiante.query('.') AS DatosEstudiante
FROM Estudiantes
FOR XML PATH('Estudiante'), ROOT('ListaEstudiantes');


-- Leer datos de Cursos con un nombre de elemento raíz diferente
SELECT CursoID, DetallesCurso AS DetallesCursoXML
FROM Cursos
FOR XML PATH('Curso'), ROOT('ListaCursos');

-- Leer datos de Estudiantes
SELECT EstudianteID, DatosEstudiante AS DatosEstudianteXML, CursoID
FROM Estudiantes
FOR XML PATH('Estudiante'), ROOT('ListaEstudiantes');

SELECT * FROM Estudiantes;

SELECT
  *
FROM
  Estudiantes
FOR XML PATH('Estudiante'), ROOT('ListaEstudiantes');

-- Filtrar estudiantes por nombre
SELECT
  EstudianteID,
  DatosEstudiante.query('.') AS DatosEstudianteXML,
  CursoID
FROM
  Estudiantes
WHERE
  DatosEstudiante.value('(Nombre)[1]', 'NVARCHAR(100)') = 'Juan';

-- Filtrar estudiantes por apellido
SELECT
  EstudianteID,
  DatosEstudiante.query('.') AS DatosEstudianteXML,
  CursoID
FROM
  Estudiantes
WHERE
  DatosEstudiante.value('(Apellido)[1]', 'NVARCHAR(100)') = 'Pérez';



-- Actualizar datos de Cursos
UPDATE Cursos
SET DetallesCurso.modify('replace value of (Curso/Maestro/text())[1] with "Nuevo Maestro"')
WHERE CursoID = 1;

-- Actualizar datos de Estudiantes
UPDATE Estudiantes
SET DatosEstudiante.modify('replace value of (Estudiante/Apellido/text())[1] with "Nuevo Apellido"')
WHERE EstudianteID = 1;

-- Leer datos de Cursos después de la actualización
SELECT CursoID, DetallesCurso AS DetallesCursoXML
FROM Cursos
FOR XML PATH('Curso'), ROOT('ListaCursos');

-- Leer datos de Estudiantes después de la actualización
SELECT EstudianteID, DatosEstudiante AS DatosEstudianteXML, CursoID
FROM Estudiantes
FOR XML PATH('Estudiante'), ROOT('ListaEstudiantes');

-- Eliminar datos de Cursos
DELETE FROM Cursos WHERE CursoID = 2;

-- Eliminar datos de Estudiantes
DELETE FROM Estudiantes WHERE EstudianteID = 2;

-- Leer datos de Cursos después de la eliminación
SELECT CursoID, DetallesCurso AS DetallesCursoXML
FROM Cursos
FOR XML PATH('Curso'), ROOT('ListaCursos');

-- Leer datos de Estudiantes después de la eliminación
SELECT EstudianteID, DatosEstudiante AS DatosEstudianteXML, CursoID
FROM Estudiantes
FOR XML PATH('Estudiante'), ROOT('ListaEstudiantes');

-- Limpiar: Eliminar la base de datos 
-- DROP DATABASE EjemploXMLDB;
-- DELETE FROM Estudiantes;
-- DBCC CHECKIDENT ('Estudiantes', RESEED, 0);
