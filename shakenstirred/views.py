from django.shortcuts import render

def index(request):
    return render(request, "index.html")

def admin_page(request):
    return render(request, "admin.html")