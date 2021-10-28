from django.db import transaction
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, CreateView, FormView

from core.main.forms import ProductForm, CategoryForm
from core.main.models import Category, Product
from core.main.views.dashboard.views import countEntity


class ProductView(TemplateView, FormView):
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
                data = [p.toJSON() for p in Product.objects.all()]
            elif action == 'search_product':
                data = {'object': Product.objects.get(pk=request.POST['id']).toJSON(), }
            elif action == 'add':
                with transaction.atomic():
                    form = self.get_form()
                    data = form.save()
                    data['success'] = 'added'
                    data['object'] = Product.objects.get(name=request.POST['name']).toJSON()
            elif action == 'edit':
                with transaction.atomic():
                    prod = Product.objects.get(pk=request.POST['id'])
                    prod.name = request.POST['name']
                    prod.cat_id = request.POST['cat']
                    prod.stock = request.POST['stock']
                    prod.s_price = request.POST['s_price']
                    prod.p_price = request.POST['p_price']
                    prod.desc = request.POST['desc']
                    if request.FILES:
                        prod.image = request.FILES['image']
                    prod.priority = request.POST['priority']
                    prod.save()
                    data['success'] = 'updated'
                    data['object'] = prod.toJSON()
            elif action == 'dele':
                with transaction.atomic():
                    prod = Product.objects.get(pk=request.POST['id'])
                    prod.delete()
                    data['success'] = 'deleted'
                    data['object'] = prod.toJSON()
            elif action == 'createCat':
                with transaction.atomic():
                    cat = Category()
                    cat.name = request.POST['name']
                    cat.desc = request.POST['desc']
                    if request.POST['icon_class'].find('mdi mdi-') > -1:
                        cat.icon_class = request.POST['icon_class']
                    else:
                        cat.icon_class = 'mdi mdi-star'
                    cat.save()
                    data['success'] = 'added'
                    data['object'] = cat.toJSON()
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Products list'
        context['list_url'] = reverse_lazy('main:product_list')
        context['form_cat'] = CategoryForm()
        context['entity_count'] = countEntity()
        context['entity'] = 'Product'
        return context
