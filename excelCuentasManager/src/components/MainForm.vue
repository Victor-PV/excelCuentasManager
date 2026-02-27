<script setup lang="ts">
import { ref, computed } from 'vue'

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbz1CX7gEDsORaHnbESVNJ4RtavX1T_WepWClnWsTdtnTUGwrjyha9hArFjej0eczH2H/exec'

const token = ref('')
saveToken();

const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const API_KEY_TITLE = "api-cuentas-token"

const anioSeleccionado = ref(new Date().getFullYear())
const mesSeleccionado = ref(meses[new Date().getMonth()])
const diaSeleccionado = ref(new Date().getDate())

const aniosDisponibles = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 100 }, (_, i) => currentYear - 50 + i)
})

const diasDelMes = computed(() => {
  const mesIndex = meses.indexOf(mesSeleccionado.value ? mesSeleccionado.value : '');
  const totalDias = new Date(anioSeleccionado.value, mesIndex + 1, 0).getDate()
  return Array.from({ length: totalDias }, (_, i) => i + 1)
})

function onMesChange() {
  if (diaSeleccionado.value > diasDelMes.value.length) {
    diaSeleccionado.value = diasDelMes.value.length
  }
}

function onAnioChange() {
  if (diaSeleccionado.value > diasDelMes.value.length) {
    diaSeleccionado.value = diasDelMes.value.length
  }
}

const tipoGasto = ref('Resumen inversión')
const concepto = ref('')
const cantidad = ref<number | null>(null)
const result = ref('')
const resultOk = ref(false)
const resultMes = ref('')
const resultTipoGasto = ref('')
const resultCantidad = ref('')
const resultConcepto = ref('')
const loading = ref(false)
const showResult = ref(false)
let resultTimer: ReturnType<typeof setTimeout> | null = null

function saveToken() {
  const stored = localStorage.getItem(API_KEY_TITLE)
  if (stored) {
    token.value = stored
  } else {
    const input = prompt('Escribe el token manin: ') ?? ''
    token.value = input
    localStorage.setItem(API_KEY_TITLE, input)
  }
}

function resetToken() {
  localStorage.removeItem(API_KEY_TITLE)
  saveToken()
}

