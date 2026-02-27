async function cargarCiudades() {
  const select = document.getElementById("citySelect");
  select.innerHTML = `<option value="">Seleccione ciudad</option>`;

  const res = await fetch("http://localhost:3000/api/cities");
  const cities = await res.json();

  for (const c of cities) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
    select.appendChild(opt);
  }
}

async function consultar() {
  const city = document.getElementById("citySelect").value;
  const date = document.getElementById("dateInput").value;

  if (!city || !date) {
    alert("Seleccione ciudad y fecha");
    return;
  }

  const res = await fetch(`http://localhost:3000/api/rules?city=${city}&date=${date}`);
  const data = await res.json();

  const result = document.getElementById("result");

  if (data.error) {
    result.innerHTML = `<p><strong>Error:</strong> ${data.error}</p><p>${data.detail || ""}</p>`;
    result.classList.remove("hidden");
    return;
  }

  const digits = (data.digitosRestringidos && data.digitosRestringidos.length)
    ? data.digitosRestringidos.join(" y ")
    : "No aplica / No encontrado";

  result.innerHTML = `
    <h3>${data.city.toUpperCase()}</h3>
    <p><strong>Fecha:</strong> ${data.date}</p>
    <p><strong>Horario:</strong> ${data.horario}</p>
    <p><strong>Placas con restricción:</strong> ${digits}</p>
    <p><strong>Mensaje:</strong> ${data.mensaje}</p>
    <p><small><strong>Fuente:</strong> <a href="${data.source}" target="_blank">Ver página</a></small></p>
    <p><small>Actualizado: ${data.updatedAt}</small></p>
  `;

  result.classList.remove("hidden");
}

cargarCiudades();