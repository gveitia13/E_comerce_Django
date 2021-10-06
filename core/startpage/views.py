import json

from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from core.main.models import Category, Product


class StartPageView(TemplateView):
    template_name = 'startpage/startpage.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Catalog'
        context['cats'] = Category.objects.all()
        context['prods'] = Product.objects.all()
        return context

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'getProd':
                with transaction.atomic():
                    data = Product.objects.get(id=request.POST['id']).toJSON()
            elif action == 'getAll':
                data = [i.toJSON() for i in Product.objects.all()]
            elif action == 'list_products':
                data = [p.toJSON () for p in Product.objects.all().order_by('name').filter(stock__gt=0).exclude(
                    id__in=json.loads(request.POST['ids'])).order_by('cat_id')]
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)
