// 1. Obtener los datos del Trato ORIGINAL que se acaba de ganar
trato_original = zoho.crm.getRecordById("Deals", id_trato);

// 2. Validaciones de seguridad
if(trato_original.get("id") != null)
{
	// 3. Calcular la nueva Fecha de Cierre (+365 días)
	fecha_cierre_original = ifnull(trato_original.get("Closing_Date"), zoho.currentdate);
	// Sumamos 1 año a la fecha original
	nueva_fecha_cierre = fecha_cierre_original.addYear(1);
	
	// 4. Construir el mapa del NUEVO Trato
	mapa_nuevo_trato = Map();
	
	// A. Nombre: Añadimos "Renovación 202X" para identificarlo fácil
	nombre_original = ifnull(trato_original.get("Deal_Name"), "");
	mapa_nuevo_trato.put("Deal_Name", "Renovación: " + nombre_original);
	
	// B. Fechas y Fase
	mapa_nuevo_trato.put("Closing_Date", nueva_fecha_cierre);
	mapa_nuevo_trato.put("Stage", "Renovación Pendiente"); // O pon tu fase inicial, ej: "Nuevo"
	
	// C. Datos Económicos (Heredamos el importe)
	mapa_nuevo_trato.put("Amount", trato_original.get("Amount"));
	
	// D. Asociaciones (Vital: Ligar a la misma Cuenta y Contacto)
	// Nota: Account_Name devuelve un objeto JSON, necesitamos solo el ID
	cuenta_info = trato_original.get("Account_Name");
	if(cuenta_info != null)
	{
		mapa_nuevo_trato.put("Account_Name", cuenta_info.get("id"));
	}
	
	contacto_info = trato_original.get("Contact_Name");
	if(contacto_info != null)
	{
		mapa_nuevo_trato.put("Contact_Name", contacto_info.get("id"));
	}
	
	// E. Asignación (¿Quién se encarga?)
	// Asignamos al mismo propietario del trato original
	propietario = trato_original.get("Owner");
	if(propietario != null)
	{
		mapa_nuevo_trato.put("Owner", propietario.get("id"));
	}
	
	// F. Limpieza: Desmarcar el check de renovación en la COPIA para evitar bucles infinitos futuros
	// (o déjalo marcado si es una suscripción perpetua)
	mapa_nuevo_trato.put("Requiere_Renovaci_n", true); 
	
	// 5. Crear el registro en Zoho CRM
	respuesta_creacion = zoho.crm.createRecord("Deals", mapa_nuevo_trato);
	
	info "Trato de renovación creado. ID: " + respuesta_creacion.get("id");
}
else
{
	info "Error al obtener el trato original.";
}