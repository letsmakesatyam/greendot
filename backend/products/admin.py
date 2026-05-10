from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "fg_code", "product_name", "category", "application",
        "application_type", "geo_bucket", "source", "is_green", "status",
    ]
    list_filter = ["category", "application_type", "source", "is_green", "status", "geo_bucket"]
    search_fields = ["fg_code", "product_name", "product_hierarchy"]
    ordering = ["category", "application", "product_name"]
    list_per_page = 50
