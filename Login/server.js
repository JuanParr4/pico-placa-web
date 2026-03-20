const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const { Pool } = require("pg")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(__dirname)) 

const pool = new Pool({
  user: "postgres",
  host: "postgres-db",
  database: "Login_db",
  password: "1234",
  port: 5432
})

// LOGIN
app.post("/login", async (req, res) => {
  const { usuario, password } = req.body

  try {
    // 1. Buscamos en la base de datos SOLO por el nombre de usuario
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE usuario=$1",
      [usuario]
    )

    if (result.rows.length > 0) {
      const usuarioDb = result.rows[0]
      
      // 2. Comparamos la contraseña en texto plano con la encriptada de la BD
      const match = await bcrypt.compare(password, usuarioDb.password)

      if (match) {
        res.json({ mensaje: "Login correcto" })
      } else {
        res.json({ mensaje: "Usuario o contraseña incorrectos" })
      }
    } else {
      // Si el usuario no existe
      res.json({ mensaje: "Usuario o contraseña incorrectos" })
    }

  } catch (error) {
    console.error(error)
    res.status(500).json({ mensaje: "Error del servidor" })
  }
})

// REGISTRO DE USUARIOS
app.post("/registro", async (req, res) => {
  const { usuario, password } = req.body

  try {
    // 1. Encriptamos la contraseña (el 10 indica el nivel de seguridad o "salt rounds")
    const hashedPassword = await bcrypt.hash(password, 10)

    // 2. Guardamos la contraseña encriptada en lugar de la original
    await pool.query(
      "INSERT INTO usuarios (usuario, password) VALUES ($1,$2)",
      [usuario, hashedPassword]
    )

    res.json({ mensaje: "Usuario registrado correctamente" })

  } catch (error) {
    if (error.code === "23505") {
      res.json({ mensaje: "El usuario ya existe" })
    } else {
      console.error(error)
      res.status(500).json({ mensaje: "Error del servidor" })
    }
  }
})

// RUTA RAÍZ PARA PROBAR
app.get("/", (req, res) => {
  res.send("Login funcionando 🔑")
})

app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001")
})