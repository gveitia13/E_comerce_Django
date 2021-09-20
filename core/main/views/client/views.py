import datetime
import json

from django.db import transaction
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from core.main.forms import ClientForm
from core.main.models import Client
from core.main.views.dashboard.views import countEntity


class ClientView(TemplateView):
    template_name = 'client/list.html'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = [c.toJSON() for c in Client.objects.all()]
            elif action == 'search_client':
                data = {'object': Client.objects.get(pk=request.POST['id']).toJSON(), }
            elif action == 'add':
                with transaction.atomic():
                    ClientForm(request.POST).save()
                    data['success'] = 'added'
                    data['object'] = Client.objects.get(dni=request.POST['dni']).toJSON()
            elif action == 'edit':
                with transaction.atomic():
                    cli = Client.objects.get(pk=request.POST['id'])
                    cli.name = request.POST['name']
                    cli.surnames = request.POST['surnames']
                    cli.dni = request.POST['dni']
                    cli.date_birthday = datetime.date.fromisoformat(request.POST['date_birthday'])
                    cli.address = request.POST['address']
                    cli.gender = request.POST['gender']
                    cli.email = request.POST['email']
                    cli.save()
                    data['success'] = 'updated'
                    data['object'] = cli.toJSON()
            elif action == 'dele':
                with transaction.atomic():
                    cli = Client.objects.get(pk=request.POST['id'])
                    cli.delete()
                    data['success'] = 'deleted'
                    data['object'] = cli.toJSON()
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Client list'
        context['list_url'] = reverse_lazy('main:client_list')
        context['entity'] = 'Client'
        context['form'] = ClientForm()
        context['entity_count'] = countEntity()
        return context
