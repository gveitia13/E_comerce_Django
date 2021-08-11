from django.http import JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from django.views.generic import TemplateView

from core.main.views.dashboard.views import countEntity
from core.user.forms import UserForm
from core.user.models import User


class UserView(TemplateView):
    template_name = 'user/list.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Users list'
        context['entity'] = 'Users'
        context['entity_count'] = countEntity()
        context['form'] = UserForm()

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = [i.toJSON() for i in User.objects.all()]
            elif action == 'add':

                pass
            else:
                data['error'] = 'Pastillas chama'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)
