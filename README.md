#  Renovación Automática

Este documento detalla el funcionamiento del script `renovacionAutomatica`, diseñado para automatizar la creación de oportunidades de renovación en Zoho CRM.

## Funcionamiento Paso a Paso

El script ejecuta la siguiente lógica secuencial para duplicar un trato existente y configurarlo como una renovación:

1.  **Obtención del Trato Original**
    *   El script comienza recuperando la información completa del trato (Deal) original utilizando su identificador único (`id_trato`).
    *   Función: `zoho.crm.getRecordById("Deals", id_trato)`.

2.  **Validación de Seguridad**
    *   Se verifica que el registro recuperado sea válido (que tenga un ID) antes de intentar procesarlo. Esto evita errores si el ID proporcionado no existe.

3.  **Cálculo de la Nueva Fecha de Cierre**
    *   Se lee la fecha de cierre (`Closing_Date`) del trato original. Si está vacía, se asume la fecha actual.
    *   Se calcula la fecha para la renovación sumando exactamente **1 año** a la fecha original.
    *   Lógica: `nueva_fecha_cierre = fecha_cierre_original.addYear(1)`.

4.  **Construcción del Nuevo Trato (Mapeo)**
    Se crea un mapa de datos (`mapa_nuevo_trato`) con las siguientes propiedades:

    *   **Nombre del Trato**: Se toma el nombre original y se le añade el prefijo "Renovación: ".
        *   *Ejemplo*: "Venta Licencia" → "Renovación: Venta Licencia".
    *   **Fase (Stage)**: Se establece explícitamente en **"Renovación Pendiente"**.
    *   **Fecha de Cierre**: Se asigna la fecha calculada en el paso 3.
    *   **Importe (Amount)**: Se copia exactamente el mismo monto del trato original.

5.  **Preservación de Relaciones**
    Es crítico para el negocio mantener las asociaciones del cliente:
    *   **Cuenta (Account_Name)**: Se obtiene el ID de la cuenta del trato original y se asigna al nuevo.
    *   **Contacto (Contact_Name)**: Se obtiene el ID del contacto asociado y se asigna al nuevo.
    *   **Propietario (Owner)**: El nuevo trato se asigna al mismo usuario que era dueño del trato original.

6.  **Configuración de Flags**
    *   **Requiere Renovación**: Se marca el campo `Requiere_Renovaci_n` como `true`. Esto puede servir para disparar futuros flujos o simplemente para control interno.

7.  **Creación del Registro en CRM**
    *   Finalmente, se ejecuta el comando para crear el registro en el módulo de "Deals" (Tratos).
    *   Función: `zoho.crm.createRecord("Deals", mapa_nuevo_trato)`.
    *   **Salida**: El script imprime en el log el ID del nuevo trato creado para confirmación.

## Manejo de Errores
*   Si el paso 2 falla (el trato original no se encuentra), el script escribe en el log: *"Error al obtener el trato original."* y detiene la ejecución.
