#!/usr/bin/env python3
"""
QUICK START - Sistema de Suscripciones GitGame Store
Ejecuta este script para una demostración rápida
"""

import os
import sys
from pathlib import Path

# Agregar ruta del proyecto
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root / "src" / "python"))

from subscriptions_manager import (
    SubscriptionManager,
    PlanType,
    BillingMode,
    PaymentProcessor,
    PricingModel
)


def print_header(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def main():
    print_header("🎮 DEMO RÁPIDA - SISTEMA DE SUSCRIPCIONES")

    # Crear gestor
    manager = SubscriptionManager()

    # Crear usuarios de ejemplo
    print("📝 Creando usuarios de ejemplo...\n")
    
    users = [
        ("user_juan", PlanType.PRO, BillingMode.MONTHLY),
        ("user_maria", PlanType.PREMIUM, BillingMode.ANNUAL),
        ("user_carlos", PlanType.VIP, BillingMode.MONTHLY),
    ]

    for user_id, plan, billing in users:
        manager.create_subscription(user_id, plan, billing)
        price = PricingModel.get_price(plan, billing)
        period = "mes" if billing == BillingMode.MONTHLY else "año"
        print(f"✅ {user_id}: {plan.value.upper()} (${price}/{period})")

    # Procesar pagos
    print_header("💳 PROCESANDO PAGOS")

    for user_id, plan, billing in users[:2]:
        payment = PaymentProcessor.process_payment(
            user_id, plan, billing, "4242"
        )
        print(f"✅ Pago procesado para {user_id}")
        print(f"   Transacción: {payment['transaction_id']}")
        print(f"   Monto: ${payment['amount']}\n")

    # Estadísticas
    stats = manager.get_stats()

    print_header("📊 ESTADÍSTICAS")

    print(f"""
╔════════════════════════════════════════╗
║        RESUMEN DEL SISTEMA             ║
╠════════════════════════════════════════╣
║ Usuarios Total:              {stats['total_users']:>15} ║
║ Usuarios Activos:            {stats['active_users']:>15} ║
║                                        ║
║ MRR (Ingresos Mensuales):              ║
║   ${stats['monthly_recurring_revenue']:>33.2f}  ║
║                                        ║
║ Distribución de Planes:                ║
║   Free:    {stats['plan_distribution']['free']:>27} ║
║   Pro:     {stats['plan_distribution']['pro']:>27} ║
║   Premium: {stats['plan_distribution']['premium']:>23} ║
║   VIP:     {stats['plan_distribution']['vip']:>27} ║
╚════════════════════════════════════════╝
    """)

    # Mostrar planes disponibles
    print_header("💰 INFORMACIÓN DE PRECIOS")

    for plan in PlanType:
        monthly = PricingModel.get_price(plan, BillingMode.MONTHLY)
        annual = PricingModel.get_price(plan, BillingMode.ANNUAL)
        
        if plan != PlanType.FREE:
            savings = PricingModel.get_annual_savings(plan)
            savings_pct = PricingModel.get_savings_percentage(plan)
            print(f"{plan.value.upper()}:")
            print(f"  Mensual: ${monthly}")
            print(f"  Anual:   ${annual} (Ahorro: ${savings} - {savings_pct}%)\n")
        else:
            print(f"{plan.value.upper()}: Siempre Gratis\n")

    # Instrucciones
    print_header("🚀 PRÓXIMOS PASOS")

    print("""
1. VER LA PÁGINA WEB:
   → Abre: html/suscripciones.html
   
2. EJECUTAR PRUEBAS COMPLETAS:
   → python src/python/test_subscriptions.py
   
3. INICIAR API (OPCIONAL):
   → python src/python/api_subscriptions.py
   → API en: http://localhost:5000
   
4. LEER DOCUMENTACIÓN:
   → doc/SUSCRIPCIONES.md
   → INTEGRACION_SUSCRIPCIONES.md

5. TRADUCIR A PRODUCCIÓN:
   → Ver sección "Próximos Pasos" en INTEGRACION_SUSCRIPCIONES.md
    """)

    print("\n" + "="*60)
    print("✅  DEMO COMPLETADA - ¡Sistema listo para usar!")
    print("="*60 + "\n")


if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError:
        print("""
❌ ERROR: No se encontraron los archivos necesarios.
   Asegúrate de ejecutar este script desde la carpeta raíz del proyecto.
        """)
    except ImportError as e:
        print(f"""
❌ ERROR: Dependencia no encontrada: {e}
   Ejecuta: pip install -r src/python/requirements.txt
        """)
