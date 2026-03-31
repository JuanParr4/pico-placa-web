document.addEventListener("DOMContentLoaded", () => {
  // Cargar fecha actual por defecto al abrir la página
  document.getElementById("dateInput").valueAsDate = new Date();
  cargarCiudades();
});

async function cargarCiudades() {
  const select = document.getElementById("citySelect");
  
  try {
    const res = await fetch("https://ele5-3.apolobyte.top/api/cities");
    if (!res.ok) throw new Error("Error al cargar ciudades");
    
    const cities = await res.json();
    select.innerHTML = `<option value="" disabled selected>Seleccione ciudad</option>`;

    for (const c of cities) {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
      select.appendChild(opt);
    }
  } catch (error) {
    select.innerHTML = `<option value="">Error de conexión</option>`;
    console.error(error);
  }
}

async function consultar() {
  const city = document.getElementById("citySelect").value;
  const date = document.getElementById("dateInput").value;
  const resultDiv = document.getElementById("result");
  const btn = document.getElementById("btnConsultar");

  if (!city || !date) {
    alert("Por favor, seleccione una ciudad y una fecha válida.");
    return;
  }

  // Estado de carga
  btn.textContent = "Consultando...";
  btn.disabled = true;
  resultDiv.classList.add("hidden");

  try {
    const res = await fetch(`https://ele5-3.apolobyte.top/api/rules?city=${city}&date=${date}`);
    const data = await res.json();

    if (data.error) {
      mostrarError(data.error, data.detail);
      return;
    }

    // Formatear los dígitos restringidos de manera más visual
    const digitsText = (data.digitosRestringidos && data.digitosRestringidos.length)
      ? `<span class="badge">${data.digitosRestringidos.join(" - ")}</span>`
      : "<strong>No aplica / Sin restricción</strong>";

    resultDiv.innerHTML = `
      <h3>📍 ${data.city.toUpperCase()}</h3>
      <p><strong>📅 Fecha:</strong> ${data.date}</p>
      <p><strong>🕒 Horario:</strong> ${data.horario}</p>
      <p><strong>🚫 Placas con restricción:</strong> <br> ${digitsText}</p>
      <p><strong>ℹ️ Mensaje:</strong> ${data.mensaje}</p>
      <p style="margin-top: 15px;"><small><strong>🔗 Fuente:</strong> <a href="${data.source}" target="_blank" style="color: #4e73df;">Ver página oficial</a></small></p>
      <p><small>⏱️ Actualizado: ${data.updatedAt}</small></p>
    `;
    
    resultDiv.classList.remove("hidden");

  } catch (error) {
    mostrarError("Error de conexión", "No se pudo conectar con el servidor. Verifica que el backend esté encendido.");
    console.error(error);
  } finally {
    // Restaurar estado del botón
    btn.textContent = "Consultar Restricción";
    btn.disabled = false;
  }
}

function mostrarError(titulo, detalle = "") {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <h3 style="color: #e74a3b;">❌ ${titulo}</h3>
    <p>${detalle}</p>
  `;
  resultDiv.style.borderLeftColor = "#e74a3b";
  resultDiv.classList.remove("hidden");
}