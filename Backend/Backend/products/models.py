from django.db import models

class Product(models.Model):
    id = models.CharField(max_length=10, primary_key=True)  # use your given `id` like "f4e7"
    productName = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    specs = models.JSONField()  
    description = models.TextField()
    price = models.FloatField()
    currency = models.CharField(max_length=5, default='₹')
    image = models.URLField() 
    quantity = models.IntegerField(default=0)
   

    def __str__(self):
        return self.productName