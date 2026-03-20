/**
 * DroidNAS - Android Implementation Guide (Kotlin)
 * 
 * Este archivo contiene la lógica de referencia para implementar el servidor
 * real en un dispositivo Android usando Kotlin y Ktor.
 */

/*
// 1. Dependencias (build.gradle.kts)
implementation("io.ktor:ktor-server-core:2.3.x")
implementation("io.ktor:ktor-server-netty:2.3.x")
implementation("io.ktor:ktor-server-cors:2.3.x")
implementation("io.ktor:ktor-server-content-negotiation:2.3.x")
implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.x")

// 2. Permisos Críticos (AndroidManifest.xml)
// Requerido para acceso total a archivos en Android 11+
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

// 3. Solicitar Acceso Total (En tu Activity)
fun requestAllFilesAccess() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        if (!Environment.isExternalStorageManager()) {
            val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION)
            intent.data = Uri.parse("package:${packageName}")
            startActivity(intent)
        }
    }
}

// 4. Obtener Estadísticas de Almacenamiento Real (StatFs)
fun getStorageStats(): StorageStats {
    val path = Environment.getExternalStorageDirectory()
    val stat = StatFs(path.path)
    val blockSize = stat.blockSizeLong
    val totalBlocks = stat.blockCountLong
    val availableBlocks = stat.availableBlocksLong
    
    return StorageStats(
        total = totalBlocks * blockSize,
        free = availableBlocks * blockSize,
        used = (totalBlocks - availableBlocks) * blockSize
    )
}

data class StorageStats(val total: Long, val free: Long, val used: Long)

// 5. Foreground Service (NasService.kt)
class NasService : Service() {
    private var server: NettyApplicationEngine? = null
    private val nsdManager by lazy { getSystemService(Context.NSD_SERVICE) as NsdManager }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, createNotification())
        startServer()
        registerMdns()
        return START_STICKY
    }

    private fun startServer() {
        server = embeddedServer(Netty, port = 8080) {
            install(CORS) { anyHost() }
            install(ContentNegotiation) { json() }
            
            routing {
                get("/api/status") {
                    val stats = getStorageStats()
                    call.respond(mapOf(
                        "status" to "running",
                        "deviceStorage" to mapOf(
                            "total" to stats.total,
                            "free" to stats.free,
                            "used" to stats.used
                        )
                    ))
                }
                
                get("/files") {
                    // Usar Environment.getExternalStorageDirectory() para acceso total
                    val root = Environment.getExternalStorageDirectory()
                    val files = root.listFiles()?.map { it.toDto() } ?: emptyList()
                    call.respond(files)
                }
            }
        }.start(wait = false)
    }
}

// 6. Implicaciones de Google Play Store:
// El permiso MANAGE_EXTERNAL_STORAGE es altamente restringido. 
// Google solo lo permite para apps cuya función principal sea la gestión de archivos (como un NAS).
// Si se rechaza, la alternativa es usar Storage Access Framework (SAF), 
// pero esto requiere que el usuario seleccione manualmente la carpeta raíz, 
// lo cual es menos fluido para un NAS.
*/

/**
 * --- GUÍA PARA ANDROID STUDIO (CAPACITOR) ---
 * 
 * 1. Requisitos:
 *    - Android Studio instalado.
 *    - Node.js y npm.
 * 
 * 2. Pasos para preparar el proyecto:
 *    - Ejecuta `npm run build` para generar la carpeta 'dist'.
 *    - Ejecuta `npm run cap:add` para crear el proyecto de Android.
 *    - Ejecuta `npm run cap:sync` para sincronizar los archivos web con Android.
 * 
 * 3. Abrir en Android Studio:
 *    - Ejecuta `npm run cap:open`.
 * 
 * 4. Configuración del Servidor Nativo:
 *    - Si implementas el servidor en Kotlin (Ktor), asegúrate de que escuche en el puerto 8080.
 *    - La app de React está configurada para apuntar a 'http://localhost:8080' cuando detecta que no está en un entorno web estándar.
 */
