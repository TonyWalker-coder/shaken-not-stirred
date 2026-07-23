from django.core.management.base import BaseCommand
from cocktails.models import Ingredient

class Command(BaseCommand):
    help = "Temporary script to clean duplicate ingredients (case + whitespace insensitive)."

    def handle(self, *args, **kwargs):
        seen = set()
        deleted = []

        for ingredient in Ingredient.objects.all():
            normalised = ingredient.name.strip().lower()

            if normalised in seen:
                # Duplicate → delete it
                deleted.append(ingredient.name)
                ingredient.delete()
            else:
                # First occurrence → normalise and save
                ingredient.name = normalised
                ingredient.save()
                seen.add(normalised)

        self.stdout.write(self.style.SUCCESS("Cleanup complete."))
        self.stdout.write(self.style.SUCCESS(f"Deleted duplicates: {deleted}"))
