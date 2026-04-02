from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.mail import EmailMultiAlternatives
from django.db import DatabaseError
from .models import Order, OrderItem
from .serializers import OrderSerializer
from accounts.views import CookieJWTAuthentication
from cart.models import Cart


class OrderView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            serializer = OrderSerializer(
                data=request.data,
                context={'request': request}
            )

            if not serializer.is_valid():
                return Response(
                    {
                        "error": "Validation failed",
                        "details": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

           
            order = serializer.save(user=request.user)

           
            cart_items = Cart.objects.filter(user=request.user)

            if not cart_items.exists():
                return Response(
                    {"error": "Cart is empty"},
                    status=status.HTTP_400_BAD_REQUEST
                )

           
            order_items = [
                OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity
                )
                for item in cart_items
            ]

            OrderItem.objects.bulk_create(order_items)

            
            cart_items.delete()

            response_serializer = OrderSerializer(
                order,
                context={'request': request}
            )

           
            return Response(
                {
                    "message": "Order created. Proceed to payment.",
                    "order_id": order.id,
                    "data": response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except DatabaseError:
            return Response(
                {"error": "Database error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        try:
            orders = Order.objects.filter(user=request.user).order_by('-created_at')

            serializer = OrderSerializer(
                orders,
                many=True,
                context={'request': request}
            )

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def send_order_email(self, user, order, order_items):
        try:
            subject = "Order Confirmation ✅"
            to_email = user.email

            product_list = "".join([
                f"<li>{item.product.productName} (Qty: {item.quantity})</li>"
                for item in order_items
            ])

            html_content = f"""
            <h2>Order Confirmed 🎉</h2>
            <p>Hi {user.username},</p>
            <p>Your order <b>{order.id}</b> has been paid successfully.</p>

            <h3>Items:</h3>
            <ul>
                {product_list if product_list else "<li>No items</li>"}
            </ul>

            <p>Thank you for shopping with us ❤️</p>
            """

            email = EmailMultiAlternatives(
                subject=subject,
                body="Your payment was successful.",
                to=[to_email]
            )

            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)

        except Exception as e:
            print("Email Error:", str(e))