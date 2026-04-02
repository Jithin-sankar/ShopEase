# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from django.utils.timezone import now
from datetime import timedelta
import uuid
import json

from accounts.views import CookieJWTAuthentication
from accounts.models import User
from orders.models import Order
from products.models import Product
from products.serializers import ProductSerializer


# Utility function
def is_admin(user):
    return user.is_authenticated and (
        user.is_staff or getattr(user, "role", "") == "admin"
    )


# ------------------- Admin Dashboard -------------------
class AdminDashboard(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            today = now().date()
            last_7_days = today - timedelta(days=7)

            return Response({
                "success": True,
                "data": {
                    "stats": {
                        "users": User.objects.count(),
                        "products": Product.objects.count(),
                        "orders": Order.objects.count(),
                        "sales": Order.objects.aggregate(total=Sum("total"))["total"] or 0,
                    },
                    "recent_orders": Order.objects.filter(created_at__date=today).count(),
                    "weekly_sales": Order.objects.filter(
                        created_at__date__gte=last_7_days
                    ).aggregate(total=Sum("total"))["total"] or 0,
                    "top_products": list(
                        Product.objects.annotate(
                            total_sold=Sum("orderitem__quantity")
                        ).order_by("-total_sold")[:5].values("productName", "total_sold")
                    ),
                    "order_status": list(
                        Order.objects.values("status").annotate(count=Count("id"))
                    ),
                    "sales_trend": list(
                        Order.objects.annotate(date=TruncDate("created_at"))
                        .values("date")
                        .annotate(total=Sum("total"))
                        .order_by("date")
                    ),
                    "orders_vs_users": {
                        "orders": Order.objects.count(),
                        "users": User.objects.count()
                    },
                    "recent_orders_list": list(
                        Order.objects.select_related("user")
                        .order_by("-created_at")[:5]
                        .values("id", "total", "status", "created_at", "user__username")
                    ),
                }
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ------------------- Admin Orders -------------------
class AdminOrders(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            orders = Order.objects.select_related("user").prefetch_related("items__product").order_by("-created_at")
            data = []

            for o in orders:
                items_list = []
                for item in o.items.all():
                    product_name = getattr(item.product, "productName", "Deleted Product") if item.product else "Deleted Product"
                    items_list.append({
                        "productName": product_name,
                        "quantity": getattr(item, "quantity", 0)
                    })

                data.append({
                    "id": getattr(o, "id", None),
                    "user": getattr(o.user, "username", "N/A") if o.user else "N/A",
                    "email": getattr(o.user, "email", "N/A") if o.user else "N/A",
                    "total": getattr(o, "total", 0),
                    "status": getattr(o, "status", "Unknown"),
                    "created_at": getattr(o, "created_at", None),
                    "items": items_list
                })

            return Response({"success": True, "data": data})

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, pk):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            order = Order.objects.get(id=pk)
            order.status = request.data.get("status", order.status)
            order.save()

            return Response({"success": True, "message": "Order updated"})

        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ------------------- Admin Products -------------------
class AdminProducts(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            products = Product.objects.all()
            serializer = ProductSerializer(products, many=True)
            return Response({"success": True, "data": serializer.data})

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def post(self, request):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            data = request.data.copy()
            data["id"] = str(uuid.uuid4())[:8]

            specs = data.get("specs")
            if isinstance(specs, str):
                try:
                    data["specs"] = json.loads(specs)
                except:
                    return Response({"error": "Invalid specs JSON"}, status=400)
            else:
                data["specs"] = specs or {}

            serializer = ProductSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response({"success": True, "message": "Product created", "data": serializer.data}, status=201)

            return Response(serializer.errors, status=400)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, pk):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            product = Product.objects.get(id=pk)
            data = request.data.copy()

            specs = data.get("specs")
            if isinstance(specs, str):
                try:
                    data["specs"] = json.loads(specs)
                except:
                    return Response({"error": "Invalid specs JSON"}, status=400)

            serializer = ProductSerializer(product, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"success": True, "message": "Product updated", "data": serializer.data})

            return Response(serializer.errors, status=400)

        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, pk):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            product = Product.objects.get(id=pk)
            product.delete()
            return Response({"success": True, "message": "Product deleted"})

        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


# ------------------- Admin Users -------------------
class AdminUsersView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            users = User.objects.filter(is_staff=False)
            data = [{"id": u.id, "username": u.username, "email": u.email, "is_active": u.is_active} for u in users]
            return Response({"success": True, "data": data})

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class AdminUserUpdateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            user = User.objects.get(id=id)
            user.is_active = request.data.get("is_active", user.is_active)
            user.save()
            return Response({"success": True, "message": "User updated"})

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, id):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            user = User.objects.get(id=id)
            user.delete()
            return Response({"success": True, "message": "User deleted"})

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)



class AdminUserOrdersView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            if not is_admin(request.user):
                return Response({"error": "Admins only"}, status=403)

            orders = Order.objects.filter(user_id=user_id).order_by('-created_at')

            data = []
            for order in orders:
                data.append({
                    "id": order.id,
                    "status": order.status,
                    "total_price": order.total,
                    "created_at": order.created_at,
                    "customer_name": order.customer_name,
                    "phone": order.phone,
                    "email": order.email,
                    "address": order.address,
                    "location": order.location,
                    "items": [
                        {
                            "product_name": item.product.productName,
                            "quantity": item.quantity
                        }
                        for item in order.items.all()
                    ]
                })

            return Response({"success": True, "data": data})

        except Exception as e:
            return Response({"error": str(e)}, status=500)