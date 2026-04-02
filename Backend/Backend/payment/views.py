import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from orders.models import Order
from accounts.views import CookieJWTAuthentication

stripe.api_key = settings.STRIPE_SECRET_KEY


# ✅ CREATE CHECKOUT SESSION
class CreateCheckoutSession(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            order_id = request.data.get("order_id")

            order = Order.objects.get(id=order_id, user=request.user)

            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "inr",
                        "product_data": {
                            "name": f"Order #{order.id}",
                        },
                        "unit_amount": int(order.total * 100),
                    },
                    "quantity": 1,
                }],
                mode="payment",
                metadata={"order_id": str(order.id)},
                success_url="http://localhost:5173/OrderSuccess?session_id={CHECKOUT_SESSION_ID}",
                cancel_url="http://localhost:5173/order",
            )

            order.stripe_session_id = session.id
            order.save()

            return Response({
                "id": session.id,
                "url": session.url
            })

        except Exception as e:
            print("CREATE ERROR:", str(e))
            return Response({"error": str(e)}, status=400)


class VerifyPayment(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            session_id = request.data.get("session_id")
            print("SESSION ID:", session_id)

            if not session_id:
                return Response({"error": "No session_id"}, status=400)

            session = stripe.checkout.Session.retrieve(session_id)

            print("PAYMENT STATUS:", session.payment_status)

            if session.payment_status == "paid":
                # ✅ BEST METHOD (no metadata needed)
                try:
                    order = Order.objects.get(stripe_session_id=session_id)
                except Order.DoesNotExist:
                    return Response({"error": "Order not found"}, status=400)

                order.is_paid = True
                order.save()

                return Response({"status": "success"})

            return Response({"error": "Payment not completed"}, status=400)

        except Exception as e:
            print("VERIFY ERROR:", str(e))
            return Response({"error": str(e)}, status=400)