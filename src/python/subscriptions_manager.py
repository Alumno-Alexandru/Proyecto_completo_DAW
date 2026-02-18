"""
Sistema de Gestión de Suscripciones - GitGame Store
Módulo para manejar planes, usuarios y procesamiento de pagos
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
from enum import Enum
import json


class PlanType(Enum):
    """Tipos de planes disponibles"""
    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"
    VIP = "vip"


class BillingMode(Enum):
    """Modo de facturación"""
    MONTHLY = "monthly"
    ANNUAL = "annual"


class Subscription:
    """Clase para representar una suscripción de usuario"""

    def __init__(self, user_id: str, plan: PlanType, billing_mode: BillingMode):
        self.user_id = user_id
        self.plan = plan
        self.billing_mode = billing_mode
        self.start_date = datetime.now()
        self.next_billing_date = self._calculate_next_billing()
        self.is_active = True
        self.payment_method = None

    def _calculate_next_billing(self) -> datetime:
        """Calcular la próxima fecha de facturación"""
        if self.billing_mode == BillingMode.MONTHLY:
            return self.start_date + timedelta(days=30)
        else:  # ANNUAL
            return self.start_date + timedelta(days=365)

    def upgrade(self, new_plan: PlanType):
        """Actualizar el plan de suscripción"""
        self.plan = new_plan
        return f"Plan actualizado a {new_plan.value}"

    def cancel(self):
        """Cancelar la suscripción"""
        self.is_active = False
        return f"Suscripción cancelada el {datetime.now().strftime('%d/%m/%Y')}"

    def renew(self):
        """Renovar la suscripción"""
        self.next_billing_date = self._calculate_next_billing()
        return f"Suscripción renovada hasta {self.next_billing_date.strftime('%d/%m/%Y')}"

    def to_dict(self) -> Dict:
        """Convertir a diccionario"""
        return {
            "user_id": self.user_id,
            "plan": self.plan.value,
            "billing_mode": self.billing_mode.value,
            "start_date": self.start_date.isoformat(),
            "next_billing_date": self.next_billing_date.isoformat(),
            "is_active": self.is_active,
            "payment_method": self.payment_method
        }


class PricingModel:
    """Modelo de precios para cada plan"""

    PRICES = {
        PlanType.FREE: {"monthly": 0.00, "annual": 0.00},
        PlanType.PRO: {"monthly": 9.99, "annual": 79.92},  # 20% descuento anual
        PlanType.PREMIUM: {"monthly": 14.99, "annual": 119.92},  # 20% descuento anual
        PlanType.VIP: {"monthly": 19.99, "annual": 159.92}  # 20% descuento anual
    }

    @classmethod
    def get_price(cls, plan: PlanType, billing_mode: BillingMode) -> float:
        """Obtener el precio de un plan"""
        mode = "annual" if billing_mode == BillingMode.ANNUAL else "monthly"
        return cls.PRICES[plan].get(mode, 0.0)

    @classmethod
    def get_annual_savings(cls, plan: PlanType) -> float:
        """Calcular el ahorro anual comparado con pagos mensuales"""
        monthly_price = cls.PRICES[plan]["monthly"]
        annual_price = cls.PRICES[plan]["annual"]
        savings = (monthly_price * 12) - annual_price
        return round(savings, 2)

    @classmethod
    def get_savings_percentage(cls, plan: PlanType) -> float:
        """Obtener el porcentaje de ahorro anual"""
        if cls.PRICES[plan]["monthly"] == 0:
            return 0.0
        monthly_price = cls.PRICES[plan]["monthly"]
        annual_price = cls.PRICES[plan]["annual"]
        savings_pct = ((monthly_price * 12) - annual_price) / (monthly_price * 12) * 100
        return round(savings_pct, 1)


class SubscriptionManager:
    """Gestor central de suscripciones"""

    def __init__(self):
        self.subscriptions: Dict[str, Subscription] = {}
        self.users_data = {}

    def create_subscription(self, user_id: str, plan: PlanType,
                          billing_mode: BillingMode) -> Subscription:
        """Crear una nueva suscripción"""
        subscription = Subscription(user_id, plan, billing_mode)
        self.subscriptions[user_id] = subscription
        return subscription

    def get_subscription(self, user_id: str) -> Optional[Subscription]:
        """Obtener la suscripción de un usuario"""
        return self.subscriptions.get(user_id)

    def upgrade_plan(self, user_id: str, new_plan: PlanType) -> str:
        """Actualizar el plan de un usuario"""
        subscription = self.get_subscription(user_id)
        if subscription:
            return subscription.upgrade(new_plan)
        return "Usuario no encontrado"

    def cancel_subscription(self, user_id: str) -> str:
        """Cancelar suscripción de un usuario"""
        subscription = self.get_subscription(user_id)
        if subscription:
            return subscription.cancel()
        return "Usuario no encontrado"

    def get_active_subscriptions(self) -> List[Subscription]:
        """Obtener todas las suscripciones activas"""
        return [sub for sub in self.subscriptions.values() if sub.is_active]

    def get_stats(self) -> Dict:
        """Obtener estadísticas de suscripciones"""
        total_users = len(self.subscriptions)
        active_users = len(self.get_active_subscriptions())

        plan_distribution = {}
        for plan in PlanType:
            count = sum(1 for sub in self.subscriptions.values()
                       if sub.plan == plan and sub.is_active)
            plan_distribution[plan.value] = count

        total_mrr = sum(
            PricingModel.get_price(sub.plan, sub.billing_mode)
            for sub in self.get_active_subscriptions()
            if sub.billing_mode == BillingMode.MONTHLY
        )

        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "plan_distribution": plan_distribution,
            "monthly_recurring_revenue": round(total_mrr, 2),
            "timestamp": datetime.now().isoformat()
        }

    def to_json(self, filepath: str):
        """Guardar suscripciones en JSON"""
        data = {
            "subscriptions": [sub.to_dict() for sub in self.subscriptions.values()],
            "timestamp": datetime.now().isoformat()
        }
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def load_from_json(self, filepath: str):
        """Cargar suscripciones desde JSON"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for sub_data in data.get('subscriptions', []):
                    plan = PlanType(sub_data['plan'])
                    billing = BillingMode(sub_data['billing_mode'])
                    sub = Subscription(sub_data['user_id'], plan, billing)
                    self.subscriptions[sub_data['user_id']] = sub
        except FileNotFoundError:
            print(f"Archivo {filepath} no encontrado")


