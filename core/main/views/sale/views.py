import json

from django.db import transaction
from django.db.models import Q
from django.http import JsonResponse, HttpResponse
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import CreateView, UpdateView, TemplateView
from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration

from core.main.forms import SaleForm, ClientForm, ReportForm
from core.main.models import Sale, Product, DetSale, Client
from core.main.views.dashboard.views import countEntity


def search_autocomplete_jquery(request, *args, **kwargs):
    data = []
    ids_exclude = json.loads(request.POST['ids'])
    term = request.POST['term'].strip()
    products = Product.objects.filter(stock__gt=0)  # gt significa mayor
    if len(term):
        products = products.filter(name__icontains=term)
    for i in products.exclude(id__in=ids_exclude)[0:10]:
        item = i.toJSON()
        #  para usar autocomplete con jQuery
        item['value'] = i.name
        data.append(item)
    return data


def search_clients(request, *args, **kwargs):
    data = []
    term = request.POST['term']
    clients = Client.objects.filter(
        Q(name__icontains=term) | Q(surnames__icontains=term) | Q(dni__icontains=term))[0:50]
    for i in clients:
        item = i.toJSON()
        item['text'] = i.get_full_name()
        data.append(item)
    return data


def search_products_select2(request, *args, **kwargs):
    data = []
    ids_exclude = json.loads(request.POST['ids'])
    term = request.POST['term'].strip()
    data.append({'id': term, 'text': term})
    products = Product.objects.filter(name__icontains=term, stock__gt=0)
    if len(term):
        products = products.filter()
    for i in products.exclude(id__in=ids_exclude)[0:50]:
        item = i.toJSON()
        #  para usar autocomplete con Select2
        item['text'] = i.name
        data.append(item)
    return data


def save_Sale(vents, sale):
    sale1 = sale
    sale1.date_joined = vents['date_joined']
    sale1.cli_id = vents['cli']
    sale1.subtotal = float(vents['subtotal'])
    sale1.iva = float(vents['iva'])
    sale1.total = float(vents['total'])
    return sale1


def save_DetSale(vents, sale):
    for i in vents['products']:
        det = DetSale()
        det.sale_id = sale.id
        det.prod_id = i['id']
        det.cant = int(i['cant'])
        det.price = float(i['s_price'])
        det.subtotal = float(i['subtotal'])
        det.save()
        if (det.prod.stock - det.cant) < 0:
            det.prod.stock = 0
        else:
            det.prod.stock -= det.cant
        det.prod.save()
    return {'id': sale.id}


class SaleCreateView(CreateView):
    model = Sale
    form_class = SaleForm
    template_name = 'sale/create.html'
    success_url = reverse_lazy('main:sale_list')
    # permission_required = 'add_sale'
    url_redirect = success_url

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'search_products':
                pass
            elif action == 'list_products':
                data = [p.toJSON() for p in Product.objects.order_by('name').filter(stock__gt=0).exclude(
                    id__in=json.loads(request.POST['ids']))]
            elif action == 'get_product_by_id':
                data = Product.objects.get(pk=request.POST['id']).toJSON()
            elif action == 'search_autocomplete':  # select 2
                data = search_products_select2(request, *args, **kwargs)
            elif action == 'add':
                with transaction.atomic():
                    vents = json.loads(request.POST['sale'])
                    sale = Sale()
                    sale = save_Sale(vents, sale)
                    sale.save()
                    data = save_DetSale(vents, sale)
            elif action == 'search_clients':
                data = search_clients(request, *args, **kwargs)
            elif action == 'create_client':
                with transaction.atomic():
                    print(request.POST)
                    data = ClientForm(request.POST).save()
            else:
                data['error'] = 'No ha ingresado a ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Create Sale'
        context['entity'] = 'Sale'
        context['list_url'] = self.success_url
        context['action'] = 'add'
        context['det'] = []
        context['frmClient'] = ClientForm()
        context['entity_count'] = countEntity()
        return context


class SaleListView(TemplateView):
    model = Sale
    template_name = 'sale/list.html'

    # permission_required = 'view_sale'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = [i.toJSON() for i in Sale.objects.all()[0:50]]
            elif action == 'search_details-prod':
                data = [i.toJSON() for i in DetSale.objects.filter(sale_id=request.POST['id'])]
            elif action == 'delete':
                with transaction.atomic():
                    sale = Sale.objects.get(pk=request.POST['id'])
                    sale.delete()
                    data['success'] = 'deleted'
                    data['object'] = sale.toJSON()
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Sale\' list'
        context['create_url'] = reverse_lazy('main:sale_create')
        context['list_url'] = reverse_lazy('main:sale_list')
        context['entity'] = 'Sale'
        context['entity_count'] = countEntity()
        return context


