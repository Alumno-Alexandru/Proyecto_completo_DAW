"""
API REST de Suscripciones - GitGame Store
Ejemplo de integración con Flask (requiere: pip install flask)

Para ejecutar:
    python api_subscriptions.py

El servidor estará en: http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from subscriptions_manager import (
    SubscriptionManager, PlanType, BillingMode, PaymentProcessor
)
import json

# Inicializar Flask
app = Flask(__name__)
CORS(app)  # Habilitar CORS para requests desde frontend

# Inicializar gestor
manager = SubscriptionManager()

# ==================== RUTAS DE SUSCRIPCIONES ====================

@app.route('/api/plans', methods=['GET'])
def get_plans():
    """Obtener todos los planes disponibles"""
    plans = {
        "free": {
            "id": "free",
            "name": "Free",
            "price_monthly": 0,
            "price_annual": 0,
            "features": ["Juegos gratis", "Lista de favoritos"]
        },
        "pro": {
            "id": "pro",
            "name": "Pro",
            "price_monthly": 9.99,
            "price_annual": 79.92,
            "features": ["500+ juegos", "20% descuento"]
        },
        "premium": {
            "id": "premium",
            "name": "Premium",
            "price_monthly": 14.99,
            "price_annual": 119.92,
            "features": ["1000+ juegos", "35% descuento", "Juegos de día 1"]
        },
        "vip": {
            "id": "vip",
            "name": "VIP",
            "price_monthly": 19.99,
            "price_annual": 159.92,
            "features": ["Catálogo completo", "50% descuento", "Beta testing"]
        }
    }
    return jsonify(plans), 200


@app.route('/api/subscription/<user_id>', methods=['GET'])
def get_subscription(user_id):
    """Obtener suscripción de un usuario"""
    sub = manager.get_subscription(user_id)
    
    if not sub:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    return jsonify(sub.to_dict()), 200


@app.route('/api/subscription/create', methods=['POST'])
def create_subscription():
    """Crear una nueva suscripción"""
    data = request.json
    
    try:
        user_id = data.get('user_id')
        plan = PlanType(data.get('plan', 'free'))
        billing_mode = BillingMode(data.get('billing_mode', 'monthly'))
        
        sub = manager.create_subscription(user_id, plan, billing_mode)
        
        return jsonify({
            "message": "Suscripción creada exitosamente",
            "subscription": sub.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({"error": f"Plan o modo de facturación inválido: {str(e)}"}), 400


@app.route('/api/subscription/<user_id>/upgrade', methods=['POST'])
def upgrade_subscription(user_id):
    """Actualizar plan de un usuario"""
    data = request.json
    
    try:
        new_plan = PlanType(data.get('plan'))
        result = manager.upgrade_plan(user_id, new_plan)
        
        sub = manager.get_subscription(user_id)
        return jsonify({
            "message": f"Plan actualizado a {new_plan.value}",
            "subscription": sub.to_dict()
        }), 200
        
    except ValueError:
        return jsonify({"error": "Plan inválido"}), 400


@app.route('/api/subscription/<user_id>/cancel', methods=['POST'])
def cancel_subscription(user_id):
    """Cancelar suscripción de un usuario"""
    result = manager.cancel_subscription(user_id)
    
    sub = manager.get_subscription(user_id)
    
    if sub is None:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    return jsonify({
        "message": result,
        "subscription": sub.to_dict()
    }), 200


# ==================== RUTAS DE PAGOS ====================

@app.route('/api/payment/process', methods=['POST'])
def process_payment():
    """Procesar un pago de suscripción"""
    data = request.json
    
    try:
        user_id = data.get('user_id')
        plan = PlanType(data.get('plan'))
        billing_mode = BillingMode(data.get('billing_mode', 'monthly'))
        card_last_four = data.get('card_last_four', '****')
        
        # Validar tarjeta
        card_number = data.get('card_number', '')
        if not PaymentProcessor.validate_card(card_number):
            return jsonify({"error": "Tarjeta inválida"}), 400
        
        # Procesar pago
        payment = PaymentProcessor.process_payment(
            user_id, plan, billing_mode, card_last_four
        )
        
        # Crear o actualizar suscripción
        if manager.get_subscription(user_id):
            manager.upgrade_plan(user_id, plan)
        else:
            manager.create_subscription(user_id, plan, billing_mode)
        
        return jsonify(payment), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/payment/validate-card', methods=['POST'])
def validate_card():
    """Validar número de tarjeta"""
    data = request.json
    card_number = data.get('card_number', '')
    
    is_valid = PaymentProcessor.validate_card(card_number)
    
    return jsonify({
        "valid": is_valid,
        "card_type": get_card_type(card_number) if is_valid else None
    }), 200


# ==================== RUTAS DE ESTADÍSTICAS ====================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Obtener estadísticas de suscripciones"""
    stats = manager.get_stats()
    return jsonify(stats), 200