class PaymentProcessor:
    """Procesador de pagos (simulado)"""

    @staticmethod
    def process_payment(user_id: str, plan: PlanType, billing_mode: BillingMode,
                       card_last_four: str) -> Dict:
        """Procesar un pago de suscripción"""
        price = PricingModel.get_price(plan, billing_mode)

        return {
            "transaction_id": f"TXN_{user_id}_{datetime.now().timestamp()}",
            "user_id": user_id,
            "plan": plan.value,
            "amount": price,
            "currency": "USD",
            "status": "completed",
            "card_last_four": card_last_four,
            "timestamp": datetime.now().isoformat(),
            "message": f"Pago de ${price} procesado exitosamente para plan {plan.value}"
        }

    @staticmethod
    def validate_card(card_number: str) -> bool:
        """Validar número de tarjeta (Algoritmo Luhn simplificado)"""
        if not card_number.replace(" ", "").isdigit() or len(card_number) < 13:
            return False
        return True

    @staticmethod
    def process_refund(transaction_id: str) -> Dict:
        """Procesar un reembolso"""
        return {
            "refund_id": f"RFD_{transaction_id}",
            "original_transaction": transaction_id,
            "status": "completed",
            "timestamp": datetime.now().isoformat()
        }


# Ejemplo de uso
if __name__ == "__main__":
    # Crear gestor de suscripciones
    manager = SubscriptionManager()

    # Crear algunas suscripciones de ejemplo
    sub1 = manager.create_subscription("user001", PlanType.PRO, BillingMode.MONTHLY)
    sub2 = manager.create_subscription("user002", PlanType.VIP, BillingMode.ANNUAL)
    sub3 = manager.create_subscription("user003", PlanType.PREMIUM, BillingMode.MONTHLY)

    print("=== GESTIÓN DE SUSCRIPCIONES ===\n")

    # Mostrar información de precios
    print("📊 PRECIOS Y AHORROS:")
    for plan in PlanType:
        if plan != PlanType.FREE:
            monthly = PricingModel.get_price(plan, BillingMode.MONTHLY)
            annual = PricingModel.get_price(plan, BillingMode.ANNUAL)
            savings = PricingModel.get_annual_savings(plan)
            pct = PricingModel.get_savings_percentage(plan)
            print(f"\n{plan.value.upper()}:")
            print(f"  Mensual: ${monthly}")
            print(f"  Anual: ${annual} (Ahorro: ${savings} - {pct}%)")

    # Procesar pago
    print("\n\n💳 PROCESANDO PAGO:")
    payment = PaymentProcessor.process_payment(
        "user001",
        PlanType.PRO,
        BillingMode.MONTHLY,
        "4242"
    )
    print(f"  {payment['message']}")
    print(f"  ID Transacción: {payment['transaction_id']}")

    # Estadísticas
    print("\n\n📈 ESTADÍSTICAS:")
    stats = manager.get_stats()
    print(f"  Total usuarios: {stats['total_users']}")
    print(f"  Usuarios activos: {stats['active_users']}")
    print(f"  Ingresos recurrentes mensuales: ${stats['monthly_recurring_revenue']}")
    print(f"  Distribución de planes: {stats['plan_distribution']}")

    # Guardar en JSON
    manager.to_json("suscripciones.json")
    print("\n✅ Datos guardados en suscripciones.json")