async function handleSubmit() {
  loading.value = true
  result.value = ''

  console.log('Imprimimos: ' + anioSeleccionado.value)
  console.log('Imprimimos: ' + mesSeleccionado.value)
  console.log('Imprimimos: ' + diaSeleccionado.value)
  console.log('Imprimimos: ' + tipoGasto.value)
  console.log('Imprimimos: ' + concepto.value)
  console.log('Imprimimos: ' + cantidad.value)

  const payload = {
    token: token.value,
    anio: anioSeleccionado.value,
    mes: mesSeleccionado.value,
    dia: diaSeleccionado.value,
    tipoGasto: tipoGasto.value,
    concepto: concepto.value,
    cantidad: cantidad.value
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    const json = await res.json()

    if(json.ok){
        resultOk.value = true
        result.value = json.message
        resultMes.value = json.mes
        resultTipoGasto.value = json.tipoGasto ? json.tipoGasto.replaceAll("#", "").trim() : ''
        resultCantidad.value = json.cantidad
        resultConcepto.value = json.concepto
    }else{
        resultOk.value = false
        result.value = 'Error: ' + json.error
    }
    result.value = json.ok ? json.message : 'Error: ' + json.error
    if(json.ok){
        concepto.value = ''
        cantidad.value = null
    }

    showResult.value = true
    if (resultTimer) clearTimeout(resultTimer)
    resultTimer = setTimeout(() => {
        showResult.value = false
    }, 10000)
  } catch (error) {
    result.value = 'Error: ' + (error as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="wrapper">
    <div class="wrapper2">
      <header class="top-header">
        <h2>Gestor gastos</h2>
      </header>

      <div class="form-container">
        <fieldset :disabled="loading" class="fieldset-reset">
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col">
                <label for="anio">Año:</label>
                <select id="anio" v-model="anioSeleccionado" @change="onAnioChange">
                  <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                </select>
              </div>
              <div class="col">
                <label for="mes">Mes:</label>
                <select id="mes" v-model="mesSeleccionado" @change="onMesChange">
                  <option v-for="mes in meses" :key="mes" :value="mes">{{ mes }}</option>
                </select>
              </div>
              <div class="col">
                <label for="dia">Día:</label>
                <select id="dia" v-model="diaSeleccionado">
                  <option v-for="dia in diasDelMes" :key="dia" :value="dia">{{ dia }}</option>
                </select>
              </div>
            </div>

            <label for="tipoGasto">Tipo de gasto:</label>
            <select id="tipoGasto" v-model="tipoGasto">
              <optgroup label="Ingresos">
                <option value="Resumen ingresos">Ingresos</option>
              </optgroup>
              <hr />
              <optgroup label="Ahorro">
                <option value="Resumen inversión">Inversión</option>
              </optgroup>
              <hr />
              <optgroup label="Gasto">
                <option value="# MENSUALIDADES #">Mensualidades</option>
                <option value="# COMIDA #">Comida</option>
                <option value="# HOGAR #">Hogar</option>
                <option value="# COMIDAS FUERA #">Comidas fuera</option>
                <option value="# CACHARROS #">Cacharros</option>
                <option value="# OCIO #">Ocio</option>
                <option value="# TRANSPORTE #">Transporte</option>
                <option value="# SANIDAD #">Sanidad</option>
                <option value="# ROPA #">Ropa</option>
                <option value="# VIDA DIARIA #">Vida diaria</option>
                <option value="# REGALOS #">Regalos</option>
                <option value="# OTROS #">Otros</option>
              </optgroup>
            </select>

            <label for="concepto">Concepto:</label>
            <input id="concepto" type="text" v-model="concepto" required placeholder="Ej: Café con leche" />

            <label for="cantidad">Cantidad:</label>
            <input id="cantidad" type="number" v-model="cantidad" required placeholder="0.00€" step="0.01" />

            <div class="button-row">
              <button type="button" class="reset-btn" @click="resetToken">↺</button>
              <button type="submit">{{ loading ? 'Enviando...' : 'Enviar' }}</button>
            </div>
          </form>
        </fieldset>

        <Transition name="fade">
          <p v-if="result && showResult" class="result"> 
            <span v-if="resultOk">
                {{ result }} 
                <br>
                {{ resultCantidad + "€ '" + resultConcepto + "'"}}
                <br> 
                {{ resultMes + ": " + resultTipoGasto }}
            </span>
            <span v-else>
                {{ result }}
            </span>
          </p>

        </Transition>

      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  place-items: center;
  min-height: 100vh;
  background-color: #ffffff;
  min-width: 300px;
  max-width: 480px;
  transition: all 0.3s ease;
  justify-content: center;
}

.wrapper2 {
  width: 100%;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  gap: 16px;
}

.col {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.col select {
  font-size: 0.8rem;
  padding: 8px 10px;
}

.top-header {
  background-color: #ffffff;
  padding: 20px 24px;
  margin: 0;
}

.top-header h2 {
  color: #107490;
  margin: 0;
  font-size: 1.6rem;
  font-weight: 600;
}

.form-container {
  padding: 32px 24px;
  margin: 0 auto;
}

.fieldset-reset {
  border: none;
  margin: 0;
  padding: 0;
}

.fieldset-reset:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1a2744;
}

select,
input[type='text'],
input[type='number'] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  font-size: 0.95rem;
  background-color: #ffffff;
  color: #1a2744;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

select:focus,
input:focus {
  outline: none;
  border-color: #1a2744;
}

.button-row {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.reset-btn {
  flex: 1;
  padding: 12px;
  background-color: #d0d5dd;
  color: #1a2744;
  border: none;
  border-radius: 6px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s;
  outline: none;
}

.reset-btn:hover {
  background-color: #b0b7c3;
}

button[type='submit'] {
  margin-top: 0;
  flex: 4;
  padding: 12px;
  background-color: #107490;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

button[type='submit']:hover {
  background-color: #095266;
}

.result {
  margin: 16px auto 0 auto;
  padding: 12px;
  background-color: #f4f6f8;
  border-radius: 6px;
  color: #1a2744;
  font-size: 0.9rem;
  max-width: 220px;
  overflow: hidden;
}

.fade-enter-active {
  transition: opacity 0.3s ease, max-height 0.3s ease, padding 0.3s ease, margin 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.4s ease, max-height 0.5s ease, padding 0.5s ease, margin 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
  padding: 0 12px;
  margin: 0 auto;
}

.fade-enter-to,
.fade-leave-from {
  max-height: 200px;
  padding: 12px;
  margin: 16px auto 0 auto;
}
</style>