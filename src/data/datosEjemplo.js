import { PREFIJOS } from '../constants'

// Catálogo de ejemplo: [nombre, stock total, ¿en mantenimiento?]
export const CATALOGO = {
    Microcontroladores: [
        ['Arduino Uno R3', 12],
        ['Arduino Nano', 10],
        ['Arduino Mega 2560', 6],
        ['Arduino Leonardo', 4],
        ['ESP32 DevKit V1', 10],
        ['ESP8266 NodeMCU', 8],
        ['ESP32-CAM', 5],
        ['Raspberry Pi Pico', 8],
        ['Raspberry Pi 4 Model B', 4, true],
        ['STM32 Blue Pill', 6],
    ],
    Sensores: [
        ['Sensor ultrasónico HC-SR04', 15],
        ['Sensor de temperatura DHT11', 12],
        ['Sensor de temperatura DHT22', 8],
        ['Fotoresistencia LDR', 20],
        ['Acelerómetro MPU6050', 6],
        ['Sensor de movimiento PIR HC-SR501', 8],
        ['Sensor de presión BMP280', 6],
        ['Sensor de gas MQ-2', 6],
        ['Sensor de humedad de suelo', 10],
        ['Sensor infrarrojo TCRT5000', 10],
    ],
    Actuadores: [
        ['Servomotor SG90', 15],
        ['Servomotor MG996R', 6],
        ['Motor DC con caja reductora', 12],
        ['Motor paso a paso 28BYJ-48', 8],
        ['Relé 5V de 1 canal', 10],
        ['Módulo de relés de 4 canales', 5],
        ['Buzzer activo 5V', 15],
        ['Mini bomba de agua sumergible', 4, true],
        ['Driver de motores L298N', 8],
        ['Driver ULN2003', 6],
    ],
    Módulos: [
        ['Display LCD 16x2 con I2C', 10],
        ['Pantalla OLED 0.96" I2C', 8],
        ['Módulo Bluetooth HC-05', 8],
        ['Módulo WiFi ESP-01', 6],
        ['Lector RFID RC522', 6],
        ['Módulo GPS NEO-6M', 4],
        ['Módulo lector de tarjeta SD', 6],
        ['Teclado matricial 4x4', 8],
        ['Reloj en tiempo real DS3231', 6],
        ['Display 7 segmentos de 4 dígitos', 6],
    ],
    Herramientas: [
        ['Multímetro digital', 6],
        ['Cautín de 40W', 8],
        ['Estaño con flux (rollo)', 10],
        ['Protoboard de 830 puntos', 20],
        ['Protoboard de 400 puntos', 15],
        ['Pinzas de punta', 8],
        ['Alicate de corte', 8],
        ['Desoldador de bomba', 5],
        ['Fuente regulable 30V 5A', 3],
        ['Osciloscopio digital', 2, true],
        ['Pelacables automático', 6],
        ['Lupa con soporte y luz', 4],
    ],
    Cables: [
        ['Jumpers macho-macho 20 cm (pack)', 25],
        ['Jumpers macho-hembra 20 cm (pack)', 25],
        ['Jumpers hembra-hembra 20 cm (pack)', 20],
        ['Cable USB A-B para Arduino', 15],
        ['Cable micro-USB', 20],
        ['Cable USB-C', 10],
        ['Cable HDMI 1.5 m', 4],
        ['Cable de alimentación para fuente', 6],
        ['Cable banana-caimán (par)', 8],
        ['Cable de red Ethernet 2 m', 6],
    ],
}

const NOMBRES = [
    'Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Sofía', 'Diego', 'Valeria',
    'Andrés', 'Camila', 'Fernando', 'Daniela', 'Jorge', 'Lucía', 'Pablo', 'Gabriela',
]
const APELLIDOS = [
    'Pérez', 'Mamani', 'Quispe', 'Flores', 'Choque', 'Gutiérrez', 'Rojas', 'Condori',
    'Vargas', 'Fernández', 'Mendoza', 'Torrez', 'Apaza', 'Ramírez', 'Calle', 'Salazar',
]

// Generador de números "al azar" repetible (siempre produce los mismos datos)
function generador(semilla) {
    let a = semilla
    return () => {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const DIA = 86400000

// Construye equipos y préstamos de ejemplo con el stock siempre consistente.
// "inicios" indica desde qué número continuar cada prefijo (ej. { MICRO: 3 }).
export function construirDatosEjemplo(inicios = {}) {
    const rand = generador(2026)
    const elegir = (lista) => lista[Math.floor(rand() * lista.length)]

    // 1) Equipos con código por categoría
    const equipos = []
    Object.entries(CATALOGO).forEach(([categoria, lista]) => {
        const prefijo = PREFIJOS[categoria]
        const base = inicios[prefijo] ?? 0
        lista.forEach(([nombre, total, mantenimiento], i) => {
            equipos.push({
                clave: `${prefijo}-${i}`,
                nombre,
                categoria,
                codigo: `${prefijo}-${String(base + i + 1).padStart(3, '0')}`,
                stockTotal: total,
                stockDisponible: total,
                enMantenimiento: Boolean(mantenimiento),
            })
        })
    })

    // 2) Estudiantes de ejemplo (nombre y apellidos + CI numérico)
    const estudiantes = Array.from({ length: 22 }, () => ({
        estudiante: `${elegir(NOMBRES)} ${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`,
        codigoEstudiante: String(4000000 + Math.floor(rand() * 9000000)),
    }))

    const prestables = equipos.filter((e) => !e.enMantenimiento)
    const prestamos = []

    // 3) Préstamos pendientes (descuentan stock)
    let pendientes = 0
    let intentos = 0
    while (pendientes < 16 && intentos < 400) {
        intentos++
        const eq = elegir(prestables)
        if (eq.stockDisponible < 1) continue
        const cantidad =
            rand() < 0.12 && eq.stockDisponible <= 6
                ? eq.stockDisponible
                : 1 + Math.floor(rand() * Math.min(3, eq.stockDisponible))
        eq.stockDisponible -= cantidad
        prestamos.push({
            ...elegir(estudiantes),
            claveEquipo: eq.clave,
            equipoNombre: eq.nombre,
            cantidad,
            estado: 'Pendiente',
            fechaPrestamo: new Date(Date.now() - rand() * 9 * DIA),
            fechaDevolucion: null,
        })
        pendientes++
    }

    // 4) Préstamos ya devueltos (historial)
    for (let i = 0; i < 30; i++) {
        const eq = elegir(prestables)
        const cantidad = 1 + Math.floor(rand() * Math.min(3, eq.stockTotal))
        const prestado = new Date(Date.now() - (8 + rand() * 62) * DIA)
        prestamos.push({
            ...elegir(estudiantes),
            claveEquipo: eq.clave,
            equipoNombre: eq.nombre,
            cantidad,
            estado: 'Devuelto',
            fechaPrestamo: prestado,
            fechaDevolucion: new Date(prestado.getTime() + (1 + rand() * 5) * DIA),
        })
    }

    // 5) Estado final de cada equipo según su stock
    const equiposFinal = equipos.map(({ enMantenimiento, ...e }) => ({
        ...e,
        estado: enMantenimiento
            ? 'Mantenimiento'
            : e.stockDisponible > 0
                ? 'Disponible'
                : 'Agotado',
    }))

    return { equipos: equiposFinal, prestamos }
}