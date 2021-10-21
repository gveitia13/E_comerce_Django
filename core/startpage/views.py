import json
from datetime import datetime

from django.db import transaction
from django.http import JsonResponse, HttpResponse
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView
from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration

from core.Mixins import GetObjects
from core.main.models import Product
from core.main.views.dashboard.views import countEntity
from core.startpage.models import Cart, DetCart


class StartPageView(GetObjects, TemplateView):
    template_name = 'startpage/startpage.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Catalog'
        context['all_product'] = Product.objects.filter(stock__gt=0)
        return context

    @method_decorator(csrf_exempt)
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
                data = [p.toJSON() for p in Product.objects.all().order_by('name').filter(stock__gt=0).exclude(
                    id__in=json.loads(request.POST['ids'])).order_by('cat_id')]
            elif action == 'create':
                print(request.POST)
                with transaction.atomic():
                    vents = json.loads(request.POST['cart'])
                    print(vents)
                    cart = Cart()
                    # cart.date_joined = datetime.now()
                    cart.cli_name = vents['cli_name']
                    if vents['cli_addr'] != '':
                        cart.cli_addr = vents['cli_addr']
                    else:
                        cart.cli_addr = 'Our local'
                    if vents['cli_note'] != '':
                        cart.cli_note = vents['cli_note']
                    cart.total = float(vents['total'])
                    cart.save()
                    print('save cart')
                    for i in vents['prods']:
                        det = DetCart()
                        det.cart_id = cart.id
                        det.product_id = i['id']
                        det.cant = int(i['cant'])
                        det.price = float(i['s_price'])
                        det.subtotal = float(i['subtotal'])
                        det.save()
                    data = {'id': cart.id}
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)


class CartListView(TemplateView):
    template_name = 'startpage/list.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Sales online list'
        context['entity_count'] = countEntity()
        return context

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = [i.toJSON() for i in Cart.objects.all()]
            elif action == 'search_details-prod':
                data = [i.toJSON() for i in DetCart.objects.filter(cart_id=request.POST['id'])]
            elif action == 'delete':
                with transaction.atomic():
                    cart = Cart.objects.get(pk=request.POST['id'])
                    cart.delete()
                    data['success'] = 'deleted'
                    data['object'] = cart.toJSON()
            elif action == 'edit':
                with transaction.atomic():
                    cart = Cart.objects.get(pk=request.POST['id'])
                    cart.status = request.POST['status']
                    cart.user_updated_id = request.user.id
                    cart.save()
                    data['success'] = 'todo ok'
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)


def export_pdf(request, **kwargs):
    print(request)
    context = {}
    context['title'] = 'Invoice details'
    context['cart'] = Cart.objects.get(pk=kwargs['pk'])
    context['company'] = {'name': 'TechnoSTAR'}
    context['list_url'] = reverse_lazy('startpage:cart_list')

    html = render_to_string('startpage/invoice.html', context)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'inline; report.pdf'

    font_config = FontConfiguration()
    HTML(string=html, base_url=request.build_absolute_uri()) \
        .write_pdf(response, font_config=font_config)
    return response
