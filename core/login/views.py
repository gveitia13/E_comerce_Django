from django.contrib.auth import logout
from django.contrib.auth.views import LoginView
from django.shortcuts import redirect
from django.views.generic import RedirectView

import conf.settings as setting


class LoginFormView(LoginView):
    template_name = 'login/login.html'

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(setting.LOGIN_REDIRECT_URL)
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Login'
        return context


# class LoginFormView2(FormView):
#     template_name = 'login/login.html'
#     form_class = AuthenticationForm
#     success_url = reverse_lazy(setting.LOGIN_REDIRECT_URL)
#
#     def dispatch(self, request, *args, **kwargs):
#         if request.user.is_authenticated:
#             return HttpResponseRedirect(self.success_url)
#         return super().dispatch(request, *args, **kwargs)
#
#     def form_valid(self, form):
#         login(self.request, form.get_user())
#         return HttpResponseRedirect(self.success_url)
#
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         context['title'] = 'Iniciar sesión'
#         return context

class LogoutRedirectView(RedirectView):
    pattern_name = 'login'

    def dispatch(self, request, *args, **kwargs):
        logout(request)
        return super().dispatch(request, *args, **kwargs)



