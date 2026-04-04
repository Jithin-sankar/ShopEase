from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.core.exceptions import ObjectDoesNotExist
from django.db import DatabaseError
from drf_yasg.utils import swagger_auto_schema
from .models import Product
from .serializers import ProductSerializer
from accounts.views import CookieJWTAuthentication

class ProductList(APIView):
    authentication_classes = [CookieJWTAuthentication]
    def get_permissions(self):
        if self.request.method == "GET":
            return []  # Public access
        return [IsAuthenticated(), IsAdminUser()]
    @swagger_auto_schema(responses={200: ProductSerializer(many=True)})
    def get(self, request):
        try:
            products = Product.objects.all()

            if not products.exists():
                return Response(
                    {"message": "No products found"},
                    status=status.HTTP_200_OK
                )

            serializer = ProductSerializer(products, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

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
    @swagger_auto_schema(
        request_body=ProductSerializer,
        responses={201: "Product created successfully", 400: "Validation failed"}
    )
    def post(self, request):
        try:
            serializer = ProductSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        "message": "Product created successfully",
                        "data": serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )

            return Response(
                {
                    "error": "Validation failed",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except DatabaseError:
            return Response(
                {"error": "Failed to save product"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class ProductDetail(APIView):
    authentication_classes = [CookieJWTAuthentication]
    
    def get_permissions(self):
        if self.request.method == "GET":
            return []
        return [IsAuthenticated(), IsAdminUser()]

    def get_object(self, pk):
        try:
            return Product.objects.get(pk=pk)
        except ObjectDoesNotExist:
            return None
    @swagger_auto_schema(responses={200: ProductSerializer()})
    def get(self, request, pk):
        try:
            product = self.get_object(pk)

            if not product:
                return Response(
                    {"error": "Product not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    @swagger_auto_schema(
        request_body=ProductSerializer,
        responses={200: "Product updated successfully"}
    )
    def put(self, request, pk):
        try:
            product = self.get_object(pk)

            if not product:
                return Response(
                    {"error": "Product not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = ProductSerializer(product, data=request.data)

            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        "message": "Product updated successfully",
                        "data": serializer.data
                    },
                    status=status.HTTP_200_OK
                )

            return Response(
                {
                    "error": "Validation failed",
                    "details": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except DatabaseError:
            return Response(
                {"error": "Update failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, pk):
        try:
            product = self.get_object(pk)

            if not product:
                return Response(
                    {"error": "Product not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            product.delete()

            return Response(
                {"message": "Product deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        except DatabaseError:
            return Response(
                {"error": "Delete failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )