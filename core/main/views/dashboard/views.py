from datetime import datetime
from random import randint

from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from core.main.models import Category, Product, Client, Sale, DetSale


def get_graph_sales_products_year_month():
    data = []
    year = datetime.now().year
    month = datetime.now().month
    try:
        total = 0.00
        for p in Product.objects.all():
            for i in DetSale.objects.filter(sale__date_joined__year=year, sale__date_joined__month=month,
                                            prod_id=p.id):
                total += float(i.subtotal)
            if total > 0:
                data.append({
                    'name': p.name,
                    'y': float(total)
                })
                total = 0.00
    except:
        pass
    return data


def get_graph_sales_years_month():
    data = []
    try:
        year = datetime.now().year
        total = 0.00
        for m in range(1, 13):
            for i in Sale.objects.filter(date_joined__year=year, date_joined__month=m):
                total += float(i.total)
            data.append(float(total))
            total = 0.00
    except:
        pass
    return data


class DashboardView(TemplateView):
    template_name = 'dashboard.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    # def get(self, request, *args, **kwargs):
    #     request.user.get_group_session()
    #     return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'get_graph_sales_years_month':
                data = {
                    'name': 'Percentage of sales',
                    'showInLegend': False,
                    'colorByPoint': True,
                    'data': get_graph_sales_years_month()
                }
            elif action == 'get_graph_sales_products_year_month':
                data = {
                    'name': 'Percentage',
                    'colorByPoint': True,
                    'data': get_graph_sales_products_year_month()
                }
            elif action == 'get_graph_online':
                data = {'y': randint(1, 100)}
            else:
                data['error'] = 'Sigue tirando perlies'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['panel'] = 'Admin panel'
        context['graph_sale_years'] = get_graph_sales_years_month()
        context['entity_count'] = countEntity()
        return context


def countEntity():
    return {
        'cat': Category.objects.count(),
        'prod': Product.objects.count(),
        'cli': Client.objects.count(),
        'sale': Sale.objects.count(),
    }
