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

    def get(self, request, *args, **kwargs):
        data = super().get(request, *args, **kwargs)
        return data