from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import Group
from django.db import transaction
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views import generic
from django.views.decorators.csrf import csrf_exempt

from core.main.mixins import ValidatePermissionRequiredMixin
from core.main.models import Sale, Product, Task
from core.main.views.dashboard.views import countEntity
from core.startpage.models import Cart
from core.user.forms import UserForm, ProfileForm
from core.user.models import User, UserProfile


class UserListView(generic.ListView):
    model = User
    template_name = 'user/list.html'

    # permission_required = 'user.view_user'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'User list'
        context['create_url'] = reverse_lazy('user:user_create')
        context['list_url'] = reverse_lazy('user:user_list')
        context['entity'] = 'User'
        context['entity_count'] = countEntity()
        return context

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'searchdata':
                data = [i.toJSON() for i in User.objects.all()]
            elif action == 'dele':
                with transaction.atomic():
                    user = User.objects.get(pk=request.POST['id'])
                    data['object'] = user.toJSON()
                    user.delete()
                    data['success'] = 'deleted'
            elif action == 'get_user':
                user = User.objects.get(pk=request.POST['id'])
                data['data'] = UserProfile.objects.get(user_id=request.POST['id']).toJSON()
                data['total_sales'] = Sale.objects.filter(user_creation_id=user.id).count() + \
                                      Cart.objects.filter(user_updated_id=user.id).count()
                data['prods_added'] = Product.objects.filter(user_creation=user.id).count()
                data['my_tasks'] = Task.objects.filter(owner_id=user.id).filter(status=False).count()

            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)


class UserCreateView(LoginRequiredMixin, ValidatePermissionRequiredMixin, generic.CreateView):
    model = User, UserProfile
    form_class = UserForm
    template_name = 'user/create.html'
    success_url = reverse_lazy('user:user_list')
    # permission_required = 'user.add_user'
    url_redirect = success_url

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'add':
                form = self.get_form()
                user = form.save()
                user_profile = UserProfile()
                user_profile.user = user
                if request.POST['skill']:
                    user_profile.skill = request.POST['skill']
                if request.POST['biography']:
                    user_profile.biography = request.POST['biography']
                if request.FILES:
                    if request.FILES['picture']:
                        user_profile.picture = request.FILES['picture']
                user_profile.save()
                # data = user_profile.toJSON()
            else:
                data['error'] = 'No ha ingresado a ninguna opcion'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Create user'
        context['entity'] = 'User'
        context['list_url'] = self.success_url
        context['action'] = 'add'
        context['form_profile'] = self.get_form(ProfileForm)
        return context


class UserUpdateView(LoginRequiredMixin, ValidatePermissionRequiredMixin, generic.UpdateView):
    model = User
    form_class = UserForm
    # fields = 'password'
    template_name = 'user/create.html'
    success_url = reverse_lazy('user:user_list')
    # permission_required = 'user.change_user'
    url_redirect = success_url

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'edit':
                print(request.POST)
                print(request.FILES)
                form = self.get_form()
                user = form.save()
                user_profile = UserProfile.objects.get(user_id=user.id)
                if request.POST['skill']:
                    user_profile.skill = request.POST['skill']
                if request.POST['biography']:
                    user_profile.biography = request.POST['biography']
                if request.FILES.get('picture') is not None:
                    user_profile.picture = request.FILES['picture']
                elif request.POST.get('picture-clear') is not None:
                    if request.POST['picture-clear'] == 'on':
                        user_profile.picture = ''
                user_profile.save()
                # data = user_profile.toJSON()
            else:
                data['error'] = 'No ha ingresado a ninguna opcion'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'User edit'
        context['entity'] = 'User'
        context['list_url'] = self.success_url
        context['action'] = 'edit'
        prof = UserProfile.objects.get(user_id=self.object.id)
        context['form_profile'] = ProfileForm(instance=prof)
        return context


class UserChangeGroup(LoginRequiredMixin, generic.View):

    def get(self, request, *args, **kwargs):
        try:
            request.session['group'] = Group.objects.get(pk=self.kwargs['pk'])
        except:
            pass
        return HttpResponseRedirect(reverse_lazy('dashboard'))


class UserChangePasswordView(LoginRequiredMixin, generic.FormView):
    model = User
    form_class = PasswordChangeForm
    template_name = 'user/change_password.html'
    success_url = reverse_lazy('login')

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_form(self, form_class=None):
        form = PasswordChangeForm(user=self.request.user)
        form.fields['old_password'].widget.attrs['placeholder'] = 'Enter your current password'
        form.fields['old_password'].widget.attrs['class'] = 'circular'
        form.fields['new_password1'].widget.attrs['placeholder'] = 'Enter your new  password'
        form.fields['new_password1'].widget.attrs['class'] = 'circular'
        form.fields['new_password2'].widget.attrs['placeholder'] = 'Repeat your new password'
        form.fields['new_password2'].widget.attrs['class'] = 'circular'
        return form

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'edit':
                form = PasswordChangeForm(user=request.user, data=request.POST)
                if form.is_valid():
                    form.save()
                    update_session_auth_hash(request, form.user)
                else:
                    data['error'] = form.errors
            else:
                data['error'] = 'No ha ingresado a ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Password edit'
        context['entity'] = 'Password'
        context['list_url'] = self.success_url
        context['action'] = 'edit'
        return context
