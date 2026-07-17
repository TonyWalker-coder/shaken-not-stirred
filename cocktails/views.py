from django.shortcuts import render
from .models import Cocktail

# Create your views here.
from django.db.models.functions import Lower

def cocktail_list(request):
    cocktails = Cocktail.objects.all().order_by(Lower("name"))
    return render(request, 'cocktails/cocktail_list.html', {'cocktails': cocktails})
