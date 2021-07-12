from django.db import transaction
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from core.main.forms import ProductForm
from core.main.models import Category, Product


class ProductView(TemplateView, ):
    template_name = 'product/list.html'
    model = Product
    form_class = ProductForm

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = []
                for i in Category.objects.all():
                    data.append(i.toJSON())
            elif action == 'search_product':
                data = {'object': Product.objects.get(pk=request.POST['id']).toJSON(), }
            elif action == 'add':
                with transaction.atomic():
                    ProductForm(request.POST).save()
                    data['success'] = 'added'
                    data['object'] = Product.objects.get(name=request.POST['name']).toJSON()
            elif action == 'edit':
                with transaction.atomic():
                    prod = Product.objects.get(pk=request.POST['id'])
                    prod.name = request.POST['name']
                    prod.cat = Category.objects.get(pk=request.POST['cat'])
                    prod.stock = request.POST['stock']
                    prod.s_price = request.POST['s_price']
                    prod.save()
                    data['success'] = 'updated'
                    data['object'] = prod.toJSON()
            elif action == 'dele':
                with transaction.atomic():
                    prod = Product.objects.get(pk=request.POST['id'])
                    prod.delete()
                    data['success'] = 'deleted'
                    data['object'] = prod.toJSON()
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Product\'s list'
        context['list_url'] = reverse_lazy('main:product_list')
        context['form'] = ProductForm()
        context['lista'] = Product.objects.all()
        context['entity'] = 'Product'
        return context