@app.route('/api/stats/revenue', methods=['GET'])
def get_revenue_stats():
    """Obtener estadísticas de ingresos"""
    active_subs = manager.get_active_subscriptions()
    
    monthly_revenue = sum(
        9.99 if sub.plan == PlanType.PRO else
        14.99 if sub.plan == PlanType.PREMIUM else
        19.99 if sub.plan == PlanType.VIP else 0
        for sub in active_subs if sub.billing_mode == BillingMode.MONTHLY
    )
    
    annual_revenue = sum(
        79.92 if sub.plan == PlanType.PRO else
        119.92 if sub.plan == PlanType.PREMIUM else
        159.92 if sub.plan == PlanType.VIP else 0
        for sub in active_subs if sub.billing_mode == BillingMode.ANNUAL
    )
    
    total_mrr = monthly_revenue + (annual_revenue / 12)
    total_arr = monthly_revenue * 12 + annual_revenue
    
    return jsonify({
        "monthly_recurring_revenue": round(monthly_revenue, 2),
        "annual_recurring_revenue": round(annual_revenue, 2),
        "estimated_mrr": round(total_mrr, 2),
        "estimated_arr": round(total_arr, 2)
    }), 200


# ==================== RUTAS DE DATOS ====================

@app.route('/api/data/export', methods=['GET'])
def export_data():
    """Exportar datos de suscripciones"""
    data = {
        "subscriptions": [sub.to_dict() for sub in manager.subscriptions.values()],
        "stats": manager.get_stats(),
        "export_date": datetime.now().isoformat()
    }
    return jsonify(data), 200


@app.route('/api/data/import', methods=['POST'])
def import_data():
    """Importar datos de suscripciones"""
    data = request.json
    
    try:
        for sub_data in data.get('subscriptions', []):
            plan = PlanType(sub_data['plan'])
            billing = BillingMode(sub_data['billing_mode'])
            manager.create_subscription(
                sub_data['user_id'], plan, billing
            )
        
        return jsonify({
            "message": "Datos importados exitosamente",
            "imported_count": len(data.get('subscriptions', []))
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ==================== RUTAS DE ADMINISTRACIÓN ====================

@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    """Obtener lista de todos los usuarios (admin)"""
    users = [
        {
            "user_id": user_id,
            "plan": sub.plan.value,
            "billing_mode": sub.billing_mode.value,
            "is_active": sub.is_active,
            "start_date": sub.start_date.isoformat()
        }
        for user_id, sub in manager.subscriptions.items()
    ]
    
    return jsonify({
        "total_users": len(users),
        "users": users
    }), 200


@app.route('/api/admin/user/<user_id>/details', methods=['GET'])
def get_user_details(user_id):
    """Obtener detalles completos de un usuario (admin)"""
    sub = manager.get_subscription(user_id)
    
    if not sub:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    return jsonify({
        "user_id": user_id,
        "subscription": sub.to_dict(),
        "days_until_renewal": (
            sub.next_billing_date - datetime.now()
        ).days if sub.is_active else None
    }), 200


# ==================== FUNCIONES AUXILIARES ====================

def get_card_type(card_number):
    """Detectar tipo de tarjeta por número"""
    card_number = card_number.replace(" ", "")
    
    if card_number.startswith('4'):
        return 'Visa'
    elif card_number.startswith('5'):
        return 'Mastercard'
    elif card_number.startswith('3'):
        return 'American Express'
    else:
        return 'Unknown'


# ==================== MANEJADOR DE ERRORES ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Ruta no encontrada"}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Error interno del servidor"}), 500


# ==================== INICIAR SERVIDOR ====================

if __name__ == '__main__':
    print("=" * 50)
    print("🎮 API de Suscripciones - GitGame Store")
    print("=" * 50)
    print("\nEndpoints disponibles:")
    print("  GET  /api/plans")
    print("  GET  /api/subscription/<user_id>")
    print("  POST /api/subscription/create")
    print("  POST /api/subscription/<user_id>/upgrade")
    print("  POST /api/subscription/<user_id>/cancel")
    print("  POST /api/payment/process")
    print("  POST /api/payment/validate-card")
    print("  GET  /api/stats")
    print("  GET  /api/stats/revenue")
    print("\nServidor iniciando en: http://localhost:5000")
    print("=" * 50 + "\n")
    
    app.run(debug=True, port=5000)
