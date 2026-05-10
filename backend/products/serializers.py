from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class ProductListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""

    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "application",
            "positioning",
            "fg_code",
            "product_name",
            "product_hierarchy",
            "application_type",
            "geo_bucket",
            "pack_size",
            "source",
            "is_green",
            "fc",
            "status",
            "indicator_listing",
            "indicator_feasibility",
            "indicator_ke",
            "indicator_4",
            "indicator_5",
            "indicator_6",
            "image_url",
            "updated_at",
        ]