class SaleUpdateView(UpdateView):
    model = Sale
    form_class = SaleForm
    template_name = 'sale/create.html'
    success_url = reverse_lazy('main:sale_list')
    # permission_required = 'change_sale'
    url_redirect = success_url

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'list_products':
                data = [p.toJSON() for p in Product.objects.order_by('name').filter(stock__gt=0).exclude(
                    id__in=json.loads(request.POST['ids']))]
            elif action == 'search_autocomplete':  # select 2
                data = search_products_select2(request, *args, **kwargs)
            elif action == 'edit':
                with transaction.atomic():
                    vents = json.loads(request.POST['sale'])
                    # sale = Sale.objects.get(pk=self.get_object().id)
                    sale = self.get_object()
                    sale = save_Sale(vents, sale)
                    sale.save()
                    sale.detsale_set.all().delete()
                    data = save_DetSale(vents, sale)
            elif action == 'search_clients':
                data = search_clients(request, *args, **kwargs)
            elif action == 'create_client':
                with transaction.atomic():
                    data = ClientForm(request.POST).save()
            else:
                data['error'] = 'No ha ingresado a ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_details_product(self):
        data = []
        try:
            for i in DetSale.objects.filter(sale_id=self.get_object().id):
                item = i.prod.toJSON()
                item['cant'] = i.cant
                data.append(item)
        except:
            pass
        return data

    def get_form(self, form_class=None):
        # para que cuando edite la venta me salga el cliente
        instance = self.get_object()
        form = SaleForm(instance=instance)
        form.fields['cli'].queryset = Client.objects.filter(id=instance.cli.id)
        return form

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Sale edit'
        context['entity'] = 'Sale'
        context['list_url'] = self.success_url
        context['action'] = 'edit'
        context['det'] = json.dumps(self.get_details_product())  # pa q el navegador lea JS
        context['frmClient'] = ClientForm()
        context['entity_count'] = countEntity()
        return context


class ReportSaleView(TemplateView):
    template_name = 'sale/report.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'search_report':
                data = []
                start_date = request.POST.get('start_date', '')
                end_date = request.POST.get('end_date', '')
                search = Sale.objects.all()

                if len(start_date) and len(end_date):
                    search = search.filter(date_joined__range=[start_date, end_date])

                    subtotal = 0.00
                    iva = 0.00
                    total = 0.00
                    for s in search:
                        data.append([
                            s.id,
                            s.cli.name,
                            s.date_joined.strftime('%Y-%m-%d'),
                            format(s.subtotal, '.2f'),
                            format(s.iva, '.2f'),
                            format(s.total, '.2f'),
                        ])
                        subtotal += float(s.subtotal)
                        iva += float(s.iva)
                        total += float(s.total)

                    data.append([
                        '---',
                        '---',
                        '---',
                        format(subtotal, '.2f'),
                        format(iva, '.2f'),
                        format(total, '.2f'),
                    ])
            else:
                data['error'] = 'Pastillas es lo que estas cerrando'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Sale\'s report'
        context['entity'] = 'Reports'
        context['list_url'] = reverse_lazy('main:sale_report')
        context['form'] = ReportForm()
        context['entity_count'] = countEntity()
        return context


# def export_pdf(request, **kwargs):
#     print(request)
#     context = {}
#     context['title'] = 'Invoice details'
#     context['sale'] = Sale.objects.get(pk=kwargs['pk'])
#     context['company'] = {'name': 'TechnoSTAR'}
#     context['list_url'] = reverse_lazy('main:sale_list')
#
#     html = render_to_string('sale/invoice.html', context)
#     response = HttpResponse(content_type='application/pdf')
#     response['Content-Disposition'] = 'inline; report.pdf'
#
#     font_config = FontConfiguration()
#     # css_url = os.path.join(settings.BASE_DIR, Path(__file__).resolve().parent.parent.parent,
#     #                        'static/sale/css/invoice.css')
#     HTML(string=html, base_url=request.build_absolute_uri()) \
#         .write_pdf(response, font_config=font_config)
#     return response


class SalePDF(View):

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, **kwargs):
        print(kwargs['pk'])
        context = {
            'title': 'Invoice details',
            'sale': Sale.objects.get(pk=self.kwargs['pk']),
            'company': {'name': 'TechnoSTAR'},
            'list_url': reverse_lazy('main:sale_list')
        }
        html = render_to_string('sale/invoice.html', context)
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'inline; report.pdf'

        font_config = FontConfiguration()
        HTML(string=html, base_url=request.build_absolute_uri()) \
            .write_pdf(response, font_config=font_config)
        return response
