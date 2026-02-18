"""
Script de prueba del Sistema de Suscripciones
Demuestra cómo usar todos los módulos de suscripciones
"""

from subscriptions_manager import (
    SubscriptionManager,
    PlanType,
    BillingMode,
    PaymentProcessor,
    PricingModel
)
from datetime import datetime
import json


def separator(title):
    """Imprimir separador formateado"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def main():
    print("\n🎮 PRUEBAS DEL SISTEMA DE SUSCRIPCIONES - GitGame Store\n")

    # ==================== 1. CREAR GESTOR ====================
    separator("1️⃣ INICIALIZANDO GESTOR DE SUSCRIPCIONES")
    
    manager = SubscriptionManager()
    print("✅ Gestor inicializado correctamente")

    # ==================== 2. INFORMACIÓN DE PRECIOS ====================
    separator("2️⃣ INFORMACIÓN DE PRECIOS")
    
    print("\n📊 Precios Mensuales vs Anuales:\n")
    for plan in [PlanType.PRO, PlanType.PREMIUM, PlanType.VIP]:
        monthly = PricingModel.get_price(plan, BillingMode.MONTHLY)
        annual = PricingModel.get_price(plan, BillingMode.ANNUAL)
        savings = PricingModel.get_annual_savings(plan)
        percent = PricingModel.get_savings_percentage(plan)
        
        print(f"{plan.value.upper()}:")
        print(f"  💵 Mensual: ${monthly}")
        print(f"  💰 Anual:   ${annual}")
        print(f"  🎁 Ahorro:  ${savings} ({percent}%)")
        print()

    # ==================== 3. CREAR SUSCRIPCIONES ====================
    separator("3️⃣ CREANDO SUSCRIPCIONES DE EJEMPLO")
    
    usuarios = [
        ("user001", PlanType.PRO, BillingMode.MONTHLY, "Juan García"),
        ("user002", PlanType.PREMIUM, BillingMode.ANNUAL, "María López"),
        ("user003", PlanType.VIP, BillingMode.MONTHLY, "Carlos Martínez"),
        ("user004", PlanType.FREE, BillingMode.MONTHLY, "Ana Rodríguez"),
    ]
    
    for user_id, plan, billing, name in usuarios:
        sub = manager.create_subscription(user_id, plan, billing)
        mode_es = "mensual" if billing == BillingMode.MONTHLY else "anual"
        print(f"✅ {name} ({user_id}): {plan.value.upper()} - ${PricingModel.get_price(plan, billing)} {mode_es}")

    # ==================== 4. PROCESAR PAGOS ====================
    separator("4️⃣ PROCESANDO PAGOS")
    
    usuarios_pago = [
        ("user001", "Juan García"),
        ("user002", "María López"),
    ]
    
    for user_id, name in usuarios_pago:
        sub = manager.get_subscription(user_id)
        payment = PaymentProcessor.process_payment(
            user_id=user_id,
            plan=sub.plan,
            billing_mode=sub.billing_mode,
            card_last_four="4242"
        )
        print(f"\n💳 {name}:")
        print(f"   ID Transacción: {payment['transaction_id']}")
        print(f"   Monto: ${payment['amount']}")
        print(f"   Estado: {payment['status']}")
        print(f"   Tarjeta: ****{payment['card_last_four']}")

    # ==================== 5. ACTUALIZAR PLANES ====================
    separator("5️⃣ ACTUALIZANDO PLANES DE USUARIOS")
    
    print("\nActualizando user001 de Pro a Premium...")
    result = manager.upgrade_plan("user001", PlanType.PREMIUM)
    print(f"✅ {result}")
    
    print("\nActualizando user003 de VIP a Pro...")
    result = manager.upgrade_plan("user003", PlanType.PRO)
    print(f"✅ {result}")

    # ==================== 6. CANCELAR SUSCRIPCIONES ====================
    separator("6️⃣ CANCELANDO SUSCRIPCIONES")
    
    print("\nCancelando suscripción de user004...")
    result = manager.cancel_subscription("user004")
    print(f"✅ {result}")

    # ==================== 7. MOSTRAR ESTADÍSTICAS ====================
    separator("7️⃣ ESTADÍSTICAS DEL SISTEMA")
    
    stats = manager.get_stats()
    
    print(f"\n📈 Usuarios:")
    print(f"   Total: {stats['total_users']}")
    print(f"   Activos: {stats['active_users']}")
    print(f"   Inactivos: {stats['inactive_users']}")
    
    print(f"\n📊 Distribución de Planes:")
    for plan, count in stats['plan_distribution'].items():
        print(f"   {plan.upper()}: {count} usuario(s)")
    
    print(f"\n💰 Ingresos:")
    print(f"   MRR (Ingresos Recurrentes Mensuales): ${stats['monthly_recurring_revenue']}")

    # ==================== 8. DETALLES DE USUARIOS ====================
    separator("8️⃣ DETALLES DE USUARIOS ACTIVOS")
    
    active_subs = manager.get_active_subscriptions()
    
    for sub in active_subs:
        user_id = sub.user_id
        print(f"\n👤 {user_id}:")
        print(f"   Plan: {sub.plan.value.upper()}")
        print(f"   Facturación: {'Mensual' if sub.billing_mode == BillingMode.MONTHLY else 'Anual'}")
        print(f"   Inicio: {sub.start_date.strftime('%d/%m/%Y')}")
        print(f"   Próxima renovación: {sub.next_billing_date.strftime('%d/%m/%Y')}")
        print(f"   Estado: {'✅ Activo' if sub.is_active else '❌ Cancelado'}")

    # ==================== 9. GUARDAR EN JSON ====================
    separator("9️⃣ GUARDANDO DATOS EN JSON")
    
    filepath = "suscripciones_test.json"
    manager.to_json(filepath)
    print(f"✅ Datos guardados en '{filepath}'")
    
    # Mostrar preview
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        print(f"   Total de registros: {len(data['subscriptions'])}")
        print(f"   Fecha de exportación: {data['timestamp']}")

    # ==================== 10. RESUMEN FINAL ====================
    separator("1️⃣0️⃣ RESUMEN FINAL")
    
    final_stats = manager.get_stats()
    
    print(f"""
╔════════════════════════════════════════╗
║     RESUMEN DE SUSCRIPCIONES           ║
╠════════════════════════════════════════╣
║ Usuarios Totales:       {final_stats['total_users']:>15}  ║
║ Usuarios Activos:       {final_stats['active_users']:>15}  ║
║ Usuarios Inactivos:     {final_stats['inactive_users']:>15}  ║
║                                        ║
║ MRR (Ingresos Recurrentes):            ║
║   ${final_stats['monthly_recurring_revenue']:>33.2f}  ║
║                                        ║
║ Distribución de Planes:                ║
║   Free:  {final_stats['plan_distribution']['free']:>27} ║
║   Pro:   {final_stats['plan_distribution']['pro']:>27} ║
║   Premium: {final_stats['plan_distribution']['premium']:>23} ║
║   VIP:   {final_stats['plan_distribution']['vip']:>27} ║
╚════════════════════════════════════════╝
    """)

    print("✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE\n")


if __name__ == "__main__":
    main()
