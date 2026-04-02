from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from accounts.views import CookieJWTAuthentication 
from .models import Wishlist
from .serializers import WishlistSerializer
from products.models import Product


class WishlistView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist = Wishlist.objects.filter(user=request.user)
        serializer = WishlistSerializer(wishlist, many=True)
        return Response(serializer.data)

    
    def post(self, request):
        product_id = request.data.get("product_id")

        if not product_id:
            return Response({"error": "Product ID required"}, status=400)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        
        item, created = Wishlist.objects.get_or_create(
            user=request.user,
            product=product
        )

        if not created:
            return Response({"message": "Already in wishlist"}, status=200)

        return Response({"message": "Added to wishlist"}, status=201)


class WishlistDeleteView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    
    def delete(self, request, pk):
        try:
            item = Wishlist.objects.get(id=pk, user=request.user)
            item.delete()
            return Response({"message": "Removed"}, status=204)
        except Wishlist.DoesNotExist:
            return Response({"error": "Not found"}, status=404)