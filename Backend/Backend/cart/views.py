from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart
from .serializers import CartSerializer
from products.models import Product
from accounts.views import CookieJWTAuthentication
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class CartView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart_items = Cart.objects.filter(user=request.user)
        serializer = CartSerializer(cart_items, many=True)
        return Response(serializer.data)


    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['product_id'],
            properties={
                'product_id': openapi.Schema(type=openapi.TYPE_STRING, description="The ID of the product to add"),
            },
        ),
        responses={200: CartSerializer(many=True)}
    )
    def post(self, request):
        user = request.user
        product_id = request.data.get('product_id')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        cart_item, created = Cart.objects.get_or_create(
            user=user,
            product=product
        )

        if not created:
            cart_item.quantity += 1
            cart_item.save()

        
        cart_items = Cart.objects.filter(user=user)
        serializer = CartSerializer(cart_items, many=True)
        return Response(serializer.data)


class CartDeleteView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        try:
            item = Cart.objects.get(id=id, user=request.user)
            item.delete()

            
            cart_items = Cart.objects.filter(user=request.user)
            serializer = CartSerializer(cart_items, many=True)
            return Response(serializer.data)

        except Cart.DoesNotExist:
            return Response({"error": "Item not found"}, status=404)


class CartUpdateView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]


    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'action': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description="Action to perform: 'decrease'",
                    enum=['decrease']
                ),
            },
        ),
        responses={200: CartSerializer(many=True)}
    )
    def patch(self, request, id):
        try:
            item = Cart.objects.get(id=id, user=request.user)
            action = request.data.get("action")

            if action == "decrease":
                item.quantity -= 1

                if item.quantity <= 0:
                    item.delete()
                else:
                    item.save()

            
            cart_items = Cart.objects.filter(user=request.user)
            serializer = CartSerializer(cart_items, many=True)
            return Response(serializer.data)

        except Cart.DoesNotExist:
            return Response({"error": "Item not found"}, status=404)