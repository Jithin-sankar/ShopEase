from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.productName', read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)
    price = serializers.FloatField(source='product.price', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'price', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'customer_name',
            'phone',
            'email',
            'address',
            'location',
            'total',
            'status',
            'payment_status',
            'created_at',
            'items'
        ]

        read_only_fields = [
            'status',
            'payment_status',
            'created_at'
        ]

        extra_kwargs = {
            'total': {'required': False}
        }