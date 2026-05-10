from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Product",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("category", models.CharField(db_index=True, max_length=200)),
                ("application", models.CharField(db_index=True, max_length=200)),
                ("positioning", models.CharField(blank=True, max_length=400)),
                ("fg_code", models.CharField(db_index=True, max_length=100, unique=True)),
                ("product_name", models.CharField(max_length=500)),
                ("product_hierarchy", models.CharField(blank=True, max_length=500)),
                ("application_type", models.CharField(blank=True, choices=[("Core", "Core"), ("Country", "Country"), ("Enhanced", "Enhanced"), ("Specialty", "Specialty"), ("", "—")], db_index=True, max_length=100)),
                ("geo_bucket", models.CharField(blank=True, db_index=True, max_length=200)),
                ("pack_size", models.CharField(blank=True, max_length=100)),
                ("source", models.CharField(blank=True, choices=[("EU", "EU"), ("TR", "TR"), ("UAE", "UAE"), ("US", "US"), ("", "—")], max_length=100)),
                ("is_green", models.BooleanField(default=False)),
                ("fc", models.CharField(blank=True, max_length=50)),
                ("status", models.CharField(blank=True, choices=[("", "Normal"), ("Evaluate", "Evaluate"), ("Discontinued", "Discontinued")], max_length=100)),
                ("indicator_listing", models.SmallIntegerField(default=0)),
                ("indicator_feasibility", models.SmallIntegerField(default=0)),
                ("indicator_ke", models.SmallIntegerField(default=0)),
                ("indicator_4", models.SmallIntegerField(default=0)),
                ("indicator_5", models.SmallIntegerField(default=0)),
                ("indicator_6", models.SmallIntegerField(default=0)),
                ("image_url", models.URLField(blank=True, max_length=1000)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"verbose_name": "Product", "verbose_name_plural": "Products", "ordering": ["category", "application", "product_name"]},
        ),
    ]
