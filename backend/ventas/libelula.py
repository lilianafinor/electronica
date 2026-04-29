import requests
from decimal import Decimal

# ── Configuración ─────────────────────────────────────────────────────────────
LIBELULA_APPKEY   = '11bb10ce-68ba-4af1-8eb7-4e6624fed729'  # Reemplazar con appkey real
LIBELULA_BASE_URL = 'https://api.libelula.bo/rest'
CALLBACK_URL      = 'https://tudominio.com/pago/callback/'   # Reemplazar con URL real o ngrok


# ── Registrar deuda ───────────────────────────────────────────────────────────
def registrar_deuda_venta(venta):
    """
    Registra una deuda en Libélula para una NotaVenta.
    Retorna dict con: ok, id_transaccion, url_pasarela, qr_url, mensaje
    """
    cliente = venta.id_cliente

    # Construir líneas de detalle desde los detalles de la venta
    lineas = []
    for detalle in venta.detalles.select_related('id_producto').all():
        lineas.append({
            "concepto":           detalle.id_producto.nombre if detalle.id_producto else "Producto",
            "cantidad":           float(detalle.cantidad),
            "costo_unitario":     float(detalle.precio_uni),
            "descuento_unitario": 0
        })

    # Si no hay detalles usar el monto total como línea única
    if not lineas:
        lineas = [{
            "concepto":           f"Venta #{venta.id_venta}",
            "cantidad":           1,
            "costo_unitario":     float(venta.monto_total),
            "descuento_unitario": 0
        }]

    descripcion = f"Venta #{venta.id_venta} - Electrónica PNP"

    payload = {
        "appkey":        LIBELULA_APPKEY,
        "descripcion":   descripcion,
        "email_cliente": cliente.correo if cliente and cliente.correo else "sin-correo@electronica.bo",
        "identificador": f"VENTA-{venta.id_venta}",
        "callback_url":  CALLBACK_URL,
        "url_retorno":   CALLBACK_URL,
        "lineas_detalle_deuda": lineas
    }

    try:
        resp = requests.post(
            f"{LIBELULA_BASE_URL}/deuda/registrar",
            json=payload,
            timeout=10
        )
        data = resp.json()

        if data.get('error') == 0:
            return {
                'ok':             True,
                'id_transaccion': data.get('id_transaccion'),
                'url_pasarela':   data.get('url_pasarela_pagos'),
                'qr_url':         data.get('qr_simple_url'),
                'mensaje':        'QR generado correctamente',
            }
        else:
            return {
                'ok':      False,
                'mensaje': f"Error Libélula: {data.get('mensaje', 'Error desconocido')}",
            }

    except requests.exceptions.RequestException as e:
        # Modo simulado para pruebas sin conexión
        return {
            'ok':             True,
            'id_transaccion': f"SIM-VENTA-{venta.id_venta}",
            'url_pasarela':   f"https://api.libelula.bo/pago-simulado/VENTA-{venta.id_venta}",
            'qr_url':         None,
            'mensaje':        f"QR simulado (Libélula no disponible: {str(e)})",
        }


# ── Consultar pago ────────────────────────────────────────────────────────────
def consultar_pago(id_transaccion):
    """
    Consulta el estado de un pago en Libélula.
    Retorna dict con: ok, pagado, mensaje, datos
    """
    payload = {
        "appkey":         LIBELULA_APPKEY,
        "id_transaccion": id_transaccion,
    }

    try:
        resp = requests.post(
            f"{LIBELULA_BASE_URL}/deuda/consultar_deudas/por_identificador",
            json=payload,
            timeout=10
        )
        data = resp.json()

        if data.get('error') == 0:
            datos  = data.get('datos', {})
            pagado = datos.get('estado_transaccion') in ['PAGADO', 'COMPLETADO', 2, '2']
            return {
                'ok':      True,
                'pagado':  pagado,
                'datos':   datos,
                'mensaje': data.get('mensaje', ''),
            }
        else:
            return {
                'ok':      False,
                'pagado':  False,
                'mensaje': f"Error al consultar: {data.get('mensaje', 'Error desconocido')}",
            }

    except requests.exceptions.RequestException as e:
        return {
            'ok':      False,
            'pagado':  False,
            'mensaje': f"No se pudo conectar con Libélula: {str(e)}",
        }