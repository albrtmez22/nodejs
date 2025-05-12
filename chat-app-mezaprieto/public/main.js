// 5. En la carpeta 'public', crea el archivo main.js

document.addEventListener('DOMContentLoaded', () => {
  // Conectar al servidor Socket.io
  const socket = io();
  
  // Elementos del DOM
  const modalUsuario = document.getElementById('modal-usuario');
  const formularioUsuario = document.getElementById('formulario-usuario');
  const formularioMensaje = document.getElementById('formulario-mensaje');
  const mensajesContainer = document.getElementById('mensajes');
  const mensajeInput = document.getElementById('mensaje-input');
  const usuariosLista = document.getElementById('usuarios-lista');
  const escribiendoIndicador = document.getElementById('escribiendo');
  
  let nombreUsuario = '';
  let timerEscribiendo;
  
  // Mostrar modal para ingresar nombre de usuario
  modalUsuario.style.display = 'flex';
  
  // Manejar envío del formulario de usuario
  formularioUsuario.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const input = document.getElementById('nombre-usuario');
    nombreUsuario = input.value.trim();
    
    if (nombreUsuario) {
      modalUsuario.style.display = 'none';
      
      // Enviar el nombre de usuario al servidor
      socket.emit('nuevo-usuario', nombreUsuario);
      
      // Añadir mensaje de bienvenida
      const mensajeBienvenida = document.createElement('div');
      mensajeBienvenida.classList.add('notification');
      mensajeBienvenida.textContent = `¡Bienvenido al chat, ${nombreUsuario}!`;
      mensajesContainer.appendChild(mensajeBienvenida);
    }
  });
  
  // Manejar envío de mensajes
  formularioMensaje.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const mensaje = mensajeInput.value.trim();
    if (mensaje) {
      // Enviar mensaje al servidor
      socket.emit('enviar-mensaje', mensaje);
      
      // Limpiar el input
      mensajeInput.value = '';
      
      // Indicar que dejó de escribir
      socket.emit('dejo-de-escribir');
    }
  });
  
  // Detectar cuando el usuario está escribiendo
  mensajeInput.addEventListener('input', () => {
    // Si hay texto en el input, enviar evento "escribiendo"
    if (mensajeInput.value.trim().length > 0) {
      socket.emit('escribiendo');
      
      // Reiniciar el timer cada vez que el usuario escribe
      clearTimeout(timerEscribiendo);
      
      // Configurar un nuevo timer para enviar "dejó de escribir" después de 2 segundos de inactividad
      timerEscribiendo = setTimeout(() => {
        socket.emit('dejo-de-escribir');
      }, 2000);
    } else {
      // Si el input está vacío, enviar evento "dejó de escribir"
      socket.emit('dejo-de-escribir');
    }
  });
  
  // Escuchar eventos del servidor
  
  // Mensaje recibido
  socket.on('mensaje-chat', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // Determinar si el mensaje es propio o de otro usuario
    if (data.nombre === nombreUsuario) {
      messageElement.classList.add('message-sent');
    } else {
      messageElement.classList.add('message-received');
    }
    
    // Crear elementos para la información del mensaje (nombre y tiempo)
    const messageInfo = document.createElement('div');
    messageInfo.classList.add('message-info');
    
    const nombreElement = document.createElement('span');
    nombreElement.textContent = data.nombre === nombreUsuario ? 'Tú' : data.nombre;
    
    const tiempoElement = document.createElement('span');
    tiempoElement.textContent = data.tiempo;
    
    messageInfo.appendChild(nombreElement);
    messageInfo.appendChild(tiempoElement);
    
    // Crear elemento para el contenido del mensaje
    const messageContent = document.createElement('div');
    messageContent.textContent = data.mensaje;
    
    // Añadir elementos al mensaje
    messageElement.appendChild(messageInfo);
    messageElement.appendChild(messageContent);
    
    // Añadir mensaje al contenedor
    mensajesContainer.appendChild(messageElement);
    
    // Desplazar automáticamente hacia abajo
    mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
  });
  
  // Nuevo usuario conectado
  socket.on('usuario-conectado', (nombre) => {
    const notificacion = document.createElement('div');
    notificacion.classList.add('notification');
    notificacion.textContent = `${nombre} se ha unido al chat`;
    mensajesContainer.appendChild(notificacion);
    
    // Desplazar automáticamente hacia abajo
    mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
  });
  
  // Usuario desconectado
  socket.on('usuario-desconectado', (nombre) => {
    const notificacion = document.createElement('div');
    notificacion.classList.add('notification');
    notificacion.textContent = `${nombre} ha abandonado el chat`;
    mensajesContainer.appendChild(notificacion);
    
    // Desplazar automáticamente hacia abajo
    mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
  });
  
  // Actualizar lista de usuarios
  socket.on('lista-usuarios', (usuarios) => {
    usuariosLista.innerHTML = '';
    
    usuarios.forEach((usuario) => {
      const li = document.createElement('li');
      li.textContent = usuario === nombreUsuario ? `${usuario} (Tú)` : usuario;
      usuariosLista.appendChild(li);
    });
  });
  
  // Usuario escribiendo
  socket.on('usuario-escribiendo', (nombre) => {
    escribiendoIndicador.textContent = `${nombre} está escribiendo...`;
  });
  
  // Usuario dejó de escribir
  socket.on('usuario-dejo-de-escribir', () => {
    escribiendoIndicador.textContent = '';
  });
});