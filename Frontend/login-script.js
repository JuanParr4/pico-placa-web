// Ruta api, desactivamos ruta con //

const API_URL = "http://localhost:3005";                 // Ruta prueba local, activo.
//const API_URL = "https://ele5-3.apolobyte.top";                 // modo servidor, se debe activar cuando se suba al servidor

const REDIRECT_URL = "http://localhost:3004/index.html"; // PRUEBA LOCAL (PC)
//const REDIRECT_URL = "/index.html";                         

// LOGIN
document.getElementById("loginForm").addEventListener("submit",function(e){

e.preventDefault()

let usuario = document.getElementById("usuario").value
let password = document.getElementById("password").value

fetch(`${API_URL}/login`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
usuario:usuario,
password:password
})

})

.then(res => res.json())
.then(data =>{

document.getElementById("mensaje").innerText = data.mensaje

if(data.mensaje === "Login correcto"){
window.location.href = REDIRECT_URL;
}

})

})


// MOSTRAR REGISTRO
document.getElementById("mostrarRegistro").addEventListener("click",function(){

document.getElementById("loginForm").style.display="none"
document.getElementById("registroForm").style.display="block"

document.getElementById("mostrarRegistro").style.display="none"
document.getElementById("volverLogin").style.display="block"

})


// VOLVER AL LOGIN
document.getElementById("volverLogin").addEventListener("click",function(){

document.getElementById("loginForm").style.display="block"
document.getElementById("registroForm").style.display="none"

document.getElementById("mostrarRegistro").style.display="block"
document.getElementById("volverLogin").style.display="none"

})


// REGISTRO
document.getElementById("registroForm").addEventListener("submit",function(e){

e.preventDefault()

let usuario = document.getElementById("usuarioRegistro").value
let password = document.getElementById("passwordRegistro").value

fetch(`${API_URL}/registro`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
usuario:usuario,
password:password
})

})

.then(res => res.json())
.then(data =>{

document.getElementById("mensaje").innerText = data.mensaje

})

})