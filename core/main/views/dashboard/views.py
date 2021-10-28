import json
from datetime import datetime
from random import randint

from crum import get_current_request
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from core.main.forms import TaskForm
from core.main.models import Category, Product, Client, Sale, DetSale, Task
from core.startpage.models import Cart, DetCart
from core.user.models import User


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


def task_made(request):
    return Task.objects.filter(owner_id=request.user.id) \
        .filter(status=True).count() if not request.user.is_staff else Task.objects.filter(
        status=True).count()


def my_tasks(request):
    return Task.objects.filter(owner_id=request.user.id) \
        .filter(status=False).count()


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
            elif action == 'search_product':
                data = Product.objects.get(pk=request.POST['id']).toJSON()
            elif action == 'search_details-prod':
                data = [i.toJSON() for i in DetCart.objects.filter(cart_id=request.POST['id'])]
            elif action == 'state':
                with transaction.atomic():
                    task = Task.objects.get(pk=request.POST['id'])
                    task.status = json.loads(request.POST['status'])
                    task.save()
                    data['task_made'] = task_made(request)
                    data['my_tasks'] = my_tasks(request)
            elif action == 'del_task':
                with transaction.atomic():
                    task = Task.objects.get(pk=request.POST['id'])
                    data['task'] = task.toJSON()
                    task.delete()
                    data['task_made'] = task_made(request)
                    data['my_tasks'] = my_tasks(request)
            elif action == 'task_add':
                with transaction.atomic():
                    print(request.POST)
                    if request.POST['id'] == '-1':
                        task = Task()
                        data['edit'] = '0'
                    else:
                        task = Task.objects.get(pk=request.POST['id'])
                        data['edit'] = '1'
                    task.owner_id = request.POST['owner']
                    task.text = request.POST['text']
                    task.save()
                    data['task'] = task.toJSON()
                    data['task_made'] = task_made(request)
                    data['my_tasks'] = my_tasks(request)
            elif action == 'get_All_Task':
                data = [t.get_Time() for t in Task.objects.all()]
            elif action == 'get_task_by_id':
                data = Task.objects.get(pk=request.POST['id']).toJSON()
            else:
                data['error'] = 'Sigue tirando perlies'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['panel'] = 'Admin panel'
        context['title'] = 'Dashboard'
        context['graph_sale_years'] = get_graph_sales_years_month()
        context['entity_count'] = countEntity()
        context['sales_at_home'] = [c for c in Cart.objects.order_by('-date_joined')
            .order_by('-id').exclude(status='Sold').exclude(cli_addr='Our local')][:4]
        context['task_form'] = TaskForm()
        context['list_url'] = reverse_lazy('dashboard')
        context['entity'] = 'Dashboard'
        # context['prods_sold'] = DetSale.objects.filter(prod__in=Product.objects.all()).count()
        return context

    def get(self, request, *args, **kwargs):
        kwargs['get_users'] = [user for user in User.objects
            .filter(date_joined__lt=request.user.last_login)][:8]
        kwargs['users_count'] = len(kwargs['get_users'])
        kwargs['last_products'] = Product.objects.filter().order_by('-date_creation')[:4]
        kwargs['total_sales'] = Sale.objects.filter(user_creation_id=request.user.id).count() + \
                                Cart.objects.filter(user_updated_id=request.user.id).count()
        kwargs['prods_added'] = Product.objects.filter(user_creation=request.user.id).count()

        kwargs['tasks'] = Task.objects.all() if request.user.is_staff else Task.objects.filter(owner_id=request.user.id)
        kwargs['my_tasks'] = Task.objects.filter(owner_id=request.user.id).filter(status=False).count()
        kwargs['task_made'] = task_made(request)
        return super().get(request, *args, **kwargs)


def countEntity():
    request = get_current_request()
    return {
        'cat': Category.objects.filter(date_creation__gt=request.user.last_login).count(),
        'prod': Product.objects.filter(date_creation__gt=request.user.last_login).count(),
        'cli': Client.objects.filter(pk__in=Sale.objects.all()).count(),  # clientes q tengan ventas hechas
        'sale': Sale.objects.filter(date_joined__gt=request.user.last_login).count(),
        'user': User.objects.filter(date_joined__gt=request.user.last_login).count(),
        'cart': Cart.objects.filter(date_joined__gt=request.user.last_login).count()
    }
