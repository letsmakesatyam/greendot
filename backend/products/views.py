import io
import uuid
import mimetypes

import pandas as pd
from django.conf import settings
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .models import Product
from .serializers import ProductSerializer, ProductListSerializer

IMPORT_COLUMN_MAP = {
    "Category": "category",
    "Application": "application",
    "Positioning": "positioning",
    "FG Code": "fg_code",
    "Product": "product_name",
    "Product Hierarchy": "product_hierarchy",
    "Application Type": "application_type",
    "Geo Bucket": "geo_bucket",
    "Pack Size": "pack_size",
    "Source": "source",
    "Green": "is_green",
    "FC": "fc",
    "Status": "status",
    "Listing": "indicator_listing",
    "Feasibility": "indicator_feasibility",
    "KE": "indicator_ke",
    "Indicator 4": "indicator_4",
    "Indicator 5": "indicator_5",
    "Indicator 6": "indicator_6",
}


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        "category",
        "application",
        "application_type",
        "geo_bucket",
        "source",
        "is_green",
        "status",
    ]
    search_fields = ["product_name", "fg_code", "product_hierarchy", "positioning"]
    ordering_fields = [
        "category",
        "application",
        "fg_code",
        "product_name",
        "updated_at",
    ]
    ordering = ["category", "application", "product_name"]

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        return ProductSerializer

    @action(detail=False, methods=["post"], url_path="import-data",
            parser_classes=[MultiPartParser, FormParser])
    def import_data(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        filename = file.name.lower()
        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(file)
            elif filename.endswith((".xlsx", ".xls")):
                df = pd.read_excel(file)
            else:
                return Response(
                    {"error": "Unsupported file type. Use CSV or XLSX."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            return Response({"error": f"Failed to parse file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        created, updated, errors = 0, 0, []
        for idx, row in df.iterrows():
            row_data = {}
            for col_header, field_name in IMPORT_COLUMN_MAP.items():
                if col_header in row:
                    val = row[col_header]
                    if field_name == "is_green":
                        row_data[field_name] = str(val).strip().lower() in ("yes", "true", "1")
                    elif field_name in (
                        "indicator_listing", "indicator_feasibility",
                        "indicator_ke", "indicator_4", "indicator_5", "indicator_6",
                    ):
                        try:
                            row_data[field_name] = int(val) if pd.notna(val) else 0
                        except (ValueError, TypeError):
                            row_data[field_name] = 0
                    else:
                        row_data[field_name] = str(val).strip() if pd.notna(val) else ""

            fg_code = row_data.get("fg_code")
            if not fg_code:
                errors.append(f"Row {idx + 2}: missing FG Code — skipped.")
                continue
            try:
                obj, was_created = Product.objects.update_or_create(
                    fg_code=fg_code, defaults=row_data
                )
                if was_created:
                    created += 1
                else:
                    updated += 1
            except Exception as e:
                errors.append(f"Row {idx + 2} ({fg_code}): {str(e)}")

        return Response(
            {"created": created, "updated": updated, "errors": errors},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="export-data")
    def export_data(self, request):
        fmt = request.query_params.get("format", "xlsx")
        qs = self.filter_queryset(self.get_queryset())
        data = list(qs.values(
            "category", "application", "positioning", "fg_code", "product_name",
            "product_hierarchy", "application_type", "geo_bucket", "pack_size",
            "source", "is_green", "fc", "status",
            "indicator_listing", "indicator_feasibility", "indicator_ke",
            "indicator_4", "indicator_5", "indicator_6", "image_url",
        ))

        df = pd.DataFrame(data)
        if "is_green" in df.columns:
            df["is_green"] = df["is_green"].map({True: "Yes", False: ""})
        df.rename(columns={v: k for k, v in IMPORT_COLUMN_MAP.items()}, inplace=True)

        if fmt == "csv":
            response = HttpResponse(content_type="text/csv")
            response["Content-Disposition"] = 'attachment; filename="products_export.csv"'
            df.to_csv(response, index=False)
        else:
            buf = io.BytesIO()
            with pd.ExcelWriter(buf, engine="openpyxl") as writer:
                df.to_excel(writer, index=False, sheet_name="Products")
            buf.seek(0)
            response = HttpResponse(
                buf.read(),
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
            response["Content-Disposition"] = 'attachment; filename="products_export.xlsx"'
        return response

    @action(detail=False, methods=["post"], url_path="upload-image",
            parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request):
        file = request.FILES.get("image")
        if not file:
            return Response({"error": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)

        supabase_url = settings.SUPABASE_URL
        supabase_key = settings.SUPABASE_SERVICE_KEY
        bucket = settings.SUPABASE_BUCKET

        if supabase_url and supabase_key:
            try:
                from supabase import create_client
                client = create_client(supabase_url, supabase_key)
                ext = file.name.rsplit(".", 1)[-1].lower()
                unique_name = f"{uuid.uuid4()}.{ext}"
                mime_type = mimetypes.guess_type(file.name)[0] or "image/jpeg"
                file_bytes = file.read()
                client.storage.from_(bucket).upload(
                    unique_name,
                    file_bytes,
                    {"content_type": mime_type},
                )
                public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{unique_name}"
                return Response({"url": public_url}, status=status.HTTP_201_CREATED)
            except Exception as e:
                import os
                from django.core.files.storage import default_storage
                from django.core.files.base import ContentFile

                ext = file.name.rsplit(".", 1)[-1].lower()
                unique_name = f"product_images/{uuid.uuid4()}.{ext}"
                file.seek(0)
                default_storage.save(unique_name, ContentFile(file.read()))
                url = request.build_absolute_uri(settings.MEDIA_URL + unique_name)
                return Response({"url": url}, status=status.HTTP_201_CREATED)

        # Fallback if Supabase not configured
        import os
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile

        ext = file.name.rsplit(".", 1)[-1].lower()
        unique_name = f"product_images/{uuid.uuid4()}.{ext}"
        default_storage.save(unique_name, ContentFile(file.read()))
        url = request.build_absolute_uri(settings.MEDIA_URL + unique_name)
        return Response({"url": url}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        from django.db.models import Count
        total = Product.objects.count()
        by_category = list(
            Product.objects.values("category").annotate(count=Count("id")).order_by("-count")
        )
        by_source = list(
            Product.objects.values("source").annotate(count=Count("id")).order_by("-count")
        )
        evaluate_count = Product.objects.filter(status="Evaluate").count()
        green_count = Product.objects.filter(is_green=True).count()
        return Response({
            "total": total,
            "by_category": by_category,
            "by_source": by_source,
            "evaluate_count": evaluate_count,
            "green_count": green_count,
        })
