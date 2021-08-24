### **Descripción:**

Esto es un proyecto para gestionar un negocio pequeño de ventas.

El que interactúa con la página es el usuario, o sea el que trabaja en el local.

Se puede registrar productos, categorías, clientes, y por su puesto registrar ventas.

En la página de inicio están los gráficos con las estadísticas de ventas por año y por mes.

### **Implementación:**

Está hecha en Django, ahora usa sqlite, pero se puede cambiar para postgres o mySQL. En el frontend uso AdminLte3 para
maquetar y dar estilos, uso jQuery para controlar eventos y hacer otras funcionalidades, prácticamente todo el frontend
está hecho con jQuery y JavaScript puro, a excepción de Django Templates como lenguaje de plantillas que lo uso para
hacer mis templates bases, heredar de ellas, pedirle formularios y otros datos al servidor.

Uso también muchos plugins como datatable, datepicker, jqueryUI, select2, etc.

Uso vista basada en clases TemplateView y mediante pedidos con ajax en el frontend, gestiono los CRUD y hago todas las
operaciones en la misma página sin actualizarla.

Quedaría faltando la parte de los usuarios, el login y el envío de correos, también otras funcionalidades como imprimir pdf.