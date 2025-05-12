// 1. Primero, crea el archivo server.js en la raíz del proyecto

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Configuración del servidor
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Almacenar usuarios conectados
const usuarios = {};

// Configurar Socket.io para manejar conexiones
io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');
  
  // Manejar registro de usuario
  socket.on('nuevo-usuario', (nombre) => {
    usuarios[socket.id] = nombre;
    // Informar a todos los clientes que un nuevo usuario se ha conectado
    socket.broadcast.emit('usuario-conectado', nombre);
    // Enviar lista de usuarios conectados
    io.emit('lista-usuarios', Object.values(usuarios));
  });
  
  // Manejar mensajes
  socket.on('enviar-mensaje', (mensaje) => {
    // Emitir el mensaje a todos los clientes, incluyendo el nombre del remitente
    io.emit('mensaje-chat', { 
      mensaje: mensaje, 
      nombre: usuarios[socket.id],
      tiempo: new Date().toLocaleTimeString()
    });
  });
  
  // Manejar desconexión
  socket.on('disconnect', () => {
    const nombreUsuario = usuarios[socket.id];
    if (nombreUsuario) {
      socket.broadcast.emit('usuario-desconectado', nombreUsuario);
      delete usuarios[socket.id];
      // Actualizar lista de usuarios conectados
      io.emit('lista-usuarios', Object.values(usuarios));
    }
    console.log('Usuario desconectado');
  });
  
  // Manejar "está escribiendo"
  socket.on('escribiendo', () => {
    socket.broadcast.emit('usuario-escribiendo', usuarios[socket.id]);
  });
  
  socket.on('dejo-de-escribir', () => {
    socket.broadcast.emit('usuario-dejo-de-escribir', usuarios[socket.id]);
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});