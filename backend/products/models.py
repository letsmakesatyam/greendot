from django.db import models


class Product(models.Model):
    APPLICATION_TYPE_CHOICES = [
        ("Core", "Core"),
        ("Country", "Country"),
        ("Enhanced", "Enhanced"),
        ("Specialty", "Specialty"),
        ("", "—"),
    ]
    SOURCE_CHOICES = [
        ("EU", "EU"),
        ("TR", "TR"),
        ("UAE", "UAE"),
        ("US", "US"),
        ("", "—"),
    ]
    STATUS_CHOICES = [
        ("", "Normal"),
        ("Evaluate", "Evaluate"),
        ("Discontinued", "Discontinued"),
    ]

    category = models.CharField(max_length=200, db_index=True)
    application = models.CharField(max_length=200, db_index=True)
    positioning = models.CharField(max_length=400, blank=True)
    fg_code = models.CharField(max_length=100, unique=True, db_index=True)
    product_name = models.CharField(max_length=500)
    product_hierarchy = models.CharField(max_length=500, blank=True)
    application_type = models.CharField(
        max_length=100, choices=APPLICATION_TYPE_CHOICES, blank=True, db_index=True
    )
    geo_bucket = models.CharField(max_length=200, blank=True, db_index=True)
    pack_size = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=100, choices=SOURCE_CHOICES, blank=True)
    is_green = models.BooleanField(default=False)
    fc = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, blank=True)

    # Binary indicator columns (0/1) visible in the spreadsheet
    indicator_listing = models.SmallIntegerField(default=0)
    indicator_feasibility = models.SmallIntegerField(default=0)
    indicator_ke = models.SmallIntegerField(default=0)
    indicator_4 = models.SmallIntegerField(default=0)
    indicator_5 = models.SmallIntegerField(default=0)
    indicator_6 = models.SmallIntegerField(default=0)

    # Product image — URL stored here (uploaded to Supabase Storage)
    image_url = models.URLField(max_length=1000, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "application", "product_name"]
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def __str__(self):
        return f"{self.fg_code} — {self.product_name}"
